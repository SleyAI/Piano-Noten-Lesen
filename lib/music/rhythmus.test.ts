import { describe, expect, it } from "vitest";
import {
  NOTENWERTE,
  type NotenwertId,
  TAKT,
  dauerSumme,
  millisekunden,
  taktEnden,
  taktzahl,
  wuerfleRhythmus,
  TEMPO_MAX,
  TEMPO_MIN,
  begrenzeTempo,
  taktFehler,
} from "./rhythmus";

const ANZAHLEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16];

function viele(anzahl: number, erlaubt?: NotenwertId[]) {
  return Array.from({ length: 60 }, () => wuerfleRhythmus(anzahl, erlaubt));
}

describe("Rhythmus wuerfeln", () => {
  it("liefert genau so viele Werte wie Noten", () => {
    for (const anzahl of ANZAHLEN) {
      for (const rhythmus of viele(anzahl)) {
        expect(rhythmus, `${anzahl} Noten`).toHaveLength(anzahl);
      }
    }
  });

  it("fuellt immer volle Takte", () => {
    for (const anzahl of ANZAHLEN) {
      for (const rhythmus of viele(anzahl)) {
        expect(dauerSumme(rhythmus) % TAKT, `${anzahl} Noten`).toBe(0);
      }
    }
  });

  it("haelt sich an die vorgesehene Taktzahl", () => {
    for (const anzahl of ANZAHLEN) {
      for (const rhythmus of viele(anzahl)) {
        expect(dauerSumme(rhythmus)).toBe(taktzahl(anzahl) * TAKT);
      }
    }
  });

  it("laesst keine Note ueber einen Taktstrich reichen", () => {
    for (const anzahl of ANZAHLEN) {
      for (const rhythmus of viele(anzahl)) {
        let stand = 0;
        for (const wert of rhythmus) {
          const dauer = NOTENWERTE[wert].schlaege;
          expect(dauer, `${anzahl} Noten`).toBeLessThanOrEqual(TAKT - (stand % TAKT));
          stand += dauer;
        }
      }
    }
  });

  it("benutzt nur die erlaubten Werte", () => {
    const erlaubt: NotenwertId[] = ["halbe", "viertel"];
    for (const rhythmus of viele(8, erlaubt)) {
      for (const wert of rhythmus) expect(erlaubt).toContain(wert);
    }
  });

  it("mischt die Werte, statt immer dasselbe zu liefern", () => {
    const verschiedene = new Set(viele(8).map((r) => r.join("-")));
    expect(verschiedene.size).toBeGreaterThan(10);
  });

  it("kommt mit null Noten klar", () => {
    expect(wuerfleRhythmus(0)).toEqual([]);
  });
});

describe("Taktstriche", () => {
  it("markiert die Note, mit der ein Takt voll ist", () => {
    expect(taktEnden(["viertel", "viertel", "halbe", "ganze"])).toEqual([
      false,
      false,
      true,
      true,
    ]);
  });

  it("setzt hinter jeder ganzen Note einen Strich", () => {
    expect(taktEnden(["ganze", "ganze"])).toEqual([true, true]);
  });
});

describe("Dauer in Millisekunden", () => {
  it("macht die Viertel bei 60 Schlaegen zur Sekunde", () => {
    expect(millisekunden("viertel", 60)).toBe(1000);
    expect(millisekunden("halbe", 60)).toBe(2000);
    expect(millisekunden("achtel", 60)).toBe(500);
  });

  it("wird bei doppeltem Tempo halb so lang", () => {
    expect(millisekunden("viertel", 120)).toBe(millisekunden("viertel", 60) / 2);
  });
});

describe("Tempo und Taktgrenzen", () => {
  it("haelt das Tempo in einem spielbaren Rahmen", () => {
    expect(begrenzeTempo(0)).toBe(TEMPO_MIN);
    expect(begrenzeTempo(1000)).toBe(TEMPO_MAX);
    expect(begrenzeTempo(76)).toBe(76);
    expect(begrenzeTempo(76.4)).toBe(76);
  });

  it("rechnet Notenwerte in Millisekunden um", () => {
    // Bei 60 Schlaegen je Minute dauert eine Viertel genau eine Sekunde.
    expect(millisekunden("viertel", 60)).toBe(1000);
    expect(millisekunden("halbe", 60)).toBe(2000);
    expect(millisekunden("achtel", 60)).toBe(500);
    expect(millisekunden("ganze", 120)).toBe(2000);
  });

  it("laesst durchgehen, was nah genug am Sollwert liegt", () => {
    for (const anteil of [0.7, 0.9, 1, 1.2, 1.6]) {
      expect(taktFehler("viertel", 1000 * anteil, 60), String(anteil)).toBeNull();
    }
  });

  it("meldet zu kurz und zu lang", () => {
    expect(taktFehler("viertel", 300, 60)).toBe("zu-kurz");
    expect(taktFehler("viertel", 2000, 60)).toBe("zu-lang");
  });

  it("unterscheidet eine Halbe von einer Viertel", () => {
    // Wer eine Halbe wie eine Viertel spielt, faellt auf; wer sie richtig
    // haelt, nicht. Genau dafuer sind die Grenzen da.
    expect(taktFehler("halbe", 1000, 60)).toBe("zu-kurz");
    expect(taktFehler("halbe", 2000, 60)).toBeNull();
    expect(taktFehler("viertel", 2000, 60)).toBe("zu-lang");
  });

  it("misst am eingestellten Tempo", () => {
    // Dieselbe Sekunde ist bei 60 richtig und bei 120 zu lang.
    expect(taktFehler("viertel", 1000, 60)).toBeNull();
    expect(taktFehler("viertel", 1000, 120)).toBe("zu-lang");
  });
});
