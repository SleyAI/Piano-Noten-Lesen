"use client";

/**
 * Wie sieht dieser Akkord auf der Tastatur aus?
 *
 * Das Notenbild sagt, welche Toene gemeint sind; dieses Bild sagt, wo die
 * Hand hin muss. Beides nebeneinander ist der Schritt, den man beim Lernen
 * eines neuen Akkords tatsaechlich macht — deshalb steht es nicht in der
 * Uebung, sondern davor.
 *
 * Die Tasten tragen ihre Fingernummern und lassen sich nicht anfassen: hier
 * wird geschaut, gespielt wird auf der Uebungsklaviatur darunter.
 */

import { Klaviatur } from "@/components/keyboard/Klaviatur";
import { fingersatz } from "@/lib/music/akkorduebung";
import { type Note, type Schluessel, name } from "@/lib/music/pitch";

/** Etwas Luft links und rechts, damit der Griff nicht am Rand klebt. */
const LUFT = 5;

export function Akkordbild({
  toene,
  umkehrung,
  schluessel,
  className,
}: {
  toene: readonly Note[];
  umkehrung: number;
  schluessel: Schluessel;
  className?: string;
}) {
  if (toene.length === 0) return null;

  const finger = fingersatz(toene.length, umkehrung, schluessel);
  const beschriftungen = new Map(toene.map((t, i) => [t.midi, String(finger[i])]));
  const hervorgehoben = new Map(toene.map((t) => [t.midi, "mint" as const]));

  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl bg-papier-tief px-3 pt-2 pb-1.5 ${className ?? ""}`}
    >
      <Klaviatur
        von={toene[0].midi - LUFT}
        bis={toene[toene.length - 1].midi + LUFT}
        hervorgehoben={hervorgehoben}
        beschriftungen={beschriftungen}
        nurZeigen
        className="h-16 overflow-hidden rounded-b-xl"
      />
      <p className="text-center text-[0.7rem] leading-tight text-tinte-leise">
        {toene.map(name).join(" · ")} — {schluessel === "violin" ? "rechte" : "linke"} Hand,
        Finger {finger.join("–")}
      </p>
    </div>
  );
}
