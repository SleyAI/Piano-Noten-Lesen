"use client";

/**
 * Zeigt, wo man innerhalb eines Akkords steht: Grundstellung, dann die
 * Umkehrungen der Reihe nach.
 */

import { type Lage, umkehrungName } from "@/lib/music/akkorde";

export function Lagenband({
  lagen,
  aktuell,
}: {
  lagen: readonly Lage[];
  aktuell: number;
}) {
  return (
    <ol className="flex items-center gap-2">
      {lagen.map((l, i) => (
        <li
          key={l.umkehrung}
          aria-current={i === aktuell ? "step" : undefined}
          className={`rounded-full px-3 py-1 text-xs transition-colors duration-300 ${
            i < aktuell
              ? "bg-mint text-tinte"
              : i === aktuell
                ? "bg-himmel text-tinte"
                : "bg-papier-tief text-tinte-leise"
          }`}
        >
          {umkehrungName(l.umkehrung)}
        </li>
      ))}
    </ol>
  );
}
