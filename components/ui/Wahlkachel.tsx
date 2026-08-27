"use client";

/**
 * Kachel zum An- und Abwaehlen eines Uebungspakets.
 * Aktiv ist Soft Mint, inaktiv bleibt blass — kein Rahmenwechsel, kein Ruckeln.
 */

export function Wahlkachel({
  aktiv,
  titel,
  unterzeile,
  hinweis,
  onClick,
}: {
  aktiv: boolean;
  titel: string;
  unterzeile?: string;
  hinweis?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={`flex flex-col gap-1 rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
        aktiv
          ? "bg-mint text-tinte"
          : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
      }`}
    >
      <span className="flex items-baseline gap-2">
        <span className="font-semibold">{titel}</span>
        {unterzeile && <span className="text-xs opacity-70">{unterzeile}</span>}
      </span>
      {hinweis && <span className="text-xs leading-snug opacity-80">{hinweis}</span>}
    </button>
  );
}
