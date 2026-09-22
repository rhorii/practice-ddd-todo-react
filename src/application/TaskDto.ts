/**
 * presentation 層に渡す Task の表現。
 *
 * presentation 層はドメインオブジェクトを直接触らない（T0-5 で import を禁止している）。
 * UI が必要とするのは「描画できる素のデータ」だけであり、ドメインの振る舞いではない。
 * この境界があることで、UI の都合がドメインモデルに漏れ出すのを防げる。
 */
export type TaskDto = {
  id: string;
  name: string;
  completed: boolean;
};
