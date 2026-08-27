"use client";

/**
 * Unterwegs oder am Klavier?
 *
 * Die Wahl bestimmt, ob die Klaviatur auf dem Bildschirm erscheint und ob die
 * App selbst Toene erzeugt. Am E-Piano macht beides das Piano.
 */

import { verbinde } from "@/lib/input/midi";
import { useMidiZustand } from "@/lib/input/useNoteneingabe";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";

export function SpielweiseWahl({ className }: { className?: string }) {
  const hydriert = useHydriert();
  const spielweise = useEinstellungen((z) => z.spielweise);
  const setzeSpielweise = useEinstellungen((z) => z.setzeSpielweise);
  const klangAn = useEinstellungen((z) => z.klangAn);
  const schalteKlang = useEinstellungen((z) => z.schalteKlang);
  const klaviaturImmerZeigen = useEinstellungen((z) => z.klaviaturImmerZeigen);
  const schalteKlaviatur = useEinstellungen((z) => z.schalteKlaviatur);
  const midi = useMidiZustand();

  if (!hydriert) return <div className={`h-[4.5rem] ${className ?? ""}`} />;

  const midiUnmoeglich = midi.art === "nicht-verfuegbar" || midi.art === "unsicherer-kontext";

  return (
    <section className={`flex items-center gap-3 rounded-[1.75rem] bg-papier-tief px-5 py-4 ${className ?? ""}`}>
      <div className="flex gap-2">
        <Knopf
          aktiv={spielweise === "tippen"}
          onClick={() => setzeSpielweise("tippen")}
          titel="Unterwegs"
          text="Klaviatur auf dem Bildschirm"
        />
        <Knopf
          aktiv={spielweise === "piano"}
          onClick={() => {
            setzeSpielweise("piano");
            void verbinde();
          }}
          titel="Am Klavier"
          text="Yamaha per USB"
          gedaempft={midiUnmoeglich}
        />
      </div>

      <div className="ml-auto flex items-center gap-2 text-sm">
        {spielweise === "tippen" ? (
          <Schalter an={klangAn} onClick={schalteKlang} beschriftung="Klang aus der App" />
        ) : (
          <Schalter
            an={klaviaturImmerZeigen}
            onClick={schalteKlaviatur}
            beschriftung="Klaviatur trotzdem zeigen"
          />
        )}
      </div>

      {midiUnmoeglich && spielweise === "piano" && (
        <p className="max-w-xs text-xs leading-snug text-tinte-leise">
          {midi.art === "nicht-verfuegbar"
            ? "Dieser Browser gibt kein MIDI frei — auf iPad und iPhone ist das so. Ein Android-Tablet mit Chrome erkennt das Klavier."
            : "MIDI braucht eine sichere Verbindung. Über die veröffentlichte Seite oder localhost aufrufen."}
        </p>
      )}
    </section>
  );
}

function Knopf({
  aktiv,
  onClick,
  titel,
  text,
  gedaempft,
}: {
  aktiv: boolean;
  onClick: () => void;
  titel: string;
  text: string;
  gedaempft?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={`rounded-2xl px-5 py-2.5 text-left transition-colors duration-200 ${
        aktiv ? "bg-mint text-tinte" : "bg-white/70 text-tinte-leise hover:bg-mint/40"
      } ${gedaempft && !aktiv ? "opacity-60" : ""}`}
    >
      <span className="block text-sm font-semibold">{titel}</span>
      <span className="block text-xs opacity-75">{text}</span>
    </button>
  );
}

function Schalter({
  an,
  onClick,
  beschriftung,
}: {
  an: boolean;
  onClick: () => void;
  beschriftung: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      onClick={onClick}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-tinte transition-colors hover:bg-white/60"
    >
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors duration-200 ${
          an ? "bg-mint-tief" : "bg-white"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-papier shadow-sm transition-transform duration-200 ${
            an ? "translate-x-4" : ""
          }`}
        />
      </span>
      {beschriftung}
    </button>
  );
}
