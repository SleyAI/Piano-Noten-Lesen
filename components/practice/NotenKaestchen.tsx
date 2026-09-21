"use client";

import { useCallback } from "react";
import type { UebungsNote } from "@/lib/music/curriculum";
import { type Stufe } from "@/lib/music/pitch";
import { tasteGedrueckt, tasteLosgelassen } from "@/lib/input/tippen";
import { aufwecken, spieleTon, stoppeTon } from "@/lib/audio/engine";

interface NotenKaestchenProps {
  erwarteteNote?: UebungsNote | null;
  mitKlang?: boolean;
  mitAlterationen?: boolean;
  className?: string;
}

const WEISSE_STUFEN: Stufe[] = ["C", "D", "E", "F", "G", "A", "H"];

const SCHWARZE_TASTEN: Array<{ name: string; stufe: Stufe; alteration: -1 | 1; offset: number }> = [
  { name: "C♯ / D♭", stufe: "C", alteration: 1, offset: 1 },
  { name: "D♯ / E♭", stufe: "D", alteration: 1, offset: 3 },
  { name: "F♯ / G♭", stufe: "F", alteration: 1, offset: 6 },
  { name: "G♯ / A♭", stufe: "G", alteration: 1, offset: 8 },
  { name: "A♯ / B", stufe: "A", alteration: 1, offset: 10 },
];

export function NotenKaestchen({
  erwarteteNote,
  mitKlang = true,
  mitAlterationen = false,
  className = "",
}: NotenKaestchenProps) {
  const triggerNote = useCallback(
    (midi: number) => {
      aufwecken();
      if (mitKlang) {
        spieleTon(midi);
        window.setTimeout(() => stoppeTon(midi), 240);
      }
      tasteGedrueckt(midi);
      window.setTimeout(() => tasteLosgelassen(midi), 100);
    },
    [mitKlang],
  );

  const klickStammton = useCallback(
    (stufe: Stufe) => {
      if (!erwarteteNote) {
        triggerNote(60);
        return;
      }

      const { note } = erwarteteNote;
      if (note.stufe === stufe && note.alteration === 0) {
        triggerNote(note.midi);
        return;
      }

      const stufenHalbton: Record<Stufe, number> = {
        C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, H: 11,
      };
      const oktave = note.oktave;
      const falschesMidi = (oktave + 1) * 12 + stufenHalbton[stufe];
      triggerNote(falschesMidi);
    },
    [erwarteteNote, triggerNote],
  );

  const klickSchwarz = useCallback(
    (item: (typeof SCHWARZE_TASTEN)[number]) => {
      if (!erwarteteNote) {
        triggerNote(61);
        return;
      }

      const { note } = erwarteteNote;
      const istTreffer =
        (note.stufe === item.stufe && note.alteration === item.alteration) ||
        ((note.midi % 12 + 12) % 12 === item.offset);

      if (istTreffer) {
        triggerNote(note.midi);
        return;
      }

      const oktave = note.oktave;
      const falschesMidi = (oktave + 1) * 12 + item.offset;
      triggerNote(falschesMidi);
    },
    [erwarteteNote, triggerNote],
  );

  return (
    <div className={`flex flex-col items-center justify-center gap-2 p-2 ${className}`}>
      {mitAlterationen && (
        <div className="flex justify-center gap-1.5 sm:gap-2 w-full max-w-2xl px-2">
          {SCHWARZE_TASTEN.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => klickSchwarz(s)}
              className="flex-1 py-2 sm:py-2.5 px-1 rounded-xl bg-tinte text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#4d3d63] active:scale-95 transition-all duration-100 text-center"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-1.5 sm:gap-2.5 w-full max-w-2xl px-2">
        {WEISSE_STUFEN.map((stufe) => (
          <button
            key={stufe}
            type="button"
            onClick={() => klickStammton(stufe)}
            className="flex-1 py-3.5 sm:py-4 px-2 rounded-2xl bg-white text-tinte text-lg sm:text-2xl font-bold shadow-sm border border-papier-tief hover:border-[#E86518]/40 hover:bg-[#FDF5ED] active:scale-95 transition-all duration-100 text-center"
          >
            {stufe}
          </button>
        ))}
      </div>
    </div>
  );
}
