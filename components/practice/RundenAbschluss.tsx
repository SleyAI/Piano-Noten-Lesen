"use client";

/**
 * Kurze Uebersicht am Ende einer Runde.
 *
 * Wichtig: kein Punktestand und keine Quote. Es gibt einen freundlichen Satz
 * und, falls etwas gehakt hat, die Einladung genau das noch einmal zu spielen.
 */

import { useTricky } from "@/lib/store/tricky";

const LOB = [
  "Das saß.",
  "Schön ruhig gespielt.",
  "Wieder ein Stück vertrauter.",
  "Gut gemacht.",
];

export function RundenAbschluss({
  titel,
  aufNeueRunde,
  aufWiederholung,
}: {
  titel: string;
  aufNeueRunde: () => void;
  /** Nur anbieten, wenn der Modus eine gezielte Wiederholung unterstuetzt. */
  aufWiederholung?: (schluessel: string[]) => void;
}) {
  const rundenFehler = useTricky((z) => z.rundenFehler)();
  const knifflig = rundenFehler.slice(0, 5);

  // Fester Satz pro Runde, damit er nicht bei jedem Rendern wechselt.
  const lob = LOB[knifflig.length % LOB.length];

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="animate-auftauchen">
        <h2 className="text-2xl font-bold text-tinte">{titel}</h2>
        <p className="mt-1 text-tinte-leise">{lob}</p>
      </div>

      {knifflig.length > 0 ? (
        <div className="animate-auftauchen w-full max-w-xl rounded-3xl bg-creme/60 px-6 py-5">
          <p className="text-sm text-tinte">
            Diese {knifflig.length === 1 ? "eine hat" : `${knifflig.length} haben`} noch
            gezögert:
          </p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {knifflig.map((eintrag) => (
              <li
                key={eintrag.schluessel}
                className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-tinte"
              >
                {eintrag.bezeichnung}
              </li>
            ))}
          </ul>
          {aufWiederholung && (
            <button
              type="button"
              onClick={() => aufWiederholung(knifflig.map((e) => e.schluessel))}
              className="mt-4 rounded-full bg-flieder px-5 py-2 text-sm font-semibold text-tinte transition-colors hover:bg-flieder-tief"
            >
              nur diese wiederholen
            </button>
          )}
        </div>
      ) : (
        <p className="animate-auftauchen text-tinte-leise">
          Diesmal ohne einen einzigen Umweg.
        </p>
      )}

      <button
        type="button"
        onClick={aufNeueRunde}
        className="rounded-full bg-mint px-8 py-3 font-semibold text-tinte transition-colors hover:bg-mint-tief"
      >
        noch eine Runde
      </button>
    </div>
  );
}
