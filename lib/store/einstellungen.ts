"use client";

/**
 * Einstellungen und Auswahl der Uebungsinhalte.
 *
 * Alles liegt im localStorage — kein Konto, kein Server. Beim naechsten Start
 * ist die Auswahl wieder da.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type SchluesselWahl, type Tastenwahl } from "@/lib/music/curriculum";
import type { Haende } from "@/lib/music/akkorde";
import type { UebungsartId } from "@/lib/music/akkorduebung";

/** Woher kommen die Toene und wohin geht die Eingabe? */
export type Spielweise =
  /** Unterwegs: Klaviatur auf dem Bildschirm, Klang aus der App. */
  | "tippen"
  /** Zuhause: Eingabe und Klang kommen vom E-Piano. */
  | "piano";

/** Die drei Wege durch die Akkorde. */
export type AkkordModus = "lernen" | "umkehrungen" | "folgen";

/** Woher kommen die Akkorde einer Folge? */
export type FolgenQuelle =
  /** Aus einem Akkord heraus passende Nachbarn erzeugen. */
  | "passend"
  /** Aus den selbst angehakten Akkorden. */
  | "auswahl";

/** Wie eine Folge gespielt wird. */
export type Spielart = "block" | "gebrochen" | "gemischt";

export interface EinstellungsZustand {
  spielweise: Spielweise;
  /** Auch im Piano-Modus die Klaviatur einblenden — als Spickzettel. */
  klaviaturImmerZeigen: boolean;
  klangAn: boolean;

  /** Abgehakte Lernziele des Uebungsplans, ueber alle Niveaus hinweg. */
  beherrscht: string[];

  /** Nur ein System ueben oder beide gemischt? Gilt fuer die Melodien. */
  schluesselWahl: SchluesselWahl;
  /** Bleiben die Melodien auf den weissen Tasten, oder kommen die schwarzen dazu? */
  tastenwahl: Tastenwahl;
  /** Zaehlen die Notenwerte mit, oder geht es nur um die Tonhoehen? */
  notenwerteAn: boolean;

  akkordModus: AkkordModus;
  /** Mit welcher Hand gegriffen wird — oder mit beiden zusammen. */
  akkordHaende: Haende;
  /** Der Akkord, der gerade gelernt oder umgekehrt wird. */
  lernAkkord: string | null;
  /** Welche Stellungen geuebt werden: 0 = Grundstellung, 1..3 = Umkehrungen. */
  umkehrungen: number[];
  /** Uebungsarten, die im Lern- und Umkehrungsmodus drankommen. */
  uebungsarten: UebungsartId[];

  folgenQuelle: FolgenQuelle;
  /** Selbst angehakte Akkorde fuer eigene Folgen. */
  folgenAkkorde: string[];
  folgenSpielart: Spielart;

  setzeSpielweise: (s: Spielweise) => void;
  schalteKlaviatur: () => void;
  schalteKlang: () => void;

  schalteLernziel: (id: string) => void;
  vergisssLernziele: () => void;

  setzeSchluesselWahl: (w: SchluesselWahl) => void;
  setzeTastenwahl: (w: Tastenwahl) => void;
  schalteNotenwerte: () => void;

  setzeAkkordModus: (m: AkkordModus) => void;
  setzeAkkordHaende: (h: Haende) => void;
  setzeLernAkkord: (id: string | null) => void;
  setzeUmkehrungen: (stufen: number[]) => void;
  schalteUmkehrung: (stufe: number) => void;
  schalteUebungsart: (id: UebungsartId) => void;

  setzeFolgenQuelle: (q: FolgenQuelle) => void;
  schalteFolgenAkkord: (id: string) => void;
  setzeFolgenAkkorde: (ids: string[]) => void;
  setzeFolgenSpielart: (s: Spielart) => void;
}

/** Aus einer Liste entfernen oder hinzufuegen, aber nie alles leeren. */
function umschalten(liste: string[], id: string, mindestensEines: boolean): string[] {
  if (liste.includes(id)) {
    const rest = liste.filter((x) => x !== id);
    return mindestensEines && rest.length === 0 ? liste : rest;
  }
  return [...liste, id];
}

