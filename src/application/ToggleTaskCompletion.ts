import type { TaskDto } from "./TaskDto";
import { toDto, toTask } from "./TaskMapper";

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
  execute(task: TaskDto): TaskDto {
    const current = toTask(task);

    return toDto(current.isCompleted ? current.incomplete() : current.complete());
  }
}
