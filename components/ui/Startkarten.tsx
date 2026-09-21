"use client";

/**
 * Die zwei kleinen Karten unter den Uebungsmodi.
 *
 * Beide zeigen einen Stand und fuehren dorthin, wo er ausfuehrlich steht —
 * die Woche zur Statistik, der Plan zum Uebungsplan. Auf der Startseite steht
 * nur so viel, wie man im Vorbeigehen liest.
 */

import { NIVEAUS, fortschritt, gesamtFortschritt } from "@/lib/music/niveau";
import { kurzeDauer, letzteTage } from "@/lib/practice/uebungszeit";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useSekundentakt } from "@/lib/practice/useSekundentakt";
import { useUebungszeit } from "@/lib/store/uebungszeit";
import { useHydriert } from "@/lib/store/hydriert";
import { Karte, Kartentitel } from "./Karte";
import { Wochenlinie } from "./Wochenlinie";

export function WochenKarte({ className }: { className?: string } = {}) {
  const hydriert = useHydriert();
  const tage = useUebungszeit((z) => z.tage);
  const beginn = useUebungszeit((z) => z.beginn);
  const jetzt = useSekundentakt(beginn !== null);

  if (!hydriert) return <div className={`h-64 rounded-[2rem] bg-white ${className ?? ""}`} />;

  // Die laufende Session zaehlt beim heutigen Tag mit, damit die Notenkoepfe
  // waehrend des Uebens steigen statt erst hinterher.
  const laufend = beginn === null ? 0 : Math.max(0, Math.floor((jetzt - beginn) / 1000));
  const woche = letzteTage(tage, 7, jetzt).map((tag, i, alle) =>
    i === alle.length - 1 ? { ...tag, sekunden: tag.sekunden + laufend } : tag,
  );
  const wochenGesamt = woche.reduce((summe, t) => summe + t.sekunden, 0);
  const schnittProTag = Math.round(wochenGesamt / 7);
  const heuteSekunden = woche[woche.length - 1]?.sekunden ?? 0;

  return (
    <Karte href="/statistik" akzent="flieder" className={`p-6 sm:p-7 flex flex-col justify-between ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-titel text-xl font-bold text-tinte">Diese Woche</span>
        <span className="rounded-full bg-[#F8F3EC] border border-[#794D2C]/20 px-3 py-1 text-xs font-bold text-[#794D2C]">
          {kurzeDauer(heuteSekunden)} heute
        </span>
      </div>

      {/* Notenlinien Chart */}
      <div className="flex h-28 sm:h-32 w-full items-center justify-center my-2">
        <Wochenlinie tage={woche} />
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-papier-tief text-xs text-tinte-leise font-medium">
        <span>
          Diese Woche: <strong className="text-tinte font-bold">{kurzeDauer(wochenGesamt)}</strong>
        </span>
        <span>
          Ø <strong className="text-[#794D2C] font-bold">{kurzeDauer(schnittProTag)}</strong>/Tag
        </span>
      </div>
    </Karte>
  );
}

export function PlanKarte() {
  const hydriert = useHydriert();
  const beherrscht = useEinstellungen((z) => z.beherrscht);

  if (!hydriert) return <div className="h-36 rounded-[1.75rem] bg-white/60" />;

  const gesamt = gesamtFortschritt(beherrscht);

  return (
    <Karte href="/stand" akzent="himmel" className="px-5 py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <Kartentitel>Übungsplan</Kartentitel>
        <span className="text-xs text-tinte-leise">
          {gesamt.geschafft} von {gesamt.gesamt}
        </span>
      </div>

      <ul className="mt-2.5 flex shrink-0 flex-col gap-2">
        {NIVEAUS.map((stufe) => {
          const stand = fortschritt(stufe.id, beherrscht);
          const anteil = stand.gesamt > 0 ? stand.geschafft / stand.gesamt : 0;
          return (
            <li key={stufe.id} className="flex items-center gap-2.5">
              <span className="w-28 shrink-0 truncate text-xs text-tinte-leise">
                {stufe.titel}
              </span>
              <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-papier-tief">
                <span
                  className="block h-full rounded-full bg-himmel-tief transition-[width] duration-500"
                  style={{ width: `${Math.round(anteil * 100)}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right text-xs text-tinte-leise tabular-nums">
                {stand.geschafft}/{stand.gesamt}
              </span>
            </li>
          );
        })}
      </ul>
    </Karte>
  );
}
