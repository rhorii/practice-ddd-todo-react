import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import { TaskName } from "../domain/TaskName";
import type { TaskDto } from "./TaskDto";

/**
 * 新しい Task を作るユースケース。
 *
 * ID の発行方法を自分では決めず、TaskIdGenerator を受け取る。
 * この層が知っているのは「TaskId を発行できる何かがある」ことだけで、
 * それが nanoid なのか連番なのかは infrastructure 層の都合になる。
 *
 * 名前が妥当かどうかはここでは判断しない。TaskName を作る時点で不変条件が
 * 検査されるため、不正な名前であれば InvalidTaskNameError が送出される。
 *
 * T3-1 でリポジトリへの保存まで含む AddTask に発展させる。
 * 現時点では作った Task を呼び出し側に返すだけで、永続化は presentation 層に残っている。
 */
export class CreateTask {
  constructor(private readonly taskIdGenerator: TaskIdGenerator) {}

  execute(name: string): TaskDto {
    return {
      id: this.taskIdGenerator.generate().value,
      name: TaskName.of(name).value,
      completed: false,
    };
  }
}
