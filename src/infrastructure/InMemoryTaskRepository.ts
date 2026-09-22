import { TaskList } from "../domain/TaskList";
import type { TaskRepository } from "../domain/TaskRepository";

/**
 * メモリ上に TaskList を保持する実装。
 *
 * アプリを再読み込みすると内容は消える。永続化としては最も素朴だが、
 * TaskRepository の最初の実装としてはこれで十分であり、テストでも
 * そのまま使える。T2-3 で localStorage 版に差し替えたとき、
 * domain 層と application 層が一行も変わらないことを確かめる土台になる。
 *
 * TaskList はイミュータブルなので、保持している参照をそのまま返しても
 * 外から書き換えられる心配がない。
 */
export class InMemoryTaskRepository implements TaskRepository {
  private tasks: TaskList;

  constructor(initialTasks: TaskList = TaskList.empty()) {
    this.tasks = initialTasks;
  }

  async load(): Promise<TaskList> {
    return this.tasks;
  }

  async save(tasks: TaskList): Promise<void> {
    this.tasks = tasks;
  }
}
