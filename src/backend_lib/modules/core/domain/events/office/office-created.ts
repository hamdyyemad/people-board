export class OfficeCreatedEvent {
  constructor(
    public officeId: string,
    public officeName: string,
    public cityId: string,
    public occurredAt: Date = new Date()
  ) {}
}
