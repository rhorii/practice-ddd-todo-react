import { useState, useRef, useEffect } from "react";
import Form from "./Form";
import FilterButton from "./FilterButton";
import TaskItem from "./TaskItem";
import { InvalidTaskNameError } from "../application/InvalidTaskNameError";
import type { TaskFilterName } from "../application/taskFilterNames";
import type { TaskDto } from "../application/TaskDto";
import type { TaskListView } from "../application/TaskListView";

// タスク一覧に対する操作はすべて外から渡される。
// App は「どう変えるか」も「どこに保存されるか」も知らず、
// 操作の結果として返ってきた一覧を描画するだけ。
type AppProps = {
  loadTasks: () => Promise<TaskDto[]>;
  addTask: (name: string) => Promise<TaskDto[]>;
  deleteTask: (id: string) => Promise<TaskDto[]>;
  renameTask: (id: string, newName: string) => Promise<TaskDto[]>;
  toggleTaskCompletion: (id: string) => Promise<TaskDto[]>;
  // 表示に必要な一式の組み立て。保存内容を変えない「見せ方」の操作なので、
  // 画面が既に持っている一覧に対して同期的に適用する。
  buildTaskListView: (
    tasks: readonly TaskDto[],
    filterName: TaskFilterName
  ) => TaskListView;
  filterNames: readonly TaskFilterName[];
};

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

function App(props: AppProps) {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [filter, setFilter] = useState<TaskFilterName>("All");

  const { loadTasks } = props;

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
    setTasks(await props.toggleTaskCompletion(id));
  }

  async function deleteTask(id: string) {
    setTasks(await props.deleteTask(id));
  }

  async function renameTask(id: string, newName: string) {
    await ignoringInvalidName(async () => {
      setTasks(await props.renameTask(id, newName));
    });
  }

  const view: TaskListView = props.buildTaskListView(tasks, filter);

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

  const filterButtons = props.filterNames.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  async function addTask(name: string) {
    await ignoringInvalidName(async () => {
      setTasks(await props.addTask(name));
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
