# Database Migration Setup Guide

## Overview

This project uses a custom Node.js-based migration system to manage database schema changes. Migrations are stored in the `database/supabase/migrations/` directory and executed via the `pnpm run migrate` command.

## How Migrations Work

### Migration Files

Migration files are stored in `database/supabase/migrations/` and must follow a naming convention:
- **Format:** `NNN_description.sql` (where NNN is a sequential number starting from 000)
- **Example:** 
  - `000_migrations_table.sql` - Creates the migrations tracking table
  - `001_initial_schema.sql` - Initial database schema

### Migration Tracking

The migration system maintains a `schema_migrations` table in your Supabase database that tracks which migrations have been executed. This prevents duplicate execution and ensures migrations run in order.

### Migration Execution Flow

When you run `pnpm run migrate`, the following happens:

1. **Load Configuration** - Reads DATABASE_URL from `.env` file
2. **Validate Connection** - Verifies the DATABASE_URL format
3. **Connect to Database** - Establishes connection to Supabase
4. **Check Migration Status** - Queries `schema_migrations` table to see what's been run
5. **Execute Pending Migrations** - Runs any migrations not yet executed
6. **Update Tracking** - Records migration execution in `schema_migrations` table

## Running Migrations

### Command

```bash
pnpm run migrate
```

### What Happens

- Automatically discovers and executes all pending migrations in `database/supabase/migrations/`
- Migrations are executed in alphabetical order (000, 001, 002, etc.)
- Each migration is wrapped in a transaction for safety
- Migration execution is logged in the `schema_migrations` table

## Database Connection Setup

### Important: Supabase Connection Method

To connect to your Supabase database, you must use the **Session Provider** method instead of **Direct Connection**:

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Database**
3. Under "Connection String", select **Session Provider** from the dropdown (NOT "Direct Connection")
4. Copy the PostgreSQL connection string
5. Update your `.env` file with this URL

### Why Session Provider?

- **Session Provider** uses connection pooling via Supabase's PgBouncer
- Better for applications that make many short-lived connections
- More reliable for migration scripts that connect, execute, and disconnect
- **Direct Connection** directly connects to the primary database and may be blocked by connection limits

### DATABASE_URL Format

The SESSION PROVIDER connection string will look like:

```
postgresql://postgres.{project_id}:{password}@{pooler_host}.supabase.com:6543/postgres
```

Example:
```
postgresql://postgres.abc123def456:mySecurePassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Setting Up .env for Migrations

### Step 1: Get Database URL from Supabase

1. Log in to your Supabase dashboard
2. Navigate to your project
3. Go to **Settings** → **Database**
4. Click on **Connection Pooling** section
5. Select **Session mode** from the mode selector
6. Copy the postgresql connection string

### Step 2: Create/Update .env File

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres.{your_project_id}:{your_password}@{your_pooler_host}.supabase.com:6543/postgres
```

### Step 3: Run Migrations

```bash
pnpm run migrate
```

## Creating New Migrations

To create a new migration:

1. Create a new `.sql` file in `database/supabase/migrations/`
2. Use the next sequential number (e.g., if the last migration is `001_initial_schema.sql`, create `002_your_feature.sql`)
3. Write your SQL migration code
4. Run `pnpm run migrate` to execute it

### Migration File Template

```sql
-- Migration: NNN_description
-- Description: What this migration does
-- Author: Your Name
-- Date: YYYY-MM-DD

BEGIN;

-- Your SQL statements here
CREATE TABLE IF NOT EXISTS my_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMIT;
```

## Troubleshooting

### "Connection failed" or "getaddrinfo ENOENT"

- Verify the DATABASE_URL is correct and uses **Session Provider** (check the domain)
- Ensure your Supabase project is active
- Check network connectivity to Supabase servers
- Verify the password in DATABASE_URL has no special characters that need escaping

### "schema_migrations" table doesn't exist

- The first migration (`000_migrations_table.sql`) creates this table automatically
- If missing, it will be created on your first run

### Migrations not running

- Check that migration files are in `database/supabase/migrations/` with correct naming (NNN_name.sql)
- Verify file names don't have spaces or special characters
- Ensure sequential numbering is correct

## Script Implementation Details

The migration system is implemented in:

- **Main entry point:** `scripts/database/run-migrations.js`
- **Helper functions:** `scripts/database/helpers/get-migration-dir.js`
- **Config loader:** `scripts/database/config/`
- **Migration engine:** `scripts/database/engine/orchestrator/migration-runner.js`
- **Database adapter:** `scripts/database/engine/adapters/supabase-adapter.js`

These scripts handle:
- Connection string validation
- Database connectivity
- Migration file discovery and ordering
- Transaction management
- Error handling and logging

## Next Steps: Database Seeding

After running migrations to create your database schema, you'll typically want to seed the database with initial data.

**See:** [Database Seeding Setup Guide](../seed/README.md)

The seeding system works alongside migrations:
1. **Migrations** create the database structure (tables, indexes, etc.)
2. **Seeds** populate those tables with initial data (departments, countries, etc.)

### Quick Start

```bash
# Run migrations first (creates schema)
pnpm run db  # Select [1] Run Migrations

# Then run seeds (populates data)
pnpm run db  # Select [2] Run Seeds
```

Or run directly:
```bash
pnpm run migrate  # Create schema
pnpm run seed     # Populate data
```
