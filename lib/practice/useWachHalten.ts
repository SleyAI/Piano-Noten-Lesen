"use client";

/**
 * Haelt den Bildschirm wach, solange geuebt wird — ohne an den
 * Systemeinstellungen zu drehen.
 *
 * Die Screen-Wake-Lock-API gibt es in Chrome auf dem Tablet. Der Griff gilt
 * nur fuer diese Seite: Ist die Uebung zu, darf das Tablet wieder normal
 * abschalten.
 *
 * Drei Tuecken sind eingebaut. Erstens loest das Betriebssystem den Griff
 * selbst, sobald der Tab in den Hintergrund geht (Bildschirm aus, App
 * gewechselt); kommt die Seite zurueck, greifen wir erneut. Zweitens gibt der
 * Browser den Griff mitunter auch aus eigenem Antrieb wieder her — etwa bei
 * knappem Akku —, ohne dass der Tab dabei den Vordergrund verlaesst; darum
 * horchen wir auf das `release` des Griffs und holen ihn nach, solange die
 * Seite sichtbar ist. Ohne das bleibt der Bildschirm nur an, solange man
 * tippt, und schlaeft in jeder Denkpause ein. Und drittens: schlaegt das
 * Greifen fehl — verboten, kein Akku, alter Browser — bleibt es einfach beim
 * gewohnten Verhalten, statt zu stoeren.
 */

import { useEffect } from "react";

export function useWachHalten(aktiv: boolean = true) {
  useEffect(() => {
    if (!aktiv) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let griff: WakeLockSentinel | null = null;
    let abgebrochen = false;

    // Gibt der Browser den Griff von sich aus her, gleich neu greifen.
    const beiFreigabe = () => {
      griff = null;
      if (!abgebrochen && document.visibilityState === "visible") void greifen();
    };

    const greifen = async () => {
      if (abgebrochen || griff !== null) return;
      if (document.visibilityState !== "visible") return;
      try {
        const neu = await navigator.wakeLock.request("screen");
        if (abgebrochen) {
          // Waehrend des Wartens schon abgebaut — sofort wieder loslassen.
          void neu.release();
          return;
        }
        griff = neu;
        griff.addEventListener("release", beiFreigabe);
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
      griff?.removeEventListener("release", beiFreigabe);
      void griff?.release();
      griff = null;
    };
  }, [aktiv]);
}
