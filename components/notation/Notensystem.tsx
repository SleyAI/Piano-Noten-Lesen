/**
 * Das Doppelsystem als SVG.
 *
 * Noten kommen als Spalten herein: eine Spalte mit einer Note ist eine
 * Flashcard, mehrere Spalten sind eine Melodie, eine Spalte mit mehreren
 * Noten ist ein Akkord. Damit deckt eine Komponente alle drei Modi ab.
 *
 * Bewusst ohne Notenhaelse — geuebt wird die Tonhoehe, nicht der Rhythmus,
 * und blosse Koepfe sind ruhiger anzusehen.
 */

import { Fragment } from "react";
import type { Note, Schluessel } from "@/lib/music/pitch";
import {
  BE,
  type Glyph,
  KREUZ,
  BASSSCHLUESSEL,
  VIOLINSCHLUESSEL,
  ZEILENABSTAND_EM,
} from "@/lib/notation/glyphen";
import {
  KOPF_BREITE,
  KOPF_HOEHE,
  SYSTEM_HOEHE,
  ZEILENABSTAND,
  hilfslinienY,
  klammerOben,
  klammerUnten,
  kopfVersatz,
  schluesselAnkerY,
  systemBreite,
  systemLinien,
  viewBox,
  xVonSpalte,
  yVonNote,
} from "@/lib/notation/layout";

export type NotenZustand = "ruhend" | "aktiv" | "richtig" | "daneben";

export interface SystemNote {
  note: Note;
  schluessel: Schluessel;
}

export interface NotenSpalte {
  id: string;
  noten: SystemNote[];
  zustand: NotenZustand;
  /**
   * Was stattdessen gespielt wurde. Erscheint blass in Flieder rechts neben
   * der erwarteten Note, damit man den Unterschied sieht statt ihn zu raten.
   */
  daneben?: SystemNote[];
}

/** Zeichenfarbe je Zustand. Kein Rot — Fehler sind Flieder, nicht Alarm. */
const FARBE: Record<NotenZustand, string> = {
  ruhend: "var(--color-tinte)",
  aktiv: "var(--color-himmel-tief)",
  richtig: "var(--color-mint-tief)",
  daneben: "var(--color-flieder-tief)",
};

const GLYPH_SKALA = ZEILENABSTAND / ZEILENABSTAND_EM;

function GlyphPfad({ glyph, x, y, fill }: { glyph: Glyph; x: number; y: number; fill: string }) {
  return (
    <path
      d={glyph.d}
      fill={fill}
      transform={`translate(${x} ${y}) scale(${GLYPH_SKALA})`}
    />
  );
}

function glyphBreite(glyph: Glyph): number {
  return (glyph.bbox.x2 - glyph.bbox.x1) * GLYPH_SKALA;
}

function Notenkopf({
  eintrag,
  x,
  versatz,
  zustand,
}: {
  eintrag: SystemNote;
  x: number;
  /** Seitlicher Versatz in Kopfbreiten. */
  versatz: number;
  zustand: NotenZustand;
}) {
  const y = yVonNote(eintrag.note, eintrag.schluessel);
  const mitte = x + versatz * KOPF_BREITE;
  const farbe = FARBE[zustand];
  const linien = hilfslinienY(eintrag.note, eintrag.schluessel);
  const vorzeichen = eintrag.note.alteration === 1 ? KREUZ : eintrag.note.alteration === -1 ? BE : null;

  return (
    <g
      className={zustand === "daneben" ? "animate-puls-sanft" : undefined}
      style={{ transformOrigin: `${mitte}px ${y}px` }}
    >
      {linien.map((linienY) => (
        <line
          key={linienY}
          x1={mitte - KOPF_BREITE * 0.85}
          x2={mitte + KOPF_BREITE * 0.85}
          y1={linienY}
          y2={linienY}
          stroke={farbe}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}

      {vorzeichen && (
        <GlyphPfad
          glyph={vorzeichen}
          x={mitte - KOPF_BREITE / 2 - glyphBreite(vorzeichen) - ZEILENABSTAND * 0.22}
          y={y}
          fill={farbe}
        />
      )}

      <ellipse
        cx={mitte}
        cy={y}
        rx={KOPF_BREITE / 2}
        ry={KOPF_HOEHE / 2}
        fill={farbe}
        transform={`rotate(-20 ${mitte} ${y})`}
      />
    </g>
  );
}

/** Wie weit rechts die falsch gespielte Note steht — in Kopfbreiten. */
const DANEBEN_VERSATZ = 1.35;

function Spalte({ spalte, x }: { spalte: NotenSpalte; x: number }) {
  // Pro System sortieren und Sekunden versetzen, damit sich nichts ueberlappt.
  const proSystem = (["bass", "violin"] as const).map((schluessel) => {
    const eintraege = spalte.noten
      .filter((e) => e.schluessel === schluessel)
      .sort((a, b) => a.note.diatonic - b.note.diatonic);
    return { eintraege, versatz: kopfVersatz(eintraege.map((e) => e.note.diatonic)) };
  });

  return (
    <g>
      {proSystem.map(({ eintraege, versatz }, systemIndex) =>
        eintraege.map((eintrag, i) => (
          <Notenkopf
            key={`${systemIndex}-${eintrag.note.diatonic}-${eintrag.note.alteration}`}
            eintrag={eintrag}
            x={x}
            versatz={versatz[i]}
            zustand={spalte.zustand}
          />
        )),
      )}

      {/* Die tatsaechlich gespielte Note daneben — eigene Spur, damit sie
          nie mit der erwarteten kollidiert. */}
      {spalte.daneben?.map((eintrag) => (
        <Notenkopf
          key={`daneben-${eintrag.schluessel}-${eintrag.note.diatonic}-${eintrag.note.alteration}`}
          eintrag={eintrag}
          x={x}
          versatz={DANEBEN_VERSATZ}
          zustand="daneben"
        />
      ))}
    </g>
  );
}

export interface NotensystemProps {
  spalten: NotenSpalte[];
  /** Zusatzbeschriftung fuer Screenreader. */
  beschreibung?: string;
  className?: string;
}

export function Notensystem({ spalten, beschreibung, className }: NotensystemProps) {
  const breite = systemBreite(spalten.length);
  const linienfarbe = "var(--color-tinte-leise)";

  return (
    <svg
      viewBox={viewBox(spalten.length)}
      className={className}
      role="img"
      aria-label={beschreibung ?? "Notensystem"}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Die beiden Systeme */}
      {(["violin", "bass"] as const).map((schluessel) => (
        <Fragment key={schluessel}>
          {systemLinien(schluessel).map((y) => (
            <line
              key={y}
              x1={ZEILENABSTAND * 0.6}
              x2={breite - ZEILENABSTAND * 0.6}
              y1={y}
              y2={y}
              stroke={linienfarbe}
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          ))}
          <GlyphPfad
            glyph={schluessel === "violin" ? VIOLINSCHLUESSEL : BASSSCHLUESSEL}
            x={ZEILENABSTAND * 1.5}
            y={schluesselAnkerY(schluessel)}
            fill={linienfarbe}
          />
        </Fragment>
      ))}

      {/* Klammer, die beide Systeme zusammenhaelt */}
      <line
        x1={ZEILENABSTAND * 0.6}
        x2={ZEILENABSTAND * 0.6}
        y1={klammerOben()}
        y2={klammerUnten()}
        stroke={linienfarbe}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {spalten.map((spalte, i) => (
        <Spalte key={spalte.id} spalte={spalte} x={xVonSpalte(i, spalten.length)} />
      ))}
    </svg>
  );
}

export { SYSTEM_HOEHE };
