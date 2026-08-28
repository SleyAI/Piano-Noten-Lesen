"use client";

/**
 * Der Uebungsplan in einer Zeile: Anfaenger, Fortgeschritten, Profi und wie
 * weit jede der drei Stufen abgehakt ist.
 *
 * Das Band waehlt nichts aus — es gibt nichts auszuwaehlen, seit alle Akkorde
 * ueberall zur Verfuegung stehen. Es zeigt nur, wo man steht, und fuehrt zum
 * ganzen Plan.
 */

import Link from "next/link";
import { NIVEAUS, fortschritt } from "@/lib/music/niveau";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";

export function NiveauBand({ className }: { className?: string }) {
  const hydriert = useHydriert();
  const beherrscht = useEinstellungen((z) => z.beherrscht);

  if (!hydriert) return <div className={`h-[4.5rem] ${className ?? ""}`} />;

  return (
    <section
      className={`flex flex-wrap items-center gap-3 rounded-[1.75rem] bg-papier-tief px-5 py-4 ${className ?? ""}`}
    >
      <div className="flex flex-wrap gap-2">
        {NIVEAUS.map((stufe) => {
          const stand = fortschritt(stufe.id, beherrscht);
          return (
            <span
              key={stufe.id}
              className={`flex items-baseline gap-2 rounded-2xl px-4 py-2 text-sm ${
                stand.vollstaendig ? "bg-mint text-tinte" : "bg-white/70 text-tinte-leise"
              }`}
            >
              <span className="font-semibold">{stufe.titel}</span>
              <span className="text-xs">
                {stand.geschafft}/{stand.gesamt}
              </span>
            </span>
          );
        })}
      </div>

      <Link
        href="/stand"
        className="ml-auto rounded-full bg-white/70 px-4 py-1.5 text-sm text-tinte transition-colors hover:bg-mint"
      >
        Übungsplan ansehen
      </Link>
    </section>
  );
}
