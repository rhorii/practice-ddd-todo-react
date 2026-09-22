import { createContext, useContext } from "react";
import type { TaskUseCases } from "../application/TaskUseCases";

/**
 * ユースケースをコンポーネントツリーに流し込むための Context。
 *
 * これが無いと、ユースケースを1つ足すたびに App の props と、
 * 組み立てを書いているすべての場所（本番と各テスト）を直すことになる。
 *
 * 既定値を持たせず、Provider の外で使ったら気づけるようにしている。
 * 「たまたま何も起きない」より「すぐ壊れる」ほうが原因を追いやすい。
 */
export const TaskUseCasesContext = createContext<TaskUseCases | null>(null);

export function useTaskUseCases(): TaskUseCases {
  const useCases = useContext(TaskUseCasesContext);

  if (useCases === null) {
    throw new Error(
      "ユースケースが渡されていません。TaskUseCasesContext.Provider の中で使ってください。"
    );
  }

  return useCases;
}
