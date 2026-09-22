import { nanoid } from "nanoid";
import { TaskId } from "../domain/TaskId";
import type { TaskIdGenerator } from "../domain/TaskIdGenerator";

/**
 * nanoid を使って TaskId を発行する実装。
 *
 * domain 層は nanoid の存在を知らない。この層が domain 層のインターフェースに
 * 従うことで、ID の生成方法を UUID や連番に差し替えても domain 層は変わらない。
 */
export class NanoidTaskIdGenerator implements TaskIdGenerator {
  generate(): TaskId {
    return TaskId.of(`task-${nanoid()}`);
  }
}
