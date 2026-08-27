import { describe, expect, it } from "vitest";
import {
  darstellbar,
  hilfslinien,
  linienPosition,
  n,
  name,
  nameMitOktave,
  note,
  noten,
  passenderSchluessel,
  vonMidi,
} from "./pitch";

describe("Note bauen", () => {
  it("legt das mittlere C auf MIDI 60", () => {
    expect(note("C", 0, 4).midi).toBe(60);
  });

  it("rechnet Stammtoene korrekt", () => {
    expect(note("A", 0, 4).midi).toBe(69); // Kammerton a'
    expect(note("G", 0, 2).midi).toBe(43);
    expect(note("H", 0, 3).midi).toBe(59);
  });

  it("beruecksichtigt Vorzeichen", () => {
    expect(note("F", 1, 4).midi).toBe(66);
    expect(note("H", -1, 4).midi).toBe(70);
  });
});

describe("deutsche Namen", () => {
  it("nennt den siebten Stammton H", () => {
    expect(name(note("H", 0, 4))).toBe("H");
  });

  it("nennt das erniedrigte H schlicht B", () => {
    expect(name(note("H", -1, 4))).toBe("B");
  });

  it("bildet is- und es-Formen", () => {
    expect(name(note("F", 1, 4))).toBe("Fis");
    expect(name(note("D", -1, 4))).toBe("Des");
  });

  it("zieht Es und As zusammen", () => {
    expect(name(note("E", -1, 3))).toBe("Es");
    expect(name(note("A", -1, 3))).toBe("As");
  });

  it("haengt die Oktave an", () => {
    expect(nameMitOktave(note("C", 0, 4))).toBe("C4");
  });
});

describe("Namen einlesen", () => {
  it("liest Stammtoene", () => {
    expect(n("C4").midi).toBe(60);
    expect(n("H3").midi).toBe(59);
  });

  it("liest Vorzeichen inklusive der Kurzformen", () => {
    expect(n("Fis4").midi).toBe(66);
    expect(n("Des5").midi).toBe(73);
    expect(n("Es3").midi).toBe(51);
    expect(n("As2").midi).toBe(44);
  });

  it("liest B als erniedrigtes H", () => {
    const b = n("B3");
    expect(b.midi).toBe(58);
    expect(b.stufe).toBe("H");
    expect(b.alteration).toBe(-1);
  });

  it("weist Unsinn ab", () => {
    expect(() => n("X4")).toThrow();
    expect(() => n("Cs4")).toThrow();
  });

  it("liest ganze Listen", () => {
    expect(noten("C4 D4 E4").map((x) => x.midi)).toEqual([60, 62, 64]);
  });
});

describe("aus MIDI zurueck", () => {
  it("trifft weisse Tasten", () => {
    expect(nameMitOktave(vonMidi(60))).toBe("C4");
    expect(nameMitOktave(vonMidi(59))).toBe("H3");
  });

  it("folgt der gewaehlten Schreibweise", () => {
    expect(nameMitOktave(vonMidi(66, "kreuz"))).toBe("Fis4");
    expect(nameMitOktave(vonMidi(66, "b"))).toBe("Ges4");
    expect(nameMitOktave(vonMidi(70, "b"))).toBe("B4");
  });

  it("ist zur Hinrichtung invers", () => {
    for (let midi = 21; midi <= 108; midi += 1) {
      expect(vonMidi(midi).midi).toBe(midi);
      expect(vonMidi(midi, "b").midi).toBe(midi);
    }
  });
});

describe("Position im System", () => {
  it("setzt die unterste Linie des Violinschluessels auf E4", () => {
    expect(linienPosition(n("E4"), "violin")).toBe(0);
  });

  it("setzt die unterste Linie des Bassschluessels auf G2", () => {
    expect(linienPosition(n("G2"), "bass")).toBe(0);
  });

  it("legt die Landmarks auf ihre Linien", () => {
    expect(linienPosition(n("G4"), "violin")).toBe(2); // zweite Linie
    expect(linienPosition(n("F3"), "bass")).toBe(6); // vierte Linie
    expect(linienPosition(n("C5"), "violin")).toBe(5); // dritter Zwischenraum
    expect(linienPosition(n("C3"), "bass")).toBe(3); // zweiter Zwischenraum
  });

  it("setzt die oberste Linie auf 8", () => {
    expect(linienPosition(n("F5"), "violin")).toBe(8);
    expect(linienPosition(n("A3"), "bass")).toBe(8);
  });
});

describe("Hilfslinien", () => {
  it("gibt dem mittleren C in beiden Systemen genau eine", () => {
    expect(hilfslinien(linienPosition(n("C4"), "violin"))).toEqual([-2]);
    expect(hilfslinien(linienPosition(n("C4"), "bass"))).toEqual([10]);
  });

  it("laesst Noten im System ohne Hilfslinie", () => {
    expect(hilfslinien(linienPosition(n("E4"), "violin"))).toEqual([]);
    expect(hilfslinien(linienPosition(n("G4"), "violin"))).toEqual([]);
    expect(hilfslinien(linienPosition(n("F5"), "violin"))).toEqual([]);
  });

  it("zieht bei Noten im Zwischenraum nur bis zur naechsten Linie", () => {
    // H3 haengt unter der ersten Hilfslinie, braucht sie aber trotzdem.
    expect(hilfslinien(linienPosition(n("H3"), "violin"))).toEqual([-2]);
  });

  it("stapelt mehrere Hilfslinien nach aussen", () => {
    expect(hilfslinien(linienPosition(n("A3"), "violin"))).toEqual([-2, -4]);
    expect(hilfslinien(linienPosition(n("C6"), "violin"))).toEqual([10, 12]);
    expect(hilfslinien(linienPosition(n("C2"), "bass"))).toEqual([-2, -4]);
  });
});

describe("Schluesselwahl", () => {
  it("schickt tiefe Toene in den Bassschluessel", () => {
    expect(passenderSchluessel(n("C3"))).toBe("bass");
    expect(passenderSchluessel(n("G2"))).toBe("bass");
  });

  it("schickt hohe Toene in den Violinschluessel", () => {
    expect(passenderSchluessel(n("C5"))).toBe("violin");
    expect(passenderSchluessel(n("G4"))).toBe("violin");
  });

  it("gibt das mittlere C bei Gleichstand dem Violinschluessel", () => {
    expect(passenderSchluessel(n("C4"))).toBe("violin");
  });
});

describe("Darstellbarkeit", () => {
  it("akzeptiert den Uebungsumfang", () => {
    expect(darstellbar(n("C6"), "violin")).toBe(true);
    expect(darstellbar(n("C2"), "bass")).toBe(true);
  });

  it("lehnt weit entlegene Lagen ab", () => {
    expect(darstellbar(n("C2"), "violin")).toBe(false);
  });
});
