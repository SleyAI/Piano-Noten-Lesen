/**
 * Welcher Ausschnitt der Klaviatur wird gezeigt?
 *
 * Genug Luft um die geuebten Noten, damit man sich nicht verklickt, aber nicht
 * so breit, dass die Tasten auf dem Tablet zu schmal zum Treffen werden.
 */

/** Mindestens zwei Oktaven, damit die Tastatur wie eine Tastatur aussieht. */
const MIN_SPANNE = 24;
/** Mehr als vier Oktaven wird auf einem Tablet zu fummelig. */
const MAX_SPANNE = 48;
/** Luft links und rechts der geuebten Noten. */
const LUFT = 4;

/** Grenzen eines 88-Tasten-Klaviers. */
const TIEFSTE = 21; // A0
const HOECHSTE = 108; // C8

export function klaviaturBereich(midiNoten: readonly number[]): { von: number; bis: number } {
  if (midiNoten.length === 0) return { von: 48, bis: 72 }; // C3 bis C5

  let von = Math.min(...midiNoten) - LUFT;
  let bis = Math.max(...midiNoten) + LUFT;

  // Zu schmal: symmetrisch aufweiten.
  while (bis - von < MIN_SPANNE) {
    von -= 1;
    bis += 1;
  }

  // Zu breit: von aussen einkuerzen, aber nie ueber die geuebten Noten hinweg.
  const noetigVon = Math.min(...midiNoten);
  const noetigBis = Math.max(...midiNoten);
  while (bis - von > MAX_SPANNE && (von < noetigVon || bis > noetigBis)) {
    if (bis - noetigBis >= noetigVon - von) bis -= 1;
    else von += 1;
  }

  return {
    von: Math.max(von, TIEFSTE),
    bis: Math.min(bis, HOECHSTE),
  };
}
