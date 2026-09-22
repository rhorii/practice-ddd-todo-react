import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTask } from "../application/AddTask";
import { CountRemainingTasks } from "../application/CountRemainingTasks";
import { DeleteTask } from "../application/DeleteTask";
import { taskFilterNames } from "../application/taskFilterNames";
import { FilterTasks } from "../application/FilterTasks";
import { LoadTasks } from "../application/LoadTasks";
import { RenameTask } from "../application/RenameTask";
import { ToggleTaskCompletion } from "../application/ToggleTaskCompletion";
import type { TaskRepository } from "../domain/TaskRepository";
import { NanoidTaskIdGenerator } from "../infrastructure/NanoidTaskIdGenerator";
import { LocalStorageTaskRepository } from "../infrastructure/LocalStorageTaskRepository";
import App from "./App";

// localStorage に保存する構成で、アプリを開き直しても内容が残ることを確かめる。
// 個々の部品は単体テストで検証済みなので、ここでは組み立てた全体が
// 永続化として機能するかだけを見る。

beforeEach(() => {
  localStorage.clear();
});

async function openApp(repository: TaskRepository) {
  const loadTasks = new LoadTasks(repository);
  const addTask = new AddTask(repository, new NanoidTaskIdGenerator());
  const deleteTask = new DeleteTask(repository);
  const renameTask = new RenameTask(repository);
  const toggleTaskCompletion = new ToggleTaskCompletion(repository);
  const countRemainingTasks = new CountRemainingTasks();
  const filterTasks = new FilterTasks();

  const rendered = render(
    <App
      loadTasks={() => loadTasks.execute()}
      addTask={(name) => addTask.execute(name)}
      deleteTask={(id) => deleteTask.execute(id)}
      renameTask={(id, newName) => renameTask.execute(id, newName)}
      toggleTaskCompletion={(id) => toggleTaskCompletion.execute(id)}
      countRemainingTasks={(tasks) => countRemainingTasks.execute(tasks)}
      filterTasks={(tasks, filterName) => filterTasks.execute(tasks, filterName)}
      filterNames={taskFilterNames()}
    />
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
