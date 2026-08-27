"use client";

/**
 * Modus 2 — kurze Melodien spielen.
 *
 * Acht Toene, ausschliesslich aus den freigeschalteten Noten und nach
 * musikalischen Regeln gebaut. Ohne Runden und ohne Zaehlung: ist eine Melodie
 * durch, kommt die naechste. Man hoert auf, wenn man aufhoeren moechte.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { NotenReihe } from "@/components/practice/NotenReihe";
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
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useReihenUebung } from "@/lib/practice/useReihenUebung";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { useTricky } from "@/lib/store/tricky";

/** Wie lange die fertige Melodie stehen bleibt, bevor die naechste kommt. */
const PAUSE_NACH_MELODIE = 1000;

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

  const vorrat = useMemo(
    () => nachSchluessel(notenAusPaketen(pakete), schluesselWahl),
    [pakete, schluesselWahl],
  );
  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const [melodie, setMelodie] = useState<UebungsNote[]>(() => wuerfleMelodie(vorrat));

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
  }, [vorrat]);

  // Durch? Dann kommt nach kurzer Pause einfach die naechste.
  const aufFertig = useCallback(() => {
    uhren.current.push(window.setTimeout(wuerfeln, PAUSE_NACH_MELODIE));
  }, [wuerfeln]);

  const uebung = useReihenUebung({
    reihe: melodie,
    aktiv: !zeigeAuswahl,
    aufFertig,
  });

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
            <NotenReihe
              reihe={melodie}
              position={uebung.position}
              danebenNote={uebung.danebenNote}
              beschreibung={`Melodie aus ${melodie.length} Tönen`}
            />
          }
          hinweis={
            uebung.fertig ? (
              <span className="animate-auftauchen text-mint-tief">
                Durch. Die nächste kommt gleich.
              </span>
            ) : uebung.letzteFalsche != null ? (
              <span className="text-flieder-tief">
                Das war {nameMitOktave(vonMidi(uebung.letzteFalsche))} — der Cursor wartet.
              </span>
            ) : (
              <span className="text-tinte-leise">
                Ton {uebung.position + 1} von {melodie.length}
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
