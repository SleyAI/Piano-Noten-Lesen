"use client";

/**
 * Eine Folge von Griffen der Reihe nach durchspielen.
 *
 * Der Unterschied zu einem einzelnen Akkord: hier steht nicht der Griff im
 * Mittelpunkt, sondern die Bewegung von einem zum naechsten. Deshalb rueckt
 * die Uebung von selbst weiter, sobald ein Schritt sitzt — man soll ja im
 * Fluss bleiben.
 *
 * Zaehlen die Notenwerte mit, wird ausserdem der Abstand von einem Anschlag
 * zum naechsten gemessen. Gemessen wird ab dem ersten Ton eines Griffs, nicht
 * ab dem letzten: auf dem Tablet tippt man die drei Toene nacheinander an, und
 * das Suchen soll nicht als Notenlaenge durchgehen.
 *
 * Was ein Fehlgriff kostet, entscheidet die Uebung darueber. In einer
 * Akkordfolge nichts: eine Hand, die den naechsten Griff sucht, ist beim Ueben
 * normal, die Folge wartet einfach. Beim Einueben eines neuen Akkords dagegen
 * faengt die Uebung von vorn an — koennen heisst am Stueck koennen. Der
 * falsche Ton bleibt in beiden Faellen kurz sichtbar, damit man den Abstand
 * sieht statt ihn zu raten.
 */

import { useEffect, useRef, useState } from "react";
import type { UebungsSchritt } from "@/lib/music/akkorduebung";
import { type TaktFehler, TEMPO, taktFehler } from "@/lib/music/rhythmus";
import { useAkkordGriff } from "./useAkkordGriff";

/** Wie lange ein Fehlgriff nachklingt. */
const PULS_DAUER = 1300;

export interface SchrittfolgeOptionen {
  schritte: readonly UebungsSchritt[];
  /** Solange false, werden Eingaben ignoriert. */
  aktiv: boolean;
  /** Setzt ein Fehlgriff die Uebung an den Anfang zurueck? */
  zurueckBeiFehler?: boolean;
  /** Zaehlen die Notenwerte mit? */
  taktGenau?: boolean;
  tempo?: number;
  /** Wird bei jedem Fehler mit dem Index des laufenden Schritts gerufen. */
  aufFehler?: (index: number) => void;
  /** Wird einmal aufgerufen, sobald der letzte Schritt sitzt. */
  aufFertig?: () => void;
}

export interface Schrittfolge {
  /** Welcher Schritt gerade dran ist. */
  index: number;
  /** Bereits richtig gegriffene Toene des laufenden Schritts. */
  gespielt: Set<number>;
  daneben: Set<number>;
  /** Der letzte Taktfehler, solange er nachklingt. */
  takt: TaktFehler | null;
  fertig: boolean;
}

export function useSchrittfolge({
  schritte,
  aktiv,
  zurueckBeiFehler = false,
  taktGenau = false,
  tempo = TEMPO,
  aufFehler,
  aufFertig,
}: SchrittfolgeOptionen): Schrittfolge {
  const [index, setIndex] = useState(0);
  const [fertig, setFertig] = useState(false);
  const [daneben, setDaneben] = useState<Set<number>>(() => new Set());
  const [takt, setTakt] = useState<TaktFehler | null>(null);
  /**
   * Zaehlt die Anlaeufe. Steckt in der Kennung des Griffs, damit ein Neustart
   * auf demselben Schritt auch die schon gesammelten Toene vergisst.
   */
  const [anlauf, setAnlauf] = useState(0);

  /**
   * Wann der laufende Schritt angeschlagen wurde — Bezugspunkt fuer die
   * Notenlaenge. Bewusst als Zustand: beim Neuaufsetzen der Folge wird er
   * waehrend des Renderns zurueckgesetzt, und dort darf keine Ref beschrieben
   * werden.
   */
  const [angeschlagen, setAngeschlagen] = useState<number | null>(null);

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  // Neue Folge: zurueck auf Anfang, noch waehrend des Renderns — sonst zeigt
  // der erste Frame den Stand der vorherigen Uebung.
  const kennung = schritte.map((s) => `${s.noten.map((n) => n.midi).join(".")}:${s.wert}`).join("|");
  const [letzteKennung, setLetzteKennung] = useState(kennung);
  if (kennung !== letzteKennung) {
    setLetzteKennung(kennung);
    setIndex(0);
    setFertig(false);
    setDaneben(new Set());
    setTakt(null);
    setAngeschlagen(null);
  }

  const aktuell = schritte[index] ?? null;
  const erwartet = aktuell ? aktuell.noten.map((n) => n.midi) : [];

  /** Von vorn, mit sichtbarem Grund. */
  function vonVorn() {
    setIndex(0);
    setAnlauf((a) => a + 1);
    setAngeschlagen(null);
  }

  function nachklingen(aufraeumen: () => void) {
    uhren.current.push(window.setTimeout(aufraeumen, PULS_DAUER));
  }

  const griff = useAkkordGriff({
    erwartet,
    aktiv: aktiv && !fertig && aktuell !== null,
    // Derselbe Griff kann zweimal hintereinander stehen, und die naechste
    // Uebung kann mit genau demselben Griff anfangen — beides merkt der Griff
    // nur, wenn Folge, Schrittnummer und Anlauf in der Kennung stecken.
    kennung: `${kennung}#${index}#${anlauf}`,
    vergissBeiFehler: zurueckBeiFehler,
    aufErstemTon: () => {
      const jetzt = performance.now();
      setAngeschlagen(jetzt);

      // Wie lange stand der Schritt davor? Der erste hat keinen Vorgaenger.
      const davor = schritte[index - 1];
      if (!taktGenau || !davor || angeschlagen === null) return;

      const schief = taktFehler(davor.wert, jetzt - angeschlagen, tempo);
      if (!schief) return;

      setTakt(schief);
      nachklingen(() => setTakt(null));
      aufFehler?.(index - 1);
      if (zurueckBeiFehler) vonVorn();
    },
    aufTreffer: () => {
      setDaneben(new Set());
      if (index + 1 < schritte.length) {
        setIndex(index + 1);
        return;
      }
      setFertig(true);
      aufFertig?.();
    },
    aufFehler: (midi) => {
      setDaneben((s) => new Set(s).add(midi));
      nachklingen(() => setDaneben(new Set()));
      aufFehler?.(index);
      if (zurueckBeiFehler) vonVorn();
    },
  });

  return { index, gespielt: griff.gespielt, daneben, takt, fertig };
}
