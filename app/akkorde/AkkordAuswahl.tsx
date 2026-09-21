"use client";

import { useState } from "react";
import Image from "next/image";
import maskottchenBild from "@/public/maskottchen.png";
import {
  type AkkordKomplexitaet,
  KOMPLEXITAET_INFOS,
  inversionenFuerAkkord,
  passendeViererFolgeFuer,
} from "@/lib/music/akkordSets";
import type { Haende } from "@/lib/music/akkorde";

interface AkkordAuswahlProps {
  komplexitaet: AkkordKomplexitaet;
  onKomplexitaetChange: (k: AkkordKomplexitaet) => void;
  modusArt: "akkorde" | "inversionen";
  onModusArtChange: (m: "akkorde" | "inversionen") => void;
  inversionsAkkord: string;
  onInversionsAkkordChange: (akkord: string) => void;
  gewaehlteUmkehrungen: number[];
  onGewaehlteUmkehrungenChange: (u: number[]) => void;
  haende: Haende;
  onHaendeChange: (h: Haende) => void;
  ausgewaehlteAkkorde: string[];
  onAkkordeChange: (akkorde: string[]) => void;
  onWeiter: () => void;
}

export function AkkordAuswahl({
  komplexitaet,
  onKomplexitaetChange,
  modusArt,
  onModusArtChange,
  inversionsAkkord,
  onInversionsAkkordChange,
  gewaehlteUmkehrungen,
  onGewaehlteUmkehrungenChange,
  haende,
  onHaendeChange,
  ausgewaehlteAkkorde,
  onAkkordeChange,
  onWeiter,
}: AkkordAuswahlProps) {
  const info = KOMPLEXITAET_INFOS[komplexitaet];

  function klickAkkord(symbol: string) {
    if (ausgewaehlteAkkorde.includes(symbol)) {
      onAkkordeChange(ausgewaehlteAkkorde.filter((s) => s !== symbol));
    } else {
      onAkkordeChange([...ausgewaehlteAkkorde, symbol]);
    }
  }

  function loescheAkkord(index: number) {
    onAkkordeChange(ausgewaehlteAkkorde.filter((_, i) => i !== index));
  }

  const [auffuellVariation, setAuffuellVariation] = useState(0);

  function auffuellen() {
    const defaultBasis =
      komplexitaet === "komplex"
        ? "Cmaj7"
        : komplexitaet === "erweitert"
          ? "G7"
          : "C";
    const basis = ausgewaehlteAkkorde[0] ?? defaultBasis;
    const naechste = auffuellVariation + 1;
    setAuffuellVariation(naechste);
    const gefuellt = passendeViererFolgeFuer(basis, komplexitaet, naechste);
    onAkkordeChange(gefuellt);
  }

  function waehleInversionenAkkord(symbol: string) {
    onInversionsAkkordChange(symbol);
  }

  function schalteUmkehrung(u: number) {
    if (gewaehlteUmkehrungen.includes(u)) {
      if (gewaehlteUmkehrungen.length > 1) {
        onGewaehlteUmkehrungenChange(gewaehlteUmkehrungen.filter((x) => x !== u));
      }
    } else {
      const neu = [...gewaehlteUmkehrungen, u].sort((a, b) => a - b);
      onGewaehlteUmkehrungenChange(neu);
    }
  }

  const alleMoeglichenInversionen = inversionenFuerAkkord(inversionsAkkord);

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4 sm:px-8 max-w-[1200px] mx-auto w-full pb-20">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-titel text-3xl sm:text-4xl font-bold text-[#785BA3]">
          Einstellungen
        </h2>
      </div>

      {/* 1. Akkord-Komplexität / Typ */}
      <section className="w-full rounded-[24px] bg-white p-5 sm:p-6 border border-[#785BA3]/15 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-titel text-base sm:text-lg font-bold text-tinte">
            1. Akkord-Typ
          </span>
          <span className="text-xs text-tinte-leise font-medium">
            {info.beschreibung}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(["dreiklaenge", "inversionen", "erweitert", "komplex"] as const).map((stufe) => {
            const aktiv = komplexitaet === stufe;
            const stufenInfo = KOMPLEXITAET_INFOS[stufe];
            return (
              <button
                key={stufe}
                type="button"
                onClick={() => {
                  onKomplexitaetChange(stufe);
                  if (stufe === "inversionen") {
                    onModusArtChange("inversionen");
                  } else {
                    onModusArtChange("akkorde");
                  }
                }}
                className={`flex flex-col text-left p-4 rounded-2xl transition-all duration-200 border ${
                  aktiv
                    ? "bg-[#FAF6FD] border-[#785BA3] ring-2 ring-[#785BA3]/25 shadow-xs"
                    : "bg-white border-papier-tief hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]/40"
                }`}
              >
                <span
                  className={`font-titel text-sm sm:text-base font-bold ${
                    aktiv ? "text-[#785BA3]" : "text-tinte"
                  }`}
                >
                  {stufenInfo.titel}
                </span>
                <span className="text-xs text-tinte-leise mt-1 leading-snug">
                  {stufenInfo.beschreibung}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Hand-Fokus */}
      <section className="w-full rounded-[24px] bg-white p-5 sm:p-6 border border-[#785BA3]/15 shadow-sm">
        <div className="mb-3 px-1">
          <span className="font-titel text-base sm:text-lg font-bold text-tinte">
            2. Welche Hand möchtest du üben?
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-w-md">
          {[
            { id: "rechts" as const, titel: "Rechts" },
            { id: "links" as const, titel: "Links" },
            { id: "beide" as const, titel: "Beide" },
          ].map((h) => {
            const aktiv = haende === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onHaendeChange(h.id)}
                className={`flex items-center justify-center py-3.5 px-2 rounded-xl text-center transition-all duration-200 border ${
                  aktiv
                    ? "bg-[#785BA3] text-white border-[#785BA3] shadow-xs"
                    : "bg-white border-papier-tief text-tinte hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]/40"
                }`}
              >
                <span className="font-titel text-xs sm:text-sm font-bold leading-tight">
                  {h.titel}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Akkorde wählen */}
      <section className="w-full rounded-[24px] bg-white p-5 sm:p-6 border border-[#785BA3]/15 shadow-sm flex flex-col gap-4">
        <div>
          <span className="font-titel text-base sm:text-lg font-bold text-tinte block">
            Akkorde wählen
          </span>
          <span className="text-xs text-tinte-leise">
            {modusArt === "inversionen"
              ? "Wähle einen Akkord, um Grundstellung und alle Umkehrungen zu üben, oder wähle direkte Inversionen."
              : "Wähle deine Akkorde frei aus oder lasse dir eine passende Folge zusammenstellen."}
          </span>
        </div>

        {/* Fall 1: Umkehrungen-Modus */}
        {modusArt === "inversionen" ? (
          <div className="flex flex-col gap-5">
            {/* 1. Dur/Moll-Basis */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#785BA3] uppercase tracking-wider px-1">
                Dur/Moll-Basis
              </span>
              <div className="flex flex-wrap gap-2">
                {["C", "G", "D", "A", "E", "F", "Am", "Em", "Dm"].map((sym) => {
                  const aktiv = inversionsAkkord === sym;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => waehleInversionenAkkord(sym)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                        aktiv
                          ? "bg-[#785BA3] text-white shadow-xs scale-105"
                          : "bg-[#FAF6FD] text-tinte border border-papier-tief hover:border-[#785BA3]/30"
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Welche Umkehrungen möchtest du üben? */}
            <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[#FAF6FD] border border-[#785BA3]/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#785BA3] uppercase tracking-wider px-1">
                  Welche Umkehrungen für {inversionsAkkord} möchtest du üben?
                </span>
                <span className="text-xs text-tinte-leise font-medium">
                  Tippe zum An- oder Abwählen
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {alleMoeglichenInversionen.map((inv) => {
                  const istGewaehlt = gewaehlteUmkehrungen.includes(inv.umkehrung);
                  const label =
                    inv.umkehrung === 0
                      ? `Grundstellung (${inversionsAkkord})`
                      : inv.umkehrung === 1
                        ? `1. Umkehrung (Sextakkord)`
                        : `2. Umkehrung (Quartsextakkord)`;

                  return (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => schalteUmkehrung(inv.umkehrung)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all border ${
                        istGewaehlt
                          ? "bg-[#785BA3] text-white border-[#785BA3] shadow-xs"
                          : "bg-white text-tinte-leise border-[#785BA3]/20 hover:border-[#785BA3]/40 hover:text-tinte"
                      }`}
                    >
                      <span>{label}</span>
                      <span className="text-xs">{istGewaehlt ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Spezifische Inversions-Akkorde (Direktwahl) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#785BA3] uppercase tracking-wider">
                  Spezifische Inversions-Akkorde (Direktwahl)
                </span>
                <span className="text-xs text-tinte-leise">
                  Wählt Basis & Umkehrung direkt aus
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { sym: "C/E", basis: "C", umk: 1 },
                  { sym: "C/G", basis: "C", umk: 2 },
                  { sym: "G/B", basis: "G", umk: 1 },
                  { sym: "G/D", basis: "G", umk: 2 },
                  { sym: "F/A", basis: "F", umk: 1 },
                  { sym: "F/C", basis: "F", umk: 2 },
                  { sym: "Am/C", basis: "Am", umk: 1 },
                  { sym: "Am/E", basis: "Am", umk: 2 },
                ].map(({ sym, basis, umk }) => {
                  const aktiv =
                    inversionsAkkord === basis &&
                    gewaehlteUmkehrungen.length === 1 &&
                    gewaehlteUmkehrungen[0] === umk;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => {
                        onInversionsAkkordChange(basis);
                        onGewaehlteUmkehrungenChange([umk]);
                      }}
                      className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all border ${
                        aktiv
                          ? "bg-[#785BA3] text-white border-[#785BA3] shadow-xs scale-105"
                          : "bg-white text-tinte border-papier-tief hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]"
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Fall 2: Standard-Akkorde freie Auswahl nach strukturierten Gruppen */
          <div className="flex flex-col gap-5">
            {/* Thematische Gruppen von Akkorden */}
            {info.gruppen.map((gruppe) => (
              <div key={gruppe.titel} className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[#785BA3] uppercase tracking-wider px-1">
                  {gruppe.titel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {gruppe.akkorde.map((sym) => {
                    const istDrin = ausgewaehlteAkkorde.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => klickAkkord(sym)}
                        className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-150 border ${
                          istDrin
                            ? "bg-[#785BA3] text-white border-[#785BA3] shadow-xs scale-105"
                            : "bg-white text-tinte border-papier-tief hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Deine Auswahl + Button zum Auffüllen */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF6FD] border border-[#785BA3]/15 mt-2">
              <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
                <span className="text-xs font-bold text-[#785BA3] uppercase tracking-wider px-1">
                  Deine Auswahl:
                </span>
                {ausgewaehlteAkkorde.length === 0 ? (
                  <span className="text-xs sm:text-sm text-tinte-leise italic px-1">
                    Noch kein Akkord ausgewählt — tippe oben deine gewünschten Akkorde an
                  </span>
                ) : (
                  ausgewaehlteAkkorde.map((sym, idx) => (
                    <span
                      key={`${sym}-${idx}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#785BA3]/25 px-3 py-1 text-sm font-bold text-[#785BA3] shadow-2xs"
                    >
                      {sym}
                      <button
                        type="button"
                        onClick={() => loescheAkkord(idx)}
                        className="text-tinte-leise hover:text-rose-600 text-xs font-bold ml-0.5"
                        title={`${sym} entfernen`}
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Button: Lass Otto passende Akkorde auswählen */}
              <button
                type="button"
                onClick={auffuellen}
                className="shrink-0 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#EDE0F5] hover:bg-[#E2CEF0] border border-[#785BA3]/25 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#785BA3] transition-all duration-150 active:scale-95 shadow-xs hover:shadow-sm group"
                title="Otto wählt 4 unterschiedliche passende Akkorde für dich aus"
              >
                <Image
                  src={maskottchenBild}
                  alt=""
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-110 pointer-events-none"
                />
                <span>Lass Otto passende Akkorde auswählen</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* CTA-Button unten */}
      <div className="w-full max-w-md pt-2">
        <button
          type="button"
          onClick={onWeiter}
          disabled={modusArt === "akkorde" && ausgewaehlteAkkorde.length === 0}
          className={`w-full rounded-full px-8 py-4 text-base sm:text-lg font-bold transition-all duration-200 ${
            modusArt === "akkorde" && ausgewaehlteAkkorde.length === 0
              ? "bg-[#785BA3]/30 text-white/70 cursor-not-allowed"
              : "bg-[#785BA3] text-white shadow-[0_6px_20px_rgba(120,91,163,0.25)] hover:bg-[#654B8D] hover:-translate-y-0.5 active:scale-98"
          }`}
        >
          {modusArt === "akkorde" && ausgewaehlteAkkorde.length === 0
            ? "Wähle mindestens einen Akkord"
            : "Akkordfolge anzeigen →"}
        </button>
      </div>
    </div>
  );
}
