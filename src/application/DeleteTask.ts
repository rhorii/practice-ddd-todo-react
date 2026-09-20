import { TaskId } from "../domain/TaskId";
import type { TaskRepository } from "../domain/TaskRepository";
import type { TaskDto } from "./TaskDto";
import { toDtos } from "./TaskMapper";

/**
 * Task を取り除くユースケース。
 *
 * 「どう取り除くか」は TaskList が知っている。存在しない TaskId を渡されても
 * 何も起きないという判断も、集合としての振る舞いとして TaskList 側にある。
 */
export class DeleteTask {
  constructor(private readonly tasks: TaskRepository) {}

  async execute(id: string): Promise<TaskDto[]> {
    const updated = (await this.tasks.load()).remove(TaskId.of(id));

    await this.tasks.save(updated);

    return toDtos(updated);
  }
}
