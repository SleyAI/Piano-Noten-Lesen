"use client";

/**
 * Modus 3a — einzelne Akkorde mit ihren Umkehrungen.
 *
 * Ein Akkord wird nicht als Einzelaufgabe gestellt, sondern als kleine Reihe:
 * erst die Grundstellung, dann die Umkehrungen der Reihe nach. So merkt sich
 * die Hand die drei Griffe als Zusammenhang statt als drei fremde Formen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { Lagenband } from "@/components/practice/Lagenband";
import { RundenAbschluss } from "@/components/practice/RundenAbschluss";
import { Fortschrittspunkte } from "@/components/practice/Fortschrittspunkte";
import {
  type Akkord,
  type Lage,
  gewaehlteAkkorde,
  lageBeschriftung,
  lageSchluessel,
  lagen as lagenVon,
} from "@/lib/music/akkorde";
import { passenderSchluesselFuer } from "@/lib/music/pitch";
import { gewichteteWahl } from "@/lib/practice/auswahl";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useAkkordGriff } from "@/lib/practice/useAkkordGriff";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";

/** So viele Akkorde ergeben eine Runde. */
const RUNDENLAENGE = 4;
const PAUSE_NACH_TREFFER = 700;

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

  // Geaenderte Auswahl heisst frische Runde — das erledigt der Key.
  return (
    <Runde
      key={`${pakete.join("|")}#${abgewaehlt.join("|")}#${umkehrungen.join("|")}`}
      pakete={pakete}
      abgewaehlt={abgewaehlt}
      umkehrungen={umkehrungen}
      aufAuswahl={aufAuswahl}
    />
  );
}

function Runde({
  pakete,
  abgewaehlt,
  umkehrungen,
  aufAuswahl,
}: {
  pakete: string[];
  abgewaehlt: string[];
  umkehrungen: number[];
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

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

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

  const erwartet = useMemo(
    () => aktuelleLage?.toene.map((t) => t.midi) ?? [],
    [aktuelleLage],
  );

  const griff = useAkkordGriff({
    erwartet,
    aktiv: !getroffen && !rundeVorbei && aktuelleLage !== null,
    aufTreffer: () => {
      setGetroffen(true);
      uhren.current.push(
        window.setTimeout(() => {
          if (lagenIndex + 1 < reihe.length) {
            setLagenIndex((i) => i + 1);
            setGetroffen(false);
            return;
          }
          const stand = geschafft + 1;
          setGeschafft(stand);
          if (stand >= RUNDENLAENGE) setRundeVorbei(true);
          else naechsterAkkord(akkord);
        }, PAUSE_NACH_TREFFER),
      );
    },
    aufFehler: () => {
      if (aktuelleLage) {
        merkeFehler(lageSchluessel(aktuelleLage), lageBeschriftung(aktuelleLage));
      }
    },
  });

  const schluessel = aktuelleLage ? passenderSchluesselFuer(aktuelleLage.toene) : "violin";

  const spalten: NotenSpalte[] = aktuelleLage
    ? [
        {
          id: lageSchluessel(aktuelleLage),
          noten: aktuelleLage.toene.map((note) => ({ note, schluessel })),
          zustand: getroffen ? "richtig" : griff.daneben.size > 0 ? "daneben" : "ruhend",
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
    () => klaviaturBereich(vorrat.flatMap((a) => lagenVon(a).flatMap((l) => l.toene.map((t) => t.midi)))),
    [vorrat],
  );

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
            <span className="animate-auftauchen text-mint-tief">
              {aktuelleLage && lageBeschriftung(aktuelleLage)} — sitzt.
            </span>
          ) : griff.daneben.size > 0 ? (
            <span className="text-flieder-tief">Fast. Lass die Hand ruhig suchen.</span>
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
