"use client";

/**
 * Haelt den Bildschirm wach, solange geuebt wird — ohne an den
 * Systemeinstellungen zu drehen.
 *
 * Die Screen-Wake-Lock-API gibt es in Chrome auf dem Tablet. Der Griff gilt
 * nur fuer diese Seite: Ist die Uebung zu, darf das Tablet wieder normal
 * abschalten.
 *
 * Zwei Tuecken sind eingebaut: Das Betriebssystem loest den Griff selbst,
 * sobald der Tab in den Hintergrund geht (Bildschirm aus, App gewechselt).
 * Kommt die Seite zurueck, greifen wir darum erneut. Und schlaegt das Greifen
 * fehl — verboten, kein Akku, alter Browser — bleibt es einfach beim
 * gewohnten Verhalten, statt zu stoeren.
 */

import { useEffect } from "react";

export function useWachHalten(aktiv: boolean = true) {
  useEffect(() => {
    if (!aktiv) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let griff: WakeLockSentinel | null = null;
    let abgebrochen = false;

    const greifen = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        griff = await navigator.wakeLock.request("screen");
        if (abgebrochen) {
          // Waehrend des Wartens schon abgebaut — sofort wieder loslassen.
          void griff.release();
          griff = null;
        }
      } catch {
        // Nicht erlaubt oder nicht moeglich: dann eben nicht.
      }
    };

    // Zurueck aus dem Hintergrund: Der alte Griff ist weg, also neu greifen.
    const beiSichtbarkeit = () => {
      if (document.visibilityState === "visible") void greifen();
    };

    void greifen();
    document.addEventListener("visibilitychange", beiSichtbarkeit);

    return () => {
      abgebrochen = true;
      document.removeEventListener("visibilitychange", beiSichtbarkeit);
      void griff?.release();
      griff = null;
    };
  }, [aktiv]);
}
