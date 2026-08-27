/**
 * Akkorde, Umkehrungen und Stimmfuehrung.
 *
 * Ein Akkordtyp wird nicht als Halbtonliste beschrieben, sondern als Paar aus
 * diatonischem Schritt und Halbtonabstand. Damit ergibt sich die Schreibweise
 * jedes Tons von selbst: die Terz liegt immer zwei Stufen ueber dem Grundton,
 * ob sie nun gross oder klein ist. Fis-Dur bekommt so ein Ais statt eines B,
 * und im Notenbild landet sie auf der richtigen Linie.
 *
 * Die Zahl der Umkehrungen wird nie fest verdrahtet, sondern aus der Groesse
 * des Akkords abgeleitet — ein Dreiklang hat zwei, ein Vierklang drei.
 */

import {
  type Alteration,
  type Note,
  type Schluessel,
  type SchluesselWahl,
  type Stufe,
  ausDiatonicUndMidi,
  hilfslinien,
  linienPosition,
  name,
  note,
  passenderSchluesselFuer,
} from "./pitch";

/** Ein Akkordton: so viele Stufen und so viele Halbtoene ueber dem Grundton. */
type Ton = readonly [schritt: number, halbton: number];

export interface AkkordTyp {
  id: string;
  /** Wird an den Grundton gehaengt: "" fuer Dur, "m" fuer Moll, "7" … */
  suffix: string;
  /** Ausgeschriebener Name fuer die Anzeige. */
  bezeichnung: string;
  toene: readonly Ton[];
}

export const AKKORD_TYPEN = {
  dur: { id: "dur", suffix: "", bezeichnung: "Dur", toene: [[0, 0], [2, 4], [4, 7]] },
  moll: { id: "moll", suffix: "m", bezeichnung: "Moll", toene: [[0, 0], [2, 3], [4, 7]] },
  sus2: { id: "sus2", suffix: "sus2", bezeichnung: "sus2", toene: [[0, 0], [1, 2], [4, 7]] },
  sus4: { id: "sus4", suffix: "sus4", bezeichnung: "sus4", toene: [[0, 0], [3, 5], [4, 7]] },
  add9: {
    id: "add9",
    suffix: "add9",
    bezeichnung: "add9",
    toene: [[0, 0], [2, 4], [4, 7], [8, 14]],
  },
  dominant7: {
    id: "dominant7",
    suffix: "7",
    bezeichnung: "Dominantseptakkord",
    toene: [[0, 0], [2, 4], [4, 7], [6, 10]],
  },
  maj7: {
    id: "maj7",
    suffix: "maj7",
    bezeichnung: "großer Septakkord",
    toene: [[0, 0], [2, 4], [4, 7], [6, 11]],
  },
  moll7: {
    id: "moll7",
    suffix: "m7",
    bezeichnung: "Mollseptakkord",
    toene: [[0, 0], [2, 3], [4, 7], [6, 10]],
  },
  vermindert: {
    id: "vermindert",
    suffix: "dim",
    bezeichnung: "vermindert",
    toene: [[0, 0], [2, 3], [4, 6]],
  },
  vermindert7: {
    id: "vermindert7",
    suffix: "dim7",
    bezeichnung: "verminderter Septakkord",
    toene: [[0, 0], [2, 3], [4, 6], [6, 9]],
  },
  uebermaessig: {
    id: "uebermaessig",
    suffix: "aug",
    bezeichnung: "übermäßig",
    toene: [[0, 0], [2, 4], [4, 8]],
  },
  halbvermindert: {
    id: "halbvermindert",
    suffix: "m7b5",
    bezeichnung: "halbvermindert",
    toene: [[0, 0], [2, 3], [4, 6], [6, 10]],
  },
  neun: {
    id: "neun",
    suffix: "9",
    bezeichnung: "Nonakkord",
    toene: [[0, 0], [2, 4], [4, 7], [6, 10], [8, 14]],
  },
  moll9: {
    id: "moll9",
    suffix: "m9",
    bezeichnung: "Mollnonakkord",
    toene: [[0, 0], [2, 3], [4, 7], [6, 10], [8, 14]],
  },
  // Bei Elf- und Dreizehnakkorden laesst man in der Praxis Toene weg —
  // sonst braucht man mehr Finger als vorhanden.
  elf: {
    id: "elf",
    suffix: "11",
    bezeichnung: "Undezimakkord",
    toene: [[0, 0], [4, 7], [6, 10], [8, 14], [10, 17]],
  },
  dreizehn: {
    id: "dreizehn",
    suffix: "13",
    bezeichnung: "Tredezimakkord",
    toene: [[0, 0], [2, 4], [6, 10], [12, 21]],
  },
} as const satisfies Record<string, AkkordTyp>;

