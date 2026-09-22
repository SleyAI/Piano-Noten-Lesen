/**
 * Melodien und Zufalls-Tonfolgen wuerfeln.
 *
 * Im Modus "zufall":
 *  - Echte, unvorhersehbare Sprünge über das Notensystem statt simpler Tonleiterstufen.
 *  - Keine direkten Tonwiederholungen (A != B).
 *  - Kein ständiges Hin- und Herspringen (kein A -> B -> A Ping-Pong).
 *  - Keine Wiederholung desselben Sprungintervalls hintereinander.
 *  - Gleichmäßige Ausnutzung des gesamten Notenumfangs.
 *
 * Im Modus "melodisch":
 *  - Wirklich zueinander passende, harmonische Noten im Stil klassischer Melodien.
 *  - Tonaler Halt (Anfang und Kadenz-Auflösung auf Grundton / Landmark).
 *  - Sangliche Schritte (Sekunden und Terzen) dominieren, konsonante Dreiklangssprünge.
 *  - Keine Tritonus- oder Dissonanz-Sprünge.
 *  - Natürliche Phrasenbildung (Vordersatz und Nachsatz).
 */

import { type UebungsNote, istLandmark, uebungsSchluessel } from "./curriculum";
import { type Schluessel, nameMitOktave } from "./pitch";
import { gewichteteWahl } from "@/lib/practice/auswahl";

/** Jede Melodie ist standardmäßig gleich lang — acht Töne füllen das System sauber aus. */
export const MELODIE_LAENGE = 8;

/** Wie oft die Melodie das System wechselt, wenn beide geuebt werden. */
const HANDWECHSEL = 0.35;

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

/** Aus welchem Vorrat kommt der naechste Ton bei prozeduraler Generierung? */
function naechsteMenge(
  menge: readonly UebungsNote[],
  vorherige: UebungsNote,
  mischen: boolean,
): readonly UebungsNote[] {
  if (!mischen) return menge;
  const gleiches = menge.filter((u) => u.schluessel === vorherige.schluessel);
  const anderes = menge.filter((u) => u.schluessel !== vorherige.schluessel);
  if (gleiches.length === 0 || anderes.length === 0) return menge;
  return Math.random() < HANDWECHSEL ? anderes : gleiches;
}

export interface MelodieOptionen {
  laenge?: number;
  /**
   * Beide Systeme in derselben Tonfolge mischen. Ohne das bleibt eine
   * Melodie in einem System — leichter zu lesen, aber eben nur eine Hand.
   */
  mischen?: boolean;
}

/* =========================================================================
   1. Melodische Vorlagen (Harmonisch & Sanglich aufeinander abgestimmt)
   ========================================================================= */

const MELODIE_VORLAGEN_VIOLIN: string[][] = [
  // 1. Dreiklangsbogen & Kadenz
  ["C4", "E4", "G4", "E4", "F4", "D4", "E4", "C4"],
  // 2. Skalenbogen aufwärts & Abstieg
  ["C4", "D4", "E4", "G4", "F4", "E4", "D4", "C4"],
  // 3. Frage auf G, Antwort auf C
  ["C4", "E4", "D4", "F4", "E4", "G4", "D4", "C4"],
  // 4. Cantabile / Wiegenlied-Motiv
  ["G4", "E4", "F4", "D4", "E4", "C4", "D4", "C4"],
  // 5. Volkslied-Thema
  ["G4", "A4", "G4", "E4", "F4", "D4", "E4", "C4"],
  // 6. Terzenspiel mit Auflösung
  ["C4", "E4", "D4", "F4", "G4", "E4", "D4", "C4"],
  // 7. Sanfter Abstieg von C5
  ["C5", "H4", "A4", "G4", "F4", "E4", "D4", "C4"],
  // 8. Tonaler Wechsel
  ["C4", "G4", "E4", "F4", "G4", "E4", "D4", "C4"],
  // 9. Fanfaren-Kadenz
  ["G4", "E4", "C4", "D4", "E4", "F4", "D4", "C4"],
  // 10. Aufschwung & Heimkehr
  ["C4", "D4", "E4", "C4", "G4", "F4", "D4", "C4"],
  // 11. Glocken-Motiv
  ["G4", "C5", "H4", "A4", "G4", "E4", "D4", "C4"],
  // 12. Harmonische Wellenbewegung
  ["C4", "E4", "G4", "C5", "G4", "E4", "D4", "C4"],
];

