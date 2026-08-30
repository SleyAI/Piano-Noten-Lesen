import { MidiStatus } from "@/components/ui/MidiStatus";
import { SessionBand } from "@/components/ui/SessionBand";
import { SpielweiseWahl } from "@/components/ui/SpielweiseWahl";
import { KniffligeStellen } from "@/components/ui/KniffligeStellen";
import { Modusbild } from "@/components/ui/Modusbild";
import { Karte } from "@/components/ui/Karte";
import { PlanKarte, WochenKarte } from "@/components/ui/Startkarten";

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
 * Die Startseite hat zwei Aufgaben: in die Uebung fuehren und zeigen, was
 * daraus geworden ist. Deshalb steht die Session ganz oben, darunter die
 * beiden Modi, und erst dann die Baender, die man nur ab und zu anschaut.
 *
 * Auf einem flachen Tablet-Querformat wird das eng — die Seite darf notfalls
 * scrollen, und die Zeichnungen auf den Moduskacheln verschwinden zuerst.
 */
export default function Startseite() {
  return (
    <main className="flex h-full flex-col justify-center-safe gap-3 overflow-y-auto px-8 py-5">
      <header className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="font-titel text-3xl leading-tight font-bold text-tinte">
            Noten &amp; Akkorde
          </h1>
          <p className="mt-0.5 text-tinte-leise">
            Kein Timer, kein Punktestand. Spiel so lange, wie es dir guttut.
          </p>
        </div>
        <MidiStatus />
      </header>

      <SessionBand className="shrink-0" />

      <div className="grid max-h-[24rem] min-h-[8rem] flex-1 shrink-0 grid-cols-2 gap-3">
        {MODI.map((modus) => (
          <Karte key={modus.href} href={modus.href} akzent={modus.akzent} className="p-5">
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

      <div className="grid shrink-0 grid-cols-[1.25fr_1fr] gap-3">
        <WochenKarte />
        <PlanKarte />
      </div>

      <KniffligeStellen className="shrink-0" />
      <SpielweiseWahl className="shrink-0" />
    </main>
  );
}
