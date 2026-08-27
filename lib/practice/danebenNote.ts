/**
 * Die tatsaechlich gespielte Note fuer die Anzeige aufbereiten.
 *
 * Ein Fehlgriff soll nicht nur "falsch" melden, sondern zeigen, welche Note es
 * stattdessen war — daraus lernt man den Abstand. Nur wenn der Griff weit
 * ausserhalb des gezeichneten Bereichs liegt, bleibt es beim Namen im Hinweis.
 */

import {
  type Note,
  type Schluessel,
  passenderSchluessel,
  vonMidi,
} from "@/lib/music/pitch";
import { passtInsBild } from "@/lib/notation/layout";

export interface DanebenNote {
  note: Note;
  schluessel: Schluessel;
}

/**
 * @param midi     was gespielt wurde
 * @param bevorzugt in welchem System es moeglichst stehen soll — beim Ueben
 *                  eines einzelnen Systems bleibt die Note dort, solange sie
 *                  ins Bild passt.
 */
export function danebenAlsNote(
  midi: number,
  bevorzugt: Schluessel | null,
): DanebenNote | null {
  const note = vonMidi(midi);

  if (bevorzugt && passtInsBild(note, bevorzugt)) {
    return { note, schluessel: bevorzugt };
  }

  const passend = passenderSchluessel(note);
  return passtInsBild(note, passend) ? { note, schluessel: passend } : null;
}

/** Mehrere Fehlgriffe auf einmal — fuer Akkorde. */
export function danebenAlsNoten(
  midis: Iterable<number>,
  bevorzugt: Schluessel | null,
): DanebenNote[] {
  const ergebnis: DanebenNote[] = [];
  for (const midi of midis) {
    const eintrag = danebenAlsNote(midi, bevorzugt);
    if (eintrag) ergebnis.push(eintrag);
  }
  return ergebnis;
}
