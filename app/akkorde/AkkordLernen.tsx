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
 * Der Unterschied zwischen den Modi liegt allein darin, welche Stellungen
 * drankommen: beim Lernen nur die Grundstellung, sonst die gewaehlten
 * Umkehrungen.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Akkordbild } from "@/components/practice/Akkordbild";
import { Fortschrittspunkte } from "@/components/practice/Fortschrittspunkte";
import { PlayKnopf } from "@/components/practice/PlayKnopf";
import { RundenAbschluss } from "@/components/practice/RundenAbschluss";
import { SchrittReihe } from "@/components/practice/SchrittReihe";
import { SchluesselWahlBand } from "@/components/practice/SchluesselWahlBand";
import { AkkordWahl } from "@/components/practice/AkkordWahl";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import { WeiterKnopf } from "@/components/practice/WeiterKnopf";
import {
  type Akkord,
  type Lage,
  akkordNachSymbol,
  anzahlUmkehrungen,
  lage as lageVon,
  lageBeschriftung,
  lageSchluessel,
  lagen as lagenVon,
  umkehrungName,
} from "@/lib/music/akkorde";
import {
  type UebungsSchritt,
  type UebungsartId,
  UEBUNGSARTEN,
  UEBUNGSART_NACH_ID,
  baueUebung,
  midisDerUebung,
} from "@/lib/music/akkorduebung";
import { erlaubteAkkorde } from "@/lib/music/niveau";
import { nameMitOktave, vonMidi } from "@/lib/music/pitch";
import { danebenAlsNoten } from "@/lib/practice/danebenNote";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useSchrittfolge } from "@/lib/practice/useSchrittfolge";
import { useVorspielen } from "@/lib/practice/useVorspielen";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useTricky } from "@/lib/store/tricky";

/** Eine Station der Runde: diese Stellung, diese Uebungsart. */
interface Station {
  lage: Lage;
  art: UebungsartId;
}

export function AkkordLernen({ modus }: { modus: "lernen" | "umkehrungen" }) {
  const niveau = useEinstellungen((z) => z.niveau);
  const lernAkkord = useEinstellungen((z) => z.lernAkkord);
  const setzeLernAkkord = useEinstellungen((z) => z.setzeLernAkkord);
  const umkehrungen = useEinstellungen((z) => z.umkehrungen);
  const uebungsarten = useEinstellungen((z) => z.uebungsarten);
  const schluesselWahl = useEinstellungen((z) => z.schluesselWahl);

  const [zeigeAuswahl, setZeigeAuswahl] = useState(false);
  const [runde, setRunde] = useState(0);

  const vorrat = useMemo(() => erlaubteAkkorde(niveau), [niveau]);
  const akkord = lernAkkord ? akkordNachSymbol(lernAkkord) : undefined;
  const bekannt = akkord && vorrat.some((a) => a.id === akkord.id) ? akkord : undefined;

  // Ohne Akkord gibt es nichts zu üben — dann steht die Auswahl da.
  if (!bekannt) {
    return (
      <Auswahl
        titel={
          modus === "lernen"
            ? "Welchen Akkord möchtest du lernen?"
            : "Von welchem Akkord die Umkehrungen?"
        }
        gewaehlt={null}
        aufWahl={(a) => setzeLernAkkord(a.id)}
      />
    );
  }

  if (zeigeAuswahl) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setZeigeAuswahl(false)}
            className="rounded-full bg-mint px-5 py-1.5 text-sm font-semibold text-tinte transition-colors hover:bg-mint-tief"
          >
            weiter üben
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <SchluesselWahlBand />
          {modus === "umkehrungen" && <StellungsWahl akkord={bekannt} />}
          <UebungsartWahl />
          <AkkordWahl
            niveau={niveau}
            gewaehlt={[bekannt.id]}
            aufWahl={(a) => setzeLernAkkord(a.id)}
            ueberschrift="Ein anderer Akkord?"
          />
        </div>
      </div>
    );
  }

  return (
    <Runde
      // Neue Auswahl heisst frische Runde — das erledigt der Key. `runde`
      // wuerfelt ausserdem die Rhythmen neu, wenn man noch einmal spielt.
      key={`${bekannt.id}#${modus}#${umkehrungen.join("|")}#${uebungsarten.join("|")}#${schluesselWahl}#${runde}`}
      akkord={bekannt}
      modus={modus}
      umkehrungen={umkehrungen}
      uebungsarten={uebungsarten}
      schluesselWahl={schluesselWahl}
      aufAuswahl={() => setZeigeAuswahl(true)}
      aufNeueRunde={() => setRunde((r) => r + 1)}
    />
  );
}

