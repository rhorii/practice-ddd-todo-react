import { TaskFilter } from "../domain/TaskFilter";
import type { TaskDto } from "./TaskDto";
import { toDtos, toTaskList } from "./TaskMapper";

/**
 * 指定されたフィルタで Task 一覧を絞り込むユースケース。
 *
 * 「未完了とは何か」を知っているのは TaskFilter であり、この層はフィルタ名から
 * 対応する TaskFilter を選んで適用するだけ。UI が条件式を持つ必要がなくなる。
 *
 * リポジトリを読まず、渡された一覧をそのまま絞り込む。これは保存されている
 * 内容を変えない「見せ方」の操作であり、画面が既に持っている一覧に対する
 * 射影にすぎないため。同じ理由で CountRemainingTasks もリポジトリを読まない。
 * 一覧を保存先から読み出すのは LoadTasks の役割。
 */
export class FilterTasks {
  execute(tasks: readonly TaskDto[], filterName: string): TaskDto[] {
    return toDtos(TaskFilter.of(filterName).apply(toTaskList(tasks)));
  }
}
