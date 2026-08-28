"use client";

/**
 * Beide Systeme zusammen üben oder nur eines?
 *
 * Die Landmark-Methode lebt davon, dass beide Schlüssel gemeinsam wachsen —
 * deshalb ist "beide" die Voreinstellung. Bei Melodien heißt das nicht, dass
 * abwechselnd eine Melodie oben und eine unten kommt, sondern dass beide
 * Systeme in derselben Tonfolge vorkommen: der Sprung zwischen den Händen ist
 * genau das, was am Doppelsystem schwerfällt.
 *
 * Wer gezielt eine Hand übt, schaltet hier um; die Wahl gilt für Melodien und
 * Akkorde gleichermaßen.
 */

import { SCHLUESSEL_WAHLEN } from "@/lib/music/curriculum";
import { useEinstellungen } from "@/lib/store/einstellungen";

export function SchluesselWahlBand() {
  const wahl = useEinstellungen((z) => z.schluesselWahl);
  const setzen = useEinstellungen((z) => z.setzeSchluesselWahl);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-tinte">Welches System?</h2>
      <div className="grid grid-cols-3 gap-2">
        {SCHLUESSEL_WAHLEN.map((eintrag) => (
          <button
            key={eintrag.wert}
            type="button"
            aria-pressed={wahl === eintrag.wert}
            onClick={() => setzen(eintrag.wert)}
            className={`flex flex-col gap-0.5 rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
              wahl === eintrag.wert
                ? "bg-himmel text-tinte"
                : "bg-papier-tief text-tinte-leise hover:bg-himmel/40"
            }`}
          >
            <span className="font-semibold">{eintrag.titel}</span>
            <span className="text-xs leading-snug opacity-80">{eintrag.hinweis}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
