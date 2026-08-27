/**
 * Geometrie des Doppelsystems.
 *
 * Jedes System hat sein eigenes Koordinatensystem, gerechnet in halben
 * Zeilenabstaenden ueber seiner untersten Linie. Dazwischen liegt ein fester
 * Zwischenraum von einer Systemhoehe.
 *
 * Das mittlere C erscheint dadurch zweimal an verschiedenen Stellen: einmal
 * auf einer Hilfslinie unter dem Violinsystem und einmal auf einer Hilfslinie
 * ueber dem Basssystem. Genau so steht es im Notensatz — und genau das sind
 * die zwei Lesevorgaenge, die die Landmark-Methode trainiert.
 */

import { type Note, type Schluessel, hilfslinien, linienPosition } from "@/lib/music/pitch";

/** Ein Halbschritt (halber Zeilenabstand) in SVG-Einheiten. */
export const HALBSCHRITT = 10;
/** Abstand zweier Notenlinien. */
export const ZEILENABSTAND = HALBSCHRITT * 2;

/** Hoehe eines einzelnen Systems (vier Zeilenabstaende). */
const SYSTEM_INNEN = 8 * HALBSCHRITT;
/** Luft ueber dem oberen und unter dem unteren System.
 *  Drei Hilfslinien weit plus ein halber Notenkopf, damit die aeusserste Note
 *  nicht an der Zeichenkante klebt. */
const RAND = 7 * HALBSCHRITT;
/** Zwischenraum der beiden Systeme. Eine Systemhoehe gibt beiden mittleren C
 *  ihre eigene Hilfslinie mit sichtbarem Abstand dazwischen. */
const ZWISCHENRAUM = 8 * HALBSCHRITT;

/** y der obersten Linie je System. */
const OBERSTE_LINIE: Record<Schluessel, number> = {
  violin: RAND,
  bass: RAND + SYSTEM_INNEN + ZWISCHENRAUM,
};

export const SYSTEM_HOEHE = RAND * 2 + SYSTEM_INNEN * 2 + ZWISCHENRAUM;

/** Linker Rand bis zum Ende der Schluessel. */
export const NOTEN_START = ZEILENABSTAND * 5;
/** Abstand zwischen zwei Notenspalten. */
export const SPALTEN_ABSTAND = ZEILENABSTAND * 3.4;
/** Rechter Rand hinter der letzten Spalte. */
export const NOTEN_ENDE = ZEILENABSTAND * 2;
/** So viele Spalten breit ist das System mindestens — eine einzelne Note soll
 *  nicht auf einem schmalen Streifen sitzen. */
export const MIN_SPALTEN = 4;

/** Notenkopf. */
export const KOPF_BREITE = ZEILENABSTAND * 1.18;
export const KOPF_HOEHE = ZEILENABSTAND * 0.98;

/**
 * y-Koordinate einer Position im angegebenen System.
 * 0 = unterste Linie, 8 = oberste Linie, negative Werte liegen darunter.
 */
export function yVonPosition(position: number, schluessel: Schluessel): number {
  return OBERSTE_LINIE[schluessel] + (8 - position) * HALBSCHRITT;
}

/** y-Koordinate einer Note im angegebenen System. */
export function yVonNote(note: Note, schluessel: Schluessel): number {
  return yVonPosition(linienPosition(note, schluessel), schluessel);
}

/** Die fuenf Linien eines Systems, von unten nach oben. */
export function systemLinien(schluessel: Schluessel): number[] {
  return [0, 2, 4, 6, 8].map((p) => yVonPosition(p, schluessel));
}

/** y-Koordinaten der Hilfslinien, die diese Note braucht. */
export function hilfslinienY(note: Note, schluessel: Schluessel): number[] {
  return hilfslinien(linienPosition(note, schluessel)).map((p) => yVonPosition(p, schluessel));
}

/** Bezugslinie, auf der der Schluessel sitzt: G4 (Position 2) bzw. F3 (Position 6). */
export function schluesselAnkerY(schluessel: Schluessel): number {
  return yVonPosition(schluessel === "violin" ? 2 : 6, schluessel);
}

/** Ober- und Unterkante der Systemklammer. */
export function klammerOben(): number {
  return yVonPosition(8, "violin");
}

export function klammerUnten(): number {
  return yVonPosition(0, "bass");
}

/** Breite des Notenbereichs rechts der Schluessel. */
function inhaltsBreite(spalten: number): number {
  return Math.max(spalten, MIN_SPALTEN) * SPALTEN_ABSTAND;
}

/** x-Mitte einer Notenspalte. Wenige Noten werden mittig gesetzt. */
export function xVonSpalte(index: number, anzahl: number): number {
  const luft = (inhaltsBreite(anzahl) - anzahl * SPALTEN_ABSTAND) / 2;
  return NOTEN_START + luft + index * SPALTEN_ABSTAND + SPALTEN_ABSTAND / 2;
}

/** Gesamtbreite fuer eine gegebene Anzahl Spalten. */
export function systemBreite(spalten: number): number {
  return NOTEN_START + inhaltsBreite(spalten) + NOTEN_ENDE;
}

/**
 * Sekundabstaende muessen versetzt gezeichnet werden, sonst ueberlappen sich
 * die Koepfe. Liefert je Note einen x-Versatz in Kopfbreiten (0 oder 1).
 *
 * Erwartet die Noten einer Spalte innerhalb eines Systems, aufsteigend sortiert.
 */
export function kopfVersatz(diatonics: readonly number[]): number[] {
  const versatz: number[] = [];
  for (let i = 0; i < diatonics.length; i += 1) {
    const vorher = i > 0 ? versatz[i - 1] : 0;
    // Nur direkte Nachbarn kollidieren; alles ab einer Terz passt nebeneinander.
    const kollision = i > 0 && diatonics[i] - diatonics[i - 1] === 1;
    versatz.push(kollision && vorher === 0 ? 1 : 0);
  }
  return versatz;
}

/**
 * Laesst sich diese Note in diesem System vollstaendig zeichnen?
 *
 * Gebraucht fuer die Anzeige einer falsch gespielten Note: wer versehentlich
 * ans andere Ende der Tastatur greift, soll kein abgeschnittenes Notenbild
 * sehen — dann steht der Name im Hinweis und sonst nichts.
 */
export function passtInsBild(note: Note, schluessel: Schluessel): boolean {
  const y = yVonNote(note, schluessel);
  const halberKopf = KOPF_HOEHE / 2;
  return y - halberKopf > 0 && y + halberKopf < SYSTEM_HOEHE;
}

/** Grenzen des Zeichenbereichs — fuer das viewBox-Attribut. */
export function viewBox(spalten: number): string {
  return `0 0 ${systemBreite(spalten)} ${SYSTEM_HOEHE}`;
}
