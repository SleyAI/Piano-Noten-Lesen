"use client";

/**
 * Einstellungen und Auswahl der Uebungsinhalte.
 *
 * Alles liegt im localStorage — kein Konto, kein Server. Beim naechsten Start
 * ist die Auswahl wieder da.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { START_PAKETE } from "@/lib/music/curriculum";

/** Woher kommen die Toene und wohin geht die Eingabe? */
export type Spielweise =
  /** Unterwegs: Klaviatur auf dem Bildschirm, Klang aus der App. */
  | "tippen"
  /** Zuhause: Eingabe und Klang kommen vom E-Piano. */
  | "piano";

export interface EinstellungsZustand {
  spielweise: Spielweise;
  /** Auch im Piano-Modus die Klaviatur einblenden — als Spickzettel. */
  klaviaturImmerZeigen: boolean;
  klangAn: boolean;

  /** Gewaehlte Landmark-Stufen fuer Noten und Melodien. */
  notenPakete: string[];
  /** Gewaehlte Akkord-Stufen. */
  akkordPakete: string[];
  /** Einzeln abgewaehlte Akkorde innerhalb der aktiven Pakete. */
  abgewaehlteAkkorde: string[];
  /** Welche Stellungen geuebt werden: 0 = Grundstellung, 1..3 = Umkehrungen. */
  umkehrungen: number[];
  /** Stand vor der letzten Aenderung — erlaubt ein Zurueck nach dem Herumprobieren. */
  vorherigeAkkordAuswahl: { pakete: string[]; abgewaehlt: string[] } | null;

  setzeSpielweise: (s: Spielweise) => void;
  schalteKlaviatur: () => void;
  schalteKlang: () => void;
  setzeNotenPakete: (ids: string[]) => void;
  schalteNotenPaket: (id: string) => void;
  setzeAkkordPakete: (ids: string[]) => void;
  schalteAkkordPaket: (id: string) => void;
  schalteAkkord: (id: string) => void;
  schalteUmkehrung: (stufe: number) => void;
  setzeAkkordAuswahl: (pakete: string[], abgewaehlt: string[]) => void;
  akkordAuswahlZurueck: () => void;
}

/** Aus einer Liste entfernen oder hinzufuegen, aber nie alles leeren. */
function umschalten(liste: string[], id: string, mindestensEines: boolean): string[] {
  if (liste.includes(id)) {
    const rest = liste.filter((x) => x !== id);
    return mindestensEines && rest.length === 0 ? liste : rest;
  }
  return [...liste, id];
}

/** Merkt sich den Stand vor einer Aenderung. */
function schnappschuss(z: EinstellungsZustand) {
  return { pakete: [...z.akkordPakete], abgewaehlt: [...z.abgewaehlteAkkorde] };
}

export const useEinstellungen = create<EinstellungsZustand>()(
  persist(
    (set) => ({
      spielweise: "tippen",
      klaviaturImmerZeigen: false,
      klangAn: true,

      notenPakete: [...START_PAKETE],
      akkordPakete: ["dreiklaenge-erste"],
      abgewaehlteAkkorde: [],
      umkehrungen: [0, 1, 2],
      vorherigeAkkordAuswahl: null,

      setzeSpielweise: (spielweise) => set({ spielweise }),
      schalteKlaviatur: () =>
        set((z) => ({ klaviaturImmerZeigen: !z.klaviaturImmerZeigen })),
      schalteKlang: () => set((z) => ({ klangAn: !z.klangAn })),

      setzeNotenPakete: (notenPakete) => set({ notenPakete }),
      schalteNotenPaket: (id) =>
        set((z) => ({ notenPakete: umschalten(z.notenPakete, id, true) })),

      setzeAkkordPakete: (akkordPakete) =>
        set((z) => ({ akkordPakete, vorherigeAkkordAuswahl: schnappschuss(z) })),

      schalteAkkordPaket: (id) =>
        set((z) => ({
          akkordPakete: umschalten(z.akkordPakete, id, true),
          vorherigeAkkordAuswahl: schnappschuss(z),
        })),

      schalteAkkord: (id) =>
        set((z) => ({
          abgewaehlteAkkorde: umschalten(z.abgewaehlteAkkorde, id, false),
          vorherigeAkkordAuswahl: schnappschuss(z),
        })),

      schalteUmkehrung: (stufe) =>
        set((z) => {
          const drin = z.umkehrungen.includes(stufe);
          const neu = drin ? z.umkehrungen.filter((s) => s !== stufe) : [...z.umkehrungen, stufe];
          // Ganz ohne Stellung gaebe es nichts zu ueben.
          return neu.length === 0 ? z : { umkehrungen: neu.sort((a, b) => a - b) };
        }),

      setzeAkkordAuswahl: (akkordPakete, abgewaehlteAkkorde) =>
        set((z) => ({
          akkordPakete,
          abgewaehlteAkkorde,
          vorherigeAkkordAuswahl: schnappschuss(z),
        })),

      akkordAuswahlZurueck: () =>
        set((z) =>
          z.vorherigeAkkordAuswahl
            ? {
                akkordPakete: z.vorherigeAkkordAuswahl.pakete,
                abgewaehlteAkkorde: z.vorherigeAkkordAuswahl.abgewaehlt,
                vorherigeAkkordAuswahl: schnappschuss(z),
              }
            : z,
        ),
    }),
    {
      name: "noten-einstellungen",
      version: 1,
    },
  ),
);
