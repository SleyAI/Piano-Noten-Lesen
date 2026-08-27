/**
 * Auswahl der naechsten Aufgabe.
 *
 * Zwei Regeln: was hakt, kommt oefter dran, und dieselbe Aufgabe kommt nicht
 * zweimal hintereinander — sonst tippt man beim zweiten Mal nur nach.
 */

export function gewichteteWahl<T>(
  kandidaten: readonly T[],
  gewicht: (kandidat: T) => number,
  meiden?: (kandidat: T) => boolean,
): T | null {
  if (kandidaten.length === 0) return null;
  if (kandidaten.length === 1) return kandidaten[0];

  const auswahl = meiden ? kandidaten.filter((k) => !meiden(k)) : kandidaten;
  // Wenn das Meiden alles wegfiltert, lieber wiederholen als nichts zeigen.
  const menge = auswahl.length > 0 ? auswahl : kandidaten;

  const gewichte = menge.map((k) => Math.max(gewicht(k), 0.0001));
  const summe = gewichte.reduce((a, b) => a + b, 0);

  let wurf = Math.random() * summe;
  for (let i = 0; i < menge.length; i += 1) {
    wurf -= gewichte[i];
    if (wurf <= 0) return menge[i];
  }
  return menge[menge.length - 1];
}

/** Mischt eine Liste, ohne das Original anzufassen. */
export function gemischt<T>(liste: readonly T[]): T[] {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}
