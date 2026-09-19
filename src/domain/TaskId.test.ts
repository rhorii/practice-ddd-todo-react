import { TaskId } from "./TaskId";

describe("TaskId", () => {
  describe("不変条件", () => {
    it("空文字からは作れない", () => {
      expect(() => TaskId.of("")).toThrow("TaskId は空にできません");
    });

    it("空白だけの文字列からは作れない", () => {
      expect(() => TaskId.of("   ")).toThrow("TaskId は空にできません");
    });

    it("前後の空白を取り除いて保持する", () => {
      expect(TaskId.of("  task-1  ").value).toBe("task-1");
    });
  });

  describe("等価性", () => {
    it("同じ値なら別インスタンスでも等しい", () => {
      expect(TaskId.of("task-1").equals(TaskId.of("task-1"))).toBe(true);
    });

    it("値が違えば等しくない", () => {
      expect(TaskId.of("task-1").equals(TaskId.of("task-2"))).toBe(false);
    });

    it("空白の有無は等価性に影響しない", () => {
      expect(TaskId.of(" task-1 ").equals(TaskId.of("task-1"))).toBe(true);
    });
  });

  it("文字列として取り出せる", () => {
    expect(String(TaskId.of("task-1"))).toBe("task-1");
  });
});
