import { describe, expect, it } from "vitest";
import { MAX_LAENGE, MIN_LAENGE, melodieSchluessel, wuerfleMelodie } from "./melodie";
import { type UebungsNote, istLandmark, notenAusPaketen } from "./curriculum";

const VORRAT = notenAusPaketen([
  "mitte",
  "landmarks",
  "aeussere-c",
  "um-die-mitte",
  "um-die-landmarks",
  "oktave-voll",
]);

/** Viele Wuerfe, damit seltene Ausreisser auffallen. */
function vieleMelodien(anzahl: number, vorrat: readonly UebungsNote[] = VORRAT) {
  return Array.from({ length: anzahl }, () => wuerfleMelodie(vorrat));
}

describe("Laenge", () => {
  it("bleibt zwischen vier und acht Toenen", () => {
    for (const melodie of vieleMelodien(200)) {
      expect(melodie.length).toBeGreaterThanOrEqual(MIN_LAENGE);
      expect(melodie.length).toBeLessThanOrEqual(MAX_LAENGE);
    }
  });

  it("nimmt eine vorgegebene Laenge an", () => {
    expect(wuerfleMelodie(VORRAT, { laenge: 6 })).toHaveLength(6);
  });
});

describe("Vorrat", () => {
  it("verwendet ausschliesslich freigeschaltete Noten", () => {
    const erlaubt = new Set(VORRAT.map((u) => u.note.midi));
    for (const melodie of vieleMelodien(200)) {
      for (const ton of melodie) expect(erlaubt.has(ton.note.midi)).toBe(true);
    }
  });

  it("kommt auch mit einer einzigen Note klar", () => {
    const winzig = notenAusPaketen(["mitte"]);
    const melodie = wuerfleMelodie(winzig, { laenge: 5 });
    expect(melodie).toHaveLength(5);
  });

  it("liefert bei leerem Vorrat nichts, statt zu scheitern", () => {
    expect(wuerfleMelodie([])).toEqual([]);
  });
});

describe("Musikalische Regeln", () => {
  it("meidet direkte Tonwiederholungen fast vollstaendig", () => {
    let wiederholungen = 0;
    let uebergaenge = 0;
    for (const melodie of vieleMelodien(300)) {
      for (let i = 1; i < melodie.length; i += 1) {
        uebergaenge += 1;
        if (melodie[i].note.midi === melodie[i - 1].note.midi) wiederholungen += 1;
      }
    }
    expect(wiederholungen / uebergaenge).toBeLessThan(0.02);
  });

  it("bevorzugt Schritte deutlich vor grossen Spruengen", () => {
    let schritte = 0;
    let spruenge = 0;
    for (const melodie of vieleMelodien(300)) {
      for (let i = 1; i < melodie.length; i += 1) {
        const abstand = Math.abs(melodie[i].note.diatonic - melodie[i - 1].note.diatonic);
        if (abstand > 0 && abstand <= 2) schritte += 1;
        if (abstand > 4) spruenge += 1;
      }
    }
    expect(schritte).toBeGreaterThan(spruenge * 3);
  });

  it("faengt meistens auf einem Landmark an", () => {
    const melodien = vieleMelodien(200);
    const treffer = melodien.filter((m) => istLandmark(m[0])).length;
    expect(treffer / melodien.length).toBeGreaterThan(0.9);
  });

  it("hoert oft auf einem Landmark auf", () => {
    const melodien = vieleMelodien(300);
    const treffer = melodien.filter((m) => istLandmark(m[m.length - 1])).length;
    expect(treffer / melodien.length).toBeGreaterThan(0.4);
  });

  it("bleibt meistens in einem System", () => {
    const melodien = vieleMelodien(200);
    const einheitlich = melodien.filter(
      (m) => new Set(m.map((t) => t.schluessel)).size === 1,
    ).length;
    expect(einheitlich / melodien.length).toBeGreaterThan(0.9);
  });
});

describe("Neu wuerfeln", () => {
  it("liefert immer wieder andere Melodien", () => {
    const schluessel = new Set(vieleMelodien(50).map(melodieSchluessel));
    expect(schluessel.size).toBeGreaterThan(20);
  });
});
