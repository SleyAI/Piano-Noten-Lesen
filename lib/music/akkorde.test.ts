import { describe, expect, it } from "vitest";
import {
  AKKORD_PAKETE,
  AKKORD_TYPEN,
  type Akkord,
  akkordNachSymbol,
  akkordeAusPaketen,
  akkordeImPaket,
  anzahlUmkehrungen,
  baueAkkord,
  flottePlanung,
  griffFuerHaende,
  grundstellungsPlanung,
  inSystem,
  lage,
  lageBeschriftung,
  lagen,
  schluesselAn,
  stellungenVon,
  wirksameStellung,
  stimmabstand,
  umkehrungName,
} from "./akkorde";
import { hilfslinien, linienPosition, nameMitOktave, name } from "./pitch";

function hole(symbol: string): Akkord {
  const akkord = akkordNachSymbol(symbol);
  if (!akkord) throw new Error(`Akkord fehlt: ${symbol}`);
  return akkord;
}

const toene = (a: Akkord) => a.toene.map(nameMitOktave);

describe("Akkorde aufbauen", () => {
  it("baut C-Dur aus C, E und G", () => {
    expect(toene(hole("C"))).toEqual(["C4", "E4", "G4"]);
  });

  it("baut a-Moll aus A, C und E", () => {
    expect(toene(hole("Am"))).toEqual(["A3", "C4", "E4"]);
  });

  it("baut G7 mit kleiner Septime", () => {
    expect(toene(hole("G7"))).toEqual(["G3", "H3", "D4", "F4"]);
  });

  it("baut Cmaj7 mit grosser Septime", () => {
    expect(toene(hole("Cmaj7"))).toEqual(["C4", "E4", "G4", "H4"]);
  });
});

describe("Schreibweise der Akkordtoene", () => {
  it("schreibt die Terz von Fis-Dur als Ais, nicht als B", () => {
    // Die Terz liegt immer zwei Stufen ueber dem Grundton — F, dann A.
    expect(toene(hole("Fis"))).toEqual(["Fis4", "Ais4", "Cis5"]);
  });

  it("schreibt Es-Dur mit G und B", () => {
    expect(toene(hole("Es"))).toEqual(["Es4", "G4", "B4"]);
  });

  it("schreibt B-Dur mit D und F", () => {
    expect(toene(hole("B"))).toEqual(["B3", "D4", "F4"]);
  });

  it("nutzt deutsche Namen, also H statt B fuer den siebten Stammton", () => {
    expect(name(hole("H").grundton)).toBe("H");
    expect(toene(hole("Em"))).toEqual(["E4", "G4", "H4"]);
  });

  it("setzt jeden Ton auf seine eigene diatonische Stufe", () => {
    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        const stufen = akkord.toene.map((t) => t.diatonic);
        expect(new Set(stufen).size, akkord.symbol).toBe(stufen.length);
      }
    }
  });

  it("kommt ueberall ohne Doppelvorzeichen aus", () => {
    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        for (const ton of akkord.toene) {
          expect(Math.abs(ton.alteration), `${akkord.symbol} ${nameMitOktave(ton)}`)
            .toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("laesst Akkorde weg, die Doppelvorzeichen braeuchten", () => {
    // H-uebermaessig waere H, Dis, Fisis — den gibt es hier bewusst nicht.
    expect(baueAkkord(11, AKKORD_TYPEN.uebermaessig, "test")).toBeNull();
  });
});

describe("Umkehrungen haengen an der Akkordgroesse", () => {
  it("gibt dem Dreiklang zwei Umkehrungen", () => {
    expect(anzahlUmkehrungen(hole("C"))).toBe(2);
    expect(lagen(hole("C"))).toHaveLength(3);
  });

  it("gibt dem Vierklang drei Umkehrungen", () => {
    expect(anzahlUmkehrungen(hole("G7"))).toBe(3);
    expect(lagen(hole("G7"))).toHaveLength(4);
  });

  it("gibt dem Fuenfklang vier Umkehrungen", () => {
    expect(anzahlUmkehrungen(hole("C9"))).toBe(4);
    expect(lagen(hole("C9"))).toHaveLength(5);
  });

  it("legt beim Umkehren den untersten Ton nach oben", () => {
    expect(lage(hole("C"), 0).toene.map(name)).toEqual(["C", "E", "G"]);
    expect(lage(hole("C"), 1).toene.map(name)).toEqual(["E", "G", "C"]);
    expect(lage(hole("C"), 2).toene.map(name)).toEqual(["G", "C", "E"]);
  });

  it("legt jeden Griff in eine bequeme Lage statt immer weiter nach oben", () => {
    // Die zweite Umkehrung von C-Dur greift man als G3-C4-E4, nicht als
    // G4-C5-E5 eine Oktave darueber.
    expect(lage(hole("C"), 2).toene.map(nameMitOktave)).toEqual(["G3", "C4", "E4"]);

    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        for (const l of lagen(akkord)) {
          expect(l.toene[0].midi, lageBeschriftung(l)).toBeGreaterThanOrEqual(55);
          expect(l.toene[0].midi, lageBeschriftung(l)).toBeLessThanOrEqual(66);
        }
      }
    }
  });

  it("haelt auch weit gespannte Akkorde aufsteigend", () => {
    // Cadd9 reicht bis zur None: der umgelegte Grundton gehoert zwischen
    // die oberen Stimmen, nicht ans Ende.
    expect(lage(hole("Cadd9"), 1).toene.map(nameMitOktave)).toEqual([
      "E4",
      "G4",
      "C5",
      "D5",
    ]);
  });

  it("behaelt bei jeder Umkehrung dieselben Toene", () => {
    const grundklassen = new Set(hole("G7").toene.map((t) => t.midi % 12));
    for (let i = 0; i <= 3; i += 1) {
      const klassen = new Set(lage(hole("G7"), i).toene.map((t) => t.midi % 12));
      expect(klassen).toEqual(grundklassen);
    }
  });

  it("laesst sich auf gewuenschte Stellungen einschraenken", () => {
    expect(lagen(hole("G7"), [0, 2]).map((l) => l.umkehrung)).toEqual([0, 2]);
  });

  it("faellt auf die Grundstellung zurueck, wenn nichts Erlaubtes uebrig bleibt", () => {
    // Ein Dreiklang hat keine 3. Umkehrung.
    expect(lagen(hole("C"), [3]).map((l) => l.umkehrung)).toEqual([0]);
  });

  it("benennt die Stellungen verstaendlich", () => {
    expect(umkehrungName(0)).toBe("Grundstellung");
    expect(umkehrungName(3)).toBe("3. Umkehrung");
    expect(lageBeschriftung(lage(hole("Am"), 1))).toBe("Am, 1. Umkehrung");
  });
});

