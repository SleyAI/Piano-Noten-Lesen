import {
  type Akkord,
  type Lage,
  akkordNachSymbol,
  anzahlUmkehrungen,
  lage,
} from "./akkorde";
import { stabileViererFolge } from "./akkordfolgen";

export type AkkordKomplexitaet = "dreiklaenge" | "inversionen" | "erweitert" | "komplex";
export type AkkordSpielart = "griff" | "arpeggio";

export interface AkkordEintrag {
  id: string;
  titel: string;
  akkord: Akkord;
  umkehrung: number;
  lage: Lage;
}

export const KOMPLEXITAET_INFOS: Record<
  AkkordKomplexitaet,
  {
    titel: string;
    kurztitel: string;
    beschreibung: string;
    einzelAkkorde: string[];
  }
> = {
  dreiklaenge: {
    titel: "Dreiklänge / Grundakkorde",
    kurztitel: "Dreiklänge",
    beschreibung: "Einfache Dur- & Moll-Akkorde in Grundstellung",
    einzelAkkorde: ["C", "D", "E", "F", "G", "A", "Dm", "Em", "Am"],
  },
  inversionen: {
    titel: "Umkehrungen (Inversionen)",
    kurztitel: "Umkehrungen",
    beschreibung: "Grundstellung, 1. und 2. Umkehrung eines Akkords",
    einzelAkkorde: ["C", "D", "E", "F", "G", "A", "Dm", "Em", "Am", "G7"],
  },
  erweitert: {
    titel: "Erweiterte Griffe",
    kurztitel: "Erweiterte Griffe",
    beschreibung: "4-Klänge wie G7, Cadd9 & Sus-Akkorde",
    einzelAkkorde: [
      "C",
      "G7",
      "D7",
      "A7",
      "E7",
      "Am7",
      "Dm7",
      "Em7",
      "Cadd9",
      "Gsus4",
      "Dsus4",
    ],
  },
  komplex: {
    titel: "Komplexe Akkorde",
    kurztitel: "Komplexe Akkorde",
    beschreibung: "Septakkorde, Optionstöne, Alterationen (z. B. Cmaj7, Dm7, F/G)",
    einzelAkkorde: [
      "Cmaj7",
      "Fmaj7",
      "Gmaj7",
      "Dm7",
      "Gm7",
      "Am7",
      "C7",
      "F7",
      "G7",
      "Ddim",
      "Am7b5",
    ],
  },
};

/**
 * Erzeugt alle Umkehrungen eines Akkords:
 * z. B. für C:
 * - Grundstellung (C-E-G)
 * - 1. Umkehrung (E-G-C)
 * - 2. Umkehrung (G-C-E)
 */
export function inversionenFuerAkkord(
  symbol: string,
  erlaubteUmkehrungen?: readonly number[],
): AkkordEintrag[] {
  const basis = symbol.split("/")[0];
  const akkord = akkordNachSymbol(basis);
  if (!akkord) return [];

  const anzahl = anzahlUmkehrungen(akkord);
  const eintraege: AkkordEintrag[] = [];

  for (let u = 0; u <= anzahl; u++) {
    if (erlaubteUmkehrungen && !erlaubteUmkehrungen.includes(u)) continue;
    const l = lage(akkord, u);
    const titel =
      u === 0
        ? `${akkord.symbol} (Grundstellung)`
        : `${akkord.symbol} (${u}. Umkehrung)`;

    eintraege.push({
      id: `${akkord.id}-umk-${u}`,
      titel,
      akkord,
      umkehrung: u,
      lage: l,
    });
  }

  return eintraege;
}

/**
 * Erzeugt einen typisierten AkkordEintrag für die Flashcards und Übungen.
 * Unterstützt auch Slash-Akkorde wie C/E (1. Umkehrung) oder C/G (2. Umkehrung).
 */
