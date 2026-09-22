import { Task } from "./Task";
import { TaskId } from "./TaskId";
import { DuplicateTaskError, TaskList } from "./TaskList";
import { TaskName } from "./TaskName";

const task = (id: string, name: string, completed = false) =>
  Task.reconstruct(TaskId.of(id), TaskName.of(name), completed);

const EAT = task("task-1", "Eat", true);
const SLEEP = task("task-2", "Sleep");
const REPEAT = task("task-3", "Repeat");

const id = (value: string) => TaskId.of(value);
const threeTasks = () => TaskList.of([EAT, SLEEP, REPEAT]);
const names = (tasks: TaskList) => tasks.toArray().map((t) => t.name.value);
const ids = (tasks: TaskList) => tasks.toArray().map((t) => t.id.value);
const completedOf = (tasks: TaskList, taskId: string) =>
  tasks.isTaskCompleted(id(taskId));

describe("TaskList", () => {
  describe("生成", () => {
    it("空のリストを作れる", () => {
      expect(TaskList.empty().isEmpty).toBe(true);
    });

    it("渡された Task を保持する", () => {
      expect(threeTasks().size).toBe(3);
    });

    it("元の配列を変更しても影響を受けない", () => {
      const source = [EAT];
      const list = TaskList.of(source);

      source.push(SLEEP);

      expect(list.size).toBe(1);
    });
  });

  // 集約ルートとして守るべき不変条件。
  // Task 単体では判断できず、集合でなければ守れない。
  describe("同じ TaskId を2つ持たない", () => {
    it("重複する Task からは作れない", () => {
      expect(() => TaskList.of([EAT, EAT])).toThrow(DuplicateTaskError);
    });

    it("名前や完了状態が違っても TaskId が同じなら作れない", () => {
      expect(() =>
        TaskList.of([EAT, EAT.rename(TaskName.of("Brunch"))])
      ).toThrow(DuplicateTaskError);
    });

    it("既にある TaskId は追加できない", () => {
      expect(() => threeTasks().add(EAT)).toThrow(DuplicateTaskError);
    });

    it("どの TaskId が重複しているかを伝える", () => {
      expect(() => threeTasks().add(EAT)).toThrow("task-1");
    });
  });

  describe("追加", () => {
    it("末尾に Task を加えた新しいリストを返す", () => {
      expect(ids(TaskList.of([EAT]).add(SLEEP))).toEqual(["task-1", "task-2"]);
    });

    it("元のリストを変更しない", () => {
      const list = TaskList.of([EAT]);

      list.add(SLEEP);

      expect(list.size).toBe(1);
    });
  });

  describe("削除", () => {
    it("指定した TaskId の Task だけを取り除く", () => {
      expect(ids(threeTasks().remove(id("task-2")))).toEqual([
        "task-1",
        "task-3",
      ]);
    });

    it("存在しない TaskId を指定しても何も起きない", () => {
      expect(threeTasks().remove(id("task-999")).size).toBe(3);
    });

    it("元のリストを変更しない", () => {
      const list = threeTasks();

      list.remove(id("task-2"));

      expect(list.size).toBe(3);
    });
  });

  // 内側の Task への変更は、必ず集約ルートのメソッドを通す。
  describe("名前の変更", () => {
    it("指定した Task の名前を変える", () => {
      const renamed = threeTasks().renameTask(id("task-2"), TaskName.of("Nap"));

      expect(names(renamed)).toEqual(["Eat", "Nap", "Repeat"]);
    });

    it("完了状態は変えない", () => {
      const renamed = threeTasks().renameTask(
        id("task-1"),
        TaskName.of("Brunch")
      );

      expect(completedOf(renamed, "task-1")).toBe(true);
    });

    it("存在しない TaskId を指定しても何も起きない", () => {
      const list = threeTasks();

      expect(names(list.renameTask(id("task-999"), TaskName.of("Nap")))).toEqual(
        names(list)
      );
    });

    it("元のリストを変更しない", () => {
      const list = threeTasks();

      list.renameTask(id("task-2"), TaskName.of("Nap"));

      expect(names(list)).toEqual(["Eat", "Sleep", "Repeat"]);
    });
  });

  describe("完了状態の変更", () => {
    it("未完了の Task を完了にする", () => {
      expect(completedOf(threeTasks().completeTask(id("task-2")), "task-2")).toBe(
        true
      );
    });

    it("完了した Task を未完了に戻す", () => {
      expect(
        completedOf(threeTasks().incompleteTask(id("task-1")), "task-1")
      ).toBe(false);
    });

    it("並び順を保つ", () => {
      expect(ids(threeTasks().completeTask(id("task-2")))).toEqual([
        "task-1",
        "task-2",
        "task-3",
      ]);
    });

    it("他の Task には影響しない", () => {
      const completed = threeTasks().completeTask(id("task-2"));

      expect(completedOf(completed, "task-3")).toBe(false);
    });

    it("存在しない TaskId を指定しても何も起きない", () => {
      expect(threeTasks().completeTask(id("task-999")).countActive()).toBe(2);
    });
  });

  describe("問い合わせ", () => {
    it("存在の有無を確かめられる", () => {
      expect(threeTasks().contains(id("task-1"))).toBe(true);
      expect(threeTasks().contains(id("task-999"))).toBe(false);
    });

    it("完了しているかを確かめられる", () => {
      expect(completedOf(threeTasks(), "task-1")).toBe(true);
      expect(completedOf(threeTasks(), "task-2")).toBe(false);
    });

    it("存在しない Task は完了していないものとして扱う", () => {
      expect(completedOf(threeTasks(), "task-999")).toBe(false);
    });
  });

  // UI が「remaining」として表示している値。数え方はドメインの知識。
  describe("未完了の件数", () => {
    it("完了した Task を数に含めない", () => {
      expect(threeTasks().countActive()).toBe(2);
    });

    it("すべて完了していれば 0 件", () => {
      const list = threeTasks()
        .completeTask(id("task-2"))
        .completeTask(id("task-3"));

      expect(list.countActive()).toBe(0);
    });

    it("空のリストは 0 件", () => {
      expect(TaskList.empty().countActive()).toBe(0);
    });

    it("Task を完了にすると件数が減る", () => {
      expect(threeTasks().completeTask(id("task-2")).countActive()).toBe(1);
    });
  });
});
