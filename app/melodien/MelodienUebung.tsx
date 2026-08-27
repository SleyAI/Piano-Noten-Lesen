"use client";

/**
 * Modus 2 — kurze Melodien spielen.
 *
 * Ohne Runden und ohne Zaehlung: ist eine Melodie durch, kommt die naechste.
 * Man hoert auf, wenn man aufhoeren moechte, nicht wenn ein Zaehler voll ist.
 *
 * Die Melodie besteht ausschliesslich aus freigeschalteten Noten. Ein Cursor
 * zeigt, wo man gerade ist; gespielte Toene bleiben mint stehen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import { NotenPaketWahl } from "@/components/practice/NotenPaketWahl";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import {
  type SchluesselWahl,
  type UebungsNote,
  nachSchluessel,
  notenAusPaketen,
  uebungsSchluessel,
} from "@/lib/music/curriculum";
import { melodieSchluessel, wuerfleMelodie } from "@/lib/music/melodie";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { danebenAlsNote } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useNoteneingabe } from "@/lib/input/useNoteneingabe";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { useTricky } from "@/lib/store/tricky";

/** Wie lange die fertige Melodie stehen bleibt, bevor die naechste kommt. */
const PAUSE_NACH_MELODIE = 1000;
/** Wie lange ein Fehlgriff nachklingt. */
const PULS_DAUER = 1300;

export function MelodienUebung() {
  const hydriert = useHydriert();
  const pakete = useEinstellungen((z) => z.notenPakete);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);

  if (!hydriert) return <div className="h-full bg-papier" />;

  // Geaenderte Auswahl heisst frischer Vorrat — das erledigt der Key.
  return (
    <Endlos
      key={`${pakete.join("|")}#${schluesselWahl}`}
      pakete={pakete}
      schluesselWahl={schluesselWahl}
      zeigeAuswahl={zeigeAuswahl}
      aufAuswahl={() => setZeigeAuswahl((z) => !z)}
    />
  );
}

function Endlos({
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

  const vorrat = useMemo(
    () => nachSchluessel(notenAusPaketen(pakete), schluesselWahl),
    [pakete, schluesselWahl],
  );
  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const [melodie, setMelodie] = useState<UebungsNote[]>(() => wuerfleMelodie(vorrat));
  const [position, setPosition] = useState(0);
  const [letzteFalsche, setLetzteFalsche] = useState<number | null>(null);

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

  const wuerfeln = useCallback(() => {
    setMelodie(wuerfleMelodie(vorrat));
    setPosition(0);
    setLetzteFalsche(null);
  }, [vorrat]);

  const fertig = melodie.length > 0 && position >= melodie.length;

  useNoteneingabe((ereignis) => {
    if (ereignis.art !== "an" || zeigeAuswahl || fertig) return;
    const erwartet = melodie[position];
    if (!erwartet) return;

    if (ereignis.midi === erwartet.note.midi) {
      const naechste = position + 1;
      setPosition(naechste);
      setLetzteFalsche(null);

      // Durch? Dann kommt einfach die naechste Melodie.
      if (naechste >= melodie.length) {
        uhren.current.push(window.setTimeout(wuerfeln, PAUSE_NACH_MELODIE));
      }
      return;
    }

    merkeFehler(uebungsSchluessel(erwartet), nameMitOktave(erwartet.note));
    setLetzteFalsche(ereignis.midi);
    uhren.current.push(window.setTimeout(() => setLetzteFalsche(null), PULS_DAUER));
  });

  // Was stattdessen gespielt wurde, moeglichst im System der erwarteten Note.
  const danebenNote = useMemo(() => {
    if (letzteFalsche == null) return null;
    return danebenAlsNote(letzteFalsche, melodie[position]?.schluessel ?? null);
  }, [letzteFalsche, melodie, position]);

  const spalten: NotenSpalte[] = melodie.map((ton, i) => ({
    id: `${i}-${uebungsSchluessel(ton)}`,
    noten: [ton],
    zustand: i < position ? "richtig" : i === position ? "aktiv" : "ruhend",
    daneben: i === position && danebenNote ? [danebenNote] : undefined,
  }));

  const hervorgehoben = useMemo(() => {
    const karte = new Map<number, "mint" | "flieder" | "himmel">();
    if (letzteFalsche != null) karte.set(letzteFalsche, "flieder");
    return karte;
  }, [letzteFalsche]);

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Melodien"
        unterzeile={melodie.length > 0 ? `${melodie.length} Töne` : undefined}
        rechts={
          <>
            <button
              type="button"
              onClick={wuerfeln}
              className="rounded-full bg-himmel px-4 py-1.5 text-sm font-semibold text-tinte transition-colors hover:bg-himmel-tief"
            >
              neu würfeln
            </button>
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
      ) : (
        <Uebungsflaeche
          notenbild={
            <Notensystem
              spalten={spalten}
              beschreibung={`Melodie aus ${melodie.length} Tönen`}
              className="h-full w-full"
            />
          }
          hinweis={
            fertig ? (
              <span className="animate-auftauchen text-mint-tief">
                Durch. Die nächste kommt gleich.
              </span>
            ) : letzteFalsche != null ? (
              <span className="text-flieder-tief">
                Das war {nameMitOktave(vonMidi(letzteFalsche))} — der Cursor wartet.
              </span>
            ) : (
              <span className="text-tinte-leise">
                Ton {position + 1} von {melodie.length}
              </span>
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
