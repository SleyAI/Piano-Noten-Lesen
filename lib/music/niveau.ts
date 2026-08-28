/**
 * Anfaenger, Fortgeschritten, Profi — der Uebungsplan.
 *
 * Die Niveaus sperren nichts mehr. Frueher bekam ein Anfaenger die Akkorde
 * der oberen Stufen gar nicht zu sehen; das half niemandem, der wissen
 * wollte, was noch kommt. Jetzt steht alles da, nur eben eingeteilt: was
 * gehoert zum Anfang, was kommt danach, was ist der Rest. Abgehakt wird
 * selbst, und das schaltet weiterhin nichts frei — es ist eine Merkliste.
 */

import {
  type Akkord,
  AKKORD_PAKETE,
  akkordeAusPaketen,
  akkordeImPaket,
} from "./akkorde";
import type { Tastenwahl } from "./curriculum";
import { name } from "./pitch";

export type Niveau = "anfaenger" | "fortgeschritten" | "profi";

/** Von leicht nach schwer. */
export const NIVEAU_REIHE: Niveau[] = ["anfaenger", "fortgeschritten", "profi"];

/** Was ein Niveau an Noten mitbringt — oder nichts, wenn es nur Akkorde sind. */
interface NotenZiel {
  id: string;
  tasten: Tastenwahl;
  titel: string;
  hinweis: string;
}

interface NiveauStufe {
  id: Niveau;
  titel: string;
  hinweis: string;
  /** Die Notenziele, die dieses Niveau ausmachen. */
  noten: NotenZiel[];
  /** Was dieses Niveau an Akkordpaketen hinzufuegt. */
  akkordPakete: string[];
  /**
   * Nur Akkorde ohne Vorzeichen. Greift innerhalb der genannten Pakete und
   * ist der Grund, warum D-Dur erst beim Fortgeschrittenen steht: es braucht
   * ein Fis, und dafuer muss die Hand auf eine schwarze Taste.
   */
  nurWeisseTasten: boolean;
}

