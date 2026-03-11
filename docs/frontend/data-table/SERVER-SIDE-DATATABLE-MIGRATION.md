# Server-Side DataTable Migration Plan

**Goal:** Migrate all DataTable operations (CRUD, filtering, sorting, pagination, import/export, column preferences) from client-side to server-side implementation.

**Future Goal:** Extract DataTable as a standalone library package.

---

## Table of Contents

1. [Overview](#overview)
2. [Backend Implementation Plan](#backend-implementation-plan)
3. [Frontend Migration Plan](#frontend-migration-plan)
4. [Testing Strategy](#testing-strategy)
5. [Library Extraction Preparation](#library-extraction-preparation)

---

## Overview

### Current State (Client-Side)
- ✅ All operations happen in the browser
- ✅ Full dataset loaded into memory
- ❌ Not scalable for large datasets
- ❌ No data persistence for user preferences
- ❌ No real database integration

### Target State (Server-Side)
- ✅ Operations performed on the server
- ✅ Pagination limits data transfer
- ✅ Database-optimized queries
- ✅ User preferences persisted
- ✅ Scalable for large datasets

### Features to Migrate
1. **CRUD Operations** (Create, Read, Update, Delete)
2. **Pagination** (Page size, page number)
3. **Sorting** (Column, direction)
4. **Filtering** (Global search, column filters)
5. **Column Visibility** (Show/hide columns per user)
6. **Row Selection** (Bulk operations)
7. **Import** (Bulk data upload)
8. **Export** (CSV, Excel, JSON with filters applied)

---

## Backend Implementation Plan

### Phase 1: Foundation & Architecture (Week 1)

#### Step 1.1: Database Schema Enhancement

**Add User Preferences Table**
```sql
CREATE TABLE user_table_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  hidden_columns JSONB DEFAULT '[]',
  page_size INTEGER DEFAULT 20,
  default_sort_column VARCHAR(100),
  default_sort_direction VARCHAR(4) DEFAULT 'asc',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, table_name)
);

CREATE INDEX idx_user_table_prefs ON user_table_preferences(user_id, table_name);
```

**Add Import History Table** (Optional - for audit trail)
```sql
CREATE TABLE import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  file_name VARCHAR(255),
  records_imported INTEGER,
  records_failed INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  error_log JSONB,
  imported_at TIMESTAMP DEFAULT NOW()
);
```

#### Step 1.2: Create Reusable Base Service Pattern

**File:** `src/backend/services/base/data-table-service.ts`

```typescript
// Reusable query builder to avoid repetition
export interface DataTableQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  globalSearch?: string;
  columnFilters?: Array<{
    column: string;
    mode: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty';
    value?: string;
  }>;
  hiddenColumns?: string[];
}

export interface DataTableResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
  };
  sort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

// Base service class - all entity services extend this
export abstract class BaseDataTableService<T> {
  abstract tableName: string;
  abstract searchableColumns: string[];
  abstract sortableColumns: string[];
  abstract filterableColumns: string[];

  // Reusable query builder
  protected buildQuery(query: DataTableQuery): string {
    // SQL query construction logic shared across all entities
    // Returns parameterized SQL with WHERE, ORDER BY, LIMIT, OFFSET
  }

  // Reusable pagination calculator
  protected calculatePagination(total: number, page: number, pageSize: number) {
    return {
      page,
      pageSize,
      totalRows: total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Abstract methods each entity must implement
  abstract getAll(query: DataTableQuery): Promise<DataTableResponse<T>>;
  abstract getById(id: string): Promise<T>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
  abstract bulkImport(data: Partial<T>[]): Promise<{ success: number; failed: number }>;
}
```

**Why this pattern?**
- ✅ Eliminates 80% of code repetition across entities
- ✅ Enforces consistent API structure
- ✅ Easy to add new entities (just extend the class)
- ✅ Centralizes query optimization

---

### Phase 2: Entity-Specific Implementation (Week 2-3)

**For each entity (Jobs, Departments, Employees, etc.), follow this pattern:**

#### Step 2.1: Create Entity Service

**File:** `src/backend/services/jobs-service.ts`

```typescript
import { BaseDataTableService, DataTableQuery, DataTableResponse } from './base/data-table-service';

export class JobsService extends BaseDataTableService<Job> {
  tableName = 'jobs';
  searchableColumns = ['title', 'department_name'];
  sortableColumns = ['title', 'department_name', 'is_active', 'updated_at'];
  filterableColumns = ['department_name', 'is_active'];

  async getAll(query: DataTableQuery): Promise<DataTableResponse<Job>> {
    // Use base buildQuery method
    const sql = this.buildQuery(query);
    const jobs = await db.query(sql);
    const total = await db.query('SELECT COUNT(*) FROM jobs');
    
    return {
      data: jobs,
      pagination: this.calculatePagination(total, query.page || 1, query.pageSize || 20),
      sort: query.sortBy ? { column: query.sortBy, direction: query.sortDirection || 'asc' } : undefined,
    };
  }

  async getById(id: string): Promise<Job> {
    return db.query('SELECT * FROM jobs WHERE id = $1', [id]);
  }

  async create(data: Partial<Job>): Promise<Job> {
    return db.query('INSERT INTO jobs ... RETURNING *', [data]);
  }

  async update(id: string, data: Partial<Job>): Promise<Job> {
    return db.query('UPDATE jobs SET ... WHERE id = $1 RETURNING *', [data, id]);
  }

  async delete(id: string): Promise<void> {
    await db.query('DELETE FROM jobs WHERE id = $1', [id]);
  }

  async bulkImport(data: Partial<Job>[]): Promise<{ success: number; failed: number }> {
    // Transaction-based bulk insert with error handling
    let success = 0;
    let failed = 0;
    
    for (const job of data) {
      try {
        await this.create(job);
        success++;
      } catch (error) {
        failed++;
      }
    }
    
    return { success, failed };
  }
}
```

**Time estimate per entity:** 4-6 hours

---

#### Step 2.2: Create API Routes/Controllers

**File:** `src/backend/routes/jobs.ts` (or `src/app/api/jobs/route.ts` for Next.js)

```typescript
import { JobsService } from '@/backend/services/jobs-service';

const jobsService = new JobsService();

// GET /api/jobs - List with query params
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const query = {
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('pageSize') || '20'),
    sortBy: searchParams.get('sortBy') || undefined,
    sortDirection: searchParams.get('sortDirection') as 'asc' | 'desc' || 'asc',
    globalSearch: searchParams.get('search') || undefined,
    columnFilters: JSON.parse(searchParams.get('filters') || '[]'),
  };

  const result = await jobsService.getAll(query);
  return Response.json(result);
}

// GET /api/jobs/:id - Get single record
export async function GET_BY_ID(id: string) {
  const job = await jobsService.getById(id);
  return Response.json(job);
}

// POST /api/jobs - Create
export async function POST(request: Request) {
  const data = await request.json();
  const job = await jobsService.create(data);
  return Response.json(job, { status: 201 });
}

// PUT /api/jobs/:id - Update
export async function PUT(id: string, request: Request) {
  const data = await request.json();
  const job = await jobsService.update(id, data);
  return Response.json(job);
}

// DELETE /api/jobs/:id - Delete
export async function DELETE(id: string) {
  await jobsService.delete(id);
  return Response.json({ success: true }, { status: 204 });
}

// POST /api/jobs/import - Bulk import
export async function POST_IMPORT(request: Request) {
  const { data } = await request.json();
  const result = await jobsService.bulkImport(data);
  return Response.json(result);
}

// GET /api/jobs/export - Export (applies same filters)
export async function GET_EXPORT(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv'; // csv, xlsx, json
  
  // Get ALL data with filters (no pagination)
  const query = {
    page: 1,
    pageSize: 999999,
    sortBy: searchParams.get('sortBy') || undefined,
    sortDirection: searchParams.get('sortDirection') as 'asc' | 'desc' || 'asc',
    globalSearch: searchParams.get('search') || undefined,
    columnFilters: JSON.parse(searchParams.get('filters') || '[]'),
  };

  const result = await jobsService.getAll(query);
  
  // Convert to requested format
  const file = await convertToFormat(result.data, format);
  return new Response(file, {
    headers: {
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="jobs-export.${format}"`,
    },
  });
}
```

**Repeat for:** Departments, Employees, etc.

**Time estimate per entity:** 2-3 hours

---

### Phase 3: User Preferences (Week 3)

#### Step 3.1: Create Preferences Service

**File:** `src/backend/services/user-preferences-service.ts`

```typescript
export class UserPreferencesService {
  async getPreferences(userId: string, tableName: string) {
    return db.query(
      'SELECT * FROM user_table_preferences WHERE user_id = $1 AND table_name = $2',
      [userId, tableName]
    );
  }

  async savePreferences(userId: string, tableName: string, preferences: {
    hiddenColumns?: string[];
    pageSize?: number;
    defaultSort?: { column: string; direction: string };
  }) {
    return db.query(
      `INSERT INTO user_table_preferences (user_id, table_name, hidden_columns, page_size, default_sort_column, default_sort_direction)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, table_name)
       DO UPDATE SET
         hidden_columns = $3,
         page_size = $4,
         default_sort_column = $5,
         default_sort_direction = $6,
         updated_at = NOW()
       RETURNING *`,
      [userId, tableName, preferences.hiddenColumns, preferences.pageSize, preferences.defaultSort?.column, preferences.defaultSort?.direction]
    );
  }
}
```

#### Step 3.2: Create Preferences API

**File:** `src/backend/routes/user-preferences.ts`

```typescript
// GET /api/preferences/:tableName
// PUT /api/preferences/:tableName
```

---

### Phase 4: Advanced Features (Week 4)

#### Step 4.1: Implement Export with Streaming (for large datasets)

```typescript
export async function GET_EXPORT_STREAM(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      // Stream data in chunks to avoid memory issues
      const CHUNK_SIZE = 1000;
      let page = 1;
      
      while (true) {
        const chunk = await jobsService.getAll({ page, pageSize: CHUNK_SIZE });
        if (chunk.data.length === 0) break;
        
        controller.enqueue(convertChunkToCSV(chunk.data));
        page++;
      }
      
      controller.close();
    },
  });

  return new Response(stream);
}
```

#### Step 4.2: Implement Import with Validation & Progress

```typescript
export async function POST_IMPORT_WITH_VALIDATION(request: Request) {
  const { data } = await request.json();
  
  // Step 1: Validate all rows
  const validationResults = await validateImportData(data);
  
  if (validationResults.errors.length > 0) {
    return Response.json({
      status: 'validation_failed',
      errors: validationResults.errors,
    }, { status: 400 });
  }
  
  // Step 2: Import in transaction
  const result = await jobsService.bulkImport(data);
  
  // Step 3: Record in history
  await importHistoryService.create({
    userId,
    tableName: 'jobs',
    recordsImported: result.success,
    recordsFailed: result.failed,
    status: 'completed',
  });
  
  return Response.json(result);
}
```

---

## Frontend Migration Plan

### Phase 1: Create API Client Layer (Week 1)

#### Step 1.1: Create Base API Client

**File:** `src/frontend_lib/api/base-data-table-client.ts`

```typescript
export interface ApiDataTableQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  filters?: Array<{ column: string; mode: string; value?: string }>;
}

