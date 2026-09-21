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

  const istInversionsReihe =
    eintraege.length > 1 &&
    eintraege.every((e) => e.akkord.symbol === eintraege[0].akkord.symbol);

  const ueberschrift = istInversionsReihe
    ? `${eintraege[0].akkord.symbol} – Grundstellung & Umkehrungen`
    : `Akkordfolge: ${eintraege.map((e) => e.akkord.symbol).join(" · ")}`;

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4 sm:px-8 max-w-[1400px] mx-auto w-full pb-20">
      {/* Obere Navigations- und Kontrollleiste */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 bg-white/70 backdrop-blur-xs p-3.5 sm:p-4 rounded-3xl border border-[#785BA3]/15 shadow-2xs">
        <button
          type="button"
          onClick={onZurueck}
          className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#785BA3]/25 px-4 py-2 text-xs sm:text-sm font-bold text-[#785BA3] hover:bg-[#FAF6FD] hover:border-[#785BA3]/50 transition-all shadow-2xs self-start md:self-auto"
        >
          ← Zurück zur Auswahl
        </button>

        {/* Titel & Hinweis */}
        <div className="text-center">
          <h2 className="font-titel text-xl sm:text-2xl md:text-3xl font-bold text-[#785BA3]">
            {ueberschrift}
          </h2>
          <p className="text-xs sm:text-sm text-tinte-leise mt-0.5">
            Tippe auf eine Flashcard, um zwischen Noten und Klaviatur (Fingersatz) zu wechseln.
          </p>
        </div>

        {/* Steuerungs-Pills (Noten / Klaviatur) */}
        <div className="flex items-center justify-center shrink-0">
          <div className="inline-flex rounded-full bg-white border border-[#785BA3]/20 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setAnsichtVorgabe("noten")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                ansichtVorgabe === "noten"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
            >
              Alle Noten
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
              Alle Klaviaturen
            </button>
          </div>
        </div>
      </div>

      {/* Großes Flashcard-Raster: 4er Päckchen (2 oben, 2 unten) für breite, entspannte Karten */}
      <div
        className={`grid w-full gap-6 ${
          eintraege.length === 1
            ? "max-w-md mx-auto"
            : eintraege.length === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
              : eintraege.length === 3
                ? "grid-cols-1 md:grid-cols-3 max-w-[1300px] mx-auto"
                : "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto"
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
              namenSichtbar={true}
              className="w-full"
            />
          );
        })}
      </div>

      {/* Großer CTA-Bereich unten: Spielweise-Umschalter direkt neben Üben-Button */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
        {/* Spielart Umschalter (Ganzer Griff vs. Arpeggio) direkt beim Starten */}
        <div className="inline-flex rounded-full bg-white border border-[#785BA3]/20 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onSpielartChange("griff")}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
              spielart === "griff"
                ? "bg-[#785BA3] text-white shadow-xs"
                : "text-tinte-leise hover:text-[#785BA3]"
            }`}
          >
            Ganzer Griff
          </button>
          <button
            type="button"
            onClick={() => onSpielartChange("arpeggio")}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
              spielart === "arpeggio"
                ? "bg-[#785BA3] text-white shadow-xs"
                : "text-tinte-leise hover:text-[#785BA3]"
            }`}
          >
            Arpeggio
          </button>
        </div>

        {/* Start-Button */}
        <button
          type="button"
          onClick={onStartUebung}
          className="w-full sm:w-auto min-w-[280px] rounded-full bg-[#785BA3] px-10 py-4 text-lg font-bold text-white shadow-[0_6px_22px_rgba(120,91,163,0.3)] hover:bg-[#654B8D] hover:-translate-y-0.5 active:scale-98 transition-all duration-200 text-center"
        >
          Akkordfolge üben ▶
        </button>
      </div>
    </div>
  );
}
