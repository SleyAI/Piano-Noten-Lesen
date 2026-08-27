/**
 * Einmal-Skript: holt die beiden Notenschluessel als SVG-Pfade aus Bravura
 * (SIL OFL 1.1) und schreibt sie nach lib/notation/glyphen.ts.
 *
 * Danach braucht die App keine Notenschrift mehr — nur zwei Pfad-Strings.
 * Ausfuehren mit: node scripts/glyphen-extrahieren.mjs
 */
import opentype from "opentype.js";
import { readFileSync, writeFileSync } from "node:fs";

const font = opentype.parse(
  readFileSync("node_modules/@vexflow-fonts/bravura/bravura.otf").buffer,
);

// SMuFL-Codepunkte
const GLYPHEN = {
  violinschluessel: 0xe050, // gClef
  bassschluessel: 0xe062, // fClef
  kreuz: 0xe262, // accidentalSharp
  be: 0xe260, // accidentalFlat
  aufloesung: 0xe261, // accidentalNatural
};

const ergebnis = {};
for (const [name, codepoint] of Object.entries(GLYPHEN)) {
  const glyph = font.charToGlyph(String.fromCodePoint(codepoint));
  if (!glyph || glyph.index === 0) throw new Error(`Glyph fehlt: ${name}`);

  // Bravura ist auf 1000 Einheiten pro em normiert; ein Notenzeilenabstand
  // entspricht 250 Einheiten. Wir skalieren auf Zeilenabstand = 1 und
  // spiegeln die y-Achse, weil SVG nach unten waechst.
  const d = glyph.getPath(0, 0, 1000).toPathData(3);

  // getPath liefert bereits SVG-Orientierung (y nach unten), getBoundingBox
  // dagegen Font-Orientierung (y nach oben). Wir drehen die Box, damit beide
  // im selben System liegen.
  const box = glyph.getBoundingBox();
  ergebnis[name] = {
    d,
    bbox: { x1: box.x1, y1: -box.y2, x2: box.x2, y2: -box.y1 },
  };
}

const datei = `/**
 * Notenschluessel als SVG-Pfade, einmalig aus der Bravura-Notenschrift
 * (SIL Open Font License 1.1) extrahiert von scripts/glyphen-extrahieren.mjs.
 *
 * Koordinaten in Font-Einheiten bei 1000 Einheiten pro em, bereits in
 * SVG-Orientierung (y waechst nach unten). Bravura setzt einen
 * Notenzeilenabstand auf 250 Einheiten — siehe ZEILENABSTAND_EM.
 *
 * Der Ursprung (0,0) liegt auf der Bezugslinie des jeweiligen Schluessels:
 * beim Violinschluessel auf der G4-Linie, beim Bassschluessel auf der F3-Linie.
 * Zum Platzieren also schlicht auf die y-Koordinate dieser Linie setzen.
 */

export const ZEILENABSTAND_EM = 250;

export interface Glyph {
  d: string;
  bbox: { x1: number; y1: number; x2: number; y2: number };
}

export const VIOLINSCHLUESSEL: Glyph = ${JSON.stringify(ergebnis.violinschluessel)};

export const BASSSCHLUESSEL: Glyph = ${JSON.stringify(ergebnis.bassschluessel)};

/** Vorzeichen. Ursprung liegt auf der Linie bzw. im Zwischenraum der Note. */
export const KREUZ: Glyph = ${JSON.stringify(ergebnis.kreuz)};

export const BE: Glyph = ${JSON.stringify(ergebnis.be)};

export const AUFLOESUNG: Glyph = ${JSON.stringify(ergebnis.aufloesung)};
`;

writeFileSync("lib/notation/glyphen.ts", datei);
for (const [name, g] of Object.entries(ergebnis)) {
  console.log(name.padEnd(18), "Pfadlaenge", String(g.d.length).padStart(5), JSON.stringify(g.bbox));
}
