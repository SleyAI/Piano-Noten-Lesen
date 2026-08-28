"use client";

/**
 * Erkennt, wann ein Akkord vollstaendig gegriffen ist.
 *
 * Am E-Piano drueckt man alle Toene gleichzeitig, auf dem Tablet tippt man sie
 * nacheinander an. Beides soll zaehlen — deshalb werden richtige Toene
 * gesammelt, statt auf einen Moment zu warten, in dem alle zusammen gehalten
 * werden. Losgelassene Toene bleiben gesammelt, bis die naechste Aufgabe kommt.
 */

import { useEffect, useRef, useState } from "react";
import { useNoteneingabe } from "@/lib/input/useNoteneingabe";

export interface AkkordGriffOptionen {
  /** Die erwarteten Toene als MIDI-Nummern. */
  erwartet: readonly number[];
  /** Solange false, werden Eingaben ignoriert (Pause, Auswahl, Abschluss). */
  aktiv: boolean;
  /**
   * Woran erkannt wird, dass eine neue Aufgabe angefangen hat. Ohne Angabe
   * sind es die erwarteten Toene — was nicht reicht, wenn derselbe Griff
   * zweimal hintereinander drankommt, etwa in einer Rhythmusuebung.
   */
  kennung?: string;
  aufTreffer: () => void;
  aufFehler: (midi: number) => void;
}

export interface AkkordGriff {
  /** Bereits richtig gespielte Toene. */
  gespielt: Set<number>;
  /** Zuletzt daneben gegriffene Toene. */
  daneben: Set<number>;
  zuruecksetzen: () => void;
}

export function useAkkordGriff({
  erwartet,
  aktiv,
  kennung: kennungVon,
  aufTreffer,
  aufFehler,
}: AkkordGriffOptionen): AkkordGriff {
  const [gespielt, setGespielt] = useState<Set<number>>(() => new Set());
  const [daneben, setDaneben] = useState<Set<number>>(() => new Set());
  const uhr = useRef<number | null>(null);

  // Neue Aufgabe: alles auf Anfang. Das passiert bewusst waehrend des
  // Renderns und nicht in einem Effekt — sonst zeigt der erste Frame nach dem
  // Wechsel noch den Griff der vorherigen Aufgabe.
  const kennung = kennungVon ?? erwartet.join(",");
  const [letzteKennung, setLetzteKennung] = useState(kennung);
  if (kennung !== letzteKennung) {
    setLetzteKennung(kennung);
    setGespielt(new Set());
    setDaneben(new Set());
  }

  useEffect(
    () => () => {
      if (uhr.current) window.clearTimeout(uhr.current);
    },
    [],
  );

  useNoteneingabe((ereignis) => {
    if (!aktiv || ereignis.art !== "an") return;

    if (!erwartet.includes(ereignis.midi)) {
      setDaneben((s) => new Set(s).add(ereignis.midi));
      aufFehler(ereignis.midi);
      if (uhr.current) window.clearTimeout(uhr.current);
      uhr.current = window.setTimeout(() => setDaneben(new Set()), 1300);
      return;
    }

    setGespielt((vorher) => {
      if (vorher.has(ereignis.midi)) return vorher;
      const neu = new Set(vorher).add(ereignis.midi);
      if (neu.size === erwartet.length) aufTreffer();
      return neu;
    });
  });

  return {
    gespielt,
    daneben,
    zuruecksetzen: () => {
      setGespielt(new Set());
      setDaneben(new Set());
    },
  };
}
