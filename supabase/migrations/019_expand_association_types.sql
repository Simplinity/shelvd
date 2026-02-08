-- Expand association_type CHECK constraint with new types
ALTER TABLE provenance_entries DROP CONSTRAINT IF EXISTS provenance_entries_association_type_check;
ALTER TABLE provenance_entries ADD CONSTRAINT provenance_entries_association_type_check
  CHECK (association_type IN (
    'none', 'dedication_copy', 'association_copy', 'presentation_copy',
    'inscribed', 'signed', 'authors_copy', 'annotated',
    'from_notable_collection', 'ex_library', 'review_copy',
    'subscriber_copy', 'prize_copy', 'working_copy'
  ));
