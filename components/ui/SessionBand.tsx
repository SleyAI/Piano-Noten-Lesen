"use client";

import { useState } from "react";
import { Karte } from "./Karte";
import { useSekundentakt } from "@/lib/practice/useSekundentakt";
import { dauerText, sekundenAmTag, uhrzeitText } from "@/lib/practice/uebungszeit";
import { useUebungszeit } from "@/lib/store/uebungszeit";
import { useHydriert } from "@/lib/store/hydriert";

export function SessionBand({ className }: { className?: string }) {
  const hydriert = useHydriert();
  const beginn = useUebungszeit((z) => z.beginn);
  const tage = useUebungszeit((z) => z.tage);
  const starte = useUebungszeit((z) => z.starte);
  const beende = useUebungszeit((z) => z.beende);

  const [zielMinuten, setZielMinuten] = useState<number | null>(null);

  const jetzt = useSekundentakt(beginn !== null);

  if (!hydriert) return <div className={`h-64 rounded-[28px] bg-white ${className ?? ""}`} />;

  const laeuft = beginn !== null;
  const laufend = laeuft ? Math.max(0, Math.floor((jetzt - beginn) / 1000)) : 0;
  const heute = sekundenAmTag(tage) + laufend;

  return (
    <Karte akzent="flieder" className={`p-6 sm:p-7 flex flex-col justify-between ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base select-none">⏱</span>
          <span className="font-titel text-xl font-bold text-tinte">Timer</span>
          <span className="rounded-full bg-[#F8F3EC] border border-[#794D2C]/20 px-2.5 py-0.5 text-xs font-bold text-[#794D2C]">
            {zielMinuten ? `${zielMinuten} Min Ziel` : "Stoppuhr"}
          </span>
        </div>
        {laeuft && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#EFE3D5] px-3 py-1 text-xs font-bold text-[#794D2C] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#794D2C]" />
            Läuft
          </span>
        )}
      </div>

      {/* Große Zeitanzeige */}
      <div className="my-4 text-center">
        <span className="font-titel text-5xl sm:text-6xl font-bold text-[#794D2C] tracking-tight tabular-nums block">
          {uhrzeitText(laufend)}
        </span>
        <p className="mt-1 text-xs font-semibold text-tinte-leise">
          {laeuft
            ? `Heute ${dauerText(heute)} geübt`
            : heute > 0
              ? `Heute schon ${dauerText(heute)} geübt`
              : "Session starten, um die Zeit zu erfassen"}
        </p>

        {/* Quick Ziel-Chips wie im Referenzbild */}
        {!laeuft && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {[5, 15, 25].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setZielMinuten(zielMinuten === m ? null : m)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  zielMinuten === m
                    ? "bg-[#794D2C] text-white shadow-xs"
                    : "bg-[#F8F3EC] text-tinte-leise hover:bg-[#EFE3D5] hover:text-[#794D2C] border border-[#794D2C]/15"
                }`}
              >
                {m}m
              </button>
            ))}
            <button
              type="button"
              onClick={() => setZielMinuten(null)}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                zielMinuten === null
                  ? "bg-[#794D2C] text-white shadow-xs"
                  : "bg-[#F8F3EC] text-tinte-leise hover:bg-[#EFE3D5] hover:text-[#794D2C] border border-[#794D2C]/15"
              }`}
            >
              Frei
            </button>
          </div>
        )}
      </div>

      {/* Großer Start/Stop-Button */}
      <div>
        <button
          type="button"
          onClick={laeuft ? beende : starte}
          className={`w-full rounded-2xl py-3.5 px-6 font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-98 shadow-sm ${
            laeuft
              ? "bg-[#F8F3EC] border border-[#794D2C]/30 text-[#794D2C] hover:bg-[#EFE3D5]"
              : "bg-[#794D2C] text-white hover:bg-[#5C361A] shadow-[#794D2C]/25 hover:-translate-y-0.5"
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
      className="flex items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#794D2C] shadow-xs border border-[#794D2C]/20 transition-colors hover:bg-[#EFE3D5]"
    >
      <span className="tabular-nums font-semibold">{uhrzeitText(laufend)}</span>
    </button>
  );
}
