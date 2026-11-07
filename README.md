# FREISTIL KIDS – Website

Website für **FREISTIL KIDS**, das Fußballcamp für Kinder von 6 bis 12 Jahren in Münster (Osterferien 2027, FC Münster 05).
Ziel: Camp-Plätze und Weihnachtsgutscheine verkaufen und die Marke für die nächsten Jahre aufbauen.

**Technik:** reine statische Website (HTML, CSS, etwas Vanilla-JavaScript). Kein Build-Schritt, keine Abhängigkeiten,
keine externen Anfragen. Läuft auf jedem Webspace und jedem Static-Hoster (Netlify, Vercel, Cloudflare Pages, IONOS, Strato …).

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: Weihnachts-Banner, Hero, Vertrauensleiste, Problem, Philosophie, Skillset & Mindset, Bundesliga-Besuch (Spielerkarten), Ablauf, Paket, Team, Sicherheit, Weihnachtsaktion, Preis, FAQ, Abschluss |
| `ueber-uns.html` | Wer wir sind, Mission, Vergleich, der brasilianische Gedanke, Vision, Team |
| `anmeldung.html` | Anmeldung in 3 Schritten (Anmeldung → weitere Angaben → Bestätigung), wird automatisch zur Warteliste |
| `gutschein.html` | Gutschein-Kauf (149 € pro Gutschein, Name optional, Widmung) |
| `impressum.html`, `datenschutz.html`, `agb.html` | Rechtstexte (Platzhalter mit Gliederung, `agb.html#storno` = Stornobedingungen) |
| `flyer/index.html` | Landing-URL für den QR-Code: `/flyer` → Startseite mit Fokus auf Preis & Anmeldung |
| `404.html` | Fehlerseite |

## Lokal ansehen

```bash
python3 -m http.server 8000
```

Dann <http://localhost:8000> öffnen.

## Einstellungen: `assets/js/config.js`

Alles, was sich ändern kann, steht an einer Stelle:

- `christmasEnd`: Ende der Weihnachtsaktion. Danach verschwinden Banner, Weihnachts-Abschnitt und „Weihnachtsangebot“-Hinweise automatisch, und an ihrer Stelle erscheint `[REGULÄRER PREIS]` (Elemente mit `data-xmas` / `data-after-xmas`).
- `freeSpots`: Zahl der freien Plätze. **Nur eintragen, wenn sie echt und aktuell ist.** Bei `null` wird nichts angezeigt.
- `bookedOut: true`: Das Camp ist ausgebucht. Alle Buttons werden zu „Auf die Warteliste“, die Anmeldung wird zur Warteliste (ohne Zahlungsart).
- `endpoints`: Wohin die Formulare senden (POST, JSON). Bei `null` läuft der **Demo-Modus**: Die Formulare funktionieren, senden aber nichts, und ein gelber Hinweis ist sichtbar.
- `payment`: Zahlungsanbieter (noch offen). Liefert der Endpunkt eine `paymentUrl` zurück, wird automatisch dorthin weitergeleitet (z. B. Stripe Checkout, PayPal, Mollie). Anpassen lässt sich das in `FSK.startPayment()` in `assets/js/main.js`.
- `optionalServices`: Werden später Statistik-Tools eingesetzt, hier eintragen. Dann wird aus dem Info-Hinweis eine echte Einwilligung, bei der nichts vorausgewählt ist. Die Tools werden erst nach Zustimmung über `FSK.onConsent('id', fn)` gestartet.

### Formulardaten

Die Anmeldung sendet unter anderem `kind_vorname`, `kind_nachname`, `kind_alter`, `eltern_*`, `gutscheincode`, `zahlungsart`, `foto_einwilligung` (`ja`/`nein`), `agb_datenschutz`, `art` (`anmeldung`/`warteliste`), `quelle` (z. B. `flyer`), `referenz` und `zeitpunkt`.
Schritt 2 (`anmeldungDetails`) sendet `allergien`, `notfall_name`, `notfall_telefon`, `abholberechtigt`, `trikotgroesse` und die `referenz`.
Der Gutschein sendet `anzahl`, `betrag_eur`, `beschenkter`, `widmung`, `kaeufer_*`, `zahlungsart`, `quelle` und `referenz`.

## Flyer-QR-Code & Messbarkeit (ohne Tracking)

Der QR-Code zeigt auf `https://DOMAIN/flyer`. Die Seite leitet auf `/?quelle=flyer#preis` weiter. Dort sehen Besucher einen kurzen Willkommenshinweis,
und **jeder** Link zu Anmeldung oder Gutschein trägt `quelle=flyer` weiter, bis ins versteckte Formularfeld `quelle`.
So zählt ihr Flyer-Anmeldungen direkt in den Formulardaten, ohne Cookies und ohne Einwilligung. Für weitere Kanäle könnt ihr den Ordner kopieren
(z. B. `/insta` mit `quelle=instagram`).

## Platzhalter

Alle Platzhalter sind auf der Seite gelb und gestrichelt markiert. Im Code findet ihr sie über die Suche nach `class="ph"`.

