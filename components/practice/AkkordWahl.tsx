"use client";

/**
 * Akkorde aussuchen — als flache Liste, nach Paketen gruppiert.
 *
 * Angeboten wird nur, was das eingestellte Niveau hergibt. Ein Anfaenger
 * bekommt hier also sechs Akkorde zu sehen und nicht neunzig; das ist der
 * eigentliche Zweck der Niveaus.
 */

import type { Akkord } from "@/lib/music/akkorde";
import { akkordeNachPaket } from "@/lib/music/niveau";
import type { Niveau } from "@/lib/music/niveau";

export function AkkordWahl({
  niveau,
  gewaehlt,
  aufWahl,
  ueberschrift,
  mehrfach = false,
}: {
  niveau: Niveau;
  /** Ausgewaehlte Akkord-IDs. */
  gewaehlt: readonly string[];
  aufWahl: (akkord: Akkord) => void;
  ueberschrift: string;
  /** Mehrfachauswahl statt einer einzigen Wahl. */
  mehrfach?: boolean;
}) {
  const gruppen = akkordeNachPaket(niveau);
  const menge = new Set(gewaehlt);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-tinte">{ueberschrift}</h2>

      {gruppen.map((gruppe) => (
        <div key={gruppe.paket} className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-tinte-leise">{gruppe.titel}</h3>
          <div
            className="flex flex-wrap gap-1.5"
            role={mehrfach ? "group" : "radiogroup"}
            aria-label={gruppe.titel}
          >
            {gruppe.akkorde.map((akkord) => {
              const an = menge.has(akkord.id);
              return (
                <button
                  key={akkord.id}
                  type="button"
                  role={mehrfach ? undefined : "radio"}
                  aria-checked={mehrfach ? undefined : an}
                  aria-pressed={mehrfach ? an : undefined}
                  onClick={() => aufWahl(akkord)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    an
                      ? "bg-mint text-tinte"
                      : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
                  }`}
                >
                  {akkord.symbol}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
