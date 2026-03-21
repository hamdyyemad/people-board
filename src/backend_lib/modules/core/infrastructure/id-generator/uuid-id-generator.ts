import { IIdGenerator } from "../../domain/ports/id-generator";

export class UuidIDGenerator implements IIdGenerator {
  public generate(): string {
    return crypto.randomUUID();
  }
}