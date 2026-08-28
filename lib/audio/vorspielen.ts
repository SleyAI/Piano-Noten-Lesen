/**
 * Eine Folge einmal vorspielen.
 *
 * Vor jeder Aufgabe darf man sich anhoeren, was gleich zu spielen ist — auch
 * und gerade dann, wenn Notenwerte mitzaehlen: einen Rhythmus liest man
 * leichter, wenn man ihn einmal gehoert hat.
 *
 * Der Klang kommt immer aus der App, auch im Klavier-Modus. Das E-Piano kann
 * nur, was jemand darauf spielt, und vorspielen soll ja die App.
 */

import { type NotenwertId, TEMPO, millisekunden } from "@/lib/music/rhythmus";
import { aufwecken, spieleTon, stoppeTon } from "./engine";

export interface Klangschritt {
  /** Was gleichzeitig klingt. */
  midis: readonly number[];
  wert: NotenwertId;
}

export interface VorspielOptionen {
  tempo?: number;
  /** Wird vor jedem Schritt mit seinem Index aufgerufen — fuer die Anzeige. */
  aufSchritt?: (index: number) => void;
  aufEnde?: () => void;
}

/**
 * Spielt die Schritte der Reihe nach ab.
 * Liefert eine Funktion, die das Vorspielen jederzeit abbricht.
 */
export function vorspielen(
  schritte: readonly Klangschritt[],
  { tempo = TEMPO, aufSchritt, aufEnde }: VorspielOptionen = {},
): () => void {
  if (schritte.length === 0) {
    aufEnde?.();
    return () => {};
  }

  aufwecken();

  const uhren: number[] = [];
  const klingend = new Set<number>();
  let abgebrochen = false;

  /** Kurz vor dem naechsten Schritt loslassen, damit Toene nicht verschmieren. */
  const LUFT = 0.88;

  let versatz = 0;
  schritte.forEach((schritt, index) => {
    const dauer = millisekunden(schritt.wert, tempo);
    const beginn = versatz;
    versatz += dauer;

    uhren.push(
      window.setTimeout(() => {
        if (abgebrochen) return;
        aufSchritt?.(index);
        for (const midi of schritt.midis) {
          klingend.add(midi);
          spieleTon(midi, 0.6);
        }
      }, beginn),
    );

    uhren.push(
      window.setTimeout(
        () => {
          if (abgebrochen) return;
          for (const midi of schritt.midis) {
            klingend.delete(midi);
            stoppeTon(midi);
          }
        },
        beginn + dauer * LUFT,
      ),
    );
  });

  uhren.push(
    window.setTimeout(() => {
      if (!abgebrochen) aufEnde?.();
    }, versatz),
  );

  return () => {
    if (abgebrochen) return;
    abgebrochen = true;
    for (const id of uhren) window.clearTimeout(id);
    for (const midi of klingend) stoppeTon(midi, 0.12);
    klingend.clear();
    aufEnde?.();
  };
}
