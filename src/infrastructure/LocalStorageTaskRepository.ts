import { TaskList } from "../domain/TaskList";
import type { TaskRepository } from "../domain/TaskRepository";
import { toStoredTasks, toTaskList } from "./StoredTask";

export const DEFAULT_STORAGE_KEY = "todo-react.tasks";

/**
 * localStorage に TaskList を保存する実装。
 *
 * domain 層は localStorage の存在を知らない。この層が TaskRepository に従う
 * だけなので、保存先を変えても domain 層と application 層は一行も変わらない。
 *
 * 保存されている内容が読めない場合は空の一覧として扱う。ユーザーが手で編集した、
 * 未対応の古い形式が残っている、といった状況でアプリが起動できなくなるのを
 * 避けるため。壊れた内容は次の保存で上書きされる。
 */
export class LocalStorageTaskRepository implements TaskRepository {
  constructor(
    private readonly storage: Storage = localStorage,
    private readonly key: string = DEFAULT_STORAGE_KEY
  ) {}

  async load(): Promise<TaskList> {
    const stored = this.storage.getItem(this.key);

    if (stored === null) {
      return TaskList.empty();
    }

    try {
      return toTaskList(JSON.parse(stored));
    } catch {
      return TaskList.empty();
    }
  }

  async save(tasks: TaskList): Promise<void> {
    this.storage.setItem(this.key, JSON.stringify(toStoredTasks(tasks)));
  }
}
