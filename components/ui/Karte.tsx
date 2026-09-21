"use client";

/**
 * Strahlend weiße, schwebende Kacheln mit großzügig abgerundeten Ecken
 * (rounded-[2rem]) und weichem Lavendel-Schattenwurf.
 */

import Link from "next/link";
import type { ReactNode } from "react";

export type Akzent = "mint" | "flieder" | "himmel" | "pfirsich" | "creme" | "rose";

interface KartenProps {
  akzent?: Akzent;
  children: ReactNode;
  className?: string;
  /** Macht die ganze Karte zum Link. */
  href?: string;
}

export function Karte({ children, className, href }: KartenProps) {
  const grund =
    "group relative flex min-h-0 flex-col overflow-hidden rounded-[28px] bg-white border border-[#E86518]/10 shadow-[0_10px_35px_rgba(232,101,24,0.06)]";

  const inhalt = (
    <span className="relative flex min-h-0 flex-1 flex-col">{children}</span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${grund} transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(232,101,24,0.12)] ${className ?? ""}`}
      >
        {inhalt}
      </Link>
    );
  }

  return <section className={`${grund} ${className ?? ""}`}>{inhalt}</section>;
}

/** Ueberschrift einer Karte — im gemütlich-runden Fredoka-Stil. */
export function Kartentitel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-titel text-xl leading-tight font-bold text-tinte">{children}</h2>
  );
}
