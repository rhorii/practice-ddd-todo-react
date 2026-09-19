import { TaskFilter, type TaskFilterName } from "../domain/TaskFilter";

/**
 * 選べるフィルタの一覧を返すユースケース。
 *
 * どんなフィルタが存在するかはドメインの取り決めであり、UI が並べ方を
 * 決めているわけではない。UI はここで得た名前をボタンにするだけ。
 */
export class ListTaskFilters {
  execute(): readonly TaskFilterName[] {
    return TaskFilter.names();
  }
}

/** presentation 層がフィルタ名を型として扱えるようにするための再公開。 */
export type { TaskFilterName };