export type AkkordTypId = keyof typeof AKKORD_TYPEN;

// --- Grundtoene -------------------------------------------------------------

/** Die zwoelf Grundtoene in gebraeuchlicher deutscher Schreibweise. */
const GRUNDTOENE: Array<{ stufe: Stufe; alteration: Alteration }> = [
  { stufe: "C", alteration: 0 },
  { stufe: "D", alteration: -1 },
  { stufe: "D", alteration: 0 },
  { stufe: "E", alteration: -1 },
  { stufe: "E", alteration: 0 },
  { stufe: "F", alteration: 0 },
  { stufe: "F", alteration: 1 },
  { stufe: "G", alteration: 0 },
  { stufe: "A", alteration: -1 },
  { stufe: "A", alteration: 0 },
  { stufe: "H", alteration: -1 },
  { stufe: "H", alteration: 0 },
];

/**
 * Legt den Grundton in eine bequeme Lage: zwischen G3 und Fis4.
 * Damit bleiben Grundstellung und Umkehrungen um das mittlere C herum.
 */
const LAGE_UNTEN = 55; // G3

function grundtonNote(index: number): Note {
  const { stufe, alteration } = GRUNDTOENE[index];
  const midi = LAGE_UNTEN + (((index - LAGE_UNTEN) % 12) + 12) % 12;
  // Aus Klang und Schreibweise ergibt sich die Oktave.
  const oktave = Math.round((midi - halbtonVon(stufe) - alteration) / 12) - 1;
  return note(stufe, alteration, oktave);
}

function halbtonVon(stufe: Stufe): number {
  return { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, H: 11 }[stufe];
}

// --- Akkorde ----------------------------------------------------------------

export interface Akkord {
  id: string;
  /** Anzeigesymbol, z. B. "C", "Am", "G7", "Hm7b5". */
  symbol: string;
  typ: AkkordTyp;
  grundton: Note;
  /** Toene in Grundstellung, aufsteigend. */
  toene: Note[];
  paket: string;
}

/**
 * Baut einen Akkord. Liefert `null`, wenn ein Ton nur mit Doppelvorzeichen zu
 * schreiben waere — H-uebermaessig braeuchte ein Fisis und faellt damit weg.
 */
export function baueAkkord(
  grundtonIndex: number,
  typ: AkkordTyp,
  paket: string,
): Akkord | null {
  const grundton = grundtonNote(grundtonIndex);
  const toene: Note[] = [];

  for (const [schritt, halbton] of typ.toene) {
    const ton = ausDiatonicUndMidi(grundton.diatonic + schritt, grundton.midi + halbton);
    if (!ton) return null;
    toene.push(ton);
  }

  const symbol = `${name(grundton)}${typ.suffix}`;
  return {
    id: `${symbol}`,
    symbol,
    typ,
    grundton,
    toene,
    paket,
  };
}

/** Wie viele Umkehrungen hat dieser Akkord? Dreiklang zwei, Vierklang drei. */
export function anzahlUmkehrungen(akkord: Akkord): number {
  return akkord.toene.length - 1;
}

export interface Lage {
  akkord: Akkord;
  /** 0 = Grundstellung, 1 = erste Umkehrung, … */
  umkehrung: number;
  toene: Note[];
}

const UMKEHRUNG_NAME = [
  "Grundstellung",
  "1. Umkehrung",
  "2. Umkehrung",
  "3. Umkehrung",
  "4. Umkehrung",
];

export function umkehrungName(umkehrung: number): string {
  return UMKEHRUNG_NAME[umkehrung] ?? `${umkehrung}. Umkehrung`;
}

/** Eine Oktave hoeher — diatonisch wie klanglich. */
function eineOktaveHoeher(ton: Note): Note {
  return note(ton.stufe, ton.alteration, ton.oktave + 1);
}

/** Bequemes Fenster fuer den tiefsten Ton eines Griffs: G3 bis Fis4. */
const LAGE_OBEN = LAGE_UNTEN + 11;

