# Noten & Akkorde lernen

Ruhiges Übungsprogramm zum Notenlesen und Akkordspiel — für das Tablet im
Querformat, mit dem E-Piano oder unterwegs per Touch.

Deutsche Notennamen durchgehend (C D E F G A **H**), keine Zeitmessung, kein
Punktestand. Falsche Griffe kosten nichts: die Note pulsiert kurz in Flieder,
und man darf weiter probieren, bis es sitzt.

## Niveau: was überhaupt drankommt

**Anfänger**, **Fortgeschritten** oder **Profi** — kein Rang, sondern ein
Vorrat. Anfänger bleiben auf den weißen Tasten: die Stammtöne rund um das
mittlere C und die sechs Akkorde, die daraus entstehen (C, Dm, Em, F, G, Am).
Ab Fortgeschritten kommen die schwarzen Tasten dazu, mit ihnen alle zwölf Dur-
und Molldreiklänge und die Dominantseptakkorde; Profi öffnet den Rest.

Unter *Dein Stand* steht, was zum eigenen Niveau gehört — die Notenstufen und
jeder einzelne Akkord —, und alles davon lässt sich abhaken. Das schaltet
nichts frei und sperrt nichts: es ist eine Merkliste für einen selbst. Ist eine
Liste voll, schlägt die App das nächste Niveau vor. Wechseln kann man jederzeit.

## Die zwei Modi

**Melodien** — Acht Töne, nach musikalischen Regeln gebaut statt gewürfelt:
Schritte vor Sprüngen, Anfang und Ende möglichst auf einem Landmark. Der Vorrat
folgt der Landmark-Methode — Violin- und Bassschlüssel wachsen gemeinsam von
der Mitte nach außen, Start beim mittleren C, dann G4 und F3, dann C5 und C3,
danach stufenweise.

Zwei Einstellungen bestimmen, wie schwer es wird:

- *Welches System* — nur Violinschlüssel, nur Bassschlüssel oder beide. „Beide"
  heißt dabei nicht abwechselnd eine Melodie oben und eine unten, sondern beide
  Systeme in derselben Tonfolge: der Sprung zwischen den Händen ist genau das,
  was am Doppelsystem schwerfällt.
- *Notenwerte* — aus bloßen Notenköpfen werden Ganze, Halbe, Viertel und Achtel
  im 4/4-Takt. Dann zählt auch die Länge mit, mit weiten Grenzen: erst wer eine
  Viertel doppelt so lang stehen lässt wie vorgesehen, macht einen Fehler.

Ein Fehlgriff setzt die Melodie an den Anfang zurück. Durch ist sie erst, wenn
sie am Stück sitzt — dann kommt ohne Zwischenbilanz die nächste.

**Akkorde** — Drei Wege durch dasselbe Material:

- *neu lernen* — einen Akkord aussuchen, seinen Griff samt Fingersatz auf der
  Tastatur anschauen und ihn von vier Seiten durchspielen: der ganze Griff,
  derselbe Griff im Takt, gebrochen von unten nach oben und zurück, und eine
  kleine Melodie aus seinen Tönen. Drei Tasten gleichzeitig zu drücken ist eben
  noch kein Akkord, den man kennt.
- *Umkehrungen* — dieselben Übungen, aber über die gewählten Stellungen: nur
  die erste, nur die zweite, beide, oder alle drei mit der Grundstellung.
- *Folgen* — entweder einen Akkord aussuchen und sich die harmonisch passenden
  Nachbarn dazu geben lassen (ein Durakkord wird als Grundstufe gelesen, ein
  Mollakkord als Parallele, ein Septakkord als Dominante), oder selbst anhaken,
  welche Akkorde vorkommen sollen. Gespielt wird als Blöcke, gebrochen oder
  gemischt. Vor dem Start steht der ganze Plan da: welcher Akkord in welcher
  Stellung, mit möglichst ruhiger Fingerführung dazwischen.

