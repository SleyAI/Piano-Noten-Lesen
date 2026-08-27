"use client";

/**
 * Modus 1 — einzelne Noten lesen.
 *
 * Eine Note steht im Doppelsystem, gespielt wird sie am Klavier oder auf der
 * Klaviatur. Falsche Griffe kosten nichts: die Note pulsiert kurz in Flieder
 * und man darf weiter probieren, bis es sitzt.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import { NotenPaketWahl } from "@/components/practice/NotenPaketWahl";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { RundenAbschluss } from "@/components/practice/RundenAbschluss";
import { Fortschrittspunkte } from "@/components/practice/Fortschrittspunkte";
import {
  type SchluesselWahl,
  type UebungsNote,
  nachSchluessel,
  notenAusPaketen,
  uebungsSchluessel,
} from "@/lib/music/curriculum";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { gewichteteWahl } from "@/lib/practice/auswahl";
import { danebenAlsNote } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useNoteneingabe } from "@/lib/input/useNoteneingabe";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { useTricky } from "@/lib/store/tricky";

/** So viele Aufgaben ergeben eine Runde. */
const RUNDENLAENGE = 12;
/** Wie lange die richtige Note stehen bleibt, bevor die naechste kommt. */
const PAUSE_NACH_TREFFER = 650;
/** Wie lange ein Fehlgriff nachklingt. */
const PULS_DAUER = 1300;

/** Naechste Note ziehen: was hakt, kommt oefter dran, nie zweimal am Stueck. */
function zieheNote(
  vorrat: readonly UebungsNote[],
  vorherige: UebungsNote | null,
): UebungsNote | null {
  const gewicht = useTricky.getState().gewicht;
  return gewichteteWahl(
    vorrat,
    (u) => gewicht(uebungsSchluessel(u)),
    (u) => vorherige != null && uebungsSchluessel(u) === uebungsSchluessel(vorherige),
  );
}

export function EinzelnotenUebung() {
  const hydriert = useHydriert();
  const pakete = useEinstellungen((z) => z.notenPakete);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);

  if (!hydriert) return <div className="h-full bg-papier" />;

  // Der Key setzt die Runde neu auf, sobald sich die Auswahl aendert. Das
  // erledigt React selbst — ein Effekt wuerde den ersten Frame noch mit dem
  // alten Vorrat zeigen.
  return (
    <Runde
      key={`${pakete.join("|")}#${schluesselWahl}`}
      pakete={pakete}
      schluesselWahl={schluesselWahl}
      zeigeAuswahl={zeigeAuswahl}
      aufAuswahl={() => setZeigeAuswahl((z) => !z)}
    />
  );
}

