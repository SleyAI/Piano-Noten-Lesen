import { describe, expect, it } from "vitest";
import {
  UEBUNGSARTEN,
  baueUebung,
  fingersatz,
  midisDerUebung,
} from "./akkorduebung";
import { type Haende, akkordNachSymbol, lagen, schluesselAn } from "./akkorde";
import { TAKT, dauerSumme } from "./rhythmus";

const AKKORDE = ["C", "Am", "F", "G7", "Cmaj7", "Dm7"].map((symbol) => {
  const akkord = akkordNachSymbol(symbol);
  if (!akkord) throw new Error(`Testakkord fehlt: ${symbol}`);
  return akkord;
});

const ARTEN = UEBUNGSARTEN.map((a) => a.id);
const HAENDE: Haende[] = ["rechts", "links", "beide"];

/** Jede Uebung zu jeder Lage jedes Testakkords, mehrfach fuer den Zufall. */
function alleUebungen(haende: Haende = "rechts", lang = false) {
  return AKKORDE.flatMap((akkord) =>
    lagen(akkord).flatMap((lage) =>
      ARTEN.flatMap((art) =>
        Array.from({ length: 5 }, () => ({
          akkord,
          lage,
          art,
          ...baueUebung(lage, art, haende, lang),
        })),
      ),
    ),
  );
}

describe("Jede Uebung ist spielbar", () => {
  it("hat mindestens einen Schritt", () => {
    for (const u of HAENDE.flatMap((h) => alleUebungen(h))) {
      expect(u.schritte.length, `${u.akkord.symbol} ${u.art}`).toBeGreaterThan(0);
    }
  });

  it("hat in jedem Schritt mindestens einen Ton", () => {
    for (const u of HAENDE.flatMap((h) => alleUebungen(h))) {
      for (const schritt of u.schritte) {
        expect(schritt.noten.length, `${u.akkord.symbol} ${u.art}`).toBeGreaterThan(0);
      }
    }
  });

  it("fuellt volle Takte", () => {
    for (const u of HAENDE.flatMap((h) => alleUebungen(h))) {
      const summe = dauerSumme(u.schritte.map((s) => s.wert));
      expect(summe % TAKT, `${u.akkord.symbol} ${u.art}`).toBe(0);
    }
  });

  it("setzt den letzten Taktstrich ans Ende", () => {
    for (const u of HAENDE.flatMap((h) => alleUebungen(h))) {
      expect(u.schritte[u.schritte.length - 1].taktEnde, `${u.akkord.symbol} ${u.art}`).toBe(
        true,
      );
    }
  });
});

describe("Die Uebungen bleiben beim Material des Akkords", () => {
  it("benutzt nur Toene des Griffs, hoechstens eine Oktave darueber", () => {
    for (const haende of HAENDE) {
      for (const u of alleUebungen(haende)) {
        const griff = baueUebung(u.lage, "griff", haende).schritte[0].noten;
        const erlaubt = new Set(griff.flatMap((n) => [n.midi, n.midi + 12]));
        for (const midi of midisDerUebung(u.schritte)) {
          expect(erlaubt.has(midi), `${haende} ${u.akkord.symbol} ${u.art} ${midi}`).toBe(true);
        }
      }
    }
  });

  it("stellt beim ganzen Griff alle Toene auf einen Schlag", () => {
    for (const haende of HAENDE) {
      for (const akkord of AKKORDE) {
        for (const lage of lagen(akkord)) {
          const { griff, schritte } = baueUebung(lage, "griff", haende);
          expect(schritte).toHaveLength(1);
          expect(schritte[0].noten).toEqual(griff.noten);
        }
      }
    }
  });

  it("spielt gebrochen jeden Ton einzeln, hinauf und wieder zurueck", () => {
    for (const haende of HAENDE) {
      for (const akkord of AKKORDE) {
        for (const lage of lagen(akkord)) {
          const { griff, schritte } = baueUebung(lage, "gebrochen", haende);
          const toene = griff.noten;
          expect(schritte, akkord.symbol).toHaveLength(toene.length * 2 - 1);
          expect(schritte.every((s) => s.noten.length === 1)).toBe(true);

          const midis = schritte.map((s) => s.noten[0].midi);
          expect(midis.slice(0, toene.length)).toEqual(toene.map((n) => n.midi));
          expect(midis[midis.length - 1]).toBe(toene[0].midi);
        }
      }
    }
  });

  it("endet die kleine Melodie auf dem ganzen Griff", () => {
    for (const haende of HAENDE) {
      for (const akkord of AKKORDE) {
        const lage = lagen(akkord)[0];
        for (let i = 0; i < 5; i += 1) {
          const { griff, schritte } = baueUebung(lage, "melodie", haende);
          expect(schritte[schritte.length - 1].noten).toEqual(griff.noten);
        }
      }
    }
  });

  it("laesst die Melodielinie in einer Hand", () => {
    for (const akkord of AKKORDE) {
      const lage = lagen(akkord)[0];
      for (let i = 0; i < 5; i += 1) {
        const { griff, schritte } = baueUebung(lage, "melodie", "beide");
        // Alles ausser dem Schlussgriff steht im Violinschluessel.
        for (const schritt of schritte.slice(0, -1)) {
          expect(schluesselAn(schritt.noten[0].midi, griff.bassGrenze)).toBe("violin");
        }
      }
    }
  });
});

