import { TaskId } from "../domain/TaskId";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import { TaskList } from "../domain/TaskList";
import { InvalidTaskNameError } from "../domain/TaskName";
import { InMemoryTaskRepository } from "../infrastructure/InMemoryTaskRepository";
import { AddTask } from "./AddTask";
import { toTaskList } from "./TaskMapper";

// TaskIdGenerator がインターフェースであるおかげで、
// テストでは nanoid ではなく決まった順番の ID を返す実装に差し替えられる。
class SequentialTaskIdGenerator implements TaskIdGenerator {
  private count = 0;

  generate(): TaskId {
    this.count += 1;
    return TaskId.of(`task-${this.count}`);
  }
}

const EAT = { id: "task-0", name: "Eat", completed: true };

function setup(initialTasks: TaskList = TaskList.empty()) {
  const repository = new InMemoryTaskRepository(initialTasks);

  return {
    repository,
    addTask: new AddTask(repository, new SequentialTaskIdGenerator()),
  };
}

describe("AddTask", () => {
  it("リストの末尾に Task を加える", async () => {
    const { addTask } = setup(toTaskList([EAT]));

    const tasks = await addTask.execute("Sleep");

    expect(tasks.map((task) => task.name)).toEqual(["Eat", "Sleep"]);
  });

  it("発行された TaskId を割り当てる", async () => {
    const { addTask } = setup();

    expect((await addTask.execute("Eat"))[0]?.id).toBe("task-1");
  });

  it("呼ぶたびに異なる TaskId を割り当てる", async () => {
    const { addTask } = setup();

    await addTask.execute("Eat");
    const tasks = await addTask.execute("Sleep");

    expect(tasks[0]?.id).not.toBe(tasks[1]?.id);
  });

  it("加えられた直後の Task は未完了である", async () => {
    const { addTask } = setup();

    expect((await addTask.execute("Eat"))[0]?.completed).toBe(false);
  });

  it("前後の空白を取り除いた名前にする", async () => {
    const { addTask } = setup();

    expect((await addTask.execute("  Eat  "))[0]?.name).toBe("Eat");
  });

  it("追加した内容をリポジトリに保存する", async () => {
    const { addTask, repository } = setup();

    await addTask.execute("Eat");

    expect((await repository.load()).size).toBe(1);
  });

  describe("空の名前", () => {
    it("追加できない", async () => {
      const { addTask } = setup();

      await expect(addTask.execute("   ")).rejects.toThrow(InvalidTaskNameError);
    });

    it("リポジトリを書き換えない", async () => {
      const { addTask, repository } = setup();

      await expect(addTask.execute("   ")).rejects.toThrow();

      expect((await repository.load()).isEmpty).toBe(true);
    });
  });
});
