"use client";

/**
 * Was zuletzt gehakt hat — als schmales Band auf der Startseite.
 *
 * Kein Punktestand, keine Quote: nur die Namen der Noten und Griffe, die noch
 * Umwege gebraucht haben. Wenn nichts hakt, erscheint das Band gar nicht.
 */

import { useTricky } from "@/lib/store/tricky";
import { useHydriert } from "@/lib/store/hydriert";

export function KniffligeStellen({ className }: { className?: string }) {
  const hydriert = useHydriert();
  const schwierigste = useTricky((z) => z.schwierigste);
  const vergessen = useTricky((z) => z.vergessen);

  if (!hydriert) return null;

  const liste = schwierigste(8);
  if (liste.length === 0) return null;

  return (
    <section
      className={`flex items-center gap-3 rounded-[1.75rem] bg-creme/70 px-5 py-3 ${className ?? ""}`}
    >
      <span className="shrink-0 text-sm text-tinte">Zuletzt knifflig:</span>
      <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
        {liste.map(({ schluessel, eintrag }) => (
          <li
            key={schluessel}
            title={`${eintrag.fehler} Umwege bei ${eintrag.versuche} Versuchen`}
            className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-tinte"
          >
            {eintrag.bezeichnung}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={vergessen}
        className="shrink-0 rounded-full px-3 py-1 text-xs text-tinte-leise transition-colors hover:bg-white/60"
      >
        zurücksetzen
      </button>
    </section>
  );
}
