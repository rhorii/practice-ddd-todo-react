// toBeInTheDocument などの DOM 向けマッチャを expect に追加する
import "@testing-library/jest-dom/vitest";
// 各テストの後にレンダリング結果を破棄し、テスト間の状態の漏れを防ぐ
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// Vitest の jsdom 環境は localStorage をグローバルへ展開しない。
// jsdom では Window の prototype に定義されているうえ、Node 自身が未初期化の
// localStorage を持つため、グローバルの複製対象から外れてしまう。
// ブラウザと同じように扱えるよう、メモリ上の Storage を用意する。
if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
}

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    key(index: number): string | null {
      return [...entries.keys()][index] ?? null;
    },
    getItem(key: string): string | null {
      return entries.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      entries.set(key, String(value));
    },
    removeItem(key: string): void {
      entries.delete(key);
    },
    clear(): void {
      entries.clear();
    },
  };
}
