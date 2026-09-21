"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SchrittReihe } from "@/components/practice/SchrittReihe";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { type Haende } from "@/lib/music/akkorde";
import { type UebungsSchritt, baueUebung } from "@/lib/music/akkorduebung";
import { type AkkordEintrag, type AkkordSpielart } from "@/lib/music/akkordSets";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useSchrittfolge } from "@/lib/practice/useSchrittfolge";

const PAUSE_NACH_FOLGE = 850;

export type HandAuswahlModus = Haende | "abwechselnd";

interface FolgenSchritt extends UebungsSchritt {
  akkordIndex: number;
}

function schritteAusKette(
  kette: readonly AkkordEintrag[],
  haende: HandAuswahlModus,
  spielart: AkkordSpielart,
): { schritte: FolgenSchritt[]; bassGrenze: number } {
  const schritte: FolgenSchritt[] = [];

  kette.forEach((eintrag, akkordIndex) => {
    const effektiveHand: Haende =
      haende === "abwechselnd"
        ? akkordIndex % 2 === 0
          ? "rechts"
          : "links"
        : haende;

    const gebaut = baueUebung(
      eintrag.lage,
      spielart === "arpeggio" ? "gebrochen" : "griff",
      effektiveHand,
      false,
    );
    for (const schritt of gebaut.schritte) {
      schritte.push({ ...schritt, akkordIndex });
    }
  });

  let bassGrenze = Number.NEGATIVE_INFINITY;
  if (haende === "beide" || haende === "abwechselnd") {
    // 60 = C4. Linke Hand (Bass, midi < 60) in Bassschlüssel, rechte Hand (Violin, midi >= 60) in Violinschlüssel.
    bassGrenze = 60;
  } else if (haende === "links") {
    bassGrenze = Number.POSITIVE_INFINITY;
  } else {
    bassGrenze = Number.NEGATIVE_INFINITY;
  }

  return { schritte, bassGrenze };
}

function wuerfleFolgeSchritte(
  eintraege: readonly AkkordEintrag[],
  spielart: AkkordSpielart,
): AkkordEintrag[] {
  if (eintraege.length === 0) return [];
  // Bei Arpeggios maximal 4 Akkorde (12 Töne), damit die Noten groß und leserlich bleiben.
  // Bei Griffen 8 Akkorde.
  const anzahl = spielart === "arpeggio" ? 4 : 8;

  if (eintraege.length === 1) return Array.from({ length: anzahl }, () => eintraege[0]);

  const kette: AkkordEintrag[] = [];
  while (kette.length < anzahl) {
    const vorheriger = kette[kette.length - 1];
    const pool =
      eintraege.length > 1
        ? eintraege.filter((e) => !vorheriger || e.id !== vorheriger.id)
        : eintraege;
    const zufall = pool[Math.floor(Math.random() * pool.length)];
    kette.push(zufall);
  }
  return kette;
}

interface AkkordfolgenUebungProps {
  eintraege: AkkordEintrag[];
  haende: Haende;
  spielart: AkkordSpielart;
  onSpielartChange: (s: AkkordSpielart) => void;
  onZurueckZuFlashcards: () => void;
  onZurueckZuAuswahl: () => void;
}

export function AkkordfolgenUebung({
  eintraege,
  haende: initialeHaende,
  spielart,
  onSpielartChange,
  onZurueckZuFlashcards,
  onZurueckZuAuswahl,
}: AkkordfolgenUebungProps) {
  const [variation, setVariation] = useState(0);
  const [aktuelleHand, setAktuelleHand] = useState<HandAuswahlModus>(initialeHaende);
  const [namenSichtbar, setNamenSichtbar] = useState(true);

  const naechsteVariation = useCallback(() => {
    setVariation((v) => v + 1);
  }, []);

  return (
    <Lauf
      key={`variation-${variation}-${aktuelleHand}-${spielart}`}
      eintraege={eintraege}
      haende={aktuelleHand}
      onHaendeChange={setAktuelleHand}
      spielart={spielart}
      onSpielartChange={onSpielartChange}
      namenSichtbar={namenSichtbar}
      onNamenSichtbarChange={setNamenSichtbar}
      rundeNummer={variation + 1}
      onZurueckZuFlashcards={onZurueckZuFlashcards}
      onZurueckZuAuswahl={onZurueckZuAuswahl}
      aufNaechste={naechsteVariation}
    />
  );
}