const MELODIE_VORLAGEN_LANDMARKS_VIOLIN: string[][] = [
  ["C4", "G4", "C5", "G4", "C4", "G4", "C5", "C4"],
  ["C4", "G4", "C4", "G4", "C5", "G4", "C5", "C4"],
  ["G4", "C4", "G4", "C5", "G4", "C4", "G4", "C4"],
  ["C5", "G4", "C4", "G4", "C5", "G4", "C5", "C4"],
  ["C4", "G4", "C5", "G4", "C4", "C5", "G4", "C4"],
];

const MELODIE_VORLAGEN_BASS: string[][] = [
  ["C3", "E3", "G3", "E3", "F3", "D3", "E3", "C3"],
  ["C3", "D3", "E3", "G3", "F3", "E3", "D3", "C3"],
  ["C3", "E3", "D3", "F3", "E3", "G3", "D3", "C3"],
  ["C4", "H3", "A3", "G3", "F3", "E3", "D3", "C3"],
  ["C3", "G3", "E3", "F3", "G3", "E3", "D3", "C3"],
  ["C3", "D3", "E3", "C3", "F3", "D3", "G3", "C3"],
  ["C4", "G3", "A3", "F3", "G3", "E3", "D3", "C3"],
  ["C3", "F3", "G3", "E3", "F3", "D3", "E3", "C3"],
];

const MELODIE_VORLAGEN_LANDMARKS_BASS: string[][] = [
  ["C3", "F3", "C4", "F3", "C3", "F3", "C4", "C3"],
  ["C3", "F3", "C3", "F3", "C4", "F3", "C4", "C3"],
  ["F3", "C3", "F3", "C4", "F3", "C3", "F3", "C3"],
  ["C4", "F3", "C3", "F3", "C4", "F3", "C4", "C3"],
];

const MELODIE_VORLAGEN_GEMISCHT: Array<Array<{ ton: string; schluessel: Schluessel }>> = [
  // 4 Noten Bass -> 4 Noten Diskant
  [
    { ton: "C3", schluessel: "bass" }, { ton: "E3", schluessel: "bass" }, { ton: "G3", schluessel: "bass" }, { ton: "C3", schluessel: "bass" },
    { ton: "E4", schluessel: "violin" }, { ton: "F4", schluessel: "violin" }, { ton: "D4", schluessel: "violin" }, { ton: "C4", schluessel: "violin" },
  ],
  [
    { ton: "C3", schluessel: "bass" }, { ton: "G3", schluessel: "bass" }, { ton: "E3", schluessel: "bass" }, { ton: "G3", schluessel: "bass" },
    { ton: "C4", schluessel: "violin" }, { ton: "D4", schluessel: "violin" }, { ton: "E4", schluessel: "violin" }, { ton: "C4", schluessel: "violin" },
  ],
  // 4 Noten Diskant -> 4 Noten Bass
  [
    { ton: "C4", schluessel: "violin" }, { ton: "E4", schluessel: "violin" }, { ton: "G4", schluessel: "violin" }, { ton: "E4", schluessel: "violin" },
    { ton: "F3", schluessel: "bass" }, { ton: "D3", schluessel: "bass" }, { ton: "G3", schluessel: "bass" }, { ton: "C3", schluessel: "bass" },
  ],
  [
    { ton: "G4", schluessel: "violin" }, { ton: "F4", schluessel: "violin" }, { ton: "E4", schluessel: "violin" }, { ton: "D4", schluessel: "violin" },
    { ton: "C3", schluessel: "bass" }, { ton: "E3", schluessel: "bass" }, { ton: "G3", schluessel: "bass" }, { ton: "C3", schluessel: "bass" },
  ],
  // Handwechsel im 2er-Takt
  [
    { ton: "C3", schluessel: "bass" }, { ton: "G3", schluessel: "bass" },
    { ton: "C4", schluessel: "violin" }, { ton: "E4", schluessel: "violin" },
    { ton: "G3", schluessel: "bass" }, { ton: "E3", schluessel: "bass" },
    { ton: "D4", schluessel: "violin" }, { ton: "C4", schluessel: "violin" },
  ],
  [
    { ton: "C3", schluessel: "bass" }, { ton: "E3", schluessel: "bass" },
    { ton: "G4", schluessel: "violin" }, { ton: "E4", schluessel: "violin" },
    { ton: "F3", schluessel: "bass" }, { ton: "D3", schluessel: "bass" },
    { ton: "E4", schluessel: "violin" }, { ton: "C4", schluessel: "violin" },
  ],
];

