"use client";

import { KOPF_VIERTEL, ZEILENABSTAND_EM } from "@/lib/notation/glyphen";
import { type Tageseintrag, kurzeDauer, wochentagKurz } from "@/lib/practice/uebungszeit";

const HALB = 7;
const ZEILE = HALB * 2;
const SPALTE = 56;
const RAND_OBEN = 24;
const RAND_UNTEN = 34;
const HOEHE = RAND_OBEN + 8 * HALB + RAND_UNTEN;

const SKALA = ZEILE / ZEILENABSTAND_EM;
const KOPF_BREITE = (KOPF_VIERTEL.bbox.x2 - KOPF_VIERTEL.bbox.x1) * SKALA;

function position(sekunden: number, hoechst: number): number | null {
  if (sekunden <= 0) return null;
  return Math.min(8, Math.max(1, Math.round((sekunden / hoechst) * 8)));
}

function y(pos: number): number {
  return RAND_OBEN + (8 - pos) * HALB;
}

export function Wochenlinie({ tage }: { tage: readonly Tageseintrag[] }) {
  const breite = tage.length * SPALTE + 16;
  const hoechst = Math.max(30 * 60, ...tage.map((t) => t.sekunden));
  const heute = tage[tage.length - 1]?.schluessel;

  const beschreibung = tage
    .map((t) => `${wochentagKurz(t.datum)} ${kurzeDauer(t.sekunden)}`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${breite} ${HOEHE}`}
      className="h-full w-auto max-w-full"
      role="img"
      aria-label={`Geübte Zeit der letzten Tage: ${beschreibung}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* 5 Notenlinien */}
      {[0, 2, 4, 6, 8].map((linie) => (
        <line
          key={linie}
          x1={6}
          x2={breite - 6}
          y1={y(linie)}
          y2={y(linie)}
          stroke="var(--color-tinte-leise)"
          strokeOpacity={0.3}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      ))}

      {tage.map((tag, i) => {
        const mitte = 8 + i * SPALTE + SPALTE / 2;
        const pos = position(tag.sekunden, hoechst);
        const istHeute = tag.schluessel === heute;
        const farbe = istHeute ? "var(--color-lavendel)" : "var(--color-tinte)";

        return (
          <g key={tag.schluessel}>
            <title>
              {wochentagKurz(tag.datum)}: {tag.sekunden > 0 ? kurzeDauer(tag.sekunden) : "keine Übung"}
            </title>

            {/* Notenkopf oder leerer Kreis */}
            {pos === null ? (
              <circle
                cx={mitte}
                cy={y(-1)}
                r={KOPF_BREITE / 3}
                fill="none"
                stroke={istHeute ? "var(--color-lavendel)" : "var(--color-tinte-leise)"}
                strokeOpacity={istHeute ? 0.75 : 0.35}
                strokeWidth={1.4}
              />
            ) : (
              <path
                d={KOPF_VIERTEL.d}
                fill={farbe}
                transform={`translate(${mitte - KOPF_BREITE / 2} ${y(pos)}) scale(${SKALA})`}
              />
            )}

            {/* Geübte Minuten über der Notenzeile */}
            {tag.sekunden > 0 && (
              <text
                x={mitte}
                y={11}
                textAnchor="middle"
                fill={istHeute ? "var(--color-lavendel)" : "var(--color-tinte)"}
                fontSize={10}
                fontWeight={istHeute ? 700 : 600}
                opacity={0.85}
              >
                {kurzeDauer(tag.sekunden)}
              </text>
            )}

            {/* Wochentag unter der Notenzeile */}
            <text
              x={mitte}
              y={HOEHE - 10}
              textAnchor="middle"
              fill={istHeute ? "var(--color-lavendel)" : "var(--color-tinte-leise)"}
              fontSize={11}
              fontWeight={istHeute ? 700 : 500}
            >
              {wochentagKurz(tag.datum)}
            </text>

            {/* Dezenter Punkt für Heute */}
            {istHeute && (
              <circle
                cx={mitte}
                cy={HOEHE - 3}
                r={2}
                fill="var(--color-lavendel)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
