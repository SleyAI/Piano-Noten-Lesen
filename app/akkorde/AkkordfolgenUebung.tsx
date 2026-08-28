"use client";

/**
 * Akkordfolgen durchspielen.
 *
 * Zwei Wege zu einer Folge: entweder einen Akkord aussuchen und sich die
 * harmonisch passenden Nachbarn dazu geben lassen — das sind die Akkorde,
 * mit denen er in praktisch jedem Lied zusammensteht —, oder selbst anhaken,
 * welche Akkorde vorkommen sollen.
 *
 * Gespielt wird als Bloecke, gebrochen oder gemischt. Vor dem Start steht der
 * ganze Plan da: welcher Akkord in welcher Stellung. Das ist der Punkt der
 * Uebung — wer vorher weiss, wohin die Hand geht, spielt die Folge fluessig
 * statt sie Griff fuer Griff zu suchen.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AkkordWahl } from "@/components/practice/AkkordWahl";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { RundenAbschluss } from "@/components/practice/RundenAbschluss";
import { SchrittReihe } from "@/components/practice/SchrittReihe";
import { SchluesselWahlBand } from "@/components/practice/SchluesselWahlBand";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import {
  type Akkord,
  type Lage,
  akkordNachSymbol,
  flottePlanung,
  lageBeschriftung,
  lageSchluessel,
  umkehrungName,
} from "@/lib/music/akkorde";
import { type UebungsSchritt, baueUebung } from "@/lib/music/akkorduebung";
import { folgeUm, wuerfleFolge } from "@/lib/music/akkordfolgen";
import { erlaubteAkkorde } from "@/lib/music/niveau";
import { type SchluesselWahl, nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { danebenAlsNoten } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useSchrittfolge } from "@/lib/practice/useSchrittfolge";
import { useVorspielen } from "@/lib/practice/useVorspielen";
import { type Spielart, useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";

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
  wahl: SchluesselWahl,
): { schritte: FolgenSchritt[]; schluessel: ReturnType<typeof baueUebung>["schluessel"] } {
  const schritte: FolgenSchritt[] = [];
  let schluessel: ReturnType<typeof baueUebung>["schluessel"] = "violin";

  plan.forEach((lage, akkordIndex) => {
    const art =
      spielart === "block"
        ? "griff"
        : spielart === "gebrochen"
          ? "gebrochen"
          : akkordIndex % 2 === 0
            ? "griff"
            : "gebrochen";
    const gebaut = baueUebung(lage, art, wahl);
    schluessel = gebaut.schluessel;
    for (const schritt of gebaut.schritte) schritte.push({ ...schritt, akkordIndex });
  });

  return { schritte, schluessel };
}

export function AkkordfolgenUebung() {
  const niveau = useEinstellungen((z) => z.niveau);
  const quelle = useEinstellungen((z) => z.folgenQuelle);
  const setzeQuelle = useEinstellungen((z) => z.setzeFolgenQuelle);
  const lernAkkord = useEinstellungen((z) => z.lernAkkord);
  const setzeLernAkkord = useEinstellungen((z) => z.setzeLernAkkord);
  const folgenAkkorde = useEinstellungen((z) => z.folgenAkkorde);
  const schalteFolgenAkkord = useEinstellungen((z) => z.schalteFolgenAkkord);
  const spielart = useEinstellungen((z) => z.folgenSpielart);
  const setzeSpielart = useEinstellungen((z) => z.setzeFolgenSpielart);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);
  const umkehrungen = useEinstellungen((z) => z.umkehrungen);

  const vorrat = useMemo(() => erlaubteAkkorde(niveau), [niveau]);
  const [folge, setFolge] = useState<Akkord[] | null>(null);

  /** Die Akkorde, aus denen die naechste Folge entsteht. */
  const grundlage = useMemo(() => {
    if (quelle === "passend") {
      const akkord = lernAkkord ? akkordNachSymbol(lernAkkord) : undefined;
      return akkord && vorrat.some((a) => a.id === akkord.id) ? akkord : null;
    }
    const gewaehlt = vorrat.filter((a) => folgenAkkorde.includes(a.id));
    return gewaehlt.length >= 2 ? gewaehlt : null;
  }, [quelle, lernAkkord, folgenAkkorde, vorrat]);

  const bauen = useCallback(() => {
    if (!grundlage) return;
    // Nur die Akkorde nehmen, die es auf diesem Niveau auch gibt — eine Folge
    // soll nicht an einem Akkord haengen, der hier noch gar nicht vorkommt.
    const erlaubt = new Set(vorrat.map((a) => a.id));
    const kette = Array.isArray(grundlage)
      ? wuerfleFolge(grundlage)
      : folgeUm(grundlage, erlaubt);
    setFolge(kette.length >= 2 ? kette : null);
  }, [grundlage, vorrat]);

  if (!folge) {
    return (
      <FolgenWahl
        niveau={niveau}
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
      key={`${folge.map((a) => a.id).join("-")}#${spielart}#${schluesselWahl}#${umkehrungen.join("|")}`}
      folge={folge}
      spielart={spielart}
      schluesselWahl={schluesselWahl}
      umkehrungen={umkehrungen}
      aufAndere={() => setFolge(null)}
      aufNochmal={bauen}
    />
  );
}

