"use client";

import { Akkordbild } from "@/components/practice/Akkordbild";
import { type Haende, type Lage, griffFuerHaende } from "@/lib/music/akkorde";
import { name } from "@/lib/music/pitch";

export interface VorbereitungsEintrag {
  id: string;
  titel: string;
  lage: Lage;
}

export function AkkordVorbereitung({
  titel,
  eintraege,
  haende,
  aufBereit,
  aufZurueck,
}: {
  titel: string;
  eintraege: VorbereitungsEintrag[];
  haende: Haende;
  aufBereit: () => void;
  aufZurueck?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4 max-w-4xl mx-auto w-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-tinte">{titel}</h2>
      </div>

      <div
        className={`grid w-full gap-4 ${
          eintraege.length <= 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {eintraege.map((eintrag) => {
          const griff = griffFuerHaende(eintrag.lage.toene, haende);
          const toeneText = (griff.rechts.length > 0 ? griff.rechts : griff.links)
            .map(name)
            .join(" · ");

          return (
            <div
              key={eintrag.id}
              className="flex flex-col items-center gap-3 rounded-2xl bg-papier-tief p-4 shadow-sm border border-black/5"
            >
              <span className="text-xl font-bold text-tinte">{eintrag.titel}</span>
              <Akkordbild
                griff={griff}
                umkehrung={eintrag.lage.umkehrung}
                className="w-full"
              />
              <span className="text-sm text-tinte-leise font-medium">{toeneText}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-2">
        {aufZurueck && (
          <button
            type="button"
            onClick={aufZurueck}
            className="rounded-full bg-papier-tief px-6 py-3 text-sm font-medium text-tinte transition-colors hover:bg-papier-dunkel"
          >
            Auswahl ändern
          </button>
        )}
        <button
          type="button"
          onClick={aufBereit}
          className="rounded-full bg-flieder px-10 py-3.5 text-lg font-bold text-tinte shadow-md hover:bg-flieder-tief transition-all duration-200 active:scale-95"
        >
          Bin bereit!
        </button>
      </div>
    </div>
  );
}
