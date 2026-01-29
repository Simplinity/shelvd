#!/usr/bin/env python3
"""
Generate bisac_codes.sql from Excel file
Run: python3 scripts/generate_bisac_sql.py
"""
import pandas as pd
import os

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
excel_path = os.path.expanduser("~/Desktop/Bisac codes.xlsx")
output_path = os.path.join(project_root, "supabase/seed/bisac_codes.sql")

def escape_sql(s):
    """Escape single quotes for SQL"""
    if pd.isna(s):
        return ''
    return str(s).replace("'", "''")

def main():
    print(f"Reading Excel file: {excel_path}")
    df = pd.read_excel(excel_path)
    print(f"Found {len(df)} BISAC codes")
    
    # Build SQL
    sql_lines = [
        "-- BISAC Subject Headings",
        "-- Source: Complete FileMaker Excel export (3887 codes)",
        "-- Generated from Bisac codes.xlsx",
        "",
        "-- Truncate existing data first to avoid conflicts",
        "TRUNCATE TABLE bisac_codes CASCADE;",
        "",
        "INSERT INTO bisac_codes (code, subject, parent_code) VALUES"
    ]
    
    values = []
    for _, row in df.iterrows():
        code = escape_sql(row['Code'])
        name = escape_sql(row['Subject'])
        values.append(f"  ('{code}', '{name}', NULL)")
    
    sql_lines.append(',\n'.join(values) + ';')
    
    # Write output
    sql_content = '\n'.join(sql_lines)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print(f"Written {len(df)} BISAC codes to: {output_path}")
    print(f"File size: {os.path.getsize(output_path):,} bytes")

if __name__ == "__main__":
    main()
