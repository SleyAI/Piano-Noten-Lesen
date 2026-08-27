"use client";

/**
 * Auswahl der Akkorde in drei Schaerfegraden.
 *
 *  1. Paket — reicht für den Alltag
 *  2. einzelne Akkorde daraus — für "nur die vier, die ich nicht kann"
 *  3. Umkehrungen — welche Stellungen überhaupt drankommen
 *
 * Die dritte Umkehrung erscheint nur, wenn die Auswahl tatsächlich
 * Vierklänge enthält — bei Dreiklängen gibt es sie nicht.
 */

import { useState } from "react";
import {
  AKKORD_PAKETE,
  akkordeAusPaketen,
  akkordeImPaket,
  anzahlUmkehrungen,
  gewaehlteAkkorde,
  umkehrungName,
} from "@/lib/music/akkorde";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";
import { Wahlkachel } from "@/components/ui/Wahlkachel";

export function AkkordPaketWahl() {
  const pakete = useEinstellungen((z) => z.akkordPakete);
  const abgewaehlt = useEinstellungen((z) => z.abgewaehlteAkkorde);
  const umkehrungen = useEinstellungen((z) => z.umkehrungen);
  const schaltePaket = useEinstellungen((z) => z.schalteAkkordPaket);
  const schalteAkkord = useEinstellungen((z) => z.schalteAkkord);
  const schalteUmkehrung = useEinstellungen((z) => z.schalteUmkehrung);
  const setzeAuswahl = useEinstellungen((z) => z.setzeAkkordAuswahl);
  const zurueck = useEinstellungen((z) => z.vorherigeAkkordAuswahl);
  const auswahlZurueck = useEinstellungen((z) => z.akkordAuswahlZurueck);
  const eintraege = useTricky((z) => z.eintraege);

  const [offenesPaket, setOffenesPaket] = useState<string | null>(null);

  const aktiveAkkorde = gewaehlteAkkorde(pakete, abgewaehlt);
  const maxUmkehrungen = aktiveAkkorde.reduce(
    (max, a) => Math.max(max, anzahlUmkehrungen(a)),
    2,
  );

  /** Akkorde, bei denen schon einmal daneben gegriffen wurde. */
  const knifflige = new Set(
    Object.entries(eintraege)
      .filter(([schluessel, e]) => schluessel.startsWith("akkord:") && e.fehler > 0)
      .map(([schluessel]) => schluessel.split(":")[1]),
  );
  const kniffligeImVorrat = akkordeAusPaketen(pakete).filter((a) => knifflige.has(a.id));

  function nurKnifflige() {
    const alle = akkordeAusPaketen(pakete);
    setzeAuswahl(
      pakete,
      alle.filter((a) => !knifflige.has(a.id)).map((a) => a.id),
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-tinte">Welche Akkorde möchtest du üben?</h2>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              disabled={kniffligeImVorrat.length === 0}
              onClick={nurKnifflige}
              className="rounded-full bg-papier-tief px-3 py-1 text-tinte-leise transition-colors hover:bg-flieder disabled:cursor-not-allowed disabled:opacity-40"
            >
              knifflige Akkorde ({kniffligeImVorrat.length})
            </button>
            <button
              type="button"
              disabled={!zurueck}
              onClick={auswahlZurueck}
              className="rounded-full bg-papier-tief px-3 py-1 text-tinte-leise transition-colors hover:bg-mint disabled:cursor-not-allowed disabled:opacity-40"
            >
              letzte Auswahl zurück
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {AKKORD_PAKETE.map((paket) => {
            const inhalt = akkordeImPaket(paket);
            const aktiv = pakete.includes(paket.id);
            return (
              <div key={paket.id} className="flex flex-col gap-1">
                <Wahlkachel
                  aktiv={aktiv}
                  titel={paket.titel}
                  unterzeile={`${inhalt.length}`}
                  hinweis={paket.hinweis}
                  onClick={() => schaltePaket(paket.id)}
                />
                {aktiv && (
                  <button
                    type="button"
                    onClick={() =>
                      setOffenesPaket((offen) => (offen === paket.id ? null : paket.id))
                    }
                    className="self-start rounded-full px-3 py-0.5 text-xs text-tinte-leise transition-colors hover:bg-papier-tief"
                  >
                    {offenesPaket === paket.id ? "zuklappen" : "einzeln wählen"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {offenesPaket && (
        <section className="animate-auftauchen flex flex-col gap-2 rounded-2xl bg-papier-tief px-4 py-3">
          <h3 className="text-xs font-semibold text-tinte-leise">
            Einzelne Akkorde aus „{AKKORD_PAKETE.find((p) => p.id === offenesPaket)?.titel}“
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {akkordeImPaket(
              AKKORD_PAKETE.find((p) => p.id === offenesPaket)!,
            ).map((akkord) => {
              const an = !abgewaehlt.includes(akkord.id);
              return (
                <button
                  key={akkord.id}
                  type="button"
                  aria-pressed={an}
                  onClick={() => schalteAkkord(akkord.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    an ? "bg-mint text-tinte" : "bg-white/60 text-tinte-leise"
                  }`}
                >
                  {akkord.symbol}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-tinte">Welche Stellungen?</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxUmkehrungen + 1 }, (_, stufe) => (
            <button
              key={stufe}
              type="button"
              aria-pressed={umkehrungen.includes(stufe)}
              onClick={() => schalteUmkehrung(stufe)}
              className={`rounded-2xl px-4 py-2 text-sm transition-colors ${
                umkehrungen.includes(stufe)
                  ? "bg-mint text-tinte"
                  : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
              }`}
            >
              {umkehrungName(stufe)}
            </button>
          ))}
        </div>
        {maxUmkehrungen > 2 && (
          <p className="text-xs text-tinte-leise">
            Vierklänge haben eine dritte Umkehrung — bei Dreiklängen wird sie
            übersprungen.
          </p>
        )}
      </section>

      <p className="text-xs text-tinte-leise">
        {aktiveAkkorde.length} Akkorde im Vorrat.
      </p>
    </div>
  );
}
