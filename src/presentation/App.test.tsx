import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTaskUseCases } from "../application/TaskUseCases";
import { toTaskList } from "../application/TaskMapper";
import { TaskId } from "../domain/TaskId";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import { InMemoryTaskRepository } from "../infrastructure/InMemoryTaskRepository";
import App from "./App";
import { TaskUseCasesContext } from "./TaskUseCasesContext";

// 特性テスト (characterization test)
//
// 「こうあるべき」ではなく「今どう動いているか」をそのまま写し取るテスト。
// 仕様書のない既存コードを安全に作り変えるための安全網であり、
// 既知のバグも含めて現状の振る舞いを記録する。
//
// このファイルは App の内部実装に一切触れず、ユーザーから見える操作と表示だけを
// 検証する。App の中身が値オブジェクト・リポジトリ・ユースケースへ作り変わっても、
// ここに書かれた振る舞いは最後まで不変であり続ける。

const INITIAL_TASKS = [
  { id: "todo-0", name: "Eat", completed: true },
  { id: "todo-1", name: "Sleep", completed: false },
  { id: "todo-2", name: "Repeat", completed: false },
];

// 差し替えるのは ID の発行方法だけにする。
// ユースケースの組み立ては本番と同じ createTaskUseCases を使わないと、
// 特性テストが本物のアプリではなく偽物を検証することになってしまう。
class SequentialTaskIdGenerator implements TaskIdGenerator {
  private count = 0;

  generate(): TaskId {
    this.count += 1;
    return TaskId.of(`task-new-${this.count}`);
  }
}

async function renderApp() {
  const useCases = createTaskUseCases(
    new InMemoryTaskRepository(toTaskList(INITIAL_TASKS)),
    new SequentialTaskIdGenerator()
  );

  const rendered = render(
    <TaskUseCasesContext.Provider value={useCases}>
      <App />
    </TaskUseCasesContext.Provider>
  );

  // 一覧の読み出しは非同期なので、描画が落ち着くまで待つ
  await screen.findAllByRole("listitem");

  return { user: userEvent.setup(), ...rendered };
}

const taskItems = () => screen.getAllByRole("listitem");

const heading = () =>
  screen.getByRole("heading", { level: 2, name: /remaining/ });

const newTaskInput = () =>
  screen.getByRole("textbox", { name: "What needs to be done?" });

// visually-hidden な span だけで組み立てられたボタンのアクセシブル名は、
// 要素ごとに空白が落ちて "ShowAlltasks" のように語が繋がる。
// 現状をそのまま写し取りつつ、将来この繋がりが解消されても壊れないように
// 空白の有無を緩く扱う。
const looseName = (...words: string[]) =>
  new RegExp("^" + words.join("\\s*") + "$");

const filterButton = (name: string) =>
  screen.getByRole("button", { name: looseName("Show", name, "tasks") });

const saveButton = (name: string) =>
  screen.getByRole("button", { name: looseName("Save", "new name for " + name) });

const cancelButton = (name: string) =>
  screen.getByRole("button", { name: looseName("Cancel", "renaming " + name) });

describe("初期表示", () => {
  it("渡されたタスクをすべて表示する", async () => {
    await renderApp();

    expect(taskItems()).toHaveLength(3);
    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Sleep" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Repeat" })).not.toBeChecked();
  });

  it("見出しに未完了のタスク件数を出す", async () => {
    await renderApp();

    // remaining は未完了の件数。Eat は完了済みなので数えない。
    expect(heading()).toHaveTextContent("2 tasks remaining");
  });

  it("All フィルタが選択された状態で始まる", async () => {
    await renderApp();

    expect(filterButton("All")).toHaveAttribute("aria-pressed", "true");
  });
});

describe("タスクの追加", () => {
  it("入力した名前のタスクをリストの末尾に追加する", async () => {
    const { user } = await renderApp();

    await user.type(newTaskInput(), "Walk");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(taskItems()).toHaveLength(4);
    expect(screen.getByRole("checkbox", { name: "Walk" })).not.toBeChecked();
    // noUncheckedIndexedAccess により at(-1) は undefined を含むため、
    // 末尾要素の存在を明示してから絞り込む
    const lastItem = taskItems().at(-1);
    expect(lastItem).toBeDefined();
    expect(
      within(lastItem as HTMLElement).getByRole("checkbox", { name: "Walk" })
    ).toBeInTheDocument();
  });

  it("追加後に入力欄を空にする", async () => {
    const { user } = await renderApp();

    await user.type(newTaskInput(), "Walk");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(newTaskInput()).toHaveValue("");
  });

  it("見出しの未完了件数を増やす", async () => {
    const { user } = await renderApp();

    await user.type(newTaskInput(), "Walk");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(heading()).toHaveTextContent("3 tasks remaining");
  });
});

