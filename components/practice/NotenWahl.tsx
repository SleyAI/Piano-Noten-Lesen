"use client";

/**
 * Was steckt in einer Melodie?
 *
 * Drei Einstellungen: welches System, ob die Notenwerte mitzaehlen und ob es
 * bei den weissen Tasten bleibt. Mehr Unterscheidungen gibt es nicht — der
 * Umfang selbst ist immer derselbe, zwei Oktaven je System.
 */

import { TASTEN_WAHLEN, vorratUmfang } from "@/lib/music/curriculum";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { SchluesselWahlBand } from "./SchluesselWahlBand";

export function NotenWahl() {
  const tastenwahl = useEinstellungen((z) => z.tastenwahl);
  const setzeTastenwahl = useEinstellungen((z) => z.setzeTastenwahl);
  const notenwerteAn = useEinstellungen((z) => z.notenwerteAn);
  const schalteNotenwerte = useEinstellungen((z) => z.schalteNotenwerte);

  return (
    <div className="flex flex-col gap-5">
      <SchluesselWahlBand />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-tinte">Welche Tasten?</h2>
        <div className="grid grid-cols-2 gap-2">
          {TASTEN_WAHLEN.map((eintrag) => (
            <Umschalter
              key={eintrag.wert}
              aktiv={tastenwahl === eintrag.wert}
              onClick={() => setzeTastenwahl(eintrag.wert)}
              titel={eintrag.titel}
              unterzeile={`${vorratUmfang(eintrag.wert)} Noten`}
              hinweis={eintrag.hinweis}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-tinte">Zählen die Notenwerte mit?</h2>
        <div className="grid grid-cols-2 gap-2">
          <Umschalter
            aktiv={!notenwerteAn}
            onClick={() => notenwerteAn && schalteNotenwerte()}
            titel="Nur die Noten"
            hinweis="Bloße Notenköpfe, kein Takt. Es geht allein um die Tonhöhe."
          />
          <Umschalter
            aktiv={notenwerteAn}
            onClick={() => !notenwerteAn && schalteNotenwerte()}
            titel="Auch die Notenwerte"
            hinweis="Ganze, Halbe, Viertel und Achtel im 4/4-Takt — die Länge zählt mit."
          />
        </div>
      </section>
    </div>
  );
}

function Umschalter({
  aktiv,
  onClick,
  titel,
  unterzeile,
  hinweis,
}: {
  aktiv: boolean;
  onClick: () => void;
  titel: string;
  unterzeile?: string;
  hinweis: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={aktiv}
      onClick={onClick}
      className={`flex flex-col gap-0.5 rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
        aktiv ? "bg-himmel text-tinte" : "bg-papier-tief text-tinte-leise hover:bg-himmel/40"
      }`}
    >
      <span className="flex items-baseline gap-2">
        <span className="font-semibold">{titel}</span>
        {unterzeile && <span className="text-xs opacity-70">{unterzeile}</span>}
      </span>
      <span className="text-xs leading-snug opacity-80">{hinweis}</span>
    </button>
  );
}
