import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import uuid
from datetime import datetime

# Database connection
DB_URL = "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres"

# Read Excel files
print("📖 Reading Excel files...")
books_df = pd.read_excel('/Users/bruno/Desktop/books.xlsx')
contributors_df = pd.read_excel('/Users/bruno/Desktop/contributors.xlsx')
book_contributors_df = pd.read_excel('/Users/bruno/Desktop/book contributors.xlsx')

print(f"  Books: {len(books_df)} rows")
print(f"  Contributors: {len(contributors_df)} rows")
print(f"  Book-Contributors: {len(book_contributors_df)} rows")

# Connect to database
print("\n🔌 Connecting to database...")
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Get user ID (we need a user to assign books to)
cur.execute("SELECT id FROM auth.users LIMIT 1")
user_row = cur.fetchone()
if not user_row:
    print("❌ No user found! Create an account first.")
    exit(1)
USER_ID = user_row[0]
print(f"  Using user ID: {USER_ID}")

# Get existing reference data
print("\n📚 Loading reference data...")
cur.execute("SELECT id, code FROM languages")
languages = {row[1].lower(): row[0] for row in cur.fetchall()}
print(f"  Languages: {len(languages)}")

cur.execute("SELECT id, code FROM contributor_roles")
roles_by_code = {row[1]: row[0] for row in cur.fetchall()}
print(f"  Roles: {len(roles_by_code)}")

cur.execute("SELECT id, name FROM conditions")
conditions = {row[1].lower(): row[0] for row in cur.fetchall()}
print(f"  Conditions: {len(conditions)}")

cur.execute("SELECT id, name FROM bindings")
bindings = {row[1].lower(): row[0] for row in cur.fetchall()}
print(f"  Bindings: {len(bindings)}")

# Role mapping from FileMaker to our codes
role_mapping = {
    'Author': 'aut',
    'Co-Author': 'aut',
    'Lead Author': 'aut',
    'Translator': 'trl',
    'Illustrator': 'ill',
    'Editor': 'edt',
    'Photographer': 'pht',
    'Cover Artist': 'cov',
    'Artist': 'art',
    'Forward': 'wpr',
    'Compilor': 'com',
    'Pseudonym of': 'oth',
}

def safe_get(row, col, default=None):
    if col in row.index:
        val = row[col]
        if pd.isna(val):
            return default
        return val
    return default

def safe_int(val):
    if val is None or pd.isna(val):
        return None
    try:
        if isinstance(val, str):
            val = val.strip('[]').strip()
            if not val:
                return None
        return int(float(val))
    except:
        return None

def safe_float(val):
    if val is None or pd.isna(val):
        return None
    try:
        return float(val)
    except:
        return None

def safe_bool(val):
    if val is None or pd.isna(val):
        return False
    try:
        return bool(int(val))
    except:
        return False

def clean_isbn(val, max_len=13):
    if val is None or pd.isna(val):
        return None
    # Convert to string, take first ISBN if multiple
    val = str(val).split('/')[0].split(' ')[0].strip()
    # Remove dashes
    val = val.replace('-', '')
    # Truncate if too long
    if len(val) > max_len:
        val = val[:max_len]
    return val if val else None

# Status mapping
status_mapping = {
    'Unk.': 'in_collection',
    'On Sale': 'for_sale',
    'Sold': 'sold',
    'Pending': 'in_collection',
    'Lost': 'lost',
    'To Do': 'in_collection',
    'In Collection': 'in_collection',
}

# ============================================
# CHECK IF CONTRIBUTORS ALREADY IMPORTED
# ============================================
cur.execute("SELECT COUNT(*) FROM contributors WHERE created_by_user_id = %s", (USER_ID,))
existing_contributors = cur.fetchone()[0]
print(f"\n  Existing contributors: {existing_contributors}")

contributor_map = {}

if existing_contributors == 0:
    # ============================================
    # IMPORT CONTRIBUTORS
    # ============================================
    print("\n👤 Importing contributors...")
    
    contributors_to_insert = []
    for idx, row in contributors_df.iterrows():
        fm_id = safe_get(row, 'PrimaryKey')
        if not fm_id or pd.isna(fm_id):
            continue
        
        full_name = safe_get(row, 'Full Name')
        if not full_name or pd.isna(full_name):
            continue
        
        first_names = safe_get(row, 'First Names', '')
        last_name = safe_get(row, 'Last Name', '')
        
        new_id = str(uuid.uuid4())
        contributor_map[fm_id] = new_id
        
        contributors_to_insert.append((
            new_id,
            'person',
            full_name,
            full_name,
            full_name,
            first_names if first_names else None,
            last_name if last_name else None,
            USER_ID,
            fm_id,
        ))

    if contributors_to_insert:
        execute_values(cur, """
            INSERT INTO contributors (id, type, canonical_name, sort_name, display_name, given_names, family_name, created_by_user_id, filemaker_id)
            VALUES %s
            ON CONFLICT DO NOTHING
        """, contributors_to_insert)
        conn.commit()
        print(f"  ✓ Inserted {len(contributors_to_insert)} contributors")
