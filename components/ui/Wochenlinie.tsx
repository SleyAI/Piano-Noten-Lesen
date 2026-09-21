"use client";

import { KOPF_VIERTEL, ZEILENABSTAND_EM } from "@/lib/notation/glyphen";
import { type Tageseintrag, kurzeDauer, wochentagKurz } from "@/lib/practice/uebungszeit";

const HALB = 7;
const ZEILE = HALB * 2;
const SPALTE = 56;
const RAND_OBEN = 22;
const RAND_UNTEN = 32;
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
      className="h-full w-auto max-w-full select-none"
      role="img"
      aria-label={`Geübte Zeit der letzten Tage: ${beschreibung}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* 5 Notenlinien */}
      {[0, 2, 4, 6, 8].map((linie) => (
        <line
          key={linie}
          x1={8}
          x2={breite - 8}
          y1={y(linie)}
          y2={y(linie)}
          stroke="var(--color-tinte-leise)"
          strokeOpacity={0.25}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      ))}

      {tage.map((tag, i) => {
        const mitte = 8 + i * SPALTE + SPALTE / 2;
        const pos = position(tag.sekunden, hoechst);
        const istHeute = tag.schluessel === heute;
        const farbe = istHeute ? "#785BA3" : "var(--color-tinte)";

        return (
          <g key={tag.schluessel}>
            <title>
              {wochentagKurz(tag.datum)}: {tag.sekunden > 0 ? kurzeDauer(tag.sekunden) : "keine Übung"}
            </title>

            {/* Notenkopf oder leerer Kreis */}
            {pos === null ? (
              <circle
                cx={mitte}
                cy={y(0)}
                r={KOPF_BREITE / 3.2}
                fill="none"
                stroke={istHeute ? "#785BA3" : "var(--color-tinte-leise)"}
                strokeOpacity={istHeute ? 0.6 : 0.3}
                strokeWidth={1.3}
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
                y={13}
                textAnchor="middle"
                fill={istHeute ? "#785BA3" : "var(--color-tinte)"}
                fontSize={10}
                fontWeight={istHeute ? 700 : 600}
                opacity={0.88}
              >
                {kurzeDauer(tag.sekunden)}
              </text>
            )}

            {/* Wochentag unter der Notenzeile */}
            <text
              x={mitte}
              y={HOEHE - 10}
              textAnchor="middle"
              fill={istHeute ? "#785BA3" : "var(--color-tinte-leise)"}
              fontSize={11}
              fontWeight={istHeute ? 700 : 600}
            >
              {wochentagKurz(tag.datum)}
            </text>

            {/* Dezenter Punkt für Heute */}
            {istHeute && (
              <circle
                cx={mitte}
                cy={HOEHE - 3}
                r={2}
                fill="#785BA3"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
