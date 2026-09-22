"use client";

import { useState } from "react";
import Link from "next/link";
import { OttoMaskottchen } from "@/components/ui/OttoMaskottchen";
import { MidiStatus } from "@/components/ui/MidiStatus";
import { SessionBand } from "@/components/ui/SessionBand";
import { SpielweiseWahl } from "@/components/ui/SpielweiseWahl";
import { Karte } from "@/components/ui/Karte";
import { WochenKarte } from "@/components/ui/Startkarten";
import { LevelAuswahlModal } from "@/components/practice/LevelAuswahlModal";
import { levelInfo } from "@/lib/music/levels";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";

export default function Startseite() {
  const hydriert = useHydriert();
  const notenLevel = useEinstellungen((z) => z.notenLevel);
  const startLevelGewaehlt = useEinstellungen((z) => z.startLevelGewaehlt);
  const setzeStartLevelGewaehlt = useEinstellungen((z) => z.setzeStartLevelGewaehlt);

  const [modalDismissed, setModalDismissed] = useState(false);
  const [modalManuellOffen, setModalManuellOffen] = useState(false);
  const modalOffen = modalManuellOffen || (hydriert && !startLevelGewaehlt && !modalDismissed);

  const curLevel = levelInfo(notenLevel);

  const MODI = [
    {
      id: "melodien",
      href: "/melodien",
      titel: "Noten lesen",
      symbol: "♫",
      tag: `Level ${curLevel.id}`,
      melodieModus: "fliessend" as const,
    },
    {
      id: "melodien-vorbereitung",
      href: "/melodien",
      titel: "Melodie üben",
      symbol: "♪",
      tag: "Vorbereitung",
      melodieModus: "vorbereitung" as const,
    },
    {
      id: "akkorde",
      href: "/akkorde",
      titel: "Akkorde",
      symbol: "♩",
      tag: "Griffe & Folgen",
    },
  ];

  return (
    <main className="flex h-full flex-col overflow-y-auto px-4 sm:px-6 lg:px-8 pt-[max(0.75rem,calc(env(safe-area-inset-top)+0.5rem))] sm:pt-4 md:pt-5 lg:pt-6 pb-4 sm:pb-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:gap-3.5 md:gap-4 my-auto">
        {/* Header im cozy Stil mit Maskottchen und fliegenden Noten */}
        <header className="relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 py-0.5 text-center">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
            <h1 className="font-titel text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#785BA3] tracking-tight leading-tight">
              Notenlesen üben
            </h1>

            {/* Interaktives Maskottchen mit hochschießenden Noten bei Klick */}
            <OttoMaskottchen bildClassName="w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13" />
          </div>
          <p className="font-titel text-xs sm:text-sm md:text-base font-medium text-[#785BA3]/80 -mt-0.5">
            mit Otto
          </p>

          {/* Klavier-Status rechts im Header auf Tablets und Desktop */}
          <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2">
            <MidiStatus />
          </div>
        </header>

        {/* Mobile Klavier-Status (unter Header auf kleinen Smartphones) */}
        <div className="flex sm:hidden justify-center -mt-0.5">
          <MidiStatus />
        </div>

        {/* Gemütliche Level-Leiste */}
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white border border-[#785BA3]/10 shadow-[0_4px_20px_rgba(120,91,163,0.05)]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EADCF5] text-[#785BA3] font-titel text-xs sm:text-sm font-bold flex items-center justify-center shrink-0">
              {curLevel.id}
            </span>
            <div className="truncate">
              <span className="font-titel text-xs sm:text-sm md:text-base font-bold text-tinte">
                Level {curLevel.id}:
              </span>{" "}
              <span className="text-[11px] sm:text-xs md:text-sm text-tinte-leise font-medium">
                {curLevel.inhalt}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalManuellOffen(true)}
            className="shrink-0 ml-2 sm:ml-3 rounded-full bg-[#FAF5FD] border border-[#785BA3]/20 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs sm:text-sm font-bold text-[#785BA3] hover:bg-[#785BA3] hover:text-white transition-all shadow-xs"
          >
            Level wechseln ▾
          </button>
        </div>

        {/* 2-Spalten-Bereich: Auf Tablets (ab md: 768px) direkt 2 Spalten! */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 md:gap-4 items-stretch">
          {/* Linke Seite: Übungen im DECKS-Stil der Referenz */}
          <Karte className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <span className="font-titel text-lg sm:text-xl font-bold text-tinte">Übungen</span>
                <span className="rounded-full bg-[#FAF5FD] border border-[#785BA3]/20 px-2.5 py-0.5 text-xs font-bold text-[#785BA3]">
                  3 Modi
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:gap-2.5">
                {MODI.map((modus) => (
                  <Link
                    key={modus.id}
                    href={modus.href}
                    onClick={() => {
                      if (modus.melodieModus) {
                        useEinstellungen.getState().setzeMelodieModus(modus.melodieModus);
                      }
                    }}
                    className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#EDE0F5] hover:bg-[#E2CEF0] transition-all duration-200 border border-[#785BA3]/20 hover:border-[#785BA3]/45 hover:-translate-y-0.5 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#D7BEEB] text-[#785BA3] text-base sm:text-lg font-bold shadow-xs">
                        {modus.symbol}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h2 className="font-titel text-sm sm:text-base font-bold text-tinte group-hover:text-[#785BA3] transition-colors">
                          {modus.titel}
                        </h2>
                        {modus.tag && (
                          <span className="rounded-full bg-white/80 border border-[#785BA3]/15 text-[#785BA3] px-2 py-0.5 text-[10px] sm:text-[11px] font-bold">
                            {modus.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[#785BA3] text-lg sm:text-xl font-bold px-1 transition-transform duration-200 group-hover:translate-x-1 shrink-0">
                      ›
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Karte>

          {/* Rechte Seite: Timer oben, Statistik unten */}
          <div className="flex flex-col gap-3 sm:gap-3.5 md:gap-4">
            <SessionBand />
            <WochenKarte />
          </div>
        </div>

        <SpielweiseWahl className="shrink-0" />
      </div>

      <LevelAuswahlModal
        offen={modalOffen}
        aufSchliessen={() => {
          setModalManuellOffen(false);
          setModalDismissed(true);
          setzeStartLevelGewaehlt(true);
        }}
        titel="Level auswählen"
        hinweis="Wähle dein Start-Level. Du kannst es jederzeit anpassen."
      />
    </main>
  );
}
