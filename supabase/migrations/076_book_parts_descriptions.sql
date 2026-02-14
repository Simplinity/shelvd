-- 076: Add antiquarian book trade descriptions to all 51 book_parts
-- These serve as tooltips in the image labeling UI

-- ══════════════════════════════════════════════════════════════
-- FRONT MATTER
-- ══════════════════════════════════════════════════════════════
UPDATE book_parts SET description = 'The leaf before the title page bearing only the short title. Also called bastard title. Often the first leaf where bookplates or ownership inscriptions appear.' WHERE purpose = 'Half title' AND matter = 'Front';

UPDATE book_parts SET description = 'The principal page identifying the work: full title, author, publisher, and date. The most important leaf for bibliographic identification. In rare books, the title page determines issue and state.' WHERE purpose = 'Title page' AND matter = 'Front';

UPDATE book_parts SET description = 'Production statement at the front of the book: printer, typeface, paper stock, limitation number. Common in fine press and private press editions. Distinct from the back colophon.' WHERE purpose = 'Colophon (front)' AND matter = 'Front';

UPDATE book_parts SET description = 'Illustration facing the title page. Typically an engraved portrait, map, or decorative plate. A missing frontispiece significantly reduces a book''s value. Often tipped in (pasted onto a stub).' WHERE purpose = 'Frontispiece' AND matter = 'Front';

UPDATE book_parts SET description = 'Page where the author dedicates the work to a person or institution. In early printed books, dedications to patrons were often elaborate. Not to be confused with a presentation inscription by the author.' WHERE purpose = 'Dedication' AND matter = 'Front';

UPDATE book_parts SET description = 'A short quotation or motto at the beginning of the work, setting the theme. Usually appears after the dedication and before the table of contents.' WHERE purpose = 'Epigraph' AND matter = 'Front';

UPDATE book_parts SET description = 'Table of contents listing chapters or sections with page numbers. In early books, sometimes called "The Table" and placed at the back. Photograph if it reveals structure relevant to the listing.' WHERE purpose = 'Contents' AND matter = 'Front';

UPDATE book_parts SET description = 'Introductory text written by someone other than the author, often a notable figure. A foreword by a famous person can add significant value. Check for a separate foreword author credit.' WHERE purpose = 'Foreword' AND matter = 'Front';

UPDATE book_parts SET description = 'Author''s own introductory statement, often describing the genesis or purpose of the work. In first editions, the preface may differ from later printings, helping identify issue points.' WHERE purpose = 'Preface' AND matter = 'Front';

UPDATE book_parts SET description = 'Author''s thanks to those who helped with the work. Occasionally mentions are collectible in their own right if notable figures are named.' WHERE purpose = 'Acknowledgment' AND matter = 'Front';

UPDATE book_parts SET description = 'Explanatory text introducing the subject, context, or methodology. May be written by the author or an editor. In scholarly works, the introduction can be the most cited part.' WHERE purpose = 'Introduction' AND matter = 'Front';

UPDATE book_parts SET description = 'An opening section of narrative that precedes the main story. Common in fiction. In rare books, the prologue may contain important textual variants between editions.' WHERE purpose = 'Prologue' AND matter = 'Front';

-- ══════════════════════════════════════════════════════════════
-- BODY
-- ══════════════════════════════════════════════════════════════
UPDATE book_parts SET description = 'Opening page of a volume in a multi-volume set. Photograph this to identify which volume the image belongs to. Shows volume number and sometimes a volume-specific title.' WHERE purpose = 'Volume Page' AND matter = 'Body';

UPDATE book_parts SET description = 'Opening page of a chapter, often with a decorative initial, headpiece, or chapter title. In early printed books, chapter openings may feature woodcut initials or ornamental borders.' WHERE purpose = 'Chapter Page' AND matter = 'Body';

UPDATE book_parts SET description = 'The first page of text proper (after all preliminary matter). In bibliographic terms, this is where the main content begins. Useful for showing the opening of the text and any initial decoration.' WHERE purpose = 'First Page' AND matter = 'Body';

-- ══════════════════════════════════════════════════════════════
-- BACK MATTER
-- ══════════════════════════════════════════════════════════════
UPDATE book_parts SET description = 'A concluding section of narrative that follows the main story. Common in fiction. May contain resolution or reflection on events.' WHERE purpose = 'Epilogue' AND matter = 'Back';

