import { Task } from "../domain/Task";
import { TaskId } from "../domain/TaskId";
import { TaskList } from "../domain/TaskList";
import { TaskName } from "../domain/TaskName";

/**
 * 保存形式（永続化モデル）とドメインモデルの変換。
 *
 * localStorage に入れられるのは文字列だけなので、Task をそのまま保存することは
 * できない。保存のための形を infrastructure 層に定義し、ドメインモデルとの
 * 変換をここに閉じ込める。
 *
 * ドメインモデルをそのまま JSON にしないのには理由がある。保存形式は一度書き出すと
 * 後から変えにくい（既に保存済みのデータが世の中に残る）のに対し、ドメインモデルは
 * 理解が深まるたびに変えたい。両者を別の型にしておけば、片方の都合がもう片方を
 * 縛らずに済む。version を持たせているのも、将来ドメインモデルが変わったときに
 * 保存形式の移行を別途扱えるようにするため。
 */

export const STORED_TASKS_VERSION = 1;

export type StoredTask = {
  id: string;
  name: string;
  completed: boolean;
};

export type StoredTasks = {
  version: number;
  tasks: StoredTask[];
};

export function toStoredTasks(tasks: TaskList): StoredTasks {
  return {
    version: STORED_TASKS_VERSION,
    tasks: tasks.toArray().map((task) => ({
      id: task.id.value,
      name: task.name.value,
      completed: task.isCompleted,
    })),
  };
}

/**
 * 保存されていた内容から TaskList を復元する。
 *
 * 保存先の中身は外の世界のものであり、こちらが書いたとおりだとは限らない。
 * 読めない形であれば例外を投げ、どう扱うかは呼び出し側に委ねる。
 */
export function toTaskList(parsed: unknown): TaskList {
  if (!isStoredTasks(parsed)) {
    throw new Error("保存されている内容を読み取れません");
  }

  if (parsed.version !== STORED_TASKS_VERSION) {
    throw new Error(`未対応の保存形式です: version ${parsed.version}`);
  }

  return TaskList.of(
    parsed.tasks.map((stored) =>
      Task.reconstruct(
        TaskId.of(stored.id),
        TaskName.of(stored.name),
        stored.completed
      )
    )
  );
}

function isStoredTasks(value: unknown): value is StoredTasks {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.tasks) &&
    candidate.tasks.every(isStoredTask)
  );
}

function isStoredTask(value: unknown): value is StoredTask {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.completed === "boolean"
  );
}
