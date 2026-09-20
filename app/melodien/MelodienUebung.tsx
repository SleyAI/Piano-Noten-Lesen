"use client";

/**
 * Melodien spielen.
 *
 * Zwei Modi zur Auswahl:
 * 1. Fließend: Direkt vom Blatt spielen, ohne Notenwerte.
 * 2. Mit Vorbereitung: Melodie mit Notenwerten anhören, vorüben und mit "Let's check" prüfen.
 */

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { NotenReihe } from "@/components/practice/NotenReihe";
import { NotenWahl } from "@/components/practice/NotenWahl";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import {
  type Notenbereich,
  type SchluesselWahl,
  type Tastenwahl,
  type UebungsNote,
  nachSchluessel,
  notenVorrat,
  uebungsSchluessel,
} from "@/lib/music/curriculum";
import { melodieSchluessel, wuerfleMelodie } from "@/lib/music/melodie";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import type { NotenwertId } from "@/lib/music/rhythmus";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useReihenUebung } from "@/lib/practice/useReihenUebung";
import { useVorspielen } from "@/lib/practice/useVorspielen";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { useTricky } from "@/lib/store/tricky";
import { MelodienVorbereitung } from "./MelodienVorbereitung";

/** Wie lange die fertige Melodie stehen bleibt, bevor die nächste kommt. */
const PAUSE_NACH_MELODIE = 1200;

interface Aufgabe {
  melodie: UebungsNote[];
  werte: undefined;
}

export function MelodienUebung() {
  return (
    <Suspense fallback={<div className="h-full bg-papier" />}>
      <MelodienInhalt />
    </Suspense>
  );
}

function MelodienInhalt() {
  const hydriert = useHydriert();
  const searchParams = useSearchParams();
  const modusParam = searchParams.get("modus");

  const tastenwahl = useEinstellungen((z) => z.tastenwahl);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const notenbereich = useEinstellungen((z) => z.notenbereich);
  const melodieModus = useEinstellungen((z) => z.melodieModus);
  const setzeMelodieModus = useEinstellungen((z) => z.setzeMelodieModus);
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);

  useEffect(() => {
    if (modusParam === "vorbereitung" || modusParam === "fliessend") {
      setzeMelodieModus(modusParam);
    }
  }, [modusParam, setzeMelodieModus]);

  if (!hydriert) return <div className="h-full bg-papier" />;

  return (
    <div className="flex h-full flex-col bg-papier">
      {/* Modus-Umschalter oben */}
      <div className="flex justify-center pt-2 pb-1 shrink-0 bg-papier">
        <div className="inline-flex rounded-full bg-white p-1 shadow-[0_2px_10px_rgba(120,91,163,0.08)]">
          <button
            type="button"
            onClick={() => setzeMelodieModus("fliessend")}
            className={`rounded-full px-5 py-1.5 text-xs font-bold transition-all ${
              melodieModus === "fliessend"
                ? "bg-[#785BA3] text-white shadow-sm"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Fließend
          </button>
          <button
            type="button"
            onClick={() => setzeMelodieModus("vorbereitung")}
            className={`rounded-full px-5 py-1.5 text-xs font-bold transition-all ${
              melodieModus === "vorbereitung"
                ? "bg-[#785BA3] text-white shadow-sm"
                : "text-tinte-leise hover:text-tinte"
            }`}
          >
            Mit Vorbereitung
          </button>
        </div>
      </div>

      {melodieModus === "vorbereitung" ? (
        <MelodienVorbereitung
          key={`vorbereitung#${tastenwahl}#${schluesselWahl}#${notenbereich}`}
          tastenwahl={tastenwahl}
          schluesselWahl={schluesselWahl}
          notenbereich={notenbereich}
          zeigeAuswahl={zeigeAuswahl}
          aufAuswahl={() => setZeigeAuswahl((z) => !z)}
        />
      ) : (
        <Endlos
          key={`fliessend#${tastenwahl}#${schluesselWahl}#${notenbereich}`}
          tastenwahl={tastenwahl}
          schluesselWahl={schluesselWahl}
          notenbereich={notenbereich}
          zeigeAuswahl={zeigeAuswahl}
          aufAuswahl={() => setZeigeAuswahl((z) => !z)}
        />
      )}
    </div>
  );
}

