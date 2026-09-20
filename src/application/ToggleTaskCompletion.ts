import { TaskId } from "../domain/TaskId";
import type { TaskRepository } from "../domain/TaskRepository";
import type { TaskDto } from "./TaskDto";
import { toDtos } from "./TaskMapper";

/**
 * Task の完了状態を切り替えるユースケース。
 *
 * ドメインが持つのは complete と incomplete という2つの操作で、
 * 「切り替える」は UI（チェックボックス）の都合による組み合わせにすぎない。
 * その組み立てをこの層が引き受けることで、ドメインの語彙が UI に引きずられない。
 */
export class ToggleTaskCompletion {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(id: string): Promise<TaskDto[]> {
    const current = await this.tasks.load();
    const target = current.find(TaskId.of(id));

    if (target === undefined) {
      return toDtos(current);
    }

    const updated = current.replace(
      target.isCompleted ? target.incomplete() : target.complete()
    );

    await this.tasks.save(updated);

    return toDtos(updated);
  }
}
