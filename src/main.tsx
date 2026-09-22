import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './presentation/App'
import { AddTask } from './application/AddTask'
import { CountRemainingTasks } from './application/CountRemainingTasks'
import { DeleteTask } from './application/DeleteTask'
import { taskFilterNames } from './application/taskFilterNames'
import { FilterTasks } from './application/FilterTasks'
import { LoadTasks } from './application/LoadTasks'
import { RenameTask } from './application/RenameTask'
import { toTaskList } from './application/TaskMapper'
import type { TaskRepository } from './domain/TaskRepository'
import { ToggleTaskCompletion } from './application/ToggleTaskCompletion'
import { LocalStorageTaskRepository } from './infrastructure/LocalStorageTaskRepository'
import { NanoidTaskIdGenerator } from './infrastructure/NanoidTaskIdGenerator'
import './index.css'

const INITIAL_TASKS = [
  { id: "task-0", name: "Eat", completed: true },
  { id: "task-1", name: "Sleep", completed: false },
  { id: "task-2", name: "Repeat", completed: false },
];

// composition root: 各層の実装をここで組み立てる。
// 状態の置き場所はリポジトリであり、初期データもリポジトリに与える。
//
// 保存先を LocalStorageTaskRepository に差し替えても、domain 層と application 層は
// 一行も変わらない。これが層を分けたことの見返りになる。
const taskRepository = new LocalStorageTaskRepository();

/** 保存されている内容が空のときだけ、見本のタスクを入れる。 */
async function seedInitialTasks(repository: TaskRepository): Promise<void> {
  if ((await repository.load()).isEmpty) {
    await repository.save(toTaskList(INITIAL_TASKS));
  }
}

const loadTasks = new LoadTasks(taskRepository);
const addTask = new AddTask(taskRepository, new NanoidTaskIdGenerator());
const deleteTask = new DeleteTask(taskRepository);
const renameTask = new RenameTask(taskRepository);
const toggleTaskCompletion = new ToggleTaskCompletion(taskRepository);
const countRemainingTasks = new CountRemainingTasks();
const filterTasks = new FilterTasks();
const filterNames = taskFilterNames();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element #root not found");
}

void seedInitialTasks(taskRepository).then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App
        loadTasks={() => loadTasks.execute()}
        addTask={(name) => addTask.execute(name)}
        deleteTask={(id) => deleteTask.execute(id)}
        renameTask={(id, newName) => renameTask.execute(id, newName)}
        toggleTaskCompletion={(id) => toggleTaskCompletion.execute(id)}
        countRemainingTasks={(tasks) => countRemainingTasks.execute(tasks)}
        filterTasks={(tasks, filterName) => filterTasks.execute(tasks, filterName)}
        filterNames={filterNames}
      />
    </React.StrictMode>,
  )
});
