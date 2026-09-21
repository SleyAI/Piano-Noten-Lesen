"use client";

import { useState } from "react";
import {
  type AkkordKomplexitaet,
  KOMPLEXITAET_INFOS,
  passendeViererFolgeFuer,
} from "@/lib/music/akkordSets";
import type { Haende } from "@/lib/music/akkorde";

interface AkkordAuswahlProps {
  komplexitaet: AkkordKomplexitaet;
  onKomplexitaetChange: (k: AkkordKomplexitaet) => void;
  haende: Haende;
  onHaendeChange: (h: Haende) => void;
  ausgewaehlteAkkorde: string[];
  onAkkordeChange: (akkorde: string[]) => void;
  onWeiter: () => void;
}

export function AkkordAuswahl({
  komplexitaet,
  onKomplexitaetChange,
  haende,
  onHaendeChange,
  ausgewaehlteAkkorde,
  onAkkordeChange,
  onWeiter,
}: AkkordAuswahlProps) {
  const [auswahlArt, setAuswahlArt] = useState<"vorlagen" | "einzeln">("vorlagen");

  const info = KOMPLEXITAET_INFOS[komplexitaet];

  // Einen Akkord anklicken -> passende 4er-Folge erzeugen
  function klickEinzelAkkord(symbol: string) {
    if (ausgewaehlteAkkorde.includes(symbol)) {
      // Wenn bereits ausgewählt: wenn mehr als 1, abwählen, sonst beibehalten
      if (ausgewaehlteAkkorde.length > 1) {
        onAkkordeChange(ausgewaehlteAkkorde.filter((s) => s !== symbol));
      }
    } else {
      // Wenn weniger als 4 oder Nutzer will anhängen: anhängen
      if (ausgewaehlteAkkorde.length < 4) {
        onAkkordeChange([...ausgewaehlteAkkorde, symbol]);
      } else {
        // Bei neuem Klick auf einen Akkord: passende 4er-Folge ausgehend von diesem Akkord
        const folge = passendeViererFolgeFuer(symbol, komplexitaet);
        onAkkordeChange(folge);
      }
    }
  }

  function loescheAkkord(index: number) {
    if (ausgewaehlteAkkorde.length <= 1) return;
    onAkkordeChange(ausgewaehlteAkkorde.filter((_, i) => i !== index));
  }

  function setzeVorlage(symbole: string[]) {
    onAkkordeChange([...symbole]);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 px-4 max-w-4xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-titel text-3xl sm:text-4xl font-bold text-[#785BA3]">
          Akkord-Setup
        </h2>
        <p className="text-sm text-tinte-leise mt-1">
          Wähle in wenigen Klicks dein Training für heute.
        </p>
      </div>

      {/* 1. Akkord-Komplexität */}
      <section className="w-full rounded-[24px] bg-white p-5 sm:p-6 border border-[#785BA3]/15 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-titel text-base sm:text-lg font-bold text-tinte">
            1. Akkord-Komplexität
          </span>
          <span className="text-xs text-tinte-leise font-medium">
            {info.beschreibung}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(["dreiklaenge", "erweitert", "komplex"] as const).map((stufe) => {
            const aktiv = komplexitaet === stufe;
            const stufenInfo = KOMPLEXITAET_INFOS[stufe];
            return (
              <button
                key={stufe}
                type="button"
                onClick={() => {
                  onKomplexitaetChange(stufe);
                  // Standard-Vorlage für diese Stufe setzen
                  onAkkordeChange([...stufenInfo.vorlagen[0].symbole]);
                }}
                className={`flex flex-col text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border ${
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
                  {stufenInfo.kurztitel}
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
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="font-titel text-base sm:text-lg font-bold text-tinte">
            2. Hand-Fokus
          </span>
          <span className="text-xs text-tinte-leise font-medium">
            {haende === "rechts"
              ? "Nur Violinschlüssel"
              : haende === "links"
                ? "Nur Bassschlüssel"
                : "Beide Systeme"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: "rechts" as const, titel: "Rechte Hand", untertitel: "Violinschlüssel" },
            { id: "links" as const, titel: "Linke Hand", untertitel: "Bassschlüssel" },
            { id: "beide" as const, titel: "Beide Hände", untertitel: "Beide Systeme" },
          ].map((h) => {
            const aktiv = haende === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onHaendeChange(h.id)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl text-center transition-all duration-200 border ${
                  aktiv
                    ? "bg-[#785BA3] text-white border-[#785BA3] shadow-xs"
                    : "bg-white border-papier-tief text-tinte hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]/40"
                }`}
              >
                <span className="font-titel text-sm sm:text-base font-bold leading-tight">
                  {h.titel}
                </span>
                <span
                  className={`text-[11px] mt-0.5 ${
                    aktiv ? "text-white/80" : "text-tinte-leise"
                  }`}
                >
                  {h.untertitel}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Akkord-Pool / Kette wählen */}
      <section className="w-full rounded-[24px] bg-white p-5 sm:p-6 border border-[#785BA3]/15 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <span className="font-titel text-base sm:text-lg font-bold text-tinte block">
              3. Akkorde &amp; Kette wählen
            </span>
            <span className="text-xs text-tinte-leise">
              Wähle eine fertige Folge oder stelle deine Akkorde frei zusammen.
            </span>
          </div>

          {/* Sub-Switch: Vorlagen vs. Einzelauswahl */}
          <div className="inline-flex rounded-full bg-papier-tief p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAuswahlArt("vorlagen")}
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                auswahlArt === "vorlagen"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-tinte"
              }`}
            >
              🎵 Vorlagen
            </button>
            <button
              type="button"
              onClick={() => setAuswahlArt("einzeln")}
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                auswahlArt === "einzeln"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-tinte"
              }`}
            >
              🔘 Freie Auswahl
            </button>
          </div>
        </div>

        {/* Aktuell gewählte Kette / Preview-Pills */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#FAF6FD] border border-[#785BA3]/15">
          <span className="text-xs font-bold text-[#785BA3] uppercase tracking-wider px-1">
            Deine Folge:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {ausgewaehlteAkkorde.map((sym, idx) => (
              <span
                key={`${sym}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#785BA3]/25 px-3 py-1 text-sm font-bold text-[#785BA3] shadow-2xs"
              >
                {sym}
                {ausgewaehlteAkkorde.length > 1 && (
                  <button
                    type="button"
                    onClick={() => loescheAkkord(idx)}
                    className="text-tinte-leise hover:text-rose-600 text-xs font-bold ml-0.5"
                    title={`${sym} entfernen`}
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
          <span className="ml-auto text-xs text-tinte-leise font-semibold">
            {ausgewaehlteAkkorde.length} Akkorde
          </span>
        </div>

        {/* Ansicht 1: Fertige Vorlagen */}
        {auswahlArt === "vorlagen" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {info.vorlagen.map((vorlage) => {
              const istAktiv =
                ausgewaehlteAkkorde.length === vorlage.symbole.length &&
                ausgewaehlteAkkorde.every((s, i) => s === vorlage.symbole[i]);

              return (
                <button
                  key={vorlage.id}
                  type="button"
                  onClick={() => setzeVorlage(vorlage.symbole)}
                  className={`flex flex-col text-left p-3.5 rounded-2xl transition-all duration-200 border ${
                    istAktiv
                      ? "bg-[#FAF6FD] border-[#785BA3] ring-2 ring-[#785BA3]/25 shadow-xs"
                      : "bg-white border-papier-tief hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-titel text-sm font-bold text-tinte">
                      {vorlage.titel}
                    </span>
                    {istAktiv && (
                      <span className="text-[11px] font-bold text-[#785BA3]">
                        ✓ Gewählt
                      </span>
                    )}
                  </div>
                  {vorlage.beschreibung && (
                    <span className="text-xs text-tinte-leise mt-0.5 mb-2">
                      {vorlage.beschreibung}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {vorlage.symbole.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-[#EADCF5]/70 text-[#785BA3] px-2 py-0.5 text-xs font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Ansicht 2: Freie Einzelauswahl */}
        {auswahlArt === "einzeln" && (
          <div className="flex flex-col gap-2.5">
            <p className="text-xs text-tinte-leise">
              Tippe Akkorde an, um sie hinzuzufügen oder auszuwählen:
            </p>
            <div className="flex flex-wrap gap-2">
              {info.einzelAkkorde.map((sym) => {
                const istDrin = ausgewaehlteAkkorde.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => klickEinzelAkkord(sym)}
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
        )}
      </section>

      {/* CTA-Button unten */}
      <div className="w-full max-w-md pt-2">
        <button
          type="button"
          onClick={onWeiter}
          disabled={ausgewaehlteAkkorde.length === 0}
          className="w-full rounded-full bg-[#785BA3] px-8 py-4 text-base sm:text-lg font-bold text-white shadow-[0_6px_20px_rgba(120,91,163,0.25)] hover:bg-[#654B8D] hover:-translate-y-0.5 active:scale-98 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Akkordfolge anzeigen →
        </button>
      </div>
    </div>
  );
}
