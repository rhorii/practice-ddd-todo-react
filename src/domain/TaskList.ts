import type { Task } from "./Task";
import { TaskCompleted, type DomainEvent } from "./TaskCompleted";
import type { TaskId } from "./TaskId";
import type { TaskName } from "./TaskName";

export class DuplicateTaskError extends Error {
  constructor(id: TaskId) {
    super(`同じ TaskId の Task が既に存在します: ${id.value}`);
    this.name = "DuplicateTaskError";
  }
}

/**
 * Task の集まり。このアプリケーションの**集約ルート**。
 *
 * 集約とは整合性を保つ単位であり、外部からは集約ルートを経由してのみ操作する。
 * Task はこの集約の内側にいるエンティティで、単独で保存されることはない。
 *
 * ## なぜ Task ではなく TaskList を集約ルートにしたか
 *
 * 「同じ TaskId の Task が2つない」「並び順が保たれる」は、Task 単体では
 * 守れず集合でなければ判断できない不変条件だから。Task を集約ルートにすると、
 * これらを守る責任が永続化の実装側（DB の一意制約など）に漏れる。
 *
 * 代償として、全件をまとめて読み書きすることになり、並行更新にも弱い
 * （後から保存したほうが勝つ）。このアプリは単一ユーザーで件数も限られるため
 * 引き合うが、複数人が同時に編集する・件数が数千を超えるといった状況になれば
 * Task を集約ルートにする設計を検討し直す価値がある。
 *
 * ## 変更の入口
 *
 * 内側の Task への変更は必ずこのクラスのメソッドを通す。外から Task を
 * 取り出して変更し戻す経路を残すと、集合としてのルールを適用できる場所が
 * 分散してしまう。そのため find と replace は非公開にしている。
 *
 * 読み出しのための toArray は公開している。Task はイミュータブルなので
 * 取り出されても変更はできず、DTO への変換に必要なため。
 *
 * ## ドメインイベント
 *
 * 操作の結果として起きた出来事は events に載せて返す。イミュータブルなので
 * 操作のたびに新しい TaskList が生まれ、そこに載るのはその操作で起きたことだけ。
 * 溜め込んで消し忘れる、という状態を持たずに済む。
 *
 * 発行するだけで、誰がどう反応するかは知らない。
 */
export class TaskList {
  private constructor(
    private readonly tasks: readonly Task[],
    private readonly raisedEvents: readonly DomainEvent[] = []
  ) {}

  /** この TaskList を生んだ操作で起きた出来事。 */
  get events(): readonly DomainEvent[] {
    return this.raisedEvents;
  }

  static of(tasks: readonly Task[]): TaskList {
    const seen = new Set<string>();

    for (const task of tasks) {
      if (seen.has(task.id.value)) {
        throw new DuplicateTaskError(task.id);
      }
      seen.add(task.id.value);
    }

    return new TaskList([...tasks]);
  }

  static empty(): TaskList {
    return new TaskList([]);
  }

  add(task: Task): TaskList {
    if (this.contains(task.id)) {
      throw new DuplicateTaskError(task.id);
    }

    return new TaskList([...this.tasks, task]);
  }

  /**
   * 指定した TaskId の Task を取り除く。
   * 該当する Task がなければ何も起きない。
   */
  remove(id: TaskId): TaskList {
    return new TaskList(this.tasks.filter((task) => !task.id.equals(id)));
  }

  /**
   * 指定した Task の名前を変える。
   * 該当する Task がなければ何も起きない。
   */
  renameTask(id: TaskId, newName: TaskName): TaskList {
    return this.mapTask(id, (task) => task.rename(newName));
  }

  /**
   * 指定した Task を完了にする。該当する Task がなければ何も起きない。
   * 既に完了している Task を完了にしても、出来事は起きていないのでイベントも生まれない。
   */
  completeTask(id: TaskId): TaskList {
    const target = this.find(id);

    if (target === undefined || target.isCompleted) {
      return this;
    }

    return this.replace(target.complete(), [
      new TaskCompleted(target.id, target.name),
    ]);
  }

  /** 指定した Task を未完了に戻す。該当する Task がなければ何も起きない。 */
  incompleteTask(id: TaskId): TaskList {
    return this.mapTask(id, (task) => task.incomplete());
  }

  contains(id: TaskId): boolean {
    return this.find(id) !== undefined;
  }

  /**
   * 指定した Task が完了しているか。該当する Task がなければ false。
   *
   * 「完了しているなら未完了に戻す」のような組み立ては UI の都合であり
   * ドメインの操作ではないため、判断に必要な情報だけを外に見せる。
   */
  isTaskCompleted(id: TaskId): boolean {
    return this.find(id)?.isCompleted ?? false;
  }

  /**
   * 未完了の Task の件数。UI が「remaining」として表示している値。
   * 数え方はドメインの知識であって、画面の都合ではない。
   */
  countActive(): number {
    return this.tasks.filter((task) => !task.isCompleted).length;
  }

  get size(): number {
    return this.tasks.length;
  }

  get isEmpty(): boolean {
    return this.tasks.length === 0;
  }

  toArray(): readonly Task[] {
    return this.tasks;
  }

  private mapTask(id: TaskId, change: (task: Task) => Task): TaskList {
    const target = this.find(id);

    if (target === undefined) {
      return this;
    }

    return this.replace(change(target));
  }

  private find(id: TaskId): Task | undefined {
    return this.tasks.find((task) => task.id.equals(id));
  }

  /**
   * 同じ TaskId を持つ Task を置き換える。
   * Task はイミュータブルなので、変更はすべてこの差し替えとして表現される。
   */
  private replace(task: Task, events: readonly DomainEvent[] = []): TaskList {
    return new TaskList(
      this.tasks.map((current) => (current.id.equals(task.id) ? task : current)),
      events
    );
  }
}
