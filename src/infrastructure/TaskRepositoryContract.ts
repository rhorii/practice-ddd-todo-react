import { Task } from "../domain/Task";
import { TaskId } from "../domain/TaskId";
import { TaskList } from "../domain/TaskList";
import { TaskName } from "../domain/TaskName";
import type { TaskRepository } from "../domain/TaskRepository";

/**
 * TaskRepository の実装が満たすべき振る舞いを定義した共有テスト。
 *
 * インターフェースは「どんなメソッドがあるか」しか表現できない。
 * 「保存したものが読み出せる」「並び順が保たれる」といった、実装が守るべき
 * 約束は型に書けないため、テストとして書いて全実装に適用する。
 *
 * これがあると、差し替え可能であることが主張ではなく事実になる。
 */
export function describeTaskRepositoryContract(
  name: string,
  createRepository: () => TaskRepository
): void {
  describe(`${name} は TaskRepository の約束を満たす`, () => {
    const task = (id: string, taskName: string, completed = false) =>
      Task.reconstruct(TaskId.of(id), TaskName.of(taskName), completed);

    const EAT = task("task-1", "Eat", true);
    const SLEEP = task("task-2", "Sleep");
    const REPEAT = task("task-3", "Repeat");

    it("何も保存していなければ空の一覧を返す", async () => {
      const repository = createRepository();

      expect((await repository.load()).isEmpty).toBe(true);
    });

    it("保存した TaskList を読み出せる", async () => {
      const repository = createRepository();

      await repository.save(TaskList.of([EAT, SLEEP]));

      expect((await repository.load()).size).toBe(2);
    });

    it("保存した Task の内容を保つ", async () => {
      const repository = createRepository();

      await repository.save(TaskList.of([EAT]));

      const loaded = (await repository.load()).find(TaskId.of("task-1"));

      expect(loaded?.name.value).toBe("Eat");
      expect(loaded?.isCompleted).toBe(true);
    });

    it("並び順を保つ", async () => {
      const repository = createRepository();

      await repository.save(TaskList.of([REPEAT, EAT, SLEEP]));

      const loaded = await repository.load();

      expect(loaded.toArray().map((t) => t.id.value)).toEqual([
        "task-3",
        "task-1",
        "task-2",
      ]);
    });

    it("保存するたびに内容が置き換わる", async () => {
      const repository = createRepository();

      await repository.save(TaskList.of([EAT]));
      await repository.save(TaskList.of([SLEEP]));

      const loaded = await repository.load();

      expect(loaded.size).toBe(1);
      expect(loaded.contains(TaskId.of("task-1"))).toBe(false);
    });

    it("空の TaskList を保存できる", async () => {
      const repository = createRepository();

      await repository.save(TaskList.of([EAT]));
      await repository.save(TaskList.empty());

      expect((await repository.load()).isEmpty).toBe(true);
    });

    it("完了状態の変更を保存できる", async () => {
      const repository = createRepository();

      await repository.save(TaskList.of([SLEEP]));
      const loaded = await repository.load();
      await repository.save(loaded.replace(SLEEP.complete()));

      expect((await repository.load()).countActive()).toBe(0);
    });
  });
}
