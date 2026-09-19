import { Task } from "../domain/Task";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import { TaskName } from "../domain/TaskName";
import type { TaskDto } from "./TaskDto";
import { toDtos, toTaskList } from "./TaskMapper";

/**
 * Task を追加するユースケース。
 *
 * ID の発行方法を自分では決めず、TaskIdGenerator を受け取る。
 * 名前の妥当性も完了状態の初期値もここでは決めない。前者は TaskName の
 * 不変条件が、後者は Task.create が引き受ける。リストへの加え方は TaskList が知る。
 * この層の仕事は手順の調整だけ。
 *
 * T3-1 でリポジトリへの保存まで含む形に発展させ、タスク一覧を引数で受け取る
 * 必要をなくす。
 */
export class AddTask {
  constructor(private readonly taskIdGenerator: TaskIdGenerator) {}

  execute(tasks: readonly TaskDto[], name: string): TaskDto[] {
    const task = Task.create(this.taskIdGenerator.generate(), TaskName.of(name));

    return toDtos(toTaskList(tasks).add(task));
  }
}
