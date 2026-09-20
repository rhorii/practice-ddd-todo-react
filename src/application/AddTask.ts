import { Task } from "../domain/Task";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import { TaskName } from "../domain/TaskName";
import type { TaskRepository } from "../domain/TaskRepository";
import type { TaskDto } from "./TaskDto";
import { toDtos } from "./TaskMapper";

/**
 * Task を追加するユースケース。
 *
 * 保存されている一覧を読み、Task を加え、保存し直す。この「読む・変える・書く」の
 * 手順の調整がこの層の仕事であり、ルールそのものは持たない。名前の妥当性は
 * TaskName が、完了状態の初期値は Task.create が、加え方は TaskList が引き受ける。
 *
 * 名前の検査を読み出しより先に行うのは、不正な入力のときに ID を無駄に発行せず、
 * 保存も行わないため。
 */
export class AddTask {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly taskIdGenerator: TaskIdGenerator
  ) {}

  async execute(name: string): Promise<TaskDto[]> {
    const taskName = TaskName.of(name);
    const current = await this.tasks.load();
    const updated = current.add(
      Task.create(this.taskIdGenerator.generate(), taskName)
    );

    await this.tasks.save(updated);

    return toDtos(updated);
  }
}
