import { describe, expect, it } from "vitest";
import {
  AKKORD_PAKETE,
  akkordeImPaket,
  griffImSystem,
  lageBeschriftung,
  lagen,
} from "@/lib/music/akkorde";
import { NOTEN_PAKETE } from "@/lib/music/curriculum";
import { type Schluessel, n, passenderSchluesselFuer } from "@/lib/music/pitch";
import {
  KOPF_HOEHE,
  SYSTEM_HOEHE,
  hilfslinienY,
  passtInsBild,
  klammerOben,
  klammerUnten,
  schluesselAnkerY,
  systemBreite,
  systemLinien,
  xVonSpalte,
  kopfVersatz,
  yVonNote,
} from "./layout";

describe("Systemaufbau", () => {
  it("legt die Systeme uebereinander, mit Abstand dazwischen", () => {
    const violin = systemLinien("violin");
    const bass = systemLinien("bass");
    const violinUnterkante = Math.max(...violin);
    const bassOberkante = Math.min(...bass);
    expect(bassOberkante).toBeGreaterThan(violinUnterkante);
  });

  it("haelt in jedem System gleiche Zeilenabstaende", () => {
    for (const schluessel of ["violin", "bass"] as const) {
      const linien = systemLinien(schluessel).sort((a, b) => a - b);
      const abstaende = linien.slice(1).map((y, i) => y - linien[i]);
      expect(new Set(abstaende).size, schluessel).toBe(1);
    }
  });

  it("setzt die Schluessel auf ihre Bezugslinie", () => {
    expect(schluesselAnkerY("violin")).toBe(yVonNote(n("G4"), "violin"));
    expect(schluesselAnkerY("bass")).toBe(yVonNote(n("F3"), "bass"));
  });

  it("spannt die Klammer ueber beide Systeme", () => {
    expect(klammerOben()).toBe(Math.min(...systemLinien("violin")));
    expect(klammerUnten()).toBe(Math.max(...systemLinien("bass")));
  });
});

describe("Das mittlere C steht zweimal an verschiedenen Stellen", () => {
  it("haengt im Violinsystem unter und im Basssystem ueber dem System", () => {
    const oben = yVonNote(n("C4"), "violin");
    const unten = yVonNote(n("C4"), "bass");
    expect(oben).not.toBe(unten);
    expect(oben).toBeLessThan(unten);
  });

  it("gibt beiden genau eine eigene Hilfslinie", () => {
    expect(hilfslinienY(n("C4"), "violin")).toHaveLength(1);
    expect(hilfslinienY(n("C4"), "bass")).toHaveLength(1);
    expect(hilfslinienY(n("C4"), "violin")[0]).not.toBe(hilfslinienY(n("C4"), "bass")[0]);
  });

  it("legt beide zwischen die Systeme", () => {
    const violinUnterkante = Math.max(...systemLinien("violin"));
    const bassOberkante = Math.min(...systemLinien("bass"));
    for (const schluessel of ["violin", "bass"] as const) {
      const y = yVonNote(n("C4"), schluessel);
      expect(y, schluessel).toBeGreaterThan(violinUnterkante);
      expect(y, schluessel).toBeLessThan(bassOberkante);
    }
  });
});

describe("Alle Curriculum-Noten passen ins Bild", () => {
  const halberKopf = KOPF_HOEHE / 2;

  it("schneidet keinen Notenkopf am oberen oder unteren Rand ab", () => {
    for (const paket of NOTEN_PAKETE) {
      for (const [schluessel, liste] of [
        ["violin", paket.violin],
        ["bass", paket.bass],
      ] as [Schluessel, typeof paket.violin][]) {
        for (const note of liste) {
          const y = yVonNote(note, schluessel);
          const wo = `${paket.id} ${schluessel} ${note.stufe}${note.oktave}`;
          expect(y - halberKopf, wo).toBeGreaterThan(0);
          expect(y + halberKopf, wo).toBeLessThan(SYSTEM_HOEHE);
        }
      }
    }
  });

  it("laesst auch die aeussersten Hilfslinien im Bild", () => {
    for (const paket of NOTEN_PAKETE) {
      for (const [schluessel, liste] of [
        ["violin", paket.violin],
        ["bass", paket.bass],
      ] as [Schluessel, typeof paket.violin][]) {
        for (const note of liste) {
          for (const y of hilfslinienY(note, schluessel)) {
            expect(y, `${paket.id} ${note.stufe}${note.oktave}`).toBeGreaterThan(0);
            expect(y, `${paket.id} ${note.stufe}${note.oktave}`).toBeLessThan(SYSTEM_HOEHE);
          }
        }
      }
    }
  });
});

