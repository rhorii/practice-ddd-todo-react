import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './presentation/App'
import { AddTask } from './application/AddTask'
import { CountRemainingTasks } from './application/CountRemainingTasks'
import { DeleteTask } from './application/DeleteTask'
import { ListTaskFilters } from './application/ListTaskFilters'
import { ListTasks } from './application/ListTasks'
import { RenameTask } from './application/RenameTask'
import { ToggleTaskCompletion } from './application/ToggleTaskCompletion'
import { NanoidTaskIdGenerator } from './infrastructure/NanoidTaskIdGenerator'
import './index.css'

const INITIAL_TASKS = [
  { id: "task-0", name: "Eat", completed: true },
  { id: "task-1", name: "Sleep", completed: false },
  { id: "task-2", name: "Repeat", completed: false },
];

// composition root: 各層の実装をここで組み立てる
const addTask = new AddTask(new NanoidTaskIdGenerator());
const deleteTask = new DeleteTask();
const renameTask = new RenameTask();
const toggleTaskCompletion = new ToggleTaskCompletion();
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
      tasks={INITIAL_TASKS}
      addTask={(tasks, name) => addTask.execute(tasks, name)}
      deleteTask={(tasks, id) => deleteTask.execute(tasks, id)}
      renameTask={(tasks, id, newName) => renameTask.execute(tasks, id, newName)}
      toggleTaskCompletion={(tasks, id) => toggleTaskCompletion.execute(tasks, id)}
      countRemainingTasks={(tasks) => countRemainingTasks.execute(tasks)}
      listTasks={(tasks, filterName) => listTasks.execute(tasks, filterName)}
      filterNames={filterNames}
    />
  </React.StrictMode>,
)
