"use client";

/**
 * Eine Reihe von Noten der Reihe nach durchspielen.
 *
 * Einzelne Noten und Melodien unterscheiden sich nur darin, woher die Reihe
 * kommt — gewuerfelt oder nach musikalischen Regeln gebaut. Das Durchspielen
 * selbst ist dasselbe: ein Cursor wandert, richtige Toene bleiben stehen,
 * falsche zeigen sich daneben und halten den Cursor auf.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { type UebungsNote, uebungsSchluessel } from "@/lib/music/curriculum";
import { nameMitOktave } from "@/lib/music/pitch";
import { useNoteneingabe } from "@/lib/input/useNoteneingabe";
import { useTricky } from "@/lib/store/tricky";
import { type DanebenNote, danebenAlsNote } from "./danebenNote";

/** Wie lange ein Fehlgriff nachklingt. */
const PULS_DAUER = 1300;

export interface ReihenUebungOptionen {
  reihe: readonly UebungsNote[];
  /** Solange false, werden Eingaben ignoriert (Auswahl offen, Pause, Abschluss). */
  aktiv: boolean;
  /** Wird einmal aufgerufen, sobald der letzte Ton sitzt. */
  aufFertig: () => void;
}

export interface ReihenUebung {
  /** Index des naechsten zu spielenden Tons. */
  position: number;
  /** Zuletzt daneben gegriffener Ton, als MIDI-Nummer. */
  letzteFalsche: number | null;
  /** Derselbe Ton aufbereitet fuers Notenbild — null, wenn er nicht ins Bild passt. */
  danebenNote: DanebenNote | null;
  fertig: boolean;
  /** Reihe von vorn beginnen, ohne sie auszutauschen. */
  vonVorn: () => void;
}

export function useReihenUebung({
  reihe,
  aktiv,
  aufFertig,
}: ReihenUebungOptionen): ReihenUebung {
  const merkeFehler = useTricky((z) => z.merkeFehler);

  const [position, setPosition] = useState(0);
  const [letzteFalsche, setLetzteFalsche] = useState<number | null>(null);

  // Neue Reihe: Cursor auf Anfang. Bewusst waehrend des Renderns, damit der
  // erste Frame nicht noch den Cursorstand der vorherigen Reihe zeigt.
  const kennung = reihe.map(uebungsSchluessel).join("|");
  const [letzteKennung, setLetzteKennung] = useState(kennung);
  if (kennung !== letzteKennung) {
    setLetzteKennung(kennung);
    setPosition(0);
    setLetzteFalsche(null);
  }

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  const fertig = reihe.length > 0 && position >= reihe.length;

  useNoteneingabe((ereignis) => {
    if (!aktiv || ereignis.art !== "an" || fertig) return;
    const erwartet = reihe[position];
    if (!erwartet) return;

    if (ereignis.midi === erwartet.note.midi) {
      setPosition(position + 1);
      setLetzteFalsche(null);
      if (position + 1 >= reihe.length) aufFertig();
      return;
    }

    merkeFehler(uebungsSchluessel(erwartet), nameMitOktave(erwartet.note));
    setLetzteFalsche(ereignis.midi);
    uhren.current.push(window.setTimeout(() => setLetzteFalsche(null), PULS_DAUER));
  });

  // Der Fehlgriff moeglichst im System der erwarteten Note, damit sich der
  // Abstand direkt ablesen laesst.
  const danebenNote = useMemo(() => {
    if (letzteFalsche == null) return null;
    return danebenAlsNote(letzteFalsche, reihe[position]?.schluessel ?? null);
  }, [letzteFalsche, reihe, position]);

  return {
    position,
    letzteFalsche,
    danebenNote,
    fertig,
    vonVorn: () => {
      setPosition(0);
      setLetzteFalsche(null);
    },
  };
}
