"use client";

import { useState } from "react";
import { Akkordbild } from "@/components/practice/Akkordbild";
import { type Haende, type Lage, griffFuerHaende } from "@/lib/music/akkorde";

export interface VorbereitungsEintrag {
  id: string;
  titel: string;
  lage: Lage;
}

export function AkkordVorbereitung({
  titel,
  eintraege,
  haende,
  aufBereit,
  aufZurueck,
}: {
  titel: string;
  eintraege: VorbereitungsEintrag[];
  haende: Haende;
  aufBereit: () => void;
  aufZurueck?: () => void;
}) {
  const [ansichtVorgabe, setAnsichtVorgabe] = useState<"noten" | "tastatur">("noten");
  const [namenSichtbar, setNamenSichtbar] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4 max-w-6xl mx-auto w-full">
      <div className="text-center">
        <h2 className="font-titel text-2xl sm:text-3xl font-bold text-[#E86518]">{titel}</h2>
      </div>

      {/* Cozy Steuerungs-Leiste */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <div className="inline-flex rounded-full bg-white border border-[#E86518]/15 p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setAnsichtVorgabe("noten")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              ansichtVorgabe === "noten"
                ? "bg-[#E86518] text-white shadow-xs"
                : "text-tinte-leise hover:text-[#E86518]"
            }`}
          >
            🎼 Noten (Standard)
          </button>
          <button
            type="button"
            onClick={() => setAnsichtVorgabe("tastatur")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              ansichtVorgabe === "tastatur"
                ? "bg-[#E86518] text-white shadow-xs"
                : "text-tinte-leise hover:text-[#E86518]"
            }`}
          >
            🎹 Klaviatur-Hilfe
          </button>
        </div>

        <button
          type="button"
          onClick={() => setNamenSichtbar((v) => !v)}
          className={`rounded-full px-4 py-2 text-xs font-bold border transition-all ${
            namenSichtbar
              ? "bg-[#FDE8D3] text-[#E86518] border-[#E86518]/30"
              : "bg-white text-tinte-leise border-[#E86518]/15 hover:text-[#E86518]"
          }`}
        >
          {namenSichtbar ? "Akkordnamen verbergen" : "Akkordnamen einblenden"}
        </button>
      </div>

      {/* Großes Karten-Raster */}
      <div
        className={`grid w-full gap-5 sm:gap-6 ${
          eintraege.length <= 3 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {eintraege.map((eintrag) => {
          const griff = griffFuerHaende(eintrag.lage.toene, haende);

          return (
            <Akkordbild
              key={eintrag.id}
              griff={griff}
              umkehrung={eintrag.lage.umkehrung}
              ansichtVorgabe={ansichtVorgabe}
              titel={eintrag.titel}
              namenSichtbar={namenSichtbar}
              className="w-full shadow-xs"
            />
          );
        })}
      </div>

      {/* Aktionen */}
      <div className="flex items-center gap-4 mt-2">
        {aufZurueck && (
          <button
            type="button"
            onClick={aufZurueck}
            className="rounded-full bg-white border border-[#E86518]/20 px-6 py-3 text-sm font-bold text-tinte transition-colors hover:bg-[#FDF5ED]"
          >
            Auswahl ändern
          </button>
        )}
        <button
          type="button"
          onClick={aufBereit}
          className="rounded-full bg-[#E86518] px-10 py-3.5 text-lg font-bold text-white shadow-md hover:bg-[#CF530B] transition-all duration-200 active:scale-95"
        >
          Bin bereit!
        </button>
      </div>
    </div>
  );
}
