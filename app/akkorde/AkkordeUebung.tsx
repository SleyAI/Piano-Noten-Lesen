"use client";

/**
 * Modus 3a — einzelne Akkorde mit ihren Umkehrungen.
 *
 * Ein Akkord wird nicht als Einzelaufgabe gestellt, sondern als kleine Reihe:
 * erst die Grundstellung, dann die Umkehrungen der Reihe nach. So merkt sich
 * die Hand die drei Griffe als Zusammenhang statt als drei fremde Formen.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { Lagenband } from "@/components/practice/Lagenband";
import { WeiterKnopf } from "@/components/practice/WeiterKnopf";
import { RundenAbschluss } from "@/components/practice/RundenAbschluss";
import { Fortschrittspunkte } from "@/components/practice/Fortschrittspunkte";
import {
  type Akkord,
  type Lage,
  gewaehlteAkkorde,
  griffImSystem,
  lageBeschriftung,
  lageSchluessel,
  lagen as lagenVon,
} from "@/lib/music/akkorde";
import { type SchluesselWahl, nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { gewichteteWahl } from "@/lib/practice/auswahl";
import { danebenAlsNoten } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useAkkordGriff } from "@/lib/practice/useAkkordGriff";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";

/** So viele Akkorde ergeben eine Runde. */
const RUNDENLAENGE = 4;

/** Naechsten Akkord ziehen: was hakt, kommt oefter dran. */
function zieheAkkord(vorrat: readonly Akkord[], vorheriger: Akkord | null): Akkord | null {
  const gewicht = useTricky.getState().gewicht;
  return gewichteteWahl(
    vorrat,
    (a) => gewicht(`akkord:${a.id}:0`),
    (a) => vorheriger != null && a.id === vorheriger.id,
  );
}

export function AkkordeUebung({ aufAuswahl }: { aufAuswahl: () => void }) {
  const pakete = useEinstellungen((z) => z.akkordPakete);
  const abgewaehlt = useEinstellungen((z) => z.abgewaehlteAkkorde);
  const umkehrungen = useEinstellungen((z) => z.umkehrungen);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);

  // Geaenderte Auswahl heisst frische Runde — das erledigt der Key.
  return (
    <Runde
      key={`${pakete.join("|")}#${abgewaehlt.join("|")}#${umkehrungen.join("|")}#${schluesselWahl}`}
      pakete={pakete}
      abgewaehlt={abgewaehlt}
      umkehrungen={umkehrungen}
      schluesselWahl={schluesselWahl}
      aufAuswahl={aufAuswahl}
    />
  );
}

