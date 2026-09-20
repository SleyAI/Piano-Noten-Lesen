"use client";

/**
 * Die Uebungssession: anfangen, laufen lassen, beenden.
 *
 * Kein Ziel, kein Countdown, keine Erinnerung — die Uhr laeuft, bis man sie
 * anhaelt. Was danach zaehlt, ist die Summe des Tages, und die steht dann als
 * ganzer Satz da statt als Zahl in einer Kachel.
 *
 * Der Startzeitpunkt liegt im Speicher, nicht die verstrichene Zeit: die Uhr
 * laeuft also weiter, waehrend man Akkorde uebt, und ueberlebt einen Neustart
 * der Seite.
 */

import { Karte, Kartentitel } from "./Karte";
import { useSekundentakt } from "@/lib/practice/useSekundentakt";
import { dauerText, sekundenAmTag, uhrzeitText } from "@/lib/practice/uebungszeit";
import { useUebungszeit } from "@/lib/store/uebungszeit";
import { useHydriert } from "@/lib/store/hydriert";

export function SessionBand({ className }: { className?: string }) {
  const hydriert = useHydriert();
  const beginn = useUebungszeit((z) => z.beginn);
  const tage = useUebungszeit((z) => z.tage);
  const letzteDauer = useUebungszeit((z) => z.letzteDauer);
  const starte = useUebungszeit((z) => z.starte);
  const beende = useUebungszeit((z) => z.beende);
  const quittiere = useUebungszeit((z) => z.quittiere);

  const jetzt = useSekundentakt(beginn !== null);

  if (!hydriert) return <div className={`h-[5.5rem] ${className ?? ""}`} />;

  const laeuft = beginn !== null;
  const laufend = laeuft ? Math.max(0, Math.floor((jetzt - beginn) / 1000)) : 0;
  const heute = sekundenAmTag(tage) + laufend;

  return (
    <Karte akzent="flieder" className={`px-6 py-4 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-0 flex-1">
          {letzteDauer !== null && !laeuft ? (
            <p className="animate-auftauchen font-titel text-xl leading-tight font-bold text-[#785BA3]">
              Du hast heute {dauerText(heute)} geübt!
            </p>
          ) : laeuft ? (
            <>
              <Kartentitel>Session läuft</Kartentitel>
              <p className="text-sm text-tinte-leise font-medium">
                Heute zusammen {dauerText(heute)}.
              </p>
            </>
          ) : (
            <>
              <Kartentitel>Übungssession</Kartentitel>
              <p className="text-sm text-tinte-leise font-medium">
                {heute > 0
                  ? `Heute schon ${dauerText(heute)}. Noch eine Runde?`
                  : "Die Uhr läuft, bis du sie anhältst. Nichts weiter."}
              </p>
            </>
          )}
        </div>

        {laeuft && (
          <span
            className="font-titel text-4xl leading-none font-bold text-[#785BA3] tabular-nums"
            aria-live="off"
          >
            {uhrzeitText(laufend)}
          </span>
        )}

        <div className="flex shrink-0 gap-2">
          {letzteDauer !== null && !laeuft && (
            <button
              type="button"
              onClick={quittiere}
              className="rounded-full px-4 py-2.5 text-sm font-medium text-tinte-leise transition-colors hover:bg-papier-tief"
            >
              danke
            </button>
          )}
          <button
            type="button"
            onClick={laeuft ? beende : starte}
            className={`rounded-full px-6 py-2.5 font-semibold transition-all duration-200 ${
              laeuft
                ? "bg-papier-tief text-tinte hover:bg-[#EADCF5]"
                : "bg-[#785BA3] text-white hover:bg-[#654B8D] shadow-[0_4px_16px_rgba(120,91,163,0.25)]"
            }`}
          >
            {laeuft ? "Session beenden" : "Session starten"}
          </button>
        </div>
      </div>
    </Karte>
  );
}

/**
 * Die laufende Uhr in der Kopfzeile einer Uebungsseite.
 * Antippen beendet die Session — man soll dafuer nicht zurueckgehen muessen.
 */
export function Sessionuhr() {
  const hydriert = useHydriert();
  const beginn = useUebungszeit((z) => z.beginn);
  const beende = useUebungszeit((z) => z.beende);
  const jetzt = useSekundentakt(beginn !== null);

  if (!hydriert || beginn === null) return null;

  const laufend = Math.max(0, Math.floor((jetzt - beginn) / 1000));

  return (
    <button
      type="button"
      onClick={beende}
      title="Session beenden"
      className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#785BA3] shadow-[0_2px_10px_rgba(120,91,163,0.08)] transition-colors hover:bg-[#EADCF5]"
    >
      <span aria-hidden className="text-xs">
        ⏱
      </span>
      <span className="tabular-nums font-semibold">{uhrzeitText(laufend)}</span>
    </button>
  );
}