/**
 * Schiebt einen Griff oktavweise dorthin, wo er gut liegt.
 *
 * Ohne das wandern die Umkehrungen immer weiter nach oben — die zweite
 * Umkehrung von C-Dur waere G4-C5-E5 statt des viel naheliegenderen
 * G3-C4-E4. Ausserdem laeuft der Griff sonst irgendwann aus dem Notenbild.
 */
function inBequemeLage(toene: readonly Note[]): Note[] {
  if (toene.length === 0) return [];
  const tiefster = toene[0].midi;
  let oktaven = 0;
  while (tiefster + oktaven * 12 > LAGE_OBEN) oktaven -= 1;
  while (tiefster + oktaven * 12 < LAGE_UNTEN) oktaven += 1;
  if (oktaven === 0) return [...toene];
  return toene.map((t) => note(t.stufe, t.alteration, t.oktave + oktaven));
}

/**
 * Erzeugt eine Umkehrung, indem die untersten Toene nach oben gelegt werden.
 * Aus C-E-G wird so E-G-C und dann G-C-E.
 *
 * Anschliessend wird sortiert: bei Akkorden, die weiter als eine Oktave
 * reichen — Cadd9 etwa spannt bis zur None — landet der umgelegte Ton sonst
 * mitten im Akkord statt obenauf. Welcher Ton im Bass liegt, bleibt davon
 * unberuehrt, und genau der bestimmt die Umkehrung.
 */
export function lage(akkord: Akkord, umkehrung: number): Lage {
  const toene = [...akkord.toene];
  for (let i = 0; i < umkehrung; i += 1) {
    const unterster = toene.shift();
    if (!unterster) break;
    toene.push(eineOktaveHoeher(unterster));
    toene.sort((a, b) => a.midi - b.midi);
  }
  return { akkord, umkehrung, toene: inBequemeLage(toene) };
}

/** Alle Lagen eines Akkords, gefiltert auf die gewuenschten Umkehrungen. */
export function lagen(akkord: Akkord, erlaubt?: readonly number[]): Lage[] {
  const alle = Array.from({ length: anzahlUmkehrungen(akkord) + 1 }, (_, i) => i);
  const gewaehlt = erlaubt ? alle.filter((i) => erlaubt.includes(i)) : alle;
  // Ganz ohne Lage waere der Akkord nicht spielbar — dann eben Grundstellung.
  return (gewaehlt.length > 0 ? gewaehlt : [0]).map((i) => lage(akkord, i));
}

export function lageBeschriftung(l: Lage): string {
  return `${l.akkord.symbol}, ${umkehrungName(l.umkehrung)}`;
}

/** Stabiler Schluessel fuer die Fehlerstatistik. */
export function lageSchluessel(l: Lage): string {
  return `akkord:${l.akkord.id}:${l.umkehrung}`;
}

/**
 * Legt einen Griff oktavweise in das gewuenschte System.
 *
 * Wer nur den Bassschluessel ueben will, bekommt C-Dur sonst mit drei
 * Hilfslinien ueber dem System zu sehen — eine Oktave tiefer sitzt derselbe
 * Akkord bequem mitten drin. Bei Gleichstand bleibt die Lage, wie sie ist.
 */
export function inSystem(toene: readonly Note[], schluessel: Schluessel): Note[] {
  const hilfslinienZahl = (kandidat: readonly Note[]) =>
    kandidat.reduce((summe, t) => summe + hilfslinien(linienPosition(t, schluessel)).length, 0);

  // Ein Oktavsprung kostet etwas, sonst wandert C-Dur im Violinschluessel nach
  // oben, nur um die eine vertraute Hilfslinie unter dem C4 loszuwerden.
  // Mit diesem Gewicht wird erst verschoben, wenn das zwei Hilfslinien spart.
  const SPRUNG_KOSTEN = 1.5;

  let beste = [...toene];
  let bestesMass = hilfslinienZahl(toene);

  for (const oktaven of [-1, 1, -2, 2]) {
    const kandidat = toene.map((t) => note(t.stufe, t.alteration, t.oktave + oktaven));
    const mass = hilfslinienZahl(kandidat) + Math.abs(oktaven) * SPRUNG_KOSTEN;
    if (mass < bestesMass) {
      bestesMass = mass;
      beste = kandidat;
    }
  }

  return beste;
}

/**
 * In welchem System wird dieser Griff gezeigt, und in welcher Lage?
 *
 * Bei "beide" entscheidet der Akkord selbst, bei einer festen Wahl wird er
 * dorthin gelegt.
 */
