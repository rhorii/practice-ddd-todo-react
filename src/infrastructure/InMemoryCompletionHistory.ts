import type {
  CompletedTaskRecord,
  CompletionHistory,
} from "../domain/CompletionHistory";
import type { TaskCompleted } from "../domain/TaskCompleted";

/**
 * メモリ上に完了の履歴を保持する実装。
 *
 * TaskRepository に対する InMemoryTaskRepository と同じ位置づけで、
 * テストではこちらを使う。
 */
export class InMemoryCompletionHistory implements CompletionHistory {
  private records: CompletedTaskRecord[] = [];

  async record(event: TaskCompleted): Promise<void> {
    // 新しいものが先頭に来るように積む
    this.records.unshift({
      taskName: event.taskName,
      completedAt: event.occurredAt,
    });
  }

  async recent(limit: number): Promise<readonly CompletedTaskRecord[]> {
    return this.records.slice(0, limit);
  }
}