else:
    print("  Contributors already imported, loading mapping...")
    cur.execute("SELECT filemaker_id, id FROM contributors WHERE created_by_user_id = %s AND filemaker_id IS NOT NULL", (USER_ID,))
    for row in cur.fetchall():
        contributor_map[row[0]] = row[1]
    print(f"  Loaded {len(contributor_map)} contributor mappings")

# ============================================
# IMPORT BOOKS
# ============================================
print("\n📚 Importing books...")
book_map = {}

books_to_insert = []
for idx, row in books_df.iterrows():
    fm_id = safe_get(row, 'PrimaryKey')
    if not fm_id:
        continue
    
    new_id = str(uuid.uuid4())
    book_map[fm_id] = new_id
    
    # Map language
    lang = safe_get(row, 'Main » Language', '')
    lang_id = languages.get(lang.lower().strip()) if lang else None
    
    orig_lang = safe_get(row, 'Main » Original Language', '')
    orig_lang_id = languages.get(orig_lang.lower().strip()) if orig_lang else None
    
    # Map condition
    cond = safe_get(row, 'Description » Condition', '')
    cond_id = None
    if cond:
        cond_lower = cond.lower().strip()
        for name, cid in conditions.items():
            if name in cond_lower or cond_lower in name:
                cond_id = cid
                break
    
    # Map binding
    bind = safe_get(row, 'Description » Binding', '')
    bind_id = None
    if bind:
        bind_lower = bind.lower().strip()
        for name, bid in bindings.items():
            if name in bind_lower or bind_lower in name:
                bind_id = bid
                break
    
    # Parse year
    year = safe_int(safe_get(row, 'Imprint » Release Year'))
    
    # Parse dimensions - normalize to mm for height_mm, width_mm
    height = safe_float(safe_get(row, 'Description » Height'))
    width = safe_float(safe_get(row, 'Description » Width'))
    size_unit = safe_get(row, 'Description » Size measurement', 'cm')
    if size_unit and 'cm' in str(size_unit).lower():
        if height: height = height * 10  # convert cm to mm
        if width: width = width * 10
    
    # Parse weight - grams
    weight = safe_float(safe_get(row, 'Description » Weight'))
    
    # Parse purchase date
    purchase_date = safe_get(row, 'Value » Purchase Date')
    if purchase_date and not pd.isna(purchase_date):
        if hasattr(purchase_date, 'strftime'):
            purchase_date = purchase_date.strftime('%Y-%m-%d')
        else:
            purchase_date = None
    else:
        purchase_date = None
    
    books_to_insert.append((
        new_id,
        USER_ID,
        safe_get(row, 'Main » Title', 'Untitled'),
        safe_get(row, 'Main » SubTitle'),
        safe_get(row, 'Main » Original Title'),
        lang_id,
        orig_lang_id,
        safe_get(row, 'Main » Series'),
        status_mapping.get(safe_get(row, 'Main » Status', ''), 'in_collection'),
        safe_get(row, 'Imprint » Place Published'),
        year,
        safe_get(row, 'Imprint » Printer'),
        safe_get(row, 'Imprint » Place Printed'),
        safe_get(row, 'Edition » Edition'),
        safe_get(row, 'Edition » Impression'),
        safe_get(row, 'Edition » Issue State'),
        safe_get(row, 'Edition » Comments'),
        safe_int(safe_get(row, 'Description » Pages')),
        safe_get(row, 'Description » Pagination'),
        safe_get(row, 'Description » Volumes'),
        height,  # height_mm
        width,   # width_mm
        safe_get(row, 'Description » Cover format'),
        bind_id,
        safe_bool(safe_get(row, 'Description » Dust Jacket')),
        safe_bool(safe_get(row, 'Description » Signed')),
        cond_id,
        safe_get(row, 'Description » Condition Description'),
        clean_isbn(safe_get(row, 'Identifiers » ISBN 13'), 17),
        clean_isbn(safe_get(row, 'Identifiers » ISBN 10'), 13),
        str(safe_get(row, 'Identifiers » OCN')) if safe_get(row, 'Identifiers » OCN') else None,
        safe_get(row, 'Identifiers » LCCN'),
        safe_get(row, 'Identifiers » Collection ID'),
        safe_get(row, 'Storage » Location'),
        safe_get(row, 'Storage » Shelf'),
        safe_get(row, 'Storage » Shelf Section'),
        safe_get(row, 'Value » Purchased from'),
        purchase_date,
        safe_float(safe_get(row, 'Value » Paid')),
        safe_get(row, 'Value » Currency Paid'),
        safe_float(safe_get(row, 'Value » Lowest Price')),
        safe_float(safe_get(row, 'Value » Highest Price')),
        safe_float(safe_get(row, 'Value » Estimated Value')),
        safe_float(safe_get(row, 'Value » Sales Price')),
        safe_get(row, 'Info » Illustrations'),
        safe_get(row, 'Info » Signatures'),
        safe_get(row, 'Info » Provenance'),
        safe_get(row, 'Info » Bibliography'),
        safe_get(row, 'Summary » Summary'),
        safe_get(row, 'Catalog » Catalog Entry'),
        safe_get(row, 'Info » Private Comments'),
        weight,  # weight_grams
        fm_id,
    ))

