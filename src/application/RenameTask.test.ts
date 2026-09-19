import { InvalidTaskNameError } from "../domain/TaskName";
import { RenameTask } from "./RenameTask";
import type { TaskDto } from "./TaskDto";

const TASKS: TaskDto[] = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
];

const rename = (tasks: readonly TaskDto[], id: string, newName: string) =>
  new RenameTask().execute(tasks, id, newName);

describe("RenameTask", () => {
  it("指定した Task の名前を変える", () => {
    expect(rename(TASKS, "task-1", "Brunch")[0]?.name).toBe("Brunch");
  });

  it("他の Task には影響しない", () => {
    expect(rename(TASKS, "task-1", "Brunch")[1]?.name).toBe("Sleep");
  });

  it("名前以外は変えない", () => {
    const renamed = rename(TASKS, "task-1", "Brunch")[0];

    expect(renamed?.id).toBe("task-1");
    expect(renamed?.completed).toBe(true);
  });

  it("並び順を保つ", () => {
    expect(rename(TASKS, "task-1", "Brunch").map((task) => task.id)).toEqual([
      "task-1",
      "task-2",
    ]);
  });

  it("前後の空白を取り除いた名前にする", () => {
    expect(rename(TASKS, "task-1", "  Brunch  ")[0]?.name).toBe("Brunch");
  });

  it("空の名前には変えられない", () => {
    expect(() => rename(TASKS, "task-1", "   ")).toThrow(InvalidTaskNameError);
  });

  it("存在しない TaskId を指定しても何も起きない", () => {
    expect(rename(TASKS, "task-999", "Brunch")).toEqual(TASKS);
  });

  it("元のリストを書き換えない", () => {
    rename(TASKS, "task-1", "Brunch");

    expect(TASKS[0]?.name).toBe("Eat");
  });
});
