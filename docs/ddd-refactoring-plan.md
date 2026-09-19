# DDD リファクタリング計画

MDN の todo-react をベースに、ドメイン駆動設計の考え方に沿って段階的にリファクタリングする。

## 進め方

- タスクは **1つずつ** 実行する。各タスクの詳細は着手前に会話で設計を詰める。
- 1タスク = 1コミット。**各タスク完了時点で必ずアプリが動く状態**を保つ。
- テストは常にグリーンに保つ。壊れたら次に進まない。

## Phase 0: 土台づくり（リファクタリングの安全網）

- [x] **T0-1** Vitest + @testing-library/react + jsdom を導入し、`yarn test` を通す
- [x] **T0-2** 特性テスト（characterization test）で現状の振る舞いを固定する
      （追加・完了切替・編集・削除・フィルタ・件数表示）
- [x] **T0-3** TypeScript を導入する
      （`typescript` / `@types/*` / `tsconfig.json` / vite 設定、`.jsx` → `.tsx` へ機械的に移行）
      `strict: true` は必須。`noUncheckedIndexedAccess` も有効にする
- [x] **T0-4** レイヤーのディレクトリを作る
      （`src/domain` / `src/application` / `src/infrastructure` / `src/presentation`）
- [ ] **T0-5** ESLint の `import/no-restricted-paths` で依存方向（内向きのみ）を機械的に固定する

> T0-2 を T0-3 より先に置くのは意図的。型なしの状態で振る舞いを固定しておけば、
> TypeScript 移行そのものが「テストが通ったまま型が付く」安全な一歩になる。

## Phase 1: ドメインモデルの抽出（ボトムアップ）

- [ ] **T1-1** ユビキタス言語の整理
      `Todo` / `task` / `TodoMatic` の名前ゆれを `Task` に統一し、用語集を残す
- [ ] **T1-2** `TaskId` 値オブジェクト
      Branded Type で生の string との取り違えを防ぐ。nanoid への依存をドメインから追い出す
- [ ] **T1-3** `TaskName` 値オブジェクト
      trim・空文字禁止・最大長。private constructor + 静的ファクトリ
      → 既存の「空タスクを登録できるバグ」がここで不変条件として直る
- [ ] **T1-4** `Task` エンティティ
      `complete()` / `incomplete()` / `rename()`。同一性は `TaskId`。状態はイミュータブルに更新
- [ ] **T1-5** `TaskList`（ファーストクラスコレクション）
      `add` / `remove` / `replace` / `countActive` を移す
- [ ] **T1-6** `TaskFilter`（All / Active / Completed）を値オブジェクト＋仕様として表現し、
      `FILTER_MAP` を置き換える

> Phase 1 はボトムアップで進める。先に Repository やユースケースを作ると、
> 中身のないドメインモデルを配管するだけになり「ドメインモデル貧血症」の練習になってしまう。

## Phase 2: 永続化の抽象化

- [ ] **T2-1** `TaskRepository` インターフェースをドメイン層に定義する（依存性逆転）
- [ ] **T2-2** `InMemoryTaskRepository` を infrastructure に実装し、テストを差し替える
- [ ] **T2-3** `LocalStorageTaskRepository` を追加し、永続化モデル ⇄ ドメインモデルの Mapper を挟む
      → 層分離の効果を体感する回

## Phase 3: アプリケーション層

- [ ] **T3-1** ユースケースを切り出す
      `AddTask` / `RenameTask` / `ToggleTaskCompletion` / `DeleteTask` / `ListTasks`
- [ ] **T3-2** UI へはドメインオブジェクトではなく DTO を返す
- [ ] **T3-3** 組み立てを `main.tsx`（composition root）に集約し、Context でユースケースを注入する

## Phase 4: プレゼンテーション層を薄くする

- [ ] **T4-1** `App` からロジックを剥がし、`useTasks` フックがユースケースを呼ぶだけにする
- [ ] **T4-2** `Form` / `Todo` を DTO 前提に整理し、props ドリリングを解消する
- [ ] **T4-3** `TaskName` の不変条件違反をエラーメッセージとして UI に表示する

## Phase 5: 発展（DDD の議論を味わう）

- [ ] **T5-1** 集約境界の検討: 集約ルートは `Task` か `TaskList` か
- [ ] **T5-2** ドメインイベント（`TaskCompleted` など）の導入
- [ ] **T5-3** ドメインサービス／仕様パターンが必要になるケースの検討
- [ ] **T5-4** 境界づけられたコンテキストの考察（このアプリでは実質1つ、という結論も含めて）
