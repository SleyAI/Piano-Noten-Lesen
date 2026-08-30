import { describe, expect, it } from "vitest";
import {
  aktiveTage,
  ausSchluessel,
  bucheAufTag,
  dauerText,
  kurzeDauer,
  letzteTage,
  sekundenAmTag,
  sekundenGesamt,
  serie,
  tagesSchluessel,
  uhrzeitText,
  wochentagKurz,
} from "./uebungszeit";

/** Ein fester Bezugstag, damit nichts von der echten Uhr abhaengt. */
const HEUTE = new Date(2026, 7, 30, 19, 30); // 30.08.2026, ein Sonntag

describe("Tagesschluessel", () => {
  it("schreibt Ortszeit als JJJJ-MM-TT", () => {
    expect(tagesSchluessel(HEUTE)).toBe("2026-08-30");
    expect(tagesSchluessel(new Date(2026, 0, 5, 0, 1))).toBe("2026-01-05");
  });

  it("bleibt spaet abends beim selben Tag", () => {
    // Nach UTC waere das schon der naechste Tag — hier zaehlt der Abend.
    expect(tagesSchluessel(new Date(2026, 7, 30, 23, 59))).toBe("2026-08-30");
  });

  it("laesst sich wieder in ein Datum lesen", () => {
    const zurueck = ausSchluessel("2026-08-30");
    expect(zurueck.getFullYear()).toBe(2026);
    expect(zurueck.getMonth()).toBe(7);
    expect(zurueck.getDate()).toBe(30);
  });
});

describe("Zeit buchen", () => {
  it("legt einen neuen Tag an und zaehlt auf einen bestehenden dazu", () => {
    const einmal = bucheAufTag({}, 600, HEUTE);
    expect(einmal).toEqual({ "2026-08-30": 600 });
    expect(bucheAufTag(einmal, 300, HEUTE)).toEqual({ "2026-08-30": 900 });
  });

  it("bucht nichts, wenn nichts geuebt wurde", () => {
    const vorher = { "2026-08-30": 600 };
    expect(bucheAufTag(vorher, 0, HEUTE)).toBe(vorher);
    expect(bucheAufTag(vorher, -5, HEUTE)).toBe(vorher);
  });

  it("laesst die uebergebene Tabelle unangetastet", () => {
    const vorher = { "2026-08-30": 600 };
    bucheAufTag(vorher, 300, HEUTE);
    expect(vorher).toEqual({ "2026-08-30": 600 });
  });
});

describe("Summen", () => {
  const tage = { "2026-08-28": 300, "2026-08-29": 0, "2026-08-30": 1200 };

  it("zaehlt den heutigen Tag und alles zusammen", () => {
    expect(sekundenAmTag(tage, HEUTE)).toBe(1200);
    expect(sekundenGesamt(tage)).toBe(1500);
    expect(sekundenGesamt({})).toBe(0);
  });

  it("zaehlt nur Tage mit, an denen wirklich geuebt wurde", () => {
    expect(aktiveTage(tage)).toBe(2);
  });
});

describe("Die letzten Tage", () => {
  const tage = { "2026-08-28": 300, "2026-08-30": 1200 };

  it("liefert auch die leeren Tage, aelteste zuerst", () => {
    const reihe = letzteTage(tage, 4, HEUTE);
    expect(reihe.map((e) => e.schluessel)).toEqual([
      "2026-08-27",
      "2026-08-28",
      "2026-08-29",
      "2026-08-30",
    ]);
    expect(reihe.map((e) => e.sekunden)).toEqual([0, 300, 0, 1200]);
  });

  it("endet immer beim Bezugstag", () => {
    const reihe = letzteTage(tage, 7, HEUTE);
    expect(reihe).toHaveLength(7);
    expect(reihe[reihe.length - 1].schluessel).toBe("2026-08-30");
  });

  it("kommt ueber Monatsgrenzen hinweg", () => {
    const reihe = letzteTage({}, 3, new Date(2026, 8, 1, 10, 0));
    expect(reihe.map((e) => e.schluessel)).toEqual([
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
    ]);
  });
});

describe("Serie", () => {
  it("zaehlt die Tage am Stueck bis heute", () => {
    const tage = { "2026-08-28": 60, "2026-08-29": 60, "2026-08-30": 60 };
    expect(serie(tage, HEUTE)).toBe(3);
  });

  it("laesst den heutigen Tag noch offen", () => {
    // Heute noch nichts geuebt — die Serie von gestern steht trotzdem.
    const tage = { "2026-08-28": 60, "2026-08-29": 60 };
    expect(serie(tage, HEUTE)).toBe(2);
  });

  it("reisst bei einer Luecke ab", () => {
    const tage = { "2026-08-26": 60, "2026-08-28": 60, "2026-08-29": 60 };
    expect(serie(tage, HEUTE)).toBe(2);
  });

  it("ist null, wenn seit vorgestern nichts kam", () => {
    expect(serie({ "2026-08-27": 60 }, HEUTE)).toBe(0);
    expect(serie({}, HEUTE)).toBe(0);
  });
});

describe("Anzeige", () => {
  it("schreibt die laufende Uhr mit fuehrender Null bei den Sekunden", () => {
    expect(uhrzeitText(0)).toBe("0:00");
    expect(uhrzeitText(42)).toBe("0:42");
    expect(uhrzeitText(727)).toBe("12:07");
    expect(uhrzeitText(3800)).toBe("1:03:20");
  });

  it("schreibt Dauern aus", () => {
    expect(dauerText(20)).toBe("weniger als eine Minute");
    expect(dauerText(60)).toBe("eine Minute");
    expect(dauerText(23 * 60)).toBe("23 Minuten");
    expect(dauerText(3600)).toBe("eine Stunde");
    expect(dauerText(3600 + 5 * 60)).toBe("eine Stunde 5 Minuten");
    expect(dauerText(2 * 3600)).toBe("2 Stunden");
  });

  it("fasst sich auf Kacheln kurz", () => {
    expect(kurzeDauer(0)).toBe("0 min");
    expect(kurzeDauer(23 * 60)).toBe("23 min");
    expect(kurzeDauer(3 * 3600 + 5 * 60)).toBe("3 h 05");
  });

  it("kuerzt die Wochentage", () => {
    expect(wochentagKurz(HEUTE)).toBe("So");
    expect(wochentagKurz(new Date(2026, 7, 31))).toBe("Mo");
  });
});
