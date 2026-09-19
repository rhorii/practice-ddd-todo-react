import { Task } from "./Task";
import { TaskId } from "./TaskId";
import { TaskName } from "./TaskName";

const id = (value: string) => TaskId.of(value);
const name = (value: string) => TaskName.of(value);

describe("Task", () => {
  describe("生成", () => {
    it("作られた直後は未完了である", () => {
      expect(Task.create(id("task-1"), name("Eat")).isCompleted).toBe(false);
    });

    it("渡された TaskId と TaskName を持つ", () => {
      const task = Task.create(id("task-1"), name("Eat"));

      expect(task.id.value).toBe("task-1");
      expect(task.name.value).toBe("Eat");
    });
  });

  describe("復元", () => {
    it("記録された完了状態をそのまま再現する", () => {
      const task = Task.reconstruct(id("task-1"), name("Eat"), true);

      expect(task.isCompleted).toBe(true);
    });
  });

  describe("完了状態の変更", () => {
    it("complete() は完了した Task を返す", () => {
      expect(Task.create(id("task-1"), name("Eat")).complete().isCompleted).toBe(
        true
      );
    });

    it("incomplete() は未完了の Task を返す", () => {
      const completed = Task.reconstruct(id("task-1"), name("Eat"), true);

      expect(completed.incomplete().isCompleted).toBe(false);
    });

    it("元の Task を変更しない", () => {
      const task = Task.create(id("task-1"), name("Eat"));

      task.complete();

      expect(task.isCompleted).toBe(false);
    });

    it("完了しても TaskId と TaskName は変わらない", () => {
      const task = Task.create(id("task-1"), name("Eat")).complete();

      expect(task.id.value).toBe("task-1");
      expect(task.name.value).toBe("Eat");
    });
  });

  describe("名前の変更", () => {
    it("新しい名前を持つ Task を返す", () => {
      const renamed = Task.create(id("task-1"), name("Eat")).rename(
        name("Brunch")
      );

      expect(renamed.name.value).toBe("Brunch");
    });

    it("元の Task を変更しない", () => {
      const task = Task.create(id("task-1"), name("Eat"));

      task.rename(name("Brunch"));

      expect(task.name.value).toBe("Eat");
    });

    it("完了状態を保ったまま名前だけを変える", () => {
      const completed = Task.reconstruct(id("task-1"), name("Eat"), true);

      expect(completed.rename(name("Brunch")).isCompleted).toBe(true);
    });
  });

  // ここがエンティティと値オブジェクトの決定的な違い。
  // 値オブジェクトはすべての値が同じときに等しいが、
  // エンティティは同一性（TaskId）だけで等しさが決まる。
  describe("同一性", () => {
    it("TaskId が同じなら、名前が違っても同じ Task である", () => {
      const eat = Task.create(id("task-1"), name("Eat"));
      const brunch = eat.rename(name("Brunch"));

      expect(eat.equals(brunch)).toBe(true);
    });

    it("TaskId が同じなら、完了状態が違っても同じ Task である", () => {
      const task = Task.create(id("task-1"), name("Eat"));

      expect(task.equals(task.complete())).toBe(true);
    });

    it("TaskId が違えば、名前も完了状態も同じでも別の Task である", () => {
      const first = Task.create(id("task-1"), name("Eat"));
      const second = Task.create(id("task-2"), name("Eat"));

      expect(first.equals(second)).toBe(false);
    });
  });
});