function Endlos({
  tastenwahl,
  schluesselWahl,
  notenbereich,
  zeigeAuswahl,
  aufAuswahl,
}: {
  tastenwahl: Tastenwahl;
  schluesselWahl: SchluesselWahl;
  notenbereich: Notenbereich;
  zeigeAuswahl: boolean;
  aufAuswahl: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);

  const vorrat = useMemo(
    () => nachSchluessel(notenVorrat(tastenwahl, notenbereich), schluesselWahl),
    [tastenwahl, notenbereich, schluesselWahl],
  );

  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const wuerfeln = useCallback((): Aufgabe => {
    const melodie = wuerfleMelodie(vorrat, { mischen: schluesselWahl === "beide" });
    return {
      melodie,
      werte: undefined,
    };
  }, [vorrat, schluesselWahl]);

  const [aufgabe, setAufgabe] = useState<Aufgabe>(wuerfeln);
  const { melodie } = aufgabe;

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  // Jeder Ton der Melodie zaehlt als Versuch, sobald sie erscheint.
  const kennung = melodieSchluessel(melodie);
  useEffect(() => {
    for (const ton of melodie) {
      merkeVersuch(uebungsSchluessel(ton), nameMitOktave(ton.note));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kennung]);

  const neuWuerfeln = useCallback(() => setAufgabe(wuerfeln()), [wuerfeln]);

  // Durch? Dann kommt nach kurzer Pause einfach die nächste.
  const aufFertig = useCallback(() => {
    uhren.current.push(window.setTimeout(neuWuerfeln, PAUSE_NACH_MELODIE));
  }, [neuWuerfeln]);

  const uebung = useReihenUebung({
    reihe: melodie,
    aktiv: !zeigeAuswahl,
    aufFertig,
  });

  const klang = useMemo(
    () =>
      melodie.map((ton) => ({
        midis: [ton.note.midi],
        wert: "viertel" as NotenwertId,
      })),
    [melodie],
  );
  const vorspiel = useVorspielen(klang, 80);

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Melodien"
        unterzeile={melodie.length > 0 ? `${melodie.length} Töne` : undefined}
        rechts={
          <>
            {!zeigeAuswahl && (
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
                    neuWuerfeln();
                  }}
                  className="rounded-full bg-white shadow-[0_2px_10px_rgba(120,91,163,0.08)] px-4 py-1.5 text-sm font-semibold text-[#785BA3] transition-colors hover:bg-[#EADCF5]"
                >
                  neu würfeln
                </button>
                <button
                  type="button"
                  onClick={() => {
                    vorspiel.stoppen();
                    aufAuswahl();
                  }}
                  className="rounded-full bg-[#785BA3] shadow-[0_2px_10px_rgba(120,91,163,0.15)] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#654B8D]"
                >
                  Auswahl
                </button>
              </>
            )}
          </>
        }
      />

      {zeigeAuswahl ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-2">
          <NotenWahl />
          <div className="mt-auto max-w-xl mx-auto w-full pt-4">
            <button
              type="button"
              onClick={() => {
                vorspiel.stoppen();
                neuWuerfeln();
                aufAuswahl();
              }}
              className="w-full rounded-full bg-[#785BA3] py-3.5 font-semibold text-white shadow-[0_6px_20px_rgba(120,91,163,0.25)] transition-all duration-200 hover:bg-[#654B8D] hover:-translate-y-0.5"
            >
              Los geht’s!
            </button>
          </div>
        </div>
      ) : (
        <Uebungsflaeche
          notenbild={
            <NotenReihe
              reihe={melodie}
              position={uebung.position}
              daneben={
                uebung.danebenNote && uebung.fehler
                  ? { index: uebung.fehler.index, note: uebung.danebenNote }
                  : null
              }
              beschreibung={`Melodie aus ${melodie.length} Tönen`}
            />
          }
          hinweis={<Hinweis uebung={uebung} anzahl={melodie.length} />}
          hervorgehoben={
            uebung.fehler
              ? new Map([[uebung.fehler.midi, "flieder" as const]])
              : undefined
          }
          klaviaturVon={bereich.von}
          klaviaturBis={bereich.bis}
        />
      )}
    </div>
  );
}

function Hinweis({
  uebung,
  anzahl,
}: {
  uebung: ReturnType<typeof useReihenUebung>;
  anzahl: number;
}) {
  if (uebung.fertig) {
    return (
      <span className="animate-auftauchen text-mint-tief font-medium">
        Am Stück durch. Die nächste kommt gleich.
      </span>
    );
  }

  if (uebung.fehler) {
    const text = `Das war ${nameMitOktave(vonMidi(uebung.fehler.midi))}`;
    return <span className="text-[#785BA3] font-medium">{text} — noch einmal von vorn.</span>;
  }

  return (
    <span className="text-tinte-leise font-medium">
      Ton {uebung.position + 1} von {anzahl}
    </span>
  );
}
