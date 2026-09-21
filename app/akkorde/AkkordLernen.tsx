"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HandWahl } from "@/components/practice/HandWahl";
import { KuratierteAkkordWahl } from "@/components/practice/KuratierteAkkordWahl";
import { SchrittReihe } from "@/components/practice/SchrittReihe";
import { Uebungsflaeche } from "@/components/practice/Uebungsflaeche";
import {
  type Akkord,
  type Haende,
  akkordNachSymbol,
  anzahlUmkehrungen,
  lage,
  umkehrungName,
} from "@/lib/music/akkorde";
import { type UebungsSchritt, baueUebung } from "@/lib/music/akkorduebung";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useSchrittfolge } from "@/lib/practice/useSchrittfolge";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { AkkordVorbereitung } from "./AkkordVorbereitung";

const PAUSE_NACH_FOLGE = 1000;

interface InversionsSchritt extends UebungsSchritt {
  umkehrung: number;
}

function schritteFuerInversionen(
  akkord: Akkord,
  umkehrungFolge: number[],
  spielart: "griff" | "arpeggio",
  haende: Haende,
): { schritte: InversionsSchritt[]; bassGrenze: number } {
  const schritte: InversionsSchritt[] = [];
  let bassGrenze = Number.NEGATIVE_INFINITY;

  const art = spielart === "griff" ? "griff" : "gebrochen";

  umkehrungFolge.forEach((u) => {
    const l = lage(akkord, u);
    const gebaut = baueUebung(l, art, haende, false);
    bassGrenze = gebaut.bassGrenze;
    for (const schritt of gebaut.schritte) {
      schritte.push({ ...schritt, umkehrung: u });
    }
  });

  return { schritte, bassGrenze };
}

export function AkkordLernen() {
  const lernAkkord = useEinstellungen((z) => z.lernAkkord);
  const setzeLernAkkord = useEinstellungen((z) => z.setzeLernAkkord);
  const spielart = useEinstellungen((z) => z.inversionsSpielart);
  const setzeSpielart = useEinstellungen((z) => z.setzeInversionsSpielart);
  const haende = useEinstellungen((z) => z.akkordHaende);

  const [phase, setPhase] = useState<"vorbereitung" | "uebung">("vorbereitung");
  const [variation, setVariation] = useState(0);

  const akkord = useMemo(() => {
    return (lernAkkord ? akkordNachSymbol(lernAkkord) : null) ?? akkordNachSymbol("C")!;
  }, [lernAkkord]);

  const umkehrungsZahl = anzahlUmkehrungen(akkord);

  const naechsteVariation = useCallback(() => {
    setVariation((v) => v + 1);
  }, []);

  if (phase === "vorbereitung") {
    const eintraege = Array.from({ length: umkehrungsZahl + 1 }, (_, i) => ({
      id: String(i),
      titel: umkehrungName(i),
      lage: lage(akkord, i),
    }));

    return (
      <div className="flex flex-col items-center gap-6 py-4 overflow-y-auto">
        <KuratierteAkkordWahl
          gewaehlteId={akkord.id}
          aufWahl={(a) => {
            setzeLernAkkord(a.id);
          }}
        />

        {/* Spielart Selector: Ganzer Griff vs Arpeggio */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 rounded-full bg-papier-tief p-1.5">
            <button
              type="button"
              onClick={() => setzeSpielart("griff")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                spielart === "griff"
                  ? "bg-flieder text-tinte font-semibold shadow-sm"
                  : "text-tinte-leise hover:bg-white/60 hover:text-tinte"
              }`}
            >
              Ganzer Griff
            </button>
            <button
              type="button"
              onClick={() => setzeSpielart("arpeggio")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                spielart === "arpeggio"
                  ? "bg-flieder text-tinte font-semibold shadow-sm"
                  : "text-tinte-leise hover:bg-white/60 hover:text-tinte"
              }`}
            >
              Arpeggio
            </button>
          </div>
        </div>

        <HandWahl />

        <AkkordVorbereitung
          titel={`Inversionen für ${akkord.symbol}`}
          eintraege={eintraege}
          haende={haende}
          aufBereit={() => setPhase("uebung")}
        />
      </div>
    );
  }

  return (
    <InversionsLauf
      key={`${akkord.id}#${spielart}#${variation}#${haende}`}
      akkord={akkord}
      spielart={spielart}
      haende={haende}
      aufVorbereitung={() => setPhase("vorbereitung")}
      aufNaechste={naechsteVariation}
    />
  );
}

function InversionsLauf({
  akkord,
  spielart,
  haende,
  aufVorbereitung,
  aufNaechste,
}: {
  akkord: Akkord;
  spielart: "griff" | "arpeggio";
  haende: Haende;
  aufVorbereitung: () => void;
  aufNaechste: () => void;
}) {
  const maxU = anzahlUmkehrungen(akkord);

  // Erzeuge eine 8-Schritte-Folge der Umkehrungen
  const umkehrungsFolge = useMemo(() => {
    const folge: number[] = [];
    const verfuegbar = Array.from({ length: maxU + 1 }, (_, i) => i);
    while (folge.length < 8) {
      for (const u of verfuegbar) {
        if (folge.length < 8) folge.push(u);
      }
      // reverse sequence to keep flow interesting
      verfuegbar.reverse();
    }
    return folge;
  }, [maxU]);

  const { schritte, bassGrenze } = useMemo(
    () => schritteFuerInversionen(akkord, umkehrungsFolge, spielart, haende),
    [akkord, umkehrungsFolge, spielart, haende],
  );

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
    taktGenau: false,
    aufFertig,
  });

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

  const aktuelleUmkehrung = lauf.fertig
    ? umkehrungsFolge[umkehrungsFolge.length - 1]
    : (schritte[lauf.index]?.umkehrung ?? 0);

  const [namenSichtbar, setNamenSichtbar] = useState(false);

  return (
    <div className="flex flex-col h-full bg-papier">
      <div className="flex shrink-0 items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-tinte">
            {namenSichtbar ? akkord.symbol : "Akkord"}
          </span>
          {namenSichtbar && (
            <span className="rounded-full bg-[#FDE8D3] px-3 py-1 text-xs font-semibold text-[#E86518]">
              {umkehrungName(aktuelleUmkehrung)}
            </span>
          )}
          <span className="text-xs text-tinte-leise font-medium capitalize">
            {spielart === "griff" ? "Ganzer Griff" : "Arpeggio"}
          </span>

          <button
            type="button"
            onClick={() => setNamenSichtbar((v) => !v)}
            className="ml-2 rounded-full bg-white border border-[#E86518]/20 px-3 py-1 text-xs font-bold text-[#E86518] hover:bg-[#FDE8D3]/70 transition-colors"
          >
            {namenSichtbar ? "Name verbergen" : "Name einblenden"}
          </button>
        </div>

        <button
          type="button"
          onClick={aufVorbereitung}
          className="shrink-0 rounded-full bg-white border border-[#E86518]/20 px-5 py-2 text-sm font-semibold text-tinte transition-colors hover:bg-[#FDF5ED]"
        >
          Zurück zur Auswahl
        </button>
      </div>

      <Uebungsflaeche
        notenbild={
          <SchrittReihe
            schritte={schritte}
            bassGrenze={bassGrenze}
            position={lauf.fertig ? schritte.length : lauf.index}
            daneben={[]}
            mitWerten={false}
            beschreibung={`${akkord.symbol} — Inversionen`}
          />
        }
        hervorgehoben={hervorgehoben}
        klaviaturVon={bereich.von}
        klaviaturBis={bereich.bis}
      />
    </div>
  );
}
