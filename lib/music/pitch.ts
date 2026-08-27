/**
 * Tonhoehen in deutscher Nomenklatur.
 *
 * Zwei Zahlen beschreiben eine Note vollstaendig:
 *  - `midi`     bestimmt den Klang (C4 = 60, mittleres C)
 *  - `diatonic` bestimmt die Position auf den Notenlinien (Oktave * 7 + Stufe)
 *
 * Beide werden getrennt gefuehrt, weil Fis und Ges gleich klingen, aber auf
 * verschiedenen Linien sitzen.
 */

export type Stufe = "C" | "D" | "E" | "F" | "G" | "A" | "H";
export type Alteration = -1 | 0 | 1;
export type Schluessel = "violin" | "bass";

export interface Note {
  /** MIDI-Notennummer, C4 = 60. */
  midi: number;
  /** Stammton ohne Vorzeichen. */
  stufe: Stufe;
  /** -1 = erniedrigt, 0 = Stammton, +1 = erhoeht. */
  alteration: Alteration;
  /** Oktavlage nach wissenschaftlicher Zaehlung, mittleres C = C4. */
  oktave: number;
  /** Diatonischer Index: oktave * 7 + Stufenindex. Basis der Notenposition. */
  diatonic: number;
}

const STUFEN: Stufe[] = ["C", "D", "E", "F", "G", "A", "H"];

/** Halbtonabstand jedes Stammtons ueber dem C derselben Oktave. */
const HALBTON_DER_STUFE: Record<Stufe, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  H: 11,
};

/** Bevorzugte Schreibweise der schwarzen Tasten. */
const KREUZ_SCHREIBWEISE: Array<[Stufe, Alteration]> = [
  ["C", 0], ["C", 1], ["D", 0], ["D", 1], ["E", 0], ["F", 0],
  ["F", 1], ["G", 0], ["G", 1], ["A", 0], ["A", 1], ["H", 0],
];

const B_SCHREIBWEISE: Array<[Stufe, Alteration]> = [
  ["C", 0], ["D", -1], ["D", 0], ["E", -1], ["E", 0], ["F", 0],
  ["G", -1], ["G", 0], ["A", -1], ["A", 0], ["H", -1], ["H", 0],
];

export function stufenIndex(stufe: Stufe): number {
  return STUFEN.indexOf(stufe);
}

export function diatonicIndex(stufe: Stufe, oktave: number): number {
  return oktave * 7 + stufenIndex(stufe);
}

/** Baut eine Note aus ihren Bestandteilen und rechnet midi/diatonic aus. */
export function note(stufe: Stufe, alteration: Alteration, oktave: number): Note {
  return {
    midi: (oktave + 1) * 12 + HALBTON_DER_STUFE[stufe] + alteration,
    stufe,
    alteration,
    oktave,
    diatonic: diatonicIndex(stufe, oktave),
  };
}

/**
 * MIDI-Nummer zu einer Note. Schwarze Tasten brauchen eine Entscheidung —
 * `schreibweise` legt fest, ob Fis oder Ges herauskommt.
 */
export function vonMidi(midi: number, schreibweise: "kreuz" | "b" = "kreuz"): Note {
  const tabelle = schreibweise === "kreuz" ? KREUZ_SCHREIBWEISE : B_SCHREIBWEISE;
  const oktave = Math.floor(midi / 12) - 1;
  const [stufe, alteration] = tabelle[((midi % 12) + 12) % 12];

  // Ces und His verschieben die Oktave gegenueber der reinen MIDI-Rechnung.
  const roh = (oktave + 1) * 12 + HALBTON_DER_STUFE[stufe] + alteration;
  const korrektur = Math.round((midi - roh) / 12);

  return note(stufe, alteration, oktave + korrektur);
}

/** Anzeigename ohne Oktave: "C", "Fis", "Es", "B". */
export function name(n: Note): string {
  if (n.stufe === "H" && n.alteration === -1) return "B";
  if (n.alteration === 1) return `${n.stufe}is`;
  if (n.alteration === -1) return n.stufe === "E" || n.stufe === "A" ? `${n.stufe}s` : `${n.stufe}es`;
  return n.stufe;
}

/** Anzeigename mit Oktave: "C4", "Fis3". */
export function nameMitOktave(n: Note): string {
  return `${name(n)}${n.oktave}`;
}

/** Stabiler Schluessel fuer Fortschritts- und Fehlerstatistik. */
export function notenSchluessel(n: Note): string {
  return `${n.diatonic}:${n.alteration}`;
}

const PARSE_MUSTER = /^([CDEFGABH])(is|es|s)?(-?\d+)$/;

/**
 * Liest "C4", "Fis3", "Es2", "B3". Erlaubt kompakte Notenlisten im Curriculum,
 * statt jede Note als Objektliteral zu schreiben.
 */
