"use client";

/**
 * Einen Akkord lernen — und dieselbe Uebung fuer die Umkehrungen.
 *
 * Beide Modi arbeiten gleich: ein Akkord wird ausgesucht, sein Griff auf der
 * Tastatur gezeigt, und dann geht es durch mehrere Uebungen mit genau diesem
 * Material — der ganze Griff, derselbe Griff im Takt, gebrochen von unten nach
 * oben, und eine kleine Melodie aus seinen Toenen. Drei Tasten gleichzeitig zu
 * druecken ist eben noch kein Akkord, den man kennt.
 *
 * Der Unterschied zwischen den Modi liegt allein darin, welche Stellung zur
 * Wahl steht: beim Lernen auch die Grundstellung, im Umkehrungsreiter nur die
 * Umkehrungen. Beide Male ist es eine einzige Wahl — wer die erste Umkehrung
 * aussucht, uebt die erste Umkehrung und nicht vorher noch die Grundstellung.
 * "Alle zusammen" geht der Reihe nach durch.
 *
 * Beim Lernen sind die Uebungen ausserdem laenger, und ein Fehler setzt sie
 * an den Anfang zurueck — durch ist eine Uebung erst, wenn sie am Stueck
 * sitzt. Zaehlen die Notenwerte mit, gilt das auch fuer den Takt.
 *
 * Zwischen den Uebungen wird nicht gewartet: sitzt eine, kommt nach einem
 * Augenblick die naechste, und nach der letzten faengt die Runde mit frischen
 * Rhythmen wieder an. Aufgehoert wird, wenn man aufhoeren moechte.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Akkordbild } from "@/components/practice/Akkordbild";
import { Fortschrittspunkte } from "@/components/practice/Fortschrittspunkte";
import { HandWahl } from "@/components/practice/HandWahl";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { SchrittReihe } from "@/components/practice/SchrittReihe";
import { StartLeiste } from "@/components/practice/StartLeiste";
import { StellungsWahl } from "@/components/practice/StellungsWahl";
import { AkkordWahl } from "@/components/practice/AkkordWahl";
import { MetronomKnopf, TaktBand } from "@/components/practice/TaktBand";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import {
  type Akkord,
  type Haende,
  type Lage,
  type Stellung,
  akkordNachSymbol,
  lageBeschriftung,
  lageSchluessel,
  lagen as lagenVon,
  stellungenVon,
  umkehrungName,
  wirksameStellung,
} from "@/lib/music/akkorde";
import {
  type UebungsSchritt,
  type UebungsartId,
  UEBUNGSARTEN,
  UEBUNGSART_NACH_ID,
  baueUebung,
  midisDerUebung,
} from "@/lib/music/akkorduebung";
import { name, nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { danebenAlsNoten } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useMetronom } from "@/lib/practice/useMetronom";
import { useSchrittfolge } from "@/lib/practice/useSchrittfolge";
import { useVorspielen } from "@/lib/practice/useVorspielen";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";

/** Wie lange eine fertige Uebung stehen bleibt, bevor die naechste kommt. */
const PAUSE_NACH_UEBUNG = 1100;

/** Wie die Stellung in einem Satz heisst. */
function stellungText(stellung: Stellung): string {
  return stellung === "alle" ? "alle Stellungen" : umkehrungName(stellung);
}

/** Eine Station der Runde: diese Stellung, diese Uebungsart. */
interface Station {
  lage: Lage;
  art: UebungsartId;
}

export function AkkordLernen({ modus }: { modus: "lernen" | "umkehrungen" }) {
  const lernAkkord = useEinstellungen((z) => z.lernAkkord);
  const setzeLernAkkord = useEinstellungen((z) => z.setzeLernAkkord);
  const stellung = useEinstellungen((z) =>
    modus === "lernen" ? z.stellungLernen : z.stellungUmkehrung,
  );
  const uebungsarten = useEinstellungen((z) => z.uebungsarten);
  const haende = useEinstellungen((z) => z.akkordHaende);
  const tempo = useEinstellungen((z) => z.tempo);
  const taktGenau = useEinstellungen((z) => z.taktGenau);

  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);

  const akkord = lernAkkord ? akkordNachSymbol(lernAkkord) : undefined;

  // Ohne Akkord gibt es nichts zu üben — dann steht die Auswahl da.
  if (!akkord || zeigeAuswahl) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-2">
        <div className="flex flex-col gap-6">
          {akkord && <StellungsWahl akkord={akkord} modus={modus} />}
          <HandWahl />
          <UebungsartWahl />
          <TaktBand mitTaktpruefung />
          <AkkordWahl
            gewaehlt={akkord ? [akkord.id] : []}
            aufWahl={(a) => setzeLernAkkord(a.id)}
            ueberschrift={
              akkord
                ? "Ein anderer Akkord?"
                : modus === "lernen"
                  ? "Welchen Akkord möchtest du lernen?"
                  : "Von welchem Akkord die Umkehrungen?"
            }
          />
        </div>

        <StartLeiste
          text="Los geht’s!"
          bereit={akkord !== undefined}
          onClick={() => setZeigeAuswahl(false)}
          links={
            akkord ? (
              <span className="text-sm text-tinte-leise">
                {akkord.symbol} · {stellungText(wirksameStellung(akkord, stellung))}
              </span>
            ) : (
              <span className="text-sm text-tinte-leise">Erst einen Akkord aussuchen</span>
            )
          }
        />
      </div>
    );
  }

  return (
    <Runde
      // Neue Auswahl heisst frische Runde — das erledigt der Key.
      key={`${akkord.id}#${modus}#${stellung}#${uebungsarten.join("|")}#${haende}`}
      akkord={akkord}
      modus={modus}
      stellung={stellung}
      uebungsarten={uebungsarten}
      haende={haende}
      tempo={tempo}
      taktGenau={taktGenau}
      aufAuswahl={() => setZeigeAuswahl(true)}
    />
  );
}

