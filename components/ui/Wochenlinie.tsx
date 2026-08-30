"use client";

/**
 * Die Uebungswoche als Notenzeile.
 *
 * Ein Balkendiagramm haette es auch getan, aber diese App handelt vom
 * Notenlesen — also steht die Woche auf fuenf Linien: je Tag ein Notenkopf,
 * und je laenger geuebt wurde, desto hoeher sitzt er. Wer die Seite offen hat,
 * liest hier nebenbei Tonhoehen.
 *
 * Ein leerer Tag bekommt keinen Kopf, sondern einen blassen Ring unter der
 * Zeile. Das ist kein Vorwurf, nur eine Luecke.
 */

import { KOPF_VIERTEL, ZEILENABSTAND_EM } from "@/lib/notation/glyphen";
import { type Tageseintrag, kurzeDauer, wochentagKurz } from "@/lib/practice/uebungszeit";

/** Halber Zeilenabstand in Zeicheneinheiten. */
const HALB = 6;
const ZEILE = HALB * 2;
const SPALTE = 54;
const RAND_OBEN = 18;
const RAND_UNTEN = 36;
const HOEHE = RAND_OBEN + 8 * HALB + RAND_UNTEN;

const SKALA = ZEILE / ZEILENABSTAND_EM;
const KOPF_BREITE = (KOPF_VIERTEL.bbox.x2 - KOPF_VIERTEL.bbox.x1) * SKALA;

/**
 * Ein Tag ohne Uebung hat keine Position, sonst eine zwischen 1 und 8 — also
 * vom ersten Zwischenraum bis zur obersten Linie. Bezugsgroesse ist die beste
 * halbe Stunde der Woche, mindestens aber eine halbe Stunde: an einem ruhigen
 * Tag soll der Kopf nicht gleich oben kleben.
 */
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
      className="h-full w-auto"
      role="img"
      aria-label={`Geübte Zeit der letzten Tage: ${beschreibung}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {[0, 2, 4, 6, 8].map((linie) => (
        <line
          key={linie}
          x1={4}
          x2={breite - 4}
          y1={y(linie)}
          y2={y(linie)}
          stroke="var(--color-tinte-leise)"
          strokeOpacity={0.35}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      ))}

      {tage.map((tag, i) => {
        const mitte = 8 + i * SPALTE + SPALTE / 2;
        const pos = position(tag.sekunden, hoechst);
        const istHeute = tag.schluessel === heute;
        const farbe = istHeute ? "var(--color-pfirsich-tief)" : "var(--color-tinte)";

        return (
          <g key={tag.schluessel}>
            {pos === null ? (
              <circle
                cx={mitte}
                cy={y(-1)}
                r={KOPF_BREITE / 3}
                fill="none"
                stroke="var(--color-tinte-leise)"
                strokeOpacity={0.4}
                strokeWidth={1.4}
              />
            ) : (
              <path
                d={KOPF_VIERTEL.d}
                fill={farbe}
                transform={`translate(${mitte - KOPF_BREITE / 2} ${y(pos)}) scale(${SKALA})`}
              />
            )}

            <text
              x={mitte}
              y={HOEHE - 11}
              textAnchor="middle"
              fill={istHeute ? "var(--color-tinte)" : "var(--color-tinte-leise)"}
              fontSize={11}
              fontWeight={istHeute ? 700 : 400}
            >
              {wochentagKurz(tag.datum)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
