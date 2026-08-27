"use client";

/**
 * Wie weit ist die Runde? Punkte statt Prozentzahl — das liest sich
 * nebenbei und drueckt nicht.
 */

export function Fortschrittspunkte({
  gesamt,
  erledigt,
}: {
  gesamt: number;
  erledigt: number;
}) {
  return (
    <span
      className="flex items-center gap-1"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={gesamt}
      aria-valuenow={erledigt}
      aria-label="Fortschritt in dieser Runde"
    >
      {Array.from({ length: gesamt }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
            i < erledigt ? "bg-mint-tief" : "bg-papier-tief"
          }`}
        />
      ))}
    </span>
  );
}