function Runde({
  pakete,
  schluesselWahl,
  zeigeAuswahl,
  aufAuswahl,
}: {
  pakete: string[];
  schluesselWahl: SchluesselWahl;
  zeigeAuswahl: boolean;
  aufAuswahl: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const merkeFehler = useTricky((z) => z.merkeFehler);
  const starteRunde = useTricky((z) => z.starteRunde);

  const vorrat = useMemo(
    () => nachSchluessel(notenAusPaketen(pakete), schluesselWahl),
    [pakete, schluesselWahl],
  );
  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const [aufgabe, setAufgabe] = useState<UebungsNote | null>(() => zieheNote(vorrat, null));
  const [getroffen, setGetroffen] = useState(false);
  // Nur der letzte Fehlgriff — bei einer einzelnen Note ist das die klarste
  // Rueckmeldung.
  const [letzteFalsche, setLetzteFalsche] = useState<number | null>(null);
  const [erledigt, setErledigt] = useState(0);
  const [rundeVorbei, setRundeVorbei] = useState(false);

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  useEffect(() => {
    starteRunde();
  }, [starteRunde]);

  // Jede gestellte Aufgabe zaehlt als Versuch — das ist die Grundlage dafuer,
  // dass knifflige Noten spaeter oefter drankommen.
  const aufgabenSchluessel = aufgabe ? uebungsSchluessel(aufgabe) : null;
  useEffect(() => {
    if (aufgabe) merkeVersuch(uebungsSchluessel(aufgabe), nameMitOktave(aufgabe.note));
    // Nur beim Wechsel der Aufgabe, nicht bei jedem Rendern.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aufgabenSchluessel]);

  const naechsteAufgabe = useCallback((vorherige: UebungsNote | null) => {
    setAufgabe(zieheNote(vorrat, vorherige));
    setGetroffen(false);
    setLetzteFalsche(null);
  }, [vorrat]);

  useNoteneingabe((ereignis) => {
    if (ereignis.art !== "an" || !aufgabe || getroffen || rundeVorbei || zeigeAuswahl) return;

    if (ereignis.midi === aufgabe.note.midi) {
      setGetroffen(true);
      const stand = erledigt + 1;
      setErledigt(stand);

      uhren.current.push(
        window.setTimeout(() => {
          if (stand >= RUNDENLAENGE) setRundeVorbei(true);
          else naechsteAufgabe(aufgabe);
        }, PAUSE_NACH_TREFFER),
      );
      return;
    }

    merkeFehler(uebungsSchluessel(aufgabe), nameMitOktave(aufgabe.note));
    setLetzteFalsche(ereignis.midi);
    uhren.current.push(window.setTimeout(() => setLetzteFalsche(null), PULS_DAUER));
  });

  // Was stattdessen gespielt wurde — moeglichst im selben System wie die
  // Aufgabe, damit der Abstand direkt ablesbar ist.
  const danebenNote = useMemo(
    () => (letzteFalsche == null ? null : danebenAlsNote(letzteFalsche, aufgabe?.schluessel ?? null)),
    [letzteFalsche, aufgabe],
  );

  const spalten: NotenSpalte[] = aufgabe
    ? [
        {
          id: uebungsSchluessel(aufgabe),
          noten: [aufgabe],
          // Die erwartete Note bleibt ruhig stehen; der Fehlgriff pulsiert
          // daneben, statt die Aufgabe selbst einzufaerben.
          zustand: getroffen ? "richtig" : "ruhend",
          daneben: danebenNote ? [danebenNote] : undefined,
        },
      ]
    : [];

  const hervorgehoben = useMemo(() => {
    const karte = new Map<number, "mint" | "flieder" | "himmel">();
    if (letzteFalsche != null) karte.set(letzteFalsche, "flieder");
    if (getroffen && aufgabe) karte.set(aufgabe.note.midi, "mint");
    return karte;
  }, [letzteFalsche, getroffen, aufgabe]);

  function neueRunde() {
    starteRunde();
    setErledigt(0);
    setRundeVorbei(false);
    naechsteAufgabe(null);
  }

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Einzelne Noten"
        unterzeile={`${vorrat.length} Noten im Vorrat`}
        rechts={
          <>
            <Fortschrittspunkte gesamt={RUNDENLAENGE} erledigt={erledigt} />
            <button
              type="button"
              onClick={aufAuswahl}
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
      ) : rundeVorbei ? (
        <RundenAbschluss titel="Runde geschafft" aufNeueRunde={neueRunde} />
      ) : (
        <Uebungsflaeche
          notenbild={
            <Notensystem
              spalten={spalten}
              beschreibung={aufgabe ? `Diese Note spielen: ${nameMitOktave(aufgabe.note)}` : ""}
              className="h-full w-full"
            />
          }
          hinweis={
            getroffen ? (
              <span className="animate-auftauchen text-mint-tief">
                {aufgabe && nameMitOktave(aufgabe.note)} — genau die.
              </span>
            ) : letzteFalsche != null ? (
              <span className="text-flieder-tief">
                Das war {nameMitOktave(vonMidi(letzteFalsche))} — probier ruhig weiter.
              </span>
            ) : (
              <span className="text-tinte-leise">Welche Note ist das?</span>
            )
          }
          hervorgehoben={hervorgehoben}
          klaviaturVon={bereich.von}
          klaviaturBis={bereich.bis}
        />
      )}
    </div>
  );
}