const STUFEN: Record<Niveau, NiveauStufe> = {
  anfaenger: {
    id: "anfaenger",
    titel: "Anfänger",
    hinweis:
      "Nur weiße Tasten. Die Stammtöne über beide Systeme und die sechs Akkorde, die ohne ein einziges Vorzeichen auskommen.",
    noten: [
      {
        id: "weiss",
        tasten: "weiss",
        titel: "Die weißen Tasten",
        hinweis:
          "Alle Stammtöne von C2 bis C6 — im Bassschlüssel wie im Violinschlüssel, mit dem mittleren C als gemeinsamem Anker.",
      },
    ],
    akkordPakete: ["dreiklaenge-erste"],
    nurWeisseTasten: true,
  },
  fortgeschritten: {
    id: "fortgeschritten",
    titel: "Fortgeschritten",
    hinweis:
      "Die schwarzen Tasten kommen dazu — mit ihnen alle zwölf Dur- und Molldreiklänge und die Dominantseptakkorde.",
    noten: [
      {
        id: "schwarz",
        tasten: "alle",
        titel: "Die schwarzen Tasten",
        hinweis:
          "Kreuze und Be, jede schwarze Taste in beiden Schreibweisen — Fis und Ges klingen gleich und stehen doch auf verschiedenen Linien.",
      },
    ],
    akkordPakete: ["dur-moll-komplett", "dominantsept"],
    nurWeisseTasten: false,
  },
  profi: {
    id: "profi",
    titel: "Profi",
    hinweis:
      "Alles Übrige: Sus- und Add-Akkorde, große und kleine Septakkorde, verminderte und übermäßige Griffe, Optionstöne.",
    noten: [],
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

/** Dieses Niveau und alle darunter. */
function bisEinschliesslich(niveau: Niveau): NiveauStufe[] {
  const grenze = NIVEAU_REIHE.indexOf(niveau);
  return NIVEAU_REIHE.slice(0, grenze + 1).map((id) => STUFEN[id]);
}

// --- Akkorde, nach Niveaus eingeteilt ---------------------------------------

/** Ein Akkord ohne jedes Vorzeichen — also rein auf weissen Tasten greifbar. */
export function nurWeisseTasten(akkord: Akkord): boolean {
  return akkord.toene.every((t) => t.alteration === 0);
}

/** Alle Akkorde bis zu diesem Niveau, ohne Doppelte. */
export function akkordeBis(niveau: Niveau): Akkord[] {
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

/** Was auf diesem Niveau neu dazukommt. */
export function akkordeVon(niveau: Niveau): Akkord[] {
  const vorher = new Set(
    bisEinschliesslich(niveau)
      .filter((s) => s.id !== niveau)
      .flatMap((s) => akkordeBis(s.id).map((a) => a.id)),
  );
  return akkordeBis(niveau).filter((a) => !vorher.has(a.id));
}

/** Der ganze Vorrat — jeder Akkord genau einmal, in Plan-Reihenfolge. */
export function alleAkkorde(): Akkord[] {
  return akkordeBis("profi");
}

export interface AkkordPaketGruppe {
  paket: string;
  titel: string;
  akkorde: Akkord[];
}

export interface AkkordNiveauGruppe {
  niveau: Niveau;
  titel: string;
  hinweis: string;
  pakete: AkkordPaketGruppe[];
}

/**
 * Alle Akkorde, nach Niveau und darin nach Paket gruppiert — so wie die
 * Auswahl und der Uebungsplan sie zeigen. Jeder Akkord steht genau einmal,
 * naemlich auf dem Niveau, auf dem er zum ersten Mal vorkommt.
 */
export function akkordeNachNiveau(): AkkordNiveauGruppe[] {
  const gruppen: AkkordNiveauGruppe[] = [];

  for (const niveau of NIVEAU_REIHE) {
    const neu = new Set(akkordeVon(niveau).map((a) => a.id));
    const gesehen = new Set<string>();
    const pakete: AkkordPaketGruppe[] = [];

    for (const paket of AKKORD_PAKETE) {
      const akkorde = akkordeImPaket(paket).filter((a) => {
        if (!neu.has(a.id) || gesehen.has(a.id)) return false;
        gesehen.add(a.id);
        return true;
      });
      if (akkorde.length > 0) {
        pakete.push({ paket: paket.id, titel: paket.titel, akkorde });
      }
    }

    gruppen.push({
      niveau,
      titel: STUFEN[niveau].titel,
      hinweis: STUFEN[niveau].hinweis,
      pakete,
    });
  }

  return gruppen;
}

// --- Lernziele --------------------------------------------------------------

export interface Lernziel {
  /** Stabile Kennung, auch fuer den Speicher: "noten:weiss", "akkord:Am". */
  id: string;
  art: "noten" | "akkord";
  titel: string;
  hinweis: string;
}

export function notenZiel(id: string): string {
  return `noten:${id}`;
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

  const noten: Lernziel[] = stufe.noten.map((ziel) => ({
    id: notenZiel(ziel.id),
    art: "noten",
    titel: ziel.titel,
    hinweis: ziel.hinweis,
  }));

  const akkorde: Lernziel[] = akkordeVon(niveau).map((akkord) => ({
    id: akkordZiel(akkord.id),
    art: "akkord",
    titel: akkord.symbol,
    hinweis: `${akkord.typ.bezeichnung} auf ${name(akkord.grundton)}`,
  }));

  return [...noten, ...akkorde];
}

export interface Stand {
  geschafft: number;
  gesamt: number;
  vollstaendig: boolean;
}

/** Wie weit ist dieses Niveau durchgearbeitet? */
export function fortschritt(niveau: Niveau, beherrscht: readonly string[]): Stand {
  const ziele = lernziele(niveau);
  const menge = new Set(beherrscht);
  const geschafft = ziele.filter((z) => menge.has(z.id)).length;
  return {
    geschafft,
    gesamt: ziele.length,
    vollstaendig: ziele.length > 0 && geschafft === ziele.length,
  };
}

/** Derselbe Stand ueber alle drei Niveaus zusammen. */
export function gesamtFortschritt(beherrscht: readonly string[]): Stand {
  const summe = NIVEAU_REIHE.map((n) => fortschritt(n, beherrscht)).reduce(
    (a, b) => ({ geschafft: a.geschafft + b.geschafft, gesamt: a.gesamt + b.gesamt }),
    { geschafft: 0, gesamt: 0 },
  );
  return { ...summe, vollstaendig: summe.gesamt > 0 && summe.geschafft === summe.gesamt };
}
