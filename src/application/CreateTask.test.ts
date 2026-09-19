import { TaskId } from "../domain/TaskId";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import { CreateTask } from "./CreateTask";

// TaskIdGenerator がインターフェースであるおかげで、
// テストでは nanoid ではなく決まった順番の ID を返す実装に差し替えられる。
class SequentialTaskIdGenerator implements TaskIdGenerator {
  private count = 0;

  generate(): TaskId {
    this.count += 1;
    return TaskId.of(`task-${this.count}`);
  }
}

describe("CreateTask", () => {
  it("発行された TaskId を持つ Task を返す", () => {
    const createTask = new CreateTask(new SequentialTaskIdGenerator());

    expect(createTask.execute("Eat").id).toBe("task-1");
  });

  it("呼ぶたびに異なる TaskId を割り当てる", () => {
    const createTask = new CreateTask(new SequentialTaskIdGenerator());

    expect(createTask.execute("Eat").id).not.toBe(createTask.execute("Sleep").id);
  });

  it("渡された名前をそのまま持つ", () => {
    const createTask = new CreateTask(new SequentialTaskIdGenerator());

    expect(createTask.execute("Eat").name).toBe("Eat");
  });

  it("作られた直後の Task は未完了である", () => {
    const createTask = new CreateTask(new SequentialTaskIdGenerator());

    expect(createTask.execute("Eat").completed).toBe(false);
  });
});
