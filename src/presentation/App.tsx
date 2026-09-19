import { useState, useRef, useEffect } from "react";
import Form from "./Form";
import FilterButton from "./FilterButton";
import TaskItem from "./TaskItem";
import { nanoid } from "nanoid";

// T0-3 時点では App の props が受け取る生のタスクの形をそのまま型にしている。
// T1-4 で Task エンティティに置き換わるまでの足場。
type TaskData = {
  id: string;
  name: string;
  completed: boolean;
};

type AppProps = {
  tasks: TaskData[];
};

function usePrevious<T>(value: T): T | null {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const FILTER_MAP = {
  All: () => true,
  Active: (task: TaskData) => !task.completed,
  Completed: (task: TaskData) => task.completed,
};

type FilterName = keyof typeof FILTER_MAP;

// Object.keys は string[] を返すため、ここだけはキー名の型を補う必要がある
const FILTER_NAMES = Object.keys(FILTER_MAP) as FilterName[];

function App(props: AppProps) {
  const [tasks, setTasks] = useState(props.tasks);
  const [filter, setFilter] = useState<FilterName>("All");

  function toggleTaskCompletion(id: string) {
    const updatedTasks = tasks.map((task) => {
      // if this task has the same ID as the target task
      if (id === task.id) {
        // use object spread to make a new object
        // whose `completed` prop has been inverted
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id: string) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  function renameTask(id: string, newName: string) {
    const renamedTasks = tasks.map((task) => {
      // if this task has the same ID as the target task
      if (id === task.id) {
        // Copy the task and update its name
        return { ...task, name: newName };
      }
      // Return the original task if it's not the renamed task
      return task;
    });
    setTasks(renamedTasks);
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
    const newTask = { id: "task-" + nanoid(), name: name, completed: false };
    setTasks([...tasks, newTask]);
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
