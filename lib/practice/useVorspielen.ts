"use client";

/**
 * Vorspielen als Schalter: einmal tippen startet, noch einmal bricht ab.
 *
 * Der Hook raeumt beim Verlassen der Seite und bei jedem Wechsel der Aufgabe
 * auf — sonst spielt die vorherige Uebung in die naechste hinein.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { type Klangschritt, vorspielen } from "@/lib/audio/vorspielen";
import { TEMPO } from "@/lib/music/rhythmus";

export interface Vorspiel {
  laeuft: boolean;
  /** Welcher Schritt gerade klingt, oder null. */
  schritt: number | null;
  umschalten: () => void;
  stoppen: () => void;
}

export function useVorspielen(
  schritte: readonly Klangschritt[],
  tempo = TEMPO,
): Vorspiel {
  const [laeuft, setLaeuft] = useState(false);
  const [schritt, setSchritt] = useState<number | null>(null);
  const abbrechen = useRef<(() => void) | null>(null);

  const stoppen = useCallback(() => {
    abbrechen.current?.();
    abbrechen.current = null;
  }, []);

  // Neue Aufgabe oder Seitenwechsel: nichts soll nachklingen.
  const kennung = schritte.map((s) => `${s.midis.join(".")}:${s.wert}`).join("|");
  useEffect(() => stoppen, [kennung, stoppen]);

  const umschalten = useCallback(() => {
    if (abbrechen.current) {
      stoppen();
      return;
    }
    setLaeuft(true);
    setSchritt(null);
    abbrechen.current = vorspielen(schritte, {
      tempo,
      aufSchritt: setSchritt,
      aufEnde: () => {
        abbrechen.current = null;
        setLaeuft(false);
        setSchritt(null);
      },
    });
  }, [schritte, tempo, stoppen]);

  return { laeuft, schritt, umschalten, stoppen };
}
