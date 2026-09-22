import { InMemoryTaskRepository } from "../infrastructure/InMemoryTaskRepository";
import { DeleteTask } from "./DeleteTask";
import { toTaskList } from "./TaskMapper";

const TASKS = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
];

function setup() {
  const repository = new InMemoryTaskRepository(toTaskList(TASKS));

  return { repository, deleteTask: new DeleteTask(repository) };
}

describe("DeleteTask", () => {
  it("指定した Task を取り除く", async () => {
    const { deleteTask } = setup();

    const tasks = await deleteTask.execute("task-1");

    expect(tasks.map((task) => task.id)).toEqual(["task-2"]);
  });

  it("存在しない TaskId を指定しても何も起きない", async () => {
    const { deleteTask } = setup();

    expect(await deleteTask.execute("task-999")).toHaveLength(2);
  });

  it("取り除いた結果をリポジトリに保存する", async () => {
    const { deleteTask, repository } = setup();

    await deleteTask.execute("task-1");

    expect((await repository.load()).size).toBe(1);
  });
});
