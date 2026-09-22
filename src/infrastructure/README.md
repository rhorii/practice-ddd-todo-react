# infrastructure 層

技術的な詳細を引き受ける層。**domain 層が定義したインターフェースを実装する**。

## 置くもの

- リポジトリの実装 (`InMemoryTaskRepository`, `LocalStorageTaskRepository`)
- 永続化モデル ⇄ ドメインモデルの変換 (Mapper)
- ID 生成など、外部ライブラリ (nanoid) に依存する実装

## 依存してよいもの

domain 層（インターフェースを実装するため）と、外部ライブラリ。

## 判断の目安

矢印の向きに注目する。domain 層が infrastructure 層を呼ぶのではなく、
**infrastructure 層が domain 層のインターフェースに従う**。これが依存性逆転であり、
localStorage を HTTP API に差し替えても domain 層が一行も変わらない理由になる。
