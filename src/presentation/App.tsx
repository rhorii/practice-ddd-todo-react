import { useState, useRef, useEffect } from "react";
import Form from "./Form";
import FilterButton from "./FilterButton";
import TaskItem from "./TaskItem";
import { InvalidTaskNameError } from "../application/InvalidTaskNameError";
import {
  taskFilterNames,
  type TaskFilterName,
} from "../application/taskFilterNames";
import type { TaskDto } from "../application/TaskDto";
import type { TaskListView } from "../application/TaskListView";
import { useTaskUseCases } from "./TaskUseCasesContext";

// 選べるフィルタはドメインが持つ取り決めで、差し替える対象ではないため
// Context を通さずそのまま参照する。
const FILTER_NAMES = taskFilterNames();

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

function usePrevious<T>(value: T): T | null {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function App() {
  // タスクに対する操作はすべて Context から受け取る。
  // App は「どう変えるか」も「どこに保存されるか」も知らず、
  // 操作の結果として返ってきた一覧を描画するだけ。
  const useCases = useTaskUseCases();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [filter, setFilter] = useState<TaskFilterName>("All");

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

  async function toggleTaskCompletion(id: string) {
    setTasks(await useCases.toggleTaskCompletion(id));
  }

  async function deleteTask(id: string) {
    setTasks(await useCases.deleteTask(id));
  }

  async function renameTask(id: string, newName: string) {
    await ignoringInvalidName(async () => {
      setTasks(await useCases.renameTask(id, newName));
    });
  }

  const view: TaskListView = useCases.buildTaskListView(tasks, filter);

  const visibleTaskItems = view.visibleTasks
    .map((task) => (
      <TaskItem
        id={task.id}
        name={task.name}
        completed={task.completed}
        key={task.id}
        toggleTaskCompletion={toggleTaskCompletion}
        deleteTask={deleteTask}
        renameTask={renameTask}
      />
    ));

  const filterButtons = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  async function addTask(name: string) {
    await ignoringInvalidName(async () => {
      setTasks(await useCases.addTask(name));
    });
  }

  // remaining が何を指すかは docs/ubiquitous-language.md にあるドメインの取り決め。
  // 数え方そのものは TaskList が知っており、App は結果を表示するだけ。
  const tasksNoun = view.remainingCount !== 1 ? "tasks" : "task";
  const headingText = `${view.remainingCount} ${tasksNoun} remaining`;

  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const prevTaskLength = usePrevious(tasks.length);

  useEffect(() => {
    if (prevTaskLength !== null && tasks.length < prevTaskLength) {
      listHeadingRef.current?.focus();
    }
  }, [tasks.length, prevTaskLength]);

  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask} />
      <div className="filters btn-group stack-exception">{filterButtons}</div>
      <h2 id="list-heading" tabIndex={-1} ref={listHeadingRef}>
        {headingText}
      </h2>
      <ul
        aria-labelledby="list-heading"
        className="todo-list stack-large stack-exception"
        role="list"
      >
        {visibleTaskItems}
      </ul>
    </div>
  );
}

export default App;
