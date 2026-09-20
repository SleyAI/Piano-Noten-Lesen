"use client";

/**
 * Schlanke Kopfzeile der Uebungsseiten: runder Zurück-Button, Fredoka-Titel, Status.
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
    <header className="flex shrink-0 items-center gap-4 px-6 py-4">
      <Link
        href="/"
        aria-label="Zurück zur Auswahl"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-[#785BA3] shadow-[0_2px_10px_rgba(120,91,163,0.08)] transition-all hover:bg-[#785BA3] hover:text-white"
      >
        ←
      </Link>

      <div className="min-w-0">
        <h1 className="truncate font-titel text-2xl leading-tight font-bold text-tinte">
          {titel}
        </h1>
        {unterzeile && (
          <p className="truncate text-xs text-tinte-leise font-medium">{unterzeile}</p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {rechts}
        <Sessionuhr />
        <MidiStatus />
      </div>
    </header>
  );
}
