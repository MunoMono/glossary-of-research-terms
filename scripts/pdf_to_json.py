import re
import json
import pdfplumber
from pathlib import Path

SOURCE = "Williamson, K. and Johanson, G. (eds) (2018) Research Methods: Information, Systems, and Contexts. 2nd edn."

pdf_path = Path("public/docs/Glossary-of-terms.pdf")
out_path = Path("public/docs/index.json")

entries = []

with pdfplumber.open(pdf_path) as pdf:
    text = "\n".join(page.extract_text() or "" for page in pdf.pages)

# The glossary entries are in the form "Term: definition"
pattern = re.compile(
    r"^([A-Z][A-Za-z\s\-\(\)\/]+):\s+(.*?)(?=\n[A-Z][A-Za-z\s\-\(\)\/]+:|\Z)",
    re.S | re.M,
)

for match in pattern.finditer(text):
    term = match.group(1).strip()
    definition = re.sub(r"\s+", " ", match.group(2)).strip()
    if term and definition:
        entries.append({"term": term, "definition": definition, "source": SOURCE})

# ---------- CLEANUP ----------
clean_entries = []
for e in entries:
    # Remove stray "Glossaryoftermsusedinresearch" prefixes
    term = e["term"].replace("Glossaryoftermsusedinresearch", "").strip()

    # Remove standalone page numbers (e.g., 575, 576)
    definition = re.sub(r"\b\d{3}\b", "", e["definition"])

    # Skip reference spillover (California, Variable etc.)
    if term.lower() in ["california", "variable"]:
        continue

    # Assign alphabetic bucket (first letter, uppercase)
    letter = term[0].upper() if term else "?"

    clean_entries.append(
        {
            "term": term,
            "definition": definition.strip(),
            "source": e["source"],
            "letter": letter,
        }
    )

# Save as JSON
out_path.write_text(json.dumps(clean_entries, indent=2, ensure_ascii=False))

print(f"Extracted {len(clean_entries)} entries → {out_path}")