import { InMemoryCompletionHistory } from "../infrastructure/InMemoryCompletionHistory";
import { InMemoryTaskRepository } from "../infrastructure/InMemoryTaskRepository";
import { toTaskList } from "./TaskMapper";
import { ToggleTaskCompletion } from "./ToggleTaskCompletion";

const TASKS = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
];

function setup() {
  const repository = new InMemoryTaskRepository(toTaskList(TASKS));
  const history = new InMemoryCompletionHistory();

  return {
    repository,
    history,
    toggle: new ToggleTaskCompletion(repository, history),
  };
}

describe("ToggleTaskCompletion", () => {
  it("未完了の Task を完了にする", async () => {
    const { toggle } = setup();

    expect((await toggle.execute("task-2"))[1]?.completed).toBe(true);
  });

  it("完了した Task を未完了に戻す", async () => {
    const { toggle } = setup();

    expect((await toggle.execute("task-1"))[0]?.completed).toBe(false);
  });

  it("完了状態以外は変えない", async () => {
    const { toggle } = setup();

    const toggled = (await toggle.execute("task-1"))[0];

    expect(toggled?.id).toBe("task-1");
    expect(toggled?.name).toBe("Eat");
  });

  it("他の Task には影響しない", async () => {
    const { toggle } = setup();

    expect((await toggle.execute("task-1"))[1]?.completed).toBe(false);
  });

  it("2回切り替えると元の状態に戻る", async () => {
    const { toggle } = setup();

    await toggle.execute("task-1");

    expect(await toggle.execute("task-1")).toEqual(TASKS);
  });

  it("切り替えた結果をリポジトリに保存する", async () => {
    const { toggle, repository } = setup();

    await toggle.execute("task-2");

    expect((await repository.load()).countActive()).toBe(0);
  });

  it("存在しない TaskId を指定しても何も起きない", async () => {
    const { toggle } = setup();

    expect(await toggle.execute("task-999")).toEqual(TASKS);
  });

  // 集約が発行した出来事を、反応する相手に配るのはこの層の仕事。
  describe("ドメインイベントの配布", () => {
    it("完了にすると履歴に記録される", async () => {
      const { toggle, history } = setup();

      await toggle.execute("task-2");

      expect(await history.recent(10)).toHaveLength(1);
    });

    it("完了した時点の名前が記録される", async () => {
      const { toggle, history } = setup();

      await toggle.execute("task-2");

      expect((await history.recent(10))[0]?.taskName.value).toBe("Sleep");
    });

    it("未完了に戻しても記録されない", async () => {
      const { toggle, history } = setup();

      await toggle.execute("task-1");

      expect(await history.recent(10)).toHaveLength(0);
    });

    it("存在しない Task を切り替えても記録されない", async () => {
      const { toggle, history } = setup();

      await toggle.execute("task-999");

      expect(await history.recent(10)).toHaveLength(0);
    });
  });
});
