"use client";

/**
 * Eine Uebungsfolge im Notenbild: Griffe und Einzeltoene nebeneinander,
 * mit Cursor und Taktstrichen.
 *
 * Das ist die Ansicht, die eine Akkorduebung von der blossen Griffkarte
 * unterscheidet — man sieht die ganze Figur und weiss, wo man drin steht.
 */

import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import type { UebungsSchritt } from "@/lib/music/akkorduebung";
import type { Schluessel } from "@/lib/music/pitch";
import type { DanebenNote } from "@/lib/practice/danebenNote";

export function SchrittReihe({
  schritte,
  schluessel,
  position,
  daneben,
  /** Notenwerte zeigen? Ohne das bleiben blosse Koepfe stehen. */
  mitWerten = true,
  beschreibung,
}: {
  schritte: readonly UebungsSchritt[];
  schluessel: Schluessel;
  position: number;
  daneben: readonly DanebenNote[];
  mitWerten?: boolean;
  beschreibung: string;
}) {
  const spalten: NotenSpalte[] = schritte.map((schritt, i) => ({
    id: `${i}-${schritt.noten.map((n) => n.midi).join(".")}`,
    noten: schritt.noten.map((note) => ({ note, schluessel })),
    zustand: i < position ? "richtig" : i === position ? "aktiv" : "ruhend",
    wert: mitWerten ? schritt.wert : undefined,
    taktEnde: mitWerten ? schritt.taktEnde : undefined,
    daneben: i === position && daneben.length > 0 ? [...daneben] : undefined,
  }));

  return <Notensystem spalten={spalten} beschreibung={beschreibung} className="h-full w-full" />;
}
