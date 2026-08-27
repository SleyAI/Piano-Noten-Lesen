"use client";

/**
 * Unaufdringlicher Verbindungsstatus des E-Pianos im Header.
 *
 * Ein Punkt und ein kurzer Text. Nur wenn tatsaechlich etwas zu tun ist,
 * wird daraus ein Knopf.
 */

import { verbinde } from "@/lib/input/midi";
import { useMidiZustand } from "@/lib/input/useNoteneingabe";

export function MidiStatus({ className }: { className?: string }) {
  const zustand = useMidiZustand();

  const { punkt, text, aktion, titel } = beschreibe(zustand);

  const inhalt = (
    <>
      <span
        aria-hidden
        className={`h-2.5 w-2.5 rounded-full ${punkt}`}
      />
      <span className="text-sm">{text}</span>
    </>
  );

  const gemeinsam = `flex items-center gap-2 rounded-full px-3 py-1.5 text-tinte ${className ?? ""}`;

  if (aktion) {
    return (
      <button
        type="button"
        onClick={() => void verbinde()}
        title={titel}
        className={`${gemeinsam} bg-himmel transition-colors hover:bg-himmel-tief`}
      >
        {inhalt}
      </button>
    );
  }

  return (
    <span className={`${gemeinsam} bg-papier-tief`} title={titel}>
      {inhalt}
    </span>
  );
}

function beschreibe(zustand: ReturnType<typeof useMidiZustand>) {
  switch (zustand.art) {
    case "verbunden":
      return {
        punkt: "bg-mint-tief",
        text: zustand.geraete[0] ?? "Klavier verbunden",
        aktion: false,
        titel: zustand.geraete.join(", "),
      };
    case "verbindet":
      return {
        punkt: "bg-himmel-tief animate-puls-sanft",
        text: "verbinde …",
        aktion: false,
        titel: undefined,
      };
    case "kein-geraet":
      return {
        punkt: "bg-creme-tief",
        text: "kein Klavier gefunden",
        aktion: true,
        titel: "Kabel prüfen und erneut versuchen",
      };
    case "abgelehnt":
      return {
        punkt: "bg-creme-tief",
        text: "Zugriff nicht erlaubt",
        aktion: true,
        titel: "Erneut nach der Berechtigung fragen",
      };
    case "unsicherer-kontext":
      return {
        punkt: "bg-creme-tief",
        text: "nur über HTTPS",
        aktion: false,
        titel:
          "Der Browser gibt MIDI nur auf einer sicheren Verbindung frei. Die veröffentlichte Seite oder localhost benutzen.",
      };
    case "nicht-verfuegbar":
      return {
        punkt: "bg-tinte-leise",
        text: "Tippen",
        aktion: false,
        titel:
          "Dieser Browser bietet kein Web MIDI — auf iPad und iPhone ist das so. Die Klaviatur auf dem Bildschirm funktioniert wie gewohnt.",
      };
    default:
      return {
        punkt: "bg-tinte-leise",
        text: "Klavier verbinden",
        aktion: true,
        titel: "Nach angeschlossenen MIDI-Geräten suchen",
      };
  }
}