**Entwurfsmodus:** Auf jeder Seite steht `<html lang="de" class="is-draft">`. Solange `is-draft` gesetzt ist, sind auch **unbestätigte**
Vertrauensmerkmale sichtbar (mit dem Hinweis „unbestätigt“). Das betrifft Elemente mit `data-pending`: Trainer-Merkmal, Gruppengröße, Erste Hilfe,
Führungszeugnis und Versicherung. Wird `is-draft` entfernt, verschwinden diese Punkte automatisch. Bestätigte Punkte bekommen den Platzhalter-Text
ersetzt und `data-pending` entfernt.

Noch offen:

- **Veranstalter & Kontakt:** `[NAME DER UG]`, `[KONTAKT-E-MAIL]` (auch `mailto:`-Links anpassen), `[TELEFON]`, Instagram `[@HANDLE]` (Link in `index.html`)
- **Camp:** `[ADRESSE]`, `[UHRZEITEN]` / `[UHRZEIT]` (Tagesablauf), `[TAG 1–4]` (Programm), `[Details zur Verpflegung]`, `[ANFAHRT & PARKEN]`, `[AUSWEICHPLAN]` bei Unwetter
- **Preis:** `[REGULÄRER PREIS]` / `[PREIS]`. Freie Plätze (`[ANZAHL PLÄTZE]`) werden über `freeSpots` in `config.js` gesteuert.
- **Geschenk:** `[Details zu den Tickets folgen]`
- **Bundesliga-Besuch:** Derrick Köhns Foto (`assets/img/derrick-koehn.webp`) ist nur 195×256 px groß und wurde 2× hochskaliert. Für scharfe Karten bitte eine größere Version als freigestelltes PNG/WebP austauschen. Dazu `[Tag & Uhrzeit der Besuche]`. Weitere Gäste: eine `fut--tba`-Karte in `index.html` durch eine Karte wie die von Derrick ersetzen (siehe Kommentar im HTML).
- **Team:** `[Rolle]`, Haltungssatz und Kurzvorstellung für Kevin Atakora und Michi Köhn. Die vorgeschlagenen Sätze sind nur Beispiele und müssen freigegeben werden. Dazu Fotos.
- **Sicherheit:** Gruppengröße, Erste Hilfe, erweitertes Führungszeugnis, Versicherung. Nur bestätigte Punkte zeigen.
- **Gutschein:** Gültigkeit, Regelung bei ausgebuchtem Camp, Versandzeitpunkt des PDFs
- **Anmeldung:** Zahlungsarten, Kanäle für Foto-Veröffentlichung, Trikot-Größentabelle
- **Rechtstexte:** Impressum, Datenschutz, AGB & Stornobedingungen kommen vom Veranstalter (rechtlich prüfen lassen, insbesondere Widerrufsrecht und Einwilligungen für Fotos von Minderjährigen)
- **Domain:** `https://freistil-kids.example` in allen Dateien ersetzen (Canonical-Links, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`, `flyer/index.html`)

### Fotos einsetzen

Eingebaut sind bisher: Hero (`hero-kind-schuss.webp`), Problem-Abschnitt (`kind-spielszene.webp`), Über uns (`freestyle-trick.webp`) und Derrick Köhn. Bei den Team-Fotos steht im HTML ein auskommentiertes `<img>`-Beispiel. Fotos am besten als **WebP** (Hero ca. 960×1200 px,
Team 600×600 px, unter 200 KB), mit Alt-Text und mit `width`/`height`-Angaben einbinden. Nur Personen zeigen, deren Freigabe vorliegt.

### Echte Stimmen nach dem ersten Camp

In `index.html` steht vor dem FAQ ein auskommentierter Abschnitt „Echte Stimmen“. Ihr aktiviert ihn, sobald es echte, freigegebene Zitate gibt.

## Go-live-Checkliste

1. Platzhalter ausfüllen (siehe oben), Domain ersetzen
2. Rechtstexte einsetzen
3. Formular-Endpunkte und Zahlungsanbieter in `config.js` anbinden und eine Test-Anmeldung durchspielen
4. `class="is-draft"` aus allen Seiten entfernen
5. QR-Code auf `https://DOMAIN/flyer` erzeugen und testen

## Design-System (Kurzüberblick)

- Farben (CSS-Variablen in `assets/css/styles.css`): Rasengrün `--green-900`, Sonnengold `--gold-500`, Sand `--sand-100`, Fast-Schwarz `--ink-900`
- Schriften: **Anton** für Headlines und **Inter** für Fließtext. Beide sind lokal unter `assets/fonts/` eingebunden (SIL Open Font License, siehe `OFL-*.txt`), es gibt keine Anfragen an Google.
- Header, Footer und Icons sind in jeder Seite enthalten. Bei Änderungen an der Navigation müssen alle Seiten angepasst werden.
- Animationen sind dezent und werden bei „Bewegung reduzieren“ (prefers-reduced-motion) automatisch abgeschaltet.
