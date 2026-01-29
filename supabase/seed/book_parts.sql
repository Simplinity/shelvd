-- Book Parts seed data
-- Categories: Front, Body, Back (for matter column)

INSERT INTO book_parts (matter, purpose, description, sort_order) VALUES
-- Front Matter
('Front', 'Half title', 'Usually a single line in capital letters, precedes the title page, and only contains the title (as opposed to the author, publisher etc. found on the full title page) with a blank verso.', 1),
('Front', 'Title page', 'Repeats the title and author as printed on the cover or spine.', 2),
('Front', 'Colophon (front)', 'Technical information such as edition dates, copyrights, typefaces and the name and address of the printer. In modern books usually on the verso of the title page. Also known as the Edition notice or Copyright page.', 3),
('Front', 'Frontispiece', 'A decorative illustration on the verso facing the title page. It may be related to the book''s subject, or be a portrait of the author.', 4),
('Front', 'Dedication', 'A dedication page is a page in a book that precedes the text, in which the author names the person or people for whom he/she has written the book.', 5),
('Front', 'Epigraph', 'A phrase, quotation, or poem. The epigraph may serve as a preface, as a summary, as a counter-example, or to link the work to a wider literary canon, either to invite comparison, or to enlist a conventional context.', 6),
('Front', 'Contents', 'This is a list of chapter headings, and nested subheadings, together with their respective page numbers. This includes all front-matter items listed below, together with chapters in the body matter and back matter.', 7),
('Front', 'Foreword', 'Often, a foreword will tell of some interaction between the writer of the foreword and the story or the writer of the story. A foreword to later editions of a work often explains in what respects that edition differs from previous ones.', 8),
('Front', 'Preface', 'A preface generally covers the story of how the book came into being, or how the idea for the book was developed. This is often followed by thanks and acknowledgments to people who were helpful to the author during the time of writing.', 9),
('Front', 'Acknowledgment', 'Often part of the Preface, rather than a separate section in its own right, it acknowledges those who contributed to the creation of the book.', 10),
('Front', 'Introduction', 'A beginning section which states the purpose and goals of the following writing.', 11),
('Front', 'Prologue', 'A prologue is an opening to a story that establishes the setting and gives background details, often some earlier story that ties into the main one, and other miscellaneous information.', 12),

-- Body
('Body', 'Volume Page', 'A volume is a set of leaves that are bound together. Thus each work is either a volume, or is divided into volumes.', 13),
('Body', 'Chapter Page', 'A chapter or section may be contained within a part or a book. When both chapters and sections are used in the same work, the sections are more often contained within chapters than the reverse.', 14),
('Body', 'First Page', 'The first page of the actual text of a book is the opening page, which often incorporates special design features, such as initials.', 15),

-- Back Matter
('Back', 'Epilogue', 'This piece of writing at the end of a work of literature or drama is usually used to bring closure to the work.', 16),
('Back', 'Extro / Outro', 'The conclusion to a piece of work; this is considered the opposite of the intro. These terms are more commonly used in music.', 17),
('Back', 'Afterword', 'An afterword generally covers the story of how the book came into being, or of how the idea for the book was developed.', 18),
('Back', 'Conclusion', 'A final section that summarizes the main points or arguments presented in the work, often restating the thesis and providing final thoughts or recommendations.', 19),
('Back', 'Postscript', 'An additional remark or note added after the main body of text has been completed, often containing supplementary information, corrections, or afterthoughts that arose after the primary writing was finished.', 20),
('Back', 'Appendix / Addendum', 'This supplemental addition to a given main work may correct errors, explain inconsistencies or otherwise detail or update the information found in the main work.', 21),
('Back', 'Glossary', 'The glossary consists of a set of definitions of words of importance to the work. They are normally alphabetized. The entries may consist of places and characters, which is common for longer works of fiction.', 22),
('Back', 'Bibliography', 'This cites other works consulted when writing the body. It is most common in non-fiction books or research papers.', 23),
('Back', 'Index', 'This list of terms used in the text contains references, often page numbers, to where the terms can be found in the text. Most common in non-fiction books.', 24),
('Back', 'Colophon (back)', 'This brief description may be located at the end of a book. It describes production notes relevant to the edition and may include a printer''s mark or logotype.', 25),
('Back', 'Postface', 'A brief concluding note or commentary placed at the end of a book, typically written by the author to reflect on the work, its creation, or its reception after publication.', 26),

