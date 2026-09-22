import { TaskName } from "../domain/TaskName";

/**
 * 名前の制約に関するものを presentation 層へ公開する。
 *
 * presentation 層から domain 層への直接 import は禁止しているが、
 * 「不正な名前は拒否される」ことはユースケースの契約の一部であり、
 * UI が知る必要がある。そのため application 層を経由して公開する。
 *
 * 公開するのは理由 (reason) と上限値までで、表示する文言は含まない。
 * 文言は UI の関心事であり、ドメインが決めることではない。
 */
export {
  InvalidTaskNameError,
  type InvalidTaskNameReason,
} from "../domain/TaskName";

/** タスク名として妥当な文字数の上限。UI がメッセージに使う。 */
export const MAX_TASK_NAME_LENGTH = TaskName.MAX_LENGTH;
