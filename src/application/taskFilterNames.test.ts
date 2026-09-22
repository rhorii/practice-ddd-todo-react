import { taskFilterNames } from "./taskFilterNames";

describe("taskFilterNames", () => {
  it("選べるフィルタ名を並び順どおりに返す", () => {
    expect(taskFilterNames()).toEqual(["All", "Active", "Completed"]);
  });
});
