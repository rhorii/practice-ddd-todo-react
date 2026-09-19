import { TaskId } from "../domain/TaskId";
import type { TaskDto } from "./TaskDto";
import { toDtos, toTaskList } from "./TaskMapper";

/**
 * Task の完了状態を切り替えるユースケース。
 *
 * ドメインが持つのは complete と incomplete という2つの操作で、
 * 「切り替える」は UI（チェックボックス）の都合による組み合わせにすぎない。
 * その組み立てをこの層が引き受けることで、ドメインの語彙が UI に引きずられない。
 *
 * T3-1 でリポジトリへの保存まで含む形に発展させる。
 */
export class ToggleTaskCompletion {
  execute(tasks: readonly TaskDto[], id: string): TaskDto[] {
    const list = toTaskList(tasks);
    const target = list.find(TaskId.of(id));

    if (target === undefined) {
      return toDtos(list);
    }

    return toDtos(
      list.replace(target.isCompleted ? target.incomplete() : target.complete())
    );
  }
}
