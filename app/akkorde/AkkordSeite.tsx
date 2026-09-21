"use client";

import { useMemo, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import {
  type AkkordKomplexitaet,
  type AkkordEintrag,
  KOMPLEXITAET_INFOS,
  baueAkkordEintrag,
} from "@/lib/music/akkordSets";
import { AkkordAuswahl } from "./AkkordAuswahl";
import { AkkordVorschau } from "./AkkordVorschau";
import { AkkordfolgenUebung } from "./AkkordfolgenUebung";

export type AkkordPhase = "auswahl" | "flashcards" | "uebung";

export function AkkordSeite() {
  const hydriert = useHydriert();
  const haende = useEinstellungen((z) => z.akkordHaende);
  const setzeHaende = useEinstellungen((z) => z.setzeAkkordHaende);

  // Schritt-Navigation
  const [phase, setPhase] = useState<AkkordPhase>("auswahl");

  // Filter-Zustand für Schritt A
  const [komplexitaet, setKomplexitaet] = useState<AkkordKomplexitaet>("dreiklaenge");
  const [ausgewaehlteSymbole, setAusgewaehlteSymbole] = useState<string[]>([
    "C",
    "G",
    "Am",
    "F",
  ]);

  // Aufbereitete Akkorde für Flashcards und Übung
  const eintraege = useMemo(() => {
    return ausgewaehlteSymbole
      .map((sym) => baueAkkordEintrag(sym))
      .filter((e): e is AkkordEintrag => e !== null);
  }, [ausgewaehlteSymbole]);

  if (!hydriert) return <div className="h-full bg-papier" />;

  const info = KOMPLEXITAET_INFOS[komplexitaet];

  return (
    <div className="flex h-full flex-col bg-papier overflow-hidden">
      <Kopfzeile
        titel="Akkorde"
        unterzeile={
          phase === "auswahl"
            ? info.kurztitel
            : phase === "flashcards"
              ? `${eintraege.length} Akkorde · Flashcards`
              : `${eintraege.length} Akkorde · Aktive Übung`
        }
      />

      <div className="flex-1 overflow-y-auto">
        {phase === "auswahl" && (
          <AkkordAuswahl
            komplexitaet={komplexitaet}
            onKomplexitaetChange={setKomplexitaet}
            haende={haende}
            onHaendeChange={setzeHaende}
            ausgewaehlteAkkorde={ausgewaehlteSymbole}
            onAkkordeChange={setAusgewaehlteSymbole}
            onWeiter={() => setPhase("flashcards")}
          />
        )}

        {phase === "flashcards" && (
          <AkkordVorschau
            eintraege={eintraege}
            haende={haende}
            onZurueck={() => setPhase("auswahl")}
            onStartUebung={() => setPhase("uebung")}
          />
        )}

        {phase === "uebung" && (
          <AkkordfolgenUebung
            eintraege={eintraege}
            haende={haende}
            onZurueckZuFlashcards={() => setPhase("flashcards")}
            onZurueckZuAuswahl={() => setPhase("auswahl")}
          />
        )}
      </div>
    </div>
  );
}
