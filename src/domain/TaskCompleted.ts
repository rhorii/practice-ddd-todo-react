import type { TaskId } from "./TaskId";
import type { TaskName } from "./TaskName";

/**
 * Task が完了したという出来事。
 *
 * ドメインイベントは「起きたこと」を表す。過去形で名付けるのはそのため。
 * 起きたことは取り消せないので、イベントはイミュータブルで、
 * 発生時点の情報（そのときの名前）をそのまま抱えて運ぶ。
 * 後から Task の名前が変わっても、完了した時点の記録は変わらない。
 *
 * これを置く価値は、「完了した」ことと「完了したら何をするか」を切り離せる点にある。
 * 履歴を残す・通知する・統計を取るといった反応が増えても、Task も TaskList も
 * それらを知らずに済む。
 *
 * occurredAt をここで決めているのは、時刻を外から渡す仕組み（Clock）を
 * 用意していないため。ドメインが暗黙に時計へ依存している点は妥協であり、
 * 発生時刻を検証したくなったら Clock を導入して注入する形に変える。
 */
export class TaskCompleted {
  readonly occurredAt: Date;

  constructor(
    readonly taskId: TaskId,
    readonly taskName: TaskName
  ) {
    this.occurredAt = new Date();
  }
}

/**
 * ドメインで起きた出来事。
 *
 * いまは1種類しかない。「未完了に戻した」「名前を変えた」もイベントにできるが、
 * それらに反応する相手がいないうちは作らない。使われないイベントは
 * 動かない配管にしかならない。
 */
export type DomainEvent = TaskCompleted;