-- Physical Parts
('Physical', 'Front Cover', 'The front cover is the front of the book, and is marked appropriately, by text or graphics, in order to identify it as such. The front cover usually contains at least the title or author, with possibly an appropriate illustration.', 27),
('Physical', 'Front endpaper (FEP)', 'On the inside of the cover page, extending to the facing page is the front endpaper sometimes referred as FEP. The free half of the end paper is called a flyleaf. It can be either plain or variously ornamented and illustrated.', 28),
('Physical', 'Spine', 'The spine is the vertical edge of a book as it normally stands on a bookshelf. It usually contains author, title, publisher, and publisher logo.', 29),
('Physical', 'Endpaper', 'On the inside of the back cover page, extending from the facing page before it, is the endpaper. Its design matches the front endpaper.', 30),
('Physical', 'Back Cover', 'The back cover often contains biographical matter about the author or editor, and quotes from other sources praising the book. It may also contain a summary or description of the book.', 31),
('Physical', 'Dust Jacket - Front', 'Front of the dust jacket.', 32),
('Physical', 'Dust Jacket - Back', 'Back of the dust jacket.', 33),
('Physical', 'Dust Jacket - Complete', 'Complete open folded dust jacket.', 34),

-- Illustration Types
('Illustration', 'Wood Engraved Illustration', 'The image is cut on the end grain of the wood rather than the plank side using a tool similar to an engraver''s burin. Because the close grain of the block allows for more detailed and finer lines, they were more precise than woodcuts.', 35),
('Illustration', 'Etched Illustration', 'In the etching process a heated copper plate is covered with a ground made of wax, gum mastic and asphaltum that is impervious to acid. The engraver uses an etching needle to draw the image into the wax exposing the copper plate underneath. Immersion in an acid bath allows the acid to eat into the metal forming grooves.', 36),
('Illustration', 'Metal Engraved Illustration', 'An intaglio printmaking technique where the design is incised directly into a metal plate surface using sharp tools called burins. The ink is held in the incised grooves and transferred to paper under pressure, producing fine detailed lines characteristic of formal book illustrations.', 37),
('Illustration', 'Lithograph', 'A planographic method invented by Alois Senefelder at the end of the 18th century. The image is drawn with a greasy ink or pencil on a limestone surface. The stone is then dampened and ink is applied. The ink sticks to the image and is repelled by the water.', 38),
('Illustration', 'Halftoned Illustration', 'A reprographic technique that simulates continuous-tone imagery through the use of dots varying in size or spacing. A screen is inserted over the plate during exposure, breaking up the image into thousands of tiny dots. When viewed from a distance, the eye perceives smooth tones rather than individual dots.', 39),
('Illustration', 'Hand Colored Illustration', 'A printed illustration to which color has been applied by hand after printing, typically using watercolors or gouache. This labor-intensive technique was common before the development of color printing processes, particularly for natural history books, maps, and luxury editions.', 40),
('Illustration', 'Woodcut Illustration', 'Woodcuts were the most common form of illustration in early printed books. Images are carved with the grain into wooden planks by hand. The wood that is not part of the design is cut away, leaving the image in relief. The relief image is then inked and printed.', 41),
('Illustration', 'Copper Engraved Illustration', 'Copper engravings made their first appearance in the mid-fifteenth century. This is an intaglio process where the design is incised into a thin metal plate surface with a burin. Toning and modeling are achieved by crosshatching and changing the width of the engraved line.', 42),
('Illustration', 'Photogravure', 'A photomechanical process whereby a copper plate is coated with a light-sensitive gelatin tissue which had been exposed to a film positive, and then etched, resulting in a high quality intaglio print that can reproduce the detail and continuous tones of a photograph.', 43),
('Illustration', 'B&W Illustration (generic)', 'Generic term which can be used when the exact printing technique of an illustration is unknown.', 44),
('Illustration', 'Color Illustration (generic)', 'Generic term which can be used when the exact printing technique of an illustration is unknown.', 45),
('Illustration', 'Tinted Lithograph', 'In a tinted lithograph a second tint stone was used to add overall color to the background. This required a second run through the press.', 46);
