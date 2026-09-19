import { InvalidTaskNameError } from "../domain/TaskName";
import { RenameTask } from "./RenameTask";
import type { TaskDto } from "./TaskDto";

const EAT: TaskDto = { id: "task-1", name: "Eat", completed: false };

describe("RenameTask", () => {
  it("新しい名前を持つ Task を返す", () => {
    expect(new RenameTask().execute(EAT, "Brunch").name).toBe("Brunch");
  });

  it("名前以外は変えない", () => {
    const renamed = new RenameTask().execute(
      { ...EAT, completed: true },
      "Brunch"
    );

    expect(renamed.id).toBe("task-1");
    expect(renamed.completed).toBe(true);
  });

  it("元の Task を書き換えない", () => {
    new RenameTask().execute(EAT, "Brunch");

    expect(EAT.name).toBe("Eat");
  });

  it("前後の空白を取り除いた名前にする", () => {
    expect(new RenameTask().execute(EAT, "  Brunch  ").name).toBe("Brunch");
  });

  it("空の名前には変えられない", () => {
    expect(() => new RenameTask().execute(EAT, "   ")).toThrow(
      InvalidTaskNameError
    );
  });
});
