-- ==========================================
-- Migration: employee_no TEXT → INTEGER
-- ==========================================
-- Plain incrementing numbers (1, 2, 3…) via employee_no_seq; easier for staff to remember than zero-padded text.

ALTER TABLE employees
    ALTER COLUMN employee_no DROP DEFAULT;

ALTER TABLE employees
    ALTER COLUMN employee_no TYPE INTEGER
    USING CASE
        WHEN employee_no IS NULL THEN NULL
        ELSE employee_no::integer
    END;

ALTER TABLE employees
    ALTER COLUMN employee_no SET DEFAULT nextval('employee_no_seq');

-- Keep sequence ahead of existing rows after type conversion.
SELECT setval(
    'employee_no_seq',
    COALESCE((SELECT MAX(employee_no) FROM employees), 0) + 1,
    false
);

COMMENT ON SEQUENCE employee_no_seq IS 'Supplies monotonic integer values for employees.employee_no (1, 2, 3…).';
COMMENT ON COLUMN employees.employee_no IS 'Auto-incrementing integer employee number; assigned via employee_no_seq on INSERT when omitted.';
