/**
 * Akkordfolgen — harmonisch zusammenpassende Ketten zum Durchspielen.
 *
 * Die Folgen sind wie die Akkorde selbst gestuft: von der Vier-Akkord-Kadenz,
 * die halbe Pop-Musik traegt, bis zu Blues und Zwischendominanten.
 */

import { type Akkord, akkordNachSymbol } from "./akkorde";

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
