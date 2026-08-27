# Noten & Akkorde lernen

Ruhiges Übungsprogramm zum Notenlesen und Akkordspiel — für das Tablet im
Querformat, mit dem E-Piano oder unterwegs per Touch.

Deutsche Notennamen durchgehend (C D E F G A **H**), keine Zeitmessung, kein
Punktestand. Falsche Griffe kosten nichts: die Note pulsiert kurz in Flieder,
und man darf weiter probieren, bis es sitzt.

## Die drei Modi

**Einzelne Noten** — Eine Note im Doppelsystem, nach der Landmark-Methode:
Violin- und Bassschlüssel wachsen gemeinsam von der Mitte nach außen. Start
beim mittleren C, dann G4 und F3, dann C5 und C3, danach stufenweise. Neun
Pakete, einzeln an- und abwählbar.

**Melodien** — Vier bis acht Töne, ausschließlich aus den freigeschalteten
Noten gewürfelt. Schritte vor Sprüngen, Anfang und Ende möglichst auf einem
Landmark. Ein Cursor zeigt, wo man gerade ist; der Würfel-Knopf liefert endlos
neue Varianten.

**Akkorde** — Zwei Wege durch denselben Vorrat:

- *einzeln*: ein Akkord mit allen seinen Umkehrungen nacheinander
- *Folgen*: harmonisch zusammenhängende Ketten, von C–G–Am–F über die
  II–V–I-Kadenz bis zum Blues. Vor dem Start steht der komplette Plan da —
  welcher Akkord in welcher Stellung —, damit die Finger wissen, wohin sie
  gehen.

Acht Akkordpakete von den ersten Dreiklängen bis zu Non-, Undezim- und
Tredezimakkorden. Die Auswahl geht über drei Ebenen: Paket, einzelne Akkorde
daraus, und welche Umkehrungen drankommen sollen.

## Zwei Spielweisen

**Unterwegs** — Klaviatur auf dem Bildschirm, Klang aus der App.

**Am Klavier** — Eingabe und Klang kommen vom Yamaha Arius YDP-145 (oder
jedem anderen class-compliant USB-MIDI-Gerät), angeschlossen am USB-to-Host-Port.

### Wo der Klavier-Modus funktioniert

| Gerät | Klavier per USB |
|---|---|
| Android-Tablet mit Chrome | ✅ per USB-C/OTG-Kabel |
| Desktop-Chrome, Edge, Opera | ✅ |
| Firefox | ✅ |
| **iPad / iPhone** | ❌ |

WebKit liefert die Web MIDI API nicht aus, und da alle iOS-Browser WebKit
benutzen, hilft dort auch Chrome nicht. Auf dem iPad blendet die App den
MIDI-Bereich deshalb aus und zeigt kommentarlos die Klaviatur — dieselbe
Übungslogik, nur eine andere Eingabequelle.

Zwei Bedingungen für den Klavier-Modus: die Seite muss über **HTTPS** laufen
(oder localhost), und Android fragt einmalig nach der USB-Geräte-Berechtigung.

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # Musiktheorie- und Geometrie-Kern
npm run lint
npm run build    # statischer Export nach out/
```

Am Rechner lässt sich der Klavier-Modus direkt testen: `localhost` gilt als
sicherer Kontext, das Klavier wird also erkannt.

Auf dem Tablet reicht der Dev-Server über `192.168.x.x` nicht — das ist kein
sicherer Kontext. Dafür entweder gegen die veröffentlichte Seite testen oder
`next dev --experimental-https` mit einem auf dem Tablet installierten
Zertifikat benutzen.

### Notenschlüssel und Vorzeichen

Die Glyphen für Violin- und Bassschlüssel sowie Kreuz, Be und Auflösungszeichen
stammen aus der Bravura-Notenschrift (SIL Open Font License 1.1) und wurden
einmalig als SVG-Pfade extrahiert. Die App lädt deshalb keine Notenschrift.
Neu erzeugen:

```bash
node scripts/glyphen-extrahieren.mjs
```

## Veröffentlichen auf GitHub Pages

Der Workflow unter `.github/workflows/deploy.yml` baut bei jedem Push auf
`main` und veröffentlicht `out/`. Einmalig einzurichten:

1. In den Repository-Einstellungen unter **Pages** als Quelle *GitHub Actions*
   wählen.
2. Fertig — der Basispfad kommt automatisch aus der Pages-Konfiguration, egal
   ob das Repo `<benutzer>.github.io` heißt oder ein Projekt-Repo ist.

GitHub Pages ist für öffentliche Repositories kostenlos; für ein privates
braucht es einen bezahlten Plan. Die App speichert nichts außerhalb des
Browsers, es gibt also keinen Grund, sie nicht öffentlich zu stellen.

## Aufbau

```
lib/music/       Tonhöhen, Curriculum, Melodien, Akkorde, Akkordfolgen
lib/notation/    Geometrie des Doppelsystems, Schlüssel-Glyphen
lib/input/       Web MIDI und Klaviatur hinter einem gemeinsamen Ereignisstrom
lib/practice/    Auswahl der nächsten Aufgabe, Akkorderkennung
lib/store/       Einstellungen und Fehlerstatistik im localStorage
components/      Notenrenderer, Klaviatur, Übungsbausteine
app/             Startseite und die drei Modi
```

Zwei Entscheidungen tragen den Rest:

**Eine Note wird durch zwei Zahlen beschrieben** — `midi` bestimmt den Klang,
`diatonic` die Position auf den Linien. Getrennt geführt, weil Fis und Ges
gleich klingen, aber auf verschiedenen Linien sitzen. Deshalb schreibt sich
Fis-Dur automatisch mit Ais statt mit B.

**Alle Modi kennen nur einen Ereignisstrom** — ob eine Note vom Klavier oder
von einem Fingertipp kommt, ist der Übungslogik egal. Das ist der Grund, warum
Tablet, Klavier und Rechner denselben Code fahren.

## Nicht enthalten

Rhythmus und Notenwerte, Vorzeichen-Training beim Einzelnotenlesen,
Benutzerkonten, geräteübergreifende Synchronisation.