function Lauf({
  folge,
  spielart,
  schluesselWahl,
  umkehrungen,
  aufAndere,
  aufNochmal,
}: {
  folge: Akkord[];
  spielart: Spielart;
  schluesselWahl: SchluesselWahl;
  umkehrungen: number[];
  aufAndere: () => void;
  aufNochmal: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const merkeFehler = useTricky((z) => z.merkeFehler);
  const starteRunde = useTricky((z) => z.starteRunde);

  // Die Stimmfuehrung waehlt die Lagen so, dass die Finger moeglichst wenig
  // wandern — genau das macht eine Folge spielbar.
  const plan = useMemo(() => flottePlanung(folge, umkehrungen), [folge, umkehrungen]);
  const { schritte, schluessel } = useMemo(
    () => schritteAusPlan(plan, spielart, schluesselWahl),
    [plan, spielart, schluesselWahl],
  );

  const [fertig, setFertig] = useState(false);

  useEffect(() => {
    starteRunde();
    for (const lage of plan) merkeVersuch(lageSchluessel(lage), lageBeschriftung(lage));
    // Einmal je Folge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lauf = useSchrittfolge({
    schritte,
    aktiv: !fertig,
    aufFehler: (index) => {
      const lage = plan[schritte[index]?.akkordIndex ?? 0];
      if (lage) merkeFehler(lageSchluessel(lage), lageBeschriftung(lage));
    },
    aufFertig: () => setFertig(true),
  });

  const klang = useMemo(
    () => schritte.map((s) => ({ midis: s.noten.map((n) => n.midi), wert: s.wert })),
    [schritte],
  );
  const vorspiel = useVorspielen(klang);

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
    () => danebenAlsNoten(lauf.daneben, schluessel),
    [lauf.daneben, schluessel],
  );

  if (fertig) {
    return (
      <RundenAbschluss
        titel={`${folge.map((a) => a.symbol).join(" – ")} — durch`}
        aufNeueRunde={() => {
          setFertig(false);
          aufNochmal();
        }}
      />
    );
  }

  const aktuellerAkkord = schritte[lauf.index]?.akkordIndex ?? 0;

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 overflow-x-auto px-6 pb-2">
        <PlayKnopf
          laeuft={vorspiel.laeuft}
          onClick={vorspiel.umschalten}
          titel="Folge einmal anhören"
        />
        {plan.map((l, i) => (
          <span
            key={`${i}-${l.akkord.id}`}
            aria-current={i === aktuellerAkkord ? "step" : undefined}
            className={`flex shrink-0 flex-col rounded-2xl px-3 py-1.5 transition-colors duration-300 ${
              i < aktuellerAkkord
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
          andere Folge
        </button>
      </div>

      <Uebungsflaeche
        notenbild={
          <SchrittReihe
            schritte={schritte}
            schluessel={schluessel}
            position={lauf.index}
            daneben={danebenNoten}
            beschreibung={folge.map((a) => a.symbol).join(" – ")}
          />
        }
        hinweis={
          lauf.daneben.size > 0 ? (
            <span className="text-flieder-tief">
              Das war {[...lauf.daneben].map((m) => nameMitOktave(vonMidi(m))).join(", ")} —
              die Folge wartet.
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
  niveau,
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
  niveau: ReturnType<typeof useEinstellungen.getState>["niveau"];
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
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
      <div className="flex flex-col gap-6">
        <SchluesselWahlBand />

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
              hinweis="Mindestens zwei Akkorde — daraus wird eine Folge gewürfelt."
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
          niveau={niveau}
          gewaehlt={passend ? (lernAkkord ? [lernAkkord] : []) : folgenAkkorde}
          aufWahl={(a) => (passend ? setzeLernAkkord(a.id) : schalteFolgenAkkord(a.id))}
          ueberschrift={
            passend
              ? "Um welchen Akkord soll es gehen?"
              : "Welche Akkorde sollen vorkommen?"
          }
          mehrfach={!passend}
        />

        <button
          type="button"
          disabled={!bereit}
          onClick={aufStart}
          className="self-start rounded-full bg-mint px-8 py-3 font-semibold text-tinte transition-colors hover:bg-mint-tief disabled:cursor-not-allowed disabled:opacity-40"
        >
          {bereit
            ? "los geht’s"
            : passend
              ? "erst einen Akkord aussuchen"
              : "mindestens zwei Akkorde anhaken"}
        </button>
      </div>
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
