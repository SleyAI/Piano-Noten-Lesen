/**
 * Anfaenger, Fortgeschritten, Profi.
 *
 * Das Niveau ist kein Rang, sondern ein Vorrat: es legt fest, welche Noten
 * und welche Akkorde ueberhaupt angeboten werden. Anfaenger bleiben auf den
 * weissen Tasten, ab Fortgeschritten kommen die schwarzen dazu.
 *
 * Jedes Niveau bringt seine eigene Liste an Lernzielen mit — was dieses
 * Niveau ausmacht, zum Durchsehen und Abhaken. Dass eine Liste voll ist,
 * schaltet nichts frei: gewechselt wird, wann man moechte.
 */

import {
  type Akkord,
  AKKORD_PAKETE,
  akkordeAusPaketen,
  akkordeImPaket,
} from "./akkorde";
import { NOTEN_PAKETE, type NotenPaket, PAKET_NACH_ID } from "./curriculum";
import { name } from "./pitch";

export type Niveau = "anfaenger" | "fortgeschritten" | "profi";

/** Von leicht nach schwer — jedes Niveau enthaelt die vorigen. */
export const NIVEAU_REIHE: Niveau[] = ["anfaenger", "fortgeschritten", "profi"];

interface NiveauStufe {
  id: Niveau;
  titel: string;
  hinweis: string;
  /** Was dieses Niveau an Notenpaketen hinzufuegt. */
  notenPakete: string[];
  /** Was dieses Niveau an Akkordpaketen hinzufuegt. */
  akkordPakete: string[];
  /**
   * Nur Akkorde ohne Vorzeichen. Greift innerhalb der genannten Pakete und
   * ist der Grund, warum D-Dur beim Anfaenger noch fehlt: es braucht ein Fis.
   */
  nurWeisseTasten: boolean;
}

const STUFEN: Record<Niveau, NiveauStufe> = {
  anfaenger: {
    id: "anfaenger",
    titel: "Anfänger",
    hinweis:
      "Nur weiße Tasten. Die Stammtöne rund um das mittlere C und die sechs Akkorde, die daraus entstehen.",
    notenPakete: [
      "mitte",
      "landmarks",
      "aeussere-c",
      "um-die-mitte",
      "um-die-landmarks",
      "um-die-aeusseren-c",
      "oktave-voll",
    ],
    akkordPakete: ["dreiklaenge-erste"],
    nurWeisseTasten: true,
  },
  fortgeschritten: {
    id: "fortgeschritten",
    titel: "Fortgeschritten",
    hinweis:
      "Die schwarzen Tasten kommen dazu — mit ihnen alle zwölf Dur- und Molldreiklänge und die Dominantseptakkorde.",
    notenPakete: ["nach-aussen", "hilfslinien", "kreuze", "be-vorzeichen"],
    akkordPakete: ["dur-moll-komplett", "dominantsept"],
    nurWeisseTasten: false,
  },
  profi: {
    id: "profi",
    titel: "Profi",
    hinweis:
      "Alles: die restlichen Halbtöne, Sus- und Add-Akkorde, große und kleine Septakkorde, Optionstöne.",
    notenPakete: ["alle-halbtoene"],
    akkordPakete: [
      "sus-add",
      "maj7-m7",
      "vermindert-uebermaessig",
      "halbvermindert",
      "optionstoene",
    ],
    nurWeisseTasten: false,
  },
};

export const NIVEAUS: NiveauStufe[] = NIVEAU_REIHE.map((id) => STUFEN[id]);

export function niveauTitel(niveau: Niveau): string {
  return STUFEN[niveau].titel;
}

export function niveauHinweis(niveau: Niveau): string {
  return STUFEN[niveau].hinweis;
}

/** Das naechsthoehere Niveau, oder null beim obersten. */
export function naechstesNiveau(niveau: Niveau): Niveau | null {
  const i = NIVEAU_REIHE.indexOf(niveau);
  return i >= 0 && i + 1 < NIVEAU_REIHE.length ? NIVEAU_REIHE[i + 1] : null;
}

/** Dieses Niveau und alle darunter. */
function bisEinschliesslich(niveau: Niveau): NiveauStufe[] {
  const grenze = NIVEAU_REIHE.indexOf(niveau);
  return NIVEAU_REIHE.slice(0, grenze + 1).map((id) => STUFEN[id]);
}

// --- Was steht zur Verfuegung? ----------------------------------------------

