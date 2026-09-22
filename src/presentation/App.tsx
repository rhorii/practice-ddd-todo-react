import { useState, useRef, useEffect } from "react";
import Form from "./Form";
import FilterButton from "./FilterButton";
import TaskItem from "./TaskItem";
import {
  taskFilterNames,
  type TaskFilterName,
} from "../application/taskFilterNames";
import type { TaskListView } from "../application/TaskListView";
import { useTaskUseCases } from "./TaskUseCasesContext";
import { useTasks } from "./useTasks";

// 選べるフィルタはドメインが持つ取り決めで、差し替える対象ではないため
// Context を通さずそのまま参照する。
const FILTER_NAMES = taskFilterNames();

function usePrevious<T>(value: T): T | null {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/**
 * タスク一覧の画面。
 *
 * 判断もルールも持たない。一覧の保持と操作は useTasks に、表示する内容の
 * 組み立ては BuildTaskListView に任せ、ここに残るのは描画と、
 * 画面固有の関心事（選択中のフィルタ、削除後のフォーカス移動）だけ。
 */
function App() {
  const { tasks, addTask, deleteTask, renameTask, toggleTaskCompletion } =
    useTasks();
  const { buildTaskListView } = useTaskUseCases();

  const [filter, setFilter] = useState<TaskFilterName>("All");

  const view: TaskListView = buildTaskListView(tasks, filter);

  const visibleTaskItems = view.visibleTasks.map((task) => (
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
