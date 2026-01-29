-- Contributor Roles (MARC Relator Codes)
-- Source: Library of Congress MARC Code List for Relators
-- https://www.loc.gov/marc/relators/relaterm.html
-- Selected most common roles for book collections

INSERT INTO contributor_roles (name, code, description, sort_order) VALUES
  -- Primary creative roles (most common, show first)
  ('Author', 'aut', 'Person primarily responsible for creating the intellectual content of the work.', 1),
  ('Editor', 'edt', 'Person who prepares for publication a work not primarily their own.', 2),
  ('Translator', 'trl', 'Person who renders a text from one language into another.', 3),
  ('Illustrator', 'ill', 'Person who creates the pictorial content of a work.', 4),
  ('Photographer', 'pht', 'Person responsible for creating photographic works.', 5),
  
  -- Additional authorship roles
  ('Co-author', 'aut', 'Person who shares responsibility for creating intellectual content.', 6),
  ('Compiler', 'com', 'Person who produces a collection by selecting and putting together material.', 7),
  ('Adapter', 'adp', 'Person who reworks a musical composition, usually for a different medium.', 8),
  ('Contributor', 'ctb', 'Person responsible for making contributions to the content.', 9),
  ('Writer of introduction', 'win', 'Person who writes an introduction to the work.', 10),
  ('Writer of preface', 'wpr', 'Person who writes the preface of a work.', 11),
  ('Writer of foreword', 'wof', 'Person who writes a foreword to the work.', 12),
  ('Writer of afterword', 'waf', 'Person who writes an afterword to the work.', 13),
  ('Writer of supplementary textual content', 'wst', 'Person who writes supplementary textual content.', 14),
  ('Commentator', 'cmm', 'Person who provides interpretation or critical comments.', 15),
  ('Annotator', 'ann', 'Person who provides scholarly notes or explanatory matter.', 16),
  
  -- Visual arts roles
  ('Cover designer', 'cov', 'Person responsible for the design of the book cover.', 20),
  ('Book designer', 'bkd', 'Person responsible for the entire graphic design of a book.', 21),
  ('Graphic designer', 'grd', 'Person responsible for creating visual design elements.', 22),
  ('Engraver', 'egr', 'Person who cuts letters, figures, or designs on wood, stone, or metal.', 23),
  ('Etcher', 'etr', 'Person who produces prints using the etching process.', 24),
  ('Lithographer', 'ltg', 'Person who prepares the lithographic surface for printing.', 25),
  ('Woodcutter', 'wdc', 'Person who makes prints by woodcut technique.', 26),
  ('Cartographer', 'ctg', 'Person responsible for creating maps and other cartographic works.', 27),
  ('Artist', 'art', 'Person responsible for creating a work of visual art.', 28),
  ('Calligrapher', 'cll', 'Person who writes in an artistic hand.', 29),
  ('Colorist', 'clr', 'Person who adds color to drawings or prints.', 30),
  
  -- Publishing roles
  ('Publisher', 'pbl', 'Person or organization responsible for publishing the work.', 40),
  ('Printer', 'prt', 'Person or organization who prints texts.', 41),
  ('Bookseller', 'bsl', 'Person who sells books.', 42),
  ('Book producer', 'bkp', 'Person or organization responsible for the physical production.', 43),
  ('Distributor', 'dst', 'Person or organization that distributes the work.', 44),
  ('Sponsor', 'spn', 'Person or organization that sponsors some aspect of the work.', 45),
  ('Funder', 'fnd', 'Person or organization that furnished financial support.', 46),
  
  -- Academic/research roles
  ('Thesis advisor', 'ths', 'Person under whose supervision a degree candidate develops a thesis.', 50),
  ('Degree supervisor', 'dgs', 'Person overseeing a higher-level academic degree.', 51),
  ('Reviewer', 'rev', 'Person who writes reviews of works.', 52),
  ('Researcher', 'res', 'Person who conducts research for the work.', 53),
  ('Consultant', 'csl', 'Person called upon for professional advice or services.', 54),
  
  -- Editorial roles
  ('Managing editor', 'mdc', 'Person who manages editorial work on a publication.', 60),
  ('Copy editor', 'cpe', 'Person who prepares text for printing.', 61),
  ('Proofreader', 'pfr', 'Person who reads proofs for correction.', 62),
  ('Indexer', 'ind', 'Person who prepares indexes.', 63),
  ('Editorial director', 'edd', 'Person who directs the editorial work.', 64),
  
  -- Production roles
  ('Type designer', 'tyd', 'Person who designs typefaces.', 70),
  ('Typesetter', 'tps', 'Person who sets type.', 71),
  ('Papermaker', 'ppm', 'Person who makes paper.', 72),
  ('Binder', 'bnd', 'Person who binds books.', 73),
  ('Bookjacket designer', 'bjd', 'Person who designs book jackets.', 74),
  
  -- Rights and provenance
  ('Copyright holder', 'cph', 'Person or organization to whom copyright has been granted.', 80),
  ('Dedicatee', 'dte', 'Person to whom the work is dedicated.', 81),
  ('Honoree', 'hnr', 'Person in whose honor something is created.', 82),
  ('Inscriber', 'ins', 'Person who signs a book or adds inscription.', 83),
  ('Former owner', 'fmo', 'Person who previously owned the item.', 84),
  ('Donor', 'dnr', 'Person who donated the item.', 85),
  ('Collector', 'col', 'Person who assembled a collection.', 86),
  ('Curator', 'cur', 'Person who organizes and manages a collection.', 87),
  
  -- Subject-related roles
  ('Subject', 'sbj', 'Person who is the subject of the work.', 90),
  ('Interviewee', 'ive', 'Person who is interviewed.', 91),
  ('Interviewer', 'ivr', 'Person who interviews.', 92),
  ('Narrator', 'nrt', 'Person who reads or speaks to provide narration.', 93),
  ('Speaker', 'spk', 'Person who gives a speech or lecture.', 94),
  
  -- Special roles for antiquarian books
  ('Rubricator', 'rbr', 'Person who added rubrication to manuscripts.', 100),
  ('Scribe', 'scr', 'Person who is an amanuensis or copies manuscripts.', 101),
  ('Illuminator', 'ilu', 'Person who decorates manuscripts with color.', 102),
  ('Patron', 'pat', 'Person who commissioned the work.', 103),
  ('Attributed name', 'att', 'Author to whom work has been attributed.', 104),
  ('Disputed author', 'dub', 'Person to whom authorship has been dubiously attributed.', 105),
  
  -- Other roles
  ('Other', 'oth', 'Role not represented by other codes.', 999)
ON CONFLICT DO NOTHING;
