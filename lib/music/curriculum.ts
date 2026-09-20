/**
 * Der Notenvorrat: welche Tasten kommen ueberhaupt vor?
 *
 * Frueher wuchs der Vorrat in kleinen Landmark-Stufen, eine nach der anderen
 * anzuhaken. Das war viel Verwaltung fuer eine Frage, die sich beim Ueben
 * ohnehin nur in zwei Varianten stellt: bleibe ich auf den weissen Tasten,
 * oder kommen die schwarzen dazu? Genau diese beiden Vorraete gibt es hier.
 *
 * Der Umfang ist in beiden Faellen derselbe: zwei Oktaven im Violinschluessel
 * (C4 bis C6) und zwei im Bassschluessel (C2 bis C4). Beide Systeme treffen
 * sich im mittleren C — es haengt einmal unter dem oberen System und einmal
 * ueber dem unteren, und ist damit zweimal zu lesen.
 */

import {
  type Note,
  type Schluessel,
  type SchluesselWahl,
  n,
  vonMidi,
} from "./pitch";

export type { SchluesselWahl };

/** Welche Stufe des Landmark-Systems geuebt wird. */
export type Notenbereich = "landmarks" | "darum" | "hilfslinien";

export const NOTENBEREICH_WAHLEN: Array<{ wert: Notenbereich; titel: string }> = [
  { wert: "landmarks", titel: "Nur Landmarks" },
  { wert: "darum", titel: "Noten darum herum" },
  { wert: "hilfslinien", titel: "Mit Hilfslinien" },
];

/** Nur die Stammtoene, oder auch die Halbtoene dazwischen? */
export type Tastenwahl = "weiss" | "alle";

export const TASTEN_WAHLEN: Array<{ wert: Tastenwahl; titel: string; hinweis?: string }> = [
  {
    wert: "weiss",
    titel: "Nur die weißen Tasten",
  },
  {
    wert: "alle",
    titel: "Auch die schwarzen",
  },
];

const LANDMARK_MIDIS: Record<Schluessel, number[]> = {
  violin: [n("C4").midi, n("G4").midi, n("C5").midi],
  bass: [n("C3").midi, n("F3").midi, n("C4").midi],
};

const BEREICH_DARUM: Record<Schluessel, { von: number; bis: number }> = {
  violin: { von: n("C4").midi, bis: n("G5").midi },
  bass: { von: n("F2").midi, bis: n("C4").midi },
};

const BEREICH_HILFSLINIEN: Record<Schluessel, { von: number; bis: number }> = {
  violin: { von: n("C4").midi, bis: n("C6").midi },
  bass: { von: n("C2").midi, bis: n("C4").midi },
};

/**
 * Wie wird diese Taste geschrieben?
 *
 * Weisse Tasten haben genau eine Schreibweise. Schwarze bekommen beide — Fis
 * und Ges sind derselbe Klang, stehen aber auf verschiedenen Linien, und
 * genau das ist beim Lesen der Unterschied.
 */
function schreibweisen(midi: number, wahl: Tastenwahl): Note[] {
  const stammton = vonMidi(midi, "kreuz");
  if (stammton.alteration === 0) return [stammton];
  return wahl === "weiss" ? [] : [stammton, vonMidi(midi, "b")];
}

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
 * Der Vorrat zur gewählten Tasten- und Bereichswahl.
 */
export function notenVorrat(wahl: Tastenwahl, bereich: Notenbereich = "landmarks"): UebungsNote[] {
  const ergebnis: UebungsNote[] = [];

  for (const schluessel of ["violin", "bass"] as const) {
    if (bereich === "landmarks") {
      for (const midi of LANDMARK_MIDIS[schluessel]) {
        for (const note of schreibweisen(midi, wahl)) {
          ergebnis.push({ note, schluessel });
        }
      }
    } else {
      const { von, bis } =
        bereich === "darum" ? BEREICH_DARUM[schluessel] : BEREICH_HILFSLINIEN[schluessel];
      for (let midi = von; midi <= bis; midi += 1) {
        for (const note of schreibweisen(midi, wahl)) {
          ergebnis.push({ note, schluessel });
        }
      }
    }
  }

  return ergebnis;
}

/** Wie viele Noten bringt eine Wahl mit? */
export function vorratUmfang(wahl: Tastenwahl, bereich: Notenbereich = "landmarks"): number {
  return notenVorrat(wahl, bereich).length;
}

export const SCHLUESSEL_WAHLEN: Array<{ wert: SchluesselWahl; titel: string; hinweis: string }> = [
  {
    wert: "beide",
    titel: "Beide Systeme",
    hinweis: "Gemischt in derselben Tonfolge — mit dem Sprung zwischen den Händen.",
  },
  { wert: "violin", titel: "Nur Violinschlüssel", hinweis: "Das obere System, meist die rechte Hand." },
  { wert: "bass", titel: "Nur Bassschlüssel", hinweis: "Das untere System, meist die linke Hand." },
];

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

/**
 * Die festen Bezugspunkte im Notenbild: die beiden mittleren C, das G in der
 * Windung des Violinschluessels, das F zwischen den Punkten des
 * Bassschluessels und die aeusseren C.
 *
 * Sie schneiden den Vorrat nicht mehr zu — aber Melodien fangen bevorzugt
 * hier an und hoeren hier auf. Das gibt einer gewuerfelten Tonfolge Halt.
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