function Runde({
  akkord,
  modus,
  stellung,
  uebungsarten,
  haende,
  tempo,
  taktGenau,
  aufAuswahl,
}: {
  akkord: Akkord;
  modus: "lernen" | "umkehrungen";
  stellung: Stellung;
  uebungsarten: UebungsartId[];
  haende: Haende;
  tempo: number;
  taktGenau: boolean;
  aufAuswahl: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const merkeFehler = useTricky((z) => z.merkeFehler);
  const starteRunde = useTricky((z) => z.starteRunde);
  const metronomAn = useEinstellungen((z) => z.metronomAn);

  useMetronom(metronomAn, tempo);

  // Stellung fuer Stellung, damit man einen Griff ganz durchhat, bevor der
  // naechste kommt. Bei einer einzelnen Stellung ist es genau eine.
  const stationen: Station[] = useMemo(() => {
    const lagen = lagenVon(akkord, stellungenVon(akkord, stellung));
    const arten = uebungsarten.length > 0 ? uebungsarten : ["griff" as UebungsartId];
    return lagen.flatMap((lage) => arten.map((art) => ({ lage, art })));
  }, [akkord, stellung, uebungsarten]);

  const [stationIndex, setStationIndex] = useState(0);
  /** Zaehlt die Durchgaenge — mit jedem werden die Rhythmen neu gewuerfelt. */
  const [durchgang, setDurchgang] = useState(0);
  const station = stationen[stationIndex] ?? stationen[0];

  // Beim Lernen zaehlt jede Uebung am Stueck; in den Umkehrungen darf die
  // Hand den naechsten Griff in Ruhe suchen.
  const lang = modus === "lernen";

  useEffect(() => {
    starteRunde();
  }, [starteRunde]);

  // Die Uebung wird einmal je Station gebaut — die Rhythmen sollen nicht bei
  // jedem Rendern neu gewuerfelt werden.
  const uebung = useMemo(
    () => baueUebung(station.lage, station.art, haende, lang),
    // `durchgang` wuerfelt sie zum Rundenbeginn absichtlich neu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [station, haende, lang, durchgang],
  );

  useEffect(() => {
    merkeVersuch(lageSchluessel(station.lage), lageBeschriftung(station.lage));
    // Nur beim Wechsel der Station.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationIndex]);

  const uhren = useRef<number[]>([]);
  useEffect(
    () => () => {
      for (const id of uhren.current) window.clearTimeout(id);
    },
    [],
  );

  const weiter = useCallback(() => {
    if (stationIndex + 1 < stationen.length) {
      setStationIndex(stationIndex + 1);
      return;
    }
    // Die Runde ist herum: von vorn, mit frisch gewuerfelten Rhythmen.
    setStationIndex(0);
    setDurchgang((d) => d + 1);
  }, [stationIndex, stationen.length]);

  const aufFertig = useCallback(() => {
    uhren.current.push(window.setTimeout(weiter, PAUSE_NACH_UEBUNG));
  }, [weiter]);

  const lauf = useSchrittfolge({
    schritte: uebung.schritte,
    aktiv: true,
    zurueckBeiFehler: lang,
    taktGenau,
    tempo,
    aufFehler: () => merkeFehler(lageSchluessel(station.lage), lageBeschriftung(station.lage)),
    aufFertig,
  });



  const klang = useMemo(
    () => uebung.schritte.map((s) => ({ midis: s.noten.map((n) => n.midi), wert: s.wert })),
    [uebung],
  );
  const vorspiel = useVorspielen(klang, tempo);

  // Der gezeigte Tastaturausschnitt bleibt ueber die ganze Runde derselbe —
  // sonst springt die Klaviatur bei jeder neuen Uebung.
  const bereich = useMemo(
    () =>
      klaviaturBereich(
        stationen.flatMap((s) => midisDerUebung(baueUebung(s.lage, "griff", haende).schritte)),
      ),
    [stationen, haende],
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

  const art = UEBUNGSART_NACH_ID.get(station.art);
  const aktuellerSchritt: UebungsSchritt | undefined = uebung.schritte[lauf.index];

  return (
    <>
      {/* Drei Spalten, damit das Akkordbild beim Wechsel der Uebung stehen
          bleibt statt mit der Textlaenge hin und her zu rutschen. */}
      <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-5 px-6 pt-1 pb-2">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex min-w-0 flex-col gap-1">
            {/* Welcher Griff dran ist, steht ganz vorn — beim Ueben von
                Umkehrungen ist genau das die Aufgabe. */}
            <span className="flex flex-wrap items-baseline gap-2">
              <span className="text-3xl leading-none font-bold text-tinte">
                {akkord.symbol}
              </span>
              <span className="rounded-full bg-flieder px-3 py-1 text-xs leading-none font-semibold text-tinte">
                {umkehrungName(station.lage.umkehrung)}
              </span>
              <span className="text-xs text-tinte-leise">
                {uebung.griff.rechts.length > 0
                  ? uebung.griff.rechts.map(name).join("–")
                  : uebung.griff.links.map(name).join("–")}
              </span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-sm leading-tight font-semibold text-tinte">
                {art?.titel}
              </span>
              <span className="truncate text-xs leading-tight text-tinte-leise">
                {art?.hinweis}
              </span>
            </span>
          </span>
          <PlayKnopf
            laeuft={vorspiel.laeuft}
            onClick={vorspiel.umschalten}
            titel="Übung einmal anhören"
          />
        </span>

        {/* Wie der Griff auf der Tastatur aussieht — beim Lernen der halbe Punkt. */}
        <Akkordbild
          griff={uebung.griff}
          umkehrung={station.lage.umkehrung}
          className="w-72"
        />

        <span className="flex items-center justify-end gap-3">
          <MetronomKnopf />
          <Fortschrittspunkte gesamt={stationen.length} erledigt={stationIndex} />
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
        </span>
      </div>

      <Uebungsflaeche
        notenbild={
          <SchrittReihe
            schritte={uebung.schritte}
            bassGrenze={uebung.bassGrenze}
            position={lauf.fertig ? uebung.schritte.length : lauf.index}
            daneben={danebenNoten}
            beschreibung={`${lageBeschriftung(station.lage)} — ${art?.titel}`}
          />
        }
        hinweis={
          lauf.fertig ? (
            <span className="animate-auftauchen text-mint-tief">
              {art?.titel} — sitzt. Gleich geht es weiter.
            </span>
          ) : lauf.daneben.size > 0 ? (
            <span className="text-flieder-tief">
              Das war {[...lauf.daneben].map((m) => nameMitOktave(vonMidi(m))).join(", ")}
              {lang ? " — noch einmal von vorn." : " — lass die Hand ruhig suchen."}
            </span>
          ) : lauf.takt ? (
            <span className="text-flieder-tief">
              {lauf.takt === "zu-kurz"
                ? "Der Griff davor stand zu kurz"
                : "Der Griff davor stand zu lange"}
              {lang ? " — noch einmal von vorn." : " — achte auf die Notenwerte."}
            </span>
          ) : (
            <span className="text-tinte-leise">
              Schritt {lauf.index + 1} von {uebung.schritte.length}
              {aktuellerSchritt && aktuellerSchritt.noten.length > 1
                ? ` · ${lauf.gespielt.size} von ${aktuellerSchritt.noten.length} Tönen`
                : ""}
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

// --- Auswahlbausteine -------------------------------------------------------

/** Welche Uebungen kommen zu jeder Stellung? */
function UebungsartWahl() {
  const gewaehlt = useEinstellungen((z) => z.uebungsarten);
  const schalten = useEinstellungen((z) => z.schalteUebungsart);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-tinte">Womit möchtest du üben?</h2>
      <div className="grid grid-cols-4 gap-2">
        {UEBUNGSARTEN.map((art) => {
          const an = gewaehlt.includes(art.id);
          return (
            <button
              key={art.id}
              type="button"
              role="checkbox"
              aria-checked={an}
              onClick={() => schalten(art.id)}
              className={`flex flex-col gap-1 rounded-2xl px-4 py-3 text-left transition-colors duration-200 ${
                an ? "bg-mint text-tinte" : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
              }`}
            >
              <span className="font-semibold">{art.titel}</span>
              <span className="text-xs leading-snug opacity-80">{art.hinweis}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
