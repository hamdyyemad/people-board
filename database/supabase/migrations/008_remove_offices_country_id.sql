-- ==========================================
-- Migration: Remove Redundant offices.country_id
-- ==========================================
-- RATIONALE:
-- offices.country_id creates data redundancy since cities.country_id already defines the country.
-- Keeping both allows inconsistencies (e.g., office in Paris pointing to USA).
-- 
-- APPROACH:
-- 1) Drop offices.country_id — country is derived via offices → cities → countries.
-- 2) One JOIN to cities gives us the country; still efficient with proper indexes.
-- 3) Single source of truth: city determines country, preventing orphaned or conflicting data.
--
-- QUERY PATTERN (after migration):
-- SELECT o.*, c.name AS city_name, co.name AS country_name
-- FROM offices o
-- JOIN cities c ON o.city_id = c.id
-- JOIN countries co ON c.country_id = co.id;

-- ------------------------------------------------------------------------------------------------
-- Part A — Drop foreign key index
-- ------------------------------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_offices_country;

-- ------------------------------------------------------------------------------------------------
-- Part B — Replace unique constraint (country_id, name) → (city_id, name)
-- ------------------------------------------------------------------------------------------------
-- Migration 005 created uq_offices_country_name on (country_id, name).
-- Since we're removing country_id, replace it with (city_id, name).
-- Rationale: Same office name shouldn't exist twice in the same city.
DROP INDEX IF EXISTS uq_offices_country_name;

CREATE UNIQUE INDEX uq_offices_city_name
ON offices (city_id, name)
WHERE deleted_at IS NULL;

COMMENT ON INDEX uq_offices_city_name IS 'Ensures office names are unique within each city (excluding soft-deleted rows).';

-- ------------------------------------------------------------------------------------------------
-- Part C — Drop country_id column (FK constraint drops automatically)
-- ------------------------------------------------------------------------------------------------
ALTER TABLE offices
    DROP COLUMN country_id;

-- ------------------------------------------------------------------------------------------------
-- Part D — Add explanatory comments
-- ------------------------------------------------------------------------------------------------
COMMENT ON TABLE offices IS 'Office locations with city (which defines the country), address, and coordinates. Country is obtained via offices.city_id → cities.country_id → countries.';
COMMENT ON COLUMN offices.city_id IS 'City where the office is located; country is derived from cities.country_id.';
