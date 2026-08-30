"use client";

/**
 * Tempo, Metronom und ob die Notenwerte mitzaehlen.
 *
 * Das Tempo ist dieselbe Zahl fuer alles: das Metronom klickt danach, der
 * Play-Knopf spielt danach vor, und daran wird gemessen, ob eine Halbe eine
 * Halbe war. Nur so passt zusammen, was man hoert, und das, was gewertet wird.
 */

import { TEMPO_MAX, TEMPO_MIN, TEMPO_SCHRITT } from "@/lib/music/rhythmus";
import { useEinstellungen } from "@/lib/store/einstellungen";

export function TaktBand({ mitTaktpruefung = false }: { mitTaktpruefung?: boolean }) {
  const tempo = useEinstellungen((z) => z.tempo);
  const setzeTempo = useEinstellungen((z) => z.setzeTempo);
  const metronomAn = useEinstellungen((z) => z.metronomAn);
  const schalteMetronom = useEinstellungen((z) => z.schalteMetronom);
  const taktGenau = useEinstellungen((z) => z.taktGenau);
  const schalteTaktGenau = useEinstellungen((z) => z.schalteTaktGenau);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-tinte">Tempo und Takt</h2>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-papier-tief px-4 py-3">
        <span className="flex items-center gap-2">
          <span className="text-lg leading-none text-tinte" aria-hidden>
            ♩
          </span>
          <span className="text-sm text-tinte-leise">=</span>
          <span className="w-10 text-lg leading-none font-bold text-tinte tabular-nums">
            {tempo}
          </span>
        </span>

        <div className="flex gap-1">
          <Stufe zeichen="−" titel="langsamer" onClick={() => setzeTempo(tempo - TEMPO_SCHRITT)} />
          <Stufe zeichen="+" titel="schneller" onClick={() => setzeTempo(tempo + TEMPO_SCHRITT)} />
        </div>

        <input
          type="range"
          min={TEMPO_MIN}
          max={TEMPO_MAX}
          step={TEMPO_SCHRITT}
          value={tempo}
          onChange={(e) => setzeTempo(Number(e.target.value))}
          aria-label="Tempo in Schlägen pro Minute"
          className="h-1.5 min-w-40 flex-1 cursor-pointer appearance-none rounded-full bg-white accent-mint-tief"
        />

        <button
          type="button"
          aria-pressed={metronomAn}
          onClick={schalteMetronom}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            metronomAn ? "bg-mint text-tinte" : "bg-white/70 text-tinte-leise hover:bg-mint/40"
          }`}
        >
          Metronom {metronomAn ? "an" : "aus"}
        </button>
      </div>

      {mitTaktpruefung && (
        <button
          type="button"
          role="checkbox"
          aria-checked={taktGenau}
          onClick={schalteTaktGenau}
          className={`flex flex-col gap-0.5 rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
            taktGenau ? "bg-himmel text-tinte" : "bg-papier-tief text-tinte-leise hover:bg-himmel/40"
          }`}
        >
          <span className="flex items-baseline gap-2 font-semibold">
            <span aria-hidden>{taktGenau ? "✓" : "○"}</span>
            Die Notenwerte zählen mit
          </span>
          <span className="text-xs leading-snug opacity-80">
            Eine Halbe muss doppelt so lang stehen wie eine Viertel. Ohne Haken geht es allein
            um die richtigen Töne.
          </span>
        </button>
      )}
    </section>
  );
}

function Stufe({
  zeichen,
  titel,
  onClick,
}: {
  zeichen: string;
  titel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={titel}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-lg leading-none text-tinte transition-colors hover:bg-mint"
    >
      {zeichen}
    </button>
  );
}

/** Nur der Schalter, fuer die Kopfzeile einer laufenden Uebung. */
export function MetronomKnopf() {
  const tempo = useEinstellungen((z) => z.tempo);
  const metronomAn = useEinstellungen((z) => z.metronomAn);
  const schalteMetronom = useEinstellungen((z) => z.schalteMetronom);

  return (
    <button
      type="button"
      aria-pressed={metronomAn}
      title={metronomAn ? "Metronom aus" : `Metronom an (♩ = ${tempo})`}
      onClick={schalteMetronom}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
        metronomAn
          ? "bg-mint text-tinte"
          : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
      }`}
    >
      <span aria-hidden className={metronomAn ? "animate-puls-sanft" : undefined}>
        ♩
      </span>
      <span className="tabular-nums">{tempo}</span>
    </button>
  );
}
