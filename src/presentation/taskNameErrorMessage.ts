import {
  MAX_TASK_NAME_LENGTH,
  type InvalidTaskNameReason,
} from "../application/InvalidTaskNameError";

/**
 * 名前が受け付けられなかった理由を、ユーザーに見せる文言にする。
 *
 * 文言を持つのは presentation 層。ドメインが伝えるのは理由だけなので、
 * 言い回しを変えても、多言語に対応しても、ドメインモデルは変わらない。
 *
 * reason が直和型なので、理由を増やしたときにここが網羅されていなければ
 * コンパイルエラーになる。対応を忘れたまま出荷することがない。
 */
export function taskNameErrorMessage(reason: InvalidTaskNameReason): string {
  switch (reason) {
    case "empty":
      return "Please enter a name for the task.";
    case "tooLong":
      return `Task names must be ${MAX_TASK_NAME_LENGTH} characters or fewer.`;
    case "multiline":
      return "Task names cannot contain line breaks.";
  }
}
