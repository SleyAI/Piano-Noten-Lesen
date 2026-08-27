"use client";

/**
 * Zusammengefuehrter Ereignisstrom aus Klavier und Klaviatur.
 *
 * Die Uebungsmodi nutzen ausschliesslich diesen Hook. Welche Quellen gerade
 * aktiv sind, entscheidet die App an einer Stelle — nicht jeder Modus einzeln.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";
import { aufMidiNoten, aufMidiZustand, midiZustand, verbindeStillWennErlaubt } from "./midi";
import { aufGetippteNoten } from "./tippen";
import type { MidiZustand } from "./midi";
import type { NotenEreignis } from "./types";

/**
 * Ruft `beiEreignis` bei jeder gespielten Note auf.
 *
 * Der Rueckruf wird in einer Ref gehalten, damit ein Modus seine Reaktion
 * jederzeit aendern kann, ohne dass die Abos neu aufgebaut werden.
 */
export function useNoteneingabe(beiEreignis: (e: NotenEreignis) => void) {
  const rueckruf = useRef(beiEreignis);

  // Nach dem Rendern nachziehen — waehrend des Renderns darf eine Ref nicht
  // beschrieben werden.
  useEffect(() => {
    rueckruf.current = beiEreignis;
  });

  useEffect(() => {
    const weiter = (e: NotenEreignis) => rueckruf.current(e);
    const abMidi = aufMidiNoten(weiter);
    const abTippen = aufGetippteNoten(weiter);
    return () => {
      abMidi();
      abTippen();
    };
  }, []);
}

/** Beim Vorrendern gibt es noch kein Klavier. */
const ZUSTAND_OHNE_BROWSER: MidiZustand = { art: "bereit" };

/**
 * Verbindungszustand des Klaviers.
 *
 * Der Zustand lebt in einem Modul ausserhalb von React, deshalb wird er ueber
 * `useSyncExternalStore` gelesen statt in einen Effekt kopiert. Beim ersten
 * Aufruf wird still verbunden, falls die Berechtigung schon steht.
 */
export function useMidiZustand(): MidiZustand {
  useEffect(() => {
    void verbindeStillWennErlaubt();
  }, []);

  return useSyncExternalStore(aufMidiZustand, midiZustand, () => ZUSTAND_OHNE_BROWSER);
}
