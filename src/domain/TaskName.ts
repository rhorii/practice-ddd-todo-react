/**
 * TaskName の不変条件に違反した理由。
 *
 * 文字列のメッセージを UI 側で解釈させると表示の都合がドメインに漏れるため、
 * 理由そのものを型として公開する。
 */
export type InvalidTaskNameReason = "empty" | "tooLong" | "multiline";

export class InvalidTaskNameError extends Error {
  constructor(
    readonly reason: InvalidTaskNameReason,
    message: string
  ) {
    super(message);
    this.name = "InvalidTaskNameError";
  }
}

/**
 * Task が何をするものかを表す名前。
 *
 * 「名前のない Task」は存在し得ない。この不変条件を静的ファクトリで守ることで、
 * TaskName が存在する = 有効な名前である、がプログラム全体で保証される。
 * 呼び出し側は「この文字列は検証済みだろうか」を気にしなくてよくなる。
 *
 * 値を private フィールドとして持つのは TaskId と同じ理由で、
 * 構造だけが同じ別の値オブジェクトと取り違えられないようにするため。
 */
export class TaskName {
  /** タスク名として妥当な長さの上限。文字数であってバイト数ではない。 */
  static readonly MAX_LENGTH = 100;

  private constructor(private readonly name: string) {}

  static of(value: string): TaskName {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw new InvalidTaskNameError("empty", "タスク名を入力してください");
    }

    if (/[\r\n]/.test(trimmed)) {
      throw new InvalidTaskNameError(
        "multiline",
        "タスク名に改行は含められません"
      );
    }

    // サロゲートペアを1文字として数えるため、length ではなくコードポイント単位で測る
    if ([...trimmed].length > TaskName.MAX_LENGTH) {
      throw new InvalidTaskNameError(
        "tooLong",
        `タスク名は${TaskName.MAX_LENGTH}文字以内にしてください`
      );
    }

    return new TaskName(trimmed);
  }

  get value(): string {
    return this.name;
  }

  equals(other: TaskName): boolean {
    return this.name === other.name;
  }

  toString(): string {
    return this.name;
  }
}
