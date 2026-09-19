import { Task } from "../domain/Task";
import { TaskId } from "../domain/TaskId";
import { TaskName } from "../domain/TaskName";
import type { TaskDto } from "./TaskDto";

/**
 * ドメインモデルと DTO の変換。
 *
 * この変換が存在することで、UI が必要とする形とドメインが必要とする形を
 * 別々に育てられる。UI の都合で Task にフィールドを足す、といったことが起きない。
 */

export function toDto(task: Task): TaskDto {
  return {
    id: task.id.value,
    name: task.name.value,
    completed: task.isCompleted,
  };
}

/**
 * DTO から Task を復元する。create ではなく reconstruct を使う。
 * これは既に存在する Task の再現であって、新規作成ではないため。
 */
export function toTask(dto: TaskDto): Task {
  return Task.reconstruct(
    TaskId.of(dto.id),
    TaskName.of(dto.name),
    dto.completed
  );
}
