"use client";

/**
 * Melodien spielen.
 *
 * Acht Toene, ausschliesslich aus den freigeschalteten Noten und nach
 * musikalischen Regeln gebaut. Ohne Runden und ohne Zaehlung: ist eine Melodie
 * durch, kommt die naechste. Man hoert auf, wenn man aufhoeren moechte.
 *
 * Drei Einstellungen bestimmen, wie schwer es wird: welches System (oder beide
 * gemischt), ob nur die weissen Tasten vorkommen und ob die Notenwerte
 * mitzaehlen. Ein Fehlgriff setzt die Melodie an den Anfang zurueck — durch
 * ist sie erst, wenn sie am Stueck sitzt.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { NotenReihe } from "@/components/practice/NotenReihe";
import { NotenWahl } from "@/components/practice/NotenWahl";
import { StartLeiste } from "@/components/practice/StartLeiste";
import { MetronomKnopf } from "@/components/practice/TaktBand";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import {
  type SchluesselWahl,
  type Tastenwahl,
  type UebungsNote,
  nachSchluessel,
  notenVorrat,
  uebungsSchluessel,
} from "@/lib/music/curriculum";
import { melodieSchluessel, wuerfleMelodie } from "@/lib/music/melodie";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { type NotenwertId, wuerfleRhythmus } from "@/lib/music/rhythmus";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useMetronom } from "@/lib/practice/useMetronom";
import { useReihenUebung } from "@/lib/practice/useReihenUebung";
import { useVorspielen } from "@/lib/practice/useVorspielen";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { useTricky } from "@/lib/store/tricky";

/** Wie lange die fertige Melodie stehen bleibt, bevor die naechste kommt. */
const PAUSE_NACH_MELODIE = 1200;

interface Aufgabe {
  melodie: UebungsNote[];
  werte: NotenwertId[] | undefined;
}

export function MelodienUebung() {
  const hydriert = useHydriert();
  const tastenwahl = useEinstellungen((z) => z.tastenwahl);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const notenwerteAn = useEinstellungen((z) => z.notenwerteAn);
  const tempo = useEinstellungen((z) => z.tempo);
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);

  if (!hydriert) return <div className="h-full bg-papier" />;

  // Geaenderte Auswahl heisst frischer Vorrat — das erledigt der Key.
  return (
    <Endlos
      key={`${tastenwahl}#${schluesselWahl}#${notenwerteAn}`}
      tastenwahl={tastenwahl}
      schluesselWahl={schluesselWahl}
      notenwerteAn={notenwerteAn}
      tempo={tempo}
      zeigeAuswahl={zeigeAuswahl}
      aufAuswahl={() => setZeigeAuswahl((z) => !z)}
    />
  );
}

function Endlos({
  tastenwahl,
  schluesselWahl,
  notenwerteAn,
  tempo,
  zeigeAuswahl,
  aufAuswahl,
}: {
  tastenwahl: Tastenwahl;
  schluesselWahl: SchluesselWahl;
  notenwerteAn: boolean;
  tempo: number;
  zeigeAuswahl: boolean;
  aufAuswahl: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const metronomAn = useEinstellungen((z) => z.metronomAn);

  useMetronom(metronomAn, tempo);

  const vorrat = useMemo(
    () => nachSchluessel(notenVorrat(tastenwahl), schluesselWahl),
    [tastenwahl, schluesselWahl],
  );

  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const wuerfeln = useCallback((): Aufgabe => {
    const melodie = wuerfleMelodie(vorrat, { mischen: schluesselWahl === "beide" });
    return {
      melodie,
      werte: notenwerteAn ? wuerfleRhythmus(melodie.length) : undefined,
    };
  }, [vorrat, schluesselWahl, notenwerteAn]);

  const [aufgabe, setAufgabe] = useState<Aufgabe>(wuerfeln);
  const { melodie, werte } = aufgabe;

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
    // Nur beim Wechsel der Melodie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kennung]);

  const neuWuerfeln = useCallback(() => setAufgabe(wuerfeln()), [wuerfeln]);

  // Durch? Dann kommt nach kurzer Pause einfach die naechste.
  const aufFertig = useCallback(() => {
    uhren.current.push(window.setTimeout(neuWuerfeln, PAUSE_NACH_MELODIE));
  }, [neuWuerfeln]);

  const uebung = useReihenUebung({
    reihe: melodie,
    werte,
    tempo,
    aktiv: !zeigeAuswahl,
    aufFertig,
  });

  const klang = useMemo(
    () =>
      melodie.map((ton, i) => ({
        midis: [ton.note.midi],
        wert: werte?.[i] ?? ("viertel" as NotenwertId),
      })),
    [melodie, werte],
  );
  const vorspiel = useVorspielen(klang, tempo);

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Melodien"
        unterzeile={
          melodie.length > 0
            ? `${melodie.length} Töne${notenwerteAn ? ", im 4/4-Takt" : ""}`
            : undefined
        }
        rechts={
          <>
            {!zeigeAuswahl && (
              <>
                <PlayKnopf
                  laeuft={vorspiel.laeuft}
                  onClick={vorspiel.umschalten}
                  titel="Melodie einmal anhören"
                />
                <MetronomKnopf />
                <button
                  type="button"
                  onClick={() => {
                    vorspiel.stoppen();
                    neuWuerfeln();
                  }}
                  className="rounded-full bg-himmel px-4 py-1.5 text-sm font-semibold text-tinte transition-colors hover:bg-himmel-tief"
                >
                  neu würfeln
                </button>
                <button
                  type="button"
                  onClick={() => {
                    vorspiel.stoppen();
                    aufAuswahl();
                  }}
                  className="rounded-full bg-papier-tief px-4 py-1.5 text-sm text-tinte transition-colors hover:bg-mint"
                >
                  Auswahl
                </button>
              </>
            )}
          </>
        }
      />

      {zeigeAuswahl ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-2">
          <NotenWahl />
          <StartLeiste
            text="Los geht’s!"
            onClick={() => {
              vorspiel.stoppen();
              neuWuerfeln();
              aufAuswahl();
            }}
            links={
              <span className="text-sm text-tinte-leise">
                Acht Töne{notenwerteAn ? ", im 4/4-Takt" : ""}
              </span>
            }
          />
        </div>
      ) : (
        <Uebungsflaeche
          notenbild={
            <NotenReihe
              reihe={melodie}
              werte={werte}
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
      <span className="animate-auftauchen text-mint-tief">
        Am Stück durch. Die nächste kommt gleich.
      </span>
    );
  }

  if (uebung.fehler) {
    const text =
      uebung.fehler.art === "ton"
        ? `Das war ${nameMitOktave(vonMidi(uebung.fehler.midi))}`
        : uebung.fehler.art === "zu-kurz"
          ? "Der Ton davor war zu kurz"
          : "Der Ton davor stand zu lange";
    return <span className="text-flieder-tief">{text} — noch einmal von vorn.</span>;
  }

  return (
    <span className="text-tinte-leise">
      Ton {uebung.position + 1} von {anzahl}
    </span>
  );
}
