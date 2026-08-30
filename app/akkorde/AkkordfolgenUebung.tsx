"use client";

/**
 * Akkordfolgen durchspielen.
 *
 * Zwei Wege zu einer Folge: entweder einen Akkord aussuchen und sich die
 * harmonisch passenden Nachbarn dazu geben lassen — das sind die Akkorde,
 * mit denen er in praktisch jedem Lied zusammensteht —, oder selbst anhaken,
 * welche Akkorde vorkommen sollen.
 *
 * Eine Variation sind immer vier Akkorde. Ist sie durch, kommt die naechste:
 * andere Reihenfolge, andere Stellungen, dieselbe Auswahl. Es gibt keine
 * Zwischenbilanz und kein Ende der Runde — geuebt wird, bis man aufhoert.
 *
 * Gespielt wird als Bloecke, gebrochen oder gemischt. Der ganze Plan steht
 * ueber der Uebung: welcher Akkord in welcher Stellung. Das ist der Punkt —
 * wer vorher weiss, wohin die Hand geht, spielt die Folge fluessig statt sie
 * Griff fuer Griff zu suchen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AkkordWahl } from "@/components/practice/AkkordWahl";
import { HandWahl } from "@/components/practice/HandWahl";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { SchrittReihe } from "@/components/practice/SchrittReihe";
import { StartLeiste } from "@/components/practice/StartLeiste";
import { MetronomKnopf, TaktBand } from "@/components/practice/TaktBand";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import {
  type Akkord,
  type Haende,
  type Lage,
  akkordNachSymbol,
  flottePlanung,
  lageBeschriftung,
  lageSchluessel,
  umkehrungName,
} from "@/lib/music/akkorde";
import { type UebungsSchritt, baueUebung } from "@/lib/music/akkorduebung";
import { folgeUm, wuerfleFolge } from "@/lib/music/akkordfolgen";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { danebenAlsNoten } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useMetronom } from "@/lib/practice/useMetronom";
import { useSchrittfolge } from "@/lib/practice/useSchrittfolge";
import { useVorspielen } from "@/lib/practice/useVorspielen";
import { type Spielart, useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";

/** Wie lange die fertige Folge stehen bleibt, bevor die naechste kommt. */
const PAUSE_NACH_FOLGE = 1200;

/** Ein Schritt weiss, zu welchem Akkord der Folge er gehoert. */
interface FolgenSchritt extends UebungsSchritt {
  akkordIndex: number;
}

const SPIELARTEN: Array<{ wert: Spielart; titel: string; hinweis: string }> = [
  { wert: "block", titel: "als Blöcke", hinweis: "Jeder Akkord auf einen Schlag." },
  {
    wert: "gebrochen",
    titel: "gebrochen",
    hinweis: "Ton für Ton nach oben und zurück.",
  },
  {
    wert: "gemischt",
    titel: "gemischt",
    hinweis: "Abwechselnd — so bleibt die Folge in Bewegung.",
  },
];

/** Aus einem Plan die Schritte bauen, in der gewaehlten Spielart. */
function schritteAusPlan(
  plan: readonly Lage[],
  spielart: Spielart,
  haende: Haende,
): { schritte: FolgenSchritt[]; bassGrenze: number } {
  const schritte: FolgenSchritt[] = [];
  let bassGrenze = Number.NEGATIVE_INFINITY;

  plan.forEach((lage, akkordIndex) => {
    const art =
      spielart === "block"
        ? "griff"
        : spielart === "gebrochen"
          ? "gebrochen"
          : akkordIndex % 2 === 0
            ? "griff"
            : "gebrochen";
    const gebaut = baueUebung(lage, art, haende);
    bassGrenze = gebaut.bassGrenze;
    for (const schritt of gebaut.schritte) schritte.push({ ...schritt, akkordIndex });
  });

  return { schritte, bassGrenze };
}

