/**
 * Akkordfolgen — harmonisch zusammenpassende Ketten zum Durchspielen.
 *
 * Die Folgen sind wie die Akkorde selbst gestuft: von der Vier-Akkord-Kadenz,
 * die halbe Pop-Musik traegt, bis zu Blues und Zwischendominanten.
 */

import {
  type Akkord,
  type AkkordTypId,
  akkordNachSymbol,
  akkordVon,
  grundtonIndex,
} from "./akkorde";
import { gemischt, gewichteteWahl } from "@/lib/practice/auswahl";

export interface Akkordfolge {
  id: string;
  stufe: number;
  titel: string;
  hinweis: string;
  /** Akkordsymbole in Spielreihenfolge. */
  symbole: string[];
}

export const AKKORDFOLGEN: Akkordfolge[] = [
  // Stufe 1 — die Vier-Akkord-Kadenzen
  {
    id: "I-V-vi-IV",
    stufe: 1,
    titel: "C – G – Am – F",
    hinweis: "Die Folge, auf die gefühlt jedes zweite Lied passt.",
    symbole: ["C", "G", "Am", "F"],
  },
  {
    id: "I-vi-IV-V",
    stufe: 1,
    titel: "C – Am – F – G",
    hinweis: "Der Klassiker der Fünfzigerjahre.",
    symbole: ["C", "Am", "F", "G"],
  },
  {
    id: "vi-IV-I-V",
    stufe: 1,
    titel: "Am – F – C – G",
    hinweis: "Dieselben vier Akkorde, aus Moll heraus gedacht.",
    symbole: ["Am", "F", "C", "G"],
  },
  {
    id: "I-IV-V-I",
    stufe: 1,
    titel: "C – F – G – C",
    hinweis: "Die schlichte Kadenz: hin und wieder zurück.",
    symbole: ["C", "F", "G", "C"],
  },
  {
    id: "G-D-Em-C",
    stufe: 1,
    titel: "G – D – Em – C",
    hinweis: "Dieselbe Bewegung, eine Tonart weiter.",
    symbole: ["G", "D", "Em", "C"],
  },

  // Stufe 2 — laengere Bögen
  {
    id: "kanon",
    stufe: 2,
    titel: "Kanon",
    hinweis: "Acht Akkorde, die sich sanft nach unten schrauben.",
    symbole: ["C", "G", "Am", "Em", "F", "C", "F", "G"],
  },
  {
    id: "moll-kadenz",
    stufe: 2,
    titel: "Am – Dm – E7 – Am",
    hinweis: "Mollkadenz mit Dur-Dominante — der Zug nach Hause.",
    symbole: ["Am", "Dm", "E7", "Am"],
  },

  // Stufe 3 — die Jazz-Kadenz in drei Tonarten
  {
    id: "ii-V-I-C",
    stufe: 3,
    titel: "Dm7 – G7 – Cmaj7",
    hinweis: "Die II–V–I-Verbindung in C.",
    symbole: ["Dm7", "G7", "Cmaj7"],
  },
  {
    id: "ii-V-I-F",
    stufe: 3,
    titel: "Gm7 – C7 – Fmaj7",
    hinweis: "Dieselbe Verbindung in F.",
    symbole: ["Gm7", "C7", "Fmaj7"],
  },
  {
    id: "ii-V-I-G",
    stufe: 3,
    titel: "Am7 – D7 – Gmaj7",
    hinweis: "Und in G. Wer sie in drei Tonarten kann, hört sie überall.",
    symbole: ["Am7", "D7", "Gmaj7"],
  },

  // Stufe 4 — Blues
  {
    id: "blues-kurz",
    stufe: 4,
    titel: "Blues in C",
    hinweis: "Das Zwölftaktschema, auf seine Akkordwechsel eingedampft.",
    symbole: ["C7", "F7", "C7", "G7", "F7", "C7"],
  },

  // Stufe 5 — Zwischendominanten
  {
    id: "zwischendominanten",
    stufe: 5,
    titel: "C – E7 – Am – A7 – Dm – G7 – C",
    hinweis: "Jeder Dur-Akkord kündigt den nächsten an.",
    symbole: ["C", "E7", "Am", "A7", "Dm", "G7", "C"],
  },
];

