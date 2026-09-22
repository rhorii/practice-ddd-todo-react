import type { TaskDto } from "./TaskDto";
import { toTaskList } from "./TaskMapper";

/**
 * 未完了の Task の件数を数えるユースケース。
 *
 * 「remaining とは未完了の件数である」という定義は docs/ubiquitous-language.md に
 * あるドメインの取り決めで、画面の都合ではない。数え方そのものは
 * TaskList.countActive が持ち、この層はそれを UI に橋渡しするだけ。
 */
export class CountRemainingTasks {
  execute(tasks: readonly TaskDto[]): number {
    return toTaskList(tasks).countActive();
  }
}
