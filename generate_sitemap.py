import json
from pathlib import Path
from xml.sax.saxutils import escape

input_json = Path("data/artwork.json")
output_sitemap = Path("sitemap.xml")

base_url = "https://howardburr.com"

# Main pages that are currently complete and should be indexed.
main_pages = [
    "/",
    "/sculpture.html",
    "/paintings.html",
    "/prints.html",
    "/selected-subjects.html",
    "/graal-glass.html",
    "/about.html",
    "/contact.html",
]

# Artwork categories currently complete and ready for Google.
published_categories = {"SC", "PT", "PR", "GG"}

with input_json.open("r", encoding="utf-8") as jsonfile:
    artworks = json.load(jsonfile)

urls = []

# Add the main website pages.
for page in main_pages:
    urls.append(f"{base_url}{page}")

# Add one URL for each visible artwork in the completed categories.
for artwork in artworks:
    artwork_id = artwork.get("id", "").strip()
    category = artwork.get("category", "").strip()
    status = artwork.get("status", "").strip().lower()

    if (
        artwork_id
        and category in published_categories
        and status != "hidden"
    ):
        urls.append(
            f"{base_url}/artwork.html?id={artwork_id}"
        )

# Remove duplicates while preserving order.
urls = list(dict.fromkeys(urls))

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "",
]

for url in urls:
    lines.extend([
        "  <url>",
        f"    <loc>{escape(url)}</loc>",
        "  </url>",
        "",
    ])

lines.append("</urlset>")

output_sitemap.write_text(
    "\n".join(lines) + "\n",
    encoding="utf-8"
)

artwork_url_count = len(urls) - len(main_pages)

print(
    f"Created {output_sitemap} with "
    f"{len(main_pages)} main pages and "
    f"{artwork_url_count} artwork URLs "
    f"({len(urls)} total URLs)."
)