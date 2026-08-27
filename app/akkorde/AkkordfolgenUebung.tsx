"use client";

/**
 * Modus 3b — Akkordfolgen durchspielen.
 *
 * Vor dem Start steht der ganze Plan da: welcher Akkord in welcher Stellung.
 * Das ist der Punkt der Uebung — wer vorher weiss, wohin die Hand geht, spielt
 * die Folge fluessig statt sie Griff fuer Griff zu suchen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { RundenAbschluss } from "@/components/practice/RundenAbschluss";
import {
  type Lage,
  flottePlanung,
  gewaehlteAkkorde,
  griffImSystem,
  grundstellungsPlanung,
  lageBeschriftung,
  lageSchluessel,
  umkehrungName,
} from "@/lib/music/akkorde";
import {
  AKKORDFOLGEN,
  type Akkordfolge,
  akkordeDerFolge,
  fehlendeAkkorde,
  folgeSpielbar,
} from "@/lib/music/akkordfolgen";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { danebenAlsNoten } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useAkkordGriff } from "@/lib/practice/useAkkordGriff";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";

type Stellungswahl = "grundstellung" | "flott";
const PAUSE_NACH_TREFFER = 550;

export function AkkordfolgenUebung({ aufAuswahl }: { aufAuswahl: () => void }) {
  const pakete = useEinstellungen((z) => z.akkordPakete);
  const abgewaehlt = useEinstellungen((z) => z.abgewaehlteAkkorde);
  const umkehrungen = useEinstellungen((z) => z.umkehrungen);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const merkeFehler = useTricky((z) => z.merkeFehler);
  const starteRunde = useTricky((z) => z.starteRunde);

  const verfuegbar = useMemo(
    () => new Set(gewaehlteAkkorde(pakete, abgewaehlt).map((a) => a.symbol)),
    [pakete, abgewaehlt],
  );

  const [folge, setFolge] = useState<Akkordfolge | null>(null);
  const [stellungswahl, setStellungswahl] = useState<Stellungswahl>("flott");
  const [gestartet, setGestartet] = useState(false);
  const [position, setPosition] = useState(0);
  const [getroffen, setGetroffen] = useState(false);
  const [fertig, setFertig] = useState(false);

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  const plan: Lage[] = useMemo(() => {
    if (!folge) return [];
    const akkorde = akkordeDerFolge(folge);
    return stellungswahl === "flott"
      ? flottePlanung(akkorde, umkehrungen)
      : grundstellungsPlanung(akkorde);
  }, [folge, stellungswahl, umkehrungen]);

  const aktuelleLage = gestartet ? (plan[position] ?? null) : null;

  const starten = useCallback(() => {
    starteRunde();
    setGestartet(true);
    setPosition(0);
    setGetroffen(false);
    setFertig(false);
  }, [starteRunde]);

  useEffect(() => {
    if (aktuelleLage) {
      merkeVersuch(lageSchluessel(aktuelleLage), lageBeschriftung(aktuelleLage));
    }
    // Nur beim Wechsel des Akkords.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktuelleLage?.akkord.id, aktuelleLage?.umkehrung, position]);

  // Bei fester Schluesselwahl rutscht der Griff in die passende Oktavlage.
  const griffLage = useMemo(
    () => (aktuelleLage ? griffImSystem(aktuelleLage.toene, schluesselWahl) : null),
    [aktuelleLage, schluesselWahl],
  );

  const erwartet = useMemo(() => griffLage?.toene.map((t) => t.midi) ?? [], [griffLage]);

  const griff = useAkkordGriff({
    erwartet,
    aktiv: gestartet && !getroffen && !fertig,
    aufTreffer: () => {
      setGetroffen(true);
      uhren.current.push(
        window.setTimeout(() => {
          if (position + 1 >= plan.length) setFertig(true);
          else {
            setPosition((p) => p + 1);
            setGetroffen(false);
          }
        }, PAUSE_NACH_TREFFER),
      );
    },
    aufFehler: () => {
      if (aktuelleLage) {
        merkeFehler(lageSchluessel(aktuelleLage), lageBeschriftung(aktuelleLage));
      }
    },
  });

  const bereich = useMemo(
    () =>
      klaviaturBereich(
        plan.flatMap((l) => griffImSystem(l.toene, schluesselWahl).toene.map((t) => t.midi)),
      ),
    [plan, schluesselWahl],
  );

  const hervorgehoben = useMemo(() => {
    const karte = new Map<number, "mint" | "flieder" | "himmel">();
    for (const midi of griff.gespielt) karte.set(midi, "mint");
    for (const midi of griff.daneben) karte.set(midi, "flieder");
    return karte;
  }, [griff.gespielt, griff.daneben]);

  // --- Auswahl einer Folge --------------------------------------------------

  if (!folge || !gestartet) {
    return (
      <FolgenWahl
        verfuegbar={verfuegbar}
        gewaehlt={folge}
        stellungswahl={stellungswahl}
        setStellungswahl={setStellungswahl}
        plan={plan}
        aufFolge={setFolge}
        aufStart={starten}
        aufAuswahl={aufAuswahl}
      />
    );
  }

  if (fertig) {
    return (
      <RundenAbschluss
        titel={`${folge.titel} — durch`}
        aufNeueRunde={() => {
          setGestartet(false);
          setFertig(false);
        }}
      />
    );
  }

  const danebenNoten = danebenAlsNoten(griff.daneben, griffLage?.schluessel ?? null);
  const spalten: NotenSpalte[] = aktuelleLage && griffLage
    ? [
        {
          id: `${position}-${lageSchluessel(aktuelleLage)}`,
          noten: griffLage.toene.map((note) => ({ note, schluessel: griffLage.schluessel })),
          zustand: getroffen ? "richtig" : "ruhend",
          daneben: danebenNoten.length > 0 ? danebenNoten : undefined,
        },
      ]
    : [];

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 overflow-x-auto px-6 pb-1">
        {plan.map((l, i) => (
          <span
            key={`${i}-${l.akkord.id}`}
            aria-current={i === position ? "step" : undefined}
            className={`flex shrink-0 flex-col rounded-2xl px-3 py-1.5 transition-colors duration-300 ${
              i < position
                ? "bg-mint text-tinte"
                : i === position
                  ? "bg-himmel text-tinte"
                  : "bg-papier-tief text-tinte-leise"
            }`}
          >
            <span className="text-base leading-tight font-bold">{l.akkord.symbol}</span>
            <span className="text-[0.65rem] leading-tight opacity-75">
              {umkehrungName(l.umkehrung)}
            </span>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setGestartet(false)}
          className="ml-auto shrink-0 rounded-full bg-papier-tief px-4 py-1.5 text-sm text-tinte transition-colors hover:bg-mint"
        >
          andere Folge
        </button>
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
            <span className="animate-auftauchen text-mint-tief">Weiter zum nächsten.</span>
          ) : griff.daneben.size > 0 ? (
            <span className="text-flieder-tief">
              Das war {[...griff.daneben].map((m) => nameMitOktave(vonMidi(m))).join(", ")} —
              die Folge wartet.
            </span>
          ) : (
            <span className="text-tinte-leise">
              Akkord {position + 1} von {plan.length}
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

// --- Auswahl ----------------------------------------------------------------

function FolgenWahl({
  verfuegbar,
  gewaehlt,
  stellungswahl,
  setStellungswahl,
  plan,
  aufFolge,
  aufStart,
  aufAuswahl,
}: {
  verfuegbar: ReadonlySet<string>;
  gewaehlt: Akkordfolge | null;
  stellungswahl: Stellungswahl;
  setStellungswahl: (s: Stellungswahl) => void;
  plan: Lage[];
  aufFolge: (f: Akkordfolge) => void;
  aufStart: () => void;
  aufAuswahl: () => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-tinte">Welche Folge möchtest du spielen?</h2>
        <button
          type="button"
          onClick={aufAuswahl}
          className="rounded-full bg-papier-tief px-4 py-1.5 text-sm text-tinte transition-colors hover:bg-mint"
        >
          Akkordauswahl
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {AKKORDFOLGEN.map((folge) => {
          const spielbar = folgeSpielbar(folge, verfuegbar);
          const fehlt = fehlendeAkkorde(folge, verfuegbar);
          const aktiv = gewaehlt?.id === folge.id;
          return (
            <button
              key={folge.id}
              type="button"
              disabled={!spielbar}
              onClick={() => aufFolge(folge)}
              aria-pressed={aktiv}
              className={`flex flex-col gap-1 rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
                aktiv
                  ? "bg-mint text-tinte"
                  : spielbar
                    ? "bg-papier-tief text-tinte hover:bg-mint/40"
                    : "cursor-not-allowed bg-papier-tief/60 text-tinte-leise"
              }`}
            >
              <span className="font-semibold">{folge.titel}</span>
              <span className="text-xs leading-snug opacity-80">
                {spielbar ? folge.hinweis : `Es fehlen noch: ${fehlt.join(", ")}`}
              </span>
            </button>
          );
        })}
      </div>

      {gewaehlt && (
        <div className="animate-auftauchen mt-5 rounded-3xl bg-white px-6 py-5 shadow-[0_2px_16px_rgba(92,84,112,0.07)]">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-tinte">So wird gespielt</h3>
            <div className="flex gap-2">
              {(
                [
                  ["flott", "flüssige Fingerführung"],
                  ["grundstellung", "nur Grundstellung"],
                ] as const
              ).map(([wert, beschriftung]) => (
                <button
                  key={wert}
                  type="button"
                  aria-pressed={stellungswahl === wert}
                  onClick={() => setStellungswahl(wert)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    stellungswahl === wert
                      ? "bg-mint text-tinte"
                      : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
                  }`}
                >
                  {beschriftung}
                </button>
              ))}
            </div>
          </div>

          {/* Der ganze Plan vorab — darum geht es in diesem Modus. */}
          <ol className="mt-4 flex flex-wrap items-center gap-2">
            {plan.map((l, i) => (
              <li key={`${i}-${l.akkord.id}`} className="flex items-center gap-2">
                <span className="flex flex-col rounded-2xl bg-papier-tief px-4 py-2">
                  <span className="text-lg leading-tight font-bold text-tinte">
                    {l.akkord.symbol}
                  </span>
                  <span className="text-xs leading-tight text-tinte-leise">
                    {umkehrungName(l.umkehrung)}
                  </span>
                </span>
                {i < plan.length - 1 && <span className="text-tinte-leise">→</span>}
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={aufStart}
            className="mt-5 rounded-full bg-mint px-8 py-3 font-semibold text-tinte transition-colors hover:bg-mint-tief"
          >
            los geht’s
          </button>
        </div>
      )}
    </div>
  );
}
