/**
 * Anbindung des E-Pianos ueber die Web MIDI API.
 *
 * Wichtig zur Plattform: WebKit liefert Web MIDI nicht aus, auf iPhone und
 * iPad gibt es die API also in keinem Browser. Dort meldet dieses Modul
 * schlicht "nicht unterstuetzt" und die App bleibt beim Tippen. Auf einem
 * Android-Tablet mit Chrome und auf dem Rechner funktioniert die Verbindung —
 * dann allerdings nur ueber HTTPS oder localhost.
 */

import { type NotenEreignis, erzeugeVerteiler } from "./types";

export type MidiZustand =
  /** Browser kann kein Web MIDI (Safari, iPad). */
  | { art: "nicht-verfuegbar" }
  /** Seite laeuft ohne HTTPS, die API ist deshalb gesperrt. */
  | { art: "unsicherer-kontext" }
  /** Noch nicht gefragt — der Nutzer entscheidet per Knopf. */
  | { art: "bereit" }
  | { art: "verbindet" }
  /** Zugriff da, aber nichts angeschlossen. */
  | { art: "kein-geraet" }
  | { art: "verbunden"; geraete: string[] }
  | { art: "abgelehnt" };

type ZustandsHoerer = (zustand: MidiZustand) => void;

const noten = erzeugeVerteiler();
const zustandsHoerer = new Set<ZustandsHoerer>();

let zustand: MidiZustand = { art: "bereit" };
let zugriff: MIDIAccess | null = null;
let laufenderVersuch: Promise<void> | null = null;

function setzeZustand(neu: MidiZustand) {
  zustand = neu;
  for (const h of zustandsHoerer) h(neu);
}

export function midiZustand(): MidiZustand {
  return zustand;
}

export function aufMidiZustand(hoerer: ZustandsHoerer): () => void {
  zustandsHoerer.add(hoerer);
  return () => zustandsHoerer.delete(hoerer);
}

export function aufMidiNoten(hoerer: (e: NotenEreignis) => void): () => void {
  return noten.abonnieren(hoerer);
}

/** Wird die API hier ueberhaupt angeboten? */
export function midiMoeglich(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.requestMIDIAccess === "function";
}

/**
 * Liest eine MIDI-Nachricht.
 *
 * Zwei Eigenheiten des Protokolls, die gern uebersehen werden: die unteren
 * vier Bit des Statusbytes sind der Kanal und gehoeren nicht zum Befehl, und
 * viele Geraete — das YDP-145 eingeschlossen — schicken statt eines echten
 * Note-Off ein Note-On mit Anschlagstaerke 0.
 *
 * Liefert `null` fuer alles, was keine gespielte Note ist (Pedal, Clock,
 * Programmwechsel).
 */
export function leseNotenEreignis(daten: Uint8Array): NotenEreignis | null {
  if (daten.length < 3) return null;

  const befehl = daten[0] & 0xf0;
  const midi = daten[1];
  const anschlag = daten[2];

  if (befehl === 0x90 && anschlag > 0) {
    return { art: "an", midi, anschlag: anschlag / 127, quelle: "midi" };
  }
  if (befehl === 0x80 || (befehl === 0x90 && anschlag === 0)) {
    return { art: "aus", midi, anschlag: 0, quelle: "midi" };
  }
  return null;
}

function verarbeite(daten: Uint8Array) {
  const ereignis = leseNotenEreignis(daten);
  if (ereignis) noten.senden(ereignis);
}

function geraeteNamen(access: MIDIAccess): string[] {
  const namen: string[] = [];
  access.inputs.forEach((eingang) => {
    namen.push(eingang.name ?? "Unbenanntes Geraet");
  });
  return namen;
}

function verdrahteEingaenge(access: MIDIAccess) {
  access.inputs.forEach((eingang) => {
    eingang.onmidimessage = (nachricht) => {
      const daten = (nachricht as MIDIMessageEvent).data;
      if (daten) verarbeite(daten);
    };
  });

  const namen = geraeteNamen(access);
  setzeZustand(namen.length > 0 ? { art: "verbunden", geraete: namen } : { art: "kein-geraet" });
}

/**
 * Verbindung herstellen. Ruft `requestMIDIAccess` auf, was in Chrome je nach
 * Einstellung eine Rueckfrage ausloest — deshalb wird das nur auf Wunsch oder
 * bei bereits erteilter Berechtigung gemacht, nie ungefragt beim Seitenaufruf.
 */
export async function verbinde(): Promise<void> {
  if (laufenderVersuch) return laufenderVersuch;
  if (zugriff) {
    verdrahteEingaenge(zugriff);
    return;
  }

  if (!midiMoeglich()) {
    setzeZustand({ art: "nicht-verfuegbar" });
    return;
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    setzeZustand({ art: "unsicherer-kontext" });
    return;
  }

  setzeZustand({ art: "verbindet" });

  laufenderVersuch = navigator
    .requestMIDIAccess({ sysex: false })
    .then((access) => {
      zugriff = access;
      // Anstecken und Abziehen im laufenden Betrieb.
      access.onstatechange = () => verdrahteEingaenge(access);
      verdrahteEingaenge(access);
    })
    .catch(() => {
      setzeZustand({ art: "abgelehnt" });
    })
    .finally(() => {
      laufenderVersuch = null;
    });

  return laufenderVersuch;
}

/**
 * Still verbinden, wenn die Berechtigung schon erteilt ist.
 *
 * So erkennt die App ein angestecktes Klavier beim naechsten Besuch von
 * selbst, ohne beim ersten Aufruf mit einer Rueckfrage hereinzuplatzen.
 */
export async function verbindeStillWennErlaubt(): Promise<void> {
  if (!midiMoeglich()) {
    setzeZustand({ art: "nicht-verfuegbar" });
    return;
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    setzeZustand({ art: "unsicherer-kontext" });
    return;
  }

  try {
    // `midi` kennt nicht jeder Browser als Berechtigungsnamen — deshalb im try.
    const status = await navigator.permissions?.query({
      name: "midi" as PermissionName,
    });
    if (status?.state === "granted") await verbinde();
  } catch {
    // Keine Auskunft moeglich: wir warten auf den Knopf.
  }
}
