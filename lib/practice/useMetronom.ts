"use client";

/**
 * Das Metronom an die Einstellungen haengen.
 *
 * Es laeuft nur, solange eine Uebungsseite offen ist — beim Verlassen hoert
 * es auf, statt im Hintergrund weiterzuklicken.
 */

import { useEffect } from "react";
import { starteMetronom, stoppeMetronom } from "@/lib/audio/metronom";

export function useMetronom(an: boolean, tempo: number) {
  useEffect(() => {
    if (!an) {
      stoppeMetronom();
      return;
    }
    starteMetronom(tempo);
    return stoppeMetronom;
  }, [an, tempo]);
}