export function griffImSystem(
  toene: readonly Note[],
  wahl: SchluesselWahl,
): { schluessel: Schluessel; toene: Note[] } {
  if (wahl === "beide") {
    return { schluessel: passenderSchluesselFuer(toene), toene: [...toene] };
  }
  return { schluessel: wahl, toene: inSystem(toene, wahl) };
}

// --- Stimmfuehrung ----------------------------------------------------------

/**
 * Wie weit muessen die Finger zwischen zwei Lagen wandern?
 *
 * Verglichen werden die Toene der Reihe nach von unten. Unterschiedlich grosse
 * Akkorde bekommen einen Aufschlag pro ueberzaehligem Ton, damit der Vergleich
 * nicht allein wegen der Anzahl gewinnt.
 */
export function stimmabstand(von: readonly Note[], nach: readonly Note[]): number {
  const gemeinsam = Math.min(von.length, nach.length);
  let summe = 0;
  for (let i = 0; i < gemeinsam; i += 1) {
    summe += Math.abs(von[i].midi - nach[i].midi);
  }
  return summe + Math.abs(von.length - nach.length) * 6;
}

/**
 * Waehlt fuer eine Akkordfolge die Lagen mit der ruhigsten Fingerbewegung.
 *
 * Der erste Akkord startet in Grundstellung, wenn die erlaubt ist — das ist
 * der Griff, den man am ehesten im Kopf hat. Danach gewinnt jeweils die Lage
 * mit dem kuerzesten Weg zum Vorgaenger.
 */
export function flottePlanung(
  akkorde: readonly Akkord[],
  erlaubteUmkehrungen?: readonly number[],
): Lage[] {
  const plan: Lage[] = [];

  for (const akkord of akkorde) {
    const auswahl = lagen(akkord, erlaubteUmkehrungen);
    const vorherige = plan[plan.length - 1];

    if (!vorherige) {
      const grundstellung = auswahl.find((l) => l.umkehrung === 0);
      plan.push(grundstellung ?? auswahl[0]);
      continue;
    }

    let beste = auswahl[0];
    let bester = stimmabstand(vorherige.toene, beste.toene);
    for (const kandidat of auswahl.slice(1)) {
      const abstand = stimmabstand(vorherige.toene, kandidat.toene);
      if (abstand < bester) {
        beste = kandidat;
        bester = abstand;
      }
    }
    plan.push(beste);
  }

  return plan;
}

/** Alle Akkorde in Grundstellung — die schlichte Variante. */
export function grundstellungsPlanung(akkorde: readonly Akkord[]): Lage[] {
  return akkorde.map((a) => lage(a, 0));
}

// --- Pakete -----------------------------------------------------------------

export interface AkkordPaket {
  id: string;
  stufe: number;
  titel: string;
  hinweis: string;
  /** Welche Typen und welche Grundtoene das Paket abdeckt. */
  typen: AkkordTypId[];
  /** Grundton-Indizes; ohne Angabe alle zwoelf. */
  grundtoene?: number[];
}

/** Die sieben Akkorde, mit denen fast jedes Anfaengerstueck auskommt. */
const ERSTE: Array<[number, AkkordTypId]> = [
  [0, "dur"], // C
  [7, "dur"], // G
  [2, "dur"], // D
  [5, "dur"], // F
  [9, "moll"], // Am
  [4, "moll"], // Em
  [2, "moll"], // Dm
];

/** Grundtoene ohne Vorzeichen plus die zwei gebraeuchlichsten mit. */
const HAEUFIGE_GRUNDTOENE = [0, 2, 4, 5, 7, 9, 11, 10, 3];