/** Die Akkorde einer Folge. Unbekannte Symbole fallen auf. */
export function akkordeDerFolge(folge: Akkordfolge): Akkord[] {
  return folge.symbole.map((symbol) => {
    const akkord = akkordNachSymbol(symbol);
    if (!akkord) throw new Error(`Unbekannter Akkord in ${folge.id}: ${symbol}`);
    return akkord;
  });
}

/** Welche verschiedenen Akkorde braucht diese Folge? */
export function benoetigteAkkorde(folge: Akkordfolge): string[] {
  return [...new Set(folge.symbole)];
}

/**
 * Ist die Folge mit der aktuellen Akkordauswahl spielbar?
 *
 * Erst wenn alle beteiligten Akkorde gewaehlt sind, wird sie angeboten —
 * sonst stolpert man mitten in der Folge ueber etwas Ungeuebtes.
 */
export function folgeSpielbar(folge: Akkordfolge, verfuegbar: ReadonlySet<string>): boolean {
  return benoetigteAkkorde(folge).every((symbol) => verfuegbar.has(symbol));
}

/** Was fehlt noch, damit die Folge freigeschaltet ist? */
export function fehlendeAkkorde(
  folge: Akkordfolge,
  verfuegbar: ReadonlySet<string>,
): string[] {
  return benoetigteAkkorde(folge).filter((symbol) => !verfuegbar.has(symbol));
}

// --- Passende Akkorde selbst finden -----------------------------------------

/**
 * Die sechs gebraeuchlichen Stufen einer Durtonart: I, ii, iii, IV, V, vi.
 *
 * Die siebte Stufe bleibt weg — sie ist vermindert, klingt allein unfertig und
 * gehoert nicht in eine Folge, die man einfach durchspielen koennen soll.
 */
const STUFEN: Array<{ halbton: number; typ: AkkordTypId }> = [
  { halbton: 0, typ: "dur" },
  { halbton: 2, typ: "moll" },
  { halbton: 4, typ: "moll" },
  { halbton: 5, typ: "dur" },
  { halbton: 7, typ: "dur" },
  { halbton: 9, typ: "moll" },
];

/** Akkordtypen, die typischerweise auf der fuenften Stufe stehen. */
const ALS_DOMINANTE = new Set(["dominant7", "neun", "elf", "dreizehn"]);
/** Akkordtypen, die als sechste Stufe ihrer Paralleltonart gelesen werden. */
const ALS_MOLL = new Set(["moll", "moll7", "moll9", "halbvermindert"]);

/**
 * In welcher Durtonart ist dieser Akkord zu Hause, und auf welcher Stufe?
 *
 * Ein Durakkord wird als Grundstufe gelesen, ein Mollakkord als sechste Stufe
 * seiner Paralleltonart — a-Moll fuehrt also nach C-Dur —, und ein
 * Septakkord als Dominante: G7 gehoert nach C, nicht nach G. Das sind die
 * Lesarten, aus denen die vertrauten Folgen entstehen.
 */
function tonartVon(akkord: Akkord): { grundton: number; stufe: number } {
  const wurzel = grundtonIndex(akkord);
  if (ALS_DOMINANTE.has(akkord.typ.id)) {
    return { grundton: (wurzel + 5) % 12, stufe: 4 };
  }
  if (ALS_MOLL.has(akkord.typ.id)) {
    return { grundton: (wurzel + 3) % 12, stufe: 5 };
  }
  return { grundton: wurzel, stufe: 0 };
}

/** Die Akkorde einer Stufe in dieser Tonart. */
function akkordDerStufe(grundton: number, stufe: number): Akkord | undefined {
  const eintrag = STUFEN[stufe];
  return eintrag && akkordVon(grundton + eintrag.halbton, eintrag.typ);
}