const MELODIE_VORLAGEN_LANDMARKS_GEMISCHT: Array<Array<{ ton: string; schluessel: Schluessel }>> = [
  [
    { ton: "C3", schluessel: "bass" }, { ton: "F3", schluessel: "bass" }, { ton: "C4", schluessel: "bass" }, { ton: "F3", schluessel: "bass" },
    { ton: "C4", schluessel: "violin" }, { ton: "G4", schluessel: "violin" }, { ton: "C5", schluessel: "violin" }, { ton: "C4", schluessel: "violin" },
  ],
  [
    { ton: "C4", schluessel: "violin" }, { ton: "G4", schluessel: "violin" }, { ton: "C5", schluessel: "violin" }, { ton: "G4", schluessel: "violin" },
    { ton: "F3", schluessel: "bass" }, { ton: "C3", schluessel: "bass" }, { ton: "F3", schluessel: "bass" }, { ton: "C3", schluessel: "bass" },
  ],
];

/**
 * Prozedurale Erzeugung harmonischer Melodielinien (Fallback, wenn keine Vorlage komplett passt
 * oder eine abweichende Länge gefordert ist).
 */
function erzeugeHarmonischeMelodie(
  menge: readonly UebungsNote[],
  laenge: number,
  mischen: boolean,
): UebungsNote[] {
  const landmarks = menge.filter(istLandmark);
  const startPool = landmarks.length > 0 ? landmarks : menge;
  const start = gewichteteWahl(startPool, () => 1) ?? menge[0];
  const melodie: UebungsNote[] = [start];

  for (let i = 1; i < laenge; i++) {
    const vorherige = melodie[i - 1];
    const vorVorherige = i >= 2 ? melodie[i - 2] : null;
    const letzterSchritt = i === laenge - 1;
    const pool = naechsteMenge(menge, vorherige, mischen);

    const naechste = gewichteteWahl(pool, (kandidat) => {
      // Keine direkte Tonwiederholung, wenn andere Noten existieren
      if (kandidat.note.midi === vorherige.note.midi) {
        return pool.some((u) => u.note.midi !== vorherige.note.midi) ? 0 : 1;
      }

      const midiAbstand = Math.abs(kandidat.note.midi - vorherige.note.midi);
      const diatonicAbstand = Math.abs(kandidat.note.diatonic - vorherige.note.diatonic);

      // Unharmonische Intervalle meiden: Tritonus (6 Halbtöne) und Septimen (10/11 Halbtöne)
      if (midiAbstand === 6 || midiAbstand === 10 || midiAbstand === 11) return 0.01;

      let score = 1;
      // Sangliche Schritte (Sekunden) und kleine Terzen dominieren eine Melodie
      if (diatonicAbstand === 1) score = 14;
      else if (diatonicAbstand === 2) score = 8;
      else if (diatonicAbstand <= 4) score = 2.5; // Konsonante Quarten & Quinten
      else score = 0.2; // Große Sprünge sind seltene Ausnahmen

      // Melodischer Kontur-Ausgleich: Nach einem größeren Sprung Gegenbewegung bevorzugen
      if (vorVorherige) {
        const sprungVorher = vorherige.note.midi - vorVorherige.note.midi;
        const sprungJetzt = kandidat.note.midi - vorherige.note.midi;
        if (Math.abs(sprungVorher) >= 5 && Math.sign(sprungJetzt) !== -Math.sign(sprungVorher)) {
          score *= 0.35;
        }
      }

      // Letzter Schritt: Schließt fast immer auf einem Ruhepol / Landmark (Grundton C) ab
      if (letzterSchritt && istLandmark(kandidat)) {
        score *= 25;
      }

      return score;
    });

    if (!naechste) break;
    melodie.push(naechste);
  }

  return melodie;
}

