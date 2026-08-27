/**
 * Kleines Notenbild auf den Modus-Kacheln der Startseite.
 *
 * Rein schmueckend und deshalb bewusst nicht der echte Renderer: ein
 * angedeutetes System mit ein paar Koepfen, blass genug, dass die Ueberschrift
 * die Kachel traegt.
 */

type Bild = "einzel" | "melodie" | "akkord";

/** Positionen in halben Zeilenabstaenden ueber der untersten Linie. */
const FIGUREN: Record<Bild, Array<{ x: number; stufen: number[] }>> = {
  einzel: [{ x: 60, stufen: [4] }],
  melodie: [
    { x: 26, stufen: [2] },
    { x: 43, stufen: [4] },
    { x: 60, stufen: [3] },
    { x: 77, stufen: [5] },
    { x: 94, stufen: [7] },
  ],
  akkord: [
    { x: 40, stufen: [0, 2, 4] },
    { x: 80, stufen: [2, 4, 6] },
  ],
};

const ZEILE = 9;
const OBEN = 8;

export function Modusbild({ bild, className }: { bild: Bild; className?: string }) {
  const y = (stufe: number) => OBEN + (8 - stufe) * (ZEILE / 2);

  return (
    <svg viewBox="0 0 120 84" className={className} aria-hidden focusable="false">
      <g opacity="0.28">
        {[0, 2, 4, 6, 8].map((stufe) => (
          <line
            key={stufe}
            x1={8}
            x2={112}
            y1={y(stufe)}
            y2={y(stufe)}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        ))}
      </g>
      <g opacity="0.55">
        {FIGUREN[bild].flatMap((figur) =>
          figur.stufen.map((stufe) => (
            <ellipse
              key={`${figur.x}-${stufe}`}
              cx={figur.x}
              cy={y(stufe)}
              rx={5.4}
              ry={4.4}
              fill="currentColor"
              transform={`rotate(-20 ${figur.x} ${y(stufe)})`}
            />
          )),
        )}
      </g>
    </svg>
  );
}
