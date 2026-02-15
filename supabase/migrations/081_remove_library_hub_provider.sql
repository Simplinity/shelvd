-- Remove Library Hub Discover (Cloudflare bot protection blocks API)
DELETE FROM isbn_providers WHERE code = 'library_hub';
DELETE FROM external_link_types WHERE slug = 'jisc-library-hub';