/**
 * Baut eine sangliche Melodie aus dem übergebenen Vorrat.
 * Die Noten passen harmonisch und melodisch zueinander und schließen sauber ab.
 */
export function wuerfleMelodie(
  vorrat: readonly UebungsNote[],
  optionen: MelodieOptionen = {},
): UebungsNote[] {
  if (vorrat.length === 0) return [];
  const laenge = optionen.laenge ?? MELODIE_LAENGE;
  if (vorrat.length === 1) {
    return Array.from({ length: laenge }, () => vorrat[0]);
  }

  const mischen = optionen.mischen ?? false;
  const menge = mischen ? [...vorrat] : waehleVorrat(vorrat);

  // Wenn Standardlänge 8 oder kleiner: prüfe passende Vorlagen
  if (laenge <= MELODIE_LAENGE) {
    if (mischen) {
      const alleVorlagen = [...MELODIE_VORLAGEN_GEMISCHT, ...MELODIE_VORLAGEN_LANDMARKS_GEMISCHT];
      const passende = alleVorlagen.filter((v) =>
        v.every((item) =>
          menge.some((u) => nameMitOktave(u.note) === item.ton && u.schluessel === item.schluessel),
        ),
      );

      if (passende.length > 0) {
        const gewaehlte = passende[Math.floor(Math.random() * passende.length)];
        const result: UebungsNote[] = [];
        for (let i = 0; i < laenge; i++) {
          const item = gewaehlte[i];
          const match = menge.find(
            (u) => nameMitOktave(u.note) === item.ton && u.schluessel === item.schluessel,
          );
          if (match) result.push(match);
        }
        if (result.length === laenge) return result;
      }
    } else {
      const schluessel = menge[0]?.schluessel ?? "violin";
      const vorlagenPool =
        schluessel === "violin"
          ? [...MELODIE_VORLAGEN_VIOLIN, ...MELODIE_VORLAGEN_LANDMARKS_VIOLIN]
          : [...MELODIE_VORLAGEN_BASS, ...MELODIE_VORLAGEN_LANDMARKS_BASS];

      const passende = vorlagenPool.filter((v) => {
        const verfuegbareNamen = new Set(menge.map((u) => nameMitOktave(u.note)));
        return v.every((sym) => verfuegbareNamen.has(sym));
      });

      if (passende.length > 0) {
        const gewaehlte = passende[Math.floor(Math.random() * passende.length)];
        const result: UebungsNote[] = [];
        for (let i = 0; i < laenge; i++) {
          const sym = gewaehlte[i];
          const match = menge.find((u) => nameMitOktave(u.note) === sym);
          if (match) result.push(match);
        }
        if (result.length === laenge) return result;
      }
    }
  }

  // Fallback: Prozedurale harmonische Erzeugung
  return erzeugeHarmonischeMelodie(menge, laenge, mischen);
}

/** Eindeutige Kennung einer Melodie — als React-Key und zum Vergleichen. */
export function melodieSchluessel(melodie: readonly UebungsNote[]): string {
  return melodie.map(uebungsSchluessel).join("|");
}

export type TonabfolgeModus = "zufall" | "melodisch";

/* =========================================================================
   2. Echte Zufalls-Noten (Springt über das Notensystem, kein Ping-Pong)
   ========================================================================= */

/**
 * Erzeugt 8 unvorhersehbare Zufallsnoten aus dem Vorrat.
 * - Echte Sprünge über das Notensystem statt stufenweiser Tonleitern.
 * - Keine direkten Tonwiederholungen (A != B).
 * - Kein ständiges Hin- und Herspringen (kein A -> B -> A Ping-Pong).
 * - Keine Wiederholung desselben Sprungintervalls hintereinander.
 * - Gleichmäßige Ausnutzung des gesamten Notenumfangs.
 */
