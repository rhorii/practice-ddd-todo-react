import { ListTaskFilters } from "./ListTaskFilters";

describe("ListTaskFilters", () => {
  it("選べるフィルタ名を並び順どおりに返す", () => {
    expect(new ListTaskFilters().execute()).toEqual([
      "All",
      "Active",
      "Completed",
    ]);
  });
});