describe("Handwahl", () => {
  it("legt alle Schritte in dasselbe System, wenn nur eine Hand spielt", () => {
    for (const [haende, erwartet] of [
      ["rechts", "violin"],
      ["links", "bass"],
    ] as const) {
      for (const u of alleUebungen(haende)) {
        for (const midi of midisDerUebung(u.schritte)) {
          expect(schluesselAn(midi, u.bassGrenze), haende).toBe(erwartet);
        }
      }
    }
  });

  it("belegt bei beiden Haenden auch beide Systeme", () => {
    for (const u of alleUebungen("beide")) {
      const systeme = new Set(
        u.schritte.flatMap((s) => s.noten.map((n) => schluesselAn(n.midi, u.bassGrenze))),
      );
      expect(systeme, `${u.akkord.symbol} ${u.art}`).toContain("violin");
      // Nur die gebrochene Figur und der Griff kommen zwingend unten vorbei;
      // die Melodielinie bleibt oben und endet erst auf dem ganzen Griff.
      if (u.art !== "melodie") expect(systeme).toContain("bass");
    }
  });

  it("verschiebt den Griff zwischen den Haenden nur oktavweise", () => {
    const lage = lagen(AKKORDE[0])[0];
    const oben = baueUebung(lage, "griff", "rechts").schritte[0].noten;
    const unten = baueUebung(lage, "griff", "links").schritte[0].noten;
    for (let i = 0; i < oben.length; i += 1) {
      expect((oben[i].midi - unten[i].midi) % 12).toBe(0);
      expect(oben[i].stufe).toBe(unten[i].stufe);
    }
  });
});

describe("Beim Lernen wird laenger geuebt", () => {
  it("gibt jeder Uebung ausser dem Griff mehr Schritte", () => {
    for (const art of ["takt", "melodie"] as const) {
      for (const akkord of AKKORDE) {
        const lage = lagen(akkord)[0];
        const kurz = baueUebung(lage, art, "rechts").schritte.length;
        const lang = baueUebung(lage, art, "rechts", true).schritte.length;
        expect(lang, `${akkord.symbol} ${art}`).toBeGreaterThan(kurz);
      }
    }
  });

  it("laesst die gebrochene Figur zweimal durchlaufen, solange sie kurz bleibt", () => {
    const lage = lagen(AKKORDE[0])[0];
    const kurz = baueUebung(lage, "gebrochen", "rechts").schritte.length;
    const lang = baueUebung(lage, "gebrochen", "rechts", true).schritte.length;
    expect(lang).toBe(kurz * 2 - 1);
  });

  it("fuellt auch lang noch volle Takte", () => {
    for (const haende of HAENDE) {
      for (const u of alleUebungen(haende, true)) {
        const summe = dauerSumme(u.schritte.map((s) => s.wert));
        expect(summe % TAKT, `${u.akkord.symbol} ${u.art}`).toBe(0);
      }
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
