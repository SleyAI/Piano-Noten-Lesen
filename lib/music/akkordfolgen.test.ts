import { describe, expect, it } from "vitest";
import {
  AKKORDFOLGEN,
  akkordeDerFolge,
  benoetigteAkkorde,
  fehlendeAkkorde,
  folgeSpielbar,
} from "./akkordfolgen";
import { akkordeAusPaketen, flottePlanung, stimmabstand } from "./akkorde";

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
