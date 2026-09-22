import { render, screen } from "@testing-library/react";
import { createTaskUseCases } from "../application/TaskUseCases";
import { InMemoryTaskRepository } from "../infrastructure/InMemoryTaskRepository";
import { InMemoryCompletionHistory } from "../infrastructure/InMemoryCompletionHistory";
import { NanoidTaskIdGenerator } from "../infrastructure/NanoidTaskIdGenerator";
import { TaskUseCasesContext, useTaskUseCases } from "./TaskUseCasesContext";

function ShowsUseCaseAvailability() {
  const useCases = useTaskUseCases();

  return <p>{typeof useCases.addTask}</p>;
}

describe("useTaskUseCases", () => {
  it("Provider の中ではユースケースを取り出せる", () => {
    const useCases = createTaskUseCases(
      new InMemoryTaskRepository(),
      new NanoidTaskIdGenerator(),
      new InMemoryCompletionHistory()
    );

    render(
      <TaskUseCasesContext.Provider value={useCases}>
        <ShowsUseCaseAvailability />
      </TaskUseCasesContext.Provider>
    );

    expect(screen.getByText("function")).toBeInTheDocument();
  });

  // 既定値を持たせていないので、渡し忘れはその場で分かる。
  // 「たまたま何も起きない」より「すぐ壊れる」ほうが原因を追いやすい。
  it("Provider の外で使うとエラーになる", () => {
    // React が投げたエラーをコンソールに出させない
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<ShowsUseCaseAvailability />)).toThrow(
      "ユースケースが渡されていません"
    );

    consoleError.mockRestore();
  });
});
