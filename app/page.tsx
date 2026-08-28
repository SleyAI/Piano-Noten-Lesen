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

export default function Startseite() {
  return (
    <main className="flex h-full flex-col px-8 py-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tinte">Noten & Akkorde</h1>
          <p className="mt-1 text-tinte-leise">
            Kein Timer, kein Punktestand. Spiel so lange, wie es dir guttut.
          </p>
        </div>
        <MidiStatus />
      </header>

      <div className="mt-5 grid min-h-0 flex-1 grid-cols-2 gap-5">
        {MODI.map((modus) => (
          <Link
            key={modus.href}
            href={modus.href}
            className={`flex flex-col rounded-[2rem] ${modus.farbe} p-7 transition-transform duration-200 hover:-translate-y-1`}
          >
            <Modusbild
              bild={modus.bild}
              className="min-h-0 w-full flex-1 text-tinte"
            />
            <h2 className="mt-4 text-2xl font-bold text-tinte">{modus.titel}</h2>
            <p className="mt-2 text-sm leading-snug text-tinte/75">{modus.text}</p>
          </Link>
        ))}
      </div>

      <NiveauBand className="mt-4 shrink-0" />
      <KniffligeStellen className="mt-3 shrink-0" />
      <SpielweiseWahl className="mt-3 shrink-0" />
    </main>
  );
}
