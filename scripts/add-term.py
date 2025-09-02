#!/usr/bin/env python3
import json, os

CUSTOM_PATH = os.path.join("public", "docs", "custom.json")

term_text = input("Term: ").strip()
definition = input("Definition: ").strip()
source = input("Source (default: Custom entry (user-defined)): ").strip() or "Custom entry (user-defined)"

entry = {
    "term": term_text,
    "definition": definition,
    "source": source,
    "letter": term_text[0].upper() if term_text else None
}

# Load existing JSON
if os.path.exists(CUSTOM_PATH):
    with open(CUSTOM_PATH) as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = []
else:
    data = []

# Append new entry
data.append(entry)

# Save back
with open(CUSTOM_PATH, "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✅ Added {entry['term']} to {CUSTOM_PATH}")