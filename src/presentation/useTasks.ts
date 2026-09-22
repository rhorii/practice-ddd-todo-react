import { useCallback, useEffect, useState } from "react";
import {
  InvalidTaskNameError,
  type InvalidTaskNameReason,
} from "../application/InvalidTaskNameError";
import type { CompletedTaskDto } from "../application/CompletedTaskDto";
import type { TaskDto } from "../application/TaskDto";
import { useTaskUseCases } from "./TaskUseCasesContext";

/**
 * 画面が扱う Task 一覧と、それに対する操作。
 *
 * 一覧をどう保持し、どの時点で読み直すかは画面の描画とは別の関心事なので、
 * コンポーネントから切り離してここに集める。App はこのフックが返すものを
 * 描くだけでよくなる。
 *
 * 判断はここにも置かない。何をするかはユースケースが、ルールはドメインが持つ。
 * このフックの仕事は、非同期の結果を React の状態に映すことだけ。
 */
/**
 * 名前を伴う操作の結果。
 *
 * 名前が受け付けられないことは異常ではなく、ユーザー入力に対して起こって当然の
 * 結果なので、例外ではなく戻り値で伝える。呼び出し側は accepted を見ないと
 * reason を取り出せないため、失敗の扱いを書き忘れられない。
 */
export type TaskNameResult =
  | { accepted: true }
  | { accepted: false; reason: InvalidTaskNameReason };

export type Tasks = {
  tasks: TaskDto[];
  /** 最近完了した Task。完了のたびに更新される。 */
  recentCompletions: CompletedTaskDto[];
  addTask: (name: string) => Promise<TaskNameResult>;
  deleteTask: (id: string) => Promise<void>;
  renameTask: (id: string, newName: string) => Promise<TaskNameResult>;
  toggleTaskCompletion: (id: string) => Promise<void>;
};

export function useTasks(): Tasks {
  const useCases = useTaskUseCases();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [recentCompletions, setRecentCompletions] = useState<
    CompletedTaskDto[]
  >([]);

  const { loadTasks, listRecentCompletions } = useCases;

  // 保存されている一覧を最初に読み出す。以降の一覧は各操作の戻り値として得られる。
  useEffect(() => {
    let abandoned = false;

    void Promise.all([loadTasks(), listRecentCompletions()]).then(
      ([loaded, completions]) => {
        if (!abandoned) {
          setTasks(loaded);
          setRecentCompletions(completions);
        }
      }
    );

    return () => {
      abandoned = true;
    };
  }, [loadTasks, listRecentCompletions]);

  const addTask = useCallback(
    async (name: string): Promise<TaskNameResult> =>
      reportingInvalidName(async () => {
        setTasks(await useCases.addTask(name));
      }),
    [useCases]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks(await useCases.deleteTask(id));
    },
    [useCases]
  );

  const renameTask = useCallback(
    async (id: string, newName: string): Promise<TaskNameResult> =>
      reportingInvalidName(async () => {
        setTasks(await useCases.renameTask(id, newName));
      }),
    [useCases]
  );

  const toggleTaskCompletion = useCallback(
    async (id: string) => {
      setTasks(await useCases.toggleTaskCompletion(id));
      // 完了すると履歴が増える。記録そのものは ToggleTaskCompletion の中で
      // ドメインイベントに反応して行われるので、ここでは読み直すだけ。
      setRecentCompletions(await useCases.listRecentCompletions());
    },
    [useCases]
  );

  return {
    tasks,
    recentCompletions,
    addTask,
    deleteTask,
    renameTask,
    toggleTaskCompletion,
  };
}

/**
 * 名前の不変条件に反した場合を、例外ではなく結果として返す。
 *
 * 不変条件違反以外の例外は握りつぶさず、そのまま投げ直す。
 * ユーザー入力の不備と、プログラムの不具合を混同しないため。
 */
async function reportingInvalidName(
  operation: () => Promise<void>
): Promise<TaskNameResult> {
  try {
    await operation();

    return { accepted: true };
  } catch (error) {
    if (error instanceof InvalidTaskNameError) {
      return { accepted: false, reason: error.reason };
    }

    throw error;
  }
}