export function baueAkkordEintrag(symbol: string): AkkordEintrag | null {
  if (symbol.includes("/")) {
    const [basis, bass] = symbol.split("/");
    const akkord = akkordNachSymbol(basis);
    if (!akkord) return null;

    let umkehrung = 1;
    if (bass === "G" && basis === "C") umkehrung = 2;
    else if (bass === "E" && basis === "C") umkehrung = 1;
    else if (bass === "A" && basis === "F") umkehrung = 1;
    else if (bass === "C" && basis === "F") umkehrung = 2;
    else if (bass === "H" && basis === "G") umkehrung = 1;
    else if (bass === "D" && basis === "G") umkehrung = 2;

    const l = lage(akkord, umkehrung);
    return {
      id: `${symbol}`,
      titel: symbol,
      akkord,
      umkehrung,
      lage: l,
    };
  }

  const akkord = akkordNachSymbol(symbol);
  if (!akkord) return null;

  return {
    id: akkord.id,
    titel: akkord.symbol,
    akkord,
    umkehrung: 0,
    lage: lage(akkord, 0),
  };
}

const KADENZEN_DREIKLAENGE: Record<string, string[][]> = {
  C: [
    ["C", "G", "Am", "F"],
    ["C", "Am", "F", "G"],
    ["C", "Em", "F", "G"],
    ["C", "Dm", "G", "Am"],
    ["C", "F", "Dm", "G"],
  ],
  G: [
    ["G", "D", "Em", "C"],
    ["G", "Em", "C", "D"],
    ["G", "C", "Am", "D"],
    ["G", "Am", "C", "D"],
  ],
  Am: [
    ["Am", "F", "C", "G"],
    ["Am", "Dm", "G", "C"],
    ["Am", "G", "F", "Em"],
    ["Am", "C", "Dm", "Em"],
  ],
  F: [
    ["F", "G", "Em", "Am"],
    ["F", "C", "Dm", "Am"],
    ["F", "Dm", "C", "G"],
    ["F", "Am", "Dm", "C"],
  ],
  Dm: [
    ["Dm", "G", "C", "Am"],
    ["Dm", "Em", "F", "G"],
    ["Dm", "F", "C", "G"],
    ["Dm", "Am", "F", "C"],
  ],
  Em: [
    ["Em", "C", "G", "D"],
    ["Em", "Am", "D", "G"],
    ["Em", "D", "C", "Am"],
    ["Em", "G", "Am", "D"],
  ],
  D: [
    ["D", "A", "Em", "G"],
    ["D", "G", "Em", "A"],
    ["D", "A", "G", "Em"],
  ],
  E: [
    ["E", "Am", "F", "G"],
    ["E", "Am", "Dm", "G"],
    ["E", "A", "D", "G"],
  ],
  A: [
    ["A", "Dm", "G", "C"],
    ["A", "D", "Em", "G"],
    ["A", "Em", "D", "G"],
  ],
};

const KADENZEN_ERWEITERT: Record<string, string[][]> = {
  C: [
    ["C", "G7", "Am7", "F"],
    ["C", "Cadd9", "F", "G7"],
    ["C", "Am7", "Dm7", "G7"],
    ["C", "Gsus4", "Dm7", "G7"],
  ],
  G: [
    ["G", "D7", "Em7", "C"],
    ["G", "Gsus4", "C", "D7"],
    ["G", "Em7", "Cadd9", "D7"],
    ["G", "Am7", "D7", "C"],
  ],
  G7: [
    ["C", "G7", "Am7", "F"],
    ["Dm7", "G7", "C", "Am7"],
    ["G7", "C", "Em7", "Am7"],
    ["C", "Em7", "Am7", "G7"],
  ],
  Am: [
    ["Am", "Dm7", "E7", "C"],
    ["Am", "F", "C", "E7"],
    ["Am7", "Dm7", "G7", "C"],
  ],
  E7: [
    ["Am", "Dm7", "E7", "C"],
    ["E7", "Am", "Dm7", "G7"],
  ],
  D: [
    ["D", "Dsus4", "G", "A7"],
    ["D", "A7", "G", "Em7"],
  ],
  Dsus4: [
    ["D", "Dsus4", "G", "A7"],
    ["Dsus4", "D", "G", "A7"],
  ],
};

