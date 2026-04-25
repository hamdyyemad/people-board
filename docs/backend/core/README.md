# Core Module — Docs

This folder documents the architecture and design decisions behind `src/backend_lib/modules/core`.

| File | What it covers |
|------|---------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layer structure, dependency rule, composition root, NestJS migration path |
| [README.md](./README.md) *(this file)* | How to navigate the docs; DI decisions for use cases |

---

## Dependency Injection: How Use Cases Are Wired

### The boundary that matters

The one DI boundary that **must** be respected is between the **application layer and infrastructure**:

- Services depend on `IDepartmentRepository` (domain interface), never on `DepartmentRepository` (concrete class)
- The composition root is the only file that crosses this boundary

This is what makes the domain and application layers infrastructure-agnostic and testable without a database.

### Use cases: import directly, don't inject

Use cases are instantiated **inside service methods**, not injected through the constructor:

```typescript
// department-service.ts
async createDepartment(input: ...) {
  const useCase = new CreateDepartmentUseCase(this.departmentRepository, this.idGenerator);
  return useCase.execute(dto);
}
```

This is intentional. Use cases are stateless orchestrators — creating one per call is a trivial allocation with no side effects. Injecting them instead (passing them as constructor parameters) gives you no practical benefit unless you are unit-testing services in isolation with mocked use cases, which is not our test strategy.

The alternative (injecting every use case) was tried and reverted because it made the composition root grow linearly with every new use case, and the service constructor became a long parameter list, without any real gain in this codebase.

### The rule of thumb

| Dependency | Inject? | Reason |
|---|---|---|
| `IDepartmentRepository` | **Yes** | Touches the DB; must be swappable for tests and for NestJS migration |
| `IIdGenerator` | **Yes** | External concern; may need to swap implementation |
| Use cases (`CreateDepartmentUseCase`, etc.) | **No** | Stateless; constructed inline; no infrastructure |

### What the composition root wires

The composition root (`composition-root.ts`) only wires infrastructure → application:

```typescript
const departmentRepository = new DepartmentRepository();  // infrastructure
const idGenerator = new UuidIDGenerator();                // infrastructure

export const departmentService = new DepartmentService(departmentRepository, idGenerator);
```

Services are exported as singletons. API routes import them from the composition root and never touch infrastructure directly.

### When this decision should be revisited

Inject a use case into a service when **either** of these becomes true:

1. The use case needs a **different implementation in tests** (i.e., you want to mock it independently of the repository mock)
2. The use case itself **has injected infrastructure dependencies** of its own that aren't already available on the service

Neither applies today. When we migrate to NestJS, the framework resolves all of this automatically — `@Injectable()` use cases are registered as providers and NestJS injects them where needed.

---

## See Also

- [ARCHITECTURE.md → Dependency Injection](./ARCHITECTURE.md#dependency-injection) — full rationale for the manual composition root over tsyringe/InversifyJS
- [ARCHITECTURE.md → Migration Path to NestJS](./ARCHITECTURE.md#migration-path-to-nestjs) — what changes and what stays the same
