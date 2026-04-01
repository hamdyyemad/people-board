-- Composite indexes for cursor-based pagination (created_at, id).
-- Tie-break on id when created_at ties; DESC matches typical "newest first" ordering.
-- Partial indexes include only non–soft-deleted rows for list endpoints that hide deleted records.

-- countries (no soft delete)
CREATE INDEX idx_countries_created_id
ON countries (created_at DESC, id DESC);

-- offices
CREATE INDEX idx_offices_created_id
ON offices (created_at DESC, id DESC);

CREATE INDEX idx_offices_active_created_id
ON offices (created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- departments
CREATE INDEX idx_departments_created_id
ON departments (created_at DESC, id DESC);

CREATE INDEX idx_departments_active_created_id
ON departments (created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- jobs
CREATE INDEX idx_jobs_created_id
ON jobs (created_at DESC, id DESC);

CREATE INDEX idx_jobs_active_created_id
ON jobs (created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- people
CREATE INDEX idx_people_created_id
ON people (created_at DESC, id DESC);

CREATE INDEX idx_people_active_created_id
ON people (created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- employees
CREATE INDEX idx_employees_created_id
ON employees (created_at DESC, id DESC);

CREATE INDEX idx_employees_active_created_id
ON employees (created_at DESC, id DESC)
WHERE deleted_at IS NULL;

-- employee_compensation (no soft delete)
CREATE INDEX idx_employee_compensation_created_id
ON employee_compensation (created_at DESC, id DESC);

-- employee_status_history (no soft delete)
CREATE INDEX idx_employee_status_history_created_id
ON employee_status_history (created_at DESC, id DESC);

-- attachments
CREATE INDEX idx_attachments_created_id
ON attachments (created_at DESC, id DESC);

CREATE INDEX idx_attachments_active_created_id
ON attachments (created_at DESC, id DESC)
WHERE deleted_at IS NULL;
