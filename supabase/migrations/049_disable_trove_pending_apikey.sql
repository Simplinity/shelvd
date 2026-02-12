-- Disable Trove provider until API key is approved
-- Trove requires manual API key verification by NLA
UPDATE isbn_providers SET is_enabled = false WHERE code = 'trove';
