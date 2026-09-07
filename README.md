# aboutme

Persönliche Seite von Alexander Kluge. Drei statische HTML-Dateien, ein
Stylesheet, kein Build, kein JavaScript, keine externen Ressourcen (keine
Google Fonts, kein CDN, kein Tracking) — das hält die Seite schnell und die
Datenschutzerklärung kurz.

```
index.html        Startseite: Projekte, Auszeichnungen, Kontakt
impressum.html    Anbieterkennzeichnung nach § 5 DDG
datenschutz.html  Datenschutzerklärung nach Art. 13 DSGVO
style.css         das komplette Design
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

Fehlt noch: die Domain des Medizintechnik-Projekts. Sobald sie feststeht, kann
sie bei den Projekten `TriARge` und `ems-voice` als Link ergänzt werden.

## Veröffentlichen

Die Seite läuft auf jedem Webspace, der statische Dateien ausliefert. Für
GitHub Pages: Repository-Einstellungen → Pages → Branch auswählen; die
`index.html` liegt bereits im Wurzelverzeichnis. Für eine eigene Domain eine
Datei `CNAME` mit der Domain anlegen.
