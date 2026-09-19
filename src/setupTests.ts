// toBeInTheDocument などの DOM 向けマッチャを expect に追加する
import "@testing-library/jest-dom/vitest";
// 各テストの後にレンダリング結果を破棄し、テスト間の状態の漏れを防ぐ
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
