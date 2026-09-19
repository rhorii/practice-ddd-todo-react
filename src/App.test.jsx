import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

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

function renderApp() {
  return {
    user: userEvent.setup(),
    ...render(<App tasks={INITIAL_TASKS} />),
  };
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
const looseName = (...words) => new RegExp("^" + words.join("\\s*") + "$");

const filterButton = (name) =>
  screen.getByRole("button", { name: looseName("Show", name, "tasks") });

const saveButton = (name) =>
  screen.getByRole("button", { name: looseName("Save", "new name for " + name) });

const cancelButton = (name) =>
  screen.getByRole("button", { name: looseName("Cancel", "renaming " + name) });

describe("初期表示", () => {
  it("渡されたタスクをすべて表示する", () => {
    renderApp();

    expect(taskItems()).toHaveLength(3);
    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Sleep" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Repeat" })).not.toBeChecked();
  });

  it("見出しに表示中のタスク件数を出す", () => {
    renderApp();

    // 未完了の残件数ではなく、表示中のタスク件数であることに注意。
    // Eat は完了済みだが 3 件と数えられている。
    expect(heading()).toHaveTextContent("3 tasks remaining");
  });

  it("All フィルタが選択された状態で始まる", () => {
    renderApp();

    expect(filterButton("All")).toHaveAttribute("aria-pressed", "true");
  });
});

describe("タスクの追加", () => {
  it("入力した名前のタスクをリストの末尾に追加する", async () => {
    const { user } = renderApp();

    await user.type(newTaskInput(), "Walk");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(taskItems()).toHaveLength(4);
    expect(screen.getByRole("checkbox", { name: "Walk" })).not.toBeChecked();
    expect(
      within(taskItems().at(-1)).getByRole("checkbox", { name: "Walk" })
    ).toBeInTheDocument();
  });

  it("追加後に入力欄を空にする", async () => {
    const { user } = renderApp();

    await user.type(newTaskInput(), "Walk");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(newTaskInput()).toHaveValue("");
  });

  it("見出しの件数を更新する", async () => {
    const { user } = renderApp();

    await user.type(newTaskInput(), "Walk");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(heading()).toHaveTextContent("4 tasks remaining");
  });
});

describe("完了状態の切り替え", () => {
  it("未完了のタスクを完了にする", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("checkbox", { name: "Sleep" }));

    expect(screen.getByRole("checkbox", { name: "Sleep" })).toBeChecked();
  });

  it("完了済みのタスクを未完了に戻す", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("checkbox", { name: "Eat" }));

    expect(screen.getByRole("checkbox", { name: "Eat" })).not.toBeChecked();
  });
});

describe("タスク名の編集", () => {
  it("Edit を押すと編集フォームを開く", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));

    expect(
      screen.getByRole("textbox", { name: "New name for Eat" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Eat" })).not.toBeInTheDocument();
  });

  it("編集フォームの入力欄は現在の名前ではなく空で始まる", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));

    expect(screen.getByRole("textbox", { name: "New name for Eat" })).toHaveValue("");
  });

  it("Save を押すと新しい名前で置き換える", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));
    await user.type(screen.getByRole("textbox", { name: "New name for Eat" }), "Brunch");
    await user.click(saveButton("Eat"));

    expect(screen.getByRole("checkbox", { name: "Brunch" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Eat" })).not.toBeInTheDocument();
    expect(taskItems()).toHaveLength(3);
  });

  it("Cancel を押すと名前を変えずに編集を終える", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));
    await user.type(screen.getByRole("textbox", { name: "New name for Eat" }), "Brunch");
    await user.click(cancelButton("Eat"));

    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Brunch" })).not.toBeInTheDocument();
  });
});

describe("タスクの削除", () => {
  it("押したタスクだけをリストから取り除く", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Delete Sleep" }));

    expect(taskItems()).toHaveLength(2);
    expect(screen.queryByRole("checkbox", { name: "Sleep" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Repeat" })).toBeInTheDocument();
  });

  it("削除後に見出しへフォーカスを移す", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Delete Sleep" }));

    expect(heading()).toHaveFocus();
  });
});

describe("フィルタ", () => {
  it("Active は未完了のタスクだけを表示する", async () => {
    const { user } = renderApp();

    await user.click(filterButton("Active"));

    expect(taskItems()).toHaveLength(2);
    expect(screen.queryByRole("checkbox", { name: "Eat" })).not.toBeInTheDocument();
    expect(heading()).toHaveTextContent("2 tasks remaining");
  });

  it("Completed は完了済みのタスクだけを表示する", async () => {
    const { user } = renderApp();

    await user.click(filterButton("Completed"));

    expect(taskItems()).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: "Eat" })).toBeInTheDocument();
    expect(heading()).toHaveTextContent("1 task remaining");
  });

  it("All はすべてのタスクを表示する", async () => {
    const { user } = renderApp();

    await user.click(filterButton("Completed"));
    await user.click(filterButton("All"));

    expect(taskItems()).toHaveLength(3);
  });

  it("選択中のフィルタだけを押下状態にする", async () => {
    const { user } = renderApp();

    await user.click(filterButton("Active"));

    expect(filterButton("Active")).toHaveAttribute("aria-pressed", "true");
    expect(filterButton("All")).toHaveAttribute("aria-pressed", "false");
  });
});

// 現時点で存在するバグ。あるべき姿ではなく現状を記録している。
// T1-3 で TaskName 値オブジェクトを導入すると不変条件によって塞がれ、
// ここのテストは意図的に赤くなる。そのときに期待値を書き換える。
describe("既知のバグ: 空の名前を許してしまう", () => {
  it("名前が空のままでもタスクを追加できてしまう", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(taskItems()).toHaveLength(4);
    expect(heading()).toHaveTextContent("4 tasks remaining");
  });

  it("名前を空にする編集も保存できてしまう", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Edit Eat" }));
    await user.click(saveButton("Eat"));

    expect(screen.queryByRole("checkbox", { name: "Eat" })).not.toBeInTheDocument();
    expect(taskItems()).toHaveLength(3);
  });
});
