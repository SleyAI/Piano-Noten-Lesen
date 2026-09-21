"use client";

import { useMemo, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import {
  type AkkordKomplexitaet,
  type AkkordEintrag,
  type AkkordSpielart,
  baueAkkordEintrag,
  inversionenFuerAkkord,
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
  const [modusArt, setModusArt] = useState<"akkorde" | "inversionen">("akkorde");
  const [inversionsAkkord, setInversionsAkkord] = useState<string>("C");
  const [gewaehlteUmkehrungen, setGewaehlteUmkehrungen] = useState<number[]>([0, 1, 2]);
  const [ausgewaehlteSymbole, setAusgewaehlteSymbole] = useState<string[]>([]);
  const [spielart, setSpielart] = useState<AkkordSpielart>("griff");

  // Aufbereitete Akkorde für Flashcards und Übung
  const eintraege = useMemo(() => {
    if (modusArt === "inversionen") {
      return inversionenFuerAkkord(inversionsAkkord, gewaehlteUmkehrungen);
    }
    return ausgewaehlteSymbole
      .map((sym) => baueAkkordEintrag(sym))
      .filter((e): e is AkkordEintrag => e !== null);
  }, [modusArt, inversionsAkkord, gewaehlteUmkehrungen, ausgewaehlteSymbole]);

  if (!hydriert) return <div className="h-full bg-papier" />;

  return (
    <div className="flex h-full flex-col bg-papier overflow-hidden">
      <Kopfzeile
        titel="Akkorde"
        unterzeile={
          phase === "auswahl"
            ? "Einstellungen"
            : phase === "flashcards"
              ? `${eintraege.length} Griffe · Flashcards`
              : `${eintraege.length} Griffe · ${spielart === "arpeggio" ? "Arpeggios" : "Ganzer Griff"}`
        }
        onZurueck={
          phase === "uebung"
            ? () => setPhase("flashcards")
            : phase === "flashcards"
              ? () => setPhase("auswahl")
              : undefined
        }
      />

      <div className="flex-1 overflow-y-auto">
        {phase === "auswahl" && (
          <AkkordAuswahl
            komplexitaet={komplexitaet}
            onKomplexitaetChange={setKomplexitaet}
            modusArt={modusArt}
            onModusArtChange={setModusArt}
            inversionsAkkord={inversionsAkkord}
            onInversionsAkkordChange={setInversionsAkkord}
            gewaehlteUmkehrungen={gewaehlteUmkehrungen}
            onGewaehlteUmkehrungenChange={setGewaehlteUmkehrungen}
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
            spielart={spielart}
            onSpielartChange={setSpielart}
            onZurueck={() => setPhase("auswahl")}
            onStartUebung={() => setPhase("uebung")}
          />
        )}

        {phase === "uebung" && (
          <AkkordfolgenUebung
            eintraege={eintraege}
            haende={haende}
            spielart={spielart}
            onSpielartChange={setSpielart}
            onZurueckZuFlashcards={() => setPhase("flashcards")}
            onZurueckZuAuswahl={() => setPhase("auswahl")}
          />
        )}
      </div>
    </div>
  );
}
