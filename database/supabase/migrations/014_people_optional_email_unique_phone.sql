-- Make email optional; enforce uniqueness only when contact values are present.
ALTER TABLE people ALTER COLUMN email DROP NOT NULL;

DROP INDEX IF EXISTS unique_active_email;
CREATE UNIQUE INDEX unique_active_email ON people (email)
  WHERE deleted_at IS NULL AND email IS NOT NULL;

CREATE UNIQUE INDEX unique_active_phone ON people (phone_number)
  WHERE deleted_at IS NULL AND phone_number IS NOT NULL;
