import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

type TaskItemProps = {
  id: string;
  name: string;
  completed: boolean;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  renameTask: (id: string, newName: string) => void;
};

function usePrevious<T>(value: T): T | null {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function TaskItem(props: TaskItemProps) {
  const [isRenaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  const renameFieldRef = useRef<HTMLInputElement>(null);
  const renameButtonRef = useRef<HTMLButtonElement>(null);

  const wasRenaming = usePrevious(isRenaming);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  // NOTE: As written, this function has a bug: it doesn't prevent the user
  // from submitting an empty form. This is left as an exercise for developers
  // working through MDN's React tutorial.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.renameTask(props.id, newName);
    setNewName("");
    setRenaming(false);
  }

  const renamingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="todo-label" htmlFor={props.id}>
          New name for {props.name}
        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newName}
          onChange={handleChange}
          ref={renameFieldRef}
        />
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn todo-cancel"
          onClick={() => setRenaming(false)}>
          Cancel
          <span className="visually-hidden">renaming {props.name}</span>
        </button>
        <button type="submit" className="btn btn__primary todo-edit">
          Save
          <span className="visually-hidden">new name for {props.name}</span>
        </button>
      </div>
    </form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          id={props.id}
          type="checkbox"
          defaultChecked={props.completed}
          onChange={() => props.toggleTaskCompletion(props.id)}
        />
        <label className="todo-label" htmlFor={props.id}>
          {props.name}
        </label>
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          onClick={() => {
            setRenaming(true);
          }}
          ref={renameButtonRef}>
          Edit <span className="visually-hidden">{props.name}</span>
        </button>
        <button
          type="button"
          className="btn btn__danger"
          onClick={() => props.deleteTask(props.id)}>
          Delete <span className="visually-hidden">{props.name}</span>
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
