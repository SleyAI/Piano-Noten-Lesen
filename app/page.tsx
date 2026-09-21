"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import maskottchenBild from "@/public/maskottchen.png";
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
    <main className="flex h-full flex-col justify-center overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        {/* Klavier-Status rechts oben wie im Referenzdesign, weit weg vom Maskottchen */}
        <div className="flex justify-end w-full px-1 -mb-2 sm:-mb-1">
          <MidiStatus />
        </div>

        {/* Header im cozy Stil mit Maskottchen und fliegenden Noten */}
        <header className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-1">
          <h1 className="text-center font-titel text-4xl sm:text-6xl md:text-7xl font-bold text-[#785BA3] tracking-tight">
            Noten &amp; Akkorde lernen
          </h1>

          {/* Hüpfendes Maskottchen mit fliegenden Noten */}
          <div className="relative shrink-0 select-none animate-huepfen flex items-center justify-center">
            {/* Fliegende Noten */}
            <span
              className="absolute -top-2 -left-2 text-base sm:text-lg font-bold text-[#785BA3] animate-note-1 pointer-events-none"
              aria-hidden
            >
              ♪
            </span>
            <span
              className="absolute -top-3 -right-2 text-lg sm:text-xl font-bold text-[#9874CC] animate-note-2 pointer-events-none"
              aria-hidden
            >
              ♫
            </span>
            <span
              className="absolute -bottom-1 -right-2 text-sm sm:text-base font-bold text-[#785BA3] animate-note-3 pointer-events-none"
              aria-hidden
            >
              ♩
            </span>
            <span
              className="absolute -bottom-1 -left-2 text-xs sm:text-sm font-bold text-[#9874CC] animate-note-2 pointer-events-none"
              aria-hidden
            >
              ♬
            </span>

            {/* Maskottchen-Bild via Next Image (basePath-kompatibel) */}
            <Image
              src={maskottchenBild}
              alt=""
              priority
              className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain filter drop-shadow-sm pointer-events-none"
            />
          </div>
        </header>

        {/* Gemütliche Level-Leiste */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#785BA3]/10 shadow-[0_4px_20px_rgba(120,91,163,0.05)]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#EADCF5] text-[#785BA3] font-titel text-sm font-bold flex items-center justify-center shrink-0">
              {curLevel.id}
            </span>
            <div className="truncate">
              <span className="font-titel text-sm sm:text-base font-bold text-tinte">
                Level {curLevel.id}:
              </span>{" "}
              <span className="text-xs sm:text-sm text-tinte-leise font-medium">
                {curLevel.inhalt}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalManuellOffen(true)}
            className="shrink-0 ml-3 rounded-full bg-[#FAF5FD] border border-[#785BA3]/20 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#785BA3] hover:bg-[#785BA3] hover:text-white transition-all shadow-xs"
          >
            Level wechseln ▾
          </button>
        </div>

        {/* 2-Spalten-Bereich */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {/* Linke Seite: Übungen im DECKS-Stil der Referenz */}
          <Karte className="p-6 sm:p-7 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-titel text-xl font-bold text-tinte">Übungen</span>
                <span className="rounded-full bg-[#FAF5FD] border border-[#785BA3]/20 px-3 py-1 text-xs font-bold text-[#785BA3]">
                  2 Modi
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {MODI.map((modus) => (
                  <Link
                    key={modus.id}
                    href={modus.href}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-[#EDE0F5] hover:bg-[#E2CEF0] transition-all duration-200 border border-[#785BA3]/20 hover:border-[#785BA3]/45 hover:-translate-y-0.5 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-[#D7BEEB] text-[#785BA3] text-lg font-bold shadow-xs">
                        {modus.symbol}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-titel text-base sm:text-lg font-bold text-tinte group-hover:text-[#785BA3] transition-colors">
                          {modus.titel}
                        </h2>
                        {modus.tag && (
                          <span className="rounded-full bg-white/80 border border-[#785BA3]/15 text-[#785BA3] px-2.5 py-0.5 text-[11px] font-bold">
                            {modus.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[#785BA3] text-xl font-bold px-1 transition-transform duration-200 group-hover:translate-x-1 shrink-0">
                      ›
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Karte>

          {/* Rechte Seite: Timer oben, Statistik unten */}
          <div className="flex flex-col gap-5 sm:gap-6">
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
