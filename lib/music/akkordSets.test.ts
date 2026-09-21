import { describe, expect, it } from "vitest";
import {
  KOMPLEXITAET_INFOS,
  baueAkkordEintrag,
  passendeViererFolgeFuer,
} from "./akkordSets";
import { nameMitOktave } from "./pitch";

describe("Akkord-Sets & Einträge", () => {
  it("baut Standard-Akkorde in Grundstellung", () => {
    const cDur = baueAkkordEintrag("C");
    expect(cDur).not.toBeNull();
    expect(cDur?.titel).toBe("C");
    expect(cDur?.umkehrung).toBe(0);
    expect(cDur?.lage.toene.map(nameMitOktave)).toEqual(["C4", "E4", "G4"]);

    const aMoll = baueAkkordEintrag("Am");
    expect(aMoll).not.toBeNull();
    expect(aMoll?.titel).toBe("Am");
    expect(aMoll?.lage.toene.map(nameMitOktave)).toEqual(["A3", "C4", "E4"]);
  });

  it("unterstützt Inversionen & Slash-Akkorde wie C/E", () => {
    const cSlashE = baueAkkordEintrag("C/E");
    expect(cSlashE).not.toBeNull();
    expect(cSlashE?.titel).toBe("C/E");
    expect(cSlashE?.umkehrung).toBe(1);
    // 1. Umkehrung von C hat E im Bass
    expect(cSlashE?.lage.toene[0].stufe).toBe("E");

    const cSlashG = baueAkkordEintrag("C/G");
    expect(cSlashG).not.toBeNull();
    expect(cSlashG?.titel).toBe("C/G");
    expect(cSlashG?.umkehrung).toBe(2);
    // 2. Umkehrung von C hat G im Bass
    expect(cSlashG?.lage.toene[0].stufe).toBe("G");
  });

  it("findet passende Viererfolgen ausgehend von einem Akkord", () => {
    const folgeC = passendeViererFolgeFuer("C", "dreiklaenge");
    expect(folgeC.length).toBe(4);
    expect(folgeC[0]).toBe("C");

    const folgeG7 = passendeViererFolgeFuer("G7", "erweitert");
    expect(folgeG7.length).toBe(4);
    expect(folgeG7.includes("G7")).toBe(true);
  });

  it("definiert die 3 Komplexitätsstufen vollständig", () => {
    expect(KOMPLEXITAET_INFOS.dreiklaenge.kurztitel).toBe("Dreiklänge");
    expect(KOMPLEXITAET_INFOS.erweitert.kurztitel).toBe("Erweiterte Griffe");
    expect(KOMPLEXITAET_INFOS.komplex.kurztitel).toBe("Komplexe Akkorde");
  });
});
