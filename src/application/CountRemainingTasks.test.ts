import { CountRemainingTasks } from "./CountRemainingTasks";
import type { TaskDto } from "./TaskDto";

const TASKS: TaskDto[] = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
  { id: "task-3", name: "Repeat", completed: false },
];

describe("CountRemainingTasks", () => {
  it("未完了の件数を返す", () => {
    expect(new CountRemainingTasks().execute(TASKS)).toBe(2);
  });

  it("すべて完了していれば 0 を返す", () => {
    const completed = TASKS.map((task) => ({ ...task, completed: true }));

    expect(new CountRemainingTasks().execute(completed)).toBe(0);
  });

  it("空のリストなら 0 を返す", () => {
    expect(new CountRemainingTasks().execute([])).toBe(0);
  });
});
