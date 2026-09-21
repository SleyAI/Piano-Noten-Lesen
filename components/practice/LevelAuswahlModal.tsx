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
  hinweis = "Wähle dein Level. Du kannst es jederzeit anpassen.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-tinte/40 backdrop-blur-xs animate-auftauchen">
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-xl rounded-3xl bg-papier border border-papier-tief/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-papier-tief bg-white/60">
          <div>
            <h2 className="font-titel text-2xl font-bold text-[#785BA3]">{titel}</h2>
            <p className="text-xs text-tinte-leise mt-0.5">{hinweis}</p>
          </div>
          <button
            type="button"
            onClick={aufSchliessen}
            className="rounded-full p-2 text-tinte-leise hover:text-tinte hover:bg-papier-tief/60 transition-colors"
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
                        className={`group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl text-left transition-all duration-150 border shadow-xs ${
                          aktiv
                            ? "bg-white border-[#785BA3] ring-2 ring-[#785BA3]/20 shadow-sm"
                            : "bg-white/80 border-papier-tief hover:bg-white hover:border-[#785BA3]/30"
                        }`}
                      >
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-titel text-base font-bold ${
                            aktiv
                              ? "bg-[#785BA3] text-white"
                              : "bg-papier-tief text-tinte-leise group-hover:bg-[#EADCF5] group-hover:text-[#785BA3]"
                          }`}
                        >
                          {lvl.id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-titel text-sm sm:text-base font-bold text-tinte group-hover:text-[#785BA3] transition-colors leading-snug">
                            {lvl.titel}
                          </div>
                        </div>
                        {aktiv && (
                          <span className="text-xs font-bold text-[#785BA3] shrink-0">
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
