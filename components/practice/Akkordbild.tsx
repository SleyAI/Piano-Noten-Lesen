"use client";

import { useState } from "react";
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
  const [lokaleAnsicht, setLokaleAnsicht] = useState<"noten" | "tastatur">("noten");
  const ansicht = ansichtVorgabe ?? lokaleAnsicht;

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

  function umschalten() {
    setLokaleAnsicht((a) => (a === "noten" ? "tastatur" : "noten"));
  }

  const toeneText = (rechts.length > 0 ? rechts : links).map(name).join(" · ");
  const titelAnzeigen = namenSichtbar || ansicht === "tastatur";

  return (
    <div
      className={`flex flex-col gap-3 rounded-3xl bg-[#F8F3EC] p-4 sm:p-5 shadow-xs border border-[#794D2C]/15 transition-all ${className}`}
    >
      {/* Flashcard Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {titel && (
            <span
              className={`font-titel text-lg sm:text-xl font-bold transition-colors ${
                titelAnzeigen ? "text-tinte" : "text-tinte-leise/60"
              }`}
            >
              {titelAnzeigen ? titel : "Akkord ?"}
            </span>
          )}
          <span className="rounded-full bg-[#EFE3D5] border border-[#794D2C]/15 text-[#794D2C] px-2.5 py-0.5 text-[11px] font-bold">
            {ansicht === "noten" ? "Noten" : "Hilfe"}
          </span>
        </div>

        <button
          type="button"
          onClick={umschalten}
          className="flex items-center gap-1 rounded-full bg-white hover:bg-[#EFE3D5]/70 border border-[#794D2C]/20 px-3 py-1 text-xs font-bold text-[#794D2C] shadow-2xs transition-all active:scale-95"
          title="Flashcard umdrehen"
        >
          {ansicht === "noten" ? "🔄 Tastatur zeigen" : "🔄 Noten zeigen"}
        </button>
      </div>

      {/* Große Anzeige: Entweder Noten (Standard) oder Klaviatur (Hilfe) */}
      <div
        onClick={umschalten}
        className="cursor-pointer flex items-center justify-center bg-white rounded-2xl p-3 sm:p-4 min-h-[200px] sm:min-h-[240px] shadow-inner transition-all hover:ring-2 hover:ring-[#794D2C]/25 select-none"
        title="Klicken zum Umdrehen"
      >
        {ansicht === "noten" ? (
          <div className="w-full h-44 sm:h-52 flex items-center justify-center">
            <Notensystem
              spalten={spalten}
              beschreibung={titelAnzeigen ? `${titel ?? "Akkord"} im Notensystem` : "Akkord im Notensystem"}
              className="h-full w-full max-h-52 object-contain"
            />
          </div>
        ) : (
          <div className="w-full flex items-center justify-center py-2">
            <Klaviatur
              von={noten[0].midi - LUFT}
              bis={noten[noten.length - 1].midi + LUFT}
              hervorgehoben={hervorgehoben}
              beschriftungen={beschriftungen}
              nurZeigen
              className="h-28 sm:h-36 w-full overflow-hidden rounded-xl"
            />
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
