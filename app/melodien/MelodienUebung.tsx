"use client";

/**
 * Melodien spielen.
 *
 * Acht Toene, ausschliesslich aus den freigeschalteten Noten und nach
 * musikalischen Regeln gebaut. Ohne Runden und ohne Zaehlung: ist eine Melodie
 * durch, kommt die naechste. Man hoert auf, wenn man aufhoeren moechte.
 *
 * Zwei Einstellungen bestimmen, wie schwer es wird: welches System (oder beide
 * gemischt) und ob die Notenwerte mitzaehlen. Ein Fehlgriff setzt die Melodie
 * an den Anfang zurueck — durch ist sie erst, wenn sie am Stueck sitzt.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { NotenReihe } from "@/components/practice/NotenReihe";
import { NotenPaketWahl } from "@/components/practice/NotenPaketWahl";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import {
  type SchluesselWahl,
  type UebungsNote,
  nachSchluessel,
  notenAusPaketen,
  uebungsSchluessel,
} from "@/lib/music/curriculum";
import { melodieSchluessel, wuerfleMelodie } from "@/lib/music/melodie";
import { erlaubteNotenPakete } from "@/lib/music/niveau";
import type { Niveau } from "@/lib/music/niveau";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { type NotenwertId, wuerfleRhythmus } from "@/lib/music/rhythmus";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
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
  const niveau = useEinstellungen((z) => z.niveau);
  const pakete = useEinstellungen((z) => z.notenPakete);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const notenwerteAn = useEinstellungen((z) => z.notenwerteAn);
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);

  if (!hydriert) return <div className="h-full bg-papier" />;

  // Geaenderte Auswahl heisst frischer Vorrat — das erledigt der Key.
  return (
    <Endlos
      key={`${pakete.join("|")}#${schluesselWahl}#${notenwerteAn}#${niveau}`}
      niveau={niveau}
      pakete={pakete}
      schluesselWahl={schluesselWahl}
      notenwerteAn={notenwerteAn}
      zeigeAuswahl={zeigeAuswahl}
      aufAuswahl={() => setZeigeAuswahl((z) => !z)}
    />
  );
}

function Endlos({
  niveau,
  pakete,
  schluesselWahl,
  notenwerteAn,
  zeigeAuswahl,
  aufAuswahl,
}: {
  niveau: Niveau;
  pakete: string[];
  schluesselWahl: SchluesselWahl;
  notenwerteAn: boolean;
  zeigeAuswahl: boolean;
  aufAuswahl: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);

  // Das Niveau begrenzt den Vorrat, auch wenn ein Paket von frueher noch
  // angehakt ist — sonst tauchen im Anfaengermodus schwarze Tasten auf.
  const vorrat = useMemo(() => {
    const erlaubt = new Set(erlaubteNotenPakete(niveau).map((p) => p.id));
    return nachSchluessel(
      notenAusPaketen(pakete.filter((id) => erlaubt.has(id))),
      schluesselWahl,
    );
  }, [niveau, pakete, schluesselWahl]);

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
  const vorspiel = useVorspielen(klang);

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
              <PlayKnopf
                laeuft={vorspiel.laeuft}
                onClick={vorspiel.umschalten}
                titel="Melodie einmal anhören"
              />
            )}
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
              {zeigeAuswahl ? "weiter üben" : "Auswahl"}
            </button>
          </>
        }
      />

      {zeigeAuswahl ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <NotenPaketWahl />
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
