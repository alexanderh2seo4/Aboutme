# Klinkenputzer — Investoren-Site

Sieben-Slide-Website für Klinkenputzer (Trackable Pitch Decks & Data), gebaut zum
Verschicken an Investoren und Leads.

## Was drin ist

| Datei | Zweck |
|---|---|
| `index.html` | Fertige, statische Seite — GitHub Pages, Netlify oder einfach lokal öffnen. Keine Build-Tools, keine Abhängigkeiten. |
| `src/deck.html` | Quelldatei (ohne `<html>/<head>`-Rahmen). Hier wird der Inhalt bearbeitet. |
| `build.py` | Baut `index.html` aus `src/deck.html` (fügt Head, Meta- und OG-Tags hinzu). |
| `.nojekyll` | Sagt GitHub Pages, dass die Dateien unverändert ausgeliefert werden. |

```bash
python3 build.py      # nach jeder Änderung an src/deck.html
```

## Die sieben Slides

1. **Titel** — Trackable Pitch Decks & Data, München 14.–19.09.
2. **Blindflug** — das Problem: Deck raus, Funkstille.
3. **Live Deck-Analytics** — Öffnungen, Verweildauer pro Slide, Absprungpunkt.
4. **Strategy & Visuals on demand** — Sparring → Research → High-End-Redesign.
5. **10-Day Sprint** — Tag 0 bis Tag 10.
6. **Startup-friendly Deals** — Cash, Equity, Provision, Hybrid.
7. **Team & Kontakt** — plus der Deck-Report der eigenen Session.

## Die Live-Demo auf der Seite

Die Seite misst, wie lange der Besucher auf jeder Slide bleibt, und zeigt das auf
Slide 3 live und auf Slide 7 als fertigen Report — das Produkt führt sich also
selbst vor. Die Messung läuft ausschließlich im Browser des Besuchers: nichts
wird gespeichert, nichts gesendet, keine Cookies, kein Netzwerk-Request. Genau
das steht auch auf der Seite, damit die Aussage stimmt.

Bedienung: Pfeiltasten / Leertaste / Scrollen, Slide-Leiste links, Fortschritt oben.

## Vor dem Verschicken ausfüllen

In `src/deck.html`, Slide 7 (`#s7`), stehen drei Kontaktzeilen. Die Platzhalter in
eckigen Klammern müssen ersetzt werden:

- `hallo@klinkenputzer.de` → echte E-Mail-Adresse
- `[LinkedIn-Profil hier eintragen]` → LinkedIn-URL (als `<a href="…">` setzen)
- `[Calendly-Link hier eintragen]` → Terminlink für die München-Woche

Danach `python3 build.py` laufen lassen.

## Hosten auf GitHub Pages

Die Seite liegt in diesem Repository unter `klinkenputzer/` — die Portfolio-Seite
im Root bleibt davon unberuehrt. Sobald GitHub Pages fuer dieses Repo aktiv ist
(Settings → Pages → Source `Deploy from a branch`, Branch waehlen, Ordner
`/ (root)`), ist das Deck erreichbar unter:

```
https://alexanderh2seo4.github.io/Aboutme/klinkenputzer/
```

Die Seite traegt `<meta name="robots" content="noindex, follow">`, solange die
Kontaktdaten auf Slide 7 Platzhalter sind — dieselbe Konvention wie auf der
Portfolio-Seite. Die Zeile steht in `build.py` und faellt raus, sobald LinkedIn-
und Terminlink eingetragen sind.

Eigene Domain spaeter: `CNAME` ins Repo-Root, DNS auf GitHub Pages zeigen lassen.
