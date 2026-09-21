"use client";

import { useEffect, useState } from "react";
import { Klaviatur } from "@/components/keyboard/Klaviatur";
import { Notensystem, type NotenSpalte, type SystemNote } from "@/components/notation/Notensystem";
import type { Griff } from "@/lib/music/akkorde";
import { fingersatz } from "@/lib/music/akkorduebung";
import { type Note, type Schluessel, name } from "@/lib/music/pitch";

const LUFT = 4;

function fingerFuer(toene: readonly Note[], umkehrung: number, hand: Schluessel) {
  return new Map(
    fingersatz(toene.length, umkehrung, hand).map((finger, i) => [toene[i].midi, String(finger)]),
  );
}

function parseTitel(rawTitel?: string): { hauptTitel: string; unterTitel?: string } {
  if (!rawTitel) return { hauptTitel: "" };
  const match = rawTitel.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return { hauptTitel: match[1].trim(), unterTitel: match[2].trim() };
  }
  return { hauptTitel: rawTitel };
}

export function Akkordbild({
  griff,
  umkehrung,
  ansichtVorgabe,
  titel,
  namenSichtbar = true,
  className = "",
}: {
  griff: Griff;
  umkehrung: number;
  ansichtVorgabe?: "noten" | "tastatur";
  titel?: string;
  namenSichtbar?: boolean;
  className?: string;
}) {
  const [ansicht, setAnsicht] = useState<"noten" | "tastatur">(ansichtVorgabe ?? "noten");

  // Synchronisieren, wenn sich die Ansichtsvorgabe von außen ändert (z. B. Toolbar oben)
  useEffect(() => {
    if (ansichtVorgabe) {
      setAnsicht(ansichtVorgabe);
    }
  }, [ansichtVorgabe]);

  const { noten, links, rechts } = griff;
  if (noten.length === 0) return null;

  const beschriftungen = new Map([
    ...fingerFuer(links, umkehrung, "bass"),
    ...fingerFuer(rechts, umkehrung, "violin"),
  ]);
  const hervorgehoben = new Map(noten.map((t) => [t.midi, "mint" as const]));

  const haende =
    links.length > 0 && rechts.length > 0
      ? "beide Hände"
      : rechts.length > 0
        ? "rechte Hand"
        : "linke Hand";

  const systemNoten: SystemNote[] = [
    ...rechts.map((note) => ({ note, schluessel: "violin" as const })),
    ...links.map((note) => ({ note, schluessel: "bass" as const })),
  ];

  const spalten: NotenSpalte[] = [
    {
      id: "akkord",
      noten: systemNoten,
      zustand: "ruhend",
    },
  ];

  function toggleAnsicht(e?: React.MouseEvent) {
    e?.stopPropagation();
    setAnsicht((a) => (a === "noten" ? "tastatur" : "noten"));
  }

  const { hauptTitel, unterTitel } = parseTitel(titel);
  const toeneText = (rechts.length > 0 ? rechts : links).map(name).join(" · ");
  const titelAnzeigen = namenSichtbar || ansicht === "tastatur";

  const minMidi = Math.min(...noten.map((n) => n.midi));
  const maxMidi = Math.max(...noten.map((n) => n.midi));

  return (
    <div
      className={`flex flex-col gap-3.5 rounded-3xl bg-[#FAF6FD] p-5 sm:p-6 shadow-sm border border-[#785BA3]/15 transition-all hover:shadow-md ${className}`}
    >
      {/* Flashcard Header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span
            className={`font-titel text-2xl sm:text-3xl font-bold transition-colors truncate ${
              titelAnzeigen ? "text-[#785BA3]" : "text-tinte-leise/60"
            }`}
          >
            {titelAnzeigen ? hauptTitel : "Akkord ?"}
          </span>
          {unterTitel && titelAnzeigen && (
            <span className="rounded-full bg-[#EADCF5] text-[#785BA3] px-3 py-0.5 text-xs font-bold shrink-0 shadow-2xs border border-[#785BA3]/20">
              {unterTitel}
            </span>
          )}
        </div>

        {/* Direkt umschaltbare Segment-Buttons */}
        <div className="inline-flex rounded-full bg-white p-1 border border-[#785BA3]/20 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAnsicht("noten");
            }}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              ansicht === "noten"
                ? "bg-[#785BA3] text-white shadow-xs"
                : "text-tinte-leise hover:text-[#785BA3]"
            }`}
          >
            🎼 Noten
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAnsicht("tastatur");
            }}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              ansicht === "tastatur"
                ? "bg-[#785BA3] text-white shadow-xs"
                : "text-tinte-leise hover:text-[#785BA3]"
            }`}
          >
            🎹 Tastatur
          </button>
        </div>
      </div>

      {/* Große Karte: Klickbar zum Umdrehen */}
      <div
        onClick={toggleAnsicht}
        className="cursor-pointer flex items-center justify-center bg-white rounded-2xl p-4 sm:p-5 min-h-[220px] sm:min-h-[250px] shadow-inner transition-all hover:ring-2 hover:ring-[#785BA3]/30 select-none group relative"
        title="Klicken zum Umdrehen (Noten / Tastatur)"
      >
        {ansicht === "noten" ? (
          <div className="w-full h-44 sm:h-52 flex items-center justify-center">
            <Notensystem
              spalten={spalten}
              beschreibung={
                titelAnzeigen ? `${titel ?? "Akkord"} im Notensystem` : "Akkord im Notensystem"
              }
              className="h-full w-full max-h-52 object-contain"
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-2">
            <div className="w-full max-w-md">
              <Klaviatur
                von={minMidi - LUFT}
                bis={maxMidi + LUFT}
                hervorgehoben={hervorgehoben}
                beschriftungen={beschriftungen}
                nurZeigen
                className="h-28 sm:h-36 w-full overflow-hidden rounded-xl border border-papier-tief shadow-2xs"
              />
            </div>
            <p className="text-[11px] font-semibold text-tinte-leise mt-3 text-center">
              💡 Ziffern zeigen den Fingersatz (1 = Daumen, 5 = kleiner Finger)
            </p>
          </div>
        )}
      </div>

      {/* Footer Text */}
      <div className="text-center">
        {titelAnzeigen ? (
          <p className="text-xs sm:text-sm font-semibold text-tinte-leise">
            {toeneText} — {haende}
          </p>
        ) : (
          <p className="text-xs font-medium text-tinte-leise/70">
            Klicken zum Umdrehen für Tasten &amp; Fingersatz
          </p>
        )}
      </div>
    </div>
  );
}
