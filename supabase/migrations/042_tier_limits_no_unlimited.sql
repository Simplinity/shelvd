-- Migration 042: Replace unlimited (-1) with concrete maximums
-- Simpler to reason about, no edge cases in code

-- Collector Pro: was unlimited tags, now 1000
UPDATE tier_limits SET limit_value = 1000 WHERE tier = 'collector_pro' AND limit_key = 'max_tags';

-- Dealer: was unlimited books, now 100000
UPDATE tier_limits SET limit_value = 100000 WHERE tier = 'dealer' AND limit_key = 'max_books';

-- Dealer: was unlimited tags, now 1000
UPDATE tier_limits SET limit_value = 1000 WHERE tier = 'dealer' AND limit_key = 'max_tags';
