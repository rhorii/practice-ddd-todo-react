import { useState, useRef, useEffect } from "react";
import Form from "./Form";
import FilterButton from "./FilterButton";
import TaskItem from "./TaskItem";
import { InvalidTaskNameError } from "../application/InvalidTaskNameError";
import type { TaskDto } from "../application/TaskDto";

// タスク一覧に対する操作はすべて外から渡される。
// App は「どう変えるか」を一切知らず、変更後の一覧を受け取って描画するだけ。
type AppProps = {
  tasks: TaskDto[];
  addTask: (tasks: readonly TaskDto[], name: string) => TaskDto[];
  deleteTask: (tasks: readonly TaskDto[], id: string) => TaskDto[];
  renameTask: (
    tasks: readonly TaskDto[],
    id: string,
    newName: string
  ) => TaskDto[];
  toggleTaskCompletion: (tasks: readonly TaskDto[], id: string) => TaskDto[];
  countRemainingTasks: (tasks: readonly TaskDto[]) => number;
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
    setTasks(props.toggleTaskCompletion(tasks, id));
  }

  function deleteTask(id: string) {
    setTasks(props.deleteTask(tasks, id));
  }

  function renameTask(id: string, newName: string) {
    ignoringInvalidName(() => {
      setTasks(props.renameTask(tasks, id, newName));
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
      setTasks(props.addTask(tasks, name));
    });
  }

  // remaining が何を指すかは docs/ubiquitous-language.md にあるドメインの取り決め。
  // 数え方そのものは TaskList が知っており、App は結果を表示するだけ。
  const remainingCount = props.countRemainingTasks(tasks);
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