function Lauf({
  eintraege,
  haende,
  onHaendeChange,
  spielart,
  onSpielartChange,
  namenSichtbar,
  onNamenSichtbarChange,
  rundeNummer,
  onZurueckZuFlashcards,
  onZurueckZuAuswahl,
  aufNaechste,
}: {
  eintraege: readonly AkkordEintrag[];
  haende: HandAuswahlModus;
  onHaendeChange: (h: HandAuswahlModus) => void;
  spielart: AkkordSpielart;
  onSpielartChange: (s: AkkordSpielart) => void;
  namenSichtbar: boolean;
  onNamenSichtbarChange: (s: boolean) => void;
  rundeNummer: number;
  onZurueckZuFlashcards: () => void;
  onZurueckZuAuswahl: () => void;
  aufNaechste: () => void;
}) {
  // 4 Akkorde bei Arpeggio, 8 bei ganzem Griff
  const kette = useMemo(() => wuerfleFolgeSchritte(eintraege, spielart), [eintraege, spielart]);
  const { schritte, bassGrenze } = useMemo(
    () => schritteAusKette(kette, haende, spielart),
    [kette, haende, spielart],
  );

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  const aufFertig = useCallback(() => {
    uhren.current.push(window.setTimeout(aufNaechste, PAUSE_NACH_FOLGE));
  }, [aufNaechste]);

  const lauf = useSchrittfolge({
    schritte,
    aktiv: true,
    taktGenau: false,
    aufFertig,
  });

  const bereich = useMemo(
    () => klaviaturBereich(schritte.flatMap((s) => s.noten.map((n) => n.midi))),
    [schritte],
  );

  const hervorgehoben = useMemo(() => {
    const karte = new Map<number, "mint" | "flieder" | "himmel">();
    for (const midi of lauf.gespielt) karte.set(midi, "mint");
    for (const midi of lauf.daneben) karte.set(midi, "flieder");
    return karte;
  }, [lauf.gespielt, lauf.daneben]);

  const aktuellerAkkord = lauf.fertig
    ? kette.length - 1
    : (schritte[lauf.index]?.akkordIndex ?? 0);

  return (
    <div className="flex flex-col h-full bg-papier">
      {/* Obere Steuerungs- und Fortschrittsleiste */}
      <div className="flex flex-col lg:flex-row shrink-0 items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b border-papier-tief bg-white/60 backdrop-blur-xs">
        {/* Linke Seite: Runde & Akkord-Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
          <span className="text-xs font-bold text-[#785BA3] bg-[#EADCF5] px-3 py-1 rounded-full shrink-0">
            Runde {rundeNummer} ({kette.length} Akkorde)
          </span>

          {kette.map((a, i) => {
            const gespielt = lauf.fertig || i < aktuellerAkkord;
            const istAktiv = i === aktuellerAkkord;
            const text = namenSichtbar || gespielt ? a.titel : `${i + 1}`;

            return (
              <span
                key={`${i}-${a.id}`}
                className={`flex items-center rounded-xl px-3 py-1 text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
                  gespielt
                    ? "bg-mint text-tinte opacity-80"
                    : istAktiv
                      ? "bg-[#EADCF5] text-[#785BA3] ring-2 ring-[#785BA3]/40 scale-105 shadow-xs"
                      : "bg-white/80 text-tinte-leise border border-[#785BA3]/10"
                }`}
              >
                {text}
              </span>
            );
          })}
        </div>

        {/* Rechte Seite: Hand, Spielart, Namen, Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          {/* Hand-Auswahl während des Spielens */}
          <div className="inline-flex rounded-full bg-white border border-[#785BA3]/20 p-0.5 shadow-2xs text-xs font-bold">
            {[
              { id: "rechts" as const, label: "Rechts" },
              { id: "links" as const, label: "Links" },
              { id: "beide" as const, label: "Beide" },
              { id: "abwechselnd" as const, label: "Abwechselnd" },
            ].map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => onHaendeChange(h.id)}
                className={`rounded-full px-2.5 py-1 transition-all ${
                  haende === h.id
                    ? "bg-[#785BA3] text-white shadow-xs"
                    : "text-tinte-leise hover:text-[#785BA3]"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Spielart Umschalter (Griff vs. Arpeggio) */}
          <div className="inline-flex rounded-full bg-white border border-[#785BA3]/20 p-0.5 shadow-2xs text-xs font-bold">
            <button
              type="button"
              onClick={() => onSpielartChange("griff")}
              className={`rounded-full px-2.5 py-1 transition-all ${
                spielart === "griff"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
            >
              Griff
            </button>
            <button
              type="button"
              onClick={() => onSpielartChange("arpeggio")}
              className={`rounded-full px-2.5 py-1 transition-all ${
                spielart === "arpeggio"
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
            >
              Arpeggio
            </button>
          </div>

          {/* Intuitiver Namen-Umschalter */}
          <div className="inline-flex rounded-full bg-white border border-[#785BA3]/20 p-0.5 shadow-2xs text-xs font-bold">
            <button
              type="button"
              onClick={() => onNamenSichtbarChange(true)}
              className={`rounded-full px-2.5 py-1 transition-all ${
                namenSichtbar
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
              title="Akkordnamen einblenden"
            >
              Namen an
            </button>
            <button
              type="button"
              onClick={() => onNamenSichtbarChange(false)}
              className={`rounded-full px-2.5 py-1 transition-all ${
                !namenSichtbar
                  ? "bg-[#785BA3] text-white shadow-xs"
                  : "text-tinte-leise hover:text-[#785BA3]"
              }`}
              title="Akkordnamen ausblenden"
            >
              Namen aus
            </button>
          </div>

          {/* Navigation */}
          <button
            type="button"
            onClick={onZurueckZuFlashcards}
            className="rounded-full bg-white border border-[#785BA3]/20 px-3 py-1 text-xs font-bold text-[#785BA3] transition-colors hover:bg-[#EADCF5]"
          >
            ← Flashcards
          </button>
          <button
            type="button"
            onClick={onZurueckZuAuswahl}
            className="rounded-full bg-white border border-[#785BA3]/20 px-3 py-1 text-xs font-bold text-tinte transition-colors hover:bg-[#EADCF5]"
          >
            Auswahl
          </button>
        </div>
      </div>

      {/* Notenbild im absoluten Mittelpunkt */}
      <Uebungsflaeche
        notenbild={
          <SchrittReihe
            schritte={schritte}
            bassGrenze={bassGrenze}
            position={lauf.fertig ? schritte.length : lauf.index}
            daneben={[]}
            mitWerten={false}
            beschreibung={eintraege.map((a) => a.titel).join(" – ")}
          />
        }
        hervorgehoben={hervorgehoben}
        klaviaturVon={bereich.von}
        klaviaturBis={bereich.bis}
      />
    </div>
  );
}
