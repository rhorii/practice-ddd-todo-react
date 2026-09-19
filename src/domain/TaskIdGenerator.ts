import type { TaskId } from "./TaskId";

/**
 * 新しい TaskId を発行する。
 *
 * 「どうやって一意な値を作るか」は技術的な詳細であり、ドメインの関心事ではない。
 * そこで domain 層は「TaskId を発行できる何かが必要だ」という要求だけを
 * インターフェースとして宣言し、実装は infrastructure 層に置く（依存性逆転）。
 *
 * この形にしておくと、テストでは決まった順番の ID を返す実装に差し替えられる。
 */
export interface TaskIdGenerator {
  generate(): TaskId;
}
