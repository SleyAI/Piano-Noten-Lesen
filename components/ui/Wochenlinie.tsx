"use client";

import { type Tageseintrag, kurzeDauer, wochentagKurz } from "@/lib/practice/uebungszeit";

export function Wochenlinie({ tage }: { tage: readonly Tageseintrag[] }) {
  const maxSekunden = Math.max(15 * 60, ...tage.map((t) => t.sekunden));
  const heuteSchluessel = tage[tage.length - 1]?.schluessel;

  return (
    <div className="w-full flex items-end justify-between gap-1.5 sm:gap-3 px-1 pt-3 pb-1 h-36 select-none">
      {tage.map((tag) => {
        const istHeute = tag.schluessel === heuteSchluessel;
        const minuten = Math.round(tag.sekunden / 60);
        const hoeheProzent = tag.sekunden > 0 ? Math.max(16, Math.min(100, (tag.sekunden / maxSekunden) * 100)) : 0;

        return (
          <div key={tag.schluessel} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
            {/* Minuten-Anzeige oben */}
            <span
              className={`text-[11px] tabular-nums font-bold leading-none ${
                tag.sekunden > 0
                  ? istHeute
                    ? "text-[#E86518]"
                    : "text-tinte"
                  : "text-tinte-leise/50"
              }`}
            >
              {tag.sekunden > 0 ? `${minuten}m` : "0m"}
            </span>

            {/* Säule / Bar */}
            <div className="w-full flex items-end justify-center h-20">
              {tag.sekunden > 0 ? (
                <div
                  style={{ height: `${hoeheProzent}%` }}
                  className={`w-6 sm:w-8 rounded-full transition-all duration-300 ${
                    istHeute
                      ? "bg-[#E86518] shadow-sm shadow-[#E86518]/20"
                      : "bg-[#F4C7A5] hover:bg-[#EEB68E]"
                  }`}
                  title={`${wochentagKurz(tag.datum)}: ${kurzeDauer(tag.sekunden)}`}
                />
              ) : (
                <div
                  className={`w-6 sm:w-8 h-2.5 rounded-full border border-dashed ${
                    istHeute
                      ? "border-[#E86518]/60 bg-[#FDE8D3]/40"
                      : "border-papier-tief bg-white/60"
                  }`}
                  title={`${wochentagKurz(tag.datum)}: keine Übung`}
                />
              )}
            </div>

            {/* Wochentag-Beschriftung */}
            {istHeute ? (
              <span className="rounded-full bg-[#FDE8D3] px-1.5 py-0.5 text-[10px] font-bold text-[#E86518] leading-tight">
                Heute
              </span>
            ) : (
              <span className="text-xs font-bold text-tinte-leise leading-tight">
                {wochentagKurz(tag.datum)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