export const useEinstellungen = create<EinstellungsZustand>()(
  persist(
    (set) => ({
      spielweise: "tippen",
      klaviaturImmerZeigen: false,
      klangAn: true,

      beherrscht: [],

      schluesselWahl: "beide",
      tastenwahl: "weiss",
      notenwerteAn: false,

      akkordModus: "lernen",
      akkordHaende: "rechts",
      lernAkkord: null,
      umkehrungen: [0, 1, 2],
      uebungsarten: ["griff", "takt", "gebrochen", "melodie"],

      folgenQuelle: "passend",
      folgenAkkorde: [],
      folgenSpielart: "gemischt",

      setzeSpielweise: (spielweise) => set({ spielweise }),
      schalteKlaviatur: () =>
        set((z) => ({ klaviaturImmerZeigen: !z.klaviaturImmerZeigen })),
      schalteKlang: () => set((z) => ({ klangAn: !z.klangAn })),

      schalteLernziel: (id) =>
        set((z) => ({ beherrscht: umschalten(z.beherrscht, id, false) })),
      vergisssLernziele: () => set({ beherrscht: [] }),

      setzeSchluesselWahl: (schluesselWahl) => set({ schluesselWahl }),
      setzeTastenwahl: (tastenwahl) => set({ tastenwahl }),
      schalteNotenwerte: () => set((z) => ({ notenwerteAn: !z.notenwerteAn })),

      setzeAkkordModus: (akkordModus) => set({ akkordModus }),
      setzeAkkordHaende: (akkordHaende) => set({ akkordHaende }),
      setzeLernAkkord: (lernAkkord) => set({ lernAkkord }),
      setzeUmkehrungen: (umkehrungen) =>
        set(() => (umkehrungen.length === 0 ? {} : { umkehrungen })),

      schalteUmkehrung: (stufe) =>
        set((z) => {
          const drin = z.umkehrungen.includes(stufe);
          const neu = drin ? z.umkehrungen.filter((s) => s !== stufe) : [...z.umkehrungen, stufe];
          // Ganz ohne Stellung gaebe es nichts zu ueben.
          return neu.length === 0 ? z : { umkehrungen: neu.sort((a, b) => a - b) };
        }),

      schalteUebungsart: (id) =>
        set((z) => {
          const neu = umschalten(z.uebungsarten, id, true) as UebungsartId[];
          return { uebungsarten: neu };
        }),

      setzeFolgenQuelle: (folgenQuelle) => set({ folgenQuelle }),
      schalteFolgenAkkord: (id) =>
        set((z) => ({ folgenAkkorde: umschalten(z.folgenAkkorde, id, false) })),
      setzeFolgenAkkorde: (folgenAkkorde) => set({ folgenAkkorde }),
      setzeFolgenSpielart: (folgenSpielart) => set({ folgenSpielart }),
    }),
    {
      name: "noten-einstellungen",
      // Version 4: weisse/schwarze Tasten statt Landmark-Stufen, Handwahl bei
      // den Akkorden, kein Niveau mehr als Vorratsgrenze.
      version: 4,
      /**
       * Was es weiter gibt, wird uebernommen; die Landmark-Stufen und das
       * Niveau fallen weg. Wer schon einmal ueber den Anfaenger hinaus war,
       * hatte die schwarzen Tasten im Vorrat — das bleibt so.
       *
       * Alles Uebrige kommt aus den Voreinstellungen: zustand legt das
       * Ergebnis ueber den Anfangszustand.
       */
      migrate: (gespeichert) => {
        const alt = (gespeichert ?? {}) as Partial<EinstellungsZustand> & {
          niveau?: string;
        };
        const uebernommen: Partial<EinstellungsZustand> = {};

        if (alt.niveau && alt.niveau !== "anfaenger") uebernommen.tastenwahl = "alle";
        if (alt.tastenwahl) uebernommen.tastenwahl = alt.tastenwahl;

        // Nur setzen, was wirklich dastand — sonst ueberschreibt ein
        // `undefined` die Voreinstellung.
        if (alt.spielweise) uebernommen.spielweise = alt.spielweise;
        if (alt.schluesselWahl) uebernommen.schluesselWahl = alt.schluesselWahl;
        if (alt.akkordHaende) uebernommen.akkordHaende = alt.akkordHaende;
        if (alt.umkehrungen?.length) uebernommen.umkehrungen = alt.umkehrungen;
        if (alt.beherrscht?.length) uebernommen.beherrscht = alt.beherrscht;
        if (typeof alt.klangAn === "boolean") uebernommen.klangAn = alt.klangAn;
        if (typeof alt.notenwerteAn === "boolean") {
          uebernommen.notenwerteAn = alt.notenwerteAn;
        }
        if (typeof alt.klaviaturImmerZeigen === "boolean") {
          uebernommen.klaviaturImmerZeigen = alt.klaviaturImmerZeigen;
        }

        return uebernommen;
      },
    },
  ),
);
