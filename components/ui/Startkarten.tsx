"use client";

/**
 * Die zwei kleinen Karten unter den Uebungsmodi.
 *
 * Beide zeigen einen Stand und fuehren dorthin, wo er ausfuehrlich steht —
 * die Woche zur Statistik, der Plan zum Uebungsplan. Auf der Startseite steht
 * nur so viel, wie man im Vorbeigehen liest.
 */

import { NIVEAUS, fortschritt, gesamtFortschritt } from "@/lib/music/niveau";
import { kurzeDauer, letzteTage, sekundenGesamt, serie } from "@/lib/practice/uebungszeit";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useSekundentakt } from "@/lib/practice/useSekundentakt";
import { useUebungszeit } from "@/lib/store/uebungszeit";
import { useHydriert } from "@/lib/store/hydriert";
import { Karte, Kartentitel } from "./Karte";
import { Wochenlinie } from "./Wochenlinie";

export function WochenKarte() {
  const hydriert = useHydriert();
  const tage = useUebungszeit((z) => z.tage);
  const beginn = useUebungszeit((z) => z.beginn);
  const jetzt = useSekundentakt(beginn !== null);

  if (!hydriert) return <div className="h-36 rounded-[1.75rem] bg-white/60" />;

  // Die laufende Session zaehlt beim heutigen Tag mit, damit die Notenkoepfe
  // waehrend des Uebens steigen statt erst hinterher.
  const laufend = beginn === null ? 0 : Math.max(0, Math.floor((jetzt - beginn) / 1000));
  const woche = letzteTage(tage, 7, jetzt).map((tag, i, alle) =>
    i === alle.length - 1 ? { ...tag, sekunden: tag.sekunden + laufend } : tag,
  );
  const gesamt = sekundenGesamt(tage) + laufend;
  const amStueck = serie(tage, jetzt);

  return (
    <Karte href="/statistik" akzent="pfirsich" className="px-5 py-3.5">
      <Kartentitel>Diese Woche</Kartentitel>
      <div className="mt-1 flex min-h-0 flex-1 items-center gap-5">
        <div className="shrink-0">
          <p className="font-titel text-3xl leading-none font-bold text-tinte">
            {kurzeDauer(gesamt)}
          </p>
          <p className="mt-1 text-xs leading-tight text-tinte-leise">
            insgesamt geübt
            {amStueck > 1 ? (
              <>
                <br />
                {amStueck} Tage am Stück
              </>
            ) : null}
          </p>
        </div>
        <div className="flex h-24 min-w-0 flex-1 justify-center">
          <Wochenlinie tage={woche} />
        </div>
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
