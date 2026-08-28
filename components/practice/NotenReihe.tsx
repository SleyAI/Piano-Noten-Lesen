"use client";

/**
 * Eine Reihe von Noten im Doppelsystem, mit Cursor.
 *
 * Gespielte Toene bleiben mint stehen, der aktuelle ist hellblau markiert, und
 * ein Fehlgriff erscheint blass neben der Note, bei der er passiert ist —
 * auch dann, wenn der Cursor deswegen schon wieder am Anfang steht.
 */

import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import type { UebungsNote } from "@/lib/music/curriculum";
import { uebungsSchluessel } from "@/lib/music/curriculum";
import { type NotenwertId, taktEnden } from "@/lib/music/rhythmus";
import type { DanebenNote } from "@/lib/practice/danebenNote";

export interface DanebenStelle {
  index: number;
  note: DanebenNote;
}

export function NotenReihe({
  reihe,
  werte,
  position,
  daneben,
  beschreibung,
}: {
  reihe: readonly UebungsNote[];
  /** Notenwerte, falls sie mitgeuebt werden. */
  werte?: readonly NotenwertId[];
  position: number;
  daneben: DanebenStelle | null;
  beschreibung: string;
}) {
  const enden = werte ? taktEnden(werte) : null;

  const spalten: NotenSpalte[] = reihe.map((ton, i) => ({
    id: `${i}-${uebungsSchluessel(ton)}`,
    noten: [ton],
    zustand: i < position ? "richtig" : i === position ? "aktiv" : "ruhend",
    wert: werte?.[i],
    taktEnde: enden?.[i],
    daneben: daneben?.index === i ? [daneben.note] : undefined,
  }));

  return <Notensystem spalten={spalten} beschreibung={beschreibung} className="h-full w-full" />;
}
