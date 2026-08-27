import { describe, expect, it } from "vitest";
import { leseNotenEreignis } from "./midi";

const nachricht = (...bytes: number[]) => new Uint8Array(bytes);

describe("MIDI-Nachrichten lesen", () => {
  it("erkennt eine gedrueckte Taste", () => {
    // Note-On, Kanal 1, mittleres C, kraeftig angeschlagen
    expect(leseNotenEreignis(nachricht(0x90, 60, 100))).toEqual({
      art: "an",
      midi: 60,
      anschlag: 100 / 127,
      quelle: "midi",
    });
  });

  it("erkennt eine losgelassene Taste", () => {
    expect(leseNotenEreignis(nachricht(0x80, 60, 0))?.art).toBe("aus");
  });

  it("versteht Note-On mit Anschlag 0 als Loslassen", () => {
    // So melden viele Geraete das Loslassen — auch das YDP-145.
    expect(leseNotenEreignis(nachricht(0x90, 60, 0))?.art).toBe("aus");
  });

  it("beachtet nur den Befehl, nicht den Kanal", () => {
    for (let kanal = 0; kanal < 16; kanal += 1) {
      expect(leseNotenEreignis(nachricht(0x90 | kanal, 64, 80))?.art, `Kanal ${kanal}`).toBe("an");
      expect(leseNotenEreignis(nachricht(0x80 | kanal, 64, 0))?.art, `Kanal ${kanal}`).toBe("aus");
    }
  });

  it("gibt die Oktave unveraendert weiter", () => {
    // Ein 88-Tasten-Klavier reicht von A0 bis C8.
    for (const midi of [21, 48, 60, 72, 108]) {
      expect(leseNotenEreignis(nachricht(0x90, midi, 64))?.midi).toBe(midi);
    }
  });

  it("normiert die Anschlagstaerke auf 0 bis 1", () => {
    expect(leseNotenEreignis(nachricht(0x90, 60, 127))?.anschlag).toBe(1);
    expect(leseNotenEreignis(nachricht(0x90, 60, 1))?.anschlag).toBeCloseTo(1 / 127);
  });

  it("ignoriert alles, was keine Note ist", () => {
    expect(leseNotenEreignis(nachricht(0xb0, 64, 127))).toBeNull(); // Pedal
    expect(leseNotenEreignis(nachricht(0xc0, 0, 0))).toBeNull(); // Programmwechsel
    expect(leseNotenEreignis(nachricht(0xa0, 60, 40))).toBeNull(); // Aftertouch
  });

  it("stolpert nicht ueber zu kurze Nachrichten", () => {
    expect(leseNotenEreignis(nachricht(0xf8))).toBeNull(); // Clock
    expect(leseNotenEreignis(nachricht())).toBeNull();
  });
});