export const AKKORD_PAKETE: AkkordPaket[] = [
  {
    id: "dreiklaenge-erste",
    stufe: 1,
    titel: "Erste Dreiklänge",
    hinweis: "Die sieben Akkorde, mit denen die meisten Lieder auskommen.",
    typen: ["dur", "moll"],
    grundtoene: [],
  },
  {
    id: "dur-moll-komplett",
    stufe: 2,
    titel: "Dur & Moll komplett",
    hinweis: "Alle zwölf Dur- und Molldreiklänge, auch die mit Vorzeichen.",
    typen: ["dur", "moll"],
  },
  {
    id: "sus-add",
    stufe: 3,
    titel: "Sus & Add",
    hinweis: "Die Terz weicht einen Schritt aus — schwebend statt fest.",
    typen: ["sus2", "sus4", "add9"],
    grundtoene: HAEUFIGE_GRUNDTOENE,
  },
  {
    id: "dominantsept",
    stufe: 4,
    titel: "Dominantseptakkorde",
    hinweis: "Der Akkord, der nach Hause zieht. Vier Töne, drei Umkehrungen.",
    typen: ["dominant7"],
  },
  {
    id: "maj7-m7",
    stufe: 5,
    titel: "Maj7 & m7",
    hinweis: "Die weichen Vierklänge aus Pop und Jazz.",
    typen: ["maj7", "moll7"],
  },
  {
    id: "vermindert-uebermaessig",
    stufe: 6,
    titel: "Vermindert & übermäßig",
    hinweis: "Spannungsakkorde, die weiterwollen.",
    typen: ["vermindert", "vermindert7", "uebermaessig"],
    grundtoene: HAEUFIGE_GRUNDTOENE,
  },
  {
    id: "halbvermindert",
    stufe: 7,
    titel: "Halbvermindert",
    hinweis: "m7b5 — die zweite Stufe in Moll.",
    typen: ["halbvermindert"],
    grundtoene: HAEUFIGE_GRUNDTOENE,
  },
  {
    id: "optionstoene",
    stufe: 8,
    titel: "Optionstöne",
    hinweis: "Non-, Undezim- und Tredezimakkorde. Am besten auf beide Hände verteilt.",
    typen: ["neun", "moll9", "elf", "dreizehn"],
    grundtoene: [0, 5, 7, 2, 9],
  },
];

/** Alle Akkorde eines Pakets, in sinnvoller Reihenfolge. */
export function akkordeImPaket(paket: AkkordPaket): Akkord[] {
  if (paket.id === "dreiklaenge-erste") {
    return ERSTE.map(([grundton, typ]) =>
      baueAkkord(grundton, AKKORD_TYPEN[typ], paket.id),
    ).filter((a): a is Akkord => a !== null);
  }

  const grundtoene = paket.grundtoene ?? [0, 2, 4, 5, 7, 9, 11, 1, 3, 6, 8, 10];
  const ergebnis: Akkord[] = [];
  for (const typ of paket.typen) {
    for (const grundton of grundtoene) {
      const akkord = baueAkkord(grundton, AKKORD_TYPEN[typ], paket.id);
      if (akkord) ergebnis.push(akkord);
    }
  }
  return ergebnis;
}

export const AKKORD_PAKET_NACH_ID = new Map(AKKORD_PAKETE.map((p) => [p.id, p]));

/** Alle Akkorde der gewaehlten Pakete, ohne Doppelte. */
export function akkordeAusPaketen(paketIds: readonly string[]): Akkord[] {
  const gesehen = new Set<string>();
  const ergebnis: Akkord[] = [];
  for (const id of paketIds) {
    const paket = AKKORD_PAKET_NACH_ID.get(id);
    if (!paket) continue;
    for (const akkord of akkordeImPaket(paket)) {
      if (gesehen.has(akkord.id)) continue;
      gesehen.add(akkord.id);
      ergebnis.push(akkord);
    }
  }
  return ergebnis;
}

/** Nachschlagen eines Akkords ueber alle Pakete hinweg — fuer Akkordfolgen. */
const ALLE_AKKORDE = new Map<string, Akkord>();
for (const paket of AKKORD_PAKETE) {
  for (const akkord of akkordeImPaket(paket)) {
    if (!ALLE_AKKORDE.has(akkord.id)) ALLE_AKKORDE.set(akkord.id, akkord);
  }
}

export function akkordNachSymbol(symbol: string): Akkord | undefined {
  return ALLE_AKKORDE.get(symbol);
}

/**
 * Die tatsaechlich geuebten Akkorde: alles aus den gewaehlten Paketen, minus
 * das, was einzeln abgewaehlt wurde.
 *
 * Bleibt dabei nichts uebrig, gewinnen die Pakete — eine leere Uebung waere
 * kein hilfreiches Ergebnis einer Auswahl.
 */
export function gewaehlteAkkorde(
  paketIds: readonly string[],
  abgewaehlt: readonly string[],
): Akkord[] {
  const ausPaketen = akkordeAusPaketen(paketIds);
  const uebrig = ausPaketen.filter((a) => !abgewaehlt.includes(a.id));
  return uebrig.length > 0 ? uebrig : ausPaketen;
}
