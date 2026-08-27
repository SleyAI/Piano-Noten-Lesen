"use client";

/**
 * Weiter zum naechsten Griff.
 *
 * Akkorde springen bewusst nicht von selbst weiter: der Griff bleibt stehen,
 * solange man ihn anschauen und nachfuehlen moechte.
 */

export function WeiterKnopf({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus
      className="animate-auftauchen rounded-full bg-mint px-7 py-2 text-sm font-semibold text-tinte transition-colors hover:bg-mint-tief"
    >
      {text}
    </button>
  );
}
