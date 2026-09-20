"use client";

/**
 * Was zuletzt gehakt hat — als schmales Band auf der Startseite.
 *
 * Kein Punktestand, keine Quote: nur die Namen der Noten und Griffe, die noch
 * Umwege gebraucht haben. Flieder/Lavendel-Badges ohne Punkte.
 */

import { useTricky } from "@/lib/store/tricky";
import { useHydriert } from "@/lib/store/hydriert";
import { Karte } from "./Karte";

export function KniffligeStellen({ className }: { className?: string }) {
  const hydriert = useHydriert();
  const schwierigste = useTricky((z) => z.schwierigste);
  const vergessen = useTricky((z) => z.vergessen);

  if (!hydriert) return null;

  const liste = schwierigste(8);
  if (liste.length === 0) return null;

  return (
    <Karte akzent="flieder" className={`px-6 py-3.5 ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-sm font-medium text-tinte">Zuletzt knifflig:</span>
        <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
          {liste.map(({ schluessel, eintrag }) => (
            <li
              key={schluessel}
              title={`${eintrag.fehler} Umwege bei ${eintrag.versuche} Versuchen`}
              className="rounded-full bg-[#EADCF5]/70 px-3.5 py-1 text-sm font-semibold text-[#785BA3]"
            >
              {eintrag.bezeichnung}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={vergessen}
          className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-tinte-leise transition-colors hover:bg-papier-tief"
        >
          zurücksetzen
        </button>
      </div>
    </Karte>
  );
}
