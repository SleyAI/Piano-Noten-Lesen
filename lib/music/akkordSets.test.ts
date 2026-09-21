import { describe, expect, it } from "vitest";
import {
  KOMPLEXITAET_INFOS,
  baueAkkordEintrag,
  inversionenFuerAkkord,
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

  it("baut alle spezifizierten Akkorde fehlerfrei auf", () => {
    const alleStufen = ["dreiklaenge", "inversionen", "erweitert", "komplex"] as const;
    for (const stufe of alleStufen) {
      for (const sym of KOMPLEXITAET_INFOS[stufe].einzelAkkorde) {
        const eintrag = baueAkkordEintrag(sym);
        expect(eintrag, `Akkord ${sym} in Stufe ${stufe} konnte nicht gebaut werden`).not.toBeNull();
        expect(eintrag?.lage.toene.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("unterstützt B (H), Bm, C6, Am6, Tensions, Alterationen und Slash-Chords", () => {
    const bH = baueAkkordEintrag("B (H)");
    expect(bH).not.toBeNull();
    expect(bH?.lage.toene.map(nameMitOktave)).toEqual(["H3", "Dis4", "Fis4"]);

    const bm = baueAkkordEintrag("Bm");
    expect(bm).not.toBeNull();
    expect(bm?.lage.toene.map(nameMitOktave)).toEqual(["H3", "D4", "Fis4"]);

    const c6 = baueAkkordEintrag("C6");
    expect(c6).not.toBeNull();
    expect(c6?.lage.toene.map(nameMitOktave)).toEqual(["C4", "E4", "G4", "A4"]);

    const am6 = baueAkkordEintrag("Am6");
    expect(am6).not.toBeNull();
    expect(am6?.lage.toene.map(nameMitOktave)).toEqual(["A3", "C4", "E4", "Fis4"]);

    const fg = baueAkkordEintrag("F/G");
    expect(fg).not.toBeNull();
    expect(fg?.lage.toene.map(nameMitOktave)).toEqual(["G3", "F4", "A4", "C5"]);

    const bbc = baueAkkordEintrag("Bb/C");
    expect(bbc).not.toBeNull();
    expect(bbc?.lage.toene.map(nameMitOktave)).toEqual(["C3", "B3", "D4", "F4"]);
  });

  it("enthält in erweiterten und komplexen Griffen keine reinen Dreiklänge", () => {
    const dreiklaengePool = new Set(["C", "D", "E", "F", "G", "A", "H", "B"]);
    for (const sym of KOMPLEXITAET_INFOS.erweitert.einzelAkkorde) {
      expect(dreiklaengePool.has(sym), `${sym} darf nicht in erweitert sein`).toBe(false);
    }
    for (const sym of KOMPLEXITAET_INFOS.komplex.einzelAkkorde) {
      expect(dreiklaengePool.has(sym), `${sym} darf nicht in komplex sein`).toBe(false);
    }
  });

  it("findet passende Viererfolgen ausgehend von einem Akkord mit 4 unterschiedlichen Akkorden", () => {
    const folgeC = passendeViererFolgeFuer("C", "dreiklaenge");
    expect(folgeC.length).toBe(4);
    expect(new Set(folgeC).size).toBe(4);
    expect(folgeC[0]).toBe("C");

    const folgeG7 = passendeViererFolgeFuer("G7", "erweitert");
    expect(folgeG7.length).toBe(4);
    expect(new Set(folgeG7).size).toBe(4);
    expect(folgeG7.includes("G7")).toBe(true);

    for (let v = 0; v < 10; v++) {
      const f1 = passendeViererFolgeFuer("C", "dreiklaenge", v);
      expect(new Set(f1).size).toBe(4);
      const f2 = passendeViererFolgeFuer("G", "dreiklaenge", v);
      expect(new Set(f2).size).toBe(4);
      const f3 = passendeViererFolgeFuer("Cmaj7", "komplex", v);
      expect(new Set(f3).size).toBe(4);
    }
  });

  it("füllt in erweiterten und komplexen Kadenzen streng aus der eigenen Stufe auf", () => {
    const erweiterterPool = new Set(KOMPLEXITAET_INFOS.erweitert.einzelAkkorde);
    const folgeDm7 = passendeViererFolgeFuer("C7", "erweitert");
    for (const akk of folgeDm7) {
      expect(erweiterterPool.has(akk), `${akk} muss aus erweitert sein`).toBe(true);
    }

    const komplexPool = new Set(KOMPLEXITAET_INFOS.komplex.einzelAkkorde);
    const folgeCmaj7 = passendeViererFolgeFuer("Cmaj7", "komplex");
    for (const akk of folgeCmaj7) {
      expect(komplexPool.has(akk), `${akk} muss aus komplex sein`).toBe(true);
    }
  });

  it("erzeugt alle Umkehrungen für einen Akkord", () => {
    const invC = inversionenFuerAkkord("C");
    expect(invC.length).toBe(3); // Grundstellung, 1. Umkehrung, 2. Umkehrung
    expect(invC[0].umkehrung).toBe(0);
    expect(invC[1].umkehrung).toBe(1);
    expect(invC[2].umkehrung).toBe(2);
    expect(invC[0].titel).toContain("Grundstellung");
    expect(invC[1].titel).toContain("1. Umkehrung");
    expect(invC[2].titel).toContain("2. Umkehrung");

    const invG7 = inversionenFuerAkkord("G7");
    expect(invG7.length).toBe(4); // Grundstellung + 3 Umkehrungen
  });

  it("filtert Umkehrungen nach ausgewählten Stufen", () => {
    const invNurGrundUnd1 = inversionenFuerAkkord("C", [0, 1]);
    expect(invNurGrundUnd1.length).toBe(2);
    expect(invNurGrundUnd1[0].umkehrung).toBe(0);
    expect(invNurGrundUnd1[1].umkehrung).toBe(1);

    const invNur2 = inversionenFuerAkkord("C", [2]);
    expect(invNur2.length).toBe(1);
    expect(invNur2[0].umkehrung).toBe(2);
  });

  it("definiert die 4 Komplexitätsstufen vollständig mit Gruppen", () => {
    expect(KOMPLEXITAET_INFOS.dreiklaenge.kurztitel).toBe("Dreiklänge");
    expect(KOMPLEXITAET_INFOS.inversionen.kurztitel).toBe("Umkehrungen");
    expect(KOMPLEXITAET_INFOS.erweitert.kurztitel).toBe("Erweiterte Griffe");
    expect(KOMPLEXITAET_INFOS.komplex.kurztitel).toBe("Komplexe Akkorde");

    expect(KOMPLEXITAET_INFOS.dreiklaenge.gruppen.length).toBe(2);
    expect(KOMPLEXITAET_INFOS.inversionen.gruppen.length).toBe(2);
    expect(KOMPLEXITAET_INFOS.erweitert.gruppen.length).toBe(2);
    expect(KOMPLEXITAET_INFOS.komplex.gruppen.length).toBe(4);
  });

  it("erzeugt bei mitVorherigen gemischte Viererfolgen mit 2 Dreiklängen und 2 erweiterten Griffen", () => {
    const dreiklaengePool = new Set(KOMPLEXITAET_INFOS.dreiklaenge.einzelAkkorde);
    const erweitertePool = new Set(KOMPLEXITAET_INFOS.erweitert.einzelAkkorde);

    // Alle erweiterten Einzelakkorde durchtesten
    for (const sym of KOMPLEXITAET_INFOS.erweitert.einzelAkkorde) {
      const folge = passendeViererFolgeFuer(sym, "erweitert", 0, true);
      expect(folge.length).toBe(4);
      expect(new Set(folge).size).toBe(4);
      expect(folge).toContain(sym);

      const anzahlDreiklaenge = folge.filter((c) => dreiklaengePool.has(c)).length;
      const anzahlErweitert = folge.filter((c) => erweitertePool.has(c)).length;
      expect(anzahlDreiklaenge, `Folge für ${sym} muss 2 Dreiklänge haben: ${folge.join(", ")}`).toBe(2);
      expect(anzahlErweitert, `Folge für ${sym} muss 2 erweiterte Griffe haben: ${folge.join(", ")}`).toBe(2);
    }
  });

  it("erzeugt bei mitVorherigen gemischte Viererfolgen für komplexe Akkorde", () => {
    const vorherigePool = new Set([
      ...KOMPLEXITAET_INFOS.dreiklaenge.einzelAkkorde,
      ...KOMPLEXITAET_INFOS.erweitert.einzelAkkorde,
    ]);
    const komplexPool = new Set(KOMPLEXITAET_INFOS.komplex.einzelAkkorde);

    for (let v = 0; v < 10; v++) {
      const folge = passendeViererFolgeFuer("Cmaj7", "komplex", v, true);
      expect(folge.length).toBe(4);
      expect(new Set(folge).size).toBe(4);
      // Mindestens ein komplexer Akkord und mindestens ein vorheriger Akkord
      const anzahlKomplex = folge.filter((c) => komplexPool.has(c)).length;
      const anzahlVorherig = folge.filter((c) => vorherigePool.has(c)).length;
      expect(anzahlKomplex).toBeGreaterThanOrEqual(1);
      expect(anzahlVorherig).toBeGreaterThanOrEqual(1);
    }
  });
});
