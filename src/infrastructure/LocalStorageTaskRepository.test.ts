import { TaskId } from "../domain/TaskId";
import { TaskList } from "../domain/TaskList";
import { Task } from "../domain/Task";
import { TaskName } from "../domain/TaskName";
import {
  DEFAULT_STORAGE_KEY,
  LocalStorageTaskRepository,
} from "./LocalStorageTaskRepository";
import { describeTaskRepositoryContract } from "./TaskRepositoryContract";

beforeEach(() => {
  localStorage.clear();
});

describeTaskRepositoryContract(
  "LocalStorageTaskRepository",
  () => new LocalStorageTaskRepository()
);

const EAT = Task.reconstruct(TaskId.of("task-1"), TaskName.of("Eat"), true);

describe("LocalStorageTaskRepository", () => {
  describe("保存先", () => {
    it("既定のキーに書き込む", async () => {
      await new LocalStorageTaskRepository().save(TaskList.of([EAT]));

      expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).not.toBeNull();
    });

    it("キーを指定できる", async () => {
      await new LocalStorageTaskRepository(localStorage, "other").save(
        TaskList.of([EAT])
      );

      expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem("other")).not.toBeNull();
    });

    it("バージョン付きの形式で保存する", async () => {
      await new LocalStorageTaskRepository().save(TaskList.of([EAT]));

      const stored = JSON.parse(localStorage.getItem(DEFAULT_STORAGE_KEY) ?? "");

      expect(stored).toEqual({
        version: 1,
        tasks: [{ id: "task-1", name: "Eat", completed: true }],
      });
    });
  });

  // 保存先の中身は外の世界のもので、こちらが書いたとおりとは限らない。
  // 読めない場合にアプリが起動できなくならないことを確かめる。
  describe("読めない内容", () => {
    const loadFrom = (stored: string) => {
      localStorage.setItem(DEFAULT_STORAGE_KEY, stored);

      return new LocalStorageTaskRepository().load();
    };

    it("JSON として壊れていれば空の一覧を返す", async () => {
      expect((await loadFrom("{ not json")).isEmpty).toBe(true);
    });

    it("想定と違う形であれば空の一覧を返す", async () => {
      expect((await loadFrom('{"tasks": "なんでもない"}')).isEmpty).toBe(true);
    });

    it("未対応のバージョンであれば空の一覧を返す", async () => {
      expect((await loadFrom('{"version": 99, "tasks": []}')).isEmpty).toBe(
        true
      );
    });

    it("不変条件を満たさない Task が混ざっていれば空の一覧を返す", async () => {
      // 名前が空の Task は TaskName の不変条件に反するため復元できない
      const broken = '{"version": 1, "tasks": [{"id":"task-1","name":"","completed":false}]}';

      expect((await loadFrom(broken)).isEmpty).toBe(true);
    });

    it("壊れた内容は次の保存で上書きされる", async () => {
      localStorage.setItem(DEFAULT_STORAGE_KEY, "{ not json");
      const repository = new LocalStorageTaskRepository();

      await repository.save(TaskList.of([EAT]));

      expect((await repository.load()).size).toBe(1);
    });
  });

  it("別のインスタンスからも読み出せる", async () => {
    await new LocalStorageTaskRepository().save(TaskList.of([EAT]));

    expect((await new LocalStorageTaskRepository().load()).size).toBe(1);
  });
});
