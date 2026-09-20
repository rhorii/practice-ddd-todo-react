import { TaskId } from "../domain/TaskId";
import { TaskName } from "../domain/TaskName";
import type { TaskRepository } from "../domain/TaskRepository";
import type { TaskDto } from "./TaskDto";
import { toDtos } from "./TaskMapper";

/**
 * Task の名前を変えるユースケース。
 *
 * 新しい名前も TaskName を通るため、追加のときと同じ不変条件が適用される。
 * 「追加のときだけ検証されて変更では素通り」という抜け道が構造的に存在しない。
 *
 * 対象が見つからなければ保存も行わない。
 */
export class RenameTask {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(id: string, newName: string): Promise<TaskDto[]> {
    const taskName = TaskName.of(newName);
    const current = await this.tasks.load();
    const target = current.find(TaskId.of(id));

    if (target === undefined) {
      return toDtos(current);
    }

    const updated = current.replace(target.rename(taskName));

    await this.tasks.save(updated);

    return toDtos(updated);
  }
}
