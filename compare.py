import json
import os

# Load en.json
with open('src/language/json/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

en_keys = set(en_data.keys())

files = ['hi.json', 'te.json', 'kn.json', 'ml.json', 'ta.json']

for file in files:
    with open(f'src/language/json/{file}', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    missing_keys = en_keys - set(data.keys())
    print(f"Missing in {file}: {sorted(missing_keys)}")
    print(f"Number missing: {len(missing_keys)}")
    print()