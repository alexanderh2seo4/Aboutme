#!/usr/bin/env python3
"""Build the standalone GitHub Pages index.html from src/deck.html.

deck.html is the Artifact source (no <html>/<head>/<body> wrapper). This adds
the document shell, meta tags and social-preview tags for the hosted version.
"""
import pathlib
import sys

root = pathlib.Path(__file__).resolve().parent
src = (root / "src" / "deck.html")
if not src.exists():
    src = root / "deck.html"
body = src.read_text(encoding="utf-8")

head_lines, body_lines = [], []
for line in body.splitlines():
    if line.startswith("<title>") or line.startswith("<link "):
        head_lines.append("  " + line)
    else:
        body_lines.append(line)

DESC = ("Klinkenputzer — Trackable Pitch Decks & Data. Live Deck-Analytics, "
        "Story & Design on demand, Auslieferung in rund 10 Tagen.")

doc = f"""<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{DESC}">
  <meta name="color-scheme" content="dark">
  <!-- Solange die Kontaktdaten auf Slide 7 noch Platzhalter sind: nicht indexieren.
       Diese eine Zeile in build.py loeschen, sobald LinkedIn und Terminlink stehen. -->
  <meta name="robots" content="noindex, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Klinkenputzer — Trackable Pitch Decks & Data">
  <meta property="og:description" content="{DESC}">
  <meta name="twitter:card" content="summary_large_image">
{chr(10).join(head_lines)}
</head>
<body>
{chr(10).join(body_lines)}
</body>
</html>
"""
out = root / "index.html"
out.write_text(doc, encoding="utf-8")
print(f"wrote {out} ({len(doc)} bytes)", file=sys.stderr)
