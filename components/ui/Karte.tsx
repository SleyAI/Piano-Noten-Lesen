"use client";

/**
 * Die Karte, aus der die Startseite gebaut ist.
 *
 * Weisser Grund, weicher Schatten, und links ein schmaler Streifen in der
 * Farbe des Bereichs. Die Farbe traegt damit die Zuordnung, ohne dass eine
 * ganze Flaeche eingefaerbt werden muss — genau so viel Farbe, dass man die
 * Kacheln auseinanderhaelt, und so wenig, dass die Seite ruhig bleibt.
 */

import Link from "next/link";
import type { ReactNode } from "react";

export type Akzent = "mint" | "flieder" | "himmel" | "pfirsich" | "creme" | "rose";

const STREIFEN: Record<Akzent, string> = {
  mint: "bg-mint-tief",
  flieder: "bg-flieder-tief",
  himmel: "bg-himmel-tief",
  pfirsich: "bg-pfirsich-tief",
  creme: "bg-creme-tief",
  rose: "bg-rose-tief",
};

const SCHIMMER: Record<Akzent, string> = {
  mint: "group-hover:bg-mint/25",
  flieder: "group-hover:bg-flieder/25",
  himmel: "group-hover:bg-himmel/25",
  pfirsich: "group-hover:bg-pfirsich/25",
  creme: "group-hover:bg-creme/25",
  rose: "group-hover:bg-rose/25",
};

interface KartenProps {
  akzent: Akzent;
  children: ReactNode;
  className?: string;
  /** Macht die ganze Karte zum Link. */
  href?: string;
}

export function Karte({ akzent, children, className, href }: KartenProps) {
  const grund =
    "group relative flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] bg-white pl-5 shadow-[0_2px_14px_rgba(92,84,112,0.06)]";
  const inhalt = (
    <>
      <span
        aria-hidden
        className={`absolute inset-y-3 left-0 w-1.5 rounded-full ${STREIFEN[akzent]}`}
      />
      {/* Beim Zeigen legt sich ein Hauch der Akzentfarbe darueber. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-transparent transition-colors duration-300 ${
          href ? SCHIMMER[akzent] : ""
        }`}
      />
      <span className="relative flex min-h-0 flex-1 flex-col">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${grund} transition-transform duration-200 hover:-translate-y-0.5 ${className ?? ""}`}
      >
        {inhalt}
      </Link>
    );
  }

  return <section className={`${grund} ${className ?? ""}`}>{inhalt}</section>;
}

/** Ueberschrift einer Karte — im Serif, damit sie nicht wie ein Knopf klingt. */
export function Kartentitel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-titel text-lg leading-tight font-semibold text-tinte">{children}</h2>
  );
}