UPDATE book_parts SET description = 'A closing section that wraps up the work, sometimes addressing the reader directly. Less common than an epilogue; found in some modern literary fiction and non-fiction.' WHERE purpose = 'Extro / Outro' AND matter = 'Back';

UPDATE book_parts SET description = 'Text added after the main work, often by someone other than the author. Provides retrospective commentary. A notable afterword author can add collectible interest.' WHERE purpose = 'Afterword' AND matter = 'Back';

UPDATE book_parts SET description = 'Final chapter summarizing the work''s findings or arguments. Common in academic and scientific works. Rarely photographed unless it contains significant textual content.' WHERE purpose = 'Conclusion' AND matter = 'Back';

UPDATE book_parts SET description = 'An addition to the text written after the main work was completed. May contain corrections, updates, or additional thoughts. Sometimes printed on a separate leaf tipped in.' WHERE purpose = 'Postscript' AND matter = 'Back';

UPDATE book_parts SET description = 'Supplementary material at the end: additional data, documents, or tables. An addendum is material added after initial publication, sometimes on inserted leaves or as a separate fascicle.' WHERE purpose = 'Appendix / Addendum' AND matter = 'Back';

UPDATE book_parts SET description = 'Alphabetical list of terms with definitions. In specialized or technical works, the glossary can be a valuable reference. Photograph if it contains terms specific to the field.' WHERE purpose = 'Glossary' AND matter = 'Back';

UPDATE book_parts SET description = 'List of works cited or consulted. In scholarly and antiquarian contexts, the bibliography may itself be a significant reference tool. Note any annotations by a previous owner.' WHERE purpose = 'Bibliography' AND matter = 'Back';

UPDATE book_parts SET description = 'Alphabetical guide to subjects, names, and topics with page references. A missing or damaged index reduces a reference book''s utility and value.' WHERE purpose = 'Index' AND matter = 'Back';

UPDATE book_parts SET description = 'Production statement at the end of the text: printer, typeface, paper, limitation, date of completion. Standard in fine press and limited editions. Often the most informative page for bibliographic description.' WHERE purpose = 'Colophon (back)' AND matter = 'Back';

UPDATE book_parts SET description = 'An essay placed at the very end of the book, after appendices and notes. Sometimes added to later editions to reflect on the work''s reception or significance.' WHERE purpose = 'Postface' AND matter = 'Back';

-- ══════════════════════════════════════════════════════════════
-- PHYSICAL
-- ══════════════════════════════════════════════════════════════
UPDATE book_parts SET description = 'The front board and its covering material (cloth, leather, paper, vellum). Shows binding style, title stamping, gilt work, and overall condition. The primary identification image for most listings.' WHERE purpose = 'Front Cover' AND matter = 'Physical';

UPDATE book_parts SET description = 'The leaf pasted to the inside front board (pastedown) and its conjugate free leaf (free front endpaper, FFEP). Primary location for bookplates, gift inscriptions, bookseller labels, and price marks.' WHERE purpose = 'Front endpaper (FEP)' AND matter = 'Physical';

UPDATE book_parts SET description = 'The narrow edge where the boards are joined. Shows title, author, and publisher stamping. Spine condition (sunning, fading, lean, cracks, loss) is critical for grading. Often the most visible part on a shelf.' WHERE purpose = 'Spine' AND matter = 'Physical';

UPDATE book_parts SET description = 'The rear pastedown and free endpaper. May contain library stamps, bookseller labels, pencil prices, or other ownership evidence. Check for maps or plates sometimes bound here.' WHERE purpose = 'Endpaper' AND matter = 'Physical';

UPDATE book_parts SET description = 'The back board and its covering material. Shows binding wear, bumping to corners, board attachment, and any labels or stamps. Often less decorated than the front.' WHERE purpose = 'Back Cover' AND matter = 'Physical';

UPDATE book_parts SET description = 'Front panel of the dust wrapper showing title, author, and cover art. For modern first editions (post-1920), the jacket condition can account for 50–90% of the book''s market value. Note any price-clipping.' WHERE purpose = 'Dust Jacket - Front' AND matter = 'Physical';

UPDATE book_parts SET description = 'Back panel of the dust wrapper, often with reviews, author photo, or other titles. May show price, ISBN, and publisher information. Check for previous owner stickers or remainder marks.' WHERE purpose = 'Dust Jacket - Back' AND matter = 'Physical';

UPDATE book_parts SET description = 'Full view of the unfolded dust wrapper showing front panel, spine, back panel, and flaps. Useful for showing the complete design and any tears, losses, or repairs across the full wrapper.' WHERE purpose = 'Dust Jacket - Complete' AND matter = 'Physical';

