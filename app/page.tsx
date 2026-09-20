import { MidiStatus } from "@/components/ui/MidiStatus";
import { SessionBand } from "@/components/ui/SessionBand";
import { SpielweiseWahl } from "@/components/ui/SpielweiseWahl";
import { KniffligeStellen } from "@/components/ui/KniffligeStellen";
import { Modusbild } from "@/components/ui/Modusbild";
import { Karte } from "@/components/ui/Karte";

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
 * Die Startseite fokussiert sich ganz auf die Session, die beiden
 * Übungsmodi (Melodien & Akkorde) sowie die Einstellungen.
 */
export default function Startseite() {
  return (
    <main className="flex h-full flex-col justify-center-safe gap-4 overflow-y-auto px-8 py-6">
      <header className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="font-titel text-4xl leading-tight font-bold text-[#785BA3]">
            Noten &amp; Akkorde 🎹
          </h1>
          <p className="mt-1 text-tinte-leise font-medium">
            Kein Timer, kein Punktestand. Spiel so lange, wie es dir guttut.
          </p>
        </div>
        <MidiStatus />
      </header>

      <SessionBand className="shrink-0" />

      <div className="grid max-h-[24rem] min-h-[9rem] flex-1 shrink-0 grid-cols-2 gap-4">
        {MODI.map((modus) => (
          <Karte key={modus.href} href={modus.href} akzent={modus.akzent} className="p-6">
            {/* Auf flachen Bildschirmen bliebe vom Bild nur ein Streifen —
                dann traegt die Kachel lieber ihre Ueberschrift allein. */}
            <Modusbild
              bild={modus.bild}
              className={`min-h-0 w-full flex-1 [@media(max-height:700px)]:hidden ${
                modus.akzent === "mint" ? "text-mint-tief" : "text-flieder-tief"
              }`}
            />
            <h2 className="mt-3 shrink-0 font-titel text-2xl leading-tight font-bold text-tinte [@media(max-height:700px)]:mt-0">
              {modus.titel}
            </h2>
            <p className="mt-1 shrink-0 text-sm leading-snug text-tinte-leise">{modus.text}</p>
          </Karte>
        ))}
      </div>

      <KniffligeStellen className="shrink-0" />
      <SpielweiseWahl className="shrink-0" />
    </main>
  );
}
