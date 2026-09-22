import { TaskId } from "../domain/TaskId";
import { TaskList } from "../domain/TaskList";
import { Task } from "../domain/Task";
import { TaskName } from "../domain/TaskName";
import { InMemoryTaskRepository } from "./InMemoryTaskRepository";
import { describeTaskRepositoryContract } from "./TaskRepositoryContract";

describeTaskRepositoryContract(
  "InMemoryTaskRepository",
  () => new InMemoryTaskRepository()
);

describe("InMemoryTaskRepository", () => {
  it("初期値として渡された TaskList を返す", async () => {
    const eat = Task.reconstruct(TaskId.of("task-1"), TaskName.of("Eat"), true);
    const repository = new InMemoryTaskRepository(TaskList.of([eat]));

    expect((await repository.load()).size).toBe(1);
  });
});