describe("Stimmfuehrung", () => {
  it("misst den Weg zwischen zwei Lagen", () => {
    expect(stimmabstand(lage(hole("C"), 0).toene, lage(hole("C"), 0).toene)).toBe(0);
    expect(
      stimmabstand(lage(hole("C"), 0).toene, lage(hole("C"), 1).toene),
    ).toBeGreaterThan(0);
  });

  it("beginnt die Folge in Grundstellung", () => {
    const plan = flottePlanung([hole("C"), hole("G"), hole("Am"), hole("F")]);
    expect(plan[0].umkehrung).toBe(0);
  });

  it("bewegt die Finger deutlich weniger als die reine Grundstellung", () => {
    const folge = [hole("C"), hole("G"), hole("Am"), hole("F"), hole("C")];
    const weg = (plan: ReturnType<typeof flottePlanung>) =>
      plan.slice(1).reduce((summe, l, i) => summe + stimmabstand(plan[i].toene, l.toene), 0);

    expect(weg(flottePlanung(folge))).toBeLessThan(weg(grundstellungsPlanung(folge)));
  });

  it("haelt jeden Schritt einer II-V-I-Folge klein", () => {
    const plan = flottePlanung([hole("Dm7"), hole("G7"), hole("Cmaj7")]);
    for (let i = 1; i < plan.length; i += 1) {
      // Kein Sprung ueber eine Quinte je Stimme.
      for (let stimme = 0; stimme < plan[i].toene.length; stimme += 1) {
        const abstand = Math.abs(plan[i].toene[stimme].midi - plan[i - 1].toene[stimme].midi);
        expect(abstand, `${plan[i - 1].akkord.symbol} → ${plan[i].akkord.symbol}`)
          .toBeLessThanOrEqual(7);
      }
    }
  });

  it("beachtet die erlaubten Umkehrungen", () => {
    const plan = flottePlanung([hole("C"), hole("G"), hole("F")], [0]);
    expect(plan.every((l) => l.umkehrung === 0)).toBe(true);
  });
});

