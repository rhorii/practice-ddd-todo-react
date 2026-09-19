import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './presentation/App'
import { CreateTask } from './application/CreateTask'
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
const createTask = new CreateTask(new NanoidTaskIdGenerator());
const renameTask = new RenameTask();
const toggleTaskCompletion = new ToggleTaskCompletion();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App
      tasks={INITIAL_TASKS}
      createTask={(name) => createTask.execute(name)}
      renameTask={(task, newName) => renameTask.execute(task, newName)}
      toggleTaskCompletion={(task) => toggleTaskCompletion.execute(task)}
    />
  </React.StrictMode>,
)
