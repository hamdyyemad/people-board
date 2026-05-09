-- ==========================================
-- Migration: Offices — WGS 84 latitude / longitude
-- ==========================================
-- Decimal degrees (EPSG:4326), stored as NUMERIC to avoid floating-point drift.
-- Nullable for offices without a map pin; both must be NULL or both set (no half-pair).

ALTER TABLE offices
    ADD COLUMN latitude NUMERIC(10, 8),
    ADD COLUMN longitude NUMERIC(11, 8);

ALTER TABLE offices
    ADD CONSTRAINT chk_offices_latitude_range
    CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE offices
    ADD CONSTRAINT chk_offices_longitude_range
    CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

ALTER TABLE offices
    ADD CONSTRAINT chk_offices_lat_lon_both_or_neither
    CHECK (
        (latitude IS NULL AND longitude IS NULL)
        OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    );

COMMENT ON COLUMN offices.latitude IS 'WGS 84 latitude in decimal degrees (−90 … +90); NULL if no coordinates.';
COMMENT ON COLUMN offices.longitude IS 'WGS 84 longitude in decimal degrees (−180 … +180); NULL if no coordinates.';
