"use client";

import { useState } from "react";
import { Karte } from "./Karte";
import { useSekundentakt } from "@/lib/practice/useSekundentakt";
import { uhrzeitText } from "@/lib/practice/uebungszeit";
import { useUebungszeit } from "@/lib/store/uebungszeit";
import { useHydriert } from "@/lib/store/hydriert";

export function SessionBand({ className }: { className?: string }) {
  const hydriert = useHydriert();
  const beginn = useUebungszeit((z) => z.beginn);
  const starte = useUebungszeit((z) => z.starte);
  const beende = useUebungszeit((z) => z.beende);

  const [zielMinuten, setZielMinuten] = useState<number | null>(null);

  const jetzt = useSekundentakt(beginn !== null);

  if (!hydriert) return <div className={`h-64 rounded-[28px] bg-white ${className ?? ""}`} />;

  const laeuft = beginn !== null;
  const laufend = laeuft ? Math.max(0, Math.floor((jetzt - beginn) / 1000)) : 0;

  return (
    <Karte akzent="flieder" className={`p-4 sm:p-5 flex flex-col justify-between ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm select-none">⏱</span>
          <span className="font-titel text-lg sm:text-xl font-bold text-tinte">Timer</span>
          <span className="rounded-full bg-[#FAF5FD] border border-[#785BA3]/20 px-2 py-0.5 text-[11px] sm:text-xs font-bold text-[#785BA3]">
            {zielMinuten ? `${zielMinuten} Min Ziel` : "Stoppuhr"}
          </span>
        </div>
        {laeuft && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#EADCF5] px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-[#785BA3] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#785BA3]" />
            Läuft
          </span>
        )}
      </div>

      {/* Große Zeitanzeige */}
      <div className="my-2 sm:my-3 text-center">
        <span className="font-titel text-4xl sm:text-5xl font-bold text-[#785BA3] tracking-tight tabular-nums block">
          {uhrzeitText(laufend)}
        </span>

        {/* Quick Ziel-Chips wie im Referenzbild */}
        {!laeuft && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {[5, 15, 25].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setZielMinuten(zielMinuten === m ? null : m)}
                className={`rounded-xl px-2.5 py-0.5 text-xs font-bold transition-all ${
                  zielMinuten === m
                    ? "bg-[#785BA3] text-white shadow-xs"
                    : "bg-[#FAF5FD] text-tinte-leise hover:bg-[#EADCF5] hover:text-[#785BA3] border border-[#785BA3]/15"
                }`}
              >
                {m}m
              </button>
            ))}
            <button
              type="button"
              onClick={() => setZielMinuten(null)}
              className={`rounded-xl px-2.5 py-0.5 text-xs font-bold transition-all ${
                zielMinuten === null
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "bg-[#FAF5FD] text-tinte-leise hover:bg-[#EADCF5] hover:text-[#785BA3] border border-[#785BA3]/15"
              }`}
            >
              Frei
            </button>
          </div>
        )}
      </div>

      {/* Start/Stop-Button */}
      <div>
        <button
          type="button"
          onClick={laeuft ? beende : starte}
          className={`w-full rounded-2xl py-2 sm:py-2.5 px-4 font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 shadow-xs ${
            laeuft
              ? "bg-[#FAF5FD] border border-[#785BA3]/30 text-[#785BA3] hover:bg-[#EADCF5]"
              : "bg-[#785BA3] text-white hover:bg-[#654B8D] shadow-[#785BA3]/25 hover:-translate-y-0.5"
          }`}
        >
          {laeuft ? "⏹ Session beenden" : "▶ Start"}
        </button>
      </div>
    </Karte>
  );
}

export function Sessionuhr() {
  const hydriert = useHydriert();
  const beginn = useUebungszeit((z) => z.beginn);
  const beende = useUebungszeit((z) => z.beende);
  const jetzt = useSekundentakt(beginn !== null);

  if (!hydriert || beginn === null) return null;

  const laufend = Math.max(0, Math.floor((jetzt - beginn) / 1000));

  return (
    <button
      type="button"
      onClick={beende}
      title="Session beenden"
      className="flex items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#785BA3] shadow-xs border border-[#785BA3]/20 transition-colors hover:bg-[#EADCF5]"
    >
      <span className="tabular-nums font-semibold">{uhrzeitText(laufend)}</span>
    </button>
  );
}
