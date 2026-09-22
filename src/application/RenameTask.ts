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
 * 該当する Task がないときに何も起きないのは TaskList 側の判断。
 * この層は保存先とのやり取りを調整するだけ。
 */
export class RenameTask {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(id: string, newName: string): Promise<TaskDto[]> {
    const taskName = TaskName.of(newName);
    const updated = (await this.tasks.load()).renameTask(
      TaskId.of(id),
      taskName
    );

    await this.tasks.save(updated);

    return toDtos(updated);
  }
}
