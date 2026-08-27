"use client";

/**
 * Modus 3 — Akkorde.
 *
 * Zwei Wege durch dieselben Akkorde: einzeln mit ihren Umkehrungen, oder als
 * ganze Folge. Die Akkordauswahl gilt fuer beide.
 */

import { useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { AkkordPaketWahl } from "@/components/practice/AkkordPaketWahl";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { gewaehlteAkkorde } from "@/lib/music/akkorde";
import { AkkordeUebung } from "./AkkordeUebung";
import { AkkordfolgenUebung } from "./AkkordfolgenUebung";

type Reiter = "einzeln" | "folgen";

export function AkkordSeite() {
  const hydriert = useHydriert();
  const [reiter, setReiter] = useState<Reiter>("einzeln");
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);
  const pakete = useEinstellungen((z) => z.akkordPakete);
  const abgewaehlt = useEinstellungen((z) => z.abgewaehlteAkkorde);

  if (!hydriert) return <div className="h-full bg-papier" />;

  const anzahl = gewaehlteAkkorde(pakete, abgewaehlt).length;

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Akkorde"
        unterzeile={`${anzahl} Akkorde im Vorrat`}
        rechts={
          <div className="flex gap-1 rounded-full bg-papier-tief p-1">
            {(
              [
                ["einzeln", "einzeln"],
                ["folgen", "Folgen"],
              ] as const
            ).map(([wert, beschriftung]) => (
              <button
                key={wert}
                type="button"
                aria-pressed={reiter === wert}
                onClick={() => {
                  setReiter(wert);
                  setZeigeAuswahl(false);
                }}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  reiter === wert ? "bg-flieder text-tinte" : "text-tinte-leise hover:bg-white/60"
                }`}
              >
                {beschriftung}
              </button>
            ))}
          </div>
        }
      />

      {zeigeAuswahl ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setZeigeAuswahl(false)}
              className="rounded-full bg-mint px-5 py-1.5 text-sm font-semibold text-tinte transition-colors hover:bg-mint-tief"
            >
              weiter üben
            </button>
          </div>
          <AkkordPaketWahl />
        </div>
      ) : reiter === "einzeln" ? (
        <AkkordeUebung aufAuswahl={() => setZeigeAuswahl(true)} />
      ) : (
        <AkkordfolgenUebung aufAuswahl={() => setZeigeAuswahl(true)} />
      )}
    </div>
  );
}