function Runde({
  pakete,
  abgewaehlt,
  umkehrungen,
  schluesselWahl,
  aufAuswahl,
}: {
  pakete: string[];
  abgewaehlt: string[];
  umkehrungen: number[];
  schluesselWahl: SchluesselWahl;
  aufAuswahl: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const merkeFehler = useTricky((z) => z.merkeFehler);
  const starteRunde = useTricky((z) => z.starteRunde);

  const vorrat = useMemo(
    () => gewaehlteAkkorde(pakete, abgewaehlt),
    [pakete, abgewaehlt],
  );

  const [akkord, setAkkord] = useState<Akkord | null>(() => zieheAkkord(vorrat, null));
  const [lagenIndex, setLagenIndex] = useState(0);
  const [getroffen, setGetroffen] = useState(false);
  const [geschafft, setGeschafft] = useState(0);
  const [rundeVorbei, setRundeVorbei] = useState(false);

  const reihe: Lage[] = useMemo(
    () => (akkord ? lagenVon(akkord, umkehrungen) : []),
    [akkord, umkehrungen],
  );
  const aktuelleLage = reihe[lagenIndex] ?? null;

  const naechsterAkkord = useCallback(
    (vorheriger: Akkord | null) => {
      setAkkord(zieheAkkord(vorrat, vorheriger));
      setLagenIndex(0);
      setGetroffen(false);
    },
    [vorrat],
  );

  useEffect(() => {
    starteRunde();
  }, [starteRunde]);

  // Jede neue Lage wird als Versuch gezaehlt.
  useEffect(() => {
    if (aktuelleLage) {
      merkeVersuch(lageSchluessel(aktuelleLage), lageBeschriftung(aktuelleLage));
    }
    // Nur beim Wechsel der Lage, nicht bei jedem Rendern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktuelleLage?.akkord.id, aktuelleLage?.umkehrung]);

  // Bei fester Schluesselwahl rutscht der Griff in die passende Oktavlage —
  // sonst stuenden Akkorde im Bassschluessel auf drei Hilfslinien.
  const griff_ = useMemo(
    () => (aktuelleLage ? griffImSystem(aktuelleLage.toene, schluesselWahl) : null),
    [aktuelleLage, schluesselWahl],
  );

  const erwartet = useMemo(() => griff_?.toene.map((t) => t.midi) ?? [], [griff_]);

  const griff = useAkkordGriff({
    erwartet,
    aktiv: !getroffen && !rundeVorbei && aktuelleLage !== null,
    // Kein automatisches Weiterspringen: der Griff bleibt stehen, bis man
    // ihn von sich aus verlaesst.
    aufTreffer: () => setGetroffen(true),
    aufFehler: () => {
      if (aktuelleLage) {
        merkeFehler(lageSchluessel(aktuelleLage), lageBeschriftung(aktuelleLage));
      }
    },
  });

  const danebenNoten = useMemo(
    () => danebenAlsNoten(griff.daneben, griff_?.schluessel ?? null),
    [griff.daneben, griff_],
  );

  const spalten: NotenSpalte[] = aktuelleLage && griff_
    ? [
        {
          id: lageSchluessel(aktuelleLage),
          noten: griff_.toene.map((note) => ({ note, schluessel: griff_.schluessel })),
          zustand: getroffen ? "richtig" : "ruhend",
          daneben: danebenNoten.length > 0 ? danebenNoten : undefined,
        },
      ]
    : [];

  const hervorgehoben = useMemo(() => {
    const karte = new Map<number, "mint" | "flieder" | "himmel">();
    for (const midi of griff.gespielt) karte.set(midi, "mint");
    for (const midi of griff.daneben) karte.set(midi, "flieder");
    return karte;
  }, [griff.gespielt, griff.daneben]);

  const bereich = useMemo(
    () =>
      klaviaturBereich(
        vorrat.flatMap((a) =>
          lagenVon(a, umkehrungen).flatMap((l) =>
            griffImSystem(l.toene, schluesselWahl).toene.map((t) => t.midi),
          ),
        ),
      ),
    [vorrat, umkehrungen, schluesselWahl],
  );

  /** Naechste Umkehrung, naechster Akkord — oder Rundenende. */
  function weiter() {
    if (lagenIndex + 1 < reihe.length) {
      setLagenIndex((i) => i + 1);
      setGetroffen(false);
      return;
    }
    const stand = geschafft + 1;
    setGeschafft(stand);
    if (stand >= RUNDENLAENGE) setRundeVorbei(true);
    else naechsterAkkord(akkord);
  }

  function neueRunde() {
    starteRunde();
    setGeschafft(0);
    setRundeVorbei(false);
    naechsterAkkord(null);
  }

  if (rundeVorbei) {
    return <RundenAbschluss titel="Vier Akkorde durch" aufNeueRunde={neueRunde} />;
  }

  return (
    <>
      <div className="flex shrink-0 items-center justify-center gap-4 px-6 pb-1">
        <span className="text-3xl font-bold text-tinte">{akkord?.symbol}</span>
        <Lagenband lagen={reihe} aktuell={lagenIndex} />
        <span className="ml-auto flex items-center gap-3">
          <Fortschrittspunkte gesamt={RUNDENLAENGE} erledigt={geschafft} />
          <button
            type="button"
            onClick={aufAuswahl}
            className="rounded-full bg-papier-tief px-4 py-1.5 text-sm text-tinte transition-colors hover:bg-mint"
          >
            Auswahl
          </button>
        </span>
      </div>

      <Uebungsflaeche
        notenbild={
          <Notensystem
            spalten={spalten}
            beschreibung={aktuelleLage ? lageBeschriftung(aktuelleLage) : ""}
            className="h-full w-full"
          />
        }
        hinweis={
          getroffen ? (
            <span className="flex items-center gap-4">
              <span className="animate-auftauchen text-mint-tief">
                {aktuelleLage && lageBeschriftung(aktuelleLage)} — sitzt.
              </span>
              <WeiterKnopf
                text={lagenIndex + 1 < reihe.length ? "nächste Umkehrung" : "nächster Akkord"}
                onClick={weiter}
              />
            </span>
          ) : griff.daneben.size > 0 ? (
            <span className="text-flieder-tief">
              Das war {[...griff.daneben].map((m) => nameMitOktave(vonMidi(m))).join(", ")} —
              lass die Hand ruhig suchen.
            </span>
          ) : (
            <span className="text-tinte-leise">
              {griff.gespielt.size} von {erwartet.length} Tönen
            </span>
          )
        }
        hervorgehoben={hervorgehoben}
        klaviaturVon={bereich.von}
        klaviaturBis={bereich.bis}
      />
    </>
  );
}
