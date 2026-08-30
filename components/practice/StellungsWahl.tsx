"use client";

/**
 * Welche Stellung wird geuebt?
 *
 * Eine einzige Wahl, keine Liste zum Anhaken: wer die erste Umkehrung
 * aussucht, bekommt die erste Umkehrung. Wer Grundstellung und Umkehrungen
 * nacheinander ueben moechte, nimmt "alle zusammen".
 *
 * Im Lernreiter steht die Grundstellung mit zur Wahl, im Umkehrungsreiter
 * nicht — sonst waere der Reiter nicht der Reiter.
 */

import {
  type Akkord,
  type Stellung,
  alleStellungen,
  umkehrungName,
  wirksameStellung,
} from "@/lib/music/akkorde";
import { useEinstellungen } from "@/lib/store/einstellungen";

export function StellungsWahl({
  akkord,
  modus,
}: {
  akkord: Akkord;
  modus: "lernen" | "umkehrungen";
}) {
  const gespeichert = useEinstellungen((z) =>
    modus === "lernen" ? z.stellungLernen : z.stellungUmkehrung,
  );
  const setzen = useEinstellungen((z) => z.setzeStellung);
  const gewaehlt = wirksameStellung(akkord, gespeichert);

  const moeglich = alleStellungen(akkord).filter((s) => modus === "lernen" || s > 0);
  const wahlen: Stellung[] = [...moeglich, "alle"];

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-tinte">Welche Stellung?</h2>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Stellung">
        {wahlen.map((wahl) => {
          const an = wahl === gewaehlt;
          return (
            <button
              key={String(wahl)}
              type="button"
              role="radio"
              aria-checked={an}
              onClick={() => setzen(modus, wahl)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                an ? "bg-mint text-tinte" : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
              }`}
            >
              {wahl === "alle" ? "alle zusammen" : umkehrungName(wahl)}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-tinte-leise">
        {gewaehlt === "alle"
          ? "Erst die Grundstellung, dann jede Umkehrung — jede mit allen gewählten Übungen."
          : "Nur diese eine Stellung, mit allen gewählten Übungen."}
      </p>
    </section>
  );
}
