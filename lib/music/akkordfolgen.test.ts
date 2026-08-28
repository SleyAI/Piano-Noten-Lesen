import { describe, expect, it } from "vitest";
import {
  AKKORDFOLGEN,
  akkordeDerFolge,
  benoetigteAkkorde,
  fehlendeAkkorde,
  folgeSpielbar,
  folgeUm,
  passendeAkkorde,
  wuerfleFolge,
} from "./akkordfolgen";
import {
  akkordNachSymbol,
  akkordeAusPaketen,
  flottePlanung,
  stimmabstand,
} from "./akkorde";

describe("Aufbau der Folgen", () => {
  it("vergibt eindeutige IDs", () => {
    const ids = AKKORDFOLGEN.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("kennt jeden verwendeten Akkord", () => {
    for (const folge of AKKORDFOLGEN) {
      expect(() => akkordeDerFolge(folge), folge.id).not.toThrow();
    }
  });

  it("besteht aus mindestens drei Akkorden", () => {
    for (const folge of AKKORDFOLGEN) {
      expect(folge.symbole.length, folge.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("Freischalten anhand der Akkordauswahl", () => {
  const einsteiger = new Set(akkordeAusPaketen(["dreiklaenge-erste"]).map((a) => a.symbol));

  it("gibt die Einsteiger-Kadenzen frei", () => {
    const stufe1 = AKKORDFOLGEN.filter((f) => f.stufe === 1);
    for (const folge of stufe1) {
      expect(folgeSpielbar(folge, einsteiger), folge.id).toBe(true);
    }
  });

  it("haelt Jazz-Folgen zurueck, solange die Vierklaenge fehlen", () => {
    const jazz = AKKORDFOLGEN.find((f) => f.id === "ii-V-I-C")!;
    expect(folgeSpielbar(jazz, einsteiger)).toBe(false);
    expect(fehlendeAkkorde(jazz, einsteiger)).toEqual(["Dm7", "G7", "Cmaj7"]);
  });

  it("gibt sie frei, sobald die passenden Pakete dazukommen", () => {
    const mitVierklaengen = new Set(
      akkordeAusPaketen(["dreiklaenge-erste", "dominantsept", "maj7-m7"]).map((a) => a.symbol),
    );
    const jazz = AKKORDFOLGEN.find((f) => f.id === "ii-V-I-C")!;
    expect(folgeSpielbar(jazz, mitVierklaengen)).toBe(true);
    expect(fehlendeAkkorde(jazz, mitVierklaengen)).toEqual([]);
  });

  it("zaehlt jeden Akkord nur einmal, auch wenn er wiederkehrt", () => {
    const kadenz = AKKORDFOLGEN.find((f) => f.id === "I-IV-V-I")!;
    expect(kadenz.symbole).toHaveLength(4);
    expect(benoetigteAkkorde(kadenz)).toEqual(["C", "F", "G"]);
  });
});

describe("Stimmfuehrung in den Folgen", () => {
  it("haelt die Finger in jeder Folge ruhiger als die reine Grundstellung", () => {
    const weg = (plan: ReturnType<typeof flottePlanung>) =>
      plan.slice(1).reduce((summe, l, i) => summe + stimmabstand(plan[i].toene, l.toene), 0);

    for (const folge of AKKORDFOLGEN) {
      const akkorde = akkordeDerFolge(folge);
      const flott = weg(flottePlanung(akkorde));
      const schlicht = weg(akkorde.map((a) => ({ akkord: a, umkehrung: 0, toene: a.toene })));
      expect(flott, folge.id).toBeLessThanOrEqual(schlicht);
    }
  });

  it("laesst in keiner Folge einen Sprung ueber eine Oktave zu", () => {
    for (const folge of AKKORDFOLGEN) {
      const plan = flottePlanung(akkordeDerFolge(folge));
      for (let i = 1; i < plan.length; i += 1) {
        const gemeinsam = Math.min(plan[i].toene.length, plan[i - 1].toene.length);
        for (let stimme = 0; stimme < gemeinsam; stimme += 1) {
          const abstand = Math.abs(
            plan[i].toene[stimme].midi - plan[i - 1].toene[stimme].midi,
          );
          expect(abstand, `${folge.id}: Schritt ${i}`).toBeLessThan(12);
        }
      }
    }
  });
});

// --- Selbst erzeugte Folgen -------------------------------------------------

describe("Passende Akkorde finden", () => {
  const akkord = (symbol: string) => {
    const a = akkordNachSymbol(symbol);
    if (!a) throw new Error(`Testakkord fehlt: ${symbol}`);
    return a;
  };

  it("nennt zu C die uebrigen Stufen von C-Dur", () => {
    const symbole = passendeAkkorde(akkord("C")).map((a) => a.symbol);
    expect(symbole).toEqual(["C", "Dm", "Em", "F", "G", "Am"]);
  });

  it("liest a-Moll als Parallele von C-Dur", () => {
    const symbole = passendeAkkorde(akkord("Am")).map((a) => a.symbol);
    expect(symbole[0]).toBe("Am");
    expect(symbole).toContain("C");
    expect(symbole).toContain("F");
    expect(symbole).toContain("G");
  });

  it("liest G7 als Dominante von C-Dur", () => {
    const symbole = passendeAkkorde(akkord("G7")).map((a) => a.symbol);
    expect(symbole[0]).toBe("G7");
    expect(symbole).toContain("C");
    expect(symbole).toContain("Dm");
  });

  it("stellt den Akkord selbst nach vorn und nennt ihn nur einmal", () => {
    for (const symbol of ["C", "Am", "F", "G7", "Dm7", "Es"]) {
      const liste = passendeAkkorde(akkord(symbol));
      expect(liste[0].symbol).toBe(symbol);
      expect(new Set(liste.map((a) => a.id)).size).toBe(liste.length);
    }
  });
});

describe("Folge um einen Akkord herum", () => {
  const akkord = (symbol: string) => {
    const a = akkordNachSymbol(symbol);
    if (!a) throw new Error(`Testakkord fehlt: ${symbol}`);
    return a;
  };

  const PRUEFLINGE = ["C", "G", "F", "Am", "Dm", "Em", "G7", "Cmaj7", "Es"];

  it("faengt immer mit dem gewaehlten Akkord an", () => {
    for (const symbol of PRUEFLINGE) {
      for (let i = 0; i < 20; i += 1) {
        expect(folgeUm(akkord(symbol))[0].symbol, symbol).toBe(symbol);
      }
    }
  });

  it("liefert mindestens drei Akkorde", () => {
    for (const symbol of PRUEFLINGE) {
      for (let i = 0; i < 20; i += 1) {
        expect(folgeUm(akkord(symbol)).length, symbol).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("bleibt in einem vorgegebenen Vorrat", () => {
    // Der Anfaengervorrat: sechs Dreiklaenge ohne jedes Vorzeichen.
    const erlaubt = new Set(["C", "Dm", "Em", "F", "G", "Am"]);
    for (const symbol of ["C", "F", "G", "Am", "Dm", "Em"]) {
      for (let i = 0; i < 20; i += 1) {
        const folge = folgeUm(akkord(symbol), erlaubt);
        expect(folge.length, symbol).toBeGreaterThanOrEqual(3);
        for (const a of folge) expect(erlaubt.has(a.id), `${symbol} → ${a.symbol}`).toBe(true);
      }
    }
  });

  it("baut aus C eine Kette, die in C-Dur zu Hause ist", () => {
    const heimisch = new Set(["C", "Dm", "Em", "F", "G", "Am"]);
    for (let i = 0; i < 30; i += 1) {
      for (const a of folgeUm(akkord("C"))) expect(heimisch.has(a.symbol)).toBe(true);
    }
  });
});

describe("Folge aus frei gewaehlten Akkorden", () => {
  const vorrat = ["C", "F", "G", "Am"].map((symbol) => {
    const a = akkordNachSymbol(symbol);
    if (!a) throw new Error(`Testakkord fehlt: ${symbol}`);
    return a;
  });

  it("nimmt nur Akkorde aus dem Vorrat", () => {
    const erlaubt = new Set(vorrat.map((a) => a.id));
    for (let i = 0; i < 50; i += 1) {
      for (const a of wuerfleFolge(vorrat)) expect(erlaubt.has(a.id)).toBe(true);
    }
  });

  it("bringt jeden gewaehlten Akkord unter, wenn sie in die Laenge passen", () => {
    for (let i = 0; i < 50; i += 1) {
      const folge = wuerfleFolge(vorrat);
      expect(new Set(folge.map((a) => a.id)).size).toBe(vorrat.length);
    }
  });

  it("wiederholt keinen Akkord direkt hintereinander", () => {
    for (let i = 0; i < 50; i += 1) {
      const folge = wuerfleFolge(vorrat, 6);
      for (let k = 1; k < folge.length; k += 1) {
        expect(folge[k].id, folge.map((a) => a.symbol).join("-")).not.toBe(folge[k - 1].id);
      }
    }
  });

  it("kommt mit einem einzigen Akkord und mit gar keinem klar", () => {
    expect(wuerfleFolge([vorrat[0]])).toHaveLength(1);
    expect(wuerfleFolge([])).toEqual([]);
  });
});
