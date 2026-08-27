"use client";

import { useSyncExternalStore } from "react";

/** Nichts zu abonnieren — der Wert wechselt genau einmal, beim Hydrieren. */
const NIE_AENDERND = () => () => {};

/**
 * Erst im Browser `true`.
 *
 * Die gespeicherten Einstellungen kommen aus dem localStorage und stehen beim
 * vorgerenderten HTML noch nicht zur Verfuegung. Alles, was davon abhaengt,
 * wartet auf dieses Signal — sonst weicht der erste Frame vom Server ab.
 */
export function useHydriert(): boolean {
  return useSyncExternalStore(
    NIE_AENDERND,
    () => true,
    () => false,
  );
}
