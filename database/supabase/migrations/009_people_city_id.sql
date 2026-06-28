-- ==========================================
-- Migration: People — country_id → city_id
-- ==========================================
-- RATIONALE:
-- Aligns with offices (migration 008): country is derived via cities, not stored redundantly.
-- people.city_id is optional (nullable) — residence/base location when known.
--
-- QUERY PATTERN:
-- SELECT p.*, c.name AS city_name, co.name AS country_name
-- FROM people p
-- LEFT JOIN cities c ON p.city_id = c.id
-- LEFT JOIN countries co ON c.country_id = co.id;

-- ------------------------------------------------------------------------------------------------
-- Part A — Drop legacy country FK index (migration 004)
-- ------------------------------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_people_country_id;

-- ------------------------------------------------------------------------------------------------
-- Part B — Replace country_id with city_id
-- ------------------------------------------------------------------------------------------------
ALTER TABLE people
    DROP COLUMN IF EXISTS country_id;

ALTER TABLE people
    ADD COLUMN city_id UUID REFERENCES cities(id) ON DELETE RESTRICT;

CREATE INDEX idx_people_city_id
ON people (city_id);

COMMENT ON COLUMN people.city_id IS 'Optional residence/base city; country derived from cities.country_id when set.';
