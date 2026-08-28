/**
 * Das Doppelsystem als SVG.
 *
 * Noten kommen als Spalten herein: eine Spalte mit einer Note ist eine
 * Flashcard, mehrere Spalten sind eine Melodie, eine Spalte mit mehreren
 * Noten ist ein Akkord. Damit deckt eine Komponente alle Modi ab.
 *
 * Notenwerte sind optional. Ohne sie bleiben blosse Koepfe stehen — ruhiger
 * anzusehen und genau richtig, solange nur die Tonhoehe geuebt wird. Sobald
 * eine Spalte einen Wert mitbringt, kommen Hals, Fahne und Taktstrich dazu.
 * Bewusst ohne Balken: einzelne Fahnen sind fuer Leseanfaenger eindeutiger,
 * und es gibt hier nichts, was ein Balken zusaetzlich gruppieren muesste.
 */

import { Fragment } from "react";
import type { Note, Schluessel } from "@/lib/music/pitch";
import { linienPosition } from "@/lib/music/pitch";
import type { NotenwertId } from "@/lib/music/rhythmus";
import {
  BE,
  FAHNE_AB,
  FAHNE_AUF,
  type Glyph,
  KOPF_GANZE,
  KOPF_HALBE,
  KOPF_VIERTEL,
  KREUZ,
  BASSSCHLUESSEL,
  VIOLINSCHLUESSEL,
  ZEILENABSTAND_EM,
} from "@/lib/notation/glyphen";
import {
  HALS_ANSATZ,
  HALS_LAENGE,
  HALS_STAERKE,
  KOPF_BREITE,
  SYSTEM_HOEHE,
  ZEILENABSTAND,
  halsRichtung,
  hilfslinienY,
  klammerOben,
  klammerUnten,
  kopfVersatz,
  schluesselAnkerY,
  systemBreite,
  systemLinien,
  viewBox,
  xVonSpalte,
  xVonTaktstrich,
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
  /** Notenwert dieser Spalte. Ohne Angabe wird nur der Kopf gezeichnet. */
  wert?: NotenwertId;
  /** Faellt hinter dieser Spalte ein Taktstrich? */
  taktEnde?: boolean;
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

/** Welcher Notenkopf gehoert zu diesem Wert? */
function kopfGlyph(wert: NotenwertId | undefined): Glyph {
  if (wert === "ganze") return KOPF_GANZE;
  if (wert === "halbe") return KOPF_HALBE;
  return KOPF_VIERTEL;
}

function Notenkopf({
  eintrag,
  x,
  versatz,
  zustand,
  wert,
}: {
  eintrag: SystemNote;
  x: number;
  /** Seitlicher Versatz in Kopfbreiten. */
  versatz: number;
  zustand: NotenZustand;
  wert?: NotenwertId;
}) {
  const y = yVonNote(eintrag.note, eintrag.schluessel);
  const mitte = x + versatz * KOPF_BREITE;
  const farbe = FARBE[zustand];
  const glyph = kopfGlyph(wert);
  const breite = glyphBreite(glyph);
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
          x1={mitte - breite * 0.72}
          x2={mitte + breite * 0.72}
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
          x={mitte - breite / 2 - glyphBreite(vorzeichen) - ZEILENABSTAND * 0.22}
          y={y}
          fill={farbe}
        />
      )}

      <GlyphPfad glyph={glyph} x={mitte - breite / 2} y={y} fill={farbe} />
    </g>
  );
}

/**
 * Hals samt Fahne fuer eine Notengruppe innerhalb eines Systems.
 *
 * Die ganze Note bekommt keinen — und ohne Notenwerte gibt es ueberhaupt
 * keine Haelse, dann steht nur der Kopf da.
 */
function Hals({
  eintraege,
  versatz,
  x,
  zustand,
  wert,
}: {
  eintraege: SystemNote[];
  versatz: number[];
  x: number;
  zustand: NotenZustand;
  wert: NotenwertId;
}) {
  if (wert === "ganze" || eintraege.length === 0) return null;

  const farbe = FARBE[zustand];
  const schluessel = eintraege[0].schluessel;
  const positionen = eintraege.map((e) => linienPosition(e.note, schluessel));
  const richtung = halsRichtung(positionen);

  const ys = eintraege.map((e) => yVonNote(e.note, schluessel));
  const tiefsteY = Math.max(...ys);
  const hoechsteY = Math.min(...ys);

  // Der Hals sitzt am Kopf, der ihn traegt: oben am tiefsten, unten am hoechsten.
  const traegerIndex = ys.indexOf(richtung === "auf" ? tiefsteY : hoechsteY);
  const traegerMitte = x + versatz[traegerIndex] * KOPF_BREITE;

  const halsX =
    richtung === "auf" ? traegerMitte + HALS_ANSATZ : traegerMitte - HALS_ANSATZ;
  const ansatzY = richtung === "auf" ? tiefsteY : hoechsteY;
  const endeY =
    richtung === "auf" ? hoechsteY - HALS_LAENGE : tiefsteY + HALS_LAENGE;

  return (
    <g>
      <line
        x1={halsX}
        x2={halsX}
        y1={ansatzY}
        y2={endeY}
        stroke={farbe}
        strokeWidth={HALS_STAERKE}
        strokeLinecap="round"
      />
      {wert === "achtel" && (
        <GlyphPfad
          glyph={richtung === "auf" ? FAHNE_AUF : FAHNE_AB}
          x={halsX}
          y={endeY}
          fill={farbe}
        />
      )}
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
      {proSystem.map(({ eintraege, versatz }, systemIndex) => (
        <Fragment key={systemIndex}>
          {spalte.wert && (
            <Hals
              eintraege={eintraege}
              versatz={versatz}
              x={x}
              zustand={spalte.zustand}
              wert={spalte.wert}
            />
          )}
          {eintraege.map((eintrag, i) => (
            <Notenkopf
              key={`${eintrag.note.diatonic}-${eintrag.note.alteration}`}
              eintrag={eintrag}
              x={x}
              versatz={versatz[i]}
              zustand={spalte.zustand}
              wert={spalte.wert}
            />
          ))}
        </Fragment>
      ))}

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

      {/* Taktstriche gehen wie im Klaviersatz durch beide Systeme. */}
      {spalten.map((spalte, i) =>
        spalte.taktEnde && i < spalten.length - 1 ? (
          <line
            key={`takt-${spalte.id}`}
            x1={xVonTaktstrich(i, spalten.length)}
            x2={xVonTaktstrich(i, spalten.length)}
            y1={klammerOben()}
            y2={klammerUnten()}
            stroke={linienfarbe}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        ) : null,
      )}

      {spalten.map((spalte, i) => (
        <Spalte key={spalte.id} spalte={spalte} x={xVonSpalte(i, spalten.length)} />
      ))}
    </svg>
  );
}

export { SYSTEM_HOEHE };
