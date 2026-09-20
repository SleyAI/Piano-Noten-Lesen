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
 * Links: kompakte Modi-Kacheln für „Melodien“ und „Akkorde“
 * Rechts: Stoppuhr (Session starten) und Wochenstatistik auf Notenlinien
 * Unten: Knifflige Stellen & Einstellungen
 */
export default function Startseite() {
  return (
    <main className="flex h-full flex-col justify-center-safe gap-4 overflow-y-auto px-8 py-6">
      <header className="flex shrink-0 items-center justify-between gap-4">
        <h1 className="font-titel text-5xl sm:text-6xl leading-tight font-bold text-[#785BA3]">
          Noten &amp; Akkorde lernen
        </h1>
        <MidiStatus />
      </header>

      {/* 2-Spalten-Bereich: Links Melodien & Akkorde, rechts Stoppuhr & Statistik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
        {/* Links: Melodien & Akkorde in kleineren, kompakten Containern */}
        <div className="flex flex-col gap-4">
          {MODI.map((modus) => (
            <Karte key={modus.href} href={modus.href} akzent={modus.akzent} className="p-5 flex-1">
              <div className="flex items-center gap-4">
                <Modusbild
                  bild={modus.bild}
                  className={`w-16 h-16 shrink-0 ${
                    modus.akzent === "mint" ? "text-mint-tief" : "text-flieder-tief"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-titel text-2xl leading-tight font-bold text-tinte">
                    {modus.titel}
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-tinte-leise">{modus.text}</p>
                </div>
              </div>
            </Karte>
          ))}
        </div>

        {/* Rechts: Stoppuhr & Statistik */}
        <div className="flex flex-col gap-4">
          <SessionBand />
          <WochenKarte />
        </div>
      </div>

      <KniffligeStellen className="shrink-0" />
      <SpielweiseWahl className="shrink-0" />
    </main>
  );
}
