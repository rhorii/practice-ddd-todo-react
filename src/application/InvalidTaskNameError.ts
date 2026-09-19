/**
 * presentation 層が不変条件違反を識別できるようにするための再公開。
 *
 * presentation 層から domain 層への直接 import は禁止しているが、
 * 「不正な名前は拒否される」ことはユースケースの契約の一部であり、
 * UI が知る必要がある。そのため application 層を経由して公開する。
 *
 * T4-3 で reason ごとのメッセージを UI に表示する。
 */
export {
  InvalidTaskNameError,
  type InvalidTaskNameReason,
} from "../domain/TaskName";
