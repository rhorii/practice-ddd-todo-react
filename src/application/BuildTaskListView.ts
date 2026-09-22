import type { CountRemainingTasks } from "./CountRemainingTasks";
import type { FilterTasks } from "./FilterTasks";
import type { TaskDto } from "./TaskDto";
import type { TaskListView } from "./TaskListView";

/**
 * 画面が必要とする一式を組み立てる。
 *
 * やっていることは既存の2つの操作を呼ぶだけで、新しい判断は何も持たない。
 * それでも置く価値があるのは、「この画面に必要なものは何か」という問いの
 * 答えが一箇所に集まるため。項目が増えても UI と application の境界は
 * TaskListView ひとつのままでいられる。
 */
export class BuildTaskListView {
  constructor(
    private readonly filterTasks: FilterTasks,
    private readonly countRemainingTasks: CountRemainingTasks
  ) {}

  execute(tasks: readonly TaskDto[], filterName: string): TaskListView {
    return {
      visibleTasks: this.filterTasks.execute(tasks, filterName),
      remainingCount: this.countRemainingTasks.execute(tasks),
    };
  }
}
