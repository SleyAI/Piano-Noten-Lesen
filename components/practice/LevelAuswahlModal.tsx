"use client";

import { type HauptKategorie, type NotenLevelId, NOTEN_LEVELS } from "@/lib/music/levels";
import { useEinstellungen } from "@/lib/store/einstellungen";

interface LevelAuswahlModalProps {
  offen: boolean;
  aufSchliessen: () => void;
  titel?: string;
  hinweis?: string;
}

const KATEGORIEN: Array<{ key: HauptKategorie; titel: string }> = [
  { key: "A", titel: "A: Ankerpunkte" },
  { key: "B", titel: "B: Liniensystem" },
  { key: "C", titel: "C: Erweitert" },
];

export function LevelAuswahlModal({
  offen,
  aufSchliessen,
  titel = "Level auswählen",
  hinweis = "Wähle dein Start-Level. Du kannst es jederzeit anpassen.",
}: LevelAuswahlModalProps) {
  const notenLevel = useEinstellungen((z) => z.notenLevel);
  const setzeNotenLevel = useEinstellungen((z) => z.setzeNotenLevel);
  const setzeStartLevelGewaehlt = useEinstellungen((z) => z.setzeStartLevelGewaehlt);

  if (!offen) return null;

  function waehle(id: NotenLevelId) {
    setzeNotenLevel(id);
    setzeStartLevelGewaehlt(true);
    aufSchliessen();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-tinte/30 backdrop-blur-xs animate-auftauchen">
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-lg rounded-[28px] bg-white border border-[#785BA3]/15 shadow-[0_20px_60px_rgba(120,91,163,0.18)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-papier-tief bg-[#FAF6FD]/60">
          <div>
            <h2 className="font-titel text-2xl font-bold text-[#785BA3]">{titel}</h2>
            <p className="text-xs text-tinte-leise mt-0.5">{hinweis}</p>
          </div>
          <button
            type="button"
            onClick={aufSchliessen}
            className="rounded-full w-8 h-8 flex items-center justify-center text-tinte-leise hover:text-[#785BA3] hover:bg-[#EADCF5]/60 transition-colors"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Level-Liste */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {KATEGORIEN.map((kat) => {
            const levels = NOTEN_LEVELS.filter((l) => l.kategorie === kat.key);
            return (
              <div key={kat.key} className="flex flex-col gap-2">
                <div className="px-1">
                  <span className="font-titel text-sm font-bold text-tinte tracking-wide">
                    {kat.titel}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {levels.map((lvl) => {
                    const aktiv = notenLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => waehle(lvl.id)}
                        className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-150 border ${
                          aktiv
                            ? "bg-[#F3ECF9] border-[#785BA3] shadow-xs"
                            : "bg-[#FAF6FD]/70 border-transparent hover:bg-[#F3ECF9]/60 hover:border-[#785BA3]/20"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-titel text-sm font-bold transition-colors ${
                              aktiv
                                ? "bg-[#785BA3] text-white shadow-xs"
                                : "bg-[#EADCF5] text-[#785BA3] group-hover:bg-[#785BA3] group-hover:text-white"
                            }`}
                          >
                            {lvl.id}
                          </span>
                          <div className="text-sm sm:text-base leading-snug truncate">
                            <span className="font-bold text-tinte mr-1.5">Level {lvl.id}:</span>
                            <span className={aktiv ? "text-tinte font-medium" : "text-tinte-leise group-hover:text-tinte"}>
                              {lvl.inhalt}
                            </span>
                          </div>
                        </div>
                        {aktiv && (
                          <span className="text-xs font-bold text-[#785BA3] shrink-0 ml-2">
                            ✓ Aktiv
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
