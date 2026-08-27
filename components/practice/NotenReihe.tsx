"use client";

/**
 * Eine Reihe von Noten im Doppelsystem, mit Cursor.
 *
 * Gespielte Toene bleiben mint stehen, der aktuelle ist hellblau markiert, und
 * ein Fehlgriff erscheint blass daneben.
 */

import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import type { UebungsNote } from "@/lib/music/curriculum";
import { uebungsSchluessel } from "@/lib/music/curriculum";
import type { DanebenNote } from "@/lib/practice/danebenNote";

export function NotenReihe({
  reihe,
  position,
  danebenNote,
  beschreibung,
}: {
  reihe: readonly UebungsNote[];
  position: number;
  danebenNote: DanebenNote | null;
  beschreibung: string;
}) {
  const spalten: NotenSpalte[] = reihe.map((ton, i) => ({
    id: `${i}-${uebungsSchluessel(ton)}`,
    noten: [ton],
    zustand: i < position ? "richtig" : i === position ? "aktiv" : "ruhend",
    daneben: i === position && danebenNote ? [danebenNote] : undefined,
  }));

  return <Notensystem spalten={spalten} beschreibung={beschreibung} className="h-full w-full" />;
}
