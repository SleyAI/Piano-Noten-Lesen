import { describe, expect, it } from "vitest";
import {
  UEBUNGSARTEN,
  baueUebung,
  fingersatz,
  midisDerUebung,
} from "./akkorduebung";
import { akkordNachSymbol, lagen } from "./akkorde";
import { TAKT, dauerSumme } from "./rhythmus";
import type { SchluesselWahl } from "./pitch";

const AKKORDE = ["C", "Am", "F", "G7", "Cmaj7", "Dm7"].map((symbol) => {
  const akkord = akkordNachSymbol(symbol);
  if (!akkord) throw new Error(`Testakkord fehlt: ${symbol}`);
  return akkord;
});

const ARTEN = UEBUNGSARTEN.map((a) => a.id);
const WAHLEN: SchluesselWahl[] = ["beide", "violin", "bass"];

/** Jede Uebung zu jeder Lage jedes Testakkords, mehrfach fuer den Zufall. */
function alleUebungen(wahl: SchluesselWahl = "beide") {
  return AKKORDE.flatMap((akkord) =>
    lagen(akkord).flatMap((lage) =>
      ARTEN.flatMap((art) =>
        Array.from({ length: 5 }, () => ({
          akkord,
          lage,
          art,
          ...baueUebung(lage, art, wahl),
        })),
      ),
    ),
  );
}

describe("Jede Uebung ist spielbar", () => {
  it("hat mindestens einen Schritt", () => {
    for (const u of alleUebungen()) {
      expect(u.schritte.length, `${u.akkord.symbol} ${u.art}`).toBeGreaterThan(0);
    }
  });

  it("hat in jedem Schritt mindestens einen Ton", () => {
    for (const u of alleUebungen()) {
      for (const schritt of u.schritte) {
        expect(schritt.noten.length, `${u.akkord.symbol} ${u.art}`).toBeGreaterThan(0);
      }
    }
  });

  it("fuellt volle Takte", () => {
    for (const u of alleUebungen()) {
      const summe = dauerSumme(u.schritte.map((s) => s.wert));
      expect(summe % TAKT, `${u.akkord.symbol} ${u.art}`).toBe(0);
    }
  });

  it("setzt den letzten Taktstrich ans Ende", () => {
    for (const u of alleUebungen()) {
      expect(u.schritte[u.schritte.length - 1].taktEnde, `${u.akkord.symbol} ${u.art}`).toBe(
        true,
      );
    }
  });
});

describe("Die Uebungen bleiben beim Material des Akkords", () => {
  it("benutzt nur Toene des Griffs, hoechstens eine Oktave darueber", () => {
    for (const u of alleUebungen()) {
      const griff = baueUebung(u.lage, "griff", "beide").schritte[0].noten;
      const erlaubt = new Set(griff.flatMap((n) => [n.midi, n.midi + 12]));
      for (const midi of midisDerUebung(u.schritte)) {
        expect(erlaubt.has(midi), `${u.akkord.symbol} ${u.art} ${midi}`).toBe(true);
      }
    }
  });

  it("stellt beim ganzen Griff alle Toene auf einen Schlag", () => {
    for (const akkord of AKKORDE) {
      for (const lage of lagen(akkord)) {
        const { schritte } = baueUebung(lage, "griff", "beide");
        expect(schritte).toHaveLength(1);
        expect(schritte[0].noten.map((n) => n.midi)).toEqual(lage.toene.map((n) => n.midi));
      }
    }
  });

  it("spielt gebrochen jeden Ton einzeln, hinauf und wieder zurueck", () => {
    for (const akkord of AKKORDE) {
      for (const lage of lagen(akkord)) {
        const { schritte } = baueUebung(lage, "gebrochen", "beide");
        expect(schritte, akkord.symbol).toHaveLength(lage.toene.length * 2 - 1);
        expect(schritte.every((s) => s.noten.length === 1)).toBe(true);

        const midis = schritte.map((s) => s.noten[0].midi);
        expect(midis.slice(0, lage.toene.length)).toEqual(lage.toene.map((n) => n.midi));
        expect(midis[midis.length - 1]).toBe(lage.toene[0].midi);
      }
    }
  });

  it("endet die kleine Melodie auf dem ganzen Griff", () => {
    for (const akkord of AKKORDE) {
      const lage = lagen(akkord)[0];
      for (let i = 0; i < 5; i += 1) {
        const { schritte } = baueUebung(lage, "melodie", "beide");
        const letzter = schritte[schritte.length - 1];
        expect(letzter.noten.map((n) => n.midi)).toEqual(lage.toene.map((n) => n.midi));
      }
    }
  });
});

describe("Schluesselwahl", () => {
  it("legt alle Schritte in dasselbe System", () => {
    for (const wahl of WAHLEN) {
      for (const u of alleUebungen(wahl)) {
        if (wahl !== "beide") expect(u.schluessel).toBe(wahl);
      }
    }
  });

  it("verschiebt den Griff nur oktavweise", () => {
    const lage = lagen(AKKORDE[0])[0];
    const oben = baueUebung(lage, "griff", "violin").schritte[0].noten;
    const unten = baueUebung(lage, "griff", "bass").schritte[0].noten;
    for (let i = 0; i < oben.length; i += 1) {
      expect((oben[i].midi - unten[i].midi) % 12).toBe(0);
      expect(oben[i].stufe).toBe(unten[i].stufe);
    }
  });
});

describe("Fingersatz", () => {
  it("gibt jedem Ton einen Finger", () => {
    for (const anzahl of [3, 4, 5]) {
      for (const umkehrung of [0, 1, 2]) {
        expect(fingersatz(anzahl, umkehrung, "violin")).toHaveLength(anzahl);
        expect(fingersatz(anzahl, umkehrung, "bass")).toHaveLength(anzahl);
      }
    }
  });

  it("beginnt rechts mit dem Daumen und links mit dem kleinen Finger", () => {
    expect(fingersatz(3, 0, "violin")[0]).toBe(1);
    expect(fingersatz(3, 0, "bass")[0]).toBe(5);
  });

  it("laesst die Finger von unten nach oben laufen", () => {
    for (const hand of ["violin", "bass"] as const) {
      const finger = fingersatz(4, 0, hand);
      const sortiert = [...finger].sort((a, b) => a - b);
      expect(hand === "violin" ? finger : [...finger].reverse()).toEqual(sortiert);
    }
  });

  it("rueckt bei der ersten Umkehrung eines Dreiklangs zusammen", () => {
    expect(fingersatz(3, 1, "violin")).toEqual([1, 2, 5]);
  });
});
