import { TaskFilter } from "../domain/TaskFilter";
import type { TaskDto } from "./TaskDto";
import { toDtos, toTaskList } from "./TaskMapper";

/**
 * 指定されたフィルタで絞り込んだ Task 一覧を返すユースケース。
 *
 * 「未完了とは何か」を知っているのは TaskFilter であり、この層はフィルタ名から
 * 対応する TaskFilter を選んで適用するだけ。UI が条件式を持つ必要がなくなる。
 */
export class ListTasks {
  execute(tasks: readonly TaskDto[], filterName: string): TaskDto[] {
    return toDtos(TaskFilter.of(filterName).apply(toTaskList(tasks)));
  }
}
