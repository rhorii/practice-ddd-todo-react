import type { TaskDto } from "./TaskDto";
import { ToggleTaskCompletion } from "./ToggleTaskCompletion";

const EAT: TaskDto = { id: "task-1", name: "Eat", completed: false };

describe("ToggleTaskCompletion", () => {
  it("未完了の Task を完了にする", () => {
    expect(new ToggleTaskCompletion().execute(EAT).completed).toBe(true);
  });

  it("完了した Task を未完了に戻す", () => {
    const completed = { ...EAT, completed: true };

    expect(new ToggleTaskCompletion().execute(completed).completed).toBe(false);
  });

  it("完了状態以外は変えない", () => {
    const toggled = new ToggleTaskCompletion().execute(EAT);

    expect(toggled.id).toBe("task-1");
    expect(toggled.name).toBe("Eat");
  });

  it("元の Task を書き換えない", () => {
    new ToggleTaskCompletion().execute(EAT);

    expect(EAT.completed).toBe(false);
  });

  it("2回切り替えると元の状態に戻る", () => {
    const toggle = new ToggleTaskCompletion();

    expect(toggle.execute(toggle.execute(EAT)).completed).toBe(false);
  });
});
