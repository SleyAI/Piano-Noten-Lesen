import { type Akkord, type Lage, akkordNachSymbol, lage } from "./akkorde";
import { stabileViererFolge } from "./akkordfolgen";

export type AkkordKomplexitaet = "dreiklaenge" | "erweitert" | "komplex";

export interface AkkordEintrag {
  id: string;
  titel: string;
  akkord: Akkord;
  umkehrung: number;
  lage: Lage;
}

export interface AkkordVorlage {
  id: string;
  titel: string;
  beschreibung?: string;
  symbole: string[];
}

export const KOMPLEXITAET_INFOS: Record<
  AkkordKomplexitaet,
  {
    titel: string;
    kurztitel: string;
    beschreibung: string;
    vorlagen: AkkordVorlage[];
    einzelAkkorde: string[];
  }
> = {
  dreiklaenge: {
    titel: "Dreiklänge / Grundakkorde",
    kurztitel: "Dreiklänge",
    beschreibung: "Einfache Dur- & Moll-Akkorde in Grundstellung",
    vorlagen: [
      {
        id: "pop-standard",
        titel: "Pop-Standard",
        beschreibung: "Die berühmte Vier-Akkord-Folge",
        symbole: ["C", "G", "Am", "F"],
      },
      {
        id: "klassiker-50s",
        titel: "Klassiker 50er",
        beschreibung: "Doo-Wop & Fünfzigerjahre",
        symbole: ["C", "Am", "F", "G"],
      },
      {
        id: "moll-pop",
        titel: "Moll-Pop",
        beschreibung: "Melancholischer Einstieg",
        symbole: ["Am", "F", "C", "G"],
      },
      {
        id: "schlichte-kadenz",
        titel: "Schlichte Kadenz",
        beschreibung: "Klassische I-IV-V Kadenz",
        symbole: ["C", "F", "G", "C"],
      },
      {
        id: "g-dur-pop",
        titel: "G-Dur Pop",
        beschreibung: "Dieselbe Bewegung in G-Dur",
        symbole: ["G", "D", "Em", "C"],
      },
    ],
    einzelAkkorde: ["C", "D", "E", "F", "G", "A", "Dm", "Em", "Am"],
  },
  erweitert: {
    titel: "Erweiterte Griffe",
    kurztitel: "Erweiterte Griffe",
    beschreibung: "Umkehrungen (Inversionen), Sus-Akkorde & 4-Klänge wie G7, Cadd9",
    vorlagen: [
      {
        id: "pop-7er",
        titel: "Pop mit 7ern",
        beschreibung: "Dominantseptakkord eingebunden",
        symbole: ["C", "G7", "Am", "F"],
      },
      {
        id: "moll-dominant",
        titel: "Moll-Kadenz",
        beschreibung: "Moll mit Dur-Dominante E7",
        symbole: ["Am", "Dm", "E7", "Am"],
      },
      {
        id: "inversionen",
        titel: "Inversionen",
        beschreibung: "Fließender Basslauf mit C/E",
        symbole: ["C", "C/E", "F", "G"],
      },
      {
        id: "sus-aufloesung",
        titel: "Sus-Auflösung",
        beschreibung: "Sus4-Spannung & Auflösung",
        symbole: ["D", "Dsus4", "G", "A"],
      },
    ],
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
      "C/E",
    ],
  },
  komplex: {
    titel: "Komplexe Akkorde",
    kurztitel: "Komplexe Akkorde",
    beschreibung: "Septakkorde, Optionstöne, Alterationen (z. B. Cmaj7, Dm7, F/G)",
    vorlagen: [
      {
        id: "jazz-c",
        titel: "Jazz-Kadenz (in C)",
        beschreibung: "Die klassische II-V-I Verbindung",
        symbole: ["Dm7", "G7", "Cmaj7", "Am7"],
      },
      {
        id: "jazz-f",
        titel: "Jazz-Kadenz (in F)",
        beschreibung: "II-V-I Verbindung in F",
        symbole: ["Gm7", "C7", "Fmaj7", "Dm7"],
      },
      {
        id: "jazz-g",
        titel: "Jazz-Kadenz (in G)",
        beschreibung: "II-V-I Verbindung in G",
        symbole: ["Am7", "D7", "Gmaj7", "Em7"],
      },
      {
        id: "blues-kurz",
        titel: "Blues-Schema",
        beschreibung: "Dominantseptakkorde im Wechsel",
        symbole: ["C7", "F7", "C7", "G7"],
      },
    ],
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
 * Erzeugt einen typisierten AkkordEintrag für die Flashcards und Übungen.
 * Unterstützt auch Slash-Akkorde wie C/E (1. Umkehrung) oder C/G (2. Umkehrung).
 */
export function baueAkkordEintrag(symbol: string): AkkordEintrag | null {
  if (symbol.includes("/")) {
    const [basis, bass] = symbol.split("/");
    const akkord = akkordNachSymbol(basis);
    if (!akkord) return null;

    // Finde passende Umkehrung, deren tiefster Ton dem Bass entspricht
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
 * Automatische Generierung passender Akkorde (Standard 4), wenn der Nutzer
 * einen Akkord anklickt.
 */
export function passendeViererFolgeFuer(
  symbol: string,
  komplexitaet: AkkordKomplexitaet,
): string[] {
  // Wenn der Akkord Teil einer bekannten Vorlage ist, nimm diese Vorlage
  const vorlagen = KOMPLEXITAET_INFOS[komplexitaet].vorlagen;
  for (const v of vorlagen) {
    if (v.symbole.includes(symbol)) {
      // Beginne mit dem gewählten Symbol
      const idx = v.symbole.indexOf(symbol);
      return [...v.symbole.slice(idx), ...v.symbole.slice(0, idx)];
    }
  }

  // Ansonsten über stabileViererFolge
  const akkord = akkordNachSymbol(symbol.split("/")[0]);
  if (!akkord) return [symbol];

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
