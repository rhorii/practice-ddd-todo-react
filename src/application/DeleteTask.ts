import { TaskId } from "../domain/TaskId";
import type { TaskDto } from "./TaskDto";
import { toDtos, toTaskList } from "./TaskMapper";

/**
 * Task を取り除くユースケース。
 *
 * 「どう取り除くか」は TaskList が知っている。存在しない TaskId を渡されても
 * 何も起きないという判断も、集合としての振る舞いとして TaskList 側にある。
 *
 * T3-1 でリポジトリへの保存まで含む形に発展させる。
 */
export class DeleteTask {
  execute(tasks: readonly TaskDto[], id: string): TaskDto[] {
    return toDtos(toTaskList(tasks).remove(TaskId.of(id)));
  }
}