export function AkkordfolgenUebung() {
  const quelle = useEinstellungen((z) => z.folgenQuelle);
  const setzeQuelle = useEinstellungen((z) => z.setzeFolgenQuelle);
  const lernAkkord = useEinstellungen((z) => z.lernAkkord);
  const setzeLernAkkord = useEinstellungen((z) => z.setzeLernAkkord);
  const folgenAkkorde = useEinstellungen((z) => z.folgenAkkorde);
  const schalteFolgenAkkord = useEinstellungen((z) => z.schalteFolgenAkkord);
  const spielart = useEinstellungen((z) => z.folgenSpielart);
  const setzeSpielart = useEinstellungen((z) => z.setzeFolgenSpielart);
  const haende = useEinstellungen((z) => z.akkordHaende);
  const tempo = useEinstellungen((z) => z.tempo);
  const taktGenau = useEinstellungen((z) => z.taktGenau);

  const [folge, setFolge] = useState<Akkord[] | null>(null);
  /** Zaehlt die Variationen mit — auch zwei gleiche sollen frisch anfangen. */
  const [variation, setVariation] = useState(0);

  /** Die Akkorde, aus denen die naechste Variation entsteht. */
  const grundlage = useMemo(() => {
    if (quelle === "passend") {
      return lernAkkord ? (akkordNachSymbol(lernAkkord) ?? null) : null;
    }
    const gewaehlt = folgenAkkorde
      .map((id) => akkordNachSymbol(id))
      .filter((a): a is Akkord => a !== undefined);
    return gewaehlt.length >= 2 ? gewaehlt : null;
  }, [quelle, lernAkkord, folgenAkkorde]);

  const bauen = useCallback(() => {
    if (!grundlage) return;
    const kette = Array.isArray(grundlage) ? wuerfleFolge(grundlage) : folgeUm(grundlage);
    setVariation((v) => v + 1);
    setFolge(kette.length >= 2 ? kette : null);
  }, [grundlage]);

  if (!folge) {
    return (
      <FolgenWahl
        quelle={quelle}
        setzeQuelle={setzeQuelle}
        lernAkkord={lernAkkord}
        setzeLernAkkord={setzeLernAkkord}
        folgenAkkorde={folgenAkkorde}
        schalteFolgenAkkord={schalteFolgenAkkord}
        spielart={spielart}
        setzeSpielart={setzeSpielart}
        bereit={grundlage !== null}
        aufStart={bauen}
      />
    );
  }

  return (
    <Lauf
      key={`${variation}#${spielart}#${haende}`}
      folge={folge}
      spielart={spielart}
      haende={haende}
      tempo={tempo}
      taktGenau={taktGenau}
      aufAndere={() => setFolge(null)}
      aufNaechste={bauen}
    />
  );
}

