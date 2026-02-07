-- Migration 015: Drop unused price columns
-- These 5 columns have zero data across all books. They duplicate
-- the existing acquired_price/lowest_price/highest_price/sales_price/estimated_value columns.

ALTER TABLE books DROP COLUMN IF EXISTS purchase_currency;
ALTER TABLE books DROP COLUMN IF EXISTS price_lowest;
ALTER TABLE books DROP COLUMN IF EXISTS price_highest;
ALTER TABLE books DROP COLUMN IF EXISTS price_sales;
ALTER TABLE books DROP COLUMN IF EXISTS price_estimated;
