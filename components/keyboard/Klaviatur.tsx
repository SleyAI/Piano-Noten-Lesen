"use client";

/**
 * Virtuelle Klaviatur fuer den Tipp-Modus.
 *
 * Bewusst Tasten statt Notennamen-Knoepfen: geuebt wird der Weg von der Note
 * zur Taste, und derselbe Weg funktioniert spaeter am echten Klavier. Akkorde
 * lassen sich damit ausserdem genauso greifen wie Einzelnoten.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { name, vonMidi } from "@/lib/music/pitch";
import { tasteGedrueckt, tasteLosgelassen } from "@/lib/input/tippen";
import { aufwecken, spieleTon, stoppeTon } from "@/lib/audio/engine";

/** Halbtonabstaende der schwarzen Tasten innerhalb einer Oktave. */
const SCHWARZ = new Set([1, 3, 6, 8, 10]);

function istSchwarz(midi: number): boolean {
  return SCHWARZ.has(((midi % 12) + 12) % 12);
}

/** Wie viele weisse Tasten liegen vor dieser Note, gerechnet ab `von`? */
function weisseVor(von: number, midi: number): number {
  let zahl = 0;
  for (let m = von; m < midi; m += 1) if (!istSchwarz(m)) zahl += 1;
  return zahl;
}

export interface KlaviaturProps {
  /** Tiefste und hoechste angezeigte Taste (MIDI-Nummern). */
  von: number;
  bis: number;
  /** Noten, die farblich hervorgehoben werden — etwa als Hilfestellung. */
  hervorgehoben?: ReadonlyMap<number, "mint" | "flieder" | "himmel">;
  /** Klang aus der App abspielen? Am E-Piano uebernimmt das Piano. */
  mitKlang?: boolean;
  /** Namen auf den weissen Tasten zeigen. */
  mitBeschriftung?: boolean;
  className?: string;
}

const HERVORHEBUNG: Record<string, string> = {
  mint: "var(--color-mint-tief)",
  flieder: "var(--color-flieder-tief)",
  himmel: "var(--color-himmel-tief)",
};

export function Klaviatur({
  von: vonRoh,
  bis: bisRoh,
  hervorgehoben,
  mitKlang = true,
  mitBeschriftung = false,
  className,
}: KlaviaturProps) {
  const [gedrueckt, setGedrueckt] = useState<Set<number>>(() => new Set());
  // Welcher Finger haelt welche Taste — sonst bleiben Toene beim Wischen haengen.
  const zeiger = useRef(new Map<number, number>());

  // Der Ausschnitt muss links und rechts auf einer weissen Taste enden, sonst
  // haengt eine schwarze Taste ueber dem Rand.
  let von = vonRoh;
  let bis = bisRoh;
  while (istSchwarz(von)) von -= 1;
  while (istSchwarz(bis)) bis += 1;

  const tasten: number[] = [];
  for (let m = von; m <= bis; m += 1) tasten.push(m);
  const weisse = tasten.filter((m) => !istSchwarz(m));
  const anzahlWeiss = weisse.length;

  const loslassen = useCallback(
    (midi: number, zeigerId: number) => {
      zeiger.current.delete(zeigerId);
      setGedrueckt((s) => {
        const neu = new Set(s);
        neu.delete(midi);
        return neu;
      });
      if (mitKlang) stoppeTon(midi);
      tasteLosgelassen(midi);
    },
    [mitKlang],
  );

  const anfassen = useCallback(
    (midi: number, zeigerId: number) => {
      // Derselbe Finger auf derselben Taste — nichts zu tun.
      if (zeiger.current.get(zeigerId) === midi) return;
      // Beim Gleiten die vorherige Taste ordentlich freigeben.
      const vorher = zeiger.current.get(zeigerId);
      if (vorher !== undefined) loslassen(vorher, zeigerId);

      zeiger.current.set(zeigerId, midi);
      setGedrueckt((s) => new Set(s).add(midi));
      aufwecken();
      if (mitKlang) spieleTon(midi);
      tasteGedrueckt(midi);
    },
    [mitKlang, loslassen],
  );

  // Finger koennen ausserhalb der Taste losgelassen werden.
  useEffect(() => {
    const aufraeumen = (ev: PointerEvent) => {
      const midi = zeiger.current.get(ev.pointerId);
      if (midi !== undefined) loslassen(midi, ev.pointerId);
    };
    window.addEventListener("pointerup", aufraeumen);
    window.addEventListener("pointercancel", aufraeumen);
    return () => {
      window.removeEventListener("pointerup", aufraeumen);
      window.removeEventListener("pointercancel", aufraeumen);
    };
  }, [loslassen]);

  function tastenFarbe(midi: number): string | undefined {
    if (gedrueckt.has(midi)) return "var(--color-himmel-tief)";
    const markierung = hervorgehoben?.get(midi);
    return markierung ? HERVORHEBUNG[markierung] : undefined;
  }

  return (
    <div
      className={`relative touch-none select-none ${className ?? ""}`}
      role="group"
      aria-label="Klaviatur"
    >
      {/* Weisse Tasten */}
      <div className="flex h-full w-full">
        {weisse.map((midi) => {
          const farbe = tastenFarbe(midi);
          return (
            <button
              key={midi}
              type="button"
              aria-label={name(vonMidi(midi))}
              onPointerDown={(e) => {
                e.currentTarget.releasePointerCapture?.(e.pointerId);
                anfassen(midi, e.pointerId);
              }}
              onPointerEnter={(e) => {
                if (e.buttons > 0) anfassen(midi, e.pointerId);
              }}
              className="relative flex-1 rounded-b-xl border border-papier-tief bg-white shadow-sm transition-colors duration-100"
              style={farbe ? { backgroundColor: farbe } : undefined}
            >
              {mitBeschriftung && (
                <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[0.65rem] font-semibold text-tinte-leise">
                  {name(vonMidi(midi))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schwarze Tasten liegen darueber und zwischen den weissen. */}
      <div className="pointer-events-none absolute inset-0">
        {tasten
          .filter(istSchwarz)
          .map((midi) => {
            const links = (weisseVor(von, midi) / anzahlWeiss) * 100;
            const breite = (1 / anzahlWeiss) * 100 * 0.62;
            const farbe = tastenFarbe(midi);
            return (
              <button
                key={midi}
                type="button"
                aria-label={name(vonMidi(midi))}
                onPointerDown={(e) => {
                  e.currentTarget.releasePointerCapture?.(e.pointerId);
                  anfassen(midi, e.pointerId);
                }}
                onPointerEnter={(e) => {
                  if (e.buttons > 0) anfassen(midi, e.pointerId);
                }}
                className="pointer-events-auto absolute top-0 h-[62%] rounded-b-lg bg-tinte shadow-md transition-colors duration-100"
                style={{
                  left: `calc(${links}% - ${breite / 2}%)`,
                  width: `${breite}%`,
                  ...(farbe ? { backgroundColor: farbe } : {}),
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
