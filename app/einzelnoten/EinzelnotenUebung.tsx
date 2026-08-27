"use client";

/**
 * Modus 1 — einzelne Noten lesen.
 *
 * Acht gewuerfelte Noten stehen im Doppelsystem, ein Cursor geht sie durch.
 * Anders als bei den Melodien folgen sie keiner musikalischen Linie: gezogen
 * wird nach Uebungsbedarf, was hakt kommt oefter dran.
 *
 * Falsche Griffe kosten nichts — die gespielte Note erscheint blass daneben,
 * und der Cursor wartet, bis es sitzt.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { NotenReihe } from "@/components/practice/NotenReihe";
import { NotenPaketWahl } from "@/components/practice/NotenPaketWahl";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { RundenAbschluss } from "@/components/practice/RundenAbschluss";
import {
  type SchluesselWahl,
  type UebungsNote,
  nachSchluessel,
  notenAusPaketen,
  uebungsSchluessel,
} from "@/lib/music/curriculum";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { gewichteteWahl } from "@/lib/practice/auswahl";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useReihenUebung } from "@/lib/practice/useReihenUebung";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { useTricky } from "@/lib/store/tricky";

/** So viele Noten stehen in einer Reihe. */
const REIHENLAENGE = 8;
/** Wie lange die volle Reihe stehen bleibt, bevor die Uebersicht kommt. */
const PAUSE_NACH_REIHE = 900;

/**
 * Acht Noten ziehen: was hakt, kommt oefter dran, und nie zweimal am Stueck
 * dieselbe — sonst tippt man beim zweiten Mal nur nach.
 */
function zieheReihe(vorrat: readonly UebungsNote[], anzahl: number): UebungsNote[] {
  const gewicht = useTricky.getState().gewicht;
  const reihe: UebungsNote[] = [];

  for (let i = 0; i < anzahl; i += 1) {
    const vorherige = reihe[i - 1] ?? null;
    const gezogen = gewichteteWahl(
      vorrat,
      (u) => gewicht(uebungsSchluessel(u)),
      (u) => vorherige != null && uebungsSchluessel(u) === uebungsSchluessel(vorherige),
    );
    if (!gezogen) break;
    reihe.push(gezogen);
  }

  return reihe;
}

export function EinzelnotenUebung() {
  const hydriert = useHydriert();
  const pakete = useEinstellungen((z) => z.notenPakete);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);

  if (!hydriert) return <div className="h-full bg-papier" />;

  // Der Key setzt die Uebung neu auf, sobald sich die Auswahl aendert.
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
  const starteRunde = useTricky((z) => z.starteRunde);

  const vorrat = useMemo(
    () => nachSchluessel(notenAusPaketen(pakete), schluesselWahl),
    [pakete, schluesselWahl],
  );
  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const [reihe, setReihe] = useState<UebungsNote[]>(() => zieheReihe(vorrat, REIHENLAENGE));
  const [uebersicht, setUebersicht] = useState(false);

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

  // Jede Note der Reihe zaehlt als Versuch, sobald sie erscheint.
  const kennung = reihe.map(uebungsSchluessel).join("|");
  useEffect(() => {
    for (const ton of reihe) {
      merkeVersuch(uebungsSchluessel(ton), nameMitOktave(ton.note));
    }
    // Nur beim Wechsel der Reihe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kennung]);

  const aufFertig = useCallback(() => {
    uhren.current.push(window.setTimeout(() => setUebersicht(true), PAUSE_NACH_REIHE));
  }, []);

  const uebung = useReihenUebung({
    reihe,
    aktiv: !zeigeAuswahl && !uebersicht,
    aufFertig,
  });

  function neueReihe() {
    starteRunde();
    setUebersicht(false);
    setReihe(zieheReihe(vorrat, REIHENLAENGE));
  }

  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Einzelne Noten"
        unterzeile={`${vorrat.length} Noten im Vorrat`}
        rechts={
          <>
            <button
              type="button"
              onClick={neueReihe}
              className="rounded-full bg-mint px-4 py-1.5 text-sm font-semibold text-tinte transition-colors hover:bg-mint-tief"
            >
              neue Noten
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
      ) : uebersicht ? (
        <RundenAbschluss titel="Acht Noten gelesen" aufNeueRunde={neueReihe} />
      ) : (
        <Uebungsflaeche
          notenbild={
            <NotenReihe
              reihe={reihe}
              position={uebung.position}
              danebenNote={uebung.danebenNote}
              beschreibung={`${reihe.length} einzelne Noten`}
            />
          }
          hinweis={
            uebung.fertig ? (
              <span className="animate-auftauchen text-mint-tief">Alle acht gelesen.</span>
            ) : uebung.letzteFalsche != null ? (
              <span className="text-flieder-tief">
                Das war {nameMitOktave(vonMidi(uebung.letzteFalsche))} — probier ruhig weiter.
              </span>
            ) : (
              <span className="text-tinte-leise">
                Note {uebung.position + 1} von {reihe.length}
              </span>
            )
          }
          hervorgehoben={
            uebung.letzteFalsche != null
              ? new Map([[uebung.letzteFalsche, "flieder" as const]])
              : undefined
          }
          klaviaturVon={bereich.von}
          klaviaturBis={bereich.bis}
        />
      )}
    </div>
  );
}
