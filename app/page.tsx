"use client";

import { useState } from "react";
import Link from "next/link";
import { MidiStatus } from "@/components/ui/MidiStatus";
import { SessionBand } from "@/components/ui/SessionBand";
import { SpielweiseWahl } from "@/components/ui/SpielweiseWahl";
import { Modusbild } from "@/components/ui/Modusbild";
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
      text: "8 Töne fließend lesen — Zufall oder Melodische Ketten.",
      akzent: "mint" as const,
      bild: "melodie" as const,
      melodieModus: "fliessend" as const,
      zusatz: `${curLevel.titel}`,
    },
    {
      id: "melodien-vorbereitung",
      href: "/melodien",
      titel: "Melodien mit Rhythmus",
      text: "Bereite eine kurze Melodie vor. Übe sie, bevor du dich prüfst.",
      akzent: "flieder" as const,
      bild: "melodie" as const,
      melodieModus: "vorbereitung" as const,
    },
    {
      id: "akkorde",
      href: "/akkorde",
      titel: "Akkorde",
      text: "Griffe kennenlernen, Umkehrungen festigen, Folgen durchspielen.",
      akzent: "flieder" as const,
      bild: "akkord" as const,
    },
  ];

  return (
    <main className="flex h-full flex-col justify-center overflow-y-auto px-6 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Header */}
        <header className="relative flex shrink-0 items-center justify-center pt-2">
          <h1 className="text-center font-titel text-5xl sm:text-6xl font-bold text-[#785BA3]">
            Noten &amp; Akkorde lernen
          </h1>
          <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2">
            <MidiStatus />
          </div>
        </header>

        {/* Mobile Midi-Status */}
        <div className="flex sm:hidden justify-center -mt-2">
          <MidiStatus />
        </div>

        {/* Level Schnell-Wahl Leiste auf dem Dashboard */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-xs border border-papier-tief">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#785BA3] text-white font-titel text-sm font-bold flex items-center justify-center">
              {curLevel.id}
            </span>
            <div>
              <div className="text-xs font-semibold text-tinte-leise uppercase tracking-wider">
                {curLevel.kategorieTitel}
              </div>
              <div className="font-titel text-base font-bold text-tinte">
                {curLevel.titel}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalManuellOffen(true)}
            className="rounded-full bg-[#EADCF5] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#785BA3] hover:bg-[#785BA3] hover:text-white transition-colors"
          >
            Level wechseln
          </button>
        </div>

        {/* 2-Spalten-Bereich */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Linke Seite: Übungen */}
          <Karte className="p-6 sm:p-7 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-titel text-2xl font-bold text-tinte">Übungen</span>
                <span className="rounded-full bg-papier-tief px-3.5 py-1 text-xs font-bold text-[#785BA3]">
                  3 Modi
                </span>
              </div>

              <div className="flex flex-col gap-3.5">
                {MODI.map((modus) => (
                  <Link
                    key={modus.id}
                    href={modus.href}
                    onClick={() => {
                      if (modus.melodieModus) {
                        useEinstellungen.getState().setzeMelodieModus(modus.melodieModus);
                      }
                    }}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-papier-tief/40 hover:bg-[#EADCF5]/40 transition-all duration-200 border border-papier-tief/80 hover:border-[#785BA3]/30 hover:-translate-y-0.5 shadow-sm"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        modus.akzent === "mint"
                          ? "bg-mint/60 text-mint-tief"
                          : "bg-[#EADCF5] text-[#785BA3]"
                      }`}
                    >
                      <Modusbild bild={modus.bild} className="w-9 h-9" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-titel text-xl font-bold text-tinte group-hover:text-[#785BA3] transition-colors">
                          {modus.titel}
                        </h2>
                        {modus.zusatz && (
                          <span className="rounded-full bg-[#EADCF5] text-[#785BA3] px-2 py-0.5 text-[10px] font-bold">
                            Level {curLevel.id}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-tinte-leise leading-snug mt-0.5">
                        {modus.text}
                      </p>
                    </div>
                    <span className="text-[#785BA3] text-xl font-bold px-1 transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Karte>

          {/* Rechte Seite: Stoppuhr oben, Statistik unten */}
          <div className="flex flex-col gap-6">
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
