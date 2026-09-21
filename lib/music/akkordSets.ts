import {
  type Akkord,
  type Lage,
  akkordNachSymbol,
  anzahlUmkehrungen,
  lage,
} from "./akkorde";
import { note } from "./pitch";

export type AkkordKomplexitaet = "dreiklaenge" | "inversionen" | "erweitert" | "komplex";
export type AkkordSpielart = "griff" | "arpeggio";

export interface AkkordEintrag {
  id: string;
  titel: string;
  akkord: Akkord;
  umkehrung: number;
  lage: Lage;
}

export interface AkkordGruppe {
  titel: string;
  akkorde: string[];
}

export interface KomplexitaetInfo {
  titel: string;
  kurztitel: string;
  beschreibung: string;
  gruppen: AkkordGruppe[];
  einzelAkkorde: string[];
}

export const KOMPLEXITAET_INFOS: Record<AkkordKomplexitaet, KomplexitaetInfo> = {
  dreiklaenge: {
    titel: "Dreiklänge (Anfänger)",
    kurztitel: "Dreiklänge",
    beschreibung: "Einfache Dur- & Moll-Dreiklänge in Grundstellung",
    gruppen: [
      {
        titel: "Dur",
        akkorde: ["C", "D", "E", "F", "G", "A", "B (H)"],
      },
      {
        titel: "Moll",
        akkorde: ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"],
      },
    ],
    einzelAkkorde: [
      "C", "D", "E", "F", "G", "A", "B (H)",
      "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm",
    ],
  },
  inversionen: {
    titel: "Umkehrungen",
    kurztitel: "Umkehrungen",
    beschreibung: "Grundstellung, 1. (Sextakkord) & 2. Umkehrung (Quartsextakkord)",
    gruppen: [
      {
        titel: "Dur/Moll-Basis",
        akkorde: ["C", "G", "D", "A", "E", "F", "Am", "Em", "Dm"],
      },
      {
        titel: "Spezifische Inversions-Akkorde",
        akkorde: ["C/E", "C/G", "G/B", "G/D", "F/A", "F/C", "Am/C", "Am/E"],
      },
    ],
    einzelAkkorde: [
      "C", "G", "D", "A", "E", "F", "Am", "Em", "Dm",
      "C/E", "C/G", "G/B", "G/D", "F/A", "F/C", "Am/C", "Am/E",
    ],
  },
  erweitert: {
    titel: "Erweiterte Griffe (Vierklänge & Suspended)",
    kurztitel: "Erweiterte Griffe",
    beschreibung: "Vierklänge, Dominantseptakkorde, Sus- & Add-Akkorde",
    gruppen: [
      {
        titel: "Septakkorde",
        akkorde: ["C7", "G7", "D7", "A7", "E7", "F7"],
      },
      {
        titel: "Sus / Add / 6er",
        akkorde: ["Csus2", "Csus4", "Cadd9", "Gsus4", "C6", "Am6"],
      },
    ],
    einzelAkkorde: [
      "C7", "G7", "D7", "A7", "E7", "F7",
      "Csus2", "Csus4", "Cadd9", "Gsus4", "C6", "Am6",
    ],
  },
  komplex: {
    titel: "Komplexe Akkorde (Extended & Altered)",
    kurztitel: "Komplexe Akkorde",
    beschreibung: "Maj7-, m7-, Tensions (9/11/13), Alterationen & Slash-Chords",
    gruppen: [
      {
        titel: "Jazz-/Pop-Vierklänge",
        akkorde: ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"],
      },
      {
        titel: "Tensions",
        akkorde: ["Cmaj9", "Dm11", "G13"],
      },
      {
        titel: "Alteriert / Symmetrisch",
        akkorde: ["G7b9", "G7#9", "C°7"],
      },
      {
        titel: "Slash-Chords / Bass-Note-Varianten",
        akkorde: ["F/G", "Bb/C"],
      },
    ],
    einzelAkkorde: [
      "Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5",
      "Cmaj9", "Dm11", "G13",
      "G7b9", "G7#9", "C°7",
      "F/G", "Bb/C",
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
  const akkord = akkordNachSymbol(basis === "B (H)" ? "H" : basis);
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
 * Erzeugt einen typisierten AkkordEintrag für Flashcards und Übungen.
 * Unterstützt Slash-Akkorde, Inversionen sowie Aliase (z. B. B (H), Bm, C°7, Bm7b5).
 */
export function baueAkkordEintrag(symbol: string): AkkordEintrag | null {
  // 1. Spezifische Hybrid-Slash-Chords (Bassnote außerhalb des Dreiklangs)
  if (symbol === "F/G") {
    const basis = akkordNachSymbol("F");
    if (!basis) return null;
    const toene = [
      note("G", 0, 3),
      note("F", 0, 4),
      note("A", 0, 4),
      note("C", 0, 5),
    ];
    return {
      id: "F/G",
      titel: "F/G",
      akkord: { ...basis, id: "F/G", symbol: "F/G" },
      umkehrung: 0,
      lage: {
        akkord: { ...basis, id: "F/G", symbol: "F/G" },
        umkehrung: 0,
        toene,
      },
    };
  }

  if (symbol === "Bb/C") {
    const basis = akkordNachSymbol("Bb") ?? akkordNachSymbol("B");
    if (!basis) return null;
    const toene = [
      note("C", 0, 3),
      note("H", -1, 3),
      note("D", 0, 4),
      note("F", 0, 4),
    ];
    return {
      id: "Bb/C",
      titel: "Bb/C",
      akkord: { ...basis, id: "Bb/C", symbol: "Bb/C" },
      umkehrung: 0,
      lage: {
        akkord: { ...basis, id: "Bb/C", symbol: "Bb/C" },
        umkehrung: 0,
        toene,
      },
    };
  }

  // 2. Inversions-Slash-Chords (z. B. C/E, C/G, G/B, G/D, F/A, F/C, Am/C, Am/E)
  if (symbol.includes("/")) {
    const [basisSym, bass] = symbol.split("/");
    const basis = akkordNachSymbol(basisSym === "B (H)" ? "H" : basisSym);
    if (!basis) return null;

    let umkehrung = 1;
    if (bass === "G" && basisSym === "C") umkehrung = 2;
    else if (bass === "E" && basisSym === "C") umkehrung = 1;
    else if (bass === "A" && basisSym === "F") umkehrung = 1;
    else if (bass === "C" && basisSym === "F") umkehrung = 2;
    else if ((bass === "H" || bass === "B") && basisSym === "G") umkehrung = 1;
    else if (bass === "D" && basisSym === "G") umkehrung = 2;
    else if (bass === "C" && basisSym === "Am") umkehrung = 1;
    else if (bass === "E" && basisSym === "Am") umkehrung = 2;

    const l = lage(basis, umkehrung);
    return {
      id: symbol,
      titel: symbol,
      akkord: basis,
      umkehrung,
      lage: l,
    };
  }

  // 3. Spezifische Symbole mit Alias
  const aufloesung =
    symbol === "B (H)"
      ? "H"
      : symbol === "C°7"
        ? "Cdim7"
        : symbol === "Bm7b5"
          ? "Hm7b5"
          : symbol === "Bm"
            ? "Hm"
            : symbol;

  const akkord = akkordNachSymbol(aufloesung);
  if (!akkord) return null;

  return {
    id: symbol,
    titel: symbol,
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
  D: [
    ["D", "A", "Bm", "G"],
    ["D", "G", "Em", "A"],
    ["D", "A", "G", "Em"],
    ["D", "Bm", "G", "A"],
  ],
  A: [
    ["A", "E", "Fm", "D"],
    ["A", "D", "Bm", "E"],
    ["A", "E", "D", "Bm"],
  ],
  E: [
    ["E", "B (H)", "A", "Em"],
    ["E", "A", "B (H)", "Am"],
  ],
  F: [
    ["F", "G", "Em", "Am"],
    ["F", "C", "Dm", "Am"],
    ["F", "Dm", "C", "G"],
    ["F", "Am", "Dm", "C"],
  ],
  "B (H)": [
    ["B (H)", "E", "Em", "G"],
    ["B (H)", "Em", "C", "D"],
  ],
  H: [
    ["B (H)", "E", "Em", "G"],
    ["B (H)", "Em", "C", "D"],
  ],
  Am: [
    ["Am", "F", "C", "G"],
    ["Am", "Dm", "G", "C"],
    ["Am", "G", "F", "Em"],
    ["Am", "C", "Dm", "Em"],
  ],
  Em: [
    ["Em", "C", "G", "D"],
    ["Em", "Am", "D", "G"],
    ["Em", "D", "C", "Am"],
    ["Em", "G", "Am", "D"],
  ],
  Dm: [
    ["Dm", "G", "C", "Am"],
    ["Dm", "Em", "F", "G"],
    ["Dm", "F", "C", "G"],
    ["Dm", "Am", "F", "C"],
  ],
  Cm: [
    ["Cm", "Fm", "Gm", "Eb"],
    ["Cm", "Fm", "G", "Ab"],
  ],
  Fm: [
    ["Fm", "Cm", "C", "Ab"],
    ["Fm", "Bbm", "C", "Db"],
  ],
  Gm: [
    ["Gm", "Cm", "Dm", "F"],
    ["Gm", "Dm", "F", "C"],
  ],
  Bm: [
    ["Bm", "Em", "G", "D"],
    ["Bm", "G", "D", "A"],
    ["Bm", "Em", "A", "D"],
  ],
};

const KADENZEN_ERWEITERT: Record<string, string[][]> = {
  C7: [
    ["C7", "F7", "G7", "Csus4"],
    ["C7", "A7", "D7", "G7"],
    ["C7", "F7", "Csus2", "G7"],
  ],
  G7: [
    ["G7", "C7", "D7", "Gsus4"],
    ["G7", "E7", "A7", "D7"],
    ["G7", "Cadd9", "Am6", "D7"],
  ],
  D7: [
    ["D7", "G7", "A7", "E7"],
    ["D7", "Gsus4", "A7", "Cadd9"],
    ["D7", "E7", "A7", "G7"],
  ],
  A7: [
    ["A7", "D7", "E7", "Am6"],
    ["A7", "D7", "G7", "C7"],
    ["A7", "E7", "D7", "Gsus4"],
  ],
  E7: [
    ["E7", "A7", "D7", "G7"],
    ["E7", "Am6", "D7", "G7"],
    ["E7", "A7", "C6", "D7"],
  ],
  F7: [
    ["F7", "C7", "G7", "Csus4"],
    ["F7", "C7", "Csus2", "G7"],
  ],
  Csus2: [
    ["Csus2", "Gsus4", "Cadd9", "C6"],
    ["Csus2", "C6", "G7", "Cadd9"],
  ],
  Csus4: [
    ["Csus4", "C6", "Gsus4", "G7"],
    ["Csus4", "Cadd9", "Am6", "G7"],
  ],
  Cadd9: [
    ["Cadd9", "Am6", "D7", "G7"],
    ["Cadd9", "Csus4", "G7", "C6"],
    ["Cadd9", "Gsus4", "Am6", "D7"],
  ],
  Gsus4: [
    ["Gsus4", "G7", "Cadd9", "C6"],
    ["Gsus4", "Cadd9", "Am6", "D7"],
  ],
  C6: [
    ["C6", "Am6", "D7", "G7"],
    ["C6", "Cadd9", "Gsus4", "G7"],
  ],
  Am6: [
    ["Am6", "E7", "D7", "G7"],
    ["Am6", "D7", "G7", "C6"],
  ],
};

const KADENZEN_KOMPLEX: Record<string, string[][]> = {
  Cmaj7: [
    ["Dm11", "G13", "Cmaj7", "Am7"],
    ["Cmaj7", "F/G", "Em7", "Am7"],
    ["Dm7", "G7b9", "Cmaj7", "Am7"],
    ["Cmaj7", "C°7", "Dm7", "G7"],
    ["Cmaj7", "Fmaj7", "Bm7b5", "Em7"],
    ["Bb/C", "Fmaj7", "Dm7", "Cmaj7"],
  ],
  Dm7: [
    ["Dm7", "G7b9", "Cmaj7", "Am7"],
    ["Dm7", "G7#9", "Cmaj9", "Fmaj7"],
    ["Dm7", "F/G", "Cmaj7", "Am7"],
    ["Dm7", "G13", "Cmaj9", "Am7"],
    ["Dm7", "Bm7b5", "Em7", "A7"],
  ],
  Em7: [
    ["Em7", "Am7", "Dm11", "G13"],
    ["Fmaj7", "F/G", "Em7", "Am7"],
    ["Em7", "A7", "Dm7", "G7b9"],
  ],
  Fmaj7: [
    ["Fmaj7", "F/G", "Em7", "Am7"],
    ["Bb/C", "Fmaj7", "Dm7", "Cmaj7"],
    ["Fmaj7", "Bm7b5", "Em7", "Am7"],
    ["Dm7", "G7#9", "Cmaj7", "Fmaj7"],
  ],
  G7: [
    ["Dm7", "G7b9", "Cmaj7", "Am7"],
    ["Dm7", "G7#9", "Cmaj7", "Fmaj7"],
    ["C°7", "Dm7", "G7", "Cmaj7"],
    ["Dm11", "G13", "Cmaj9", "Am7"],
  ],
  Am7: [
    ["Dm11", "G13", "Cmaj9", "Am7"],
    ["Am7", "Bm7b5", "Em7", "Dm7"],
    ["Cmaj7", "F/G", "Em7", "Am7"],
  ],
  Bm7b5: [
    ["Cmaj7", "Fmaj7", "Bm7b5", "Em7"],
    ["Bm7b5", "Em7", "Am7", "Dm7"],
    ["Dm7", "Bm7b5", "Em7", "G7"],
  ],
  Cmaj9: [
    ["Dm11", "G13", "Cmaj9", "Am7"],
    ["Dm7", "G7b9", "Cmaj9", "Am7"],
    ["Dm7", "F/G", "Cmaj9", "Am7"],
  ],
  Dm11: [
    ["Dm11", "G13", "Cmaj9", "Am7"],
    ["Dm11", "G7b9", "Cmaj7", "Am7"],
    ["Em7", "Am7", "Dm11", "G13"],
  ],
  G13: [
    ["Dm11", "G13", "Cmaj9", "Am7"],
    ["Dm7", "G13", "Cmaj7", "Am7"],
  ],
  G7b9: [
    ["Dm7", "G7b9", "Cmaj7", "Am7"],
    ["Dm11", "G7b9", "Cmaj9", "Am7"],
    ["C°7", "Dm7", "G7b9", "Cmaj7"],
  ],
  "G7#9": [
    ["Dm7", "G7#9", "Cmaj7", "Fmaj7"],
    ["Dm7", "G7#9", "Cmaj9", "Am7"],
  ],
  "C°7": [
    ["Cmaj7", "C°7", "Dm7", "G7"],
    ["C°7", "Dm7", "G7b9", "Cmaj7"],
    ["C°7", "Fmaj7", "Dm7", "G7"],
  ],
  "F/G": [
    ["Fmaj7", "F/G", "Em7", "Am7"],
    ["Cmaj7", "F/G", "Em7", "Am7"],
    ["Dm7", "F/G", "Cmaj9", "Am7"],
  ],
  "Bb/C": [
    ["Bb/C", "Fmaj7", "Dm7", "Cmaj7"],
    ["Bb/C", "Fmaj7", "Dm7", "G7"],
    ["Dm7", "G7b9", "Cmaj7", "Bb/C"],
  ],
};

export const STANDARD_FOLGEN: Record<AkkordKomplexitaet, string[][]> = {
  dreiklaenge: [
    ["C", "G", "Am", "F"],
    ["G", "D", "Em", "C"],
    ["Am", "F", "C", "G"],
    ["D", "A", "Bm", "G"],
    ["F", "C", "Dm", "B (H)"],
    ["Em", "C", "G", "D"],
  ],
  inversionen: [
    ["C/E", "G/B", "Am/C", "F/A"],
    ["C/G", "F/C", "G/D", "Am/E"],
  ],
  erweitert: [
    ["Cadd9", "Am6", "D7", "G7"],
    ["Csus4", "C6", "Gsus4", "G7"],
    ["C7", "F7", "Csus2", "G7"],
    ["D7", "Gsus4", "A7", "Cadd9"],
    ["Am6", "E7", "D7", "G7"],
  ],
  komplex: [
    ["Dm11", "G13", "Cmaj9", "Am7"],
    ["Fmaj7", "F/G", "Em7", "Am7"],
    ["Dm7", "G7b9", "Cmaj7", "Am7"],
    ["Cmaj7", "C°7", "Dm7", "G7"],
    ["Bb/C", "Fmaj7", "Dm7", "Cmaj7"],
    ["Cmaj7", "Fmaj7", "Bm7b5", "Em7"],
    ["Dm7", "G7#9", "Cmaj9", "Fmaj7"],
  ],
};

export const GEMISCHTE_FOLGEN: Record<"erweitert" | "komplex", string[][]> = {
  erweitert: [
    ["C", "G7", "Am", "F7"],
    ["C", "Cadd9", "F", "G7"],
    ["Dm", "G7", "C", "Cadd9"],
    ["C", "Gsus4", "F", "G7"],
    ["C", "Am6", "F", "G7"],
    ["G", "D7", "Em", "Cadd9"],
    ["Dm", "G7", "C", "C6"],
    ["A", "E7", "D", "A7"],
    ["F", "C7", "Dm", "Csus4"],
    ["Am", "E7", "C", "D7"],
    ["C", "Csus2", "G", "G7"],
    ["Am", "C6", "Dm", "E7"],
  ],
  komplex: [
    ["C", "F/G", "Em7", "Am"],
    ["C", "Am7", "Dm7", "G7"],
    ["Bb/C", "F", "Dm7", "C"],
    ["Dm7", "G7b9", "C", "Am"],
    ["C", "C°7", "Dm7", "G"],
    ["Am", "Dm11", "G13", "C"],
    ["F", "F/G", "Cmaj7", "Am"],
    ["C", "Cmaj9", "Fmaj7", "G"],
    ["Am", "Bm7b5", "E7", "C"],
    ["Dm7", "G7#9", "C", "Am"],
  ],
};

/**
 * Automatische Auffüllung mit passenden harmonischen Akkorden (auf 4 Akkorde),
 * wenn der Nutzer auf "Lass Otto passende Akkorde auswählen" klickt.
 * Es werden garantiert immer 4 unterschiedliche Akkorde ausgewählt,
 * streng aus dem Vorrat des jeweiligen Akkord-Typs oder bei mitVorherigen gemischt.
 */
export function passendeViererFolgeFuer(
  symbol: string,
  komplexitaet: AkkordKomplexitaet,
  variation = 0,
  mitVorherigen = false,
): string[] {
  // Wenn vorherige Typen einbezogen werden sollen (z. B. 2 Dreiklänge + 2 erweiterte Griffe):
  if (mitVorherigen && (komplexitaet === "erweitert" || komplexitaet === "komplex")) {
    const gemischte = GEMISCHTE_FOLGEN[komplexitaet];
    if (symbol) {
      const treffer = gemischte.filter((folge) => folge.includes(symbol));
      if (treffer.length > 0) {
        const idx = Math.abs(variation) % treffer.length;
        return [...treffer[idx]];
      }
      // Falls der Akkord nicht direkt vorkommt, basierend auf dem Typ einsetzen:
      const idx = Math.abs(variation) % gemischte.length;
      const basisFolge = [...gemischte[idx]];
      const dreiklaengePool = KOMPLEXITAET_INFOS.dreiklaenge.einzelAkkorde;
      const isDreiklang = dreiklaengePool.includes(symbol);
      const replIdx = basisFolge.findIndex((s) =>
        isDreiklang ? dreiklaengePool.includes(s) : !dreiklaengePool.includes(s)
      );
      if (replIdx !== -1) {
        basisFolge[replIdx] = symbol;
      } else {
        basisFolge[0] = symbol;
      }
      return basisFolge;
    }
    const idx = Math.abs(variation) % gemischte.length;
    return [...gemischte[idx]];
  }

  const basis = symbol ? symbol.split("/")[0] : "";

  const tabelle =
    komplexitaet === "komplex"
      ? KADENZEN_KOMPLEX
      : komplexitaet === "erweitert"
        ? KADENZEN_ERWEITERT
        : KADENZEN_DREIKLAENGE;

  const optionen = (symbol && tabelle[symbol]) || (basis && tabelle[basis]);
  let kandidat: string[] = [];

  if (optionen && optionen.length > 0) {
    const idx = Math.abs(variation) % optionen.length;
    kandidat = [...optionen[idx]];
  } else {
    // Wenn kein passender Eintrag vorhanden ist oder kein Akkord gewählt wurde:
    const standards = STANDARD_FOLGEN[komplexitaet];
    if (standards && standards.length > 0) {
      const idx = Math.abs(variation) % standards.length;
      kandidat = [...standards[idx]];
    } else {
      kandidat = symbol ? [symbol] : [];
    }
  }

  // Streng garantieren: Es müssen immer 4 UNTERSCHIEDLICHE Akkorde sein!
  const pool = KOMPLEXITAET_INFOS[komplexitaet]?.einzelAkkorde ?? [];
  const einzigartig: string[] = [];

  // Nur Akkorde aufnehmen, die auch wirklich zum Vorrat dieser Komplexitätsstufe gehören!
  for (const s of kandidat) {
    if (pool.includes(s) && !einzigartig.includes(s)) {
      einzigartig.push(s);
    }
  }

  // Falls noch keine 4 unterschiedlichen vorhanden sind, STRENG aus dem jeweiligen Vorrat auffüllen:
  for (const s of pool) {
    if (einzigartig.length >= 4) break;
    if (!einzigartig.includes(s)) {
      einzigartig.push(s);
    }
  }

  return einzigartig.slice(0, 4);
}
