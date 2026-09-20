"use client";

/**
 * Minimalistische Auswahl für die Melodien-Übung:
 * 1. Notenbereich: Landmarks vs. Darum herum vs. Mit Hilfslinien
 * 2. Tasten: Nur weiße vs. Auch schwarze
 * 3. Schlüssel: Beide Systeme vs. Nur Violin vs. Nur Bass
 */

import {
  NOTENBEREICH_WAHLEN,
  SCHLUESSEL_WAHLEN,
  TASTEN_WAHLEN,
} from "@/lib/music/curriculum";
import { useEinstellungen } from "@/lib/store/einstellungen";

export function NotenWahl() {
  const notenbereich = useEinstellungen((z) => z.notenbereich);
  const setzeNotenbereich = useEinstellungen((z) => z.setzeNotenbereich);
  const tastenwahl = useEinstellungen((z) => z.tastenwahl);
  const setzeTastenwahl = useEinstellungen((z) => z.setzeTastenwahl);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const setzeSchluesselWahl = useEinstellungen((z) => z.setzeSchluesselWahl);

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full py-4">
      {/* 1. Notenbereich */}
      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tinte-leise px-1">
          Notenbereich
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {NOTENBEREICH_WAHLEN.map((eintrag) => {
            const aktiv = notenbereich === eintrag.wert;
            return (
              <button
                key={eintrag.wert}
                type="button"
                onClick={() => setzeNotenbereich(eintrag.wert)}
                aria-pressed={aktiv}
                className={`flex items-center justify-center py-3.5 px-3 rounded-2xl text-center text-sm font-semibold transition-all duration-200 ${
                  aktiv
                    ? "bg-[#785BA3] text-white shadow-[0_4px_16px_rgba(120,91,163,0.25)] -translate-y-0.5"
                    : "bg-white text-tinte hover:bg-white/80 shadow-[0_2px_10px_rgba(120,91,163,0.06)]"
                }`}
              >
                {eintrag.titel}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Tasten */}
      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tinte-leise px-1">
          Tasten
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {TASTEN_WAHLEN.map((eintrag) => {
            const aktiv = tastenwahl === eintrag.wert;
            return (
              <button
                key={eintrag.wert}
                type="button"
                onClick={() => setzeTastenwahl(eintrag.wert)}
                aria-pressed={aktiv}
                className={`flex items-center justify-center py-3.5 px-3 rounded-2xl text-center text-sm font-semibold transition-all duration-200 ${
                  aktiv
                    ? "bg-[#785BA3] text-white shadow-[0_4px_16px_rgba(120,91,163,0.25)] -translate-y-0.5"
                    : "bg-white text-tinte hover:bg-white/80 shadow-[0_2px_10px_rgba(120,91,163,0.06)]"
                }`}
              >
                {eintrag.titel}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Schlüssel */}
      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tinte-leise px-1">
          Schlüssel
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {SCHLUESSEL_WAHLEN.map((eintrag) => {
            const aktiv = schluesselWahl === eintrag.wert;
            return (
              <button
                key={eintrag.wert}
                type="button"
                onClick={() => setzeSchluesselWahl(eintrag.wert)}
                aria-pressed={aktiv}
                className={`flex items-center justify-center py-3.5 px-3 rounded-2xl text-center text-sm font-semibold transition-all duration-200 ${
                  aktiv
                    ? "bg-[#785BA3] text-white shadow-[0_4px_16px_rgba(120,91,163,0.25)] -translate-y-0.5"
                    : "bg-white text-tinte hover:bg-white/80 shadow-[0_2px_10px_rgba(120,91,163,0.06)]"
                }`}
              >
                {eintrag.titel}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
