-- ==========================================
-- Migration: Cities + offices.city → city_id
-- ==========================================
-- 1) cities: normalized place names within a country (FK to countries).
-- 2) offices: replace free-text city with city_id referencing cities.
-- Existing office rows are migrated via DISTINCT (country_id, city) → cities, then UPDATE.

-- ------------------------------------------------------------------------------------------------
-- Part A — cities table
-- ------------------------------------------------------------------------------------------------
CREATE TABLE cities (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id   UUID NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    name         TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_cities_country_name
ON cities (country_id, name);

CREATE INDEX idx_cities_country
ON cities (country_id);

COMMENT ON TABLE cities IS 'City or locality name scoped to a country; used by offices.city_id.';
COMMENT ON COLUMN cities.name IS 'Display name of the city (unique per country).';

-- ------------------------------------------------------------------------------------------------
-- Part B — backfill cities from current offices, then repoint offices
-- ------------------------------------------------------------------------------------------------
INSERT INTO cities (country_id, name, created_at, updated_at)
SELECT DISTINCT o.country_id, o.city, NOW(), NOW()
FROM offices o;

ALTER TABLE offices
    ADD COLUMN city_id UUID REFERENCES cities(id) ON DELETE RESTRICT;

UPDATE offices o
SET city_id = c.id
FROM cities c
WHERE c.country_id = o.country_id
  AND c.name = o.city;

ALTER TABLE offices
    DROP COLUMN city;

ALTER TABLE offices
    ALTER COLUMN city_id SET NOT NULL;

CREATE INDEX idx_offices_city
ON offices (city_id);

-- ------------------------------------------------------------------------------------------------
-- Part C — RLS (same pattern as countries / offices reference data)
-- ------------------------------------------------------------------------------------------------
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY cities_policy_read_all
ON cities FOR SELECT
USING (true);

CREATE POLICY cities_policy_no_write
ON cities FOR INSERT
WITH CHECK (false);
