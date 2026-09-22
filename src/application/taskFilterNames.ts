import { TaskFilter, type TaskFilterName } from "../domain/TaskFilter";

/**
 * 選べるフィルタの名前を、その並び順どおりに返す。
 *
 * 状態も入力も副作用もないため、ユースケースの形（クラスと execute）は取らない。
 * これはアプリケーションの操作ではなく、ドメインが持つ取り決めを
 * presentation 層から見えるようにしているだけ。
 * ユースケースでないものをユースケースの形にしないことで、その区別がコードに現れる。
 */
export function taskFilterNames(): readonly TaskFilterName[] {
  return TaskFilter.names();
}

/** presentation 層がフィルタ名を型として扱えるようにするための再公開。 */
export type { TaskFilterName };
