import type {
  CompletedTaskRecord,
  CompletionHistory,
} from "../domain/CompletionHistory";
import type { TaskCompleted } from "../domain/TaskCompleted";
import { TaskName } from "../domain/TaskName";

export const DEFAULT_HISTORY_KEY = "todo-react.completions";

/** 保存形式。ドメインモデルとは別物として定義する（StoredTask と同じ考え方）。 */
type StoredCompletion = {
  name: string;
  completedAt: string;
};

type StoredCompletions = {
  version: number;
  completions: StoredCompletion[];
};

const VERSION = 1;

/**
 * 完了の履歴を localStorage に残す実装。
 *
 * TaskCompleted に反応して記録するだけで、タスクの管理そのものには関与しない。
 * 保存先も TaskRepository とは別のキーにしてある。関心事が違うものを
 * 同じ入れ物に入れると、片方の都合がもう片方を縛るため。
 *
 * 読めない内容は空として扱う。履歴が失われても本体の機能は動き続けるべきで、
 * ここで例外を投げてアプリを止める価値はない。
 */
export class LocalStorageCompletionHistory implements CompletionHistory {
  constructor(
    private readonly storage: Storage = localStorage,
    private readonly key: string = DEFAULT_HISTORY_KEY
  ) {}

  async record(event: TaskCompleted): Promise<void> {
    const stored = this.read();

    // 新しいものが先頭に来るように積む
    stored.unshift({
      name: event.taskName.value,
      completedAt: event.occurredAt.toISOString(),
    });

    this.write(stored);
  }

  async recent(limit: number): Promise<readonly CompletedTaskRecord[]> {
    return this.read()
      .slice(0, limit)
      .flatMap((completion) => {
        try {
          return [
            {
              taskName: TaskName.of(completion.name),
              completedAt: new Date(completion.completedAt),
            },
          ];
        } catch {
          // 読めない記録は無かったことにする。履歴は本体の機能ではない。
          return [];
        }
      });
  }

  private read(): StoredCompletion[] {
    const stored = this.storage.getItem(this.key);

    if (stored === null) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(stored);

      if (!isStoredCompletions(parsed) || parsed.version !== VERSION) {
        return [];
      }

      return parsed.completions;
    } catch {
      return [];
    }
  }

  private write(completions: StoredCompletion[]): void {
    const payload: StoredCompletions = { version: VERSION, completions };

    this.storage.setItem(this.key, JSON.stringify(payload));
  }
}

function isStoredCompletions(value: unknown): value is StoredCompletions {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.completions) &&
    candidate.completions.every(isStoredCompletion)
  );
}

function isStoredCompletion(value: unknown): value is StoredCompletion {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === "string" &&
    typeof candidate.completedAt === "string"
  );
}