-- ══════════════════════════════════════════════════════════════
-- ILLUSTRATION
-- ══════════════════════════════════════════════════════════════
UPDATE book_parts SET description = 'Illustration made from an engraved woodblock. Fine lines cut into the end-grain of boxwood. Dominant technique from the 1790s (Bewick) through the late 19th century. Shows characteristic fine cross-hatching.' WHERE purpose = 'Wood Engraved Illustration' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Illustration made from an etched metal plate (usually copper). Lines are bitten into the plate by acid. Shows characteristic soft, flowing lines. Common from the 16th through 19th centuries.' WHERE purpose = 'Etched Illustration' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Illustration engraved directly into a metal plate with a burin. Shows precise, clean lines with characteristic swelling and tapering. The primary reproductive technique before photography.' WHERE purpose = 'Metal Engraved Illustration' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Illustration printed from a flat stone or metal plate using the principle that oil and water don''t mix. Invented 1796. Allows tonal effects and crayon-like textures. Common in 19th-century book illustration.' WHERE purpose = 'Lithograph' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Photomechanical reproduction using a screen of dots to simulate continuous tone. The dominant technique for reproducing photographs in books from the 1880s onward. Dots visible under magnification.' WHERE purpose = 'Halftoned Illustration' AND matter = 'Illustration';

UPDATE book_parts SET description = 'An illustration with color applied by hand after printing, using watercolor or gouache. Each copy is unique. Common in natural history books (Audubon, Gould) and early botanical works. Highly collectible.' WHERE purpose = 'Hand Colored Illustration' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Illustration cut from the plank side of a block of wood. Shows bold lines and strong contrasts. The oldest printmaking technique in books (15th century onward). Distinct from wood engraving.' WHERE purpose = 'Woodcut Illustration' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Illustration engraved into a copper plate. The most common intaglio technique in early printed books. Produces fine detail but plates wear with use, so early impressions are valued higher.' WHERE purpose = 'Copper Engraved Illustration' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Photomechanical intaglio process producing rich, velvety tones. Used for high-quality reproduction of photographs and paintings. The image sits slightly below the paper surface and has a characteristic sheen.' WHERE purpose = 'Photogravure' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Any black and white illustration where the specific technique is not identified or is a modern photomechanical reproduction. Use more specific types when the technique is known.' WHERE purpose = 'B&W Illustration (generic)' AND matter = 'Illustration';

UPDATE book_parts SET description = 'Any color illustration where the specific technique is not identified. Includes chromolithography, color halftone, and modern four-color process printing. Use more specific types when known.' WHERE purpose = 'Color Illustration (generic)' AND matter = 'Illustration';

UPDATE book_parts SET description = 'A lithograph printed with a tint stone adding a flat background color (usually buff or grey) behind the main image. Creates depth without full chromolithography. Common in mid-19th century books.' WHERE purpose = 'Tinted Lithograph' AND matter = 'Illustration';

-- ══════════════════════════════════════════════════════════════
-- OTHER
-- ══════════════════════════════════════════════════════════════
UPDATE book_parts SET description = 'Close-up photograph of specific damage or wear: foxing, worming, tears, dampstains, rebacking evidence, loose hinges. Essential for accurate condition reporting in catalog descriptions.' WHERE purpose = 'Damage detail' AND matter = 'Other';

UPDATE book_parts SET description = 'Photograph of material found loose in the book: letters, postcards, newspaper clippings, errata slips, bookmarks, pressed flowers. May have associational or provenance significance.' WHERE purpose = 'Loose insert' AND matter = 'Other';

UPDATE book_parts SET description = 'Full view of the book standing or lying flat, showing overall size, proportion, and general condition at a glance. Useful as the primary listing image alongside the front cover detail.' WHERE purpose = 'Overview' AND matter = 'Other';

UPDATE book_parts SET description = 'Photograph of a slipcase, clamshell box, chemise, or other protective enclosure. Shows the housing condition and any titling or decoration. Important for limited editions and fine bindings.' WHERE purpose = 'Slipcase / Box' AND matter = 'Other';

UPDATE book_parts SET description = 'Photograph of provenance evidence not tied to a specific page: ex-libris bookplate, ownership stamp, shelf label, auction lot sticker, or bookseller ticket. Link to a provenance entry for context.' WHERE purpose = 'Provenance evidence' AND matter = 'Other';