export class BaseDataTableClient<T> {
  constructor(protected baseUrl: string) {}

  async getAll(query: ApiDataTableQuery): Promise<{
    data: T[];
    pagination: {
      page: number;
      pageSize: number;
      totalRows: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortDirection) params.append('sortDirection', query.sortDirection);
    if (query.search) params.append('search', query.search);
    if (query.filters) params.append('filters', JSON.stringify(query.filters));

    const response = await fetch(`${this.baseUrl}?${params}`);
    return response.json();
  }

  async getById(id: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.json();
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
  }

  async bulkImport(data: Partial<T>[]): Promise<{ success: number; failed: number }> {
    const response = await fetch(`${this.baseUrl}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return response.json();
  }

  async export(query: ApiDataTableQuery, format: 'csv' | 'xlsx' | 'json'): Promise<Blob> {
    const params = new URLSearchParams();
    // ... same as getAll
    params.append('format', format);

    const response = await fetch(`${this.baseUrl}/export?${params}`);
    return response.blob();
  }
}
```

#### Step 1.2: Create Entity-Specific Clients

**File:** `src/frontend_lib/api/jobs-client.ts`

```typescript
export class JobsClient extends BaseDataTableClient<Job> {
  constructor() {
    super('/api/jobs');
  }
}

export const jobsApi = new JobsClient();
```

---

### Phase 2: Create Server-Side DataTable Hook (Week 2)

**File:** `src/frontend_lib/components/shared/data-table/use-server-data-table.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { BaseDataTableClient } from '@/frontend_lib/api/base-data-table-client';

export function useServerDataTable<T>(client: BaseDataTableClient<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalRows: 0,
    totalPages: 0,
  });
  const [sorting, setSorting] = useState<{ column?: string; direction?: 'asc' | 'desc' }>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await client.getAll({
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: sorting.column,
        sortDirection: sorting.direction,
        search: globalFilter,
        filters: columnFilters,
      });
      
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [client, pagination.page, pagination.pageSize, sorting, globalFilter, columnFilters]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    pagination,
    sorting,
    globalFilter,
    columnFilters,
    setPagination,
    setSorting,
    setGlobalFilter,
    setColumnFilters,
    refetch: fetchData,
  };
}
```

---

### Phase 3: Create ServerDataTable Component (Week 2-3)

**File:** `src/frontend_lib/components/shared/data-table/server-data-table.tsx`

```typescript
import { useServerDataTable } from './use-server-data-table';
import { BaseDataTableClient } from '@/frontend_lib/api/base-data-table-client';

interface ServerDataTableProps<T> {
  client: BaseDataTableClient<T>;
  columns: ColumnDef<T>[];
  // ... other props same as current DataTable
}

export function ServerDataTable<T>({
  client,
  columns,
  ...otherProps
}: ServerDataTableProps<T>) {
  const {
    data,
    loading,
    pagination,
    sorting,
    globalFilter,
    setGlobalFilter,
    setPagination,
    setSorting,
    refetch,
  } = useServerDataTable(client);

  // Rest of the component looks similar to current DataTable
  // but uses server state instead of TanStack's built-in state

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        // ... other props
      />
      
      <DataTableDisplayFactory
        data={data}
        columns={columns}
        loading={loading}
        // ... other props
      />
      
      <DataTablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalRows={pagination.totalRows}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        onPageSizeChange={(pageSize) => setPagination({ ...pagination, pageSize, page: 1 })}
      />
    </div>
  );
}
```

---

### Phase 4: Migrate Pages to Use Server Components (Week 3-4)

**Before (Client-side):**
```typescript
function JobsPage() {
  return (
    <DataViewLayout 
      data={JOBS_DATA}  // ❌ All data loaded client-side
      columns={jobsColumns}
      ...
    />
  );
}
```

**After (Server-side):**
```typescript
import { jobsApi } from '@/frontend_lib/api/jobs-client';

function JobsPage() {
  return (
    <DataViewLayout 
      client={jobsApi}  // ✅ Data fetched from server
      columns={jobsColumns}
      serverSide  // ✅ Enable server-side mode
      ...
    />
  );
}
```

---

## Testing Strategy

### Backend Tests

**File:** `src/backend/services/__tests__/jobs-service.test.ts`

```typescript
describe('JobsService', () => {
  describe('getAll', () => {
    it('should return paginated results', async () => {
      const result = await jobsService.getAll({ page: 1, pageSize: 10 });
      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by global search', async () => {
      const result = await jobsService.getAll({ search: 'Engineer' });
      expect(result.data.every(job => job.title.includes('Engineer'))).toBe(true);
    });

    it('should sort by column', async () => {
      const result = await jobsService.getAll({ sortBy: 'title', sortDirection: 'asc' });
      // Verify sorting order
    });
  });

  describe('bulkImport', () => {
    it('should import valid records', async () => {
      const result = await jobsService.bulkImport([{ title: 'Test Job' }]);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
    });
  });
});
```

### Frontend Tests

**File:** `src/frontend_lib/components/shared/data-table/__tests__/server-data-table.test.tsx`

```typescript
describe('ServerDataTable', () => {
  it('should fetch data on mount', async () => {
    render(<ServerDataTable client={mockClient} columns={columns} />);
    await waitFor(() => {
      expect(mockClient.getAll).toHaveBeenCalled();
    });
  });

  it('should refetch when page changes', async () => {
    // Test pagination interactions
  });
});
```

---

## Library Extraction Preparation

### Structure for Future npm Package

```
@your-org/data-table/
├── src/
│   ├── components/
│   │   ├── data-table.tsx           ← Main component
│   │   ├── server-data-table.tsx    ← Server-side version
│   │   ├── toolbar/
│   │   ├── displays/
│   │   └── pagination/
│   ├── hooks/
│   │   ├── use-data-table.ts
│   │   └── use-server-data-table.ts
│   ├── api/
│   │   └── base-data-table-client.ts
│   ├── types/
│   └── utils/
├── package.json
├── README.md
└── tsconfig.json
```

### What to Include in Library
✅ All DataTable components  
✅ API client base classes  
✅ TypeScript types and interfaces  
✅ Styling (Tailwind or exported CSS)  
✅ Documentation and examples  

### What to Keep in Your App
✅ Entity-specific clients (JobsClient, DepartmentsClient)  
✅ Entity-specific columns configuration  
✅ Entity-specific card configurations  
✅ Business logic and API routes  

---

## Implementation Timeline

| Phase | Task | Duration | Dependencies |
|---|---|---|---|
| **Backend Week 1** | Database schema + Base service pattern | 3 days | None |
| **Backend Week 2** | Jobs entity implementation | 2 days | Week 1 |
| **Backend Week 2** | Departments entity implementation | 2 days | Week 1 |
| **Backend Week 3** | User preferences + remaining entities | 5 days | Week 1 |
| **Backend Week 4** | Advanced features (streaming, validation) | 5 days | Weeks 1-3 |
| **Frontend Week 1** | API client layer | 3 days | Backend Week 1 |
| **Frontend Week 2** | Server-side hook + component | 5 days | Backend Week 2 |
| **Frontend Week 3** | Migrate Jobs page | 2 days | Frontend Week 2 |
| **Frontend Week 3** | Migrate Departments page | 2 days | Frontend Week 2 |
| **Frontend Week 4** | Migrate remaining pages + testing | 5 days | Frontend Week 3 |

**Total Estimated Time:** 6-8 weeks (1 developer, full-time)

---

## Migration Checklist

### Backend ✓
- [ ] Create database migrations
- [ ] Implement Base service pattern
- [ ] Implement Jobs service + routes
- [ ] Implement Departments service + routes
- [ ] Implement Employees service + routes
- [ ] Implement User preferences service + routes
- [ ] Add import/export functionality
- [ ] Write backend tests
- [ ] Optimize database queries (indexes, etc.)

### Frontend ✓
- [ ] Create API client base class
- [ ] Create entity-specific API clients
- [ ] Create `useServerDataTable` hook
- [ ] Create `ServerDataTable` component
- [ ] Update DataViewLayout to support server-side mode
- [ ] Migrate Jobs page
- [ ] Migrate Departments page
- [ ] Migrate remaining pages
- [ ] Write frontend tests
- [ ] Update documentation

### Library Preparation ✓
- [ ] Organize code for extraction
- [ ] Remove app-specific dependencies
- [ ] Create separate package.json
- [ ] Write library documentation
- [ ] Publish to npm (when ready)

---

## Key Patterns to Avoid Repetition

1. **Base Service Class** - All entities extend `BaseDataTableService`
2. **Base API Client** - All entity clients extend `BaseDataTableClient`
3. **Shared Query Builder** - Single query construction method
4. **Consistent API Response Format** - All endpoints return same structure
5. **Reusable Hooks** - `useServerDataTable` works for all entities
6. **Generic Components** - ServerDataTable works with any entity type

---

## Next Steps

1. **Start with Phase 1 Backend** - Foundation work is critical
2. **Implement one complete entity end-to-end** (Jobs) before scaling
3. **Test thoroughly** before migrating other entities
4. **Document as you go** - This will help with library extraction later
5. **Keep the current client-side version** until server-side is stable

---

**Questions or need clarification?** Review this plan step-by-step before starting implementation.
