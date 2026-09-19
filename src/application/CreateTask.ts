import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import type { TaskDto } from "./TaskDto";

/**
 * 新しい Task を作るユースケース。
 *
 * ID の発行方法を自分では決めず、TaskIdGenerator を受け取る。
 * この層が知っているのは「TaskId を発行できる何かがある」ことだけで、
 * それが nanoid なのか連番なのかは infrastructure 層の都合になる。
 *
 * T3-1 でリポジトリへの保存まで含む AddTask に発展させる。
 * 現時点では作った Task を呼び出し側に返すだけで、永続化は presentation 層に残っている。
 */
export class CreateTask {
  constructor(private readonly taskIdGenerator: TaskIdGenerator) {}

  execute(name: string): TaskDto {
    return {
      id: this.taskIdGenerator.generate().value,
      name,
      completed: false,
    };
  }
}
