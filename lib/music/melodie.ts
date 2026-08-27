/**
 * Melodien wuerfeln.
 *
 * Zufall allein ergibt Tonsalat. Drei Regeln machen daraus etwas, das sich
 * spielen laesst:
 *  - Schritte vor Spruengen, denn benachbarte Noten liest man als Bewegung
 *  - Anfang und Ende moeglichst auf einem Landmark, das gibt Halt
 *  - keine direkte Tonwiederholung, sonst tippt man nur nach
 *
 * Gebaut wird ausschliesslich aus den freigeschalteten Noten — die Melodie
 * kann also nie ueber das hinausgehen, was schon geuebt wurde.
 */

import { type UebungsNote, istLandmark, uebungsSchluessel } from "./curriculum";
import { gewichteteWahl } from "@/lib/practice/auswahl";

/** Jede Melodie ist gleich lang — acht Toene fuellen das System sauber aus. */
export const MELODIE_LAENGE = 8;

/** Wie stark ein Schritt gegenueber einem Sprung bevorzugt wird. */
function naeheGewicht(abstand: number): number {
  if (abstand === 0) return 0.01; // Tonwiederholung fast ausgeschlossen
  if (abstand <= 2) return 6; // Sekunde und Terz
  if (abstand <= 4) return 2; // Quarte und Quinte
  return 0.5; // grosse Spruenge bleiben die Ausnahme
}

/**
 * Waehlt ein System fuer die Melodie. Innerhalb eines Systems zu bleiben ist
 * fuer Anfaenger deutlich leichter zu lesen; erst wenn dort zu wenig Noten
 * liegen, wird gemischt.
 */
function waehleVorrat(vorrat: readonly UebungsNote[]): UebungsNote[] {
  const proSystem = {
    violin: vorrat.filter((u) => u.schluessel === "violin"),
    bass: vorrat.filter((u) => u.schluessel === "bass"),
  };
  const brauchbar = [proSystem.violin, proSystem.bass].filter((l) => l.length >= 3);
  if (brauchbar.length === 0) return [...vorrat];
  return brauchbar[Math.floor(Math.random() * brauchbar.length)];
}

export interface MelodieOptionen {
  laenge?: number;
}

/**
 * Baut eine Melodie aus dem uebergebenen Vorrat.
 * Liefert eine leere Liste, wenn nichts zur Verfuegung steht.
 */
export function wuerfleMelodie(
  vorrat: readonly UebungsNote[],
  optionen: MelodieOptionen = {},
): UebungsNote[] {
  if (vorrat.length === 0) return [];

  const menge = waehleVorrat(vorrat);
  const laenge = optionen.laenge ?? MELODIE_LAENGE;

  const landmarks = menge.filter(istLandmark);
  const start =
    gewichteteWahl(landmarks.length > 0 ? landmarks : menge, () => 1) ?? menge[0];

  const melodie: UebungsNote[] = [start];

  for (let i = 1; i < laenge; i += 1) {
    const vorherige = melodie[i - 1];
    const letzterSchritt = i === laenge - 1;

    const naechste = gewichteteWahl(menge, (kandidat) => {
      const abstand = Math.abs(kandidat.note.diatonic - vorherige.note.diatonic);
      let gewicht = naeheGewicht(abstand);
      // Zum Schluss zieht es zu einem Landmark hin.
      if (letzterSchritt && istLandmark(kandidat)) gewicht *= 4;
      return gewicht;
    });

    if (!naechste) break;
    melodie.push(naechste);
  }

  return melodie;
}

/** Eindeutige Kennung einer Melodie — als React-Key und zum Vergleichen. */
export function melodieSchluessel(melodie: readonly UebungsNote[]): string {
  return melodie.map(uebungsSchluessel).join("|");
}