Innerhalb einer Übung rückt es von selbst weiter, sobald ein Schritt sitzt —
man soll ja im Fluss bleiben. Erst am Ende wartet die Übung auf ein *weiter*,
damit man den letzten Griff in Ruhe anschauen kann.

## Nur ein System oder beide

Die Wahl gilt für Melodien und Akkorde gleichermaßen. **Beide Systeme** ist die
Voreinstellung, denn davon lebt die Landmark-Methode. **Nur Violinschlüssel**
oder **nur Bassschlüssel** dient dem gezielten Üben einer Hand: Melodien werden
auf dieses System eingeschränkt, Akkorde rutschen oktavweise dorthin, wo sie
bequem liegen. C-Dur steht im Bassschlüssel deshalb als C3–E3–G3 mitten im
System statt auf drei Hilfslinien darüber.

## Einmal anhören

Neben jeder Aufgabe sitzt ein kleiner Play-Knopf. Er spielt vor, was zu spielen
ist — mit den Notenwerten, die dastehen. Das ist ein Angebot, keine Vorgabe:
wer die Noten selbst lesen möchte, tippt einfach nicht darauf. Noch einmal
tippen bricht ab.

Der Klang kommt dabei immer aus der App, auch im Klavier-Modus — das E-Piano
kann nur, was jemand darauf spielt.

## Wenn etwas danebengeht

Kein Rot, kein Abbruch, keine Wertung. Stattdessen erscheint die tatsächlich
gespielte Note blass in Flieder direkt neben der erwarteten — man sieht den
Abstand, statt ihn zu raten — und der Hinweis nennt sie beim Namen („Das war
G2"). Beliebig viele Versuche, die Aufgabe wartet.

Im Hintergrund zählt die App mit, welche Noten und Griffe zögern. Auf der
Startseite steht eine kurze Liste davon.

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

Die Glyphen für Violin- und Bassschlüssel, Kreuz, Be und Auflösungszeichen
sowie Notenköpfe und Achtelfahnen stammen aus der Bravura-Notenschrift
(SIL Open Font License 1.1) und wurden einmalig als SVG-Pfade extrahiert. Die App lädt deshalb keine Notenschrift.
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
lib/music/       Tonhöhen, Curriculum, Niveaus, Melodien, Rhythmus,
                 Akkorde, Akkordübungen, Akkordfolgen
lib/notation/    Geometrie des Doppelsystems, Glyphen aus Bravura
lib/input/       Web MIDI und Klaviatur hinter einem gemeinsamen Ereignisstrom
lib/audio/       Klangerzeugung und das Vorspielen ganzer Folgen
lib/practice/    Auswahl der nächsten Aufgabe, Akkorderkennung, Übungsläufe
lib/store/       Einstellungen und Fehlerstatistik im localStorage
components/      Notenrenderer, Klaviatur, Übungsbausteine
app/             Startseite, „Dein Stand" und die zwei Modi
```

Drei Entscheidungen tragen den Rest:

**Eine Note wird durch zwei Zahlen beschrieben** — `midi` bestimmt den Klang,
`diatonic` die Position auf den Linien. Getrennt geführt, weil Fis und Ges
gleich klingen, aber auf verschiedenen Linien sitzen. Deshalb schreibt sich
Fis-Dur automatisch mit Ais statt mit B.

**Alle Modi kennen nur einen Ereignisstrom** — ob eine Note vom Klavier oder
von einem Fingertipp kommt, ist der Übungslogik egal. Das ist der Grund, warum
Tablet, Klavier und Rechner denselben Code fahren.

**Eine Übung ist eine Folge von Schritten** — jeder Schritt sagt, was
gleichzeitig gegriffen wird und wie lange es steht. Dieselbe Beschreibung lässt
sich zeichnen, vorspielen und abprüfen, egal ob dahinter ein einzelner Akkord,
eine Arpeggio-Figur oder eine ganze Akkordfolge steckt.

## Nicht enthalten

Balken über Achtelgruppen — jede Achtel bekommt ihre eigene Fahne —,
punktierte Noten, Pausen, andere Taktarten als 4/4, Benutzerkonten und
geräteübergreifende Synchronisation.
