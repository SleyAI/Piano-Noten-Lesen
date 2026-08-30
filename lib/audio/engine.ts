/**
 * Klangausgabe fuer den Tipp-Modus.
 *
 * Bewusst synthetisch statt gesampelt: ein weicher, glockiger Ton aus zwei
 * Oszillatoren mit Tiefpass klingt ruhig, passt zum Rest der App und kostet
 * keinen einzigen geladenen Ton. Wer am E-Piano uebt, hoert ohnehin das Piano.
 *
 * Browser starten Audio erst nach einer Nutzeraktion — `aufwecken` gehoert
 * deshalb an den ersten Tipp.
 */

let kontext: AudioContext | null = null;
let summe: GainNode | null = null;

/** Laufende Toene, damit Loslassen den richtigen wieder ausblendet. */
const klingend = new Map<number, { osz: OscillatorNode[]; huelle: GainNode }>();

function hole(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!kontext) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    kontext = new Ctor();
    summe = kontext.createGain();
    summe.gain.value = 0.5;
    summe.connect(kontext.destination);
  }
  return kontext;
}

/** Nach der ersten Nutzeraktion aufrufen, sonst bleibt alles stumm. */
export function aufwecken() {
  const ctx = hole();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

export function frequenz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function spieleTon(midi: number, anschlag = 0.7) {
  const ctx = hole();
  if (!ctx || !summe) return;
  aufwecken();
  stoppeTon(midi, 0.01);

  const jetzt = ctx.currentTime;
  const f = frequenz(midi);

  const huelle = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  // Tiefe Toene duerfen dunkler bleiben, hohe brauchen etwas mehr Luft.
  filter.frequency.value = Math.min(f * 6 + 400, 7000);
  filter.Q.value = 0.6;

  const grund = ctx.createOscillator();
  grund.type = "triangle";
  grund.frequency.value = f;

  // Eine leise Oktave darueber gibt dem Ton Glanz, ohne ihn hart zu machen.
  const oberton = ctx.createOscillator();
  oberton.type = "sine";
  oberton.frequency.value = f * 2;
  const obertonPegel = ctx.createGain();
  obertonPegel.gain.value = 0.16;

  grund.connect(filter);
  oberton.connect(obertonPegel);
  obertonPegel.connect(filter);
  filter.connect(huelle);
  huelle.connect(summe);

  const spitze = 0.22 + anschlag * 0.2;
  huelle.gain.setValueAtTime(0.0001, jetzt);
  huelle.gain.exponentialRampToValueAtTime(spitze, jetzt + 0.012);
  huelle.gain.exponentialRampToValueAtTime(spitze * 0.3, jetzt + 0.6);
  huelle.gain.exponentialRampToValueAtTime(0.0001, jetzt + 3.2);

  grund.start(jetzt);
  oberton.start(jetzt);
  grund.stop(jetzt + 3.3);
  oberton.stop(jetzt + 3.3);

  klingend.set(midi, { osz: [grund, oberton], huelle });
  grund.onended = () => {
    if (klingend.get(midi)?.huelle === huelle) klingend.delete(midi);
  };
}

export function stoppeTon(midi: number, ausklang = 0.28) {
  const ctx = kontext;
  const ton = klingend.get(midi);
  if (!ctx || !ton) return;

  const jetzt = ctx.currentTime;
  ton.huelle.gain.cancelScheduledValues(jetzt);
  ton.huelle.gain.setValueAtTime(Math.max(ton.huelle.gain.value, 0.0001), jetzt);
  ton.huelle.gain.exponentialRampToValueAtTime(0.0001, jetzt + ausklang);
  for (const o of ton.osz) o.stop(jetzt + ausklang + 0.02);
  klingend.delete(midi);
}

/** Kurzer freundlicher Klang, wenn eine Aufgabe geschafft ist. */
export function spieleBestaetigung(grundton = 72) {
  [0, 4, 7].forEach((halbton, i) => {
    window.setTimeout(() => spieleTon(grundton + halbton, 0.35), i * 70);
  });
}

export function alleToeneAus() {
  for (const midi of [...klingend.keys()]) stoppeTon(midi, 0.12);
}

/**
 * Der laufende Audiokontext, oder null, solange es keinen gibt.
 * Das Metronom taktet daran, statt sich einen zweiten aufzumachen.
 */
export function holeKontext(): AudioContext | null {
  return hole();
}

/** Wohin alles klingt — damit das Metronom denselben Pegel benutzt. */
export function holeSumme(): GainNode | null {
  hole();
  return summe;
}
