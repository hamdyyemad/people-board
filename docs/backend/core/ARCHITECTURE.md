# Backend Clean Architecture

## Directory Structure

```
backend_lib/
  modules/
    core/
      domain/              # Innermost layer — pure business logic
        constants/          # Single source of truth for rule values & messages (see below)
        entities/           # Mutable domain objects (Department, Employee, etc.)
        value-objects/      # Immutable typed values (DepartmentName, Email, etc.)
        events/             # Domain events (DepartmentCreated, etc.)
        ports/              # Interfaces/contracts that outer layers must implement
          repositories/     # Repository interfaces (IDepartmentRepository, etc.)
        exceptions/         # Domain-specific error types
      validation/           # Zod schemas for API request/response (depends on domain)
      application/          # Use cases and orchestration
        use-cases/          # Single-responsibility command/query handlers
        services/           # Façades that group related use cases
        dto/                # Data Transfer Objects for input/output
      infrastructure/       # Outermost layer — concrete implementations
        databases/          # DB client (Drizzle), table schemas
        repository/         # Concrete repository implementations
      composition-root.ts   # Wires infrastructure → application (see DI section)

src/app/api/               # Next.js API routes (presentation layer)
```

## The Dependency Rule

The fundamental rule of Clean Architecture: **dependencies point inward only**.

```
┌──────────────────────────────────────────────────────────┐
│  API Layer (src/app/api/)                                │
│    → knows about: composition root (module boundary)     │
│    → does NOT know about: infrastructure, domain         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Infrastructure Layer                              │  │
│  │    → implements domain ports (interfaces)          │  │
│  │    → knows about: domain                           │  │
│  │    → does NOT know about: application              │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Application Layer                           │  │  │
│  │  │    → orchestrates domain logic               │  │  │
│  │  │    → depends on: domain ports (interfaces)   │  │  │
│  │  │    → does NOT know about: infrastructure     │  │  │
│  │  │                                              │  │  │
│  │  │  ┌────────────────────────────────────────┐  │  │  │
│  │  │  │  Domain Layer                         │  │  │  │
│  │  │  │    → pure business logic              │  │  │  │
│  │  │  │    → ZERO external dependencies       │  │  │  │
│  │  │  │    → defines ports (interfaces)       │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**What this means in practice:**
- `domain/` imports NOTHING from `application/` or `infrastructure/`
- `application/` imports from `domain/` only (entities, value objects, port interfaces)
- `infrastructure/` imports from `domain/` (to implement the port interfaces)
- `application/` NEVER imports concrete classes from `infrastructure/`

## Domain constants and shared rules

The same business rule often appears in several places: **database** (migrations, constraints), **domain** (value objects and entity validation), and **validation layer** (Zod schemas at the API boundary). To avoid drift and duplication, **rule values and messages live in the domain** as the single source of truth.

### Where: `domain/constants/`

Each aggregate or bounded context can have a constants file, e.g. `domain/constants/department.ts`, that exports:

- **Numeric/string limits** used by value objects, Zod schemas, and (when applicable) DB constraints: e.g. `DEPARTMENT_NAME.MIN_LENGTH`, `DEPARTMENT_NAME.MAX_LENGTH`.
- **Error messages** used by value objects, entities, and Zod: e.g. `DEPARTMENT_NAME_MESSAGES.EMPTY`, `DEPARTMENT_MESSAGES.OWN_PARENT`.

The **invariant logic** (e.g. “department cannot be its own parent”) stays in the **entity**; only the **message text** is shared so it stays consistent everywhere.

### Who depends on it

| Consumer | Uses |
|----------|------|
| **Value objects** (e.g. `DepartmentName`) | `DEPARTMENT_NAME.*` limits and `DEPARTMENT_NAME_MESSAGES.*` in their `validate()` methods. |
| **Entities** (e.g. `Department`) | `DEPARTMENT_MESSAGES.*` for error messages in entity validation. |
| **Validation layer** (`modules/core/validation/`) | Same limits and messages in Zod schemas so API validation matches domain rules and returns the same wording. |
| **Database migrations** | SQL cannot import TypeScript. Document in migration comments that constraints (e.g. `CHECK (char_length(name) <= 255)`) must stay in sync with `domain/constants/` (e.g. `DEPARTMENT_NAME.MAX_LENGTH`). When adding or changing constraints, update the constant and the migration together. |

### Dependency direction

- **Validation** and **application** depend on **domain** (including `domain/constants/`).
- **Domain** does not depend on validation or application. Constants are just data; they live in the domain so the domain remains the single source of truth and all outer layers align with it.

## Dependency Injection

### The Problem

The application layer needs to call repository methods, but it must not know about
the concrete implementation (e.g., Drizzle-based repository). This is where
**Dependency Inversion** comes in:

- The **domain** layer defines the interface (`IDepartmentRepository`)
- The **application** layer depends on that interface (constructor parameter)
- The **infrastructure** layer provides the concrete implementation (`DepartmentRepository`)
- Something outside all layers wires them together

### How We Solve It: Composition Root (Current Approach)

TypeScript/Node.js has no built-in DI container like .NET or Java/Spring.
We use a **manual composition root** — a single file at the module boundary that:

1. Imports concrete implementations from infrastructure
2. Imports services from application
3. Wires them together
4. Exports ready-to-use instances

```typescript
// composition-root.ts — the ONLY file that crosses layer boundaries
import { DepartmentRepository } from './infrastructure/repository/department-repository';
import { DepartmentService } from './application/services/department-service';

