import { type Note, type Schluessel, type SchluesselWahl, n, vonMidi } from "./pitch";
import type { UebungsNote } from "./curriculum";

export type HauptKategorie = "A" | "B" | "C";
export type NotenLevelId = 1 | 2 | 3 | 4 | 5;

export interface NotenLevelMeta {
  id: NotenLevelId;
  kategorie: HauptKategorie;
  kategorieTitel: string;
  titel: string;
  kurzTitel: string;
  fokus: string;
  inhalt: string;
  didaktik: string;
}

export const NOTEN_LEVELS: NotenLevelMeta[] = [
  {
    id: 1,
    kategorie: "A",
    kategorieTitel: "A: Ankerpunkte",
    titel: "Level 1: Übe die ersten Ankerpunkte.",
    kurzTitel: "Level 1",
    fokus: "",
    inhalt: "Übe die ersten Ankerpunkte.",
    didaktik: "",
  },
  {
    id: 2,
    kategorie: "B",
    kategorieTitel: "B: Liniensystem",
    titel: "Level 2: Übe die Ankerpunkte und Töne, die direkt darüber oder darunter liegen.",
    kurzTitel: "Level 2",
    fokus: "",
    inhalt: "Übe die Ankerpunkte und Töne, die direkt darüber oder darunter liegen.",
    didaktik: "",
  },
  {
    id: 3,
    kategorie: "B",
    kategorieTitel: "B: Liniensystem",
    titel: "Level 3: Übe alle Stammtöne.",
    kurzTitel: "Level 3",
    fokus: "",
    inhalt: "Übe alle Stammtöne.",
    didaktik: "",
  },
  {
    id: 4,
    kategorie: "C",
    kategorieTitel: "C: Erweitert",
    titel: "Level 4: Übe die Töne auf 1 bis 3 Hilfslinien über/unter den Systemen.",
    kurzTitel: "Level 4",
    fokus: "",
    inhalt: "Übe die Töne auf 1 bis 3 Hilfslinien über/unter den Systemen.",
    didaktik: "",
  },
  {
    id: 5,
    kategorie: "C",
    kategorieTitel: "C: Erweitert",
    titel: "Level 5: Übe Kreuze, B-Vorzeichen und Auflösungszeichen.",
    kurzTitel: "Level 5",
    fokus: "",
    inhalt: "Übe Kreuze, B-Vorzeichen und Auflösungszeichen.",
    didaktik: "",
  },
];

const LEVEL_NOTEN: Record<NotenLevelId, Record<Schluessel, Note[]>> = {
  1: {
    violin: [n("C4"), n("G4"), n("C5")],
    bass: [n("C3"), n("F3"), n("C4")],
  },
  2: {
    violin: [
      n("H3"), n("C4"), n("D4"),
      n("F4"), n("G4"), n("A4"),
      n("H4"), n("C5"), n("D5"),
    ],
    bass: [
      n("H2"), n("C3"), n("D3"),
      n("E3"), n("F3"), n("G3"),
      n("H3"), n("C4"), n("D4"),
    ],
  },
  3: {
    violin: [
      n("C4"), n("D4"), n("E4"), n("F4"), n("G4"), n("A4"), n("H4"), n("C5"), n("D5"), n("E5"), n("F5"), n("G5"),
    ],
    bass: [
      n("F2"), n("G2"), n("A2"), n("H2"), n("C3"), n("D3"), n("E3"), n("F3"), n("G3"), n("A3"), n("H3"), n("C4"),
    ],
  },
  4: {
    violin: [
      n("C4"), n("D4"), n("E4"), n("F4"), n("G4"), n("A4"), n("H4"),
      n("C5"), n("D5"), n("E5"), n("F5"), n("G5"), n("A5"), n("H5"), n("C6"),
    ],
    bass: [
      n("C2"), n("D2"), n("E2"), n("F2"), n("G2"), n("A2"), n("H2"),
      n("C3"), n("D3"), n("E3"), n("F3"), n("G3"), n("A3"), n("H3"), n("C4"),
    ],
  },
  5: {
    violin: (() => {
      const res: Note[] = [];
      const von = n("C4").midi;
      const bis = n("C6").midi;
      for (let m = von; m <= bis; m++) {
        const k = vonMidi(m, "kreuz");
        if (k.alteration === 0) {
          res.push(k);
        } else {
          res.push(k, vonMidi(m, "b"));
        }
      }
      return res;
    })(),
    bass: (() => {
      const res: Note[] = [];
      const von = n("C2").midi;
      const bis = n("C4").midi;
      for (let m = von; m <= bis; m++) {
        const k = vonMidi(m, "kreuz");
        if (k.alteration === 0) {
          res.push(k);
        } else {
          res.push(k, vonMidi(m, "b"));
        }
      }
      return res;
    })(),
  },
};

export function notenFuerLevel(
  level: NotenLevelId,
  schluesselWahl: SchluesselWahl = "beide",
): UebungsNote[] {
  const meta = LEVEL_NOTEN[level] ?? LEVEL_NOTEN[1];
  const ergebnis: UebungsNote[] = [];

  const schluesselListe: Schluessel[] =
    schluesselWahl === "violin"
      ? ["violin"]
      : schluesselWahl === "bass"
        ? ["bass"]
        : ["violin", "bass"];

  for (const s of schluesselListe) {
    const noten = meta[s] ?? [];
    for (const note of noten) {
      ergebnis.push({ note, schluessel: s });
    }
  }

  return ergebnis;
}

export function levelInfo(level: NotenLevelId): NotenLevelMeta {
  return NOTEN_LEVELS.find((l) => l.id === level) ?? NOTEN_LEVELS[0];
}
