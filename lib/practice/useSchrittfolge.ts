"use client";

/**
 * Eine Folge von Griffen der Reihe nach durchspielen.
 *
 * Der Unterschied zu einem einzelnen Akkord: hier steht nicht der Griff im
 * Mittelpunkt, sondern die Bewegung von einem zum naechsten. Deshalb rueckt
 * die Uebung von selbst weiter, sobald ein Schritt sitzt — man soll ja im
 * Fluss bleiben. Erst am Ende der Folge wartet sie wieder.
 *
 * Fehlgriffe kosten nichts: der falsche Ton pulsiert kurz, die richtigen
 * bleiben gesammelt. Anders als bei den Melodien wird eine Akkordfolge nicht
 * zurueckgesetzt — eine Hand, die einen Griff sucht, ist beim Ueben normal.
 */

import { useCallback, useState } from "react";
import type { UebungsSchritt } from "@/lib/music/akkorduebung";
import { useAkkordGriff } from "./useAkkordGriff";

export interface SchrittfolgeOptionen {
  schritte: readonly UebungsSchritt[];
  /** Solange false, werden Eingaben ignoriert. */
  aktiv: boolean;
  /** Wird bei jedem Fehlgriff mit dem Index des laufenden Schritts gerufen. */
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
  fertig: boolean;
  vonVorn: () => void;
}

export function useSchrittfolge({
  schritte,
  aktiv,
  aufFehler,
  aufFertig,
}: SchrittfolgeOptionen): Schrittfolge {
  const [index, setIndex] = useState(0);
  const [fertig, setFertig] = useState(false);

  // Neue Folge: zurueck auf Anfang, noch waehrend des Renderns — sonst zeigt
  // der erste Frame den Stand der vorherigen Uebung.
  const kennung = schritte.map((s) => `${s.noten.map((n) => n.midi).join(".")}:${s.wert}`).join("|");
  const [letzteKennung, setLetzteKennung] = useState(kennung);
  if (kennung !== letzteKennung) {
    setLetzteKennung(kennung);
    setIndex(0);
    setFertig(false);
  }

  const aktuell = schritte[index] ?? null;
  const erwartet = aktuell ? aktuell.noten.map((n) => n.midi) : [];

  const griff = useAkkordGriff({
    erwartet,
    aktiv: aktiv && !fertig && aktuell !== null,
    // Derselbe Griff kann zweimal hintereinander stehen, und die naechste
    // Uebung kann mit genau demselben Griff anfangen — beides merkt der Griff
    // nur, wenn Folge und Schrittnummer in der Kennung stecken.
    kennung: `${kennung}#${index}`,
    aufTreffer: () => {
      if (index + 1 < schritte.length) {
        setIndex(index + 1);
        return;
      }
      setFertig(true);
      aufFertig?.();
    },
    aufFehler: () => aufFehler?.(index),
  });

  const vonVorn = useCallback(() => {
    setIndex(0);
    setFertig(false);
  }, []);

  return {
    index,
    gespielt: griff.gespielt,
    daneben: griff.daneben,
    fertig,
    vonVorn,
  };
}
