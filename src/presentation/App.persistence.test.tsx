import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTaskUseCases } from "../application/TaskUseCases";
import type { TaskRepository } from "../domain/TaskRepository";
import { LocalStorageTaskRepository } from "../infrastructure/LocalStorageTaskRepository";
import { LocalStorageCompletionHistory } from "../infrastructure/LocalStorageCompletionHistory";
import { NanoidTaskIdGenerator } from "../infrastructure/NanoidTaskIdGenerator";
import App from "./App";
import { TaskUseCasesContext } from "./TaskUseCasesContext";

// localStorage に保存する構成で、アプリを開き直しても内容が残ることを確かめる。
// 個々の部品は単体テストで検証済みなので、ここでは組み立てた全体が
// 永続化として機能するかだけを見る。

beforeEach(() => {
  localStorage.clear();
});

async function openApp(repository: TaskRepository) {
  const useCases = createTaskUseCases(
    repository,
    new NanoidTaskIdGenerator(),
    new LocalStorageCompletionHistory()
  );

  const rendered = render(
    <TaskUseCasesContext.Provider value={useCases}>
      <App />
    </TaskUseCasesContext.Provider>
  );

  return { user: userEvent.setup(), ...rendered };
}

/** アプリを閉じて開き直す。リポジトリは作り直すが、保存先は同じ。 */
async function reopenApp(unmount: () => void) {
  unmount();

  return openApp(new LocalStorageTaskRepository());
}

describe("localStorage 構成での永続化", () => {
  it("追加したタスクが開き直しても残る", async () => {
    const { user, unmount } = await openApp(new LocalStorageTaskRepository());

    await user.type(
      screen.getByRole("textbox", { name: "What needs to be done?" }),
      "Walk"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByRole("checkbox", { name: "Walk" });

    await reopenApp(unmount);

    expect(await screen.findByRole("checkbox", { name: "Walk" })).toBeInTheDocument();
  });

  it("完了状態も開き直しても残る", async () => {
    const { user, unmount } = await openApp(new LocalStorageTaskRepository());

    await user.type(
      screen.getByRole("textbox", { name: "What needs to be done?" }),
      "Walk"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(await screen.findByRole("checkbox", { name: "Walk" }));

    await reopenApp(unmount);

    expect(await screen.findByRole("checkbox", { name: "Walk" })).toBeChecked();
  });

  it("削除したタスクは開き直しても戻ってこない", async () => {
    const { user, unmount } = await openApp(new LocalStorageTaskRepository());

    await user.type(
      screen.getByRole("textbox", { name: "What needs to be done?" }),
      "Walk"
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(await screen.findByRole("button", { name: "Delete Walk" }));

    await reopenApp(unmount);

    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Walk" })
    ).not.toBeInTheDocument();
  });
});
