import Link from "next/link";
import { MidiStatus } from "@/components/ui/MidiStatus";
import { NiveauBand } from "@/components/ui/NiveauBand";
import { SpielweiseWahl } from "@/components/ui/SpielweiseWahl";
import { KniffligeStellen } from "@/components/ui/KniffligeStellen";
import { Modusbild } from "@/components/ui/Modusbild";

const MODI = [
  {
    href: "/melodien",
    titel: "Melodien",
    text: "Kurze Tonfolgen aus deinen Noten — auf Wunsch mit Notenwerten und über beide Systeme hinweg.",
    farbe: "bg-himmel",
    bild: "melodie" as const,
  },
  {
    href: "/akkorde",
    titel: "Akkorde",
    text: "Neue Akkorde kennenlernen, Umkehrungen sitzen lassen, Folgen durchspielen.",
    farbe: "bg-flieder",
    bild: "akkord" as const,
  },
];

/**
 * Die Startseite traegt neben den beiden Modi drei Baender: Niveau, knifflige
 * Stellen und Spielweise. Auf einem flachen Tablet-Querformat wird das eng,
 * deshalb stehen Niveau und knifflige Stellen nebeneinander, sobald die Breite
 * reicht — und die Seite darf notfalls scrollen, statt sich zu ueberlagern.
 */
export default function Startseite() {
  return (
    <main className="flex h-full flex-col gap-4 overflow-y-auto px-8 py-5">
      <header className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-tinte">Noten & Akkorde</h1>
          <p className="mt-1 text-tinte-leise">
            Kein Timer, kein Punktestand. Spiel so lange, wie es dir guttut.
          </p>
        </div>
        <MidiStatus />
      </header>

      <div className="grid min-h-[10rem] flex-1 shrink-0 grid-cols-2 gap-5">
        {MODI.map((modus) => (
          <Link
            key={modus.href}
            href={modus.href}
            className={`flex min-h-0 flex-col overflow-hidden rounded-[2rem] ${modus.farbe} p-6 transition-transform duration-200 hover:-translate-y-1`}
          >
            {/* Auf flachen Bildschirmen bliebe vom Bild nur ein Streifen —
                dann traegt die Kachel lieber ihre Ueberschrift allein. */}
            <Modusbild
              bild={modus.bild}
              className="min-h-0 w-full flex-1 text-tinte [@media(max-height:620px)]:hidden"
            />
            <h2 className="mt-3 shrink-0 text-2xl font-bold text-tinte [@media(max-height:620px)]:mt-0">
              {modus.titel}
            </h2>
            <p className="mt-1.5 shrink-0 text-sm leading-snug text-tinte/75">{modus.text}</p>
          </Link>
        ))}
      </div>

      <div className="flex shrink-0 flex-wrap items-stretch gap-3">
        <NiveauBand className="min-w-[26rem] flex-1" />
        <KniffligeStellen className="min-w-[22rem] flex-[2]" />
      </div>

      <SpielweiseWahl className="shrink-0" />
    </main>
  );
}
