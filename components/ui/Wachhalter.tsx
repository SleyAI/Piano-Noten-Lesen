"use client";

/**
 * Haelt den Bildschirm wach, solange die Uebungsuhr laeuft — auf jeder Seite,
 * nicht nur waehrend einer einzelnen Uebung. Wer die Session startet und dann
 * eine Weile auf die Noten schaut, ohne zu spielen, soll den Bildschirm nicht
 * ausgehen sehen. Ist die Uhr angehalten, darf das Tablet wieder normal
 * abschalten.
 *
 * Steht ohne eigenes Aussehen im Layout — nur der Griff, kein Bild.
 */

import { useWachHalten } from "@/lib/practice/useWachHalten";
import { useUebungszeit } from "@/lib/store/uebungszeit";

export function Wachhalter() {
  const laeuft = useUebungszeit((z) => z.beginn !== null);
  useWachHalten(laeuft);
  return null;
}
