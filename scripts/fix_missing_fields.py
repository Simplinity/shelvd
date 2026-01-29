import pandas as pd
import psycopg2

DB_URL = "postgresql://postgres:LsY1yr4siVYlZhiN@db.euieagntkbhzkyzvnllx.supabase.co:5432/postgres"

print("📖 Reading Excel file...")
books_df = pd.read_excel('/Users/bruno/Desktop/books.xlsx')
print(f"  Found {len(books_df)} books")

print("\n🔌 Connecting to database...")
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Load languages by name_en
print("\n📚 Loading reference data...")
cur.execute("SELECT id, name_en FROM languages")
languages_by_name = {row[1].lower(): row[0] for row in cur.fetchall()}
print(f"  Languages: {len(languages_by_name)}")

# Also add some common mappings
language_aliases = {
    'dutch': languages_by_name.get('dutch'),
    'english': languages_by_name.get('english'),
    'french': languages_by_name.get('french'),
    'german': languages_by_name.get('german'),
    'italian': languages_by_name.get('italian'),
    'spanish': languages_by_name.get('spanish'),
    'español': languages_by_name.get('spanish'),
    'latin': languages_by_name.get('latin'),
    'norwegian': languages_by_name.get('norwegian'),
    'esperanto': languages_by_name.get('esperanto'),
    'flimba română': languages_by_name.get('romanian'),
    'romanian': languages_by_name.get('romanian'),
    'dutch & french': languages_by_name.get('dutch'),  # Primary language
    'german & english': languages_by_name.get('german'),  # Primary language
    'multiple languages': None,  # Skip
}

def get_language_id(lang_name):
    if not lang_name or pd.isna(lang_name):
        return None
    lang_lower = str(lang_name).lower().strip()
    # Try alias first
    if lang_lower in language_aliases:
        return language_aliases[lang_lower]
    # Then try direct match
    return languages_by_name.get(lang_lower)

# Update each book
print("\n🔄 Updating books with missing fields...")
updated_lang = 0
updated_orig_lang = 0
updated_ddc = 0
updated_topic = 0
updated_price_curr = 0

for idx, row in books_df.iterrows():
    fm_id = row.get('PrimaryKey')
    if not fm_id or pd.isna(fm_id):
        continue
    
    updates = []
    values = []
    
    # Language
    lang = row.get('Main » Language')
    lang_id = get_language_id(lang)
    if lang_id:
        updates.append("language_id = %s")
        values.append(lang_id)
        updated_lang += 1
    
    # Original Language
    orig_lang = row.get('Main » Original Language')
    orig_lang_id = get_language_id(orig_lang)
    if orig_lang_id:
        updates.append("original_language_id = %s")
        values.append(orig_lang_id)
        updated_orig_lang += 1
    
    # DDC
    ddc = row.get('Classification » DDC')
    if ddc and not pd.isna(ddc):
        updates.append("ddc = %s")
        values.append(str(ddc))
        updated_ddc += 1
    
    # Topic
    topic = row.get('Classification » Topic')
    if topic and not pd.isna(topic):
        updates.append("topic = %s")
        values.append(str(topic))
        updated_topic += 1
    
    # Price Currency
    price_curr = row.get('Value » Currency Prices')
    if price_curr and not pd.isna(price_curr):
        updates.append("price_currency = %s")
        values.append(str(price_curr)[:3])  # Max 3 chars
        updated_price_curr += 1
    
    if updates:
        values.append(fm_id)
        sql = f"UPDATE books SET {', '.join(updates)} WHERE filemaker_id = %s"
        cur.execute(sql, values)

conn.commit()

print(f"\n✅ Updates complete:")
print(f"  Language: {updated_lang} books")
print(f"  Original Language: {updated_orig_lang} books")
print(f"  DDC: {updated_ddc} books")
print(f"  Topic: {updated_topic} books")
print(f"  Price Currency: {updated_price_curr} books")

# Verify
print("\n📊 Verification:")
cur.execute("""
SELECT 
  COUNT(*) as total,
  COUNT(language_id) as has_language,
  COUNT(original_language_id) as has_orig_lang,
  COUNT(ddc) as has_ddc,
  COUNT(topic) as has_topic,
  COUNT(price_currency) as has_price_curr
FROM books
""")
row = cur.fetchone()
print(f"  Total books: {row[0]}")
print(f"  With language: {row[1]}")
print(f"  With original language: {row[2]}")
print(f"  With DDC: {row[3]}")
print(f"  With topic: {row[4]}")
print(f"  With price currency: {row[5]}")

cur.close()
conn.close()