describe("Pakete", () => {
  it("nummeriert die Stufen aufsteigend", () => {
    const stufen = AKKORD_PAKETE.map((p) => p.stufe);
    expect(stufen).toEqual([...stufen].sort((a, b) => a - b));
  });

  it("beginnt mit den sieben Einsteiger-Akkorden", () => {
    const erste = akkordeImPaket(AKKORD_PAKETE[0]).map((a) => a.symbol);
    expect(erste).toEqual(["C", "G", "D", "F", "Am", "Em", "Dm"]);
  });

  it("liefert alle zwoelf Dur- und Molldreiklaenge", () => {
    const alle = akkordeImPaket(AKKORD_PAKETE[1]);
    expect(alle).toHaveLength(24);
  });

  it("fuehrt jedes Paket zu spielbaren Akkorden", () => {
    for (const paket of AKKORD_PAKETE) {
      expect(akkordeImPaket(paket).length, paket.id).toBeGreaterThan(0);
    }
  });

  it("entfernt Doppelte ueber Paketgrenzen hinweg", () => {
    const symbole = akkordeAusPaketen(["dreiklaenge-erste", "dur-moll-komplett"]).map(
      (a) => a.symbol,
    );
    expect(new Set(symbole).size).toBe(symbole.length);
  });

  it("ignoriert unbekannte Paket-IDs", () => {
    expect(akkordeAusPaketen(["gibtsnicht"])).toEqual([]);
  });
});

describe("Lage der Akkorde auf der Tastatur", () => {
  it("haelt die Grundstellung um das mittlere C herum", () => {
    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        expect(akkord.grundton.midi, akkord.symbol).toBeGreaterThanOrEqual(55);
        expect(akkord.grundton.midi, akkord.symbol).toBeLessThanOrEqual(66);
      }
    }
  });

  it("staffelt die Toene jeder Lage aufsteigend", () => {
    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        for (const l of lagen(akkord)) {
          const midis = l.toene.map((t) => t.midi);
          expect([...midis].sort((a, b) => a - b), lageBeschriftung(l)).toEqual(midis);
        }
      }
    }
  });
});

describe("Griff ins gewaehlte System legen", () => {
  const hilfslinienZahl = (toene: ReturnType<typeof lage>["toene"], schluessel: "violin" | "bass") =>
    toene.reduce((summe, t) => summe + hilfslinien(linienPosition(t, schluessel)).length, 0);

  it("legt C-Dur fuer den Bassschluessel eine Oktave tiefer", () => {
    const gelegt = inSystem(hole("C").toene, "bass");
    expect(gelegt.map(nameMitOktave)).toEqual(["C3", "E3", "G3"]);
  });

  it("laesst C-Dur im Violinschluessel, wo es ist", () => {
    expect(inSystem(hole("C").toene, "violin").map(nameMitOktave)).toEqual(["C4", "E4", "G4"]);
  });

  it("laesst dem C-Dur seine vertraute Hilfslinie, statt eine Oktave zu springen", () => {
    // Eine einzelne Hilfslinie ist kein Grund, den Akkord zu verschieben.
    expect(hilfslinienZahl(inSystem(hole("C").toene, "violin"), "violin")).toBe(1);
  });

  it("verringert die Hilfslinien in jedem System", () => {
    for (const schluessel of ["violin", "bass"] as const) {
      for (const paket of AKKORD_PAKETE) {
        for (const akkord of akkordeImPaket(paket)) {
          for (const l of lagen(akkord)) {
            const vorher = hilfslinienZahl(l.toene, schluessel);
            const nachher = hilfslinienZahl(inSystem(l.toene, schluessel), schluessel);
            expect(nachher, `${lageBeschriftung(l)} ${schluessel}`).toBeLessThanOrEqual(vorher);
          }
        }
      }
    }
  });

  it("behaelt die Toene, nur eine Oktave versetzt", () => {
    const grund = hole("G7").toene;
    const gelegt = inSystem(grund, "bass");
    expect(gelegt.map((t) => t.midi % 12)).toEqual(grund.map((t) => t.midi % 12));
    const versatz = gelegt[0].midi - grund[0].midi;
    expect(Math.abs(versatz) % 12).toBe(0);
    expect(gelegt.every((t, i) => t.midi - grund[i].midi === versatz)).toBe(true);
  });

});

