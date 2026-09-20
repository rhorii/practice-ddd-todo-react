import { TaskList } from "../domain/TaskList";
import { InMemoryTaskRepository } from "../infrastructure/InMemoryTaskRepository";
import { LoadTasks } from "./LoadTasks";
import { toTaskList } from "./TaskMapper";

const TASKS = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
];

describe("LoadTasks", () => {
  it("保存されている一覧を返す", async () => {
    const repository = new InMemoryTaskRepository(toTaskList(TASKS));

    expect(await new LoadTasks(repository).execute()).toEqual(TASKS);
  });

  it("何も保存されていなければ空の一覧を返す", async () => {
    const repository = new InMemoryTaskRepository(TaskList.empty());

    expect(await new LoadTasks(repository).execute()).toEqual([]);
  });
});
