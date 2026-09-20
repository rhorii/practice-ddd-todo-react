import { Task } from "../domain/Task";
import { TaskId } from "../domain/TaskId";
import { TaskList } from "../domain/TaskList";
import { TaskName } from "../domain/TaskName";
import { InMemoryTaskRepository } from "./InMemoryTaskRepository";

const task = (id: string, name: string, completed = false) =>
  Task.reconstruct(TaskId.of(id), TaskName.of(name), completed);

const EAT = task("task-1", "Eat", true);
const SLEEP = task("task-2", "Sleep");

describe("InMemoryTaskRepository", () => {
  it("初期値を与えなければ空のリストを返す", async () => {
    const repository = new InMemoryTaskRepository();

    expect((await repository.load()).isEmpty).toBe(true);
  });

  it("初期値として渡された TaskList を返す", async () => {
    const repository = new InMemoryTaskRepository(TaskList.of([EAT, SLEEP]));

    expect((await repository.load()).size).toBe(2);
  });

  it("保存した TaskList を読み出せる", async () => {
    const repository = new InMemoryTaskRepository();

    await repository.save(TaskList.of([EAT]));

    expect((await repository.load()).find(TaskId.of("task-1"))?.name.value).toBe(
      "Eat"
    );
  });

  it("保存するたびに内容が置き換わる", async () => {
    const repository = new InMemoryTaskRepository(TaskList.of([EAT]));

    await repository.save(TaskList.of([SLEEP]));

    expect((await repository.load()).contains(TaskId.of("task-1"))).toBe(false);
  });

  it("完了状態の変更を保存できる", async () => {
    const repository = new InMemoryTaskRepository(TaskList.of([SLEEP]));

    const tasks = await repository.load();
    await repository.save(tasks.replace(SLEEP.complete()));

    expect((await repository.load()).countActive()).toBe(0);
  });
});
