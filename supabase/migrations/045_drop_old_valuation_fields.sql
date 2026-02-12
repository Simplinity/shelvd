-- Migration 045: Drop deprecated valuation fields from books table
-- These fields have been replaced by the valuation_history table (migrations 043-044).
-- All data was migrated in 044. Code no longer reads/writes these columns.

ALTER TABLE books DROP COLUMN IF EXISTS lowest_price;
ALTER TABLE books DROP COLUMN IF EXISTS highest_price;
ALTER TABLE books DROP COLUMN IF EXISTS estimated_value;
ALTER TABLE books DROP COLUMN IF EXISTS valuation_date;
