import { FilterTasks } from "./FilterTasks";
import type { TaskDto } from "./TaskDto";

const TASKS: TaskDto[] = [
  { id: "task-1", name: "Eat", completed: true },
  { id: "task-2", name: "Sleep", completed: false },
  { id: "task-3", name: "Repeat", completed: false },
];

const filter = (filterName: string) =>
  new FilterTasks().execute(TASKS, filterName);

describe("FilterTasks", () => {
  it("All はすべての Task を返す", () => {
    expect(filter("All").map((task) => task.name)).toEqual([
      "Eat",
      "Sleep",
      "Repeat",
    ]);
  });

  it("Active は未完了の Task だけを返す", () => {
    expect(filter("Active").map((task) => task.name)).toEqual([
      "Sleep",
      "Repeat",
    ]);
  });

  it("Completed は完了した Task だけを返す", () => {
    expect(filter("Completed").map((task) => task.name)).toEqual(["Eat"]);
  });

  it("知らないフィルタ名は受け付けない", () => {
    expect(() => filter("Archived")).toThrow("不明なフィルタです: Archived");
  });

  it("元のリストを書き換えない", () => {
    filter("Completed");

    expect(TASKS).toHaveLength(3);
  });
});
