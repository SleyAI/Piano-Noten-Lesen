"use client";

/**
 * Der Knopf, der die Uebung startet — festgenagelt am unteren Rand.
 * Jetzt im samtigen Lavendel-Ton mit weißer Schrift.
 */

import type { ReactNode } from "react";

export function StartLeiste({
  text,
  bereit = true,
  onClick,
  links,
}: {
  text: string;
  /** Solange false, ist der Knopf blass und erklaert im Text, was fehlt. */
  bereit?: boolean;
  onClick: () => void;
  /** Platz fuer eine kurze Anmerkung links neben dem Knopf. */
  links?: ReactNode;
}) {
  return (
    <div className="pointer-events-none sticky bottom-0 z-10 -mx-6 mt-auto px-6 pt-6 pb-4">
      {/* Ein weicher Verlauf statt einer Kante: darunter scrollt Inhalt durch. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full bg-gradient-to-t from-papier from-60% via-papier/85 to-transparent" />
      <div className="pointer-events-auto flex items-center gap-4">
        {links}
        <button
          type="button"
          disabled={!bereit}
          onClick={onClick}
          className="ml-auto rounded-full bg-[#E86518] px-8 py-3 font-semibold text-white shadow-[0_6px_20px_rgba(232,101,24,0.25)] transition-all duration-200 hover:bg-[#CF530B] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
        >
          {text}
        </button>
      </div>
    </div>
  );
}
