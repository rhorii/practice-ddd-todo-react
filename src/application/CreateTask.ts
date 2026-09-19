import { Task } from "../domain/Task";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import { TaskName } from "../domain/TaskName";
import type { TaskDto } from "./TaskDto";
import { toDto } from "./TaskMapper";

/**
 * 新しい Task を作るユースケース。
 *
 * ID の発行方法を自分では決めず、TaskIdGenerator を受け取る。
 * この層が知っているのは「TaskId を発行できる何かがある」ことだけで、
 * それが nanoid なのか連番なのかは infrastructure 層の都合になる。
 *
 * 名前の妥当性も完了状態の初期値もここでは決めない。前者は TaskName の
 * 不変条件が、後者は Task.create が引き受ける。この層の仕事は手順の調整だけ。
 *
 * T3-1 でリポジトリへの保存まで含む AddTask に発展させる。
 * 現時点では作った Task を呼び出し側に返すだけで、永続化は presentation 層に残っている。
 */
export class CreateTask {
  constructor(private readonly taskIdGenerator: TaskIdGenerator) {}

  execute(name: string): TaskDto {
    const task = Task.create(this.taskIdGenerator.generate(), TaskName.of(name));

    return toDto(task);
  }
}
