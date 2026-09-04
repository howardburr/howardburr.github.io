import csv
import json
from pathlib import Path

input_csv = Path("artwork.csv")
output_json = Path("data/artwork.json")

rows = []

with input_csv.open(newline="", encoding="utf-8-sig") as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        clean_row = {}

        for key, value in row.items():
            if key is None:
                continue

            key = key.strip()
            value = (value or "").strip()

            # Skip empty spreadsheet cells so the JSON stays clean.
            if value != "":
                clean_row[key] = value

        # Ignore completely empty spreadsheet rows.
        if clean_row:
            rows.append(clean_row)

output_json.parent.mkdir(parents=True, exist_ok=True)

with output_json.open("w", encoding="utf-8") as jsonfile:
    json.dump(rows, jsonfile, indent=2, ensure_ascii=False)

print(f"Created {output_json} with {len(rows)} artwork records.")