describe("Griff auf die Haende verteilen", () => {
  it("gibt einer Hand den ganzen Griff, in ihrer Lage", () => {
    expect(griffFuerHaende(hole("C").toene, "rechts").noten.map(nameMitOktave)).toEqual([
      "C4",
      "E4",
      "G4",
    ]);
    expect(griffFuerHaende(hole("C").toene, "links").noten.map(nameMitOktave)).toEqual([
      "C3",
      "E3",
      "G3",
    ]);
  });

  it("laesst die andere Hand dabei leer", () => {
    expect(griffFuerHaende(hole("C").toene, "rechts").links).toEqual([]);
    expect(griffFuerHaende(hole("C").toene, "links").rechts).toEqual([]);
  });

  it("verdoppelt einen engen Griff eine Oktave tiefer", () => {
    const beide = griffFuerHaende(hole("C").toene, "beide");
    expect(beide.links.map(nameMitOktave)).toEqual(["C3", "E3", "G3"]);
    expect(beide.rechts.map(nameMitOktave)).toEqual(["C4", "E4", "G4"]);
    expect(beide.noten).toHaveLength(6);
  });

  it("gibt der linken Hand nur den Basston, wenn der Griff weiter als eine Oktave reicht", () => {
    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        for (const l of lagen(akkord)) {
          const { links, rechts } = griffFuerHaende(l.toene, "beide");
          const spanne = rechts[rechts.length - 1].midi - rechts[0].midi;
          expect(links.length, lageBeschriftung(l)).toBe(spanne < 12 ? rechts.length : 1);
        }
      }
    }
  });

  it("laesst die Haende nie ineinandergreifen", () => {
    for (const paket of AKKORD_PAKETE) {
      for (const akkord of akkordeImPaket(paket)) {
        for (const l of lagen(akkord)) {
          const { links, rechts } = griffFuerHaende(l.toene, "beide");
          expect(
            links[links.length - 1].midi,
            lageBeschriftung(l),
          ).toBeLessThan(rechts[0].midi);
        }
      }
    }
  });

  it("trennt die Systeme genau zwischen den Haenden", () => {
    for (const haende of ["rechts", "links", "beide"] as const) {
      for (const paket of AKKORD_PAKETE) {
        for (const akkord of akkordeImPaket(paket)) {
          for (const l of lagen(akkord)) {
            const griff = griffFuerHaende(l.toene, haende);
            const wo = `${haende}: ${lageBeschriftung(l)}`;
            for (const ton of griff.links) {
              expect(schluesselAn(ton.midi, griff.bassGrenze), wo).toBe("bass");
            }
            for (const ton of griff.rechts) {
              expect(schluesselAn(ton.midi, griff.bassGrenze), wo).toBe("violin");
            }
          }
        }
      }
    }
  });

  it("behaelt die Toene, nur oktavweise versetzt", () => {
    for (const haende of ["rechts", "links", "beide"] as const) {
      for (const l of lagen(hole("G7"))) {
        const klassen = new Set(l.toene.map((t) => ((t.midi % 12) + 12) % 12));
        for (const ton of griffFuerHaende(l.toene, haende).noten) {
          expect(klassen.has(((ton.midi % 12) + 12) % 12), haende).toBe(true);
        }
      }
    }
  });
});

describe("Stellungswahl", () => {
  it("nimmt genau die gewaehlte Stellung, nicht mehr", () => {
    const dreiklang = hole("C");
    expect(stellungenVon(dreiklang, 0)).toEqual([0]);
    expect(stellungenVon(dreiklang, 1)).toEqual([1]);
    expect(stellungenVon(dreiklang, 2)).toEqual([2]);
  });

  it("geht bei \"alle\" der Reihe nach durch", () => {
    expect(stellungenVon(hole("C"), "alle")).toEqual([0, 1, 2]);
    expect(stellungenVon(hole("G7"), "alle")).toEqual([0, 1, 2, 3]);
  });

  it("stutzt eine Stellung, die es bei diesem Akkord nicht gibt", () => {
    // Ein Dreiklang hat keine dritte Umkehrung — dann eben die hoechste, die
    // er hat, statt eines Sprungs zurueck auf die Grundstellung.
    expect(wirksameStellung(hole("C"), 3)).toBe(2);
    expect(stellungenVon(hole("C"), 3)).toEqual([2]);
    expect(wirksameStellung(hole("G7"), 3)).toBe(3);
  });

  it("laesst gueltige Wahlen unangetastet", () => {
    for (const stellung of [0, 1, 2] as const) {
      expect(wirksameStellung(hole("C"), stellung)).toBe(stellung);
    }
    expect(wirksameStellung(hole("C"), "alle")).toBe("alle");
  });
});
