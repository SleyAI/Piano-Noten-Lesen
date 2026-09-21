"use client";

import {
  type AkkordKomplexitaet,
  type AkkordSpielart,
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
  haende: Haende;
  onHaendeChange: (h: Haende) => void;
  spielart: AkkordSpielart;
  onSpielartChange: (s: AkkordSpielart) => void;
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
  haende,
  onHaendeChange,
  spielart,
  onSpielartChange,
  ausgewaehlteAkkorde,
  onAkkordeChange,
  onWeiter,
}: AkkordAuswahlProps) {
  const info = KOMPLEXITAET_INFOS[komplexitaet];

  // Akkord aus der freien Liste anklicken
  function klickAkkord(symbol: string) {
    if (ausgewaehlteAkkorde.includes(symbol)) {
      if (ausgewaehlteAkkorde.length > 1) {
        onAkkordeChange(ausgewaehlteAkkorde.filter((s) => s !== symbol));
      }
    } else {
      onAkkordeChange([...ausgewaehlteAkkorde, symbol]);
    }
  }

  function loescheAkkord(index: number) {
    if (ausgewaehlteAkkorde.length <= 1) return;
    onAkkordeChange(ausgewaehlteAkkorde.filter((_, i) => i !== index));
  }

  // "Akkordfolge mit passenden Akkorden auffüllen"
  function auffuellen() {
    const basis = ausgewaehlteAkkorde[0] ?? "C";
    const gefuellt = passendeViererFolgeFuer(basis, komplexitaet);
    onAkkordeChange(gefuellt);
  }

  // Bei Umkehrungen: anderen Grundakkord wählen
  function waehleInversionenAkkord(symbol: string) {
    onInversionsAkkordChange(symbol);
    onSpielartChange("arpeggio"); // Arpeggios sind ideal für Inversionen
  }

  const aktuelleInversionen = inversionenFuerAkkord(inversionsAkkord);

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-4 sm:px-8 max-w-[1200px] mx-auto w-full pb-20">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-titel text-3xl sm:text-4xl font-bold text-[#785BA3]">
          Akkord-Setup
        </h2>
        <p className="text-xs sm:text-sm text-tinte-leise mt-1">
          Wähle dein Setup für die heutige Übungseinheit.
        </p>
      </div>

      {/* 1. Akkord-Komplexität */}
      <section className="w-full rounded-[24px] bg-white p-4 sm:p-5 border border-[#785BA3]/15 shadow-sm">
        <div className="flex items-center justify-between mb-2.5 px-1">
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
                  if (stufe === "erweitert") {
                    // Wenn erweitert, Inversionen als Option anbieten
                    onModusArtChange("inversionen");
                    onSpielartChange("arpeggio");
                  } else {
                    onModusArtChange("akkorde");
                    onAkkordeChange(passendeViererFolgeFuer("C", stufe));
                  }
                }}
                className={`flex flex-col text-left p-3 sm:p-3.5 rounded-2xl transition-all duration-200 border ${
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

      {/* 2. Hand-Fokus & Spielart (Nebeneinander für kompaktes Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Hand-Fokus */}
        <section className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#785BA3]/15 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="font-titel text-base font-bold text-tinte">
              2. Hand-Fokus
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "rechts" as const, titel: "Rechts", untertitel: "Violin" },
              { id: "links" as const, titel: "Links", untertitel: "Bass" },
              { id: "beide" as const, titel: "Beide", untertitel: "Systeme" },
            ].map((h) => {
              const aktiv = haende === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onHaendeChange(h.id)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all duration-200 border ${
                    aktiv
                      ? "bg-[#785BA3] text-white border-[#785BA3] shadow-xs"
                      : "bg-white border-papier-tief text-tinte hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]/40"
                  }`}
                >
                  <span className="font-titel text-sm font-bold leading-tight">
                    {h.titel}
                  </span>
                  <span
                    className={`text-[10px] mt-0.5 ${
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

        {/* Spielweise */}
        <section className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#785BA3]/15 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="font-titel text-base font-bold text-tinte">
              3. Spielweise
            </span>
            <span className="text-xs text-tinte-leise">
              {spielart === "arpeggio" ? "Töne nacheinander" : "Alle Töne gleichzeitig"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSpielartChange("griff")}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all duration-200 border ${
                spielart === "griff"
                  ? "bg-[#785BA3] text-white border-[#785BA3] shadow-xs"
                  : "bg-white border-papier-tief text-tinte hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]/40"
              }`}
            >
              <span className="font-titel text-sm font-bold leading-tight">
                🎹 Ganzer Griff
              </span>
              <span
                className={`text-[10px] mt-0.5 ${
                  spielart === "griff" ? "text-white/80" : "text-tinte-leise"
                }`}
              >
                Blockakkorde
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSpielartChange("arpeggio")}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all duration-200 border ${
                spielart === "arpeggio"
                  ? "bg-[#785BA3] text-white border-[#785BA3] shadow-xs"
                  : "bg-white border-papier-tief text-tinte hover:border-[#785BA3]/30 hover:bg-[#FAF6FD]/40"
              }`}
            >
              <span className="font-titel text-sm font-bold leading-tight">
                🌊 Arpeggios
              </span>
              <span
                className={`text-[10px] mt-0.5 ${
                  spielart === "arpeggio" ? "text-white/80" : "text-tinte-leise"
                }`}
              >
                Gebrochene Töne
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* 4. Akkord-Auswahl (Freie Auswahl oder Umkehrungen) */}
      <section className="w-full rounded-[24px] bg-white p-4 sm:p-5 border border-[#785BA3]/15 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <span className="font-titel text-base sm:text-lg font-bold text-tinte block">
              4. Akkorde wählen
            </span>
            <span className="text-xs text-tinte-leise">
              {modusArt === "inversionen"
                ? "Wähle einen Akkord, um Grundstellung und alle Umkehrungen zu üben."
                : "Wähle deine Akkorde frei aus oder fülle sie automatisch auf."}
            </span>
          </div>

          {/* Sub-Switch bei Erweitert: Umkehrungen vs. 4-Klänge */}
          {komplexitaet === "erweitert" && (
            <div className="inline-flex rounded-full bg-papier-tief p-1 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  onModusArtChange("inversionen");
                  onSpielartChange("arpeggio");
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                  modusArt === "inversionen"
                    ? "bg-[#785BA3] text-white shadow-xs"
                    : "text-tinte-leise hover:text-tinte"
                }`}
              >
                🔄 Umkehrungen (Inversionen)
              </button>
              <button
                type="button"
                onClick={() => {
                  onModusArtChange("akkorde");
                  onAkkordeChange(["C", "G7", "Am", "F"]);
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                  modusArt === "akkorde"
                    ? "bg-[#785BA3] text-white shadow-xs"
                    : "text-tinte-leise hover:text-tinte"
                }`}
              >
                🎼 4-Klänge &amp; Sus
              </button>
            </div>
          )}
        </div>

        {/* Fall 1: Umkehrungen-Modus */}
        {modusArt === "inversionen" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-tinte-leise uppercase tracking-wider">
                Akkord wählen:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {["C", "D", "E", "F", "G", "A", "Dm", "Em", "Am", "G7"].map((sym) => {
                const aktiv = inversionsAkkord === sym;
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => waehleInversionenAkkord(sym)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
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

            {/* Vorschau der Umkehrungen */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#FAF6FD] border border-[#785BA3]/15 mt-1">
              <span className="text-xs font-bold text-[#785BA3] uppercase tracking-wider px-1">
                Enthaltene Umkehrungen:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {aktuelleInversionen.map((inv) => (
                  <span
                    key={inv.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#785BA3]/25 px-3 py-1 text-xs sm:text-sm font-bold text-[#785BA3] shadow-2xs"
                  >
                    {inv.titel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Fall 2: Standard-Akkorde freie Auswahl */
          <div className="flex flex-col gap-3">
            {/* Deine Folge Anzeige mit Auffüllen-Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#FAF6FD] border border-[#785BA3]/15">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#785BA3] uppercase tracking-wider px-1">
                  Deine Folge:
                </span>
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

              {/* Button: Akkordfolge mit passenden Akkorden auffüllen */}
              <button
                type="button"
                onClick={auffuellen}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#EADCF5] hover:bg-[#D8C4EE] border border-[#785BA3]/30 px-3.5 py-1.5 text-xs font-bold text-[#785BA3] transition-all duration-150 active:scale-95 shadow-2xs"
                title="Ergänzt automatisch passende Akkorde auf eine 4er-Kadenz"
              >
                ✨ Mit passenden Akkorden auffüllen
              </button>
            </div>

            {/* Freie Akkord-Buttons */}
            <div>
              <p className="text-xs text-tinte-leise mb-2">
                Tippe Akkorde an, um sie hinzuzufügen oder abzuwählen:
              </p>
              <div className="flex flex-wrap gap-2">
                {info.einzelAkkorde.map((sym) => {
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
          </div>
        )}
      </section>

      {/* CTA-Button unten */}
      <div className="w-full max-w-md pt-2">
        <button
          type="button"
          onClick={onWeiter}
          className="w-full rounded-full bg-[#785BA3] px-8 py-4 text-base sm:text-lg font-bold text-white shadow-[0_6px_20px_rgba(120,91,163,0.25)] hover:bg-[#654B8D] hover:-translate-y-0.5 active:scale-98 transition-all duration-200"
        >
          Akkordfolge anzeigen →
        </button>
      </div>
    </div>
  );
}
