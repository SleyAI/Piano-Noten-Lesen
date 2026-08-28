"use client";

/**
 * Wie sieht dieser Akkord auf der Tastatur aus?
 *
 * Das Notenbild sagt, welche Toene gemeint sind; dieses Bild sagt, wo die
 * Hand hin muss. Beides nebeneinander ist der Schritt, den man beim Lernen
 * eines neuen Akkords tatsaechlich macht — deshalb steht es nicht in der
 * Uebung, sondern davor.
 *
 * Spielen beide Haende, tragen die Tasten beide Fingersaetze. Die Nummern
 * sind dieselben — der Daumen ist in jeder Hand die Eins —, sie laufen nur in
 * die andere Richtung.
 *
 * Die Tasten lassen sich nicht anfassen: hier wird geschaut, gespielt wird
 * auf der Uebungsklaviatur darunter.
 */

import { Klaviatur } from "@/components/keyboard/Klaviatur";
import type { Griff } from "@/lib/music/akkorde";
import { fingersatz } from "@/lib/music/akkorduebung";
import { type Note, type Schluessel, name } from "@/lib/music/pitch";

/** Etwas Luft links und rechts, damit der Griff nicht am Rand klebt. */
const LUFT = 5;

/** Fingernummern einer Hand, in der Reihenfolge ihrer Toene. */
function fingerFuer(toene: readonly Note[], umkehrung: number, hand: Schluessel) {
  return new Map(
    fingersatz(toene.length, umkehrung, hand).map((finger, i) => [toene[i].midi, String(finger)]),
  );
}

export function Akkordbild({
  griff,
  umkehrung,
  className,
}: {
  griff: Griff;
  umkehrung: number;
  className?: string;
}) {
  const { noten, links, rechts } = griff;
  if (noten.length === 0) return null;

  const beschriftungen = new Map([
    ...fingerFuer(links, umkehrung, "bass"),
    ...fingerFuer(rechts, umkehrung, "violin"),
  ]);
  const hervorgehoben = new Map(noten.map((t) => [t.midi, "mint" as const]));

  const haende =
    links.length > 0 && rechts.length > 0
      ? "beide Hände"
      : rechts.length > 0
        ? "rechte Hand"
        : "linke Hand";

  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl bg-papier-tief px-3 pt-2 pb-1.5 ${className ?? ""}`}
    >
      <Klaviatur
        von={noten[0].midi - LUFT}
        bis={noten[noten.length - 1].midi + LUFT}
        hervorgehoben={hervorgehoben}
        beschriftungen={beschriftungen}
        nurZeigen
        className="h-16 overflow-hidden rounded-b-xl"
      />
      <p className="text-center text-[0.7rem] leading-tight text-tinte-leise">
        {(rechts.length > 0 ? rechts : links).map(name).join(" · ")} — {haende}
      </p>
    </div>
  );
}
