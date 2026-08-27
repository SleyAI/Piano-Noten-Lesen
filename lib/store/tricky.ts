"use client";

/**
 * Stille Buchfuehrung ueber Fehlversuche.
 *
 * Die App zaehlt im Hintergrund mit, welche Noten und Akkorde haken, und
 * bietet sie am Ende einer Runde zur Wiederholung an. Es gibt bewusst keine
 * Quote, keine Serie und keinen Punktestand — nur einen freundlichen Hinweis,
 * was als Naechstes drankommen koennte.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Eintrag {
  /** Wie oft insgesamt gestellt. */
  versuche: number;
  /** Wie oft daneben gegriffen, bevor es sass. */
  fehler: number;
  /** Zeitstempel des letzten Auftretens. */
  zuletzt: number;
  /** Anzeigename fuer die Uebersicht, z. B. "G4" oder "Am, 1. Umkehrung". */
  bezeichnung: string;
}

export interface TrickyZustand {
  eintraege: Record<string, Eintrag>;
  /** Fehler der laufenden Runde, damit die Abschlussuebersicht nur diese zeigt. */
  runde: Record<string, number>;

  merkeVersuch: (schluessel: string, bezeichnung: string) => void;
  merkeFehler: (schluessel: string, bezeichnung: string) => void;
  starteRunde: () => void;
  rundenFehler: () => Array<{ schluessel: string; bezeichnung: string; fehler: number }>;
  schwierigste: (anzahl: number) => Array<{ schluessel: string; eintrag: Eintrag }>;
  /** Gewicht fuer die Auswahl der naechsten Aufgabe: Haken kommt oefter dran. */
  gewicht: (schluessel: string) => number;
  vergessen: () => void;
}

const LEER: Eintrag = { versuche: 0, fehler: 0, zuletzt: 0, bezeichnung: "" };

export const useTricky = create<TrickyZustand>()(
  persist(
    (set, get) => ({
      eintraege: {},
      runde: {},

      merkeVersuch: (schluessel, bezeichnung) =>
        set((z) => {
          const alt = z.eintraege[schluessel] ?? LEER;
          return {
            eintraege: {
              ...z.eintraege,
              [schluessel]: {
                ...alt,
                bezeichnung,
                versuche: alt.versuche + 1,
                zuletzt: Date.now(),
              },
            },
          };
        }),

      merkeFehler: (schluessel, bezeichnung) =>
        set((z) => {
          const alt = z.eintraege[schluessel] ?? LEER;
          return {
            eintraege: {
              ...z.eintraege,
              [schluessel]: {
                ...alt,
                bezeichnung,
                fehler: alt.fehler + 1,
                zuletzt: Date.now(),
              },
            },
            runde: { ...z.runde, [schluessel]: (z.runde[schluessel] ?? 0) + 1 },
          };
        }),

      starteRunde: () => set({ runde: {} }),

      rundenFehler: () => {
        const { runde, eintraege } = get();
        return Object.entries(runde)
          .map(([schluessel, fehler]) => ({
            schluessel,
            fehler,
            bezeichnung: eintraege[schluessel]?.bezeichnung ?? schluessel,
          }))
          .sort((a, b) => b.fehler - a.fehler);
      },

      schwierigste: (anzahl) =>
        Object.entries(get().eintraege)
          .filter(([, e]) => e.fehler > 0)
          .sort((a, b) => b[1].fehler - a[1].fehler)
          .slice(0, anzahl)
          .map(([schluessel, eintrag]) => ({ schluessel, eintrag })),

      gewicht: (schluessel) => {
        const e = get().eintraege[schluessel];
        if (!e || e.versuche === 0) return 1;
        // Fehlerquote hebt das Gewicht auf hoechstens das Vierfache an.
        return 1 + Math.min(e.fehler / e.versuche, 1) * 3;
      },

      vergessen: () => set({ eintraege: {}, runde: {} }),
    }),
    {
      name: "noten-tricky",
      version: 1,
      // Die laufende Runde ist nur fuer den Moment interessant.
      partialize: (z) => ({ eintraege: z.eintraege }),
    },
  ),
);
