import type { CompletionHistory } from "../domain/CompletionHistory";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";
import type { TaskRepository } from "../domain/TaskRepository";
import { AddTask } from "./AddTask";
import { BuildTaskListView } from "./BuildTaskListView";
import { CountRemainingTasks } from "./CountRemainingTasks";
import { DeleteTask } from "./DeleteTask";
import { FilterTasks } from "./FilterTasks";
import { ListRecentCompletions } from "./ListRecentCompletions";
import { LoadTasks } from "./LoadTasks";
import { RenameTask } from "./RenameTask";
import type { CompletedTaskDto } from "./CompletedTaskDto";
import type { TaskDto } from "./TaskDto";
import type { TaskListView } from "./TaskListView";
import { ToggleTaskCompletion } from "./ToggleTaskCompletion";

/**
 * presentation 層に公開するユースケースの一式。
 *
 * UI が呼べる操作をひとつの型にまとめる。UI から見える形を関数の集まりに
 * しているのは、クラスのインスタンスをそのまま渡すと UI が execute という
 * 呼び出し規約に縛られるため。ここで一段挟むことで、ユースケースの実装形態を
 * 変えても UI は影響を受けない。
 */
export type TaskUseCases = {
  loadTasks: () => Promise<TaskDto[]>;
  addTask: (name: string) => Promise<TaskDto[]>;
  deleteTask: (id: string) => Promise<TaskDto[]>;
  renameTask: (id: string, newName: string) => Promise<TaskDto[]>;
  toggleTaskCompletion: (id: string) => Promise<TaskDto[]>;
  buildTaskListView: (
    tasks: readonly TaskDto[],
    filterName: string
  ) => TaskListView;
  listRecentCompletions: () => Promise<CompletedTaskDto[]>;
};

/**
 * ユースケースを組み立てる。
 *
 * どんなユースケースがあり、それぞれが何を必要とするかを知っているのはこの層。
 * 一方で「保存先はどれか」「ID をどう発行するか」の選択は引数として外に委ねる。
 * そのため本番もテストも同じ組み立てを使いつつ、差し替えたい部分だけを変えられる。
 */
export function createTaskUseCases(
  tasks: TaskRepository,
  taskIdGenerator: TaskIdGenerator,
  history: CompletionHistory
): TaskUseCases {
  const loadTasks = new LoadTasks(tasks);
  const addTask = new AddTask(tasks, taskIdGenerator);
  const deleteTask = new DeleteTask(tasks);
  const renameTask = new RenameTask(tasks);
  const toggleTaskCompletion = new ToggleTaskCompletion(tasks, history);
  const listRecentCompletions = new ListRecentCompletions(history);
  const buildTaskListView = new BuildTaskListView(
    new FilterTasks(),
    new CountRemainingTasks()
  );

  return {
    loadTasks: () => loadTasks.execute(),
    addTask: (name) => addTask.execute(name),
    deleteTask: (id) => deleteTask.execute(id),
    renameTask: (id, newName) => renameTask.execute(id, newName),
    toggleTaskCompletion: (id) => toggleTaskCompletion.execute(id),
    buildTaskListView: (currentTasks, filterName) =>
      buildTaskListView.execute(currentTasks, filterName),
    listRecentCompletions: () => listRecentCompletions.execute(),
  };
}
