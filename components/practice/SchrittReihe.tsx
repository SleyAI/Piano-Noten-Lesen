"use client";

/**
 * Eine Uebungsfolge im Notenbild: Griffe und Einzeltoene nebeneinander,
 * mit Cursor und Taktstrichen.
 *
 * Das ist die Ansicht, die eine Akkorduebung von der blossen Griffkarte
 * unterscheidet — man sieht die ganze Figur und weiss, wo man drin steht.
 *
 * In welches System ein Ton kommt, entscheidet allein seine Tonhoehe: alles
 * unterhalb der Bassgrenze steht unten. Bei einer Hand liegt die Grenze
 * ausserhalb, dann landet alles im selben System; bei beiden Haenden genau
 * zwischen ihnen.
 */

import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import { schluesselAn } from "@/lib/music/akkorde";
import type { UebungsSchritt } from "@/lib/music/akkorduebung";
import type { DanebenNote } from "@/lib/practice/danebenNote";

export function SchrittReihe({
  schritte,
  bassGrenze,
  position,
  daneben,
  /** Notenwerte zeigen? Ohne das bleiben blosse Koepfe stehen. */
  mitWerten = true,
  beschreibung,
}: {
  schritte: readonly UebungsSchritt[];
  bassGrenze: number;
  position: number;
  daneben: readonly DanebenNote[];
  mitWerten?: boolean;
  beschreibung: string;
}) {
  const spalten: NotenSpalte[] = schritte.map((schritt, i) => ({
    id: `${i}-${schritt.noten.map((n) => n.midi).join(".")}`,
    noten: schritt.noten.map((note) => ({
      note,
      schluessel: schluesselAn(note.midi, bassGrenze),
    })),
    zustand: i < position ? "richtig" : i === position ? "aktiv" : "ruhend",
    wert: mitWerten ? schritt.wert : undefined,
    taktEnde: mitWerten ? schritt.taktEnde : undefined,
    daneben: i === position && daneben.length > 0 ? [...daneben] : undefined,
  }));

  return <Notensystem spalten={spalten} beschreibung={beschreibung} className="h-full w-full" />;
}
