"use client";

import Link from "next/link";
import { MidiStatus } from "@/components/ui/MidiStatus";
import { SessionBand } from "@/components/ui/SessionBand";
import { SpielweiseWahl } from "@/components/ui/SpielweiseWahl";
import { KniffligeStellen } from "@/components/ui/KniffligeStellen";
import { Modusbild } from "@/components/ui/Modusbild";
import { Karte } from "@/components/ui/Karte";
import { WochenKarte } from "@/components/ui/Startkarten";
import { useEinstellungen } from "@/lib/store/einstellungen";

const MODI = [
  {
    id: "melodien",
    href: "/melodien",
    titel: "Melodien",
    text: "Fließend vom Blatt spielen — reine Tonhöhen.",
    akzent: "mint" as const,
    bild: "melodie" as const,
    melodieModus: "fliessend" as const,
  },
  {
    id: "melodien-vorbereitung",
    href: "/melodien",
    titel: "Melodien mit Vorbereitung",
    text: "Erst anhören und üben, dann mit Notenwerten prüfen.",
    akzent: "flieder" as const,
    bild: "melodie" as const,
    melodieModus: "vorbereitung" as const,
  },
  {
    id: "akkorde",
    href: "/akkorde",
    titel: "Akkorde",
    text: "Neue Griffe kennenlernen, Umkehrungen sitzen lassen, Folgen durchspielen.",
    akzent: "flieder" as const,
    bild: "akkord" as const,
  },
];

/**
 * Startseite im Stil des Referenz-Dashboards:
 * - Oben: Großer zentrierter Titel "Noten & Akkorde lernen"
 * - Links: Große "Übungen"-Kachel mit den 3 Modi (Melodien, Melodien mit Vorbereitung, Akkorde)
 * - Rechts: Oben die Stoppuhr mit großem Timer & Button, unten die Wochenstatistik mit Notenlinien
 * - Unten: Einstellungen
 */
export default function Startseite() {
  return (
    <main className="flex h-full flex-col justify-center overflow-y-auto px-6 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Header mit zentriertem Titel & dezentem Status */}
        <header className="relative flex shrink-0 items-center justify-center pt-2">
          <h1 className="text-center font-titel text-5xl sm:text-6xl font-bold text-[#785BA3]">
            Noten &amp; Akkorde lernen
          </h1>
          <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2">
            <MidiStatus />
          </div>
        </header>

        {/* Mobile Midi-Status unter der Überschrift */}
        <div className="flex sm:hidden justify-center -mt-2">
          <MidiStatus />
        </div>

        {/* 2-Spalten-Bereich nach Referenzbild */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Linke Seite: Große Kachel "Übungen" mit den 3 Modi */}
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
                      <h2 className="font-titel text-xl font-bold text-tinte group-hover:text-[#785BA3] transition-colors">
                        {modus.titel}
                      </h2>
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

        <KniffligeStellen className="shrink-0" />
        <SpielweiseWahl className="shrink-0" />
      </div>
    </main>
  );
}
