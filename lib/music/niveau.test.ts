import { describe, expect, it } from "vitest";
import {
  NIVEAUS,
  NIVEAU_REIHE,
  type Niveau,
  akkordZiel,
  akkordeBis,
  akkordeNachNiveau,
  akkordeVon,
  alleAkkorde,
  fortschritt,
  gesamtFortschritt,
  lernziele,
  notenZiel,
  nurWeisseTasten,
} from "./niveau";

describe("Aufbau der Niveaus", () => {
  it("kennt genau drei Stufen in aufsteigender Reihenfolge", () => {
    expect(NIVEAU_REIHE).toEqual(["anfaenger", "fortgeschritten", "profi"]);
    expect(NIVEAUS.map((s) => s.id)).toEqual(NIVEAU_REIHE);
  });

  it("verteilt die Tastenwahl auf die beiden unteren Stufen", () => {
    expect(NIVEAUS[0].noten.map((z) => z.tasten)).toEqual(["weiss"]);
    expect(NIVEAUS[1].noten.map((z) => z.tasten)).toEqual(["alle"]);
    // Der Profi bringt keine neuen Tasten mit — es gibt keine mehr.
    expect(NIVEAUS[2].noten).toEqual([]);
  });
});

describe("Der Plan waechst mit dem Niveau", () => {
  it("enthaelt auf jeder Stufe alles von der Stufe darunter", () => {
    for (let i = 1; i < NIVEAU_REIHE.length; i += 1) {
      const unten = akkordeBis(NIVEAU_REIHE[i - 1]).map((a) => a.id);
      const oben = new Set(akkordeBis(NIVEAU_REIHE[i]).map((a) => a.id));
      for (const id of unten) expect(oben.has(id), `${id} fehlt oben`).toBe(true);
    }
  });

  it("legt jeden Akkord auf genau ein Niveau", () => {
    const verteilt = NIVEAU_REIHE.flatMap((n) => akkordeVon(n).map((a) => a.id));
    expect(new Set(verteilt).size).toBe(verteilt.length);
    expect(new Set(verteilt)).toEqual(new Set(alleAkkorde().map((a) => a.id)));
  });

  it("haelt den Anfaenger auf den weissen Tasten", () => {
    for (const akkord of akkordeVon("anfaenger")) {
      expect(nurWeisseTasten(akkord), akkord.symbol).toBe(true);
    }
  });

  it("faengt mit den sechs Dreiklaengen ohne Vorzeichen an", () => {
    expect(akkordeVon("anfaenger").map((a) => a.symbol).sort()).toEqual(
      ["Am", "C", "Dm", "Em", "F", "G"].sort(),
    );
  });

  it("bringt insgesamt reichlich Akkorde mit", () => {
    expect(alleAkkorde().length).toBeGreaterThan(80);
  });
});

describe("Alle Akkorde stehen zur Auswahl", () => {
  it("zeigt jeden Akkord genau einmal, nach Niveau und Paket geordnet", () => {
    const gezeigt = akkordeNachNiveau().flatMap((n) =>
      n.pakete.flatMap((p) => p.akkorde.map((a) => a.id)),
    );
    expect(new Set(gezeigt).size).toBe(gezeigt.length);
    expect(new Set(gezeigt)).toEqual(new Set(alleAkkorde().map((a) => a.id)));
  });

  it("laesst keine leere Gruppe stehen", () => {
    for (const niveau of akkordeNachNiveau()) {
      expect(niveau.pakete.length, niveau.titel).toBeGreaterThan(0);
      for (const paket of niveau.pakete) {
        expect(paket.akkorde.length, paket.titel).toBeGreaterThan(0);
      }
    }
  });
});

describe("Lernziele", () => {
  it("nennt jedes Ziel nur auf seinem eigenen Niveau", () => {
    const alle = NIVEAU_REIHE.flatMap((n) => lernziele(n).map((z) => z.id));
    expect(new Set(alle).size).toBe(alle.length);
  });

  it("stellt die Noten vor die Akkorde", () => {
    for (const niveau of ["anfaenger", "fortgeschritten"] as Niveau[]) {
      expect(lernziele(niveau)[0].art).toBe("noten");
    }
  });

  it("zaehlt nur, was wirklich abgehakt ist", () => {
    const ziele = lernziele("anfaenger");
    expect(fortschritt("anfaenger", []).geschafft).toBe(0);
    expect(fortschritt("anfaenger", [ziele[0].id]).geschafft).toBe(1);
    // Ein Haken, den es im Plan nicht gibt, zaehlt nicht mit.
    expect(fortschritt("anfaenger", ["akkord:gibtsnicht"]).geschafft).toBe(0);
  });

  it("meldet ein volles Niveau als vollstaendig", () => {
    const alle = lernziele("anfaenger").map((z) => z.id);
    expect(fortschritt("anfaenger", alle).vollstaendig).toBe(true);
    expect(fortschritt("anfaenger", alle.slice(1)).vollstaendig).toBe(false);
  });

  it("summiert alle drei Stufen zum Gesamtstand", () => {
    const alle = NIVEAU_REIHE.flatMap((n) => lernziele(n).map((z) => z.id));
    const gesamt = gesamtFortschritt(alle);
    expect(gesamt.gesamt).toBe(alle.length);
    expect(gesamt.vollstaendig).toBe(true);
  });

  it("baut die Kennungen stabil auf", () => {
    expect(notenZiel("weiss")).toBe("noten:weiss");
    expect(akkordZiel("Am")).toBe("akkord:Am");
    expect(lernziele("anfaenger").map((z) => z.id)).toContain("noten:weiss");
    expect(lernziele("anfaenger").map((z) => z.id)).toContain(akkordZiel("C"));
  });
});
