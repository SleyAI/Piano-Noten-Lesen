/**
 * Notenlese-Curriculum nach der Landmark-Methode.
 *
 * Statt einen Schluessel nach dem anderen zu lernen, wachsen beide Systeme
 * gemeinsam von der Mitte nach aussen. Das mittlere C ist der gemeinsame
 * Ankerpunkt: es liegt im Violinschluessel eine Hilfslinie unter dem System
 * und im Bassschluessel eine darueber — spiegelbildlich zueinander.
 */

import {
  type Note,
  type Schluessel,
  type SchluesselWahl,
  n,
  noten,
  passenderSchluessel,
} from "./pitch";

export type { SchluesselWahl };

export interface NotenPaket {
  id: string;
  stufe: number;
  titel: string;
  /** Ein Satz, der erklaert, warum diese Noten zusammengehoeren. */
  hinweis: string;
  /** Noten im Violinschluessel. */
  violin: Note[];
  /** Noten im Bassschluessel. */
  bass: Note[];
}

export const NOTEN_PAKETE: NotenPaket[] = [
  {
    id: "mitte",
    stufe: 1,
    titel: "Die Mitte",
    hinweis:
      "Das mittlere C — der Ankerpunkt. Oben hängt es unter dem System, unten sitzt es darüber.",
    violin: noten("C4"),
    bass: noten("C4"),
  },
  {
    id: "landmarks",
    stufe: 2,
    titel: "Die Landmarks",
    hinweis:
      "G4 sitzt genau in der Windung des Violinschlüssels, F3 zwischen den beiden Punkten des Bassschlüssels.",
    violin: noten("G4"),
    bass: noten("F3"),
  },
  {
    id: "aeussere-c",
    stufe: 3,
    titel: "Die äußeren C",
    hinweis: "Eine Oktave über und unter der Mitte — drei feste Punkte pro System.",
    violin: noten("C5"),
    bass: noten("C3"),
  },
  {
    id: "um-die-mitte",
    stufe: 4,
    titel: "Um die Mitte herum",
    hinweis: "Die direkten Nachbarn des mittleren C, je einen Schritt nach oben und unten.",
    violin: noten("D4 E4"),
    bass: noten("H3 A3"),
  },
  {
    id: "um-die-landmarks",
    stufe: 5,
    titel: "Um die Landmarks",
    hinweis: "Nachbarn von G4 und F3 — von einem sicheren Punkt aus einen Schritt weit denken.",
    violin: noten("F4 A4"),
    bass: noten("E3 G3"),
  },
  {
    id: "um-die-aeusseren-c",
    stufe: 6,
    titel: "Um die äußeren C",
    hinweis: "Nachbarn von C5 und C3. Damit ist jeder Anker von beiden Seiten erschlossen.",
    violin: noten("H4 D5"),
    bass: noten("D3 H2"),
  },
  {
    id: "oktave-voll",
    stufe: 7,
    titel: "Die Oktave ist voll",
    hinweis: "Alle Stammtöne von C4 bis C5 oben und von C3 bis C4 unten — keine Lücken mehr.",
    violin: noten("C4 D4 E4 F4 G4 A4 H4 C5"),
    bass: noten("C3 D3 E3 F3 G3 A3 H3 C4"),
  },
  {
    id: "nach-aussen",
    stufe: 8,
    titel: "Weiter nach außen",
    hinweis: "Die restlichen Töne im System und knapp daneben — noch ohne Hilfslinien.",
    violin: noten("E5 F5 G5"),
    bass: noten("A2 G2 F2"),
  },
  {
    id: "hilfslinien",
    stufe: 9,
    titel: "Über die Linien hinaus",
    hinweis: "Die Töne mit Hilfslinien am oberen und unteren Rand.",
    violin: noten("A5 H5 C6"),
    bass: noten("E2 D2 C2"),
  },
];

export const PAKET_NACH_ID = new Map(NOTEN_PAKETE.map((p) => [p.id, p]));

export const SCHLUESSEL_WAHLEN: Array<{ wert: SchluesselWahl; titel: string; hinweis: string }> = [
  { wert: "beide", titel: "Beide Systeme", hinweis: "So, wie Klaviernoten geschrieben sind." },
  { wert: "violin", titel: "Nur Violinschlüssel", hinweis: "Das obere System, meist die rechte Hand." },
  { wert: "bass", titel: "Nur Bassschlüssel", hinweis: "Das untere System, meist die linke Hand." },
];

/** Eine Note zusammen mit dem System, in dem sie geuebt wird. */
export interface UebungsNote {
  note: Note;
  schluessel: Schluessel;
}

/** Stabiler Schluessel fuer Statistik — dieselbe Note zaehlt je System getrennt. */
export function uebungsSchluessel(u: UebungsNote): string {
  return `${u.schluessel}:${u.note.diatonic}:${u.note.alteration}`;
}

/**
 * Alle Uebungsnoten der gewaehlten Pakete, ohne Doppelte.
 *
 * C4 erscheint bewusst zweimal — einmal je System. Die beiden Systeme stehen
 * mit Abstand untereinander, das mittlere C haengt also einmal unter dem
 * oberen und einmal ueber dem unteren. Zwei Notenbilder, zwei Uebungskarten.
 */
export function notenAusPaketen(paketIds: readonly string[]): UebungsNote[] {
  const gesehen = new Set<string>();
  const ergebnis: UebungsNote[] = [];

  for (const id of paketIds) {
    const paket = PAKET_NACH_ID.get(id);
    if (!paket) continue;

    for (const [schluessel, liste] of [
      ["violin", paket.violin],
      ["bass", paket.bass],
    ] as const) {
      for (const note of liste) {
        const u: UebungsNote = { note, schluessel };
        const key = uebungsSchluessel(u);
        if (gesehen.has(key)) continue;
        gesehen.add(key);
        ergebnis.push(u);
      }
    }
  }

  return ergebnis;
}

/**
 * Auf ein System einschraenken.
 *
 * Bleibt dabei nichts uebrig, gewinnt der volle Vorrat — eine leere Uebung
 * waere kein hilfreiches Ergebnis einer Einstellung.
 */
export function nachSchluessel(
  noten: readonly UebungsNote[],
  wahl: SchluesselWahl,
): UebungsNote[] {
  if (wahl === "beide") return [...noten];
  const gefiltert = noten.filter((u) => u.schluessel === wahl);
  return gefiltert.length > 0 ? gefiltert : [...noten];
}

/** Wie viele Noten bringt ein Paket mit? Fuer die Anzeige auf der Kachel. */
export function paketUmfang(paket: NotenPaket): number {
  return paket.violin.length + paket.bass.length;
}

/** Ordnet freie MIDI-Eingaben einem System zu — fuer Melodien ohne festes Paket. */
export function alsUebungsNote(note: Note): UebungsNote {
  return { note, schluessel: passenderSchluessel(note) };
}

/**
 * Die festen Bezugspunkte der Methode. Melodien fangen bevorzugt hier an und
 * hoeren hier auf — das gibt einer gewuerfelten Tonfolge einen Rahmen.
 */
export const LANDMARKS = new Set([
  n("C4").midi,
  n("G4").midi,
  n("F3").midi,
  n("C5").midi,
  n("C3").midi,
]);

export function istLandmark(u: UebungsNote): boolean {
  return LANDMARKS.has(u.note.midi);
}

/** Voreinstellung beim allerersten Start: nur die Mitte. */
export const START_PAKETE = [NOTEN_PAKETE[0].id];
