"use client";

import { type Akkord } from "@/lib/music/akkorde";
import { type Niveau, NIVEAU_REIHE, kuratierteAkkordeFuer } from "@/lib/music/niveau";
import { useEinstellungen } from "@/lib/store/einstellungen";

const NIVEAU_TITEL: Record<Niveau, string> = {
  anfaenger: "Anfänger",
  fortgeschritten: "Fortgeschritten",
  profi: "Profi",
};

export function KuratierteAkkordWahl({
  gewaehlteId,
  aufWahl,
}: {
  gewaehlteId: string | null;
  aufWahl: (akkord: Akkord) => void;
}) {
  const niveau = useEinstellungen((z) => z.akkordNiveau);
  const setzeNiveau = useEinstellungen((z) => z.setzeAkkordNiveau);

  const akkorde = kuratierteAkkordeFuer(niveau);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Niveau Switcher */}
      <div className="flex gap-1.5 rounded-full bg-papier-tief p-1.5">
        {NIVEAU_REIHE.map((n) => {
          const aktiv = n === niveau;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setzeNiveau(n)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                aktiv
                  ? "bg-flieder text-tinte font-semibold shadow-sm"
                  : "text-tinte-leise hover:bg-white/60 hover:text-tinte"
              }`}
            >
              {NIVEAU_TITEL[n]}
            </button>
          );
        })}
      </div>

      {/* Kuratierte Akkord-Buttons */}
      <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
        {akkorde.map((akkord) => {
          const aktiv = gewaehlteId === akkord.id;
          return (
            <button
              key={akkord.id}
              type="button"
              onClick={() => aufWahl(akkord)}
              className={`rounded-2xl px-5 py-3 text-base font-bold transition-all duration-200 ${
                aktiv
                  ? "bg-flieder text-tinte ring-2 ring-flieder-tief/40 scale-105 shadow-sm"
                  : "bg-papier-tief text-tinte hover:bg-flieder/40"
              }`}
            >
              {akkord.symbol}
            </button>
          );
        })}
      </div>
    </div>
  );
}
