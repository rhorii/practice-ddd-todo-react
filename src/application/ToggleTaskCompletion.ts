import { TaskId } from "../domain/TaskId";
import type { TaskRepository } from "../domain/TaskRepository";
import type { TaskDto } from "./TaskDto";
import { toDtos } from "./TaskMapper";

/**
 * Task の完了状態を切り替えるユースケース。
 *
 * ドメインが持つのは「完了にする」「未完了に戻す」の2つで、
 * 「切り替える」は UI（チェックボックス）の都合による組み合わせにすぎない。
 * その組み立てをこの層が引き受けることで、ドメインの語彙が UI に引きずられない。
 */
export class ToggleTaskCompletion {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(id: string): Promise<TaskDto[]> {
    const taskId = TaskId.of(id);
    const current = await this.tasks.load();

    const updated = current.isTaskCompleted(taskId)
      ? current.incompleteTask(taskId)
      : current.completeTask(taskId);

    await this.tasks.save(updated);

    return toDtos(updated);
  }
}
