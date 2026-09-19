import type { TaskDto } from "./TaskDto";
import { ToggleTaskCompletion } from "./ToggleTaskCompletion";

const TASKS: TaskDto[] = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
];

const toggle = (tasks: readonly TaskDto[], id: string) =>
  new ToggleTaskCompletion().execute(tasks, id);

describe("ToggleTaskCompletion", () => {
  it("未完了の Task を完了にする", () => {
    expect(toggle(TASKS, "task-2")[1]?.completed).toBe(true);
  });

  it("完了した Task を未完了に戻す", () => {
    expect(toggle(TASKS, "task-1")[0]?.completed).toBe(false);
  });

  it("完了状態以外は変えない", () => {
    const toggled = toggle(TASKS, "task-1")[0];

    expect(toggled?.id).toBe("task-1");
    expect(toggled?.name).toBe("Eat");
  });

  it("他の Task には影響しない", () => {
    expect(toggle(TASKS, "task-1")[1]?.completed).toBe(false);
  });

  it("2回切り替えると元の状態に戻る", () => {
    expect(toggle(toggle(TASKS, "task-1"), "task-1")).toEqual(TASKS);
  });

  it("存在しない TaskId を指定しても何も起きない", () => {
    expect(toggle(TASKS, "task-999")).toEqual(TASKS);
  });

  it("元のリストを書き換えない", () => {
    toggle(TASKS, "task-1");

    expect(TASKS[0]?.completed).toBe(true);
  });
});
