import { useState, type ChangeEvent, type FormEvent } from "react";
import type { InvalidTaskNameReason } from "../application/InvalidTaskNameError";
import { taskNameErrorMessage } from "./taskNameErrorMessage";

type FormProps = {
  // 追加は保存を伴うため完了を待てる形にしておく。
  // 名前が受け付けられなければ、その理由が返る。
  addTask: (
    name: string
  ) => Promise<{ accepted: true } | { accepted: false; reason: InvalidTaskNameReason }>;
};

const ERROR_ID = "new-todo-error";

function Form(props: FormProps) {
  const [name, setName] = useState('');
  const [rejectedReason, setRejectedReason] =
    useState<InvalidTaskNameReason | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await props.addTask(name);

    if (result.accepted) {
      setName("");
      setRejectedReason(null);
      return;
    }

    // 受け付けられなかった入力は消さない。直して出し直せるようにするため。
    setRejectedReason(result.reason);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
    setRejectedReason(null);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="label-wrapper">
        <label htmlFor="new-todo-input" className="label__lg">
          What needs to be done?
        </label>
      </h2>

      <input
        type="text"
        id="new-todo-input"
        className="input input__lg"
        name="text"
        autoComplete="off"
        value={name}
        onChange={handleChange}
        aria-invalid={rejectedReason !== null}
        aria-describedby={rejectedReason === null ? undefined : ERROR_ID}
      />
      {rejectedReason !== null && (
        <p id={ERROR_ID} className="form-error" role="alert">
          {taskNameErrorMessage(rejectedReason)}
        </p>
      )}
      <button type="submit" className="btn btn__primary btn__lg">
        Add
      </button>
    </form>
  );
}

export default Form;
