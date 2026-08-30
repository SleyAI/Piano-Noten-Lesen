"use client";

/**
 * Ein Zeitstempel, der im Sekundentakt nachrueckt — solange er gebraucht wird.
 *
 * `Date.now()` mitten im Rendern aufzurufen macht eine Komponente unrein: das
 * Ergebnis haengt an etwas, das React nicht kennt, und zwei Durchlaeufe
 * liefern verschiedene Bilder. Also kommt die Uhrzeit aus einem Zustand, und
 * die einzige Stelle, die sie weiterstellt, ist ein Intervall.
 *
 * Steht die Uhr still, bleibt der Wert vom Aufbau der Komponente stehen. Das
 * reicht fuer alles, was sich ohnehin nur taeglich aendert.
 */

import { useEffect, useState } from "react";

export function useSekundentakt(aktiv: boolean): number {
  const [jetzt, setJetzt] = useState(() => Date.now());

  useEffect(() => {
    if (!aktiv) return;
    const uhr = window.setInterval(() => setJetzt(Date.now()), 1000);
    return () => window.clearInterval(uhr);
  }, [aktiv]);

  return jetzt;
}