# Insert in batches
batch_size = 500
for i in range(0, len(books_to_insert), batch_size):
    batch = books_to_insert[i:i+batch_size]
    execute_values(cur, """
        INSERT INTO books (
            id, user_id, title, subtitle, original_title,
            language_id, original_language_id, series, status,
            publication_place, publication_year, printer, printing_place,
            edition, impression, issue_state, edition_notes,
            page_count, pagination_description, volumes,
            height_mm, width_mm, cover_type, binding_id,
            has_dust_jacket, is_signed, condition_id, condition_notes,
            isbn_13, isbn_10, oclc_number, lccn, user_catalog_id,
            storage_location, shelf, shelf_section,
            acquired_from, acquired_date, acquired_price, acquired_currency,
            lowest_price, highest_price, estimated_value, sales_price,
            illustrations_description, signatures_description, provenance, bibliography,
            summary, catalog_entry, internal_notes, weight_grams, filemaker_id
        ) VALUES %s
        ON CONFLICT DO NOTHING
    """, batch)
    conn.commit()
    print(f"  ✓ Inserted books {i+1}-{min(i+batch_size, len(books_to_insert))}")

print(f"  ✓ Total: {len(books_to_insert)} books")

# ============================================
# IMPORT BOOK-CONTRIBUTORS
# ============================================
print("\n🔗 Importing book-contributor relationships...")

bc_to_insert = []
skipped = 0
for idx, row in book_contributors_df.iterrows():
    book_fm_id = safe_get(row, 'ID_Books')
    contrib_fm_id = safe_get(row, 'ID_Contributors')
    role_name = safe_get(row, 'Role')
    
    if not book_fm_id or not contrib_fm_id or not role_name:
        skipped += 1
        continue
    
    book_id = book_map.get(book_fm_id)
    contrib_id = contributor_map.get(contrib_fm_id)
    role_code = role_mapping.get(role_name)
    
    if not book_id or not contrib_id or not role_code:
        skipped += 1
        continue
    
    role_id = roles_by_code.get(role_code)
    if not role_id:
        skipped += 1
        continue
    
    bc_to_insert.append((
        str(uuid.uuid4()),
        book_id,
        contrib_id,
        role_id,
    ))

if bc_to_insert:
    execute_values(cur, """
        INSERT INTO book_contributors (id, book_id, contributor_id, role_id)
        VALUES %s
        ON CONFLICT DO NOTHING
    """, bc_to_insert)
    conn.commit()
    print(f"  ✓ Inserted {len(bc_to_insert)} relationships")
    print(f"  ⚠ Skipped {skipped} (missing references)")

# ============================================
# SUMMARY
# ============================================
print("\n" + "=" * 50)
print("✅ IMPORT COMPLETE!")
print("=" * 50)

cur.execute("SELECT COUNT(*) FROM books WHERE user_id = %s", (USER_ID,))
print(f"  Books in database: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM contributors WHERE created_by_user_id = %s", (USER_ID,))
print(f"  Contributors in database: {cur.fetchone()[0]}")

cur.execute("""
    SELECT COUNT(*) FROM book_contributors bc
    JOIN books b ON bc.book_id = b.id
    WHERE b.user_id = %s
""", (USER_ID,))
print(f"  Book-contributor links: {cur.fetchone()[0]}")

cur.close()
conn.close()
