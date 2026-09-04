"use client";

/**
 * Gemeinsames Geruest aller Uebungsmodi: Notenbild oben, Klaviatur unten,
 * dazwischen eine Zeile fuer den Hinweis des jeweiligen Modus.
 *
 * Feste Hoehen, kein Scrollen — im Querformat soll nichts wandern, wenn eine
 * Note wechselt.
 */

import type { ReactNode } from "react";
import { Klaviatur } from "@/components/keyboard/Klaviatur";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useWachHalten } from "@/lib/practice/useWachHalten";

export interface UebungsflaecheProps {
  notenbild: ReactNode;
  /** Ruhige Zeile unter den Noten — Aufgabenstellung oder Ermutigung. */
  hinweis?: ReactNode;
  /** Tasten, die farbig markiert werden sollen. */
  hervorgehoben?: ReadonlyMap<number, "mint" | "flieder" | "himmel">;
  klaviaturVon: number;
  klaviaturBis: number;
  mitBeschriftung?: boolean;
}

export function Uebungsflaeche({
  notenbild,
  hinweis,
  hervorgehoben,
  klaviaturVon,
  klaviaturBis,
  mitBeschriftung,
}: UebungsflaecheProps) {
  const spielweise = useEinstellungen((z) => z.spielweise);
  const klaviaturImmerZeigen = useEinstellungen((z) => z.klaviaturImmerZeigen);
  const klangAn = useEinstellungen((z) => z.klangAn);

  // Solange eine Uebung offen ist, soll der Tablet-Bildschirm anbleiben.
  useWachHalten();

  // Am E-Piano ist die Klaviatur auf dem Bildschirm nur Beiwerk.
  const zeigeKlaviatur = spielweise === "tippen" || klaviaturImmerZeigen;
  const appKlang = spielweise === "tippen" && klangAn;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 pb-1">
        {/* Das Notenbild bekommt eine eigene Flaeche — sonst schwebt es im Raum. */}
        <div className="flex min-h-0 w-full max-w-4xl max-h-[28rem] flex-1 items-center justify-center rounded-[2rem] bg-white px-6 py-4 shadow-[0_2px_16px_rgba(92,84,112,0.07)]">
          {notenbild}
        </div>

        <div className="flex h-9 shrink-0 items-center justify-center text-center">
          {hinweis}
        </div>
      </div>

      {zeigeKlaviatur && (
        <Klaviatur
          von={klaviaturVon}
          bis={klaviaturBis}
          hervorgehoben={hervorgehoben}
          mitKlang={appKlang}
          mitBeschriftung={mitBeschriftung}
          className="h-[28dvh] max-h-48 min-h-28 shrink-0 px-3 pb-3"
        />
      )}
    </div>
  );
}