function Lauf({
  folge,
  spielart,
  haende,
  tempo,
  taktGenau,
  aufAndere,
  aufNaechste,
}: {
  folge: Akkord[];
  spielart: Spielart;
  haende: Haende;
  tempo: number;
  taktGenau: boolean;
  aufAndere: () => void;
  aufNaechste: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const merkeFehler = useTricky((z) => z.merkeFehler);
  const starteRunde = useTricky((z) => z.starteRunde);
  const metronomAn = useEinstellungen((z) => z.metronomAn);

  useMetronom(metronomAn, tempo);

  // Die Stimmfuehrung darf jede Stellung nehmen: sie waehlt die Lagen so, dass
  // die Finger moeglichst wenig wandern — genau das macht eine Folge spielbar,
  // und welche Umkehrung dabei herauskommt, steht ueber der Uebung.
  const plan = useMemo(() => flottePlanung(folge), [folge]);
  const { schritte, bassGrenze } = useMemo(
    () => schritteAusPlan(plan, spielart, haende),
    [plan, spielart, haende],
  );

  useEffect(() => {
    starteRunde();
    for (const lage of plan) merkeVersuch(lageSchluessel(lage), lageBeschriftung(lage));
    // Einmal je Variation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  const aufFertig = useCallback(() => {
    uhren.current.push(window.setTimeout(aufNaechste, PAUSE_NACH_FOLGE));
  }, [aufNaechste]);

  const lauf = useSchrittfolge({
    schritte,
    aktiv: true,
    taktGenau,
    tempo,
    aufFehler: (index) => {
      const lage = plan[schritte[index]?.akkordIndex ?? 0];
      if (lage) merkeFehler(lageSchluessel(lage), lageBeschriftung(lage));
    },
    aufFertig,
  });

  const klang = useMemo(
    () => schritte.map((s) => ({ midis: s.noten.map((n) => n.midi), wert: s.wert })),
    [schritte],
  );
  const vorspiel = useVorspielen(klang, tempo);

  const bereich = useMemo(
    () => klaviaturBereich(schritte.flatMap((s) => s.noten.map((n) => n.midi))),
    [schritte],
  );

  const hervorgehoben = useMemo(() => {
    const karte = new Map<number, "mint" | "flieder" | "himmel">();
    for (const midi of lauf.gespielt) karte.set(midi, "mint");
    for (const midi of lauf.daneben) karte.set(midi, "flieder");
    return karte;
  }, [lauf.gespielt, lauf.daneben]);

  const danebenNoten = useMemo(
    () =>
      danebenAlsNoten(
        lauf.daneben,
        haende === "beide" ? null : haende === "links" ? "bass" : "violin",
      ),
    [lauf.daneben, haende],
  );

  const aktuellerAkkord = lauf.fertig
    ? plan.length - 1
    : (schritte[lauf.index]?.akkordIndex ?? 0);

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 overflow-x-auto px-6 pb-2">
        <PlayKnopf
          laeuft={vorspiel.laeuft}
          onClick={vorspiel.umschalten}
          titel="Folge einmal anhören"
        />
        <MetronomKnopf />
        {plan.map((l, i) => (
          <span
            key={`${i}-${l.akkord.id}`}
            aria-current={i === aktuellerAkkord ? "step" : undefined}
            className={`flex shrink-0 flex-col rounded-2xl px-3 py-1.5 transition-colors duration-300 ${
              lauf.fertig || i < aktuellerAkkord
                ? "bg-mint text-tinte"
                : i === aktuellerAkkord
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
          onClick={() => {
            vorspiel.stoppen();
            aufAndere();
          }}
          className="ml-auto shrink-0 rounded-full bg-papier-tief px-4 py-1.5 text-sm text-tinte transition-colors hover:bg-mint"
        >
          aufhören
        </button>
      </div>

      <Uebungsflaeche
        notenbild={
          <SchrittReihe
            schritte={schritte}
            bassGrenze={bassGrenze}
            position={lauf.fertig ? schritte.length : lauf.index}
            daneben={danebenNoten}
            beschreibung={folge.map((a) => a.symbol).join(" – ")}
          />
        }
        hinweis={
          lauf.fertig ? (
            <span className="animate-auftauchen text-mint-tief">
              Durch. Die nächste Variation kommt gleich.
            </span>
          ) : lauf.daneben.size > 0 ? (
            <span className="text-flieder-tief">
              Das war {[...lauf.daneben].map((m) => nameMitOktave(vonMidi(m))).join(", ")} —
              die Folge wartet.
            </span>
          ) : lauf.takt ? (
            <span className="text-flieder-tief">
              {lauf.takt === "zu-kurz"
                ? "Der Akkord davor stand zu kurz"
                : "Der Akkord davor stand zu lange"}{" "}
              — achte auf die Notenwerte.
            </span>
          ) : (
            <span className="text-tinte-leise">
              {plan[aktuellerAkkord]?.akkord.symbol} · Schritt {lauf.index + 1} von{" "}
              {schritte.length}
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
  quelle,
  setzeQuelle,
  lernAkkord,
  setzeLernAkkord,
  folgenAkkorde,
  schalteFolgenAkkord,
  spielart,
  setzeSpielart,
  bereit,
  aufStart,
}: {
  quelle: ReturnType<typeof useEinstellungen.getState>["folgenQuelle"];
  setzeQuelle: (q: ReturnType<typeof useEinstellungen.getState>["folgenQuelle"]) => void;
  lernAkkord: string | null;
  setzeLernAkkord: (id: string) => void;
  folgenAkkorde: string[];
  schalteFolgenAkkord: (id: string) => void;
  spielart: Spielart;
  setzeSpielart: (s: Spielart) => void;
  bereit: boolean;
  aufStart: () => void;
}) {
  const passend = quelle === "passend";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-2">
      <div className="flex flex-col gap-6">
        <HandWahl />
        <TaktBand mitTaktpruefung />

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-tinte">Woher kommen die Akkorde?</h2>
          <div className="grid grid-cols-2 gap-2">
            <Kachel
              aktiv={passend}
              onClick={() => setzeQuelle("passend")}
              titel="Einer, und der Rest passt dazu"
              hinweis="Du suchst einen Akkord aus, die harmonisch passenden Nachbarn kommen von selbst."
            />
            <Kachel
              aktiv={!passend}
              onClick={() => setzeQuelle("auswahl")}
              titel="Ich hake selbst an"
              hinweis="Mindestens zwei Akkorde — daraus werden immer neue Vierergruppen gewürfelt."
            />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-tinte">Wie wird gespielt?</h2>
          <div className="grid grid-cols-3 gap-2">
            {SPIELARTEN.map((eintrag) => (
              <Kachel
                key={eintrag.wert}
                aktiv={spielart === eintrag.wert}
                onClick={() => setzeSpielart(eintrag.wert)}
                titel={eintrag.titel}
                hinweis={eintrag.hinweis}
              />
            ))}
          </div>
        </section>

        <AkkordWahl
          gewaehlt={passend ? (lernAkkord ? [lernAkkord] : []) : folgenAkkorde}
          aufWahl={(a) => (passend ? setzeLernAkkord(a.id) : schalteFolgenAkkord(a.id))}
          ueberschrift={
            passend
              ? "Um welchen Akkord soll es gehen?"
              : "Welche Akkorde sollen vorkommen?"
          }
          mehrfach={!passend}
        />

      </div>

      <StartLeiste
        text="Los geht’s!"
        bereit={bereit}
        onClick={aufStart}
        links={
          <span className="text-sm text-tinte-leise">
            {bereit
              ? "Vier Akkorde je Variation, endlos neue"
              : passend
                ? "Erst einen Akkord aussuchen"
                : "Mindestens zwei Akkorde anhaken"}
          </span>
        }
      />
    </div>
  );
}

function Kachel({
  aktiv,
  onClick,
  titel,
  hinweis,
}: {
  aktiv: boolean;
  onClick: () => void;
  titel: string;
  hinweis: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={aktiv}
      onClick={onClick}
      className={`flex flex-col gap-0.5 rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
        aktiv ? "bg-himmel text-tinte" : "bg-papier-tief text-tinte-leise hover:bg-himmel/40"
      }`}
    >
      <span className="font-semibold">{titel}</span>
      <span className="text-xs leading-snug opacity-80">{hinweis}</span>
    </button>
  );
}
