"use client";

/**
 * Die Uebungssession und was von ihr uebrig bleibt.
 *
 * Die laufende Session steht mit im Speicher, nicht nur im Arbeitsspeicher:
 * wer von der Startseite zu den Akkorden wechselt oder die Seite neu laedt,
 * soll seine Uhr wiederfinden. Gespeichert wird dafuer der Startzeitpunkt und
 * nicht die verstrichene Zeit — daraus laesst sich beides ausrechnen, und es
 * gibt nichts, was im Hintergrund weiterzaehlen muesste.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Uebungstage, bucheAufTag } from "@/lib/practice/uebungszeit";

/**
 * Laeuft eine Session laenger als das, war es keine Uebung mehr, sondern ein
 * vergessener Browsertab. Sie wird dann verworfen, statt die Statistik mit
 * einer Nachtschicht zu fuellen.
 */
const HOECHSTDAUER = 4 * 60 * 60;

export interface UebungszeitZustand {
  tage: Uebungstage;
  /** Beginn der laufenden Session als Zeitstempel, sonst null. */
  beginn: number | null;
  /** Dauer der zuletzt beendeten Session in Sekunden — fuer den Schlusssatz. */
  letzteDauer: number | null;

  starte: () => void;
  beende: () => void;
  /** Den Schlusssatz wegklicken. */
  quittiere: () => void;
  vergissAlles: () => void;
}

export const useUebungszeit = create<UebungszeitZustand>()(
  persist(
    (set) => ({
      tage: {},
      beginn: null,
      letzteDauer: null,

      starte: () => set({ beginn: Date.now(), letzteDauer: null }),

      beende: () =>
        set((z) => {
          if (z.beginn === null) return z;
          const sekunden = Math.floor((Date.now() - z.beginn) / 1000);
          if (sekunden > HOECHSTDAUER) {
            return { beginn: null, letzteDauer: null };
          }
          return {
            tage: bucheAufTag(z.tage, sekunden, z.beginn),
            beginn: null,
            letzteDauer: sekunden,
          };
        }),

      quittiere: () => set({ letzteDauer: null }),
      vergissAlles: () => set({ tage: {}, beginn: null, letzteDauer: null }),
    }),
    { name: "noten-uebungszeit", version: 1 },
  ),
);
