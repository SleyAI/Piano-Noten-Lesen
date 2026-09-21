"use client";

import { useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { AkkordLernen } from "./AkkordLernen";
import { AkkordfolgenUebung } from "./AkkordfolgenUebung";

const REITER = [
  { wert: "folgen", titel: "Basisakkorde & Folgen" },
  { wert: "inversionen", titel: "Inversionen" },
] as const;

export function AkkordSeite() {
  const hydriert = useHydriert();
  const rawModus = useEinstellungen((z) => z.akkordModus);
  const setzeModus = useEinstellungen((z) => z.setzeAkkordModus);
  const [wechsel, setWechsel] = useState(0);

  if (!hydriert) return <div className="h-full bg-papier" />;

  const modus = rawModus === "inversionen" || rawModus === "lernen" || rawModus === "umkehrungen"
    ? "inversionen"
    : "folgen";

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Akkorde"
        rechts={
          <div className="flex gap-1.5 rounded-full bg-papier-tief p-1">
            {REITER.map((reiter) => (
              <button
                key={reiter.wert}
                type="button"
                aria-pressed={modus === reiter.wert}
                onClick={() => {
                  setzeModus(reiter.wert);
                  setWechsel((w) => w + 1);
                }}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  modus === reiter.wert
                    ? "bg-flieder text-tinte shadow-sm"
                    : "text-tinte-leise hover:bg-white/60 hover:text-tinte"
                }`}
              >
                {reiter.titel}
              </button>
            ))}
          </div>
        }
      />

      {modus === "folgen" ? (
        <AkkordfolgenUebung key={wechsel} />
      ) : (
        <AkkordLernen key={`${modus}-${wechsel}`} />
      )}
    </div>
  );
}
