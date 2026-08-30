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
    <Karte akzent="pfirsich" className={`px-5 py-4 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="min-w-0 flex-1">
          {letzteDauer !== null && !laeuft ? (
            <p className="animate-auftauchen font-titel text-xl leading-tight font-semibold text-tinte">
              Du hast heute {dauerText(heute)} geübt!
            </p>
          ) : laeuft ? (
            <>
              <Kartentitel>Session läuft</Kartentitel>
              <p className="text-sm text-tinte-leise">
                Heute zusammen {dauerText(heute)}.
              </p>
            </>
          ) : (
            <>
              <Kartentitel>Übungssession</Kartentitel>
              <p className="text-sm text-tinte-leise">
                {heute > 0
                  ? `Heute schon ${dauerText(heute)}. Noch eine Runde?`
                  : "Die Uhr läuft, bis du sie anhältst. Nichts weiter."}
              </p>
            </>
          )}
        </div>

        {laeuft && (
          <span
            className="font-titel text-4xl leading-none font-semibold text-tinte tabular-nums"
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
              className="rounded-full px-4 py-2.5 text-sm text-tinte-leise transition-colors hover:bg-papier-tief"
            >
              danke
            </button>
          )}
          <button
            type="button"
            onClick={laeuft ? beende : starte}
            className={`rounded-full px-6 py-2.5 font-semibold text-tinte transition-colors ${
              laeuft
                ? "bg-papier-tief hover:bg-pfirsich"
                : "bg-pfirsich hover:bg-pfirsich-tief"
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
      className="flex items-center gap-1.5 rounded-full bg-pfirsich px-3 py-1.5 text-sm text-tinte transition-colors hover:bg-pfirsich-tief"
    >
      <span aria-hidden className="text-xs opacity-70">
        ⏱
      </span>
      <span className="tabular-nums">{uhrzeitText(laufend)}</span>
    </button>
  );
}
