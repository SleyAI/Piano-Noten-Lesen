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
  className = "",
}: {
  griff: Griff;
  umkehrung: number;
  ansichtVorgabe?: "noten" | "tastatur";
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

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl bg-papier-tief p-3 shadow-xs border border-papier-tief/80 ${className}`}
    >
      {/* Umschalt-Knopf als dezente Flashcard-Aktion */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-tinte-leise uppercase tracking-wider">
          {ansicht === "noten" ? "Notenbild" : "Klaviatur-Hilfe"}
        </span>
        <button
          type="button"
          onClick={umschalten}
          className="flex items-center gap-1 rounded-full bg-white/80 hover:bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#785BA3] shadow-xs transition-colors"
          title="Flashcard umdrehen"
        >
          {ansicht === "noten" ? "Tastatur zeigen" : "Noten zeigen"}
        </button>
      </div>

      {/* Große Anzeige: Entweder Noten (Standard) oder Klaviatur (Hilfe) */}
      <div
        onClick={umschalten}
        className="cursor-pointer flex items-center justify-center bg-white rounded-xl p-2 min-h-[140px] shadow-inner transition-all hover:ring-2 hover:ring-[#785BA3]/20"
        title="Klicken zum Umdrehen"
      >
        {ansicht === "noten" ? (
          <div className="w-full h-32 flex items-center justify-center">
            <Notensystem
              spalten={spalten}
              beschreibung="Akkord im Notensystem"
              className="h-full w-full max-h-32"
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
              className="h-24 w-full overflow-hidden rounded-b-xl"
            />
          </div>
        )}
      </div>

      <p className="text-center text-xs font-semibold text-tinte-leise">
        {(rechts.length > 0 ? rechts : links).map(name).join(" · ")} — {haende}
      </p>
    </div>
  );
}
