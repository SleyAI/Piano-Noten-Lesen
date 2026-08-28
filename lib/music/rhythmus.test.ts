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
