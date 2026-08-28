"use client";

/**
 * Einmal anhoeren, was gleich zu spielen ist.
 *
 * Bewusst klein und neben der Aufgabe: es ist ein Angebot, keine Vorgabe. Wer
 * die Noten selbst lesen moechte, tippt einfach nicht darauf. Noch einmal
 * tippen bricht ab, damit man nicht auf das Ende warten muss.
 */

export function PlayKnopf({
  laeuft,
  onClick,
  titel = "Anhören",
  className,
}: {
  laeuft: boolean;
  onClick: () => void;
  titel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={laeuft ? "Vorspielen abbrechen" : titel}
      title={laeuft ? "Vorspielen abbrechen" : titel}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
        laeuft ? "bg-himmel-tief text-tinte" : "bg-himmel text-tinte hover:bg-himmel-tief"
      } ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden focusable="false">
        {laeuft ? (
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
        ) : (
          <path d="M8 5.5 18 12 8 18.5Z" fill="currentColor" />
        )}
      </svg>
    </button>
  );
}
