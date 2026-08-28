/**
 * Uebungen zu einem einzelnen Akkord.
 *
 * Einen Akkord kennt man nicht, wenn man drei Tasten gleichzeitig trifft. Man
 * kennt ihn, wenn die Hand ihn im Takt wiederholen kann, wenn sie ihn von
 * unten nach oben abrollt und wenn sich aus seinen Toenen eine kleine Melodie
 * bauen laesst. Deshalb liefert jede Lage nicht eine Aufgabe, sondern vier —
 * dieselben Toene aus vier Richtungen.
 *
 * Eine Uebung ist eine Folge von Schritten. Jeder Schritt sagt, was
 * gleichzeitig gegriffen wird und wie lange es steht; damit laesst sie sich
 * gleichermassen zeichnen, vorspielen und abpruefen.
 */

import { type Lage, griffImSystem } from "./akkorde";
import { type Note, type Schluessel, type SchluesselWahl, note } from "./pitch";
import {
  type NotenwertId,
  TAKT,
  dauerSumme,
  taktEnden,
  wuerfleRhythmus,
} from "./rhythmus";
import { gewichteteWahl } from "@/lib/practice/auswahl";

export interface UebungsSchritt {
  /** Was gleichzeitig klingen soll. */
  noten: Note[];
  wert: NotenwertId;
  /** Faellt hinter diesem Schritt ein Taktstrich? */
  taktEnde: boolean;
}

export type UebungsartId = "griff" | "takt" | "gebrochen" | "melodie";

export interface Uebungsart {
  id: UebungsartId;
  titel: string;
  hinweis: string;
}

export const UEBUNGSARTEN: Uebungsart[] = [
  {
    id: "griff",
    titel: "Der ganze Griff",
    hinweis: "Alle Töne zusammen, einmal in Ruhe stehen lassen.",
  },
  {
    id: "takt",
    titel: "Im Takt",
    hinweis: "Derselbe Griff über zwei Takte, in wechselnden Notenwerten.",
  },
  {
    id: "gebrochen",
    titel: "Gebrochen",
    hinweis: "Ton für Ton nach oben und wieder zurück.",
  },
  {
    id: "melodie",
    titel: "Kleine Melodie",
    hinweis: "Eine Linie aus den Akkordtönen, am Schluss der ganze Griff.",
  },
];

export const UEBUNGSART_NACH_ID = new Map(UEBUNGSARTEN.map((a) => [a.id, a]));

/** Setzt Taktstriche und packt die Schritte zusammen. */
function schritte(gruppen: Note[][], werte: NotenwertId[]): UebungsSchritt[] {
  const enden = taktEnden(werte);
  return gruppen.map((noten, i) => ({
    noten,
    wert: werte[i],
    taktEnde: enden[i],
  }));
}

/** Der ganze Griff, einmal als ganze Note. */
function griffUebung(toene: readonly Note[]): UebungsSchritt[] {
  return schritte([[...toene]], ["ganze"]);
}

/**
 * Derselbe Griff ueber zwei Takte in gewuerfelten Notenwerten.
 *
 * Ohne Achtel: einen vollen Akkord im Achtelabstand zu wiederholen ist eine
 * Handgelenksuebung, keine Akkorduebung.
 */
function taktUebung(toene: readonly Note[]): UebungsSchritt[] {
  const werte = wuerfleRhythmus(6, ["ganze", "halbe", "viertel"]);
  return schritte(
    werte.map(() => [...toene]),
    werte,
  );
}

/**
 * Von unten nach oben und wieder zurueck, ohne den obersten Ton doppelt.
 *
 * Alle Toene laufen als Viertel durch — eine Arpeggio-Figur lebt davon, dass
 * sie gleichmaessig ist. Nur der letzte Ton wird so lang, dass der Takt
 * aufgeht; bei einem Dreiklang ist das eine ganze Note, bei einem Vierklang
 * eine halbe. Die Figur endet damit immer auf einer Eins.
 */
