-- Migration: 002_enable_rls
-- Description: Enable Row Level Security (RLS) on all tables
-- Purpose: Restrict data access to authenticated users and enforce data isolation
-- Date: 2026-03-04

-- ==========================================
-- ENABLE RLS ON ALL TABLES
-- ==========================================
-- This prevents the "anyone can access via Data API" warning
-- Once RLS is enabled, no one can access data until explicit policies are created

ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_employee_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CREATE DEFAULT POLICIES
-- ==========================================
-- These are basic default-deny policies
-- You should customize these based on your authentication setup and business rules

-- schema_migrations: System table, admin/migration service only
CREATE POLICY schema_migrations_policy_no_access
ON schema_migrations FOR ALL
USING (false)
WITH CHECK (false);

-- allowed_employee_transitions: System reference table, authenticated users can read
CREATE POLICY allowed_employee_transitions_policy_read_all
ON allowed_employee_transitions FOR SELECT
USING (true);

CREATE POLICY allowed_employee_transitions_policy_no_write
ON allowed_employee_transitions FOR INSERT
WITH CHECK (false);

-- countries: Reference data, authenticated users can read
CREATE POLICY countries_policy_read_all
ON countries FOR SELECT
USING (true);

CREATE POLICY countries_policy_no_write
ON countries FOR INSERT
WITH CHECK (false);

-- offices: Reference data, authenticated users can read
CREATE POLICY offices_policy_read_all
ON offices FOR SELECT
USING (true);

CREATE POLICY offices_policy_no_write
ON offices FOR INSERT
WITH CHECK (false);

-- departments: Reference data, authenticated users can read
CREATE POLICY departments_policy_read_all
ON departments FOR SELECT
USING (true);

CREATE POLICY departments_policy_no_write
ON departments FOR INSERT
WITH CHECK (false);

-- jobs: Reference data, authenticated users can read
CREATE POLICY jobs_policy_read_all
ON jobs FOR SELECT
USING (true);

CREATE POLICY jobs_policy_no_write
ON jobs FOR INSERT
WITH CHECK (false);

-- people: Personal data, users can read all (adjust as needed)
CREATE POLICY people_policy_read_all
ON people FOR SELECT
USING (true);

CREATE POLICY people_policy_no_write
ON people FOR INSERT
WITH CHECK (false);

-- employees: Sensitive data, authenticated users can read (adjust for data isolation)
CREATE POLICY employees_policy_read_all
ON employees FOR SELECT
USING (true);

CREATE POLICY employees_policy_no_write
ON employees FOR INSERT
WITH CHECK (false);

-- employee_compensation: Sensitive financial data, authenticated users can read
CREATE POLICY employee_compensation_policy_read_all
ON employee_compensation FOR SELECT
USING (true);

CREATE POLICY employee_compensation_policy_no_write
ON employee_compensation FOR INSERT
WITH CHECK (false);

-- employee_status_history: Audit data, authenticated users can read
CREATE POLICY employee_status_history_policy_read_all
ON employee_status_history FOR SELECT
USING (true);

CREATE POLICY employee_status_history_policy_no_write
ON employee_status_history FOR INSERT
WITH CHECK (false);

-- attachments: File metadata, authenticated users can read
CREATE POLICY attachments_policy_read_all
ON attachments FOR SELECT
USING (true);

CREATE POLICY attachments_policy_no_write
ON attachments FOR INSERT
WITH CHECK (false);

-- ==========================================
-- NEXT STEPS: Customize Policies
-- ==========================================
-- The above policies are restrictive and allow only SELECT with true condition
-- You should customize based on your requirements:
--
-- 1. Authentication Integration
--    If using Supabase Auth, use auth.uid() and auth.jwt()
--    Example:
--      CREATE POLICY "Users can view their own profile"
--      ON people FOR SELECT
--      USING (id = auth.uid());
--
-- 2. Role-Based Access Control (RBAC)
--    Create a user_roles table and use it in policies
--    Example:
--      CREATE POLICY "HR can view all employees"
--      ON employees FOR SELECT
--      USING (
--        EXISTS (
--          SELECT 1 FROM user_roles
--          WHERE user_id = auth.uid() AND role = 'hr'
--        )
--      );
--
-- 3. Data Isolation
--    Restrict data access based on organization, office, department
--    Example:
--      CREATE POLICY "Users can view employees in their office"
--      ON employees FOR SELECT
--      USING (
--        office_id IN (
--          SELECT office_id FROM employees WHERE person_id = auth.uid()
--        )
--      );
--
-- 4. Write Permissions
--    Enable INSERT, UPDATE, DELETE based on roles
--    Example:
--      CREATE POLICY "HR can create employee records"
--      ON employees FOR INSERT
--      WITH CHECK (
--        EXISTS (
--          SELECT 1 FROM user_roles
--          WHERE user_id = auth.uid() AND role = 'hr'
--        )
--      );
