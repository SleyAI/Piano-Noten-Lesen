"use client";

import { useState } from "react";
import { Akkordbild } from "@/components/practice/Akkordbild";
import { type AkkordEintrag, type AkkordSpielart } from "@/lib/music/akkordSets";
import { griffFuerHaende, type Haende } from "@/lib/music/akkorde";

interface AkkordVorschauProps {
  eintraege: AkkordEintrag[];
  haende: Haende;
  spielart: AkkordSpielart;
  onSpielartChange: (s: AkkordSpielart) => void;
  onZurueck: () => void;
  onStartUebung: () => void;
}

export function AkkordVorschau({
  eintraege,
  haende,
  spielart,
  onSpielartChange,
  onZurueck,
  onStartUebung,
}: AkkordVorschauProps) {
  const [ansichtVorgabe, setAnsichtVorgabe] = useState<"noten" | "tastatur">("noten");
  const [namenSichtbar, setNamenSichtbar] = useState(true);

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4 max-w-6xl mx-auto w-full pb-16">
      {/* Kopfbereich */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
        <button
          type="button"
          onClick={onZurueck}
          className="rounded-full bg-white border border-[#785BA3]/20 px-4 py-2 text-xs sm:text-sm font-bold text-[#785BA3] hover:bg-[#FAF6FD] transition-colors self-start sm:self-auto"
        >
          ← Auswahl ändern
        </button>

        <div className="text-center">
          <h2 className="font-titel text-2xl sm:text-3xl font-bold text-[#785BA3]">
            {eintraege.map((e) => e.titel).join(" – ")}
          </h2>
          <p className="text-xs text-tinte-leise mt-0.5">
            Flashcards umdrehen für Tasten &amp; Fingersatz. Präge dir die Notenformen ein.
          </p>
        </div>

        {/* Steuerungs-Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          {/* Spielart Umschalter */}
          <div className="inline-flex rounded-full bg-white border border-[#785BA3]/15 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => onSpielartChange("griff")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                spielart === "griff"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
            >
              🎹 Ganzer Griff
            </button>
            <button
              type="button"
              onClick={() => onSpielartChange("arpeggio")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                spielart === "arpeggio"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
            >
              🌊 Arpeggio
            </button>
          </div>

          {/* Noten / Klaviatur */}
          <div className="inline-flex rounded-full bg-white border border-[#785BA3]/15 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setAnsichtVorgabe("noten")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                ansichtVorgabe === "noten"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
            >
              🎼 Noten
            </button>
            <button
              type="button"
              onClick={() => setAnsichtVorgabe("tastatur")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                ansichtVorgabe === "tastatur"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
            >
              🎹 Klaviatur
            </button>
          </div>

          <button
            type="button"
            onClick={() => setNamenSichtbar((v) => !v)}
            className={`rounded-full px-3 py-1 text-xs font-bold border transition-all ${
              !namenSichtbar
                ? "bg-[#EADCF5] text-[#785BA3] border-[#785BA3]/30"
                : "bg-white text-tinte-leise border-[#785BA3]/15 hover:text-[#785BA3]"
            }`}
          >
            {namenSichtbar ? "Namen verbergen" : "Namen zeigen"}
          </button>
        </div>
      </div>

      {/* Großes Flashcard-Raster */}
      <div
        className={`grid w-full gap-5 sm:gap-6 ${
          eintraege.length <= 3
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            : eintraege.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        }`}
      >
        {eintraege.map((eintrag) => {
          const griff = griffFuerHaende(eintrag.lage.toene, haende);

          return (
            <Akkordbild
              key={eintrag.id}
              griff={griff}
              umkehrung={eintrag.umkehrung}
              ansichtVorgabe={ansichtVorgabe}
              titel={eintrag.titel}
              namenSichtbar={namenSichtbar}
              className="w-full shadow-xs"
            />
          );
        })}
      </div>

      {/* Großer CTA-Button unten zum Starten der Übung */}
      <div className="w-full max-w-md pt-4">
        <button
          type="button"
          onClick={onStartUebung}
          className="w-full rounded-full bg-[#785BA3] px-10 py-4 text-lg font-bold text-white shadow-[0_6px_20px_rgba(120,91,163,0.25)] hover:bg-[#654B8D] hover:-translate-y-0.5 active:scale-98 transition-all duration-200"
        >
          Akkordfolge üben ▶
        </button>
      </div>
    </div>
  );
}
