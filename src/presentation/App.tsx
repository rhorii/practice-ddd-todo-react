import { useState, useRef, useEffect } from "react";
import Form from "./Form";
import FilterButton from "./FilterButton";
import TaskItem from "./TaskItem";
import { InvalidTaskNameError } from "../application/InvalidTaskNameError";
import type { TaskDto } from "../application/TaskDto";

type AppProps = {
  tasks: TaskDto[];
  // 新しい Task を作る手段は外から渡される。App は TaskId の作り方を知らない。
  createTask: (name: string) => TaskDto;
  // 名前の変更も同じく外から渡される。妥当な名前かどうかを App は判断しない。
  renameTask: (task: TaskDto, newName: string) => TaskDto;
  // 完了状態をどう切り替えるかも App は決めない。
  toggleTaskCompletion: (task: TaskDto) => TaskDto;
};

/**
 * 不正な名前が入力されたときは、その操作を行わない。
 *
 * T4-3 でユーザーにエラーメッセージを表示する。それまでは入力を無視するに留める。
 * 不変条件違反以外の例外は握りつぶさず、そのまま投げ直す。
 */
function ignoringInvalidName(operation: () => void): void {
  try {
    operation();
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

const FILTER_MAP = {
  All: () => true,
  Active: (task: TaskDto) => !task.completed,
  Completed: (task: TaskDto) => task.completed,
};

type FilterName = keyof typeof FILTER_MAP;

// Object.keys は string[] を返すため、ここだけはキー名の型を補う必要がある
const FILTER_NAMES = Object.keys(FILTER_MAP) as FilterName[];

function App(props: AppProps) {
  const [tasks, setTasks] = useState(props.tasks);
  const [filter, setFilter] = useState<FilterName>("All");

  function toggleTaskCompletion(id: string) {
    setTasks(
      tasks.map((task) =>
        id === task.id ? props.toggleTaskCompletion(task) : task
      )
    );
  }

  function deleteTask(id: string) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  function renameTask(id: string, newName: string) {
    ignoringInvalidName(() => {
      const renamedTasks = tasks.map((task) =>
        id === task.id ? props.renameTask(task, newName) : task
      );
      setTasks(renamedTasks);
    });
  }

  const visibleTaskItems = tasks
    ?.filter(FILTER_MAP[filter])
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

  function addTask(name: string) {
    ignoringInvalidName(() => {
      setTasks([...tasks, props.createTask(name)]);
    });
  }

  // remaining は「未完了の Task の件数」を指す。フィルタの選択状態とは無関係。
  // docs/ubiquitous-language.md を参照。
  const remainingCount = tasks.filter((task) => !task.completed).length;
  const tasksNoun = remainingCount !== 1 ? "tasks" : "task";
  const headingText = `${remainingCount} ${tasksNoun} remaining`;

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
