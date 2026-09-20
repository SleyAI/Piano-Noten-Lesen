import { MidiStatus } from "@/components/ui/MidiStatus";
import { SessionBand } from "@/components/ui/SessionBand";
import { SpielweiseWahl } from "@/components/ui/SpielweiseWahl";
import { KniffligeStellen } from "@/components/ui/KniffligeStellen";
import { Modusbild } from "@/components/ui/Modusbild";
import { Karte } from "@/components/ui/Karte";
import { WochenKarte } from "@/components/ui/Startkarten";

const MODI = [
  {
    href: "/melodien",
    titel: "Melodien",
    text: "Acht Töne aus deinem Vorrat — auf Wunsch mit Notenwerten und über beide Systeme hinweg.",
    akzent: "mint" as const,
    bild: "melodie" as const,
  },
  {
    href: "/akkorde",
    titel: "Akkorde",
    text: "Neue Griffe kennenlernen, Umkehrungen sitzen lassen, Folgen durchspielen.",
    akzent: "flieder" as const,
    bild: "akkord" as const,
  },
];

/**
 * Startseite:
 * Zentriertes, minimalistisches Dashboard mit max-w-4xl:
 * - Oben: zentrierter Titel "Noten & Akkorde lernen"
 * - 2-Spalten-Bereich: Links Melodien & Akkorde, rechts Stoppuhr & Statistik
 * - Unten: Einstellungen & Knifflige Stellen
 */
export default function Startseite() {
  return (
    <main className="flex h-full flex-col justify-center overflow-y-auto px-6 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        {/* Header mit zentriertem Titel */}
        <header className="relative flex shrink-0 items-center justify-center py-2">
          <h1 className="text-center font-titel text-4xl sm:text-5xl font-bold text-[#785BA3]">
            Noten &amp; Akkorde lernen
          </h1>
          <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2">
            <MidiStatus />
          </div>
        </header>

        {/* Mobile Midi-Status unter der Überschrift */}
        <div className="flex sm:hidden justify-center -mt-1">
          <MidiStatus />
        </div>

        {/* 2-Spalten-Bereich: Links Melodien & Akkorde, rechts Stoppuhr & Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Links: Melodien & Akkorde */}
          <div className="flex flex-col gap-4">
            {MODI.map((modus) => (
              <Karte
                key={modus.href}
                href={modus.href}
                akzent={modus.akzent}
                className="p-5 flex-1 justify-center"
              >
                <div className="flex items-center gap-4">
                  <Modusbild
                    bild={modus.bild}
                    className={`w-14 h-14 shrink-0 ${
                      modus.akzent === "mint" ? "text-mint-tief" : "text-flieder-tief"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-titel text-xl leading-tight font-bold text-tinte">
                      {modus.titel}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm leading-snug text-tinte-leise">
                      {modus.text}
                    </p>
                  </div>
                </div>
              </Karte>
            ))}
          </div>

          {/* Rechts: Stoppuhr & Statistik */}
          <div className="flex flex-col gap-4">
            <SessionBand className="flex-1 justify-center" />
            <WochenKarte className="flex-1 justify-center" />
          </div>
        </div>

        <KniffligeStellen className="shrink-0" />
        <SpielweiseWahl className="shrink-0" />
      </div>
    </main>
  );
}
