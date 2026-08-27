"use client";

/**
 * Modus 2 — kurze Melodien spielen.
 *
 * Die Melodie besteht ausschliesslich aus freigeschalteten Noten. Ein Cursor
 * zeigt, wo man gerade ist; gespielte Toene bleiben mint stehen. Der
 * Wuerfel-Knopf liefert endlos neue Varianten.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { Notensystem, type NotenSpalte } from "@/components/notation/Notensystem";
import { NotenPaketWahl } from "@/components/practice/NotenPaketWahl";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { RundenAbschluss } from "@/components/practice/RundenAbschluss";
import { Fortschrittspunkte } from "@/components/practice/Fortschrittspunkte";
import { type UebungsNote, notenAusPaketen, uebungsSchluessel } from "@/lib/music/curriculum";
import { melodieSchluessel, wuerfleMelodie } from "@/lib/music/melodie";
import { nameMitOktave } from "@/lib/music/pitch";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useNoteneingabe } from "@/lib/input/useNoteneingabe";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { useTricky } from "@/lib/store/tricky";

/** So viele Melodien ergeben eine Runde. */
const RUNDENLAENGE = 5;
const PAUSE_NACH_MELODIE = 1000;
const PULS_DAUER = 1300;

export function MelodienUebung() {
  const hydriert = useHydriert();
  const pakete = useEinstellungen((z) => z.notenPakete);
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);

  if (!hydriert) return <div className="h-full bg-papier" />;

  // Geaenderte Auswahl heisst frische Runde — das erledigt der Key.
  return (
    <Runde
      key={pakete.join("|")}
      pakete={pakete}
      zeigeAuswahl={zeigeAuswahl}
      aufAuswahl={() => setZeigeAuswahl((z) => !z)}
    />
  );
}

function Runde({
  pakete,
  zeigeAuswahl,
  aufAuswahl,
}: {
  pakete: string[];
  zeigeAuswahl: boolean;
  aufAuswahl: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const merkeFehler = useTricky((z) => z.merkeFehler);
  const starteRunde = useTricky((z) => z.starteRunde);

  const vorrat = useMemo(() => notenAusPaketen(pakete), [pakete]);
  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const [melodie, setMelodie] = useState<UebungsNote[]>(() => wuerfleMelodie(vorrat));
  const [position, setPosition] = useState(0);
  const [daneben, setDaneben] = useState(false);
  const [falscheTasten, setFalscheTasten] = useState<Set<number>>(() => new Set());
  const [geschafft, setGeschafft] = useState(0);
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
    setDaneben(false);
    setFalscheTasten(new Set());
  }, [vorrat]);

  const fertig = melodie.length > 0 && position >= melodie.length;

  useNoteneingabe((ereignis) => {
    if (ereignis.art !== "an" || rundeVorbei || zeigeAuswahl || fertig) return;
    const erwartet = melodie[position];
    if (!erwartet) return;

    if (ereignis.midi === erwartet.note.midi) {
      const naechste = position + 1;
      setPosition(naechste);
      setFalscheTasten(new Set());
      setDaneben(false);

      if (naechste >= melodie.length) {
        const stand = geschafft + 1;
        setGeschafft(stand);
        uhren.current.push(
          window.setTimeout(() => {
            if (stand >= RUNDENLAENGE) setRundeVorbei(true);
            else wuerfeln();
          }, PAUSE_NACH_MELODIE),
        );
      }
      return;
    }

    merkeFehler(uebungsSchluessel(erwartet), nameMitOktave(erwartet.note));
    setDaneben(true);
    setFalscheTasten((s) => new Set(s).add(ereignis.midi));
    uhren.current.push(
      window.setTimeout(() => {
        setDaneben(false);
        setFalscheTasten(new Set());
      }, PULS_DAUER),
    );
  });

  const spalten: NotenSpalte[] = melodie.map((ton, i) => ({
    id: `${i}-${uebungsSchluessel(ton)}`,
    noten: [ton],
    zustand:
      i < position ? "richtig" : i === position ? (daneben ? "daneben" : "aktiv") : "ruhend",
  }));

  const hervorgehoben = useMemo(() => {
    const karte = new Map<number, "mint" | "flieder" | "himmel">();
    for (const midi of falscheTasten) karte.set(midi, "flieder");
    return karte;
  }, [falscheTasten]);

  function neueRunde() {
    starteRunde();
    setGeschafft(0);
    setRundeVorbei(false);
    wuerfeln();
  }

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Melodien"
        unterzeile={melodie.length > 0 ? `${melodie.length} Töne` : undefined}
        rechts={
          <>
            <Fortschrittspunkte gesamt={RUNDENLAENGE} erledigt={geschafft} />
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
      ) : rundeVorbei ? (
        <RundenAbschluss titel="Fünf Melodien geschafft" aufNeueRunde={neueRunde} />
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
            ) : daneben ? (
              <span className="text-flieder-tief">Noch nicht ganz — der Cursor wartet.</span>
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
