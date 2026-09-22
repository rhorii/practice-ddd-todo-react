import type { TaskId } from "./TaskId";
import type { TaskName } from "./TaskName";

/**
 * やるべきこと1件。このアプリが扱う中心的なエンティティ。
 *
 * 値オブジェクトとの違いは**同一性**にある。TaskId と TaskName は値が同じなら
 * 同じものだが、Task は名前が変わっても完了しても「同じ Task」であり続ける。
 * したがって等価性の判定は TaskId だけで行う（equals を参照）。
 *
 * 状態の変更はイミュータブルに行い、変更後の Task を新しく返す。
 * こうすると、ある Task への参照を持っている誰かの足元で状態が変わることがない。
 */
export class Task {
  private constructor(
    private readonly taskId: TaskId,
    private readonly taskName: TaskName,
    private readonly completed: boolean
  ) {}

  /**
   * 新しい Task を作る。作られた直後の Task は必ず未完了である。
   * 「完了済みの Task を新規作成する」ことはドメイン上あり得ないため、
   * 完了状態を引数に取らない。
   */
  static create(id: TaskId, name: TaskName): Task {
    return new Task(id, name, false);
  }

  /**
   * 保存されていた Task を復元する。
   *
   * create と分けているのは、両者が意味的に別物だから。新規作成には
   * 「必ず未完了で始まる」というルールがあるが、復元は記録された状態を
   * そのまま再現するだけで、ルールを適用してはならない。
   */
  static reconstruct(id: TaskId, name: TaskName, completed: boolean): Task {
    return new Task(id, name, completed);
  }

  get id(): TaskId {
    return this.taskId;
  }

  get name(): TaskName {
    return this.taskName;
  }

  get isCompleted(): boolean {
    return this.completed;
  }

  complete(): Task {
    return new Task(this.taskId, this.taskName, true);
  }

  incomplete(): Task {
    return new Task(this.taskId, this.taskName, false);
  }

  rename(newName: TaskName): Task {
    return new Task(this.taskId, newName, this.completed);
  }

  /**
   * 同一性による比較。名前や完了状態が違っても、TaskId が同じなら同じ Task。
   * 値オブジェクトがすべての値を比べるのとは対照的で、ここがエンティティの本質。
   */
  equals(other: Task): boolean {
    return this.taskId.equals(other.taskId);
  }
}
