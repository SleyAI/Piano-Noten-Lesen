/**
 * Eine Note wird gespielt — egal ob am E-Piano oder mit dem Finger.
 *
 * Die Uebungsmodi kennen ausschliesslich diesen Ereignisstrom. Dadurch
 * funktioniert dieselbe Uebungslogik am Klavier, am Tablet und am Rechner,
 * ohne dass irgendwo eine Fallunterscheidung noetig waere.
 */

export type Eingabequelle = "midi" | "tippen";

export interface NotenEreignis {
  art: "an" | "aus";
  /** MIDI-Notennummer, C4 = 60. */
  midi: number;
  /** Anschlagstaerke von 0 bis 1. Getippte Noten liefern einen festen Wert. */
  anschlag: number;
  quelle: Eingabequelle;
}

export type Hoerer = (ereignis: NotenEreignis) => void;
export type Abmelden = () => void;

export interface EingabeQuelle {
  abonnieren(hoerer: Hoerer): Abmelden;
}

/** Kleiner Verteiler, den beide Quellen benutzen. */
export function erzeugeVerteiler() {
  const hoerer = new Set<Hoerer>();

  return {
    abonnieren(h: Hoerer): Abmelden {
      hoerer.add(h);
      return () => hoerer.delete(h);
    },
    senden(ereignis: NotenEreignis) {
      for (const h of hoerer) h(ereignis);
    },
    get anzahlHoerer() {
      return hoerer.size;
    },
  };
}
