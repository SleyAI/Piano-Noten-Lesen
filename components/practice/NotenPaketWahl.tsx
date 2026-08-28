"use client";

/**
 * Was steckt in einer Melodie?
 *
 * Drei Einstellungen: welches System, ob die Notenwerte mitzaehlen und welche
 * Landmark-Stufen im Vorrat liegen. Angeboten wird nur, was das eingestellte
 * Niveau hergibt — die schwarzen Tasten kommen also erst ab Fortgeschritten
 * ueberhaupt in der Liste vor.
 */

import { paketUmfang } from "@/lib/music/curriculum";
import { erlaubteNotenPakete, niveauTitel } from "@/lib/music/niveau";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { Wahlkachel } from "@/components/ui/Wahlkachel";
import { SchluesselWahlBand } from "./SchluesselWahlBand";

export function NotenPaketWahl() {
  const niveau = useEinstellungen((z) => z.niveau);
  const gewaehlt = useEinstellungen((z) => z.notenPakete);
  const schalten = useEinstellungen((z) => z.schalteNotenPaket);
  const setzen = useEinstellungen((z) => z.setzeNotenPakete);
  const notenwerteAn = useEinstellungen((z) => z.notenwerteAn);
  const schalteNotenwerte = useEinstellungen((z) => z.schalteNotenwerte);

  const pakete = erlaubteNotenPakete(niveau);

  return (
    <div className="flex flex-col gap-5">
      <SchluesselWahlBand />

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

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-tinte">Welche Noten möchtest du üben?</h2>
          <div className="flex items-baseline gap-2 text-xs">
            <span className="text-tinte-leise">{niveauTitel(niveau)}</span>
            <button
              type="button"
              className="rounded-full bg-papier-tief px-3 py-1 text-tinte-leise transition-colors hover:bg-mint"
              onClick={() => setzen(pakete.map((p) => p.id))}
            >
              alle
            </button>
            <button
              type="button"
              className="rounded-full bg-papier-tief px-3 py-1 text-tinte-leise transition-colors hover:bg-mint"
              onClick={() => setzen([pakete[0].id])}
            >
              nur die Mitte
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {pakete.map((paket) => (
            <Wahlkachel
              key={paket.id}
              aktiv={gewaehlt.includes(paket.id)}
              titel={paket.titel}
              unterzeile={`${paketUmfang(paket)} Noten`}
              hinweis={paket.hinweis}
              onClick={() => schalten(paket.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Umschalter({
  aktiv,
  onClick,
  titel,
  hinweis,
}: {
  aktiv: boolean;
  onClick: () => void;
  titel: string;
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
      <span className="font-semibold">{titel}</span>
      <span className="text-xs leading-snug opacity-80">{hinweis}</span>
    </button>
  );
}
