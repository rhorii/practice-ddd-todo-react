import { Task } from "../domain/Task";
import { TaskId } from "../domain/TaskId";
import { TaskName } from "../domain/TaskName";
import { toDto, toTask } from "./TaskMapper";

describe("TaskMapper", () => {
  describe("toDto", () => {
    it("ドメインモデルを素のデータに変換する", () => {
      const task = Task.reconstruct(
        TaskId.of("task-1"),
        TaskName.of("Eat"),
        true
      );

      expect(toDto(task)).toEqual({
        id: "task-1",
        name: "Eat",
        completed: true,
      });
    });
  });

  describe("toTask", () => {
    it("素のデータからドメインモデルを復元する", () => {
      const task = toTask({ id: "task-1", name: "Eat", completed: true });

      expect(task.id.value).toBe("task-1");
      expect(task.name.value).toBe("Eat");
      expect(task.isCompleted).toBe(true);
    });

    it("復元では完了状態にルールを適用しない", () => {
      // create であれば必ず未完了になるが、復元は記録をそのまま再現する
      expect(toTask({ id: "task-1", name: "Eat", completed: true }).isCompleted).toBe(
        true
      );
    });
  });

  it("変換を往復しても内容が変わらない", () => {
    const dto = { id: "task-1", name: "Eat", completed: true };

    expect(toDto(toTask(dto))).toEqual(dto);
  });
});
