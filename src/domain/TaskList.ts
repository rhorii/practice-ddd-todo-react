import type { Task } from "./Task";
import type { TaskId } from "./TaskId";

/**
 * Task の集まり。
 *
 * 生の配列をクラスで包み、「Task の集合に対する操作」をここに集める
 * （ファーストクラスコレクション）。こうしないと map や filter が UI に散らばり、
 * 「未完了の件数を数える」といったドメインの知識が画面のコードに漏れ出す。
 *
 * Task と同じくイミュータブルで、変更操作は新しい TaskList を返す。
 *
 * 現時点では同じ TaskId の Task を2つ持つことを禁じていない。
 * 集約としてその不変条件を持つべきかは T5-1 で検討する。
 */
export class TaskList {
  private constructor(private readonly tasks: readonly Task[]) {}

  static of(tasks: readonly Task[]): TaskList {
    return new TaskList([...tasks]);
  }

  static empty(): TaskList {
    return new TaskList([]);
  }

  add(task: Task): TaskList {
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
   * 同じ TaskId を持つ Task を差し替える。
   * Task はイミュータブルなので、完了や名前の変更はこの差し替えとして表現される。
   * 該当する Task がなければ何も起きない。
   */
  replace(task: Task): TaskList {
    return new TaskList(
      this.tasks.map((current) => (current.id.equals(task.id) ? task : current))
    );
  }

  find(id: TaskId): Task | undefined {
    return this.tasks.find((task) => task.id.equals(id));
  }

  contains(id: TaskId): boolean {
    return this.find(id) !== undefined;
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
}