function gebrochenUebung(toene: readonly Note[]): UebungsSchritt[] {
  const linie = [...toene, ...[...toene].reverse().slice(1)];
  const viertel = linie.length - 1;
  const rest = TAKT - (viertel % TAKT);

  const werte: NotenwertId[] = [
    ...Array.from({ length: viertel }, () => "viertel" as NotenwertId),
    rest >= 4 ? "ganze" : rest >= 2 ? "halbe" : "viertel",
  ];

  return schritte(
    linie.map((t) => [t]),
    werte,
  );
}

/**
 * Eine kleine Melodie aus den Akkordtoenen.
 *
 * Sieben Toene nach dem Naeheprinzip, dann der ganze Griff als Schlusspunkt —
 * so hoert man, dass die Linie und der Akkord dasselbe Material sind.
 */
function melodieUebung(toene: readonly Note[]): UebungsSchritt[] {
  // Der Grundton eine Oktave hoeher gibt der Linie Raum nach oben.
  const material = [...toene, note(toene[0].stufe, toene[0].alteration, toene[0].oktave + 1)];

  const linie: Note[] = [toene[0]];
  for (let i = 1; i < 7; i += 1) {
    const vorherige = linie[i - 1];
    const naechste = gewichteteWahl(material, (kandidat) => {
      const abstand = Math.abs(kandidat.diatonic - vorherige.diatonic);
      if (abstand === 0) return 0.05;
      return abstand <= 2 ? 4 : 1;
    });
    linie.push(naechste ?? material[0]);
  }

  const werte = wuerfleRhythmus(7, ["halbe", "viertel", "achtel"]);
  const gruppen = linie.map((t) => [t]);

  // Der Schlussakkord fuellt den angebrochenen Takt auf.
  const rest = (TAKT - (dauerSumme(werte) % TAKT)) % TAKT;
  gruppen.push([...toene]);
  werte.push(rest === 0 ? "ganze" : rest >= 2 ? "halbe" : "viertel");

  return schritte(gruppen, werte);
}

/**
 * Baut eine Uebung zu einer Lage.
 *
 * Der Griff wird vorher in das gewuenschte System gelegt — sonst uebt man im
 * Bassschluessel einen Akkord, der drei Hilfslinien ueber dem System steht.
 */
export function baueUebung(
  lage: Lage,
  art: UebungsartId,
  wahl: SchluesselWahl,
): { schluessel: Schluessel; schritte: UebungsSchritt[] } {
  const { schluessel, toene } = griffImSystem(lage.toene, wahl);

  const bauer: Record<UebungsartId, (t: readonly Note[]) => UebungsSchritt[]> = {
    griff: griffUebung,
    takt: taktUebung,
    gebrochen: gebrochenUebung,
    melodie: melodieUebung,
  };

  return { schluessel, schritte: bauer[art](toene) };
}

/** Alle MIDI-Nummern, die in einer Uebung vorkommen. */
export function midisDerUebung(schritte: readonly UebungsSchritt[]): number[] {
  return schritte.flatMap((s) => s.noten.map((n) => n.midi));
}

// --- Fingersatz -------------------------------------------------------------

/**
 * Ein brauchbarer Fingersatz fuer einen Griff.
 *
 * Keine Wissenschaft, sondern die Griffe, die in jeder Klavierschule stehen:
 * Daumen und kleiner Finger aussen, dazwischen die restlichen der Reihe nach.
 * Bei der ersten Umkehrung eines Dreiklangs liegen die unteren beiden Toene
 * naeher beieinander — dort rutscht die Mitte einen Finger weiter nach unten.
 *
 * `hand` folgt dem System: der Violinschluessel ist die rechte Hand, der
 * Bassschluessel die linke.
 */
export function fingersatz(
  anzahl: number,
  umkehrung: number,
  hand: Schluessel,
): number[] {
  const rechts =
    anzahl <= 3
      ? umkehrung === 1
        ? [1, 2, 5]
        : [1, 3, 5]
      : anzahl === 4
        ? [1, 2, 3, 5]
        : [1, 2, 3, 4, 5];

  const finger = rechts.slice(0, anzahl);
  return hand === "violin" ? finger : [...finger].reverse();
}
