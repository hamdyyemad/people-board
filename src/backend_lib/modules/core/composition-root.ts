/**
 * Composition Root — the only place that knows about concrete infrastructure
 * implementations. Sits at the module boundary, outside both application
 * and infrastructure layers.
 *
 * When this grows too large, convert to a composition-root/ folder
 * with one file per aggregate (department.ts, employee.ts, etc.)
 * and an index.ts that re-exports everything.
 * 
 * ## Dependency Injection

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

 */

// --- Repositories (shared instances, stateless) and Service ---
import { DepartmentRepository } from './infrastructure/repository/department-repository';
import { DepartmentService } from './application/services/department-service';

const departmentRepository = new DepartmentRepository();
export const departmentService = new DepartmentService(departmentRepository);

// ----------------------------------------------------------------------------------------

