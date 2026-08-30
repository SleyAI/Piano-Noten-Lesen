"use client";

/**
 * Eine Reihe von Noten der Reihe nach durchspielen.
 *
 * Ein Fehlgriff setzt die Reihe zurueck an den Anfang. Das ist der Punkt der
 * Uebung: eine Melodie kann man erst, wenn sie am Stueck sitzt — nicht, wenn
 * jede Note irgendwann einmal getroffen wurde. Was danebenging, bleibt
 * trotzdem sichtbar: die gespielte Note steht blass neben der erwarteten.
 *
 * Zaehlen die Notenwerte mit, wird ausserdem der Abstand zwischen zwei
 * Anschlaegen gemessen — dieselben Grenzen wie bei den Akkorden. Sie sind
 * weit genug, dass niemand ein Metronom braucht, und eng genug, dass eine
 * Halbe nicht als Viertel durchgeht. Wer es genauer moechte, schaltet das
 * Metronom dazu.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { type UebungsNote, uebungsSchluessel } from "@/lib/music/curriculum";
import { nameMitOktave } from "@/lib/music/pitch";
import { type NotenwertId, TEMPO, taktFehler } from "@/lib/music/rhythmus";
import { useNoteneingabe } from "@/lib/input/useNoteneingabe";
import { useTricky } from "@/lib/store/tricky";
import { type DanebenNote, danebenAlsNote } from "./danebenNote";

/** Wie lange ein Fehlgriff nachklingt. */
const PULS_DAUER = 1600;

export type FehlerArt = "ton" | "zu-kurz" | "zu-lang";

export interface ReihenUebungOptionen {
  reihe: readonly UebungsNote[];
  /** Notenwerte der Reihe. Nur wenn gesetzt, zaehlen sie mit. */
  werte?: readonly NotenwertId[];
  tempo?: number;
  /** Solange false, werden Eingaben ignoriert (Auswahl offen, Pause, Abschluss). */
  aktiv: boolean;
  /** Wird einmal aufgerufen, sobald der letzte Ton sitzt. */
  aufFertig: () => void;
}

export interface Fehler {
  art: FehlerArt;
  /** Gespielte MIDI-Nummer. */
  midi: number;
  /** An welcher Stelle der Reihe es passiert ist. */
  index: number;
}

export interface ReihenUebung {
  /** Index des naechsten zu spielenden Tons. */
  position: number;
  /** Der letzte Fehlversuch, solange er nachklingt. */
  fehler: Fehler | null;
  /** Derselbe Ton aufbereitet fuers Notenbild — null, wenn er nicht ins Bild passt. */
  danebenNote: DanebenNote | null;
  fertig: boolean;
  /** Reihe von vorn beginnen, ohne sie auszutauschen. */
  vonVorn: () => void;
}

export function useReihenUebung({
  reihe,
  werte,
  tempo = TEMPO,
  aktiv,
  aufFertig,
}: ReihenUebungOptionen): ReihenUebung {
  const merkeFehler = useTricky((z) => z.merkeFehler);

  const [position, setPosition] = useState(0);
  const [fehler, setFehler] = useState<Fehler | null>(null);
  /**
   * Zeitpunkt des letzten richtigen Anschlags — Bezugspunkt fuer die Laenge.
   * Bewusst als Zustand: er wird beim Neuaufsetzen der Reihe waehrend des
   * Renderns zurueckgesetzt, und dort darf keine Ref beschrieben werden.
   */
  const [letzterAnschlag, setLetzterAnschlag] = useState<number | null>(null);

  // Neue Reihe: Cursor auf Anfang. Bewusst waehrend des Renderns, damit der
  // erste Frame nicht noch den Cursorstand der vorherigen Reihe zeigt.
  const kennung = reihe.map(uebungsSchluessel).join("|");
  const [letzteKennung, setLetzteKennung] = useState(kennung);
  if (kennung !== letzteKennung) {
    setLetzteKennung(kennung);
    setPosition(0);
    setFehler(null);
    setLetzterAnschlag(null);
  }

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  const fertig = reihe.length > 0 && position >= reihe.length;

  /** Zurueck auf Anfang, mit sichtbarem Grund. */
  function zurueckAufAnfang(art: FehlerArt, midi: number, index: number) {
    const erwartet = reihe[index];
    if (erwartet) {
      merkeFehler(uebungsSchluessel(erwartet), nameMitOktave(erwartet.note));
    }
    setPosition(0);
    setFehler({ art, midi, index });
    setLetzterAnschlag(null);
    uhren.current.push(window.setTimeout(() => setFehler(null), PULS_DAUER));
  }

  useNoteneingabe((ereignis) => {
    if (!aktiv || ereignis.art !== "an" || fertig) return;
    const erwartet = reihe[position];
    if (!erwartet) return;

    if (ereignis.midi !== erwartet.note.midi) {
      zurueckAufAnfang("ton", ereignis.midi, position);
      return;
    }

    // Der Ton stimmt — wie lange stand der vorherige?
    const jetzt = performance.now();
    if (werte && position > 0 && letzterAnschlag != null) {
      const schief = taktFehler(werte[position - 1], jetzt - letzterAnschlag, tempo);
      if (schief) {
        zurueckAufAnfang(schief, ereignis.midi, position - 1);
        return;
      }
    }

    setLetzterAnschlag(jetzt);
    setPosition(position + 1);
    setFehler(null);
    if (position + 1 >= reihe.length) aufFertig();
  });

  // Der Fehlgriff moeglichst im System der erwarteten Note, damit sich der
  // Abstand direkt ablesen laesst.
  const danebenNote = useMemo(() => {
    if (!fehler || fehler.art !== "ton") return null;
    return danebenAlsNote(fehler.midi, reihe[fehler.index]?.schluessel ?? null);
  }, [fehler, reihe]);

  return {
    position,
    fehler,
    danebenNote,
    fertig,
    vonVorn: () => {
      setPosition(0);
      setFehler(null);
      setLetzterAnschlag(null);
    },
  };
}
