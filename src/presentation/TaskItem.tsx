import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { InvalidTaskNameReason } from "../application/InvalidTaskNameError";
import type { TaskDto } from "../application/TaskDto";
import { taskNameErrorMessage } from "./taskNameErrorMessage";

// Task そのものを受け取る。項目を分解して渡すと、表示する内容が増えるたびに
// props も増えてしまう。
type TaskItemProps = {
  task: TaskDto;
  // 操作はいずれも保存を伴うため完了を待てる形にしておく。
  toggleTaskCompletion: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // 名前が受け付けられなければ、その理由が返る。
  renameTask: (
    id: string,
    newName: string
  ) => Promise<
    { accepted: true } | { accepted: false; reason: InvalidTaskNameReason }
  >;
};

function usePrevious<T>(value: T): T | null {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function TaskItem(props: TaskItemProps) {
  const { task } = props;

  const [isRenaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [rejectedReason, setRejectedReason] =
    useState<InvalidTaskNameReason | null>(null);

  const errorId = `${task.id}-error`;

  const renameFieldRef = useRef<HTMLInputElement>(null);
  const renameButtonRef = useRef<HTMLButtonElement>(null);

  const wasRenaming = usePrevious(isRenaming);

  function startRenaming() {
    // 今の名前を入れておく。名前の変更は全部打ち直すより
    // 一部を直したいことのほうが多い。
    setNewName(task.name);
    setRejectedReason(null);
    setRenaming(true);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
    setRejectedReason(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await props.renameTask(task.id, newName);

    if (result.accepted) {
      setRenaming(false);
      return;
    }

    // 受け付けられなかったときはフォームを閉じない。直して出し直せるようにするため。
    setRejectedReason(result.reason);
  }

  // ボタンの名前は aria-label で明示する。visually-hidden な span を並べるだけだと
  // 支援技術に読まれる名前で語の区切りが失われ、"ShowAlltasks" のように繋がる。
  const renamingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="todo-label" htmlFor={task.id}>
          New name for {task.name}
        </label>
        <input
          id={task.id}
          className="todo-text"
          type="text"
          value={newName}
          onChange={handleChange}
          ref={renameFieldRef}
          aria-invalid={rejectedReason !== null}
          aria-describedby={rejectedReason === null ? undefined : errorId}
        />
        {rejectedReason !== null && (
          <p id={errorId} className="form-error" role="alert">
            {taskNameErrorMessage(rejectedReason)}
          </p>
        )}
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn todo-cancel"
          aria-label={`Cancel renaming ${task.name}`}
          onClick={() => setRenaming(false)}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn__primary todo-edit"
          aria-label={`Save new name for ${task.name}`}>
          Save
        </button>
      </div>
    </form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          id={task.id}
          type="checkbox"
          defaultChecked={task.completed}
          onChange={() => void props.toggleTaskCompletion(task.id)}
        />
        <label className="todo-label" htmlFor={task.id}>
          {task.name}
        </label>
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          aria-label={`Edit ${task.name}`}
          onClick={startRenaming}
          ref={renameButtonRef}>
          Edit
        </button>
        <button
          type="button"
          className="btn btn__danger"
          aria-label={`Delete ${task.name}`}
          onClick={() => void props.deleteTask(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    if (!wasRenaming && isRenaming) {
      renameFieldRef.current?.focus();
    } else if (wasRenaming && !isRenaming) {
      renameButtonRef.current?.focus();
    }
  }, [wasRenaming, isRenaming]);

  return <li className="todo">{isRenaming ? renamingTemplate : viewTemplate}</li>;
}

export default TaskItem;