export function n(text: string): Note {
  const treffer = PARSE_MUSTER.exec(text);
  if (!treffer) throw new Error(`Unbekannter Notenname: ${text}`);

  const [, buchstabe, vorzeichen, oktaveText] = treffer;
  const oktave = Number(oktaveText);
  let stufe = buchstabe as Stufe;
  let alteration: Alteration = 0;

  if (buchstabe === "B" && !vorzeichen) {
    // "B" allein meint im Deutschen das erniedrigte H.
    stufe = "H";
    alteration = -1;
  } else if (vorzeichen === "is") {
    alteration = 1;
  } else if (vorzeichen === "es") {
    alteration = -1;
  } else if (vorzeichen === "s") {
    if (buchstabe !== "E" && buchstabe !== "A") {
      throw new Error(`Unbekannter Notenname: ${text}`);
    }
    alteration = -1;
  }

  return note(stufe, alteration, oktave);
}

/**
 * Baut eine Note aus ihrer Position im System und ihrem Klang.
 *
 * Genau die Kombination, die beim Aufbau von Akkorden anfaellt: die Terz
 * liegt zwei diatonische Stufen ueber dem Grundton und vier Halbtoene
 * darueber — daraus ergibt sich das Vorzeichen von selbst.
 *
 * Liefert `null`, wenn dafuer ein Doppelvorzeichen noetig waere. Solche
 * Schreibweisen kommen in dieser App nicht vor.
 */
export function ausDiatonicUndMidi(diatonic: number, midi: number): Note | null {
  const oktave = Math.floor(diatonic / 7);
  const stufe = STUFEN[((diatonic % 7) + 7) % 7];
  const natur = (oktave + 1) * 12 + HALBTON_DER_STUFE[stufe];
  const alteration = midi - natur;
  if (alteration < -1 || alteration > 1) return null;
  return { midi, stufe, alteration: alteration as Alteration, oktave, diatonic };
}

/** Kurzform fuer ganze Listen: `noten("C4 D4 E4")`. */
export function noten(text: string): Note[] {
  return text.trim().split(/\s+/).map(n);
}

// --- Position auf den Notenlinien -------------------------------------------

/** Unterste Linie: Violinschluessel E4, Bassschluessel G2. */
const REFERENZ: Record<Schluessel, number> = {
  violin: diatonicIndex("E", 4),
  bass: diatonicIndex("G", 2),
};

/**
 * Vertikale Position in halben Zeilenabstaenden ueber der untersten Linie.
 * 0 = unterste Linie, 1 = erster Zwischenraum, 8 = oberste Linie.
 * Negative Werte liegen unter dem System, Werte ueber 8 darueber.
 */
export function linienPosition(n: Note, schluessel: Schluessel): number {
  return n.diatonic - REFERENZ[schluessel];
}

/**
 * Hilfslinien, die diese Note braucht — als Positionen im selben Massstab.
 * Beispiel: C4 im Violinschluessel liefert [-2], C4 im Bassschluessel [10].
 */
export function hilfslinien(position: number): number[] {
  const linien: number[] = [];
  if (position <= -2) {
    for (let p = -2; p >= position; p -= 2) linien.push(p);
  } else if (position >= 10) {
    for (let p = 10; p <= position; p += 2) linien.push(p);
  }
  return linien;
}

/**
 * Welches System zeigt diese Note mit den wenigsten Hilfslinien?
 * Bei Gleichstand (genau C4) gewinnt der Violinschluessel.
 */
export function passenderSchluessel(n: Note): Schluessel {
  const violin = hilfslinien(linienPosition(n, "violin")).length;
  const bass = hilfslinien(linienPosition(n, "bass")).length;
  return bass < violin ? "bass" : "violin";
}

/**
 * Welches System zeigt eine ganze Gruppe von Noten am ruhigsten?
 *
 * Ein Akkord wird nicht auf beide Systeme verteilt, sondern komplett in eines
 * gesetzt — er wird ja auch mit einer Hand gegriffen. Gewaehlt wird das System
 * mit den wenigsten Hilfslinien insgesamt.
 */
export function passenderSchluesselFuer(gruppe: readonly Note[]): Schluessel {
  const zaehle = (schluessel: Schluessel) =>
    gruppe.reduce((summe, x) => summe + hilfslinien(linienPosition(x, schluessel)).length, 0);
  return zaehle("bass") < zaehle("violin") ? "bass" : "violin";
}

/** Liegt die Note im darstellbaren Bereich dieses Systems? */
export function darstellbar(n: Note, schluessel: Schluessel, maxHilfslinien = 4): boolean {
  return hilfslinien(linienPosition(n, schluessel)).length <= maxHilfslinien;
}
