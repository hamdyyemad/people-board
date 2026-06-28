-- ==========================================
-- Migration: Auto-increment employee_no via sequence
-- ==========================================
-- employee_no is assigned by the database on INSERT when the column is omitted.
-- API clients must not supply employee_no on create; values are zero-padded to 6 digits.

CREATE SEQUENCE IF NOT EXISTS employee_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE employees
    ALTER COLUMN employee_no SET DEFAULT lpad(nextval('employee_no_seq')::text, 6, '0');

COMMENT ON SEQUENCE employee_no_seq IS 'Supplies monotonic values for employees.employee_no default (zero-padded to 6 digits).';
COMMENT ON COLUMN employees.employee_no IS 'Auto-generated on INSERT via employee_no_seq when not supplied; unique among active employees.';
