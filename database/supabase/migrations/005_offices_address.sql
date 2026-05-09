-- ==========================================
-- Migration: Offices — address & unique name per country
-- ==========================================
-- 1) Nullable street / mailing address (remote or placeholder offices may omit it).
-- 2) Active offices: unique (country_id, name); soft-deleted rows excluded so names can be reused.

-- ------------------------------------------------------------------------------------------------
-- Part A — address
-- ------------------------------------------------------------------------------------------------
ALTER TABLE offices
    ADD COLUMN address TEXT;

COMMENT ON COLUMN offices.address IS 'Physical or mailing address when applicable; NULL for remote-only or non-physical offices (country remains on country_id).';

-- ------------------------------------------------------------------------------------------------
-- Part B — unique office name within a country (non-deleted rows only)
-- ------------------------------------------------------------------------------------------------
CREATE UNIQUE INDEX uq_offices_country_name
ON offices (country_id, name)
WHERE deleted_at IS NULL;
