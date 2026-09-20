import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './presentation/App'
import { AddTask } from './application/AddTask'
import { CountRemainingTasks } from './application/CountRemainingTasks'
import { DeleteTask } from './application/DeleteTask'
import { ListTaskFilters } from './application/ListTaskFilters'
import { ListTasks } from './application/ListTasks'
import { LoadTasks } from './application/LoadTasks'
import { RenameTask } from './application/RenameTask'
import { toTaskList } from './application/TaskMapper'
import { ToggleTaskCompletion } from './application/ToggleTaskCompletion'
import { InMemoryTaskRepository } from './infrastructure/InMemoryTaskRepository'
import { NanoidTaskIdGenerator } from './infrastructure/NanoidTaskIdGenerator'
import './index.css'

const INITIAL_TASKS = [
  { id: "task-0", name: "Eat", completed: true },
  { id: "task-1", name: "Sleep", completed: false },
  { id: "task-2", name: "Repeat", completed: false },
];

// composition root: 各層の実装をここで組み立てる。
// 状態の置き場所はリポジトリであり、初期データもリポジトリに与える。
const taskRepository = new InMemoryTaskRepository(toTaskList(INITIAL_TASKS));

const loadTasks = new LoadTasks(taskRepository);
const addTask = new AddTask(taskRepository, new NanoidTaskIdGenerator());
const deleteTask = new DeleteTask(taskRepository);
const renameTask = new RenameTask(taskRepository);
const toggleTaskCompletion = new ToggleTaskCompletion(taskRepository);
const countRemainingTasks = new CountRemainingTasks();
const listTasks = new ListTasks();
const filterNames = new ListTaskFilters().execute();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App
      loadTasks={() => loadTasks.execute()}
      addTask={(name) => addTask.execute(name)}
      deleteTask={(id) => deleteTask.execute(id)}
      renameTask={(id, newName) => renameTask.execute(id, newName)}
      toggleTaskCompletion={(id) => toggleTaskCompletion.execute(id)}
      countRemainingTasks={(tasks) => countRemainingTasks.execute(tasks)}
      listTasks={(tasks, filterName) => listTasks.execute(tasks, filterName)}
      filterNames={filterNames}
    />
  </React.StrictMode>,
)
