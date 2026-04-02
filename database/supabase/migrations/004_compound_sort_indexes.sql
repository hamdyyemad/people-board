-- Compound indexes for cursor-based pagination with arbitrary sort columns.
--
-- Migration 003 covered the default (created_at DESC, id DESC) tiebreaker.
-- This migration adds:
--   1. Composite sort indexes (sort_col, created_at, id) for keyset pagination.
--   2. Missing FK join indexes — PostgreSQL does NOT auto-create indexes on FK
--      columns, so JOINs on unindexed FKs cause sequential scans.
--
-- Partial (WHERE deleted_at IS NULL) variants are added for tables that
-- have soft-delete columns, since list endpoints filter on active rows.

-- =========================================================================
-- PART A: Missing FK / JOIN indexes
-- =========================================================================
-- PostgreSQL creates indexes for PRIMARY KEY and UNIQUE constraints only,
-- NOT for REFERENCES (foreign key) columns. The initial schema (001) added
-- explicit FK indexes for some columns but missed others.
--
-- Audit of all FK columns:
--   offices.country_id      → idx_offices_country       ✓ (001)
--   departments.parent_id   → MISSING                   ← added below
--   jobs.department_id      → idx_jobs_dept             ✓ (001)
--   people.country_id       → MISSING                   ← added below
--   employees.person_id     → idx_employees_person      ✓ (001)
--   employees.job_id        → MISSING                   ← added below
--   employees.office_id     → MISSING                   ← added below
--   employees.manager_id    → idx_employees_manager     ✓ (001)
--   emp_compensation.emp_id → idx_comp_employee         ✓ (001)
--   emp_status_hist.emp_id  → idx_employee_history_emp  ✓ (001)

-- departments.parent_id  (self-join for parentName)
CREATE INDEX idx_departments_parent_id
ON departments (parent_id);

-- Covering index: when the query joins child→parent and only needs the
-- parent's name (e.g. for parentName display or sort), Postgres can
-- satisfy the join + column read from this single index without touching
-- the heap. (id is the join key, name is the INCLUDEd payload)
CREATE INDEX idx_departments_covering_parent_name
ON departments (id) INCLUDE (name)
WHERE deleted_at IS NULL;

-- people.country_id  (join to countries for country name)
CREATE INDEX idx_people_country_id
ON people (country_id);

-- employees.job_id  (join to jobs for job title)
CREATE INDEX idx_employees_job_id
ON employees (job_id);

-- employees.office_id  (join to offices for office name)
CREATE INDEX idx_employees_office_id
ON employees (office_id);

-- =========================================================================
-- PART B: Compound sort indexes for cursor-based pagination
-- =========================================================================

-- =========================================================================
-- departments
-- =========================================================================
-- sortBy=name (primary sort column for alphabetical listing)
CREATE INDEX idx_departments_name_created_id
ON departments (name ASC, created_at DESC, id DESC);

CREATE INDEX idx_departments_name_active
ON departments (name ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=updatedAt
CREATE INDEX idx_departments_updated_created_id
ON departments (updated_at DESC, created_at DESC, id DESC);

CREATE INDEX idx_departments_updated_active
ON departments (updated_at DESC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- =========================================================================
-- jobs
-- =========================================================================
-- sortBy=title
CREATE INDEX idx_jobs_title_created_id
ON jobs (title ASC, created_at DESC, id DESC);

CREATE INDEX idx_jobs_title_active
ON jobs (title ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=updatedAt
CREATE INDEX idx_jobs_updated_created_id
ON jobs (updated_at DESC, created_at DESC, id DESC);

CREATE INDEX idx_jobs_updated_active
ON jobs (updated_at DESC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- =========================================================================
-- offices
-- =========================================================================
-- sortBy=name
CREATE INDEX idx_offices_name_created_id
ON offices (name ASC, created_at DESC, id DESC);

CREATE INDEX idx_offices_name_active
ON offices (name ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=updatedAt
CREATE INDEX idx_offices_updated_created_id
ON offices (updated_at DESC, created_at DESC, id DESC);

CREATE INDEX idx_offices_updated_active
ON offices (updated_at DESC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- =========================================================================
-- countries (no soft delete)
-- =========================================================================
-- sortBy=name
CREATE INDEX idx_countries_name_created_id
ON countries (name ASC, created_at DESC, id DESC);

-- sortBy=isoCode
CREATE INDEX idx_countries_iso_created_id
ON countries (iso_code ASC, created_at DESC, id DESC);

-- =========================================================================
-- people
-- =========================================================================
-- sortBy=firstName
CREATE INDEX idx_people_firstname_created_id
ON people (first_name ASC, created_at DESC, id DESC);

CREATE INDEX idx_people_firstname_active
ON people (first_name ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=lastName
CREATE INDEX idx_people_lastname_created_id
ON people (last_name ASC, created_at DESC, id DESC);

CREATE INDEX idx_people_lastname_active
ON people (last_name ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=email
CREATE INDEX idx_people_email_created_id
ON people (email ASC, created_at DESC, id DESC);

CREATE INDEX idx_people_email_active
ON people (email ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=updatedAt
CREATE INDEX idx_people_updated_created_id
ON people (updated_at DESC, created_at DESC, id DESC);

CREATE INDEX idx_people_updated_active
ON people (updated_at DESC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- =========================================================================
-- employees
-- =========================================================================
-- sortBy=employeeNo
CREATE INDEX idx_employees_empno_created_id
ON employees (employee_no ASC, created_at DESC, id DESC);

CREATE INDEX idx_employees_empno_active
ON employees (employee_no ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=status
CREATE INDEX idx_employees_status_created_id
ON employees (status ASC, created_at DESC, id DESC);

CREATE INDEX idx_employees_status_active
ON employees (status ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=type
CREATE INDEX idx_employees_type_created_id
ON employees (type ASC, created_at DESC, id DESC);

CREATE INDEX idx_employees_type_active
ON employees (type ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=contractStart
CREATE INDEX idx_employees_contract_start_created_id
ON employees (contract_start ASC, created_at DESC, id DESC);

CREATE INDEX idx_employees_contract_start_active
ON employees (contract_start ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=updatedAt
CREATE INDEX idx_employees_updated_created_id
ON employees (updated_at DESC, created_at DESC, id DESC);

CREATE INDEX idx_employees_updated_active
ON employees (updated_at DESC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- =========================================================================
-- attachments
-- =========================================================================
-- sortBy=fileName
CREATE INDEX idx_attachments_filename_created_id
ON attachments (file_name ASC, created_at DESC, id DESC);

CREATE INDEX idx_attachments_filename_active
ON attachments (file_name ASC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- sortBy=updatedAt
CREATE INDEX idx_attachments_updated_created_id
ON attachments (updated_at DESC, created_at DESC, id DESC);

CREATE INDEX idx_attachments_updated_active
ON attachments (updated_at DESC, created_at DESC, id DESC)
WHERE deleted_at IS NULL;
