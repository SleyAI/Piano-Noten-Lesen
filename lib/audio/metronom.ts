/**
 * Ein Metronom, damit die Notenwerte wirklich sitzen.
 *
 * Klicks aus `setTimeout` heraus zu spielen klingt schon bei ruhigem Tempo
 * ungenau — der Browser darf einen Timer um zehn Millisekunden verschieben,
 * und genau das hoert man. Deshalb wird im Voraus geplant: ein Timer schaut
 * regelmaessig nach vorn und meldet der Audio-Uhr jeden Klick der naechsten
 * halben Sekunde. Die Uhr selbst laeuft in der Audiohardware und verschiebt
 * nichts.
 *
 * Der Vorlauf ist so grosszuegig, weil Browser Timer drosseln, sobald der Tab
 * in den Hintergrund rutscht. Dafuer muessen die schon geplanten Klicks beim
 * Ausschalten wieder eingesammelt werden — sonst klickt es weiter, nachdem
 * man es abgestellt hat.
 *
 * Der erste Schlag jedes Taktes klingt heller — sonst weiss man beim Zaehlen
 * nicht, wo die Eins ist.
 */

import { holeKontext, holeSumme } from "./engine";
import { TAKT } from "@/lib/music/rhythmus";

/** Wie weit im Voraus geplant wird und wie oft nachgeschaut. */
const VORLAUF = 0.5;
const NACHSCHAUEN = 60;

interface Lauf {
  tempo: number;
  /** Zeitpunkt des naechsten Schlags auf der Audio-Uhr. */
  naechster: number;
  /** Welcher Schlag im Takt als Naechstes kommt, 0 ist die Eins. */
  zaehler: number;
  timer: number;
  /** Schon eingeplante Klicks, damit sie sich abbrechen lassen. */
  geplant: OscillatorNode[];
}

let lauf: Lauf | null = null;

/** Ein kurzer, weicher Klick. Die Eins bekommt mehr Licht. */
function klick(
  ctx: AudioContext,
  ziel: AudioNode,
  zeit: number,
  betont: boolean,
): OscillatorNode {
  const ton = ctx.createOscillator();
  const huelle = ctx.createGain();

  ton.type = "sine";
  ton.frequency.value = betont ? 1320 : 880;

  const spitze = betont ? 0.22 : 0.13;
  huelle.gain.setValueAtTime(0.0001, zeit);
  huelle.gain.exponentialRampToValueAtTime(spitze, zeit + 0.004);
  huelle.gain.exponentialRampToValueAtTime(0.0001, zeit + 0.07);

  ton.connect(huelle);
  huelle.connect(ziel);
  ton.start(zeit);
  ton.stop(zeit + 0.09);
  return ton;
}

function planen() {
  const ctx = holeKontext();
  const ziel = holeSumme();
  if (!lauf || !ctx || !ziel) return;

  const abstand = 60 / lauf.tempo;
  while (lauf.naechster < ctx.currentTime + VORLAUF) {
    lauf.geplant.push(klick(ctx, ziel, lauf.naechster, lauf.zaehler === 0));
    lauf.naechster += abstand;
    lauf.zaehler = (lauf.zaehler + 1) % TAKT;
  }

  // Was laengst geklungen hat, muss nicht aufgehoben werden.
  if (lauf.geplant.length > 32) lauf.geplant = lauf.geplant.slice(-16);
}

/**
 * Startet das Metronom, oder stellt ein laufendes auf ein neues Tempo um.
 * Beim Umstellen bleibt der laufende Takt erhalten, es klickt also nicht
 * mitten im Umschalten doppelt.
 */
export function starteMetronom(tempo: number) {
  const ctx = holeKontext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  // Ein laufendes Metronom stellt nur um; die naechsten schon geplanten
  // Klicks liegen dann noch im alten Abstand, der Rest folgt dem neuen.
  if (lauf) {
    lauf.tempo = tempo;
    return;
  }

  lauf = {
    tempo,
    naechster: ctx.currentTime + 0.1,
    zaehler: 0,
    timer: window.setInterval(planen, NACHSCHAUEN),
    geplant: [],
  };
  planen();
}

export function stoppeMetronom() {
  if (!lauf) return;
  window.clearInterval(lauf.timer);

  // Die schon eingeplanten Klicks wieder abbestellen.
  const jetzt = holeKontext()?.currentTime ?? 0;
  for (const ton of lauf.geplant) {
    try {
      ton.stop(jetzt);
    } catch {
      // Schon gelaufen — dann gibt es nichts mehr zu stoppen.
    }
  }

  lauf = null;
}

export function metronomLaeuft(): boolean {
  return lauf !== null;
}
