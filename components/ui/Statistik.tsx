"use client";

/**
 * Wie viel wurde geuebt — insgesamt und Tag fuer Tag.
 *
 * Bewusst ohne Ziele, Serienpokale und rote Balken: die Zahlen stehen da,
 * damit man sie anschauen kann, und nicht, um jemanden anzutreiben. Ein Tag
 * ohne Uebung ist eine Luecke im Diagramm und sonst nichts.
 */

import {
  aktiveTage,
  dauerText,
  kurzeDauer,
  letzteTage,
  sekundenAmTag,
  sekundenGesamt,
  serie,
  wochentagKurz,
} from "@/lib/practice/uebungszeit";
import { useSekundentakt } from "@/lib/practice/useSekundentakt";
import { useUebungszeit } from "@/lib/store/uebungszeit";
import { useHydriert } from "@/lib/store/hydriert";
import { Karte, Kartentitel } from "./Karte";
import { Wochenlinie } from "./Wochenlinie";

/** So weit reicht das Balkendiagramm zurueck. */
const TAGE_IM_DIAGRAMM = 30;

export function Statistik() {
  const hydriert = useHydriert();
  const tage = useUebungszeit((z) => z.tage);
  const beginn = useUebungszeit((z) => z.beginn);
  const vergissAlles = useUebungszeit((z) => z.vergissAlles);
  const jetzt = useSekundentakt(beginn !== null);

  if (!hydriert) return <div className="h-full bg-papier" />;

  // Was gerade laeuft, ist noch nicht gebucht — hier zaehlt es trotzdem mit,
  // sonst widerspricht die Statistik der Uhr auf der Startseite.
  const laufend = beginn === null ? 0 : Math.max(0, Math.floor((jetzt - beginn) / 1000));
  const gesamt = sekundenGesamt(tage) + laufend;
  const heute = sekundenAmTag(tage, jetzt) + laufend;
  const monat = letzteTage(tage, TAGE_IM_DIAGRAMM, jetzt);
  const hoechst = Math.max(30 * 60, ...monat.map((t) => t.sekunden));
  const gespielteTage = [...monat].reverse().filter((t) => t.sekunden > 0);

  if (gesamt === 0) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <Karte akzent="pfirsich" className="px-6 py-8">
          <Kartentitel>Noch nichts gezählt</Kartentitel>
          <p className="mt-1 max-w-xl text-sm leading-snug text-tinte-leise">
            Auf der Startseite steht ein Knopf, der eine Übungssession startet. Die Uhr läuft,
            bis du sie anhältst — was dabei zusammenkommt, steht danach hier.
          </p>
        </Karte>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Zahl akzent="pfirsich" wert={kurzeDauer(gesamt)} name="insgesamt geübt" />
        <Zahl akzent="mint" wert={kurzeDauer(heute)} name="heute" />
        <Zahl akzent="himmel" wert={String(aktiveTage(tage))} name="Tage mit Übung" />
        <Zahl akzent="flieder" wert={String(serie(tage, jetzt))} name="Tage am Stück" />
      </div>

      <Karte akzent="pfirsich" className="px-5 py-4">
        <Kartentitel>Die letzte Woche</Kartentitel>
        <div className="mt-1 flex h-24 justify-center">
          <Wochenlinie tage={letzteTage(tage, 7, jetzt)} />
        </div>
      </Karte>

      <Karte akzent="mint" className="px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <Kartentitel>Die letzten {TAGE_IM_DIAGRAMM} Tage</Kartentitel>
          <span className="text-xs text-tinte-leise">
            höchster Tag: {kurzeDauer(Math.max(...monat.map((t) => t.sekunden)))}
          </span>
        </div>

        <div className="mt-3 flex h-32 items-end gap-1">
          {monat.map((tag) => {
            const anteil = tag.sekunden / hoechst;
            return (
              <span
                key={tag.schluessel}
                title={`${tag.datum.toLocaleDateString("de-DE")}: ${kurzeDauer(tag.sekunden)}`}
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                <span
                  className={`w-full rounded-t-md ${
                    tag.sekunden > 0 ? "bg-mint-tief" : "bg-papier-tief"
                  }`}
                  style={{ height: `${Math.max(3, Math.round(anteil * 100))}%` }}
                />
              </span>
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-tinte-leise">
          <span>vor {TAGE_IM_DIAGRAMM} Tagen</span>
          <span>heute</span>
        </div>
      </Karte>

      {gespielteTage.length > 0 && (
        <Karte akzent="himmel" className="px-5 py-4">
          <Kartentitel>Tag für Tag</Kartentitel>
          <ul className="mt-2 flex flex-col">
            {gespielteTage.map((tag) => (
              <li
                key={tag.schluessel}
                className="flex items-baseline justify-between gap-3 border-b border-papier-tief py-1.5 last:border-0"
              >
                <span className="text-sm text-tinte">
                  {wochentagKurz(tag.datum)},{" "}
                  {tag.datum.toLocaleDateString("de-DE", { day: "numeric", month: "long" })}
                </span>
                <span className="text-sm text-tinte-leise tabular-nums">
                  {dauerText(tag.sekunden)}
                </span>
              </li>
            ))}
          </ul>
        </Karte>
      )}

      <button
        type="button"
        onClick={vergissAlles}
        className="self-start rounded-full bg-papier-tief px-4 py-1.5 text-xs text-tinte-leise transition-colors hover:bg-white"
      >
        alle Zeiten zurücksetzen
      </button>
    </div>
  );
}

function Zahl({
  akzent,
  wert,
  name,
}: {
  akzent: "mint" | "flieder" | "himmel" | "pfirsich";
  wert: string;
  name: string;
}) {
  return (
    <Karte akzent={akzent} className="px-4 py-3">
      <span className="font-titel text-2xl leading-tight font-bold text-tinte">{wert}</span>
      <span className="text-xs text-tinte-leise">{name}</span>
    </Karte>
  );
}
