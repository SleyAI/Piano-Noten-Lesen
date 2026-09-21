"use client";

/**
 * Einstellungen und Auswahl der Uebungsinhalte.
 *
 * Alles liegt im localStorage — kein Konto, kein Server. Beim naechsten Start
 * ist die Auswahl wieder da.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Notenbereich, type SchluesselWahl, type Tastenwahl } from "@/lib/music/curriculum";
import { type NotenLevelId } from "@/lib/music/levels";
import { type TonabfolgeModus } from "@/lib/music/melodie";
import type { Haende, Stellung } from "@/lib/music/akkorde";
import type { UebungsartId } from "@/lib/music/akkorduebung";
import { TEMPO, begrenzeTempo } from "@/lib/music/rhythmus";

import { type Niveau } from "@/lib/music/niveau";

/** Woher kommen die Toene und wohin geht die Eingabe? */
export type Spielweise =
  /** Unterwegs: Klaviatur auf dem Bildschirm, Klang aus der App. */
  | "tippen"
  /** Zuhause: Eingabe und Klang kommen vom E-Piano. */
  | "piano";

/** Die zwei Modi fuer die Melodien. */
export type MelodieModus = "fliessend" | "vorbereitung";

/** Die zwei Hauptmodi fuer die Akkorde. */
export type AkkordModus = "folgen" | "inversionen" | "lernen" | "umkehrungen";

/** Woher kommen die Akkorde einer Folge? */
export type FolgenQuelle =
  /** Aus einem Akkord heraus passende Nachbarn erzeugen. */
  | "passend"
  /** Aus den selbst angehakten Akkorden. */
  | "auswahl";

/** Wie eine Folge gespielt wird. */
export type Spielart = "block" | "gebrochen" | "gemischt";

/** Die Stellungswahl gehoert zur Musik, nicht zu den Einstellungen. */
export type { Stellung };

export interface EinstellungsZustand {
  spielweise: Spielweise;
  /** Auch im Piano-Modus die Klaviatur einblenden — als Spickzettel. */
  klaviaturImmerZeigen: boolean;
  klangAn: boolean;

  /** Abgehakte Lernziele des Uebungsplans, ueber alle Niveaus hinweg. */
  beherrscht: string[];

  /** Noten-Level 1 bis 5 (Kategorien A, B, C) */
  notenLevel: NotenLevelId;
  /** Zufällige Noten oder Melodische Ketten */
  abfolgeModus: TonabfolgeModus;
  /** Bildschirm-Eingabemodus: Virtuelle Klaviatur oder Noten-Kästchen */
  eingabeModus: "klaviatur" | "kaestchen";
  /** Hat der Nutzer beim Erst-Start bereits ein Level gewählt? */
  startLevelGewaehlt: boolean;

  /** Nur ein System ueben oder beide gemischt? Gilt fuer die Melodien. */
  schluesselWahl: SchluesselWahl;
  /** Bleiben die Melodien auf den weissen Tasten, oder kommen die schwarzen dazu? */
  tastenwahl: Tastenwahl;
  /** Welche Stufe des Landmark-Systems: Landmarks, darum herum, oder mit Hilfslinien? */
  notenbereich: Notenbereich;
  /** Fliessend vom Blatt oder mit Vorbereitung? */
  melodieModus: MelodieModus;
  /** Zaehlen die Notenwerte mit, oder geht es nur um die Tonhoehen? */
  notenwerteAn: boolean;

  /** Uebungstempo in Schlaegen pro Minute — Metronom, Vorspielen und Takt. */
  tempo: number;
  /** Klickt das Metronom mit? */
  metronomAn: boolean;

  akkordNiveau: Niveau;
  akkordModus: AkkordModus;
  inversionsSpielart: "griff" | "arpeggio";
  /** Mit welcher Hand gegriffen wird — oder mit beiden zusammen. */
  akkordHaende: Haende;
  /** Der Akkord, der gerade gelernt oder umgekehrt wird. */
  lernAkkord: string | null;
  /** Welche Stellung im Reiter "neu lernen" drankommt. */
  stellungLernen: Stellung;
  /** Welche Stellung im Reiter "Umkehrungen" drankommt. */
  stellungUmkehrung: Stellung;
  /** Zaehlen die Notenwerte bei den Akkorduebungen mit? */
  taktGenau: boolean;
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

  setzeNotenLevel: (level: NotenLevelId) => void;
  setzeAbfolgeModus: (modus: TonabfolgeModus) => void;
  setzeEingabeModus: (modus: "klaviatur" | "kaestchen") => void;
  setzeStartLevelGewaehlt: (gewaehlt: boolean) => void;

  setzeSchluesselWahl: (w: SchluesselWahl) => void;
  setzeTastenwahl: (w: Tastenwahl) => void;
  setzeNotenbereich: (b: Notenbereich) => void;
  setzeMelodieModus: (m: MelodieModus) => void;
  schalteNotenwerte: () => void;

  setzeTempo: (bpm: number) => void;
  schalteMetronom: () => void;

