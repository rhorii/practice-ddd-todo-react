import type { Task } from "./Task";
import { TaskList } from "./TaskList";

export type TaskFilterName = "All" | "Active" | "Completed";

/**
 * TaskList から表示対象を選び出す条件。
 *
 * 取り得る値が3つに限られるため、静的なインスタンスとして列挙する。
 * こうすると「不明なフィルタ」を表す TaskFilter が存在できず、
 * 値が3つであることが型でもインスタンスでも保証される。
 *
 * 「未完了とは completed が false であること」という判断がここに集まる。
 * UI に filter を書くと、同じ知識が TaskList.countActive と二重に存在してしまう。
 */
export class TaskFilter {
  static readonly ALL = new TaskFilter("All", () => true);
  static readonly ACTIVE = new TaskFilter(
    "Active",
    (task: Task) => !task.isCompleted
  );
  static readonly COMPLETED = new TaskFilter(
    "Completed",
    (task: Task) => task.isCompleted
  );

  /** 選べるフィルタの全体。UI に並べる順序でもある。 */
  private static readonly VALUES = [
    TaskFilter.ALL,
    TaskFilter.ACTIVE,
    TaskFilter.COMPLETED,
  ] as const;

  private constructor(
    readonly name: TaskFilterName,
    private readonly matcher: (task: Task) => boolean
  ) {}

  static values(): readonly TaskFilter[] {
    return TaskFilter.VALUES;
  }

  static names(): readonly TaskFilterName[] {
    return TaskFilter.VALUES.map((filter) => filter.name);
  }

  static of(name: string): TaskFilter {
    const found = TaskFilter.VALUES.find((filter) => filter.name === name);

    if (found === undefined) {
      throw new Error(`不明なフィルタです: ${name}`);
    }

    return found;
  }

  matches(task: Task): boolean {
    return this.matcher(task);
  }

  apply(tasks: TaskList): TaskList {
    return TaskList.of(tasks.toArray().filter((task) => this.matches(task)));
  }

  equals(other: TaskFilter): boolean {
    return this.name === other.name;
  }

  toString(): string {
    return this.name;
  }
}
