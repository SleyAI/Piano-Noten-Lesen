/**
 * Notenwerte im 4/4-Takt.
 *
 * Wer Notenwerte uebt, soll nicht nur andere Koepfe sehen, sondern etwas
 * spielen, das sich zaehlen laesst. Deshalb wird nie eine lose Folge von
 * Werten gewuerfelt, sondern immer ein Rhythmus, der volle Takte fuellt und
 * in dem kein Wert ueber einen Taktstrich hinausragt — sonst braeuchte es
 * Haltebogen, und die gehoeren nicht in eine erste Rhythmusuebung.
 */

export type NotenwertId = "ganze" | "halbe" | "viertel" | "achtel";

export interface Notenwert {
  id: NotenwertId;
  /** Dauer in Viertelschlaegen. */
  schlaege: number;
  titel: string;
}

export const NOTENWERTE: Record<NotenwertId, Notenwert> = {
  ganze: { id: "ganze", schlaege: 4, titel: "ganze Note" },
  halbe: { id: "halbe", schlaege: 2, titel: "halbe Note" },
  viertel: { id: "viertel", schlaege: 1, titel: "Viertelnote" },
  achtel: { id: "achtel", schlaege: 0.5, titel: "Achtelnote" },
};

/** Schlaege pro Takt. Die App kennt nur den 4/4-Takt. */
export const TAKT = 4;

export function schlaege(wert: NotenwertId): number {
  return NOTENWERTE[wert].schlaege;
}

export function dauerSumme(werte: readonly NotenwertId[]): number {
  return werte.reduce((summe, w) => summe + schlaege(w), 0);
}

/**
 * Wo faellt hinter dieser Note ein Taktstrich?
 * Liefert je Note, ob der Takt mit ihr voll ist.
 */
export function taktEnden(werte: readonly NotenwertId[]): boolean[] {
  let stand = 0;
  return werte.map((w) => {
    stand += schlaege(w);
    return stand % TAKT === 0;
  });
}

/** Die Werte, aus denen gewuerfelt wird — mit ihrer Haeufigkeit. */
const GEWICHT: Record<NotenwertId, number> = {
  ganze: 0.6,
  halbe: 2,
  viertel: 4,
  achtel: 2.5,
};

const KUERZESTER = NOTENWERTE.achtel.schlaege;
const LAENGSTER = NOTENWERTE.ganze.schlaege;

/**
 * Wie viele Takte braucht eine Reihe aus so vielen Noten?
 *
 * Ein Viertel je Note ist der Richtwert; das laesst genug Luft nach oben und
 * unten, damit sich Halbe und Achtel mischen lassen.
 */
export function taktzahl(anzahl: number): number {
  return Math.max(1, Math.ceil(anzahl / TAKT));
}

/**
 * Kann der Rest mit so vielen Noten ueberhaupt noch gefuellt werden?
 * Eine schnelle Vorpruefung, damit die Suche nicht in aussichtslose Zweige
 * laeuft; die genaue Antwort gibt erst das Durchprobieren.
 */
function denkbar(restSchlaege: number, restNoten: number): boolean {
  if (restNoten === 0) return restSchlaege === 0;
  return restSchlaege >= restNoten * KUERZESTER && restSchlaege <= restNoten * LAENGSTER;
}

/**
 * Bringt die erlaubten Werte in eine gewichtete Zufallsreihenfolge.
 *
 * Die Suche nimmt den ersten, der passt — dadurch entscheidet die Reihenfolge
 * ueber die Haeufigkeit, und die selteneren Werte kommen trotzdem vor.
 */
function inZufallsreihenfolge(werte: readonly NotenwertId[]): NotenwertId[] {
  const uebrig = [...werte];
  const reihe: NotenwertId[] = [];

  while (uebrig.length > 0) {
    const summe = uebrig.reduce((s, w) => s + GEWICHT[w], 0);
    let wurf = Math.random() * summe;
    let index = uebrig.length - 1;
    for (let i = 0; i < uebrig.length; i += 1) {
      wurf -= GEWICHT[uebrig[i]];
      if (wurf <= 0) {
        index = i;
        break;
      }
    }
    reihe.push(uebrig[index]);
    uebrig.splice(index, 1);
  }

  return reihe;
}

/**
 * Fuellt `restNoten` Noten so, dass am Ende genau `gesamt` Schlaege stehen und
 * kein Wert ueber einen Taktstrich reicht.
 *
 * Rein gierig zu waehlen reicht nicht: eine Achtel am Anfang kann einen
 * angebrochenen Takt hinterlassen, den die letzte Note nicht mehr auffuellen
 * kann. Deshalb wird zurueckgesetzt, wenn ein Zweig nicht aufgeht — bei
 * hoechstens ein paar Dutzend Noten kostet das nichts.
 */
function fuelle(
  restNoten: number,
  stand: number,
  gesamt: number,
  erlaubt: readonly NotenwertId[],
): NotenwertId[] | null {
  if (restNoten === 0) return stand === gesamt ? [] : null;

  const imTakt = TAKT - (stand % TAKT);

  for (const wert of inZufallsreihenfolge(erlaubt)) {
    const dauer = schlaege(wert);
    if (dauer > imTakt || stand + dauer > gesamt) continue;
    if (!denkbar(gesamt - stand - dauer, restNoten - 1)) continue;

    const rest = fuelle(restNoten - 1, stand + dauer, gesamt, erlaubt);
    if (rest) return [wert, ...rest];
  }

  return null;
}

/**
 * Wuerfelt einen Rhythmus aus genau `anzahl` Noten, der volle Takte fuellt.
 *
 * @param erlaubt Welche Werte vorkommen duerfen. Ohne Angabe alle vier.
 */
export function wuerfleRhythmus(
  anzahl: number,
  erlaubt: readonly NotenwertId[] = ["ganze", "halbe", "viertel", "achtel"],
): NotenwertId[] {
  if (anzahl <= 0 || erlaubt.length === 0) return [];

  const gefunden = fuelle(anzahl, 0, taktzahl(anzahl) * TAKT, erlaubt);
  if (gefunden) return gefunden;

  // Geht mit diesen Werten kein voller Takt auf — etwa lauter Achtel auf einer
  // einzigen Note —, ist ein schlichter gleichmaessiger Rhythmus die
  // ehrlichste Antwort.
  const kuerzester = erlaubt.reduce((k, w) => (schlaege(w) < schlaege(k) ? w : k));
  return Array.from({ length: anzahl }, () => kuerzester);
}

// --- Tempo ------------------------------------------------------------------

/** Ruhiges Uebungstempo in Schlaegen pro Minute. */
export const TEMPO = 76;

/** Wie lange dauert dieser Wert in Millisekunden? */
export function millisekunden(wert: NotenwertId, tempo = TEMPO): number {
  return (schlaege(wert) * 60_000) / tempo;
}
