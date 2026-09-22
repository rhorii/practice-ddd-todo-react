import { NanoidTaskIdGenerator } from "./NanoidTaskIdGenerator";

describe("NanoidTaskIdGenerator", () => {
  it("task- で始まる TaskId を発行する", () => {
    const generator = new NanoidTaskIdGenerator();

    expect(generator.generate().value).toMatch(/^task-.+/);
  });

  it("呼ぶたびに異なる TaskId を発行する", () => {
    const generator = new NanoidTaskIdGenerator();

    const ids = new Set(
      Array.from({ length: 100 }, () => generator.generate().value)
    );

    expect(ids.size).toBe(100);
  });
});
