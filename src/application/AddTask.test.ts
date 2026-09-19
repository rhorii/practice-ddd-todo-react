import { TaskId } from "../domain/TaskId";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import { InvalidTaskNameError } from "../domain/TaskName";
import { AddTask } from "./AddTask";
import type { TaskDto } from "./TaskDto";

// TaskIdGenerator がインターフェースであるおかげで、
// テストでは nanoid ではなく決まった順番の ID を返す実装に差し替えられる。
class SequentialTaskIdGenerator implements TaskIdGenerator {
  private count = 0;

  generate(): TaskId {
    this.count += 1;
    return TaskId.of(`task-${this.count}`);
  }
}

const EAT: TaskDto = { id: "task-0", name: "Eat", completed: true };

const addTask = () => new AddTask(new SequentialTaskIdGenerator());

describe("AddTask", () => {
  it("リストの末尾に Task を加える", () => {
    const tasks = addTask().execute([EAT], "Sleep");

    expect(tasks.map((task) => task.name)).toEqual(["Eat", "Sleep"]);
  });

  it("発行された TaskId を割り当てる", () => {
    expect(addTask().execute([], "Eat")[0]?.id).toBe("task-1");
  });

  it("呼ぶたびに異なる TaskId を割り当てる", () => {
    const add = addTask();

    const tasks = add.execute(add.execute([], "Eat"), "Sleep");

    expect(tasks[0]?.id).not.toBe(tasks[1]?.id);
  });

  it("加えられた直後の Task は未完了である", () => {
    expect(addTask().execute([], "Eat")[0]?.completed).toBe(false);
  });

  it("前後の空白を取り除いた名前にする", () => {
    expect(addTask().execute([], "  Eat  ")[0]?.name).toBe("Eat");
  });

  it("空の名前では追加できない", () => {
    expect(() => addTask().execute([], "   ")).toThrow(InvalidTaskNameError);
  });

  it("元のリストを書き換えない", () => {
    const tasks = [EAT];

    addTask().execute(tasks, "Sleep");

    expect(tasks).toHaveLength(1);
  });
});
