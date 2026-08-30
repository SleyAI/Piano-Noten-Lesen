"use client";

/**
 * Erkennt, wann ein Akkord vollstaendig gegriffen ist.
 *
 * Am E-Piano drueckt man alle Toene gleichzeitig, auf dem Tablet tippt man sie
 * nacheinander an. Beides soll zaehlen — deshalb werden richtige Toene
 * gesammelt, statt auf einen Moment zu warten, in dem alle zusammen gehalten
 * werden. Losgelassene Toene bleiben gesammelt, bis die naechste Aufgabe kommt.
 *
 * Was danebengeht, meldet dieser Haken nur; was damit geschieht, entscheidet
 * die Uebung darueber — die eine laesst weitersuchen, die andere faengt von
 * vorn an.
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
  /** Vergisst ein Fehlgriff die schon gesammelten Toene? */
  vergissBeiFehler?: boolean;
  /**
   * Der erste richtige Ton dieses Griffs — der Anschlag. Daran misst die
   * Uebung darueber die Notenlaengen; wann der Griff vollstaendig ist, sagt
   * `aufTreffer`.
   */
  aufErstemTon?: () => void;
  aufTreffer: () => void;
  aufFehler: (midi: number) => void;
}

export interface AkkordGriff {
  /** Bereits richtig gespielte Toene. */
  gespielt: Set<number>;
}

export function useAkkordGriff({
  erwartet,
  aktiv,
  kennung: kennungVon,
  vergissBeiFehler = false,
  aufErstemTon,
  aufTreffer,
  aufFehler,
}: AkkordGriffOptionen): AkkordGriff {
  const [gespielt, setGespielt] = useState<Set<number>>(() => new Set());
  /** Zu welcher Aufgabe der Anschlag schon gemeldet wurde. */
  const angeschlagen = useRef<string | null>(null);

  // Neue Aufgabe: alles auf Anfang. Das passiert bewusst waehrend des
  // Renderns und nicht in einem Effekt — sonst zeigt der erste Frame nach dem
  // Wechsel noch den Griff der vorherigen Aufgabe.
  const kennung = kennungVon ?? erwartet.join(",");
  const [letzteKennung, setLetzteKennung] = useState(kennung);
  if (kennung !== letzteKennung) {
    setLetzteKennung(kennung);
    setGespielt(new Set());
  }

  useNoteneingabe((ereignis) => {
    if (!aktiv || ereignis.art !== "an") return;

    if (!erwartet.includes(ereignis.midi)) {
      if (vergissBeiFehler) setGespielt(new Set());
      aufFehler(ereignis.midi);
      return;
    }

    // Der Anschlag zaehlt einmal je Griff, auch wenn drei Finger folgen —
    // und auch dann, wenn sie im selben Augenblick kommen und React noch
    // nichts neu gerechnet hat. Deshalb eine Ref und nicht `gespielt`.
    if (angeschlagen.current !== kennung) {
      angeschlagen.current = kennung;
      aufErstemTon?.();
    }

    setGespielt((vorher) =>
      vorher.has(ereignis.midi) ? vorher : new Set(vorher).add(ereignis.midi),
    );
  });

  /**
   * Der Treffer wird nach dem Rendern gemeldet, nicht mitten im Sammeln.
   *
   * Wer alle Toene eines Griffs gleichzeitig anschlaegt, loest damit mehrere
   * Zustandsaenderungen auf einmal aus; React darf die zugehoerige Funktion
   * dabei mehrfach durchrechnen. Stuende die Meldung darin, ruecke die Uebung
   * gleich zwei Schritte weiter.
   */
  const fertig =
    kennung === letzteKennung &&
    erwartet.length > 0 &&
    erwartet.every((midi) => gespielt.has(midi));

  const melden = useRef(aufTreffer);
  useEffect(() => {
    melden.current = aufTreffer;
  });
  useEffect(() => {
    if (fertig) melden.current();
  }, [fertig]);

  return { gespielt };
}
