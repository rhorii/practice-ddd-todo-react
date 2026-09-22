/**
 * Task を一意に識別する値オブジェクト。
 *
 * Task の同一性はこの値だけで決まる。名前が変わっても完了状態が変わっても、
 * TaskId が同じなら同じ Task である。
 *
 * 値を private フィールドとして持つことで、TypeScript の型が名前的 (nominal) になる。
 * これがなければ TaskId は「value: string を持つ何か」という構造でしかなく、
 * 同じ形をした TaskName などと相互に代入できてしまう。
 */
export class TaskId {
  private constructor(private readonly id: string) {}

  /**
   * 文字列から TaskId を作る。空の識別子は存在してはならないため、
   * ここで不変条件を守る。TaskId が存在する = 有効な識別子である、が保証される。
   */
  static of(value: string): TaskId {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error("TaskId は空にできません");
    }
    return new TaskId(trimmed);
  }

  get value(): string {
    return this.id;
  }

  /**
   * 値オブジェクトは同一性ではなく等価性で比較する。
   * インスタンスが別でも、値が同じなら同じものとして扱う。
   */
  equals(other: TaskId): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return this.id;
  }
}
