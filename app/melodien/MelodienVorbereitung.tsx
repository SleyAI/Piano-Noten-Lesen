"use client";

/**
 * Modus "Melodien mit Vorbereitung":
 * 1. Vorbereiten: Melodie mit Notenwerten ansehen, frei vorüben, anhören.
 * 2. "Let's check": 4-Schlag-Einzähler und anschließende Prüfung von Tönen & Notenwerten.
 * 3. Feedback bei Erfolg oder Abweichung.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { type DanebenStelle, NotenReihe } from "@/components/practice/NotenReihe";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { SchnellLeiste } from "@/components/practice/SchnellLeiste";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { type SchluesselWahl, type UebungsNote, uebungsSchluessel } from "@/lib/music/curriculum";
import { notenFuerLevel } from "@/lib/music/levels";
import { melodieSchluessel, wuerfleMelodie } from "@/lib/music/melodie";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { type NotenwertId, wuerfleRhythmus } from "@/lib/music/rhythmus";
import { danebenAlsNote } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { type Fehler, useReihenUebung } from "@/lib/practice/useReihenUebung";
import { useVorspielen } from "@/lib/practice/useVorspielen";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";

type Phase = "vorbereiten" | "einzaehlen" | "pruefen" | "bestanden" | "fehler";

interface Aufgabe {
  melodie: UebungsNote[];
  werte: NotenwertId[];
}

export function MelodienVorbereitung({
  notenLevel,
  schluesselWahl,
}: {
  notenLevel: number;
  schluesselWahl: SchluesselWahl;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const tempo = useEinstellungen((z) => z.tempo);

  const vorrat = useMemo(
    () => notenFuerLevel(notenLevel as any, schluesselWahl),
    [notenLevel, schluesselWahl],
  );

  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const wuerfeln = useCallback((): Aufgabe => {
    const melodie = wuerfleMelodie(vorrat, { mischen: schluesselWahl === "beide" });
    const werte = wuerfleRhythmus(melodie.length);
    return { melodie, werte };
  }, [vorrat, schluesselWahl]);

  const [aufgabe, setAufgabe] = useState<Aufgabe>(wuerfeln);
  const { melodie, werte } = aufgabe;

  const [phase, setPhase] = useState<Phase>("vorbereiten");
  const [countIn, setCountIn] = useState<number>(4);
  const [letzterFehler, setLetzterFehler] = useState<Fehler | null>(null);

  // Neuer Tonversuch merken
  const kennung = melodieSchluessel(melodie);
  useEffect(() => {
    for (const ton of melodie) {
      merkeVersuch(uebungsSchluessel(ton), nameMitOktave(ton.note));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kennung]);

  const klang = useMemo(
    () =>
      melodie.map((ton, i) => ({
        midis: [ton.note.midi],
        wert: werte[i] ?? ("viertel" as NotenwertId),
      })),
    [melodie, werte],
  );
  const vorspiel = useVorspielen(klang, tempo);

  // Fehlgriff neben der erwarteten Note zeigen — nur bei falschem Ton, und nur,
  // wenn er ueberhaupt ins gezeichnete Bild passt.
  const danebenStelle = useMemo<DanebenStelle | null>(() => {
    if (phase !== "fehler" || !letzterFehler || letzterFehler.art !== "ton") return null;
    const note = danebenAlsNote(
      letzterFehler.midi,
      melodie[letzterFehler.index]?.schluessel ?? null,
    );
    return note ? { index: letzterFehler.index, note } : null;
  }, [phase, letzterFehler, melodie]);

  // Prüfung via ReihenUebung
  const aufFertig = useCallback(() => {
    setPhase("bestanden");
  }, []);

  const aufFehler = useCallback((f: Fehler) => {
    setLetzterFehler(f);
    setPhase("fehler");
  }, []);

  const uebung = useReihenUebung({
    reihe: melodie,
    werte,
    tempo,
    aktiv: phase === "pruefen",
    aufFertig,
    aufFehler,
  });

  // Einzähler-Timer
  useEffect(() => {
    if (phase !== "einzaehlen") return;

    const schlagDauer = (60 / tempo) * 1000;
    if (countIn > 1) {
      const timer = window.setTimeout(() => {
        setCountIn((c) => c - 1);
      }, schlagDauer);
      return () => window.clearTimeout(timer);
    } else {
      const timer = window.setTimeout(() => {
        setPhase("pruefen");
        uebung.vonVorn();
      }, schlagDauer);
      return () => window.clearTimeout(timer);
    }
  }, [phase, countIn, tempo, uebung]);

  const startePruefung = () => {
    vorspiel.stoppen();
    setLetzterFehler(null);
    setCountIn(4);
    setPhase("einzaehlen");
  };

  const neueMelodie = () => {
    vorspiel.stoppen();
    setAufgabe(wuerfeln());
    setPhase("vorbereiten");
    setLetzterFehler(null);
  };

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Melodien mit Rhythmus"
        unterzeile={melodie.length > 0 ? `${melodie.length} Töne` : undefined}
        rechts={
          <>
            <PlayKnopf
              laeuft={vorspiel.laeuft}
              onClick={vorspiel.umschalten}
              titel="Melodie einmal anhören"
            />
            <button
              type="button"
              onClick={() => {
                vorspiel.stoppen();
                neueMelodie();
              }}
              className="rounded-full bg-white shadow-xs px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#785BA3] transition-colors hover:bg-[#EADCF5]"
            >
              neu würfeln
            </button>
          </>
        }
      />

      <SchnellLeiste onAenderung={neueMelodie} />

      <Uebungsflaeche
        notenbild={
          <NotenReihe
            reihe={melodie}
            werte={werte}
            position={phase === "pruefen" ? uebung.position : -1}
            daneben={danebenStelle}
            beschreibung={`Melodie aus ${melodie.length} Tönen mit Notenwerten`}
          />
        }
        aktuelleNote={phase === "pruefen" ? melodie[uebung.position] : melodie[0]}
        hinweis={
          <div className="flex items-center gap-3">
            {phase === "vorbereiten" && (
              <>
                <span className="text-tinte-leise font-medium text-sm">
                  In Ruhe ansehen, vorüben oder anhören.
                </span>
                <button
                  type="button"
                  onClick={startePruefung}
                  className="rounded-full bg-[#785BA3] px-6 py-2 text-sm font-bold text-white shadow-[0_4px_16px_rgba(120,91,163,0.25)] transition-all duration-200 hover:bg-[#654B8D] hover:-translate-y-0.5"
                >
                  Let&apos;s check
                </button>
              </>
            )}

            {phase === "einzaehlen" && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-tinte-leise">Einzählen:</span>
                <span className="font-titel text-3xl font-bold text-[#785BA3] animate-puls-sanft">
                  {countIn}
                </span>
              </div>
            )}

            {phase === "pruefen" && (
              <span className="text-sm font-medium text-[#785BA3]">
                Prüfung läuft: Ton {uebung.position + 1} von {melodie.length}
              </span>
            )}

            {phase === "bestanden" && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-emerald-600">
                  Perfekt gespielt! Töne und Notenwerte stimmen.
                </span>
                <button
                  type="button"
                  onClick={neueMelodie}
                  className="rounded-full bg-[#785BA3] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_16px_rgba(120,91,163,0.25)] transition-all duration-200 hover:bg-[#654B8D]"
                >
                  Nächste Melodie
                </button>
              </div>
            )}

            {phase === "fehler" && letzterFehler && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-rose-600">
                  {letzterFehler.art === "ton"
                    ? `Das war ${nameMitOktave(vonMidi(letzterFehler.midi))}`
                    : letzterFehler.art === "zu-kurz"
                      ? "Der Ton war zu kurz gehalten"
                      : "Der Ton war zu lange gehalten"}
                </span>
                <button
                  type="button"
                  onClick={startePruefung}
                  className="rounded-full bg-[#785BA3] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#654B8D]"
                >
                  Nochmal prüfen
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("vorbereiten")}
                  className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-tinte transition-colors hover:bg-papier-tief"
                >
                  Zurück zur Vorbereitung
                </button>
              </div>
            )}
          </div>
        }
        klaviaturVon={bereich.von}
        klaviaturBis={bereich.bis}
      />
    </div>
  );
}
