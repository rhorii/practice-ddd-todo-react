import { Task } from "./Task";
import { TaskFilter } from "./TaskFilter";
import { TaskId } from "./TaskId";
import { TaskList } from "./TaskList";
import { TaskName } from "./TaskName";

const task = (id: string, name: string, completed = false) =>
  Task.reconstruct(TaskId.of(id), TaskName.of(name), completed);

const EAT = task("task-1", "Eat", true);
const SLEEP = task("task-2", "Sleep");
const REPEAT = task("task-3", "Repeat");

const threeTasks = () => TaskList.of([EAT, SLEEP, REPEAT]);
const names = (tasks: TaskList) => tasks.toArray().map((t) => t.name.value);

describe("TaskFilter", () => {
  describe("All", () => {
    it("完了・未完了を問わず一致する", () => {
      expect(TaskFilter.ALL.matches(EAT)).toBe(true);
      expect(TaskFilter.ALL.matches(SLEEP)).toBe(true);
    });

    it("すべての Task を残す", () => {
      expect(names(TaskFilter.ALL.apply(threeTasks()))).toEqual([
        "Eat",
        "Sleep",
        "Repeat",
      ]);
    });
  });

  describe("Active", () => {
    it("未完了の Task にだけ一致する", () => {
      expect(TaskFilter.ACTIVE.matches(SLEEP)).toBe(true);
      expect(TaskFilter.ACTIVE.matches(EAT)).toBe(false);
    });

    it("未完了の Task だけを残す", () => {
      expect(names(TaskFilter.ACTIVE.apply(threeTasks()))).toEqual([
        "Sleep",
        "Repeat",
      ]);
    });
  });

  describe("Completed", () => {
    it("完了した Task にだけ一致する", () => {
      expect(TaskFilter.COMPLETED.matches(EAT)).toBe(true);
      expect(TaskFilter.COMPLETED.matches(SLEEP)).toBe(false);
    });

    it("完了した Task だけを残す", () => {
      expect(names(TaskFilter.COMPLETED.apply(threeTasks()))).toEqual(["Eat"]);
    });
  });

  describe("適用", () => {
    it("元のリストを変更しない", () => {
      const tasks = threeTasks();

      TaskFilter.COMPLETED.apply(tasks);

      expect(tasks.size).toBe(3);
    });

    it("並び順を保つ", () => {
      const reversed = TaskList.of([REPEAT, SLEEP, EAT]);

      expect(names(TaskFilter.ACTIVE.apply(reversed))).toEqual([
        "Repeat",
        "Sleep",
      ]);
    });
  });

  describe("列挙", () => {
    it("選べるフィルタは3つである", () => {
      expect(TaskFilter.values()).toHaveLength(3);
    });

    it("名前を並び順どおりに取り出せる", () => {
      expect(TaskFilter.names()).toEqual(["All", "Active", "Completed"]);
    });

    it("名前から取得できる", () => {
      expect(TaskFilter.of("Active").equals(TaskFilter.ACTIVE)).toBe(true);
    });

    it("知らない名前では取得できない", () => {
      expect(() => TaskFilter.of("Archived")).toThrow(
        "不明なフィルタです: Archived"
      );
    });
  });

  describe("等価性", () => {
    it("同じフィルタは等しい", () => {
      expect(TaskFilter.of("All").equals(TaskFilter.ALL)).toBe(true);
    });

    it("違うフィルタは等しくない", () => {
      expect(TaskFilter.ALL.equals(TaskFilter.ACTIVE)).toBe(false);
    });
  });
});
