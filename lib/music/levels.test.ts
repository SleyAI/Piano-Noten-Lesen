import { describe, expect, it } from "vitest";
import { NOTEN_LEVELS, levelInfo, notenFuerLevel } from "./levels";

describe("Level-Definitionen", () => {
  it("enthält 5 Level eingeteilt in Kategorien A, B, C", () => {
    expect(NOTEN_LEVELS).toHaveLength(5);
    expect(NOTEN_LEVELS.map((l) => l.kategorie)).toEqual(["A", "B", "B", "C", "C"]);
  });

  it("Level 1 enthält nur Kern-Landmarks", () => {
    const noten = notenFuerLevel(1, "beide");
    const midis = noten.map((n) => n.note.midi);
    // C4 (60) in beiden Systemen, G4 (67), C5 (72), C3 (48), F3 (53)
    expect(midis).toContain(60);
    expect(midis).toContain(67);
    expect(midis).toContain(72);
    expect(midis).toContain(48);
    expect(midis).toContain(53);
    expect(noten.length).toBe(6);
  });

  it("Level 2 enthält Landmarks und direkte Nachbarn", () => {
    const noten = notenFuerLevel(2, "beide");
    expect(noten.length).toBeGreaterThan(notenFuerLevel(1, "beide").length);
    // Soll z. B. D4 (62) und F4 (65) enthalten
    const midis = noten.map((n) => n.note.midi);
    expect(midis).toContain(62);
    expect(midis).toContain(65);
  });

  it("Level 3 enthält die Stammtöne der 5 Linien", () => {
    const noten = notenFuerLevel(3, "beide");
    expect(noten.length).toBe(24);
    for (const n of noten) {
      expect(n.note.alteration).toBe(0);
    }
  });

  it("Level 4 enthält Stammtöne mit Hilfslinien", () => {
    const noten = notenFuerLevel(4, "beide");
    const midis = noten.map((n) => n.note.midi);
    // C6 (84) und C2 (36)
    expect(midis).toContain(84);
    expect(midis).toContain(36);
  });

  it("Level 5 enthält Vorzeichen (schwarze Tasten)", () => {
    const noten = notenFuerLevel(5, "beide");
    const vorzeichenNoten = noten.filter((n) => n.note.alteration !== 0);
    expect(vorzeichenNoten.length).toBeGreaterThan(0);
  });

  it("filtert sauber nach Schluessel", () => {
    const violin = notenFuerLevel(1, "violin");
    expect(violin.every((n) => n.schluessel === "violin")).toBe(true);

    const bass = notenFuerLevel(1, "bass");
    expect(bass.every((n) => n.schluessel === "bass")).toBe(true);
  });

  it("liefert Metadaten über levelInfo", () => {
    expect(levelInfo(1).id).toBe(1);
    expect(levelInfo(1).kategorie).toBe("A");
  });
});
