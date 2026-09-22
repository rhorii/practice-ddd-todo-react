import type { TaskCompleted } from "./TaskCompleted";
import type { TaskName } from "./TaskName";

/** 完了した Task の記録。完了した時点の名前を保持する。 */
export type CompletedTaskRecord = {
  taskName: TaskName;
  completedAt: Date;
};

/**
 * 完了した Task の履歴。
 *
 * TaskCompleted に反応して記録を残し、後から新しい順に取り出せる。
 * タスクの管理そのものとは別の関心事なので、TaskRepository とは別の入れ物にする。
 *
 * 「どこに記録するか」は技術的詳細なので、domain 層には要求だけを置く。
 */
export interface CompletionHistory {
  record(event: TaskCompleted): Promise<void>;

  /** 新しい順に最大 limit 件を返す。 */
  recent(limit: number): Promise<readonly CompletedTaskRecord[]>;
}