describe("Alle Akkordgriffe passen ins Bild", () => {
  const halberKopf = KOPF_HOEHE / 2;

  it("zeichnet jede Lage jedes Akkords vollstaendig", () => {
    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        for (const l of lagen(akkord)) {
          const schluessel = passenderSchluesselFuer(l.toene);
          for (const ton of l.toene) {
            const y = yVonNote(ton, schluessel);
            const wo = `${lageBeschriftung(l)} (${schluessel})`;
            expect(y - halberKopf, wo).toBeGreaterThan(0);
            expect(y + halberKopf, wo).toBeLessThan(SYSTEM_HOEHE);
            for (const linie of hilfslinienY(ton, schluessel)) {
              expect(linie, wo).toBeGreaterThan(0);
              expect(linie, wo).toBeLessThan(SYSTEM_HOEHE);
            }
          }
        }
      }
    }
  });

  it("kommt fuer jeden Griff mit hoechstens drei Hilfslinien je Ton aus", () => {
    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        for (const l of lagen(akkord)) {
          const schluessel = passenderSchluesselFuer(l.toene);
          for (const ton of l.toene) {
            expect(
              hilfslinienY(ton, schluessel).length,
              `${lageBeschriftung(l)} ${ton.stufe}${ton.oktave}`,
            ).toBeLessThanOrEqual(3);
          }
        }
      }
    }
  });
});

describe("Griffe bei fester Schluesselwahl", () => {
  it("zeichnet jede Lage vollstaendig, egal welches System gewaehlt ist", () => {
    for (const wahl of ["beide", "violin", "bass"] as const) {
      for (const paket of AKKORD_PAKETE) {
        for (const akkord of akkordeImPaket(paket)) {
          for (const l of lagen(akkord)) {
            const griff = griffImSystem(l.toene, wahl);
            for (const ton of griff.toene) {
              expect(
                passtInsBild(ton, griff.schluessel),
                `${wahl}: ${lageBeschriftung(l)} ${ton.stufe}${ton.oktave}`,
              ).toBe(true);
            }
          }
        }
      }
    }
  });

  it("bleibt auch im erzwungenen System bei hoechstens drei Hilfslinien", () => {
    for (const wahl of ["violin", "bass"] as const) {
      for (const paket of AKKORD_PAKETE) {
        for (const akkord of akkordeImPaket(paket)) {
          for (const l of lagen(akkord)) {
            const griff = griffImSystem(l.toene, wahl);
            for (const ton of griff.toene) {
              expect(
                hilfslinienY(ton, griff.schluessel).length,
                `${wahl}: ${lageBeschriftung(l)} ${ton.stufe}${ton.oktave}`,
              ).toBeLessThanOrEqual(3);
            }
          }
        }
      }
    }
  });

  it("haelt die Griffe in einer spielbaren Lage", () => {
    for (const wahl of ["violin", "bass"] as const) {
      for (const paket of AKKORD_PAKETE) {
        for (const akkord of akkordeImPaket(paket)) {
          for (const l of lagen(akkord)) {
            const griff = griffImSystem(l.toene, wahl);
            // Innerhalb eines 88-Tasten-Klaviers, mit Luft nach beiden Seiten.
            expect(griff.toene[0].midi, wahl).toBeGreaterThanOrEqual(28);
            expect(
              griff.toene[griff.toene.length - 1].midi,
              wahl,
            ).toBeLessThanOrEqual(100);
          }
        }
      }
    }
  });
});

describe("Spalten", () => {
  it("setzt eine einzelne Note mittig, nicht an den linken Rand", () => {
    const x = xVonSpalte(0, 1);
    const breite = systemBreite(1);
    expect(x).toBeGreaterThan(breite * 0.35);
    expect(x).toBeLessThan(breite * 0.65);
  });

  it("reiht mehrere Spalten mit gleichem Abstand", () => {
    const xs = [0, 1, 2, 3].map((i) => xVonSpalte(i, 4));
    const abstaende = xs.slice(1).map((x, i) => x - xs[i]);
    expect(new Set(abstaende).size).toBe(1);
  });

  it("waechst mit der Zahl der Noten, aber nie unter die Mindestbreite", () => {
    expect(systemBreite(1)).toBe(systemBreite(4));
    expect(systemBreite(8)).toBeGreaterThan(systemBreite(4));
  });
});

describe("Sekunden versetzen", () => {
  it("laesst Terzen und groessere Abstaende in Ruhe", () => {
    // C4 E4 G4 — diatonisch 28, 30, 32
    expect(kopfVersatz([28, 30, 32])).toEqual([0, 0, 0]);
  });

  it("schiebt den oberen Kopf einer Sekunde zur Seite", () => {
    // C4 D4
    expect(kopfVersatz([28, 29])).toEqual([0, 1]);
  });

  it("faellt bei drei Nachbarn wieder zurueck, statt weiter zu wandern", () => {
    // C4 D4 E4 — der dritte darf wieder auf die Grundspur.
    expect(kopfVersatz([28, 29, 30])).toEqual([0, 1, 0]);
  });
});
