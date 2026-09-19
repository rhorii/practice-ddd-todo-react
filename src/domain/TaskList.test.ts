import { Task } from "./Task";
import { TaskId } from "./TaskId";
import { TaskList } from "./TaskList";
import { TaskName } from "./TaskName";

const task = (id: string, name: string, completed = false) =>
  Task.reconstruct(TaskId.of(id), TaskName.of(name), completed);

const EAT = task("task-1", "Eat", true);
const SLEEP = task("task-2", "Sleep");
const REPEAT = task("task-3", "Repeat");

const threeTasks = () => TaskList.of([EAT, SLEEP, REPEAT]);

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

  describe("追加", () => {
    it("末尾に Task を加えた新しいリストを返す", () => {
      const added = TaskList.of([EAT]).add(SLEEP);

      expect(added.toArray().map((t) => t.id.value)).toEqual([
        "task-1",
        "task-2",
      ]);
    });

    it("元のリストを変更しない", () => {
      const list = TaskList.of([EAT]);

      list.add(SLEEP);

      expect(list.size).toBe(1);
    });
  });

  describe("削除", () => {
    it("指定した TaskId の Task だけを取り除く", () => {
      const removed = threeTasks().remove(TaskId.of("task-2"));

      expect(removed.toArray().map((t) => t.id.value)).toEqual([
        "task-1",
        "task-3",
      ]);
    });

    it("存在しない TaskId を指定しても何も起きない", () => {
      expect(threeTasks().remove(TaskId.of("task-999")).size).toBe(3);
    });

    it("元のリストを変更しない", () => {
      const list = threeTasks();

      list.remove(TaskId.of("task-2"));

      expect(list.size).toBe(3);
    });
  });

  describe("差し替え", () => {
    it("同じ TaskId を持つ Task を置き換える", () => {
      const replaced = threeTasks().replace(SLEEP.complete());

      expect(replaced.find(TaskId.of("task-2"))?.isCompleted).toBe(true);
    });

    it("並び順を保つ", () => {
      const replaced = threeTasks().replace(SLEEP.rename(TaskName.of("Nap")));

      expect(replaced.toArray().map((t) => t.name.value)).toEqual([
        "Eat",
        "Nap",
        "Repeat",
      ]);
    });

    it("存在しない TaskId の Task を渡しても何も起きない", () => {
      const stranger = task("task-999", "Unknown");

      expect(threeTasks().replace(stranger).size).toBe(3);
    });
  });

  describe("検索", () => {
    it("TaskId で Task を取り出せる", () => {
      expect(threeTasks().find(TaskId.of("task-2"))?.name.value).toBe("Sleep");
    });

    it("存在しなければ undefined を返す", () => {
      expect(threeTasks().find(TaskId.of("task-999"))).toBeUndefined();
    });

    it("存在の有無を確かめられる", () => {
      expect(threeTasks().contains(TaskId.of("task-1"))).toBe(true);
      expect(threeTasks().contains(TaskId.of("task-999"))).toBe(false);
    });
  });

  // UI が「remaining」として表示している値。数え方はドメインの知識。
  describe("未完了の件数", () => {
    it("完了した Task を数に含めない", () => {
      expect(threeTasks().countActive()).toBe(2);
    });

    it("すべて完了していれば 0 件", () => {
      const list = TaskList.of([EAT, SLEEP.complete(), REPEAT.complete()]);

      expect(list.countActive()).toBe(0);
    });

    it("空のリストは 0 件", () => {
      expect(TaskList.empty().countActive()).toBe(0);
    });

    it("Task を完了にすると件数が減る", () => {
      const list = threeTasks().replace(SLEEP.complete());

      expect(list.countActive()).toBe(1);
    });
  });
});
