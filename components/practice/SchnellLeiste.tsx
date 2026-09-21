"use client";

import { useState } from "react";
import { levelInfo } from "@/lib/music/levels";
import { type TonabfolgeModus } from "@/lib/music/melodie";
import { type SchluesselWahl } from "@/lib/music/pitch";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { LevelAuswahlModal } from "./LevelAuswahlModal";

interface SchnellLeisteProps {
  onAenderung?: () => void;
}

export function SchnellLeiste({ onAenderung }: SchnellLeisteProps) {
  const [modalOffen, setModalOffen] = useState(false);

  const notenLevel = useEinstellungen((z) => z.notenLevel);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const setzeSchluesselWahl = useEinstellungen((z) => z.setzeSchluesselWahl);
  const abfolgeModus = useEinstellungen((z) => z.abfolgeModus);
  const setzeAbfolgeModus = useEinstellungen((z) => z.setzeAbfolgeModus);
  const eingabeModus = useEinstellungen((z) => z.eingabeModus);
  const setzeEingabeModus = useEinstellungen((z) => z.setzeEingabeModus);

  const curLevel = levelInfo(notenLevel);

  function waehleSchluessel(wahl: SchluesselWahl) {
    setzeSchluesselWahl(wahl);
    onAenderung?.();
  }

  function waehleAbfolge(modus: TonabfolgeModus) {
    setzeAbfolgeModus(modus);
    onAenderung?.();
  }

  return (
    <>
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white/70 backdrop-blur-xs border-b border-papier-tief shrink-0">
        {/* Level Schnell-Wähler */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOffen(true)}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDE8D3]/80 hover:bg-[#FDE8D3] border border-[#E86518]/20 shadow-xs transition-all duration-150 active:scale-98"
            title="Level wechseln"
          >
            <span className="w-5 h-5 rounded-full bg-[#E86518] text-white text-xs font-bold flex items-center justify-center">
              {curLevel.id}
            </span>
            <span className="font-titel text-xs sm:text-sm font-bold text-[#E86518] whitespace-nowrap">
              {curLevel.titel.split(":")[1]?.trim() ?? curLevel.titel}
            </span>
            <span className="text-[11px] text-[#E86518] transition-transform group-hover:translate-y-0.5">
              ▾
            </span>
          </button>
        </div>

        {/* Schlüssel / Hand */}
        <div className="inline-flex rounded-full bg-papier-tief/80 p-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => waehleSchluessel("beide")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
              schluesselWahl === "beide"
                ? "bg-white text-tinte shadow-xs"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Beide Hände
          </button>
          <button
            type="button"
            onClick={() => waehleSchluessel("violin")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
              schluesselWahl === "violin"
                ? "bg-white text-tinte shadow-xs"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Rechts
          </button>
          <button
            type="button"
            onClick={() => waehleSchluessel("bass")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
              schluesselWahl === "bass"
                ? "bg-white text-tinte shadow-xs"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Links
          </button>
        </div>

        {/* Tonabfolge Modus */}
        <div className="inline-flex rounded-full bg-papier-tief/80 p-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => waehleAbfolge("zufall")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
              abfolgeModus === "zufall"
                ? "bg-[#E86518] text-white shadow-xs"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Zufall (8 Töne)
          </button>
          <button
            type="button"
            onClick={() => waehleAbfolge("melodisch")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
              abfolgeModus === "melodisch"
                ? "bg-[#E86518] text-white shadow-xs"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Melodisch
          </button>
        </div>

        {/* Eingabe Modus */}
        <div className="inline-flex rounded-full bg-papier-tief/80 p-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => setzeEingabeModus("klaviatur")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
              eingabeModus === "klaviatur"
                ? "bg-white text-tinte shadow-xs"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Klaviatur
          </button>
          <button
            type="button"
            onClick={() => setzeEingabeModus("kaestchen")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
              eingabeModus === "kaestchen"
                ? "bg-white text-tinte shadow-xs"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Kästchen
          </button>
        </div>
      </div>

      <LevelAuswahlModal
        offen={modalOffen}
        aufSchliessen={() => {
          setModalOffen(false);
          onAenderung?.();
        }}
      />
    </>
  );
}
