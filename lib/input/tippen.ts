/**
 * Eingabequelle fuer die virtuelle Klaviatur.
 *
 * Getippte Noten laufen durch denselben Verteiler wie MIDI-Noten, damit die
 * Uebungslogik nicht unterscheiden muss, woher ein Ton kommt.
 */

import { type NotenEreignis, erzeugeVerteiler } from "./types";

const verteiler = erzeugeVerteiler();

/** Fester Anschlag fuer Fingertipps — ein Touchscreen kennt keine Dynamik. */
const ANSCHLAG = 0.72;

export function aufGetippteNoten(hoerer: (e: NotenEreignis) => void): () => void {
  return verteiler.abonnieren(hoerer);
}

export function tasteGedrueckt(midi: number) {
  verteiler.senden({ art: "an", midi, anschlag: ANSCHLAG, quelle: "tippen" });
}

export function tasteLosgelassen(midi: number) {
  verteiler.senden({ art: "aus", midi, anschlag: 0, quelle: "tippen" });
}
