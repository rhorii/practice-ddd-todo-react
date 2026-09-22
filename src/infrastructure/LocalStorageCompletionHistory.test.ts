import { TaskCompleted } from "../domain/TaskCompleted";
import { TaskId } from "../domain/TaskId";
import { TaskName } from "../domain/TaskName";
import {
  DEFAULT_HISTORY_KEY,
  LocalStorageCompletionHistory,
} from "./LocalStorageCompletionHistory";

beforeEach(() => {
  localStorage.clear();
});

const completed = (name: string) =>
  new TaskCompleted(TaskId.of(`task-${name}`), TaskName.of(name));

describe("LocalStorageCompletionHistory", () => {
  it("何も記録していなければ空を返す", async () => {
    expect(await new LocalStorageCompletionHistory().recent(3)).toEqual([]);
  });

  it("記録した完了を読み出せる", async () => {
    const history = new LocalStorageCompletionHistory();

    await history.record(completed("Eat"));

    expect((await history.recent(3))[0]?.taskName.value).toBe("Eat");
  });

  it("新しい順に返す", async () => {
    const history = new LocalStorageCompletionHistory();

    await history.record(completed("Eat"));
    await history.record(completed("Sleep"));

    expect((await history.recent(3)).map((r) => r.taskName.value)).toEqual([
      "Sleep",
      "Eat",
    ]);
  });

  it("指定した件数までしか返さない", async () => {
    const history = new LocalStorageCompletionHistory();

    await history.record(completed("Eat"));
    await history.record(completed("Sleep"));
    await history.record(completed("Repeat"));

    expect(await history.recent(2)).toHaveLength(2);
  });

  it("完了した時刻を保つ", async () => {
    const history = new LocalStorageCompletionHistory();
    const event = completed("Eat");

    await history.record(event);

    expect((await history.recent(1))[0]?.completedAt.toISOString()).toBe(
      event.occurredAt.toISOString()
    );
  });

  it("別のインスタンスからも読み出せる", async () => {
    await new LocalStorageCompletionHistory().record(completed("Eat"));

    expect(await new LocalStorageCompletionHistory().recent(3)).toHaveLength(1);
  });

  it("タスク本体とは別のキーに保存する", async () => {
    await new LocalStorageCompletionHistory().record(completed("Eat"));

    expect(localStorage.getItem(DEFAULT_HISTORY_KEY)).not.toBeNull();
    expect(localStorage.getItem("todo-react.tasks")).toBeNull();
  });

  // 履歴は本体の機能ではないので、読めなくてもアプリを止めない。
  describe("読めない内容", () => {
    const loadFrom = (stored: string) => {
      localStorage.setItem(DEFAULT_HISTORY_KEY, stored);

      return new LocalStorageCompletionHistory().recent(3);
    };

    it("JSON として壊れていれば空を返す", async () => {
      expect(await loadFrom("{ not json")).toEqual([]);
    });

    it("未対応のバージョンであれば空を返す", async () => {
      expect(await loadFrom('{"version": 99, "completions": []}')).toEqual([]);
    });

    it("読めない記録だけを取り除く", async () => {
      const mixed =
        '{"version": 1, "completions": [{"name":"","completedAt":"2026-01-01T00:00:00.000Z"},{"name":"Eat","completedAt":"2026-01-01T00:00:00.000Z"}]}';

      expect((await loadFrom(mixed)).map((r) => r.taskName.value)).toEqual([
        "Eat",
      ]);
    });
  });
});
