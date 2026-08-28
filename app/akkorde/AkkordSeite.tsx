"use client";

/**
 * Akkorde — drei Wege durch dasselbe Material.
 *
 *  - *neu lernen*: einen Akkord aussuchen, seinen Griff anschauen und ihn
 *    von mehreren Seiten durchspielen
 *  - *Umkehrungen*: dieselben Uebungen, aber ueber die gewaehlten Stellungen
 *  - *Folgen*: mehrere Akkorde hintereinander, als Bloecke oder gebrochen
 *
 * Welche Akkorde ueberhaupt zur Auswahl stehen, entscheidet das Niveau.
 */

import { useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { type AkkordModus, useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { erlaubteAkkorde, niveauTitel } from "@/lib/music/niveau";
import { AkkordLernen } from "./AkkordLernen";
import { AkkordfolgenUebung } from "./AkkordfolgenUebung";

const REITER: Array<{ wert: AkkordModus; titel: string }> = [
  { wert: "lernen", titel: "neu lernen" },
  { wert: "umkehrungen", titel: "Umkehrungen" },
  { wert: "folgen", titel: "Folgen" },
];

export function AkkordSeite() {
  const hydriert = useHydriert();
  const niveau = useEinstellungen((z) => z.niveau);
  const modus = useEinstellungen((z) => z.akkordModus);
  const setzeModus = useEinstellungen((z) => z.setzeAkkordModus);
  // Der Zaehler setzt den laufenden Modus zurueck, wenn man den Reiter
  // wechselt und wieder zurueckkommt — sonst haengt man in einer halb
  // gespielten Folge fest.
  const [wechsel, setWechsel] = useState(0);

  if (!hydriert) return <div className="h-full bg-papier" />;

  const anzahl = erlaubteAkkorde(niveau).length;

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Akkorde"
        unterzeile={`${anzahl} Akkorde als ${niveauTitel(niveau)}`}
        rechts={
          <div className="flex gap-1 rounded-full bg-papier-tief p-1">
            {REITER.map((reiter) => (
              <button
                key={reiter.wert}
                type="button"
                aria-pressed={modus === reiter.wert}
                onClick={() => {
                  setzeModus(reiter.wert);
                  setWechsel((w) => w + 1);
                }}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  modus === reiter.wert
                    ? "bg-flieder text-tinte"
                    : "text-tinte-leise hover:bg-white/60"
                }`}
              >
                {reiter.titel}
              </button>
            ))}
          </div>
        }
      />

      {modus === "folgen" ? (
        <AkkordfolgenUebung key={wechsel} />
      ) : (
        <AkkordLernen key={`${modus}-${wechsel}`} modus={modus} />
      )}
    </div>
  );
}
