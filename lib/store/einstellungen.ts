"use client";

/**
 * Einstellungen und Auswahl der Uebungsinhalte.
 *
 * Alles liegt im localStorage — kein Konto, kein Server. Beim naechsten Start
 * ist die Auswahl wieder da.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type SchluesselWahl } from "@/lib/music/curriculum";
import {
  type Niveau,
  erlaubteAkkorde,
  erlaubteNotenPakete,
} from "@/lib/music/niveau";
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

  /** Anfaenger, Fortgeschritten oder Profi — begrenzt den ganzen Vorrat. */
  niveau: Niveau;
  /** Abgehakte Lernziele, ueber alle Niveaus hinweg. */
  beherrscht: string[];

  /** Nur ein System ueben oder beide gemischt? Gilt fuer Melodien und Akkorde. */
  schluesselWahl: SchluesselWahl;
  /** Gewaehlte Landmark-Stufen fuer die Melodien. */
  notenPakete: string[];
  /** Zaehlen die Notenwerte mit, oder geht es nur um die Tonhoehen? */
  notenwerteAn: boolean;

  akkordModus: AkkordModus;
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

  setzeNiveau: (n: Niveau) => void;
  schalteLernziel: (id: string) => void;
  vergisssLernziele: () => void;

  setzeSchluesselWahl: (w: SchluesselWahl) => void;
  setzeNotenPakete: (ids: string[]) => void;
  schalteNotenPaket: (id: string) => void;
  schalteNotenwerte: () => void;

  setzeAkkordModus: (m: AkkordModus) => void;
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

/** Voreinstellung beim allerersten Start: nur die Mitte. */
const START_PAKETE = ["mitte"];

export const useEinstellungen = create<EinstellungsZustand>()(
  persist(
    (set) => ({
      spielweise: "tippen",
      klaviaturImmerZeigen: false,
      klangAn: true,

      niveau: "anfaenger",
      beherrscht: [],

      schluesselWahl: "beide",
      notenPakete: [...START_PAKETE],
      notenwerteAn: false,

      akkordModus: "lernen",
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

      /**
       * Beim Niveauwechsel wird die Auswahl auf das gestutzt, was es dort
       * gibt — sonst uebt man im Anfaengermodus weiter Akkorde mit
       * Vorzeichen, nur weil sie einmal ausgewaehlt waren.
       */
      setzeNiveau: (niveau) =>
        set((z) => {
          const pakete = new Set(erlaubteNotenPakete(niveau).map((p) => p.id));
          const akkorde = new Set(erlaubteAkkorde(niveau).map((a) => a.id));
          const uebrig = z.notenPakete.filter((id) => pakete.has(id));
          return {
            niveau,
            notenPakete: uebrig.length > 0 ? uebrig : [...START_PAKETE],
            lernAkkord: z.lernAkkord && akkorde.has(z.lernAkkord) ? z.lernAkkord : null,
            folgenAkkorde: z.folgenAkkorde.filter((id) => akkorde.has(id)),
          };
        }),

      schalteLernziel: (id) =>
        set((z) => ({ beherrscht: umschalten(z.beherrscht, id, false) })),
      vergisssLernziele: () => set({ beherrscht: [] }),

      setzeSchluesselWahl: (schluesselWahl) => set({ schluesselWahl }),
      setzeNotenPakete: (notenPakete) => set({ notenPakete }),
      schalteNotenPaket: (id) =>
        set((z) => ({ notenPakete: umschalten(z.notenPakete, id, true) })),
      schalteNotenwerte: () => set((z) => ({ notenwerteAn: !z.notenwerteAn })),

      setzeAkkordModus: (akkordModus) => set({ akkordModus }),
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
      // Version 3: Niveau, Notenwerte und die neuen Akkordmodi.
      version: 3,
      /**
       * Was es weiter gibt, wird uebernommen; die alte Paketauswahl fuer
       * Akkorde faellt weg, weil Akkorde jetzt einzeln gewaehlt werden.
       * Alles Uebrige kommt aus den Voreinstellungen — zustand legt das
       * Ergebnis ueber den Anfangszustand.
       */
      migrate: (gespeichert) => {
        const alt = (gespeichert ?? {}) as Partial<EinstellungsZustand>;
        const erlaubt = new Set(erlaubteNotenPakete("anfaenger").map((p) => p.id));
        const pakete = (alt.notenPakete ?? []).filter((id) => erlaubt.has(id));

        const uebernommen: Partial<EinstellungsZustand> = {
          notenPakete: pakete.length > 0 ? pakete : [...START_PAKETE],
        };
        // Nur setzen, was wirklich dastand — sonst ueberschreibt ein
        // `undefined` die Voreinstellung.
        if (alt.spielweise) uebernommen.spielweise = alt.spielweise;
        if (alt.schluesselWahl) uebernommen.schluesselWahl = alt.schluesselWahl;
        if (alt.umkehrungen?.length) uebernommen.umkehrungen = alt.umkehrungen;
        if (typeof alt.klangAn === "boolean") uebernommen.klangAn = alt.klangAn;
        if (typeof alt.klaviaturImmerZeigen === "boolean") {
          uebernommen.klaviaturImmerZeigen = alt.klaviaturImmerZeigen;
        }

        return uebernommen;
      },
    },
  ),
);
