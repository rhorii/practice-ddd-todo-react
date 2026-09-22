import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './presentation/App'
import { TaskUseCasesContext } from './presentation/TaskUseCasesContext'
import { createTaskUseCases } from './application/TaskUseCases'
import { toTaskList } from './application/TaskMapper'
import type { TaskRepository } from './domain/TaskRepository'
import { LocalStorageTaskRepository } from './infrastructure/LocalStorageTaskRepository'
import { NanoidTaskIdGenerator } from './infrastructure/NanoidTaskIdGenerator'
import './index.css'

const INITIAL_TASKS = [
  { id: "task-0", name: "Eat", completed: true },
  { id: "task-1", name: "Sleep", completed: false },
  { id: "task-2", name: "Repeat", completed: false },
];

// composition root: 各層の実装をここで組み立てる。
// この場所だけが「保存先はどれか」「ID をどう発行するか」を知っている。
const taskRepository = new LocalStorageTaskRepository();
const taskUseCases = createTaskUseCases(
  taskRepository,
  new NanoidTaskIdGenerator()
);

/** 保存されている内容が空のときだけ、見本のタスクを入れる。 */
async function seedInitialTasks(repository: TaskRepository): Promise<void> {
  if ((await repository.load()).isEmpty) {
    await repository.save(toTaskList(INITIAL_TASKS));
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element #root not found");
}

void seedInitialTasks(taskRepository).then(() => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <TaskUseCasesContext.Provider value={taskUseCases}>
        <App />
      </TaskUseCasesContext.Provider>
    </React.StrictMode>,
  )
});
