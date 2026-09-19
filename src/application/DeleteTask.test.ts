import { DeleteTask } from "./DeleteTask";
import type { TaskDto } from "./TaskDto";

const TASKS: TaskDto[] = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
];

describe("DeleteTask", () => {
  it("指定した Task を取り除く", () => {
    const tasks = new DeleteTask().execute(TASKS, "task-1");

    expect(tasks.map((task) => task.id)).toEqual(["task-2"]);
  });

  it("存在しない TaskId を指定しても何も起きない", () => {
    expect(new DeleteTask().execute(TASKS, "task-999")).toHaveLength(2);
  });

  it("元のリストを書き換えない", () => {
    new DeleteTask().execute(TASKS, "task-1");

    expect(TASKS).toHaveLength(2);
  });
});
