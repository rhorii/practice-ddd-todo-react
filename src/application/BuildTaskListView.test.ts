import { BuildTaskListView } from "./BuildTaskListView";
import { CountRemainingTasks } from "./CountRemainingTasks";
import { FilterTasks } from "./FilterTasks";
import type { TaskDto } from "./TaskDto";

const TASKS: TaskDto[] = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
  { id: "task-3", name: "Repeat", completed: false },
];

const buildView = (filterName: string) =>
  new BuildTaskListView(new FilterTasks(), new CountRemainingTasks()).execute(
    TASKS,
    filterName
  );

describe("BuildTaskListView", () => {
  describe("表示する Task", () => {
    it("All はすべてを並べる", () => {
      expect(buildView("All").visibleTasks.map((task) => task.name)).toEqual([
        "Eat",
        "Sleep",
        "Repeat",
      ]);
    });

    it("Active は未完了だけを並べる", () => {
      expect(buildView("Active").visibleTasks.map((task) => task.name)).toEqual([
        "Sleep",
        "Repeat",
      ]);
    });

    it("Completed は完了したものだけを並べる", () => {
      expect(
        buildView("Completed").visibleTasks.map((task) => task.name)
      ).toEqual(["Eat"]);
    });
  });

  describe("remaining の件数", () => {
    it("未完了の件数を返す", () => {
      expect(buildView("All").remainingCount).toBe(2);
    });

    // 絞り込みと件数が別の関心事であることを、ここで固定しておく
    it("フィルタを変えても件数は変わらない", () => {
      expect(buildView("Completed").remainingCount).toBe(2);
      expect(buildView("Active").remainingCount).toBe(2);
    });
  });

  it("知らないフィルタ名は受け付けない", () => {
    expect(() => buildView("Archived")).toThrow("不明なフィルタです: Archived");
  });
});