function Runde({
  akkord,
  modus,
  umkehrungen,
  uebungsarten,
  schluesselWahl,
  aufAuswahl,
  aufNeueRunde,
}: {
  akkord: Akkord;
  modus: "lernen" | "umkehrungen";
  umkehrungen: number[];
  uebungsarten: UebungsartId[];
  schluesselWahl: ReturnType<typeof useEinstellungen.getState>["schluesselWahl"];
  aufAuswahl: () => void;
  aufNeueRunde: () => void;
}) {
  const merkeVersuch = useTricky((z) => z.merkeVersuch);
  const merkeFehler = useTricky((z) => z.merkeFehler);
  const starteRunde = useTricky((z) => z.starteRunde);

  // Beim Lernen bleibt es bei der Grundstellung; erst der Umkehrungsmodus
  // faechert auf. Die Reihenfolge ist Stellung fuer Stellung, damit man einen
  // Griff ganz durchhat, bevor der naechste kommt.
  const stationen: Station[] = useMemo(() => {
    const lagen = modus === "lernen" ? [lageVon(akkord, 0)] : lagenVon(akkord, umkehrungen);
    const arten = uebungsarten.length > 0 ? uebungsarten : ["griff" as UebungsartId];
    return lagen.flatMap((lage) => arten.map((art) => ({ lage, art })));
  }, [akkord, modus, umkehrungen, uebungsarten]);

  const [stationIndex, setStationIndex] = useState(0);
  const [vorbei, setVorbei] = useState(false);
  const station = stationen[stationIndex] ?? stationen[0];

  useEffect(() => {
    starteRunde();
  }, [starteRunde]);

  // Die Uebung wird einmal je Station gebaut — die Rhythmen sollen nicht bei
  // jedem Rendern neu gewuerfelt werden.
  const uebung = useMemo(
    () => baueUebung(station.lage, station.art, schluesselWahl),
    [station, schluesselWahl],
  );

  useEffect(() => {
    merkeVersuch(lageSchluessel(station.lage), lageBeschriftung(station.lage));
    // Nur beim Wechsel der Station.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationIndex]);

  const lauf = useSchrittfolge({
    schritte: uebung.schritte,
    aktiv: !vorbei,
    aufFehler: () => merkeFehler(lageSchluessel(station.lage), lageBeschriftung(station.lage)),
  });

  const klang = useMemo(
    () => uebung.schritte.map((s) => ({ midis: s.noten.map((n) => n.midi), wert: s.wert })),
    [uebung],
  );
  const vorspiel = useVorspielen(klang);

  const bereich = useMemo(
    () =>
      klaviaturBereich(
        stationen.flatMap((s) =>
          midisDerUebung(baueUebung(s.lage, "griff", schluesselWahl).schritte),
        ),
      ),
    [stationen, schluesselWahl],
  );

  const hervorgehoben = useMemo(() => {
    const karte = new Map<number, "mint" | "flieder" | "himmel">();
    for (const midi of lauf.gespielt) karte.set(midi, "mint");
    for (const midi of lauf.daneben) karte.set(midi, "flieder");
    return karte;
  }, [lauf.gespielt, lauf.daneben]);

  const danebenNoten = useMemo(
    () => danebenAlsNoten(lauf.daneben, uebung.schluessel),
    [lauf.daneben, uebung.schluessel],
  );

  const weiter = useCallback(() => {
    vorspiel.stoppen();
    if (stationIndex + 1 < stationen.length) setStationIndex(stationIndex + 1);
    else setVorbei(true);
  }, [stationIndex, stationen.length, vorspiel]);

  if (vorbei) {
    return (
      <RundenAbschluss
        titel={
          modus === "lernen"
            ? `${akkord.symbol} von allen Seiten`
            : `${akkord.symbol} in allen gewählten Stellungen`
        }
        aufNeueRunde={() => {
          setVorbei(false);
          setStationIndex(0);
          aufNeueRunde();
        }}
      />
    );
  }

  const art = UEBUNGSART_NACH_ID.get(station.art);
  const aktuellerSchritt: UebungsSchritt | undefined = uebung.schritte[lauf.index];

  return (
    <>
      {/* Drei Spalten, damit das Akkordbild beim Wechsel der Uebung stehen
          bleibt statt mit der Textlaenge hin und her zu rutschen. */}
      <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-5 px-6 pt-1 pb-2">
        <span className="flex min-w-0 items-center gap-3">
          <span className="text-3xl leading-none font-bold text-tinte">{akkord.symbol}</span>
          <span className="flex flex-col">
            <span className="text-sm leading-tight font-semibold text-tinte">{art?.titel}</span>
            <span className="text-xs leading-tight text-tinte-leise">
              {umkehrungName(station.lage.umkehrung)} · {art?.hinweis}
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
          toene={baueUebung(station.lage, "griff", schluesselWahl).schritte[0].noten}
          umkehrung={station.lage.umkehrung}
          schluessel={uebung.schluessel}
          className="w-72"
        />

        <span className="flex items-center justify-end gap-3">
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
            schluessel={uebung.schluessel}
            position={lauf.fertig ? uebung.schritte.length : lauf.index}
            daneben={danebenNoten}
            beschreibung={`${lageBeschriftung(station.lage)} — ${art?.titel}`}
          />
        }
        hinweis={
          lauf.fertig ? (
            <span className="flex items-center gap-4">
              <span className="animate-auftauchen text-mint-tief">
                {art?.titel} — sitzt.
              </span>
              <WeiterKnopf
                text={
                  stationIndex + 1 < stationen.length ? "nächste Übung" : "Runde abschließen"
                }
                onClick={weiter}
              />
            </span>
          ) : lauf.daneben.size > 0 ? (
            <span className="text-flieder-tief">
              Das war {[...lauf.daneben].map((m) => nameMitOktave(vonMidi(m))).join(", ")} —
              lass die Hand ruhig suchen.
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

function Auswahl({
  titel,
  gewaehlt,
  aufWahl,
}: {
  titel: string;
  gewaehlt: string | null;
  aufWahl: (akkord: Akkord) => void;
}) {
  const niveau = useEinstellungen((z) => z.niveau);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
      <AkkordWahl
        niveau={niveau}
        gewaehlt={gewaehlt ? [gewaehlt] : []}
        aufWahl={aufWahl}
        ueberschrift={titel}
      />
    </div>
  );
}

/** Welche Stellungen kommen dran? */
function StellungsWahl({ akkord }: { akkord: Akkord }) {
  const umkehrungen = useEinstellungen((z) => z.umkehrungen);
  const schalten = useEinstellungen((z) => z.schalteUmkehrung);
  const setzen = useEinstellungen((z) => z.setzeUmkehrungen);

  const moeglich = Array.from({ length: anzahlUmkehrungen(akkord) + 1 }, (_, i) => i);
  const nurUmkehrungen = moeglich.filter((s) => s > 0);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-tinte">Welche Stellungen?</h2>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setzen(nurUmkehrungen)}
            className="rounded-full bg-papier-tief px-3 py-1 text-tinte-leise transition-colors hover:bg-mint"
          >
            nur die Umkehrungen
          </button>
          <button
            type="button"
            onClick={() => setzen(moeglich)}
            className="rounded-full bg-papier-tief px-3 py-1 text-tinte-leise transition-colors hover:bg-mint"
          >
            alle, mit Grundstellung
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {moeglich.map((stufe) => (
          <button
            key={stufe}
            type="button"
            role="checkbox"
            aria-checked={umkehrungen.includes(stufe)}
            onClick={() => schalten(stufe)}
            className={`rounded-2xl px-4 py-2 text-sm transition-colors duration-200 ${
              umkehrungen.includes(stufe)
                ? "bg-mint text-tinte"
                : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
            }`}
          >
            {umkehrungName(stufe)}
          </button>
        ))}
      </div>
    </section>
  );
}

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