const departmentRepository = new DepartmentRepository();
export const departmentService = new DepartmentService(departmentRepository);
```

The API route then imports from the composition root:

```typescript
// src/app/api/core/departments/route.ts
import { departmentService } from '@/backend_lib/modules/core/composition-root';
```

The service itself only knows about the interface:

```typescript
// application/services/department-service.ts
import { IDepartmentRepository } from '../../domain/ports/repositories/department-repository';

export class DepartmentService {
  constructor(private readonly departmentRepository: IDepartmentRepository) {}
}
```

### How .NET and Java Do It

In .NET and Java, frameworks provide built-in DI containers. You don't write
a composition root file — instead, you register bindings at startup:

**.NET:**
```csharp
// Program.cs
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<DepartmentService>();

// Controller — framework auto-injects
public class DepartmentController(DepartmentService service) { }
```

**Java/Spring:**
```java
@Service
public class DepartmentService {
    @Autowired private IDepartmentRepository repository;
}

@Repository
public class DepartmentRepository implements IDepartmentRepository { }
// Spring auto-discovers and wires via annotations
```

### TypeScript DI Libraries

If you want a container-based experience in TypeScript (similar to .NET/Spring),
these libraries are available:

| Library | Style | Notes |
|---------|-------|-------|
| [tsyringe](https://github.com/microsoft/tsyringe) | Decorators (`@injectable`, `@inject`) | By Microsoft, lightweight |
| [InversifyJS](https://inversify.io/) | Decorators + explicit bindings | Most feature-rich, closest to .NET |
| [typedi](https://github.com/typestack/typedi) | Decorators (`@Service`, `@Inject`) | Simple, Spring-like |

**We do NOT use any of these** — see rationale below.

### Why We Use the Manual Composition Root

The plan is to migrate `backend_lib/` into a **NestJS** project. NestJS has its
own built-in DI container (very similar to Angular/Spring). When that migration
happens:

- Adding tsyringe/inversify/typedi now means adding a dependency we'd immediately
  rip out when switching to NestJS
- The manual composition root is trivial to replace with NestJS modules
- The layers that matter (domain + application) stay **completely untouched**

## Migration Path to NestJS

When `backend_lib/` moves to NestJS, here's what changes and what doesn't:

### What stays the same (zero changes)
- `domain/` — entities, value objects, ports, events, exceptions
- `application/` — use cases, services, DTOs (just add `@Injectable()` decorator)
- `infrastructure/repository/` — concrete repositories (just add `@Injectable()`)

### What changes
- **composition-root.ts → deleted** — replaced by NestJS module registration
- **src/app/api/ → NestJS controllers** — replaced by `@Controller()` classes
- **infrastructure/databases/ → NestJS providers** — Drizzle client registered as provider

### NestJS equivalent of the composition root

```typescript
// department.module.ts — NestJS replaces the composition root with modules
@Module({
  providers: [
    DepartmentService,
    { provide: 'IDepartmentRepository', useClass: DepartmentRepository },
  ],
  controllers: [DepartmentController],
})
export class DepartmentModule {}
```

```typescript
// department.service.ts — uses NestJS @Inject() instead of manual wiring
@Injectable()
export class DepartmentService {
  constructor(
    @Inject('IDepartmentRepository')
    private readonly departmentRepository: IDepartmentRepository,
  ) {}
}
```

The service logic, use cases, domain entities — all remain identical.
That's the entire point of Clean Architecture: the framework is a detail.

## Layer Rules Summary

| Layer | Can import from | Cannot import from |
|-------|----------------|-------------------|
| Domain | nothing | application, infrastructure, API |
| Application | domain (ports, entities, VOs) | infrastructure, API |
| Infrastructure | domain (to implement ports) | application, API |
| Composition Root | application + infrastructure | API |
| API | composition root | application, infrastructure, domain |

## How to Add a Feature

1. Define/update the **domain entity** and any value objects
2. If a business rule (limits, messages) is shared by value objects, entities, and API validation, add or reuse constants in **`domain/constants/`** so one place drives all three (and document DB constraints in migrations).
3. Define the **port interface** in `domain/ports/` if new persistence is needed
4. Create the **use case** in `application/use-cases/`
5. Expose it through a **service method** in `application/services/`
6. Implement the **repository** in `infrastructure/repository/`
7. Register it in **composition-root.ts** (wire interface → implementation)
8. Call the service from the **API route**

## Example: Department Creation Flow

```
POST /api/core/departments
    │
    ▼
route.ts (API layer)
    │ imports departmentService from composition-root
    ▼
DepartmentService.createDepartment() (application layer)
    │ depends on IDepartmentRepository (domain port)
    ▼
CreateDepartmentUseCase.execute() (application layer)
    │ creates Department entity + DepartmentName value object
    │ calls IDepartmentRepository.save()
    ▼
DepartmentRepository.save() (infrastructure layer)
    │ implements IDepartmentRepository
    │ uses Drizzle to INSERT into departments table
    ▼
Database
```
