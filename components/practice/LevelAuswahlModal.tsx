"use client";

import { type HauptKategorie, type NotenLevelId, NOTEN_LEVELS } from "@/lib/music/levels";
import { useEinstellungen } from "@/lib/store/einstellungen";

interface LevelAuswahlModalProps {
  offen: boolean;
  aufSchliessen: () => void;
  titel?: string;
  hinweis?: string;
}

const KATEGORIEN: Array<{ key: HauptKategorie; titel: string; badge: string }> = [
  { key: "A", titel: "Hauptkategorie Level A: Landmark-Basis", badge: "Nur Fixpunkte" },
  { key: "B", titel: "Hauptkategorie Level B: Liniensystem", badge: "5 Linien" },
  { key: "C", titel: "Hauptkategorie Level C: Erweitert", badge: "Hilfslinien & Vorzeichen" },
];

export function LevelAuswahlModal({
  offen,
  aufSchliessen,
  titel = "Wähle dein Level",
  hinweis = "Du kannst das Level jederzeit während des Übens wechseln.",
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
      <div className="relative flex flex-col max-h-[92vh] w-full max-w-2xl rounded-3xl bg-papier border border-papier-tief/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-3 border-b border-papier-tief">
          <div>
            <h2 className="font-titel text-2xl sm:text-3xl font-bold text-[#785BA3]">{titel}</h2>
            <p className="text-xs sm:text-sm text-tinte-leise mt-1">{hinweis}</p>
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

        {/* Level-Liste grouped by Category */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
          {KATEGORIEN.map((kat) => {
            const levels = NOTEN_LEVELS.filter((l) => l.kategorie === kat.key);
            return (
              <div key={kat.key} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="font-titel text-sm font-bold text-tinte">{kat.titel}</span>
                  <span className="rounded-full bg-[#EADCF5]/60 px-2.5 py-0.5 text-[11px] font-bold text-[#785BA3]">
                    {kat.badge}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {levels.map((lvl) => {
                    const aktiv = notenLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => waehle(lvl.id)}
                        className={`group flex items-start gap-4 p-4 rounded-2xl text-left transition-all duration-150 border shadow-xs ${
                          aktiv
                            ? "bg-white border-[#785BA3] ring-2 ring-[#785BA3]/20 shadow-md"
                            : "bg-white/80 border-papier-tief hover:bg-white hover:border-[#785BA3]/40"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-titel text-lg font-bold ${
                            aktiv
                              ? "bg-[#785BA3] text-white"
                              : "bg-papier-tief text-tinte-leise group-hover:bg-[#EADCF5] group-hover:text-[#785BA3]"
                          }`}
                        >
                          {lvl.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className={`font-titel text-base font-bold ${
                                aktiv ? "text-[#785BA3]" : "text-tinte"
                              }`}
                            >
                              {lvl.titel}
                            </h3>
                            {aktiv && (
                              <span className="text-xs font-bold text-[#785BA3] shrink-0">
                                ✓ Aktiv
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-tinte-leise mt-1 leading-relaxed">
                            <strong className="text-tinte font-semibold">Fokus:</strong> {lvl.fokus}
                          </p>
                          <p className="text-xs text-tinte-leise mt-0.5 leading-relaxed">
                            <strong className="text-tinte font-semibold">Inhalt:</strong> {lvl.inhalt}
                          </p>
                        </div>
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
