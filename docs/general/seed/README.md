# Database Seeding Setup Guide

## Overview

This project uses a custom Node.js-based seeding system to populate the database with initial data. Seeds are stored in the `database/supabase/seed/` directory and executed via the `pnpm run seed` command.

## How Seeding Works

### Seed Files

Seed files are stored in `database/supabase/seed/` and must follow a naming convention:
- **Format:** `NNN_description.sql` (where NNN is a sequential number starting from 001)
- **Example:**
  - `000_seeding_table.sql` - System file that creates the seed tracking table (automatic)
  - `001_departments.sql` - Seeds department hierarchy
  - `002_jobs.sql` - Seeds job titles
  - `003_countries.sql` - Seeds country data
  - etc.

### Seed Tracking

The seeding system maintains a `schema_seeds` table in your Supabase database that tracks which seed files have been executed. This prevents duplicate data inserts and ensures seeds are idempotent.

**Tracking Table Structure:**
```sql
CREATE TABLE public.schema_seeds (
    id BIGSERIAL PRIMARY KEY,
    seed_name TEXT NOT NULL UNIQUE,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Seeding Execution Flow

When you run `pnpm run seed`, the following happens:

1. **Load Configuration** - Reads DATABASE_URL from `.env` file
2. **Validate Connection** - Verifies the DATABASE_URL format
3. **Connect to Database** - Establishes connection to Supabase
4. **Ensure Tracking Table** - Creates `schema_seeds` table if it doesn't exist (from `000_seeding_table.sql`)
5. **Check Seed Status** - Queries `schema_seeds` table to see what's been executed
6. **Execute Pending Seeds** - Runs any seeds not yet executed (in numerical order)
7. **Record Execution** - Inserts seed file name into `schema_seeds` table

## Running Seeds

### Option 1: Interactive Menu (Recommended)

```bash
pnpm run db
```

Then select option `[2] Run Seeds` from the menu.

### Option 2: Direct Command

```bash
pnpm run seed
```

### What Happens

- Automatically discovers and executes all pending seed files in `database/supabase/seed/`
- Seed files are executed in numerical order (001, 002, 003, etc.)
- Each seed is wrapped in a transaction for safety
- Seed execution is recorded in the `schema_seeds` table
- Already-executed seeds are skipped (prevents duplicate inserts)

## Creating New Seed Files

### Step 1: Determine Execution Order

Decide which number to use based on dependencies:
- Seeds must be numbered in order of dependencies
- If seed B inserts data that references seed A, then A must run first

### Step 2: Create the Seed File

Create a file in `database/supabase/seed/` with the pattern `NNN_name.sql`:

```sql
-- ==========================================
-- SEED: Your Data Description (NNN)
-- ==========================================
-- Execution order: Nth (depends on X, Y)

INSERT INTO your_table (column1, column2)
VALUES 
    ('value1', 'value2'),
    ('value3', 'value4')
ON CONFLICT DO NOTHING;
```

### Step 3: Use ON CONFLICT DO NOTHING

Always use `ON CONFLICT DO NOTHING` clause to make seeds idempotent:

```sql
-- Good: Idempotent, won't fail on re-run
INSERT INTO departments (id, name) 
VALUES ('dept-1', 'Engineering')
ON CONFLICT DO NOTHING;

-- Bad: Will fail if record exists
INSERT INTO departments (id, name) 
VALUES ('dept-1', 'Engineering');
```

### Step 4: Run Seeds

```bash
pnpm run seed
```

## Execution Order Guidelines

Seeds should be executed in this general order:

```
001_departments.sql          → No dependencies
002_jobs.sql                 → Depends on: departments
003_countries.sql            → No dependencies
004_offices.sql              → Depends on: countries
005_people.sql               → Depends on: countries
006_employees.sql            → Depends on: people, jobs, offices
007_employee_compensation.sql → Depends on: employees
```

## Managing Seeds

### View Executed Seeds

Query the tracking table:

```sql
SELECT seed_name, executed_at 
FROM schema_seeds 
ORDER BY executed_at;
```

### Re-run a Specific Seed

To re-run a seed that's already been executed:

1. Delete the record from `schema_seeds`:
   ```sql
   DELETE FROM schema_seeds WHERE seed_name = '001_departments.sql';
   ```

2. Run seeds again:
   ```bash
   pnpm run seed
   ```

**Warning:** Only do this if the data is safe to delete and re-insert. Check for dependencies first!

### Reset All Seeds

To clear all seed tracking and re-run everything:

```sql
-- Delete seed tracking records
DELETE FROM schema_seeds;

-- Drop the tables created by seeds (if needed)
-- DROP TABLE IF EXISTS departments CASCADE;
```

Then run:
```bash
pnpm run seed
```

## Database Connection Setup

The seeding system uses the same database connection as migrations. Ensure your `.env` file has the `DATABASE_URL` configured:

```env
DATABASE_URL=postgresql://postgres.{your_project_id}:{your_password}@{your_pooler_host}.supabase.com:6543/postgres
```

**Important:** Use **Session Provider** connection pooling (not Direct Connection) for better reliability.

See [MIGRATION-SETUP.md](../migration/MIGRATION-SETUP.md) for detailed connection setup instructions.

## Combined Migration & Seeding Workflow

The recommended workflow for database setup is:

1. **Run Migrations** first (creates tables and schema)
   ```bash
   pnpm run db  # Select [1] Run Migrations
   ```

2. **Run Seeds** next (populates data)
   ```bash
   pnpm run db  # Select [2] Run Seeds
   ```

Or use the interactive menu to run both:
```bash
pnpm run db
```

## Troubleshooting

### Seed Hangs

If a seed is hanging:
- Check the database connection is active
- Verify the SQL syntax is correct
- Look for missing foreign key references
- Run the seed manually to see the actual error

### Data Not Inserted

- Check the `ON CONFLICT DO NOTHING` clause isn't silently failing
- Query the table directly to verify data exists
- Check the `schema_seeds` table to confirm execution was recorded

### Connection Errors

- Verify `DATABASE_URL` is set in `.env`
- Confirm the database is accessible
- Check that you're using Session Provider (not Direct Connection)

## File Structure

```
database/
  supabase/
    seed/
      000_seeding_table.sql      # System file (auto-created)
      001_departments.sql        # Seed files follow...
      002_jobs.sql
      003_countries.sql
      ...
```

## Related Documentation

- [Migration Setup Guide](../migration/MIGRATION-SETUP.md) - Database schema migrations
- Database schema: `database/supabase/migrations/001_initial_schema.sql`