/** Alle Notenpakete bis zu diesem Niveau, in Curriculum-Reihenfolge. */
export function erlaubteNotenPakete(niveau: Niveau): NotenPaket[] {
  const ids = new Set(bisEinschliesslich(niveau).flatMap((s) => s.notenPakete));
  return NOTEN_PAKETE.filter((p) => ids.has(p.id));
}

export function notenPaketErlaubt(id: string, niveau: Niveau): boolean {
  return erlaubteNotenPakete(niveau).some((p) => p.id === id);
}

/** Ein Akkord ohne jedes Vorzeichen — also rein auf weissen Tasten greifbar. */
export function nurWeisseTasten(akkord: Akkord): boolean {
  return akkord.toene.every((t) => t.alteration === 0);
}

/** Alle Akkorde bis zu diesem Niveau, ohne Doppelte. */
export function erlaubteAkkorde(niveau: Niveau): Akkord[] {
  const gesehen = new Set<string>();
  const ergebnis: Akkord[] = [];

  for (const stufe of bisEinschliesslich(niveau)) {
    for (const akkord of akkordeAusPaketen(stufe.akkordPakete)) {
      if (stufe.nurWeisseTasten && !nurWeisseTasten(akkord)) continue;
      if (gesehen.has(akkord.id)) continue;
      gesehen.add(akkord.id);
      ergebnis.push(akkord);
    }
  }

  return ergebnis;
}

/**
 * Dieselben Akkorde, nach Paketen gruppiert — so wie die Auswahl sie zeigt.
 * Leere Gruppen fallen weg.
 */
export function akkordeNachPaket(
  niveau: Niveau,
): Array<{ paket: string; titel: string; akkorde: Akkord[] }> {
  const erlaubt = new Set(erlaubteAkkorde(niveau).map((a) => a.id));
  const gesehen = new Set<string>();
  const gruppen: Array<{ paket: string; titel: string; akkorde: Akkord[] }> = [];

  for (const paket of AKKORD_PAKETE) {
    const akkorde = akkordeImPaket(paket).filter((a) => {
      if (!erlaubt.has(a.id) || gesehen.has(a.id)) return false;
      gesehen.add(a.id);
      return true;
    });
    if (akkorde.length > 0) {
      gruppen.push({ paket: paket.id, titel: paket.titel, akkorde });
    }
  }

  return gruppen;
}

// --- Lernziele --------------------------------------------------------------

export interface Lernziel {
  /** Stabile Kennung, auch fuer den Speicher: "noten:mitte", "akkord:Am". */
  id: string;
  art: "noten" | "akkord";
  titel: string;
  hinweis: string;
}

export function notenZiel(paketId: string): string {
  return `noten:${paketId}`;
}

export function akkordZiel(akkordId: string): string {
  return `akkord:${akkordId}`;
}

/**
 * Was dieses Niveau ausmacht — nur das Eigene, nicht das der Stufen darunter.
 * Sonst haette Profi eine Liste, in der das Anfaengerpensum nochmal steht.
 */
export function lernziele(niveau: Niveau): Lernziel[] {
  const stufe = STUFEN[niveau];
  const ziele: Lernziel[] = [];

  for (const id of stufe.notenPakete) {
    const paket = PAKET_NACH_ID.get(id);
    if (!paket) continue;
    ziele.push({
      id: notenZiel(paket.id),
      art: "noten",
      titel: paket.titel,
      hinweis: paket.hinweis,
    });
  }

  // Nur die Akkorde, die es auf den Stufen darunter noch nicht gab.
  const vorher = new Set(
    bisEinschliesslich(niveau)
      .filter((s) => s.id !== niveau)
      .flatMap((s) => erlaubteAkkorde(s.id).map((a) => a.id)),
  );

  for (const akkord of erlaubteAkkorde(niveau)) {
    if (vorher.has(akkord.id)) continue;
    ziele.push({
      id: akkordZiel(akkord.id),
      art: "akkord",
      titel: akkord.symbol,
      hinweis: `${akkord.typ.bezeichnung} auf ${name(akkord.grundton)}`,
    });
  }

  return ziele;
}

/** Wie weit ist dieses Niveau durchgearbeitet? */
export function fortschritt(
  niveau: Niveau,
  beherrscht: readonly string[],
): { geschafft: number; gesamt: number; vollstaendig: boolean } {
  const ziele = lernziele(niveau);
  const menge = new Set(beherrscht);
  const geschafft = ziele.filter((z) => menge.has(z.id)).length;
  return {
    geschafft,
    gesamt: ziele.length,
    vollstaendig: ziele.length > 0 && geschafft === ziele.length,
  };
}
