"use client";

/**
 * Akkorde aussuchen — der ganze Vorrat, nach Niveau und Paket eingeteilt.
 *
 * Es wird nichts mehr versteckt: wer gerade die sechs weissen Dreiklaenge
 * uebt, sieht trotzdem, was danach kommt. Was schon abgehakt ist, traegt
 * einen Haken — das ist der Uebungsplan, hier an der Stelle, an der man ihn
 * beim Aussuchen braucht.
 */

import type { Akkord } from "@/lib/music/akkorde";
import { akkordZiel, akkordeNachNiveau } from "@/lib/music/niveau";
import { useEinstellungen } from "@/lib/store/einstellungen";

export function AkkordWahl({
  gewaehlt,
  aufWahl,
  ueberschrift,
  mehrfach = false,
}: {
  /** Ausgewaehlte Akkord-IDs. */
  gewaehlt: readonly string[];
  aufWahl: (akkord: Akkord) => void;
  ueberschrift: string;
  /** Mehrfachauswahl statt einer einzigen Wahl. */
  mehrfach?: boolean;
}) {
  const beherrscht = useEinstellungen((z) => z.beherrscht);
  const gruppen = akkordeNachNiveau();
  const menge = new Set(gewaehlt);
  const abgehakt = new Set(beherrscht);

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-tinte">{ueberschrift}</h2>

      {gruppen.map((niveau) => (
        <div key={niveau.niveau} className="flex flex-col gap-2">
          <div className="flex items-baseline gap-3">
            <h3 className="text-sm font-semibold text-tinte">{niveau.titel}</h3>
            <p className="min-w-0 flex-1 truncate text-xs text-tinte-leise">{niveau.hinweis}</p>
          </div>

          {niveau.pakete.map((paket) => (
            <div key={paket.paket} className="flex flex-col gap-1.5">
              <h4 className="text-xs text-tinte-leise">{paket.titel}</h4>
              <div
                className="flex flex-wrap gap-1.5"
                role={mehrfach ? "group" : "radiogroup"}
                aria-label={`${niveau.titel} — ${paket.titel}`}
              >
                {paket.akkorde.map((akkord) => {
                  const an = menge.has(akkord.id);
                  const kann = abgehakt.has(akkordZiel(akkord.id));
                  return (
                    <button
                      key={akkord.id}
                      type="button"
                      role={mehrfach ? undefined : "radio"}
                      aria-checked={mehrfach ? undefined : an}
                      aria-pressed={mehrfach ? an : undefined}
                      onClick={() => aufWahl(akkord)}
                      className={`flex items-baseline gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                        an
                          ? "bg-mint text-tinte"
                          : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
                      }`}
                    >
                      {kann && (
                        <span aria-label="abgehakt" className="text-[0.7rem] opacity-70">
                          ✓
                        </span>
                      )}
                      {akkord.symbol}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