export function wuerfleZufall(
  vorrat: readonly UebungsNote[],
  optionen: MelodieOptionen = {},
): UebungsNote[] {
  if (vorrat.length === 0) return [];
  const laenge = optionen.laenge ?? MELODIE_LAENGE;
  if (vorrat.length === 1) {
    return Array.from({ length: laenge }, () => vorrat[0]);
  }

  const mischen = optionen.mischen ?? false;
  const menge = mischen ? [...vorrat] : waehleVorrat(vorrat);
  const poolBasis = menge.length > 0 ? menge : [...vorrat];

  const reihe: UebungsNote[] = [];

  // Startnote zufällig wählen
  const start = poolBasis[Math.floor(Math.random() * poolBasis.length)];
  reihe.push(start);

  for (let i = 1; i < laenge; i++) {
    const vorher = reihe[i - 1];
    const vorVorher = i >= 2 ? reihe[i - 2] : null;
    const sprungDavor = vorVorher ? vorher.note.midi - vorVorher.note.midi : null;

    // Regel 1: Keine direkte Tonwiederholung
    let kandidaten = poolBasis.filter((u) => u.note.midi !== vorher.note.midi);

    // Regel 2: Kein A -> B -> A Ping-Pong (wenn mindestens 3 verschiedene Töne verfügbar sind)
    if (poolBasis.length >= 3 && vorVorher) {
      const ohnePingPong = kandidaten.filter((u) => u.note.midi !== vorVorher.note.midi);
      if (ohnePingPong.length > 0) {
        kandidaten = ohnePingPong;
      }
    }

    // Gewichtung für echten "Zufall / Sprung-Charakter":
    const gewichtet = gewichteteWahl(kandidaten, (kandidat) => {
      const midiAbstand = Math.abs(kandidat.note.midi - vorher.note.midi);
      const diatonischAbstand = Math.abs(kandidat.note.diatonic - vorher.note.diatonic);
      const sprungJetzt = kandidat.note.midi - vorher.note.midi;

      let score = 10;

      // Sprung-Präferenz: Echte Sprünge (Terzen, Quarten, Quinten, Oktaven) bevorzugen!
      if (diatonischAbstand >= 2 || midiAbstand >= 3) {
        score = 45;
      } else {
        // Einzelschritte (Sekunden) im Zufallsmodus stark drosseln, damit es nicht wie eine Tonleiter wirkt
        score = 4;
      }

      // Regel 3: Wiederholung des exakt gleichen Sprungvektors meiden (z. B. nicht zweimal Quinte aufwärts)
      if (sprungDavor !== null && sprungJetzt === sprungDavor) {
        score = Math.max(1, score * 0.15);
      }

      // Regel 4: Noten, die in den letzten 3 Schritten bereits gespielt wurden, zurückstellen
      const kuerzlich = reihe.slice(-3).some((u) => u.note.midi === kandidat.note.midi);
      if (kuerzlich && poolBasis.length >= 4) {
        score = Math.max(1, score * 0.2);
      }

      // Bei gemischten Systemen: Wechsel zwischen Händen unterstützen
      if (mischen && kandidat.schluessel !== vorher.schluessel) {
        score += 20;
      }

      return score;
    });

    const gewaehlt = gewichtet ?? kandidaten[Math.floor(Math.random() * kandidaten.length)] ?? poolBasis[0];
    reihe.push(gewaehlt);
  }

  return reihe;
}

/**
 * Erzeugt eine Tonabfolge im gewünschten Modus (Zufall oder Melodische Ketten).
 */
export function erzeugeTonabfolge(
  vorrat: readonly UebungsNote[],
  modus: TonabfolgeModus,
  optionen: MelodieOptionen = {},
): UebungsNote[] {
  return modus === "zufall"
    ? wuerfleZufall(vorrat, optionen)
    : wuerfleMelodie(vorrat, optionen);
}
