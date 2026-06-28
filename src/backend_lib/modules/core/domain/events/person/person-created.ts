export class PersonCreatedEvent {
  constructor(
    public personId: string,
    public email: string,
    public occurredAt: Date = new Date()
  ) {}
}
