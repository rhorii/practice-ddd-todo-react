import { render, screen } from "@testing-library/react";

// テスト基盤そのものが動くことを確認する疎通テスト。
// JSX の変換・jsdom 環境・@testing-library/react・jest-dom のマッチャが
// すべて噛み合っていることをここで保証する。
// アプリの実際の振る舞いを固定する特性テストは T0-2 で追加する。
describe("テスト基盤", () => {
  it("React コンポーネントをレンダリングして DOM を検証できる", () => {
    render(<h1>TodoMatic</h1>);

    expect(
      screen.getByRole("heading", { name: "TodoMatic" })
    ).toBeInTheDocument();
  });
});
