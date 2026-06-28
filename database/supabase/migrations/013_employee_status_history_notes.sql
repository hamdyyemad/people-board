-- manual_note: optional note entered by a user (HR/admin).
-- system_note: optional note generated automatically by the application.
ALTER TABLE employee_status_history
  ADD COLUMN manual_note TEXT,
  ADD COLUMN system_note TEXT;