const KADENZEN_KOMPLEX: Record<string, string[][]> = {
  Cmaj7: [
    ["Dm7", "G7", "Cmaj7", "Am7"],
    ["Cmaj7", "Am7", "Dm7", "G7"],
    ["Cmaj7", "Fmaj7", "Dm7", "G7"],
    ["Cmaj7", "Em7", "Fmaj7", "G7"],
  ],
  Dm7: [
    ["Dm7", "G7", "Cmaj7", "Am7"],
    ["Dm7", "G7", "Em7", "A7"],
    ["Dm7", "Cmaj7", "Fmaj7", "G7"],
  ],
  Fmaj7: [
    ["Gm7", "C7", "Fmaj7", "Dm7"],
    ["Fmaj7", "Gm7", "Am7", "C7"],
    ["Fmaj7", "Dm7", "Gm7", "C7"],
  ],
  Gm7: [
    ["Gm7", "C7", "Fmaj7", "Dm7"],
    ["Gm7", "C7", "Am7", "D7"],
  ],
  C7: [
    ["C7", "F7", "Gm7", "G7"],
    ["C7", "Am7", "Dm7", "G7"],
    ["Gm7", "C7", "F7", "G7"],
  ],
  Am7: [
    ["Am7", "Dm7", "G7", "Cmaj7"],
    ["Dm7", "G7", "Cmaj7", "Am7"],
    ["Am7", "D7", "Gmaj7", "Em7"],
  ],
};

/**
 * Automatische Auffüllung mit passenden harmonischen Akkorden (auf 4 Akkorde),
 * wenn der Nutzer auf "Lass Otto passende Akkorde auswählen" klickt.
 * Es werden garantiert immer 4 unterschiedliche Akkorde ausgewählt.
 * Unterstützt einen Variations-Index, sodass jeder Klick eine neue Folge liefert.
 */
export function passendeViererFolgeFuer(
  symbol: string,
  komplexitaet: AkkordKomplexitaet,
  variation = 0,
): string[] {
  const basis = symbol.split("/")[0];
  const akkord = akkordNachSymbol(basis);
  if (!akkord) return [symbol];

  const tabelle =
    komplexitaet === "komplex"
      ? KADENZEN_KOMPLEX
      : komplexitaet === "erweitert"
        ? KADENZEN_ERWEITERT
        : KADENZEN_DREIKLAENGE;

  const optionen = tabelle[akkord.symbol] ?? tabelle[basis];
  let kandidat: string[] = [];

  if (optionen && optionen.length > 0) {
    const idx = Math.abs(variation) % optionen.length;
    kandidat = [...optionen[idx]];
  } else {
    try {
      const folge = stabileViererFolge(akkord);
      if (folge.length > 0) {
        kandidat = folge.map((a) => a.symbol);
      }
    } catch {
      // fallback
    }
  }

  if (kandidat.length === 0) {
    kandidat = [symbol];
  }

  // Streng garantieren: Es müssen immer 4 UNTERSCHIEDLICHE Akkorde sein!
  const einzigartig: string[] = [];
  for (const s of kandidat) {
    if (!einzigartig.includes(s)) {
      einzigartig.push(s);
    }
  }

  // Falls noch keine 4 unterschiedlichen vorhanden sind, aus dem jeweiligen Vorrat auffüllen:
  const pool = KOMPLEXITAET_INFOS[komplexitaet]?.einzelAkkorde ?? [];
  for (const s of pool) {
    if (einzigartig.length >= 4) break;
    if (!einzigartig.includes(s)) {
      einzigartig.push(s);
    }
  }

  return einzigartig.slice(0, 4);
}
