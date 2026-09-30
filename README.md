# aboutme

Persönliche Seite von Alexander Kluge. Drei statische HTML-Dateien, ein
Stylesheet, ein kleines Skript für den Sternenhimmel, kein Build, keine
externen Ressourcen (keine Google Fonts, kein CDN, kein Tracking) — das hält die Seite schnell und die
Datenschutzerklärung kurz.

```
index.html        Startseite: Projekte, Auszeichnungen, Kontakt
impressum.html    Anbieterkennzeichnung nach § 5 DDG
datenschutz.html  Datenschutzerklärung nach Art. 13 DSGVO
style.css         das komplette Design
stars.js          Sternenhimmel und Spiralgalaxie im Hintergrund (Canvas)
```

## Lokal ansehen

```bash
python3 -m http.server 8000    # → http://localhost:8000
```

## Vor dem Veröffentlichen ausfüllen

In den Dateien stehen an den noch offenen Stellen Platzhalter in
GROSSBUCHSTABEN. Alle finden:

```bash
grep -rn "_PLATZHALTER" .
```

| Platzhalter | Bedeutung |
|---|---|
| `EMAIL_PLATZHALTER` | öffentliche Kontakt-E-Mail |
| `TELEFON_PLATZHALTER` | Telefonnummer in lesbarer Schreibweise, z. B. `+49 89 123456` |
| `TELEFON_E164_PLATZHALTER` | dieselbe Nummer für `tel:`-Links, ohne Leerzeichen, z. B. `+4989123456` |
| `STRASSE_PLATZHALTER` | Straße und Hausnummer (Impressumspflicht, Postfach genügt nicht) |
| `PLZ_ORT_PLATZHALTER` | Postleitzahl und Ort |
| `HOSTER_PLATZHALTER` | Name und Anschrift des Hosters, z. B. `GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA` bei GitHub Pages |

Beispiel:

```bash
sed -i '' 's/EMAIL_PLATZHALTER/mail@example.de/g' *.html
```

Die Projektseite der Medizintechnik-Projekte ist `jar-medical.tech` und bei
`TriARge` und `ems-voice` sowie im Kontaktblock verlinkt.

## Veröffentlichen

Die Seite läuft auf jedem Webspace, der statische Dateien ausliefert. Für
GitHub Pages: Repository-Einstellungen → Pages → Branch auswählen; die
`index.html` liegt bereits im Wurzelverzeichnis. Für eine eigene Domain eine
Datei `CNAME` mit der Domain anlegen.

## Mit GitHub Pages veröffentlichen

Kostenlos ist GitHub Pages nur für **öffentliche** Repositories — für private
Repos braucht es GitHub Pro. Zwei Einstellungen im Browser, beides einmalig:

1. **Repository öffentlich schalten**
   Settings → General → ganz unten „Danger Zone" → *Change repository
   visibility* → **Public**.

2. **Pages einschalten**
   Settings → Pages → *Source*: **Deploy from a branch** →
   Branch `claude/personal-portfolio-site-ga5lsq`, Ordner `/ (root)` → Save.

Nach ein bis zwei Minuten liegt die Seite unter

```
https://alexanderh2seo4.github.io/Aboutme/
```

Die Datei `.nojekyll` sorgt dafür, dass GitHub die Dateien unverändert
ausliefert, statt sie durch Jekyll zu schicken.

**Eigene Domain:** Settings → Pages → *Custom domain* eintragen, beim
Domain-Anbieter einen CNAME auf `alexanderh2seo4.github.io` setzen und
„Enforce HTTPS" aktivieren.

**Offen:** Die Anschrift in `impressum.html` und `datenschutz.html` ist noch
ein Platzhalter (`STRASSE_PLATZHALTER`, `PLZ_ORT_PLATZHALTER`). Das Impressum
braucht eine ladungsfähige Anschrift; ein Postfach genügt nicht.