  setzeAkkordNiveau: (n: Niveau) => void;
  setzeAkkordModus: (m: AkkordModus) => void;
  setzeInversionsSpielart: (s: "griff" | "arpeggio") => void;
  setzeAkkordHaende: (h: Haende) => void;
  setzeLernAkkord: (id: string | null) => void;
  setzeStellung: (modus: "lernen" | "umkehrungen", stellung: Stellung) => void;
  schalteTaktGenau: () => void;
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

      notenLevel: 1,
      abfolgeModus: "zufall",
      eingabeModus: "klaviatur",
      startLevelGewaehlt: false,

      schluesselWahl: "beide",
      tastenwahl: "weiss",
      notenbereich: "landmarks",
      melodieModus: "fliessend",
      notenwerteAn: false,

      tempo: TEMPO,
      metronomAn: false,

      akkordNiveau: "anfaenger",
      akkordModus: "folgen",
      inversionsSpielart: "griff",
      akkordHaende: "rechts",
      lernAkkord: "C",
      stellungLernen: 0,
      stellungUmkehrung: 1,
      taktGenau: false,
      uebungsarten: ["griff", "takt", "gebrochen", "melodie"],

      folgenQuelle: "passend",
      folgenAkkorde: [],
      folgenSpielart: "block",

      setzeSpielweise: (spielweise) => set({ spielweise }),
      schalteKlaviatur: () =>
        set((z) => ({ klaviaturImmerZeigen: !z.klaviaturImmerZeigen })),
      schalteKlang: () => set((z) => ({ klangAn: !z.klangAn })),

      schalteLernziel: (id) =>
        set((z) => ({ beherrscht: umschalten(z.beherrscht, id, false) })),
      vergisssLernziele: () => set({ beherrscht: [] }),

      setzeNotenLevel: (notenLevel) => set({ notenLevel }),
      setzeAbfolgeModus: (abfolgeModus) => set({ abfolgeModus }),
      setzeEingabeModus: (eingabeModus) => set({ eingabeModus }),
      setzeStartLevelGewaehlt: (startLevelGewaehlt) => set({ startLevelGewaehlt }),

      setzeSchluesselWahl: (schluesselWahl) => set({ schluesselWahl }),
      setzeTastenwahl: (tastenwahl) => set({ tastenwahl }),
      setzeNotenbereich: (notenbereich) => set({ notenbereich }),
      setzeMelodieModus: (melodieModus) => set({ melodieModus }),
      schalteNotenwerte: () => set((z) => ({ notenwerteAn: !z.notenwerteAn })),

      setzeTempo: (bpm) => set({ tempo: begrenzeTempo(bpm) }),
      schalteMetronom: () => set((z) => ({ metronomAn: !z.metronomAn })),

      setzeAkkordNiveau: (akkordNiveau) => set({ akkordNiveau }),
      setzeAkkordModus: (akkordModus) => set({ akkordModus }),
      setzeInversionsSpielart: (inversionsSpielart) => set({ inversionsSpielart }),
      setzeAkkordHaende: (akkordHaende) => set({ akkordHaende }),
      setzeLernAkkord: (lernAkkord) => set({ lernAkkord }),
      setzeStellung: (modus, stellung) =>
        set(modus === "lernen" ? { stellungLernen: stellung } : { stellungUmkehrung: stellung }),
      schalteTaktGenau: () => set((z) => ({ taktGenau: !z.taktGenau })),

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
      version: 6,
      migrate: (gespeichert) => {
        const alt = (gespeichert ?? {}) as Partial<EinstellungsZustand> & {
          niveau?: string;
          umkehrungen?: number[];
        };
        const uebernommen: Partial<EinstellungsZustand> = {};

        if (alt.niveau && alt.niveau !== "anfaenger") uebernommen.tastenwahl = "alle";
        if (alt.tastenwahl) uebernommen.tastenwahl = alt.tastenwahl;

        if (alt.spielweise) uebernommen.spielweise = alt.spielweise;
        if (alt.schluesselWahl) uebernommen.schluesselWahl = alt.schluesselWahl;
        if (alt.akkordHaende) uebernommen.akkordHaende = alt.akkordHaende;
        if (alt.beherrscht?.length) uebernommen.beherrscht = alt.beherrscht;
        if (typeof alt.tempo === "number") uebernommen.tempo = begrenzeTempo(alt.tempo);
        if (typeof alt.klangAn === "boolean") uebernommen.klangAn = alt.klangAn;
        if (typeof alt.notenwerteAn === "boolean") {
          uebernommen.notenwerteAn = alt.notenwerteAn;
        }
        if (typeof alt.klaviaturImmerZeigen === "boolean") {
          uebernommen.klaviaturImmerZeigen = alt.klaviaturImmerZeigen;
        }
        if (alt.notenLevel) uebernommen.notenLevel = alt.notenLevel;
        if (alt.abfolgeModus) uebernommen.abfolgeModus = alt.abfolgeModus;
        if (alt.eingabeModus) uebernommen.eingabeModus = alt.eingabeModus;
        if (typeof alt.startLevelGewaehlt === "boolean") {
          uebernommen.startLevelGewaehlt = alt.startLevelGewaehlt;
        }

        return uebernommen;
      },
    },
  ),
);
