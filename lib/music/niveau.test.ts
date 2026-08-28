import { describe, expect, it } from "vitest";
import {
  NIVEAUS,
  NIVEAU_REIHE,
  type Niveau,
  akkordZiel,
  akkordeNachPaket,
  erlaubteAkkorde,
  erlaubteNotenPakete,
  fortschritt,
  lernziele,
  naechstesNiveau,
  notenZiel,
  nurWeisseTasten,
} from "./niveau";
import { NOTEN_PAKETE } from "./curriculum";

describe("Aufbau der Niveaus", () => {
  it("kennt genau drei Stufen in aufsteigender Reihenfolge", () => {
    expect(NIVEAU_REIHE).toEqual(["anfaenger", "fortgeschritten", "profi"]);
    expect(NIVEAUS.map((s) => s.id)).toEqual(NIVEAU_REIHE);
  });

  it("fuehrt vom Anfaenger zum Profi und dort nicht weiter", () => {
    expect(naechstesNiveau("anfaenger")).toBe("fortgeschritten");
    expect(naechstesNiveau("fortgeschritten")).toBe("profi");
    expect(naechstesNiveau("profi")).toBeNull();
  });

  it("verteilt jedes Notenpaket auf genau ein Niveau", () => {
    const verteilt = NIVEAU_REIHE.flatMap((n) => NIVEAUS.find((s) => s.id === n)!.notenPakete);
    expect(new Set(verteilt).size).toBe(verteilt.length);
    expect(new Set(verteilt)).toEqual(new Set(NOTEN_PAKETE.map((p) => p.id)));
  });
});

describe("Der Vorrat waechst mit dem Niveau", () => {
  it("enthaelt auf jeder Stufe alles von der Stufe darunter", () => {
    for (let i = 1; i < NIVEAU_REIHE.length; i += 1) {
      const unten = erlaubteAkkorde(NIVEAU_REIHE[i - 1]).map((a) => a.id);
      const oben = new Set(erlaubteAkkorde(NIVEAU_REIHE[i]).map((a) => a.id));
      for (const id of unten) expect(oben.has(id), id).toBe(true);

      const notenUnten = erlaubteNotenPakete(NIVEAU_REIHE[i - 1]).map((p) => p.id);
      const notenOben = new Set(erlaubteNotenPakete(NIVEAU_REIHE[i]).map((p) => p.id));
      for (const id of notenUnten) expect(notenOben.has(id), id).toBe(true);
    }
  });

  it("waechst bei jedem Schritt echt an", () => {
    for (let i = 1; i < NIVEAU_REIHE.length; i += 1) {
      expect(erlaubteAkkorde(NIVEAU_REIHE[i]).length).toBeGreaterThan(
        erlaubteAkkorde(NIVEAU_REIHE[i - 1]).length,
      );
    }
  });

  it("gibt dem Profi jeden Akkord aus jedem Paket", () => {
    expect(erlaubteAkkorde("profi").length).toBeGreaterThan(80);
  });
});

describe("Anfaenger bleiben auf den weissen Tasten", () => {
  it("bietet keinen Akkord mit Vorzeichen an", () => {
    for (const akkord of erlaubteAkkorde("anfaenger")) {
      expect(nurWeisseTasten(akkord), akkord.symbol).toBe(true);
    }
  });

  it("bietet genau die sechs Stammton-Dreiklaenge an", () => {
    expect(erlaubteAkkorde("anfaenger").map((a) => a.symbol).sort()).toEqual(
      ["Am", "C", "Dm", "Em", "F", "G"].sort(),
    );
  });

  it("bietet keine Note mit Vorzeichen an", () => {
    for (const paket of erlaubteNotenPakete("anfaenger")) {
      for (const note of [...paket.violin, ...paket.bass]) {
        expect(note.alteration, `${paket.id} ${note.stufe}${note.oktave}`).toBe(0);
      }
    }
  });

  it("laesst die schwarzen Tasten erst ab Fortgeschritten zu", () => {
    const alteriert = (niveau: Niveau) =>
      erlaubteNotenPakete(niveau).some((p) =>
        [...p.violin, ...p.bass].some((n) => n.alteration !== 0),
      );
    expect(alteriert("anfaenger")).toBe(false);
    expect(alteriert("fortgeschritten")).toBe(true);
  });
});

describe("Lernziele", () => {
  it("vergibt eindeutige IDs innerhalb eines Niveaus", () => {
    for (const niveau of NIVEAU_REIHE) {
      const ids = lernziele(niveau).map((z) => z.id);
      expect(new Set(ids).size, niveau).toBe(ids.length);
    }
  });

  it("zaehlt kein Ziel auf zwei Niveaus", () => {
    const alle = NIVEAU_REIHE.flatMap((n) => lernziele(n).map((z) => z.id));
    expect(new Set(alle).size).toBe(alle.length);
  });

  it("nennt beim Anfaenger seine Notenpakete und seine Akkorde", () => {
    const ziele = lernziele("anfaenger");
    expect(ziele.filter((z) => z.art === "noten")).toHaveLength(
      erlaubteNotenPakete("anfaenger").length,
    );
    expect(ziele.filter((z) => z.art === "akkord")).toHaveLength(
      erlaubteAkkorde("anfaenger").length,
    );
    expect(ziele.map((z) => z.id)).toContain(notenZiel("mitte"));
    expect(ziele.map((z) => z.id)).toContain(akkordZiel("C"));
  });

  it("haelt die Anfaengerliste kurz genug zum Durchsehen", () => {
    expect(lernziele("anfaenger").length).toBeLessThanOrEqual(15);
  });
});

describe("Fortschritt", () => {
  it("faengt bei nichts an", () => {
    const stand = fortschritt("anfaenger", []);
    expect(stand.geschafft).toBe(0);
    expect(stand.vollstaendig).toBe(false);
  });

  it("ist voll, wenn alle Ziele abgehakt sind", () => {
    const alle = lernziele("anfaenger").map((z) => z.id);
    const stand = fortschritt("anfaenger", alle);
    expect(stand.geschafft).toBe(stand.gesamt);
    expect(stand.vollstaendig).toBe(true);
  });

  it("zaehlt Haken anderer Niveaus nicht mit", () => {
    const fremde = lernziele("profi").map((z) => z.id);
    expect(fortschritt("anfaenger", fremde).geschafft).toBe(0);
  });
});

describe("Nach Paketen gruppiert", () => {
  it("zeigt jeden Akkord genau einmal", () => {
    for (const niveau of NIVEAU_REIHE) {
      const gezeigt = akkordeNachPaket(niveau).flatMap((g) => g.akkorde.map((a) => a.id));
      expect(new Set(gezeigt).size, niveau).toBe(gezeigt.length);
      expect(new Set(gezeigt)).toEqual(new Set(erlaubteAkkorde(niveau).map((a) => a.id)));
    }
  });

  it("laesst leere Gruppen weg", () => {
    for (const gruppe of akkordeNachPaket("anfaenger")) {
      expect(gruppe.akkorde.length).toBeGreaterThan(0);
    }
  });
});
