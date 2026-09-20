import { TaskId } from "../domain/TaskId";
import { InvalidTaskNameError } from "../domain/TaskName";
import { InMemoryTaskRepository } from "../infrastructure/InMemoryTaskRepository";
import { RenameTask } from "./RenameTask";
import { toTaskList } from "./TaskMapper";

const TASKS = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
];

function setup() {
  const repository = new InMemoryTaskRepository(toTaskList(TASKS));

  return { repository, renameTask: new RenameTask(repository) };
}

describe("RenameTask", () => {
  it("指定した Task の名前を変える", async () => {
    const { renameTask } = setup();

    expect((await renameTask.execute("task-1", "Brunch"))[0]?.name).toBe(
      "Brunch"
    );
  });

  it("他の Task には影響しない", async () => {
    const { renameTask } = setup();

    expect((await renameTask.execute("task-1", "Brunch"))[1]?.name).toBe(
      "Sleep"
    );
  });

  it("名前以外は変えない", async () => {
    const { renameTask } = setup();

    const renamed = (await renameTask.execute("task-1", "Brunch"))[0];

    expect(renamed?.id).toBe("task-1");
    expect(renamed?.completed).toBe(true);
  });

  it("並び順を保つ", async () => {
    const { renameTask } = setup();

    const tasks = await renameTask.execute("task-1", "Brunch");

    expect(tasks.map((task) => task.id)).toEqual(["task-1", "task-2"]);
  });

  it("前後の空白を取り除いた名前にする", async () => {
    const { renameTask } = setup();

    expect((await renameTask.execute("task-1", "  Brunch  "))[0]?.name).toBe(
      "Brunch"
    );
  });

  it("変更した内容をリポジトリに保存する", async () => {
    const { renameTask, repository } = setup();

    await renameTask.execute("task-1", "Brunch");

    const saved = await repository.load();

    expect(saved.find(TaskId.of("task-1"))?.name.value).toBe("Brunch");
  });

  it("存在しない TaskId を指定しても何も起きない", async () => {
    const { renameTask } = setup();

    expect(await renameTask.execute("task-999", "Brunch")).toEqual(TASKS);
  });

  describe("空の名前", () => {
    it("変更できない", async () => {
      const { renameTask } = setup();

      await expect(renameTask.execute("task-1", "   ")).rejects.toThrow(
        InvalidTaskNameError
      );
    });

    it("リポジトリを書き換えない", async () => {
      const { renameTask, repository } = setup();

      await expect(renameTask.execute("task-1", "   ")).rejects.toThrow();

      const saved = await repository.load();

      expect(saved.find(TaskId.of("task-1"))?.name.value).toBe("Eat");
    });
  });
});
