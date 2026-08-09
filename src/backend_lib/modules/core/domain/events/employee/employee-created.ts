export class EmployeeCreatedEvent {
  constructor(
    public employeeId: string,
    public personId: string,
    public occurredAt: Date = new Date()
  ) {}
}
