"use client";

/**
 * Unaufdringlicher Verbindungsstatus des E-Pianos im Header.
 *
 * Kurzer Text als sauberes Pill-Badge ohne Statuspunkte oder Emojis.
 * Nur wenn tatsächlich etwas zu tun ist, wird daraus ein interaktiver Knopf.
 */

import { verbinde } from "@/lib/input/midi";
import { useMidiZustand } from "@/lib/input/useNoteneingabe";

export function MidiStatus({ className }: { className?: string }) {
  const zustand = useMidiZustand();

  const { text, aktion, titel } = beschreibe(zustand);

  const inhalt = <span className="text-sm font-medium">{text}</span>;

  const gemeinsam = `flex items-center gap-2 rounded-full px-4 py-2 bg-white shadow-[0_2px_10px_rgba(121,77,44,0.06)] text-tinte ${className ?? ""}`;

  if (aktion) {
    return (
      <button
        type="button"
        onClick={() => void verbinde()}
        title={titel}
        className={`${gemeinsam} transition-colors hover:bg-[#EFE3D5]`}
      >
        {inhalt}
      </button>
    );
  }

  return (
    <span className={gemeinsam} title={titel}>
      {inhalt}
    </span>
  );
}

function beschreibe(zustand: ReturnType<typeof useMidiZustand>) {
  switch (zustand.art) {
    case "verbunden":
      return {
        text: zustand.geraete[0] ?? "Klavier verbunden",
        aktion: false,
        titel: zustand.geraete.join(", "),
      };
    case "verbindet":
      return {
        text: "verbinde …",
        aktion: false,
        titel: undefined,
      };
    case "kein-geraet":
      return {
        text: "kein Klavier gefunden",
        aktion: true,
        titel: "Kabel prüfen und erneut versuchen",
      };
    case "abgelehnt":
      return {
        text: "Zugriff nicht erlaubt",
        aktion: true,
        titel: "Erneut nach der Berechtigung fragen",
      };
    case "unsicherer-kontext":
      return {
        text: "nur über HTTPS",
        aktion: false,
        titel:
          "Der Browser gibt MIDI nur auf einer sicheren Verbindung frei. Die veröffentlichte Seite oder localhost benutzen.",
      };
    case "nicht-verfuegbar":
      return {
        text: "Tippen",
        aktion: false,
        titel:
          "Dieser Browser bietet kein Web MIDI — auf iPad und iPhone ist das so. Die Klaviatur auf dem Bildschirm funktioniert wie gewohnt.",
      };
    default:
      return {
        text: "Klavier verbinden",
        aktion: true,
        titel: "Nach angeschlossenen MIDI-Geräten suchen",
      };
  }
}
