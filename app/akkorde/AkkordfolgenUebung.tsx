"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SchrittReihe } from "@/components/practice/SchrittReihe";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { type Haende } from "@/lib/music/akkorde";
import { type UebungsSchritt, baueUebung } from "@/lib/music/akkorduebung";
import { type AkkordEintrag } from "@/lib/music/akkordSets";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useSchrittfolge } from "@/lib/practice/useSchrittfolge";

const PAUSE_NACH_FOLGE = 900;

interface FolgenSchritt extends UebungsSchritt {
  akkordIndex: number;
}

function schritteAusKette(
  kette: readonly AkkordEintrag[],
  haende: Haende,
): { schritte: FolgenSchritt[]; bassGrenze: number } {
  const schritte: FolgenSchritt[] = [];
  let bassGrenze = Number.NEGATIVE_INFINITY;

  kette.forEach((eintrag, akkordIndex) => {
    const gebaut = baueUebung(eintrag.lage, "griff", haende, false);
    bassGrenze = gebaut.bassGrenze;
    for (const schritt of gebaut.schritte) {
      schritte.push({ ...schritt, akkordIndex });
    }
  });

  return { schritte, bassGrenze };
}

function wuerfleAchtSchritte(eintraege: readonly AkkordEintrag[]): AkkordEintrag[] {
  if (eintraege.length === 0) return [];
  if (eintraege.length === 1) return Array.from({ length: 8 }, () => eintraege[0]);

  const kette: AkkordEintrag[] = [];
  while (kette.length < 8) {
    const vorheriger = kette[kette.length - 1];
    // Wähle zufälligen Eintrag, vermeide direkte Wiederholung wenn möglich
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
  onZurueckZuFlashcards: () => void;
  onZurueckZuAuswahl: () => void;
}

export function AkkordfolgenUebung({
  eintraege,
  haende,
  onZurueckZuFlashcards,
  onZurueckZuAuswahl,
}: AkkordfolgenUebungProps) {
  const [variation, setVariation] = useState(0);

  const naechsteVariation = useCallback(() => {
    setVariation((v) => v + 1);
  }, []);

  return (
    <Lauf
      key={`variation-${variation}-${haende}`}
      eintraege={eintraege}
      haende={haende}
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
  rundeNummer,
  onZurueckZuFlashcards,
  onZurueckZuAuswahl,
  aufNaechste,
}: {
  eintraege: readonly AkkordEintrag[];
  haende: Haende;
  rundeNummer: number;
  onZurueckZuFlashcards: () => void;
  onZurueckZuAuswahl: () => void;
  aufNaechste: () => void;
}) {
  // 8 Schläge/Schritte in variierender Reihenfolge
  const kette = useMemo(() => wuerfleAchtSchritte(eintraege), [eintraege]);
  const { schritte, bassGrenze } = useMemo(() => schritteAusKette(kette, haende), [kette, haende]);

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

  const [namenSichtbar, setNamenSichtbar] = useState(true);

  const aktuellerAkkord = lauf.fertig
    ? kette.length - 1
    : (schritte[lauf.index]?.akkordIndex ?? 0);

  return (
    <div className="flex flex-col h-full bg-papier">
      {/* Obere Steuerungs- und Fortschrittsleiste */}
      <div className="flex flex-wrap shrink-0 items-center justify-between gap-3 px-6 py-3 border-b border-papier-tief bg-white/50">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-bold text-[#785BA3] bg-[#EADCF5] px-2.5 py-1 rounded-full shrink-0">
            Runde {rundeNummer} (8 Akkorde)
          </span>

          {kette.map((a, i) => {
            const gespielt = lauf.fertig || i < aktuellerAkkord;
            const istAktiv = i === aktuellerAkkord;
            const text = namenSichtbar || gespielt ? a.titel : String(i + 1);

            return (
              <span
                key={`${i}-${a.id}`}
                className={`flex rounded-xl px-3 py-1 text-sm font-bold transition-all duration-200 ${
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

          <button
            type="button"
            onClick={() => setNamenSichtbar((v) => !v)}
            className="ml-1 rounded-full bg-white border border-[#785BA3]/20 px-3 py-1 text-xs font-bold text-[#785BA3] hover:bg-[#EADCF5]/60 transition-colors shrink-0"
          >
            {namenSichtbar ? "Namen ausblenden" : "Namen einblenden"}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onZurueckZuFlashcards}
            className="rounded-full bg-white border border-[#785BA3]/20 px-4 py-1.5 text-xs font-bold text-[#785BA3] transition-colors hover:bg-[#EADCF5]"
          >
            ← Flashcards
          </button>
          <button
            type="button"
            onClick={onZurueckZuAuswahl}
            className="rounded-full bg-white border border-[#785BA3]/20 px-4 py-1.5 text-xs font-bold text-tinte transition-colors hover:bg-[#EADCF5]"
          >
            Auswahl ändern
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