describe("完了状態の切り替え", () => {
  it("未完了のタスクを完了にする", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("checkbox", { name: "Sleep" }));

    expect(screen.getByRole("checkbox", { name: "Sleep" })).toBeChecked();
  });

  it("完了済みのタスクを未完了に戻す", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("checkbox", { name: "Eat" }));

    expect(screen.getByRole("checkbox", { name: "Eat" })).not.toBeChecked();
  });

  it("完了にすると remaining の件数が減る", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("checkbox", { name: "Sleep" }));

    expect(heading()).toHaveTextContent("1 task remaining");
  });

  it("未完了に戻すと remaining の件数が増える", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("checkbox", { name: "Eat" }));

    expect(heading()).toHaveTextContent("3 tasks remaining");
  });
});

describe("タスク名の変更 (rename)", () => {
  it("Edit を押すと名前の変更フォームを開く", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));

    expect(
      screen.getByRole("textbox", { name: "New name for Eat" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Eat" })).not.toBeInTheDocument();
  });

  it("変更フォームの入力欄は現在の名前ではなく空で始まる", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));

    expect(screen.getByRole("textbox", { name: "New name for Eat" })).toHaveValue("");
  });

  it("Save を押すと新しい名前で置き換える", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));
    await user.type(screen.getByRole("textbox", { name: "New name for Eat" }), "Brunch");
    await user.click(saveButton("Eat"));

    expect(screen.getByRole("checkbox", { name: "Brunch" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Eat" })).not.toBeInTheDocument();
    expect(taskItems()).toHaveLength(3);
  });

  it("Cancel を押すと名前を変えずに変更を終える", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));
    await user.type(screen.getByRole("textbox", { name: "New name for Eat" }), "Brunch");
    await user.click(cancelButton("Eat"));

    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Brunch" })).not.toBeInTheDocument();
  });
});

describe("タスクの削除", () => {
  it("押したタスクだけをリストから取り除く", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Delete Sleep" }));

    expect(taskItems()).toHaveLength(2);
    expect(screen.queryByRole("checkbox", { name: "Sleep" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Repeat" })).toBeInTheDocument();
  });

  it("削除後に見出しへフォーカスを移す", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Delete Sleep" }));

    expect(heading()).toHaveFocus();
  });
});

describe("フィルタ", () => {
  it("Active は未完了のタスクだけを表示する", async () => {
    const { user } = await renderApp();

    await user.click(filterButton("Active"));

    expect(taskItems()).toHaveLength(2);
    expect(screen.queryByRole("checkbox", { name: "Eat" })).not.toBeInTheDocument();
  });

  it("Completed は完了済みのタスクだけを表示する", async () => {
    const { user } = await renderApp();

    await user.click(filterButton("Completed"));

    expect(taskItems()).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeInTheDocument();
  });

  it("All はすべてのタスクを表示する", async () => {
    const { user } = await renderApp();

    await user.click(filterButton("Completed"));
    await user.click(filterButton("All"));

    expect(taskItems()).toHaveLength(3);
  });

  it("表示対象を絞っても remaining の件数は変わらない", async () => {
    const { user } = await renderApp();

    await user.click(filterButton("Completed"));
    expect(heading()).toHaveTextContent("2 tasks remaining");

    await user.click(filterButton("Active"));
    expect(heading()).toHaveTextContent("2 tasks remaining");
  });

  it("選択中のフィルタだけを押下状態にする", async () => {
    const { user } = await renderApp();

    await user.click(filterButton("Active"));

    expect(filterButton("Active")).toHaveAttribute("aria-pressed", "true");
    expect(filterButton("All")).toHaveAttribute("aria-pressed", "false");
  });
});

// T0-2 では「空の名前を許してしまう」バグとして現状を記録していた。
// T1-3 で TaskName 値オブジェクトを導入し、不変条件によって塞がれた振る舞いを
// ここで固定し直す。UI 側に検証を足したのではなく、不正な TaskName が
// そもそも作れないことによって塞がっている。
describe("空の名前は受け付けない", () => {
  it("名前が空のままではタスクを追加できない", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(taskItems()).toHaveLength(3);
    expect(heading()).toHaveTextContent("2 tasks remaining");
  });

  it("空白だけの名前でもタスクを追加できない", async () => {
    const { user } = await renderApp();

    await user.type(newTaskInput(), "   ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(taskItems()).toHaveLength(3);
  });

  it("名前を空にする変更は保存されない", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));
    await user.click(saveButton("Eat"));

    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeInTheDocument();
    expect(taskItems()).toHaveLength(3);
  });
});

describe("名前の正規化", () => {
  it("前後の空白を取り除いて追加する", async () => {
    const { user } = await renderApp();

    await user.type(newTaskInput(), "   Walk   ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByRole("checkbox", { name: "Walk" })).toBeInTheDocument();
  });

  it("前後の空白を取り除いて名前を変更する", async () => {
    const { user } = await renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));
    await user.type(
      screen.getByRole("textbox", { name: "New name for Eat" }),
      "   Brunch   "
    );
    await user.click(saveButton("Eat"));

    expect(screen.getByRole("checkbox", { name: "Brunch" })).toBeInTheDocument();
  });
});
