"use client";

/**
 * Schlanke Kopfzeile der Uebungsseiten: zurueck, Titel, Status.
 * Bewusst niedrig — der Platz gehoert den Noten.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { MidiStatus } from "./MidiStatus";
import { Sessionuhr } from "./SessionBand";

export function Kopfzeile({
  titel,
  unterzeile,
  rechts,
}: {
  titel: string;
  unterzeile?: string;
  rechts?: ReactNode;
}) {
  return (
    <header className="flex shrink-0 items-center gap-4 px-5 py-3">
      <Link
        href="/"
        aria-label="Zurück zur Auswahl"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-papier-tief text-lg text-tinte transition-colors hover:bg-mint"
      >
        ←
      </Link>

      <div className="min-w-0">
        <h1 className="truncate font-titel text-lg leading-tight font-bold text-tinte">
          {titel}
        </h1>
        {unterzeile && (
          <p className="truncate text-xs text-tinte-leise">{unterzeile}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {rechts}
        <Sessionuhr />
        <MidiStatus />
      </div>
    </header>
  );
}
