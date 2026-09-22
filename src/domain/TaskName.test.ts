import { InvalidTaskNameError, TaskName } from "./TaskName";

describe("TaskName", () => {
  describe("空の名前を拒否する", () => {
    it("空文字からは作れない", () => {
      expect(() => TaskName.of("")).toThrow(InvalidTaskNameError);
    });

    it("空白だけの文字列からは作れない", () => {
      expect(() => TaskName.of("   ")).toThrow(InvalidTaskNameError);
    });

    it("タブや改行だけの文字列からは作れない", () => {
      expect(() => TaskName.of("\t\n ")).toThrow(InvalidTaskNameError);
    });

    it("理由として empty を伝える", () => {
      expect(() => TaskName.of("")).toThrow(
        expect.objectContaining({ reason: "empty" })
      );
    });
  });

  describe("長すぎる名前を拒否する", () => {
    it("上限ちょうどの長さは受け付ける", () => {
      const name = "a".repeat(TaskName.MAX_LENGTH);

      expect(TaskName.of(name).value).toBe(name);
    });

    it("上限を1文字でも超えると作れない", () => {
      expect(() => TaskName.of("a".repeat(TaskName.MAX_LENGTH + 1))).toThrow(
        expect.objectContaining({ reason: "tooLong" })
      );
    });

    it("サロゲートペアを1文字として数える", () => {
      // "🍣" は UTF-16 では2単位だが、タスク名としては1文字
      const name = "🍣".repeat(TaskName.MAX_LENGTH);

      expect(TaskName.of(name).value).toBe(name);
    });
  });

  describe("改行を含む名前を拒否する", () => {
    it("途中に改行があると作れない", () => {
      expect(() => TaskName.of("Eat\nSleep")).toThrow(
        expect.objectContaining({ reason: "multiline" })
      );
    });

    it("前後の改行は空白として取り除かれるので受け付ける", () => {
      expect(TaskName.of("\nEat\n").value).toBe("Eat");
    });
  });

  describe("正規化", () => {
    it("前後の空白を取り除いて保持する", () => {
      expect(TaskName.of("  Eat  ").value).toBe("Eat");
    });

    it("途中の空白はそのまま残す", () => {
      expect(TaskName.of("Eat a sandwich").value).toBe("Eat a sandwich");
    });
  });

  describe("等価性", () => {
    it("同じ値なら別インスタンスでも等しい", () => {
      expect(TaskName.of("Eat").equals(TaskName.of("Eat"))).toBe(true);
    });

    it("値が違えば等しくない", () => {
      expect(TaskName.of("Eat").equals(TaskName.of("Sleep"))).toBe(false);
    });

    it("前後の空白の有無は等価性に影響しない", () => {
      expect(TaskName.of(" Eat ").equals(TaskName.of("Eat"))).toBe(true);
    });
  });

  it("文字列として取り出せる", () => {
    expect(String(TaskName.of("Eat"))).toBe("Eat");
  });
});
