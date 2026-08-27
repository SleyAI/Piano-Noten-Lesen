import { describe, expect, it } from "vitest";
import {
  NOTEN_PAKETE,
  nachSchluessel,
  notenAusPaketen,
  uebungsSchluessel,
} from "./curriculum";
import { darstellbar, hilfslinien, linienPosition, nameMitOktave } from "./pitch";

describe("Paketaufbau", () => {
  it("nummeriert die Stufen luecklos aufsteigend", () => {
    expect(NOTEN_PAKETE.map((p) => p.stufe)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("vergibt eindeutige IDs", () => {
    const ids = NOTEN_PAKETE.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("belegt beide Systeme in jeder Stufe", () => {
    for (const paket of NOTEN_PAKETE) {
      expect(paket.violin.length, paket.id).toBeGreaterThan(0);
      expect(paket.bass.length, paket.id).toBeGreaterThan(0);
    }
  });

  it("haelt beide Systeme pro Stufe im Gleichgewicht", () => {
    for (const paket of NOTEN_PAKETE) {
      expect(Math.abs(paket.violin.length - paket.bass.length), paket.id).toBeLessThanOrEqual(1);
    }
  });
});

describe("Darstellbarkeit im jeweiligen System", () => {
  it("haelt jede Note in ihrem System lesbar", () => {
    for (const paket of NOTEN_PAKETE) {
      for (const note of paket.violin) {
        expect(darstellbar(note, "violin", 3), `${paket.id} ${nameMitOktave(note)}`).toBe(true);
      }
      for (const note of paket.bass) {
        expect(darstellbar(note, "bass", 3), `${paket.id} ${nameMitOktave(note)}`).toBe(true);
      }
    }
  });

  it("beginnt spiegelbildlich mit je einer Hilfslinie", () => {
    const mitte = NOTEN_PAKETE[0];
    expect(hilfslinien(linienPosition(mitte.violin[0], "violin"))).toHaveLength(1);
    expect(hilfslinien(linienPosition(mitte.bass[0], "bass"))).toHaveLength(1);
  });

  it("setzt die Landmarks ohne Hilfslinie mitten ins System", () => {
    const landmarks = NOTEN_PAKETE[1];
    expect(hilfslinien(linienPosition(landmarks.violin[0], "violin"))).toEqual([]);
    expect(hilfslinien(linienPosition(landmarks.bass[0], "bass"))).toEqual([]);
  });
});

describe("Noten aus Paketen sammeln", () => {
  it("liefert das mittlere C fuer beide Systeme getrennt", () => {
    // Die Systeme stehen mit Abstand untereinander: C4 haengt einmal unter
    // dem oberen und einmal ueber dem unteren. Zwei Lesevorgaenge.
    const gesammelt = notenAusPaketen(["mitte"]);
    expect(gesammelt).toHaveLength(2);
    expect(gesammelt.map((u) => u.schluessel).sort()).toEqual(["bass", "violin"]);
    expect(gesammelt.every((u) => u.note.midi === 60)).toBe(true);
  });

  it("entfernt Doppelte ueber Paketgrenzen hinweg", () => {
    const gesammelt = notenAusPaketen(["mitte", "um-die-mitte", "oktave-voll"]);
    const schluessel = gesammelt.map(uebungsSchluessel);
    expect(new Set(schluessel).size).toBe(schluessel.length);
  });

  it("ignoriert unbekannte Paket-IDs, statt zu scheitern", () => {
    expect(notenAusPaketen(["gibtsnicht"])).toEqual([]);
    expect(notenAusPaketen(["gibtsnicht", "mitte"])).toHaveLength(2);
  });

  it("waechst mit jeder zusaetzlichen Stufe", () => {
    const klein = notenAusPaketen(["mitte"]).length;
    const gross = notenAusPaketen(["mitte", "landmarks", "aeussere-c"]).length;
    expect(gross).toBeGreaterThan(klein);
  });
});

describe("Auf ein System einschraenken", () => {
  const alles = notenAusPaketen(NOTEN_PAKETE.map((p) => p.id));

  it("laesst bei \"beide\" alles stehen", () => {
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

  it("laesst auch das kleinste Paket in beiden Systemen ueben", () => {
    const mitte = notenAusPaketen(["mitte"]);
    expect(nachSchluessel(mitte, "violin")).toHaveLength(1);
    expect(nachSchluessel(mitte, "bass")).toHaveLength(1);
  });

  it("faellt auf den vollen Vorrat zurueck, statt nichts zu liefern", () => {
    const nurViolin = nachSchluessel(notenAusPaketen(["mitte"]), "violin");
    // In dieser Auswahl gibt es keine Bassnote mehr — dann gewinnt der Vorrat.
    expect(nachSchluessel(nurViolin, "bass")).toEqual(nurViolin);
  });
});
