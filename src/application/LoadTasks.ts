import type { TaskRepository } from "../domain/TaskRepository";
import type { TaskDto } from "./TaskDto";
import { toDtos } from "./TaskMapper";

/**
 * 保存されている Task 一覧を読み出すユースケース。
 *
 * 画面を開いたときの最初の一件。以降の一覧は各操作の戻り値として得られるため、
 * 毎回読み直す必要はない。
 */
export class LoadTasks {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(): Promise<TaskDto[]> {
    return toDtos(await this.tasks.load());
  }
}
