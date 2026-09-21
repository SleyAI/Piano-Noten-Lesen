"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { NotenReihe } from "@/components/practice/NotenReihe";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { SchnellLeiste } from "@/components/practice/SchnellLeiste";
import { LevelAuswahlModal } from "@/components/practice/LevelAuswahlModal";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { type NotenLevelId, notenFuerLevel } from "@/lib/music/levels";
import { erzeugeTonabfolge, melodieSchluessel } from "@/lib/music/melodie";
import { type SchluesselWahl, type UebungsNote, uebungsSchluessel } from "@/lib/music/curriculum";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import type { NotenwertId } from "@/lib/music/rhythmus";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useReihenUebung } from "@/lib/practice/useReihenUebung";
import { useVorspielen } from "@/lib/practice/useVorspielen";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";
import { useTricky } from "@/lib/store/tricky";

const PAUSE_NACH_MELODIE = 800;

interface Aufgabe {
  melodie: UebungsNote[];
  werte: undefined;
}

export function MelodienUebung() {
  const hydriert = useHydriert();

  const notenLevel = useEinstellungen((z) => z.notenLevel);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const abfolgeModus = useEinstellungen((z) => z.abfolgeModus);
  const startLevelGewaehlt = useEinstellungen((z) => z.startLevelGewaehlt);
  const setzeStartLevelGewaehlt = useEinstellungen((z) => z.setzeStartLevelGewaehlt);

  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const onboardingOffen = hydriert && !startLevelGewaehlt && !onboardingDismissed;

  if (!hydriert) return <div className="h-full bg-papier" />;

  return (
    <div className="flex h-full flex-col bg-papier">
      <Endlos
        key={`endlos#${notenLevel}#${schluesselWahl}#${abfolgeModus}`}
        notenLevel={notenLevel}
        schluesselWahl={schluesselWahl}
      />

      {/* Onboarding Dialog beim ersten Start */}
      <LevelAuswahlModal
        offen={onboardingOffen}
        aufSchliessen={() => {
          setOnboardingDismissed(true);
          setzeStartLevelGewaehlt(true);
        }}
        titel="Willkommen! Wähle dein Start-Level"
        hinweis="Mit welchem Level möchtest du starten? Du kannst es jederzeit anpassen."
      />
    </div>
  );
}

function Endlos({
  notenLevel,
  schluesselWahl,
}: {
  notenLevel: NotenLevelId;
  schluesselWahl: SchluesselWahl;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const abfolgeModus = useEinstellungen((z) => z.abfolgeModus);

  const vorrat = useMemo(
    () => notenFuerLevel(notenLevel, schluesselWahl),
    [notenLevel, schluesselWahl],
  );

  const bereich = useMemo(() => klaviaturBereich(vorrat.map((u) => u.note.midi)), [vorrat]);

  const wuerfeln = useCallback((): Aufgabe => {
    const melodie = erzeugeTonabfolge(vorrat, abfolgeModus, { mischen: schluesselWahl === "beide" });
    return {
      melodie,
      werte: undefined,
    };
  }, [vorrat, abfolgeModus, schluesselWahl]);

  const [aufgabe, setAufgabe] = useState<Aufgabe>(wuerfeln);
  const { melodie } = aufgabe;

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  const kennung = melodieSchluessel(melodie);
  useEffect(() => {
    for (const ton of melodie) {
      merkeVersuch(uebungsSchluessel(ton), nameMitOktave(ton.note));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kennung]);

  const neuWuerfeln = useCallback(() => setAufgabe(wuerfeln()), [wuerfeln]);

  const aufFertig = useCallback(() => {
    uhren.current.push(window.setTimeout(neuWuerfeln, PAUSE_NACH_MELODIE));
  }, [neuWuerfeln]);

  const uebung = useReihenUebung({
    reihe: melodie,
    aktiv: true,
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
        titel="Übe Notenlesen"
        unterzeile={melodie.length > 0 ? `${melodie.length} Töne` : undefined}
        rechts={
          <>
            <PlayKnopf
              laeuft={vorspiel.laeuft}
              onClick={vorspiel.umschalten}
              titel="Reihe einmal anhören"
            />
            <button
              type="button"
              onClick={() => {
                vorspiel.stoppen();
                neuWuerfeln();
              }}
              className="rounded-full bg-white shadow-xs px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#785BA3] transition-colors hover:bg-[#EADCF5]"
            >
              neu würfeln
            </button>
          </>
        }
      />

      {/* Schnell-Leiste für 1-Klick-Wechsel */}
      <SchnellLeiste onAenderung={neuWuerfeln} />

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
            beschreibung={`Reihe aus ${melodie.length} Tönen`}
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
        aktuelleNote={melodie[uebung.position] ?? null}
      />
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
        Geschafft! Die nächsten 8 Töne kommen sofort...
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
