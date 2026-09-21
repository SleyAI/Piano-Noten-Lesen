import {
  type Akkord,
  type Lage,
  akkordNachSymbol,
  anzahlUmkehrungen,
  lage,
} from "./akkorde";
import { stabileViererFolge } from "./akkordfolgen";

export type AkkordKomplexitaet = "dreiklaenge" | "erweitert" | "komplex";
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
  erweitert: {
    titel: "Erweiterte Griffe",
    kurztitel: "Erweiterte Griffe",
    beschreibung: "Umkehrungen (Inversionen), Sus-Akkorde & 4-Klänge wie G7, Cadd9",
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
export function inversionenFuerAkkord(symbol: string): AkkordEintrag[] {
  const basis = symbol.split("/")[0];
  const akkord = akkordNachSymbol(basis);
  if (!akkord) return [];

  const anzahl = anzahlUmkehrungen(akkord);
  const eintraege: AkkordEintrag[] = [];

  for (let u = 0; u <= anzahl; u++) {
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

/**
 * Automatische Auffüllung mit passenden harmonischen Akkorden (auf 4 Akkorde),
 * wenn der Nutzer auf "Mit passenden Akkorden auffüllen" klickt.
 */
export function passendeViererFolgeFuer(
  symbol: string,
  komplexitaet: AkkordKomplexitaet,
): string[] {
  // Wenn es Standardakkorde sind, z. B. C, G, Am, F:
  const akkord = akkordNachSymbol(symbol.split("/")[0]);
  if (!akkord) return [symbol];

  // Spezialfälle für bekannte beliebte Kadenzen
  if (komplexitaet === "dreiklaenge") {
    if (akkord.symbol === "C") return ["C", "G", "Am", "F"];
    if (akkord.symbol === "G") return ["G", "D", "Em", "C"];
    if (akkord.symbol === "Am") return ["Am", "F", "C", "G"];
    if (akkord.symbol === "F") return ["F", "C", "Dm", "C"];
    if (akkord.symbol === "D") return ["D", "A", "Bm", "G"];
    if (akkord.symbol === "Em") return ["Em", "C", "G", "D"];
    if (akkord.symbol === "Dm") return ["Dm", "G", "C", "Am"];
  }

  if (komplexitaet === "erweitert") {
    if (akkord.symbol === "C") return ["C", "G7", "Am", "F"];
    if (akkord.symbol === "G7") return ["C", "G7", "Am", "F"];
    if (akkord.symbol === "Am") return ["Am", "Dm7", "E7", "Am"];
    if (akkord.symbol === "E7") return ["Am", "Dm", "E7", "Am"];
    if (akkord.symbol === "D" || akkord.symbol === "Dsus4") return ["D", "Dsus4", "G", "A"];
  }

  if (komplexitaet === "komplex") {
    if (akkord.symbol === "Cmaj7" || akkord.symbol === "Dm7") return ["Dm7", "G7", "Cmaj7", "Am7"];
    if (akkord.symbol === "Fmaj7" || akkord.symbol === "Gm7") return ["Gm7", "C7", "Fmaj7", "Dm7"];
    if (akkord.symbol === "C7") return ["C7", "F7", "C7", "G7"];
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
