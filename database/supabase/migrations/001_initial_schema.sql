-- ==========================================
-- 1.a EXTENSIONS & STRICT ENUMS
-- ==========================================
-- pg_trgm
-- Adds trigram-based text search & similarity operators.
-- Used for fast fuzzy search and efficient ILIKE '%text%' queries.
-- Example:
--   SELECT * FROM people WHERE first_name % 'hamdi';
--   SELECT similarity('hamdy', 'hamdi');
-- Also enables GIN indexes for partial text search:
--   CREATE INDEX idx_people_email_trgm
--   ON people USING gin (email gin_trgm_ops);
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- citext
-- Provides case-insensitive text type (CITEXT).
-- Useful for emails or usernames where case should not matter.
-- Example:
--   email CITEXT NOT NULL
-- Now 'HAMDY@gmail.com' = 'hamdy@gmail.com'
CREATE EXTENSION IF NOT EXISTS "citext";

-- ==========================================
-- 1.b EXTENSIONS & STRICT ENUMS
-- ==========================================
CREATE TYPE employee_status AS ENUM (
    'onboarding', 'probation', 'active', 'on_leave', 'suspended', 'terminated', 'retired'
);

CREATE TYPE work_type AS ENUM ('full_time', 'part_time', 'contractor', 'intern');
CREATE TYPE attachment_entity_type AS ENUM ('person', 'employee');
CREATE TYPE record_origin_type AS ENUM ('internal', 'merger_acme', 'referral');

-- ==========================================
-- 2. WORKFLOW RULES (State Machine Enforcement)
-- ==========================================
CREATE TABLE allowed_employee_transitions (
    from_status employee_status,
    to_status   employee_status NOT NULL,
    PRIMARY KEY (from_status, to_status)
);

-- ==========================================
-- 3. DOMAIN: ORGANIZATION & INFRASTRUCTURE
-- ==========================================
CREATE TABLE countries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code     CHAR(2) UNIQUE NOT NULL, 
    name         TEXT NOT NULL,
    phone_code   TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE offices (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    country_id   UUID NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    city         TEXT NOT NULL,
    is_active    BOOLEAN DEFAULT true,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);
CREATE INDEX idx_offices_country ON offices(country_id);

CREATE TABLE departments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id    UUID REFERENCES departments(id) ON DELETE RESTRICT, 
    name         TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);
CREATE UNIQUE INDEX unique_active_dept_name ON departments(name) WHERE deleted_at IS NULL;

CREATE TABLE jobs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_jobs_dept ON jobs(department_id);

-- ==========================================
-- 4. DOMAIN: PEOPLE (Identity)
-- ==========================================
CREATE TABLE people (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone_number    TEXT,
    country_id      UUID REFERENCES countries(id) ON DELETE RESTRICT,
    -- record_origin removed from here
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
CREATE UNIQUE INDEX unique_active_email ON people(email) WHERE deleted_at IS NULL;

-- ==========================================
-- 5. DOMAIN: EMPLOYMENT & COMPENSATION
-- ==========================================
CREATE TABLE employees (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id         UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
    employee_no       TEXT, 
    job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    office_id         UUID NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    manager_id        UUID REFERENCES employees(id) ON DELETE RESTRICT, 
    status            employee_status DEFAULT 'onboarding',
    type              work_type DEFAULT 'full_time',
    record_origin     record_origin_type DEFAULT 'internal', -- Moved here
    contract_start    DATE NOT NULL,
    contract_end      DATE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ,
    CONSTRAINT valid_contract_dates CHECK (
        contract_end IS NULL OR contract_end >= contract_start
    )
);
CREATE INDEX idx_employees_person ON employees(person_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_active_employees ON employees(id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX unique_active_employee_no ON employees(employee_no) WHERE deleted_at IS NULL;

CREATE TABLE employee_compensation (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    base_salary     NUMERIC NOT NULL CHECK (base_salary >= 0),
    currency        CHAR(3) DEFAULT 'USD',
    effective_from  DATE NOT NULL,
    effective_to    DATE, 
    reason          TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_comp_employee ON employee_compensation(employee_id);

-- ==========================================
-- 6. AUDIT & STATUS HISTORY
-- ==========================================
CREATE TABLE employee_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    old_status      employee_status,
    new_status      employee_status NOT NULL,
    changed_by      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_employee_history_emp ON employee_status_history(employee_id);

-- ==========================================
-- 7. DOMAIN: ATTACHMENTS (Polymorphic)
-- ==========================================
CREATE TABLE attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type     attachment_entity_type NOT NULL,
    entity_id       UUID NOT NULL, 
    file_name       TEXT NOT NULL,
    storage_path    TEXT NOT NULL, 
    mime_type       TEXT,
    file_size       INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);
CREATE INDEX idx_attachments_polymorphic ON attachments(entity_id, entity_type);