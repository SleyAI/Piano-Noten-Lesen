"use client";

/**
 * Die Stoppuhr / Session-Kachel auf der Startseite im Stil der Referenz:
 * - Oben: "Stoppuhr" mit Statusbadge
 * - Mitte: Große digitale Zeitanzeige (5xl/6xl) mit Info-Text
 * - Unten: Breiter Aktionsbutton "Session starten" / "Session beenden"
 */

import { Karte } from "./Karte";
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

  if (!hydriert) return <div className={`h-64 rounded-[2rem] bg-white ${className ?? ""}`} />;

  const laeuft = beginn !== null;
  const laufend = laeuft ? Math.max(0, Math.floor((jetzt - beginn) / 1000)) : 0;
  const heute = sekundenAmTag(tage) + laufend;

  return (
    <Karte akzent="flieder" className={`p-6 flex flex-col justify-between ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-titel text-xl font-bold text-tinte">Stoppuhr</span>
        {laeuft && (
          <span className="rounded-full bg-[#EADCF5] px-3 py-1 text-xs font-bold text-[#785BA3]">
            Läuft
          </span>
        )}
      </div>

      {/* Große Zeitanzeige */}
      <div className="my-5 text-center">
        <span className="font-titel text-5xl sm:text-6xl font-bold text-[#785BA3] tracking-tight tabular-nums block">
          {uhrzeitText(laufend)}
        </span>
        <p className="mt-2 text-sm font-medium text-tinte-leise">
          {laeuft
            ? `Heute zusammen ${dauerText(heute)} geübt`
            : heute > 0
              ? `Heute schon ${dauerText(heute)} geübt`
              : "Session starten, um die Zeit zu messen"}
        </p>
      </div>

      {/* Großer Start/Stop-Button */}
      <div className="flex gap-2">
        {letzteDauer !== null && !laeuft && (
          <button
            type="button"
            onClick={quittiere}
            className="rounded-full px-4 py-3 text-sm font-medium text-tinte-leise transition-colors hover:bg-papier-tief"
          >
            danke
          </button>
        )}
        <button
          type="button"
          onClick={laeuft ? beende : starte}
          className={`w-full rounded-full py-3.5 px-6 font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
            laeuft
              ? "bg-papier-tief text-tinte hover:bg-[#EADCF5]"
              : "bg-[#785BA3] text-white hover:bg-[#654B8D] shadow-[0_6px_20px_rgba(120,91,163,0.25)] hover:-translate-y-0.5"
          }`}
        >
          {laeuft ? "Session beenden" : "Session starten"}
        </button>
      </div>
    </Karte>
  );
}

/**
 * Die laufende Uhr in der Kopfzeile einer Uebungsseite.
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
      className="flex items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#785BA3] shadow-[0_2px_10px_rgba(120,91,163,0.08)] transition-colors hover:bg-[#EADCF5]"
    >
      <span className="tabular-nums font-semibold">{uhrzeitText(laufend)}</span>
    </button>
  );
}
