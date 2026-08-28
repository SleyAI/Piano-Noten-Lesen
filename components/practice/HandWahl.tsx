"use client";

/**
 * Mit welcher Hand wird gegriffen?
 *
 * Eine Hand allein bekommt den Griff dorthin gelegt, wo er in ihrem System
 * bequem liegt — C-Dur steht in der linken Hand deshalb als C3-E3-G3 mitten
 * im Bassschluessel statt auf drei Hilfslinien darueber. Bei beiden Haenden
 * steht derselbe Akkord in beiden Systemen untereinander.
 */

import { HAENDE_WAHLEN } from "@/lib/music/akkorde";
import { useEinstellungen } from "@/lib/store/einstellungen";

export function HandWahl() {
  const haende = useEinstellungen((z) => z.akkordHaende);
  const setzen = useEinstellungen((z) => z.setzeAkkordHaende);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-tinte">Welche Hand?</h2>
      <div className="grid grid-cols-3 gap-2">
        {HAENDE_WAHLEN.map((eintrag) => (
          <button
            key={eintrag.wert}
            type="button"
            role="radio"
            aria-checked={haende === eintrag.wert}
            onClick={() => setzen(eintrag.wert)}
            className={`flex flex-col gap-0.5 rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
              haende === eintrag.wert
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
