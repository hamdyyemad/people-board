-- ==========================================
-- Schema: Seeding Tracking Table
-- ==========================================
-- This table tracks which seed files have been executed
-- Used to prevent re-seeding and ensure idempotency
-- 
-- Note: This file should always be named 000_seeding_table.sql
-- to ensure it runs first

CREATE TABLE IF NOT EXISTS public.schema_seeds (
    id BIGSERIAL PRIMARY KEY,
    seed_name TEXT NOT NULL UNIQUE,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Add comment for documentation
COMMENT ON TABLE public.schema_seeds IS 'Tracks execution history of seed files';
COMMENT ON COLUMN public.schema_seeds.seed_name IS 'Name of the seed file (e.g., 001_departments.sql)';
COMMENT ON COLUMN public.schema_seeds.executed_at IS 'Timestamp when the seed was executed';

ALTER TABLE public.schema_seeds ENABLE ROW LEVEL SECURITY;
