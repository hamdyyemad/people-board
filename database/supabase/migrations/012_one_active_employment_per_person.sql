-- Enforce at most one non-terminal employment per person (re-hire allowed after terminated/retired).
-- Resolve any existing duplicate active rows before applying this migration.
CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_active_per_person
ON employees (person_id)
WHERE deleted_at IS NULL
  AND status NOT IN ('terminated', 'retired');
