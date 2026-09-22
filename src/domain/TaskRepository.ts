import type { TaskList } from "./TaskList";

/**
 * TaskList の永続化を担う。
 *
 * ドメインが必要としているのは「Task の一覧をしまっておいて、後で取り出せること」
 * だけで、それが localStorage なのか HTTP API なのかは知らなくてよい。
 * そこで domain 層は要求だけをインターフェースとして宣言し、実装は
 * infrastructure 層に置く（依存性逆転）。TaskIdGenerator と同じ構図。
 *
 * ## 粒度について
 *
 * Task 単位ではなく TaskList 単位で読み書きする。Task を個別に保存できると、
 * 並び順や「同じ TaskId が2つない」といった集合としての不変条件を誰が守るのかが
 * 曖昧になる。まとめて入出力することで、TaskList が集合の一貫性に責任を持てる。
 *
 * この形は TaskList を集約とみなす立場に立っている。その是非は T5-1 で検討する。
 *
 * ## 非同期について
 *
 * localStorage は同期的に読み書きできるが、あえて Promise を返す。
 * 永続化先が HTTP API になったときにインターフェースを変えずに済ませるため。
 * 同期から非同期への変更は呼び出し側すべてに波及するので、後から入れるのが最も高くつく。
 */
export interface TaskRepository {
  load(): Promise<TaskList>;

  save(tasks: TaskList): Promise<void>;
}