/**
 * Welche Akkorde passen zu diesem hier?
 *
 * Die uebrigen Stufen seiner Tonart — die Akkorde also, mit denen er in
 * praktisch jedem Lied zusammensteht. Der Akkord selbst steht vorne.
 */
export function passendeAkkorde(akkord: Akkord): Akkord[] {
  const { grundton } = tonartVon(akkord);
  const ergebnis: Akkord[] = [akkord];

  for (let stufe = 0; stufe < STUFEN.length; stufe += 1) {
    const kandidat = akkordDerStufe(grundton, stufe);
    if (kandidat && !ergebnis.some((a) => a.id === kandidat.id)) ergebnis.push(kandidat);
  }

  return ergebnis;
}

/** Wie viele Akkorde eine selbst gebaute Folge hat. */
const FOLGEN_LAENGE = 4;

/**
 * Bewaehrte Stufenfolgen, aus denen sich eine Kette bauen laesst.
 * Die Zahlen sind Stufen der Durtonart, also Indizes in STUFEN.
 */
const VORLAGEN: number[][] = [
  [0, 4, 5, 3], // I – V – vi – IV
  [0, 5, 3, 4], // I – vi – IV – V
  [5, 3, 0, 4], // vi – IV – I – V
  [0, 3, 4, 0], // I – IV – V – I
  [0, 5, 1, 4], // I – vi – ii – V
  [5, 1, 4, 0], // vi – ii – V – I
  [0, 4, 3, 0], // I – V – IV – I
];

/**
 * Baut eine Folge um einen einzelnen Akkord herum.
 *
 * Genommen wird eine Vorlage, in der seine Stufe vorkommt, und so gedreht,
 * dass er am Anfang steht — man faengt mit dem Akkord an, den man ueben
 * wollte, und bekommt die passenden Nachbarn dazu.
 */
export function folgeUm(akkord: Akkord, erlaubt?: ReadonlySet<string>): Akkord[] {
  const { grundton, stufe } = tonartVon(akkord);
  const passt = (a: Akkord) => !erlaubt || erlaubt.has(a.id);

  // Vorlagen, in denen die Stufe des Akkords vorkommt — die erste, deren
  // Akkorde alle zur Verfuegung stehen, gewinnt.
  for (const vorlage of gemischt(VORLAGEN.filter((v) => v.includes(stufe)))) {
    const start = vorlage.indexOf(stufe);
    const gedreht = [...vorlage.slice(start), ...vorlage.slice(0, start)];
    const kette = gedreht.map((s) => akkordDerStufe(grundton, s));
    if (kette.length >= 3 && kette.every((a) => a !== undefined && passt(a))) {
      // Der gewaehlte Akkord bleibt vorn, auch wenn seine Schreibweise abweicht.
      return [akkord, ...(kette as Akkord[]).slice(1)];
    }
  }

  // Keine Vorlage geht ganz auf: dann eben die Nachbarn, die es gibt.
  const nachbarn = passendeAkkorde(akkord).filter((a) => a.id !== akkord.id && passt(a));
  return [akkord, ...gemischt(nachbarn).slice(0, FOLGEN_LAENGE - 1)];
}

/**
 * Baut eine Folge aus frei gewaehlten Akkorden.
 *
 * Ohne Tonart-Wissen bleibt nur eines uebrig, das trotzdem hilft: jeder
 * gewaehlte Akkord soll drankommen, und keiner zweimal hintereinander. Wer
 * eine wirklich harmonische Kette moechte, waehlt einen Akkord und laesst sich
 * die Nachbarn dazu geben.
 */
export function wuerfleFolge(
  vorrat: readonly Akkord[],
  laenge = FOLGEN_LAENGE,
): Akkord[] {
  if (vorrat.length === 0) return [];
  if (vorrat.length === 1) return [vorrat[0]];

  const kette = gemischt(vorrat).slice(0, laenge);
  while (kette.length < laenge) {
    const vorherige = kette[kette.length - 1];
    const naechster = gewichteteWahl(
      vorrat,
      () => 1,
      (a) => a.id === vorherige.id,
    );
    if (!naechster) break;
    kette.push(naechster);
  }

  return kette;
}
