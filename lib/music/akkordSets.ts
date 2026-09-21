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
    ["C", "F", "G", "C"],
    ["C", "Em", "F", "G"],
    ["C", "G", "F", "G"],
  ],
  G: [
    ["G", "D", "Em", "C"],
    ["G", "Em", "C", "D"],
    ["G", "C", "D", "G"],
    ["G", "D", "C", "D"],
  ],
  Am: [
    ["Am", "F", "C", "G"],
    ["Am", "Dm", "Em", "Am"],
    ["Am", "G", "F", "E"],
    ["Am", "Dm", "G", "C"],
  ],
  F: [
    ["F", "C", "Dm", "C"],
    ["F", "G", "Em", "Am"],
    ["F", "C", "G", "Am"],
    ["F", "Am", "Dm", "C"],
  ],
  Dm: [
    ["Dm", "G", "C", "Am"],
    ["Dm", "Em", "F", "G"],
    ["Dm", "G", "C", "C"],
  ],
  Em: [
    ["Em", "C", "G", "D"],
    ["Em", "Am", "B", "Em"],
    ["Em", "D", "C", "D"],
  ],
  D: [
    ["D", "A", "Bm", "G"],
    ["D", "G", "A", "D"],
    ["D", "Bm", "G", "A"],
  ],
  E: [
    ["E", "B", "C#m", "A"],
    ["E", "A", "B", "E"],
  ],
  A: [
    ["A", "E", "F#m", "D"],
    ["A", "D", "E", "A"],
  ],
};

const KADENZEN_ERWEITERT: Record<string, string[][]> = {
  C: [
    ["C", "G7", "Am", "F"],
    ["C", "Cadd9", "F", "G7"],
    ["C", "Gsus4", "G", "C"],
    ["C", "Am7", "Dm7", "G7"],
  ],
  G: [
    ["G", "D7", "Em", "C"],
    ["G", "Gsus4", "G", "D7"],
    ["G", "Em7", "Cadd9", "D"],
  ],
  G7: [
    ["C", "G7", "Am", "F"],
    ["Dm7", "G7", "C", "Am"],
    ["G7", "C", "F", "G7"],
    ["C", "Em7", "Am7", "G7"],
  ],
  Am: [
    ["Am", "Dm7", "E7", "Am"],
    ["Am", "F", "C", "E7"],
    ["Am7", "Dm7", "G7", "C"],
  ],
  E7: [
    ["Am", "Dm", "E7", "Am"],
    ["E7", "Am", "Dm", "E7"],
  ],
  D: [
    ["D", "Dsus4", "G", "A"],
    ["D", "A7", "G", "D"],
  ],
  Dsus4: [
    ["D", "Dsus4", "G", "A"],
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
    ["C7", "F7", "C7", "G7"],
    ["C7", "Am7", "Dm7", "G7"],
    ["F7", "C7", "G7", "C7"],
  ],
  Am7: [
    ["Am7", "Dm7", "G7", "Cmaj7"],
    ["Dm7", "G7", "Cmaj7", "Am7"],
    ["Am7", "D7", "Gmaj7", "Em7"],
  ],
};

/**
 * Automatische Auffüllung mit passenden harmonischen Akkorden (auf 4 Akkorde),
 * wenn der Nutzer auf "Mit passenden Akkorden auffüllen" klickt.
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
  if (optionen && optionen.length > 0) {
    const idx = Math.abs(variation) % optionen.length;
    return [...optionen[idx]];
  }

  try {
    const folge = stabileViererFolge(akkord);
    if (folge.length > 0) {
      return folge.map((a) => a.symbol);
    }
  } catch {
    // fallback
  }

  return [symbol];
}
