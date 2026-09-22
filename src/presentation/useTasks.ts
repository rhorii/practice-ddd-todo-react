import { useCallback, useEffect, useState } from "react";
import { InvalidTaskNameError } from "../application/InvalidTaskNameError";
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
export type Tasks = {
  tasks: TaskDto[];
  addTask: (name: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  renameTask: (id: string, newName: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
};

export function useTasks(): Tasks {
  const useCases = useTaskUseCases();
  const [tasks, setTasks] = useState<TaskDto[]>([]);

  const { loadTasks } = useCases;

  // 保存されている一覧を最初に読み出す。以降の一覧は各操作の戻り値として得られる。
  useEffect(() => {
    let abandoned = false;

    void loadTasks().then((loaded) => {
      if (!abandoned) {
        setTasks(loaded);
      }
    });

    return () => {
      abandoned = true;
    };
  }, [loadTasks]);

  const addTask = useCallback(
    async (name: string) => {
      await ignoringInvalidName(async () => {
        setTasks(await useCases.addTask(name));
      });
    },
    [useCases]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks(await useCases.deleteTask(id));
    },
    [useCases]
  );

  const renameTask = useCallback(
    async (id: string, newName: string) => {
      await ignoringInvalidName(async () => {
        setTasks(await useCases.renameTask(id, newName));
      });
    },
    [useCases]
  );

  const toggleTaskCompletion = useCallback(
    async (id: string) => {
      setTasks(await useCases.toggleTaskCompletion(id));
    },
    [useCases]
  );

  return { tasks, addTask, deleteTask, renameTask, toggleTaskCompletion };
}

/**
 * 不正な名前が入力されたときは、その操作を行わない。
 *
 * T4-3 でユーザーにエラーメッセージを表示する。それまでは入力を無視するに留める。
 * 不変条件違反以外の例外は握りつぶさず、そのまま投げ直す。
 */
async function ignoringInvalidName(
  operation: () => Promise<void>
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    if (!(error instanceof InvalidTaskNameError)) {
      throw error;
    }
  }
}
