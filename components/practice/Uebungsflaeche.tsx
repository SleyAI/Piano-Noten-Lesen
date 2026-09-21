"use client";

import type { ReactNode } from "react";
import { Klaviatur } from "@/components/keyboard/Klaviatur";
import { NotenKaestchen } from "@/components/practice/NotenKaestchen";
import type { UebungsNote } from "@/lib/music/curriculum";
import { useEinstellungen } from "@/lib/store/einstellungen";

export interface UebungsflaecheProps {
  notenbild: ReactNode;
  hinweis?: ReactNode;
  hervorgehoben?: ReadonlyMap<number, "mint" | "flieder" | "himmel">;
  klaviaturVon: number;
  klaviaturBis: number;
  mitBeschriftung?: boolean;
  aktuelleNote?: UebungsNote | null;
}

export function Uebungsflaeche({
  notenbild,
  hinweis,
  hervorgehoben,
  klaviaturVon,
  klaviaturBis,
  mitBeschriftung,
  aktuelleNote,
}: UebungsflaecheProps) {
  const spielweise = useEinstellungen((z) => z.spielweise);
  const klaviaturImmerZeigen = useEinstellungen((z) => z.klaviaturImmerZeigen);
  const eingabeModus = useEinstellungen((z) => z.eingabeModus);
  const notenLevel = useEinstellungen((z) => z.notenLevel);
  const klangAn = useEinstellungen((z) => z.klangAn);

  const zeigeEingabe = spielweise === "tippen" || klaviaturImmerZeigen;
  const appKlang = spielweise === "tippen" && klangAn;

  return (
    <div className="flex min-h-0 flex-1 flex-col w-full">
      {/* Notenbereich füllt den Browser harmonisch und großzügig aus */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 sm:px-6 pb-1">
        <div className="flex min-h-0 w-full max-w-5xl xl:max-w-6xl flex-1 items-center justify-center rounded-[2rem] bg-white px-6 sm:px-8 py-5 shadow-[0_2px_16px_rgba(92,84,112,0.07)]">
          {notenbild}
        </div>

        <div className="flex h-9 shrink-0 items-center justify-center text-center">
          {hinweis}
        </div>
      </div>

      {/* Unten: Entweder Klaviatur mit Middle C oder Noten-Kästchen */}
      {zeigeEingabe && (
        <div className="w-full flex justify-center shrink-0">
          {eingabeModus === "kaestchen" ? (
            <NotenKaestchen
              erwarteteNote={aktuelleNote}
              mitKlang={appKlang}
              mitAlterationen={notenLevel === 5}
              className="w-full max-w-4xl pb-4"
            />
          ) : (
            <Klaviatur
              von={klaviaturVon}
              bis={klaviaturBis}
              hervorgehoben={hervorgehoben}
              mitKlang={appKlang}
              mitBeschriftung={mitBeschriftung}
              className="h-[28dvh] max-h-52 min-h-28 w-full max-w-5xl xl:max-w-6xl px-3 pb-3"
            />
          )}
        </div>
      )}
    </div>
  );
}
