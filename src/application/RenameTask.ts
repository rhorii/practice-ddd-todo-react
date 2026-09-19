import { TaskName } from "../domain/TaskName";
import type { TaskDto } from "./TaskDto";
import { toDto, toTask } from "./TaskMapper";

/**
 * Task の名前を変えるユースケース。
 *
 * 新しい名前も TaskName を通るため、追加のときと同じ不変条件が適用される。
 * 「追加のときだけ検証されて変更では素通り」という抜け道が構造的に存在しない。
 *
 * 名前を差し替えた新しい Task を作るのは Task.rename の仕事であり、
 * ここではオブジェクトの組み立て方を知らなくてよい。
 *
 * T3-1 でリポジトリへの保存まで含む形に発展させる。
 */
export class RenameTask {
  execute(task: TaskDto, newName: string): TaskDto {
    return toDto(toTask(task).rename(TaskName.of(newName)));
  }
}
