"use client";

/**
 * Auswahl der Landmark-Stufen fuer Noten und Melodien.
 * Mehrfachauswahl, mindestens eine Stufe bleibt immer aktiv.
 */

import { NOTEN_PAKETE, paketUmfang } from "@/lib/music/curriculum";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { Wahlkachel } from "@/components/ui/Wahlkachel";

export function NotenPaketWahl() {
  const gewaehlt = useEinstellungen((z) => z.notenPakete);
  const schalten = useEinstellungen((z) => z.schalteNotenPaket);
  const setzen = useEinstellungen((z) => z.setzeNotenPakete);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-tinte">Welche Noten moechtest du ueben?</h2>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            className="rounded-full bg-papier-tief px-3 py-1 text-tinte-leise transition-colors hover:bg-mint"
            onClick={() => setzen(NOTEN_PAKETE.map((p) => p.id))}
          >
            alle
          </button>
          <button
            type="button"
            className="rounded-full bg-papier-tief px-3 py-1 text-tinte-leise transition-colors hover:bg-mint"
            onClick={() => setzen([NOTEN_PAKETE[0].id])}
          >
            nur die Mitte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {NOTEN_PAKETE.map((paket) => (
          <Wahlkachel
            key={paket.id}
            aktiv={gewaehlt.includes(paket.id)}
            titel={paket.titel}
            unterzeile={`${paketUmfang(paket)} Noten`}
            hinweis={paket.hinweis}
            onClick={() => schalten(paket.id)}
          />
        ))}
      </div>
    </div>
  );
}
