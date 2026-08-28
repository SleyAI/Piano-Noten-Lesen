import { describe, expect, it } from "vitest";
import {
  type Tastenwahl,
  TASTEN_WAHLEN,
  istLandmark,
  nachSchluessel,
  notenVorrat,
  uebungsSchluessel,
  vorratUmfang,
} from "./curriculum";
import { darstellbar, nameMitOktave } from "./pitch";

const WAHLEN: Tastenwahl[] = ["weiss", "alle"];

describe("Aufbau des Vorrats", () => {
  it("kennt genau zwei Unterscheidungen", () => {
    expect(TASTEN_WAHLEN.map((w) => w.wert)).toEqual(["weiss", "alle"]);
  });

  it("belegt beide Systeme", () => {
    for (const wahl of WAHLEN) {
      const vorrat = notenVorrat(wahl);
      expect(vorrat.some((u) => u.schluessel === "violin"), wahl).toBe(true);
      expect(vorrat.some((u) => u.schluessel === "bass"), wahl).toBe(true);
    }
  });

  it("haelt beide Systeme im Gleichgewicht", () => {
    for (const wahl of WAHLEN) {
      const vorrat = notenVorrat(wahl);
      const violin = vorrat.filter((u) => u.schluessel === "violin").length;
      const bass = vorrat.filter((u) => u.schluessel === "bass").length;
      expect(violin, wahl).toBe(bass);
    }
  });

  it("vergibt jede Uebungsnote nur einmal", () => {
    for (const wahl of WAHLEN) {
      const schluessel = notenVorrat(wahl).map(uebungsSchluessel);
      expect(new Set(schluessel).size, wahl).toBe(schluessel.length);
    }
  });

  it("liefert das mittlere C fuer beide Systeme getrennt", () => {
    // Die Systeme stehen mit Abstand untereinander: C4 haengt einmal unter
    // dem oberen und einmal ueber dem unteren. Zwei Lesevorgaenge.
    const mittleresC = notenVorrat("weiss").filter((u) => u.note.midi === 60);
    expect(mittleresC).toHaveLength(2);
    expect(mittleresC.map((u) => u.schluessel).sort()).toEqual(["bass", "violin"]);
  });
});

describe("Weisse und schwarze Tasten", () => {
  it("laesst bei den weissen Tasten jedes Vorzeichen weg", () => {
    for (const u of notenVorrat("weiss")) {
      expect(u.note.alteration, nameMitOktave(u.note)).toBe(0);
    }
  });

  it("nimmt jede schwarze Taste in beiden Schreibweisen dazu", () => {
    const weiss = new Set(notenVorrat("weiss").map(uebungsSchluessel));
    const dazu = notenVorrat("alle").filter((u) => !weiss.has(uebungsSchluessel(u)));

    expect(dazu.every((u) => u.note.alteration !== 0)).toBe(true);
    // Fis und Ges sind derselbe Klang auf verschiedenen Linien.
    for (const u of dazu) {
      const gegenstueck = dazu.filter(
        (x) => x.schluessel === u.schluessel && x.note.midi === u.note.midi,
      );
      expect(gegenstueck, nameMitOktave(u.note)).toHaveLength(2);
    }
  });

  it("bringt mit den schwarzen Tasten mehr mit als ohne", () => {
    expect(vorratUmfang("alle")).toBeGreaterThan(vorratUmfang("weiss"));
  });

  it("enthaelt alle Landmarks", () => {
    const vorrat = notenVorrat("weiss");
    expect(vorrat.filter(istLandmark).length).toBeGreaterThanOrEqual(5);
  });
});

describe("Darstellbarkeit im jeweiligen System", () => {
  it("haelt jede Note in ihrem System lesbar", () => {
    for (const wahl of WAHLEN) {
      for (const u of notenVorrat(wahl)) {
        expect(darstellbar(u.note, u.schluessel, 3), nameMitOktave(u.note)).toBe(true);
      }
    }
  });
});

describe("Auf ein System einschraenken", () => {
  const alles = notenVorrat("alle");

  it('laesst bei "beide" alles stehen', () => {
    expect(nachSchluessel(alles, "beide")).toHaveLength(alles.length);
  });

  it("liefert nur noch Noten des gewaehlten Systems", () => {
    for (const wahl of ["violin", "bass"] as const) {
      const gefiltert = nachSchluessel(alles, wahl);
      expect(gefiltert.length, wahl).toBeGreaterThan(0);
      expect(gefiltert.every((u) => u.schluessel === wahl), wahl).toBe(true);
    }
  });

  it("teilt den Vorrat auf, ohne etwas zu verlieren", () => {
    const violin = nachSchluessel(alles, "violin").length;
    const bass = nachSchluessel(alles, "bass").length;
    expect(violin + bass).toBe(alles.length);
  });

  it("faellt auf den vollen Vorrat zurueck, statt nichts zu liefern", () => {
    const nurViolin = nachSchluessel(alles, "violin");
    // In dieser Auswahl gibt es keine Bassnote mehr — dann gewinnt der Vorrat.
    expect(nachSchluessel(nurViolin, "bass")).toEqual(nurViolin);
  });
});
