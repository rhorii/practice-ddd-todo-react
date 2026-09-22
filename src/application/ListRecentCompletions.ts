import type { CompletionHistory } from "../domain/CompletionHistory";
import type { CompletedTaskDto } from "./CompletedTaskDto";

/** 画面に出す件数。増やしたくなったら引数にする。 */
const RECENT_LIMIT = 3;

/**
 * 最近完了した Task を新しい順に返すユースケース。
 *
 * タスク一覧とは別の入れ物（CompletionHistory）を読む。
 * ドメインイベントに反応して溜まった記録の、読み出し側にあたる。
 */
export class ListRecentCompletions {
  constructor(private readonly history: CompletionHistory) {}

  async execute(): Promise<CompletedTaskDto[]> {
    const records = await this.history.recent(RECENT_LIMIT);

    return records.map((record) => ({
      name: record.taskName.value,
      completedAt: record.completedAt.toISOString(),
    }));
  }
}
