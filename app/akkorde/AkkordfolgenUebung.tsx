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
  lage,
} from "@/lib/music/akkorde";
import { type UebungsSchritt, baueUebung } from "@/lib/music/akkorduebung";
import { stabileViererFolge, wuerfleFolge } from "@/lib/music/akkordfolgen";
import { klaviaturBereich } from "@/lib/practice/klaviaturbereich";
import { useSchrittfolge } from "@/lib/practice/useSchrittfolge";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { AkkordVorbereitung } from "./AkkordVorbereitung";

const PAUSE_NACH_FOLGE = 1000;

interface FolgenSchritt extends UebungsSchritt {
  akkordIndex: number;
}

function schritteAusKette(
  kette: readonly Akkord[],
  haende: Haende,
): { schritte: FolgenSchritt[]; bassGrenze: number } {
  const schritte: FolgenSchritt[] = [];
  let bassGrenze = Number.NEGATIVE_INFINITY;

  kette.forEach((akkord, akkordIndex) => {
    const l = lage(akkord, 0); // Grundstellung
    const gebaut = baueUebung(l, "griff", haende, false);
    bassGrenze = gebaut.bassGrenze;
    for (const schritt of gebaut.schritte) {
      schritte.push({ ...schritt, akkordIndex });
    }
  });

  return { schritte, bassGrenze };
}

export function AkkordfolgenUebung() {
  const lernAkkord = useEinstellungen((z) => z.lernAkkord);
  const setzeLernAkkord = useEinstellungen((z) => z.setzeLernAkkord);
  const haende = useEinstellungen((z) => z.akkordHaende);

  const [phase, setPhase] = useState<"vorbereitung" | "uebung">("vorbereitung");
  const [variation, setVariation] = useState(0);

  const akkord = useMemo(() => {
    return (lernAkkord ? akkordNachSymbol(lernAkkord) : null) ?? akkordNachSymbol("C")!;
  }, [lernAkkord]);

  const vierAkkorde = useMemo(() => {
    return stabileViererFolge(akkord);
  }, [akkord]);

  const naechsteVariation = useCallback(() => {
    setVariation((v) => v + 1);
  }, []);

  if (phase === "vorbereitung") {
    const eintraege = vierAkkorde.map((a) => ({
      id: a.id,
      titel: a.symbol,
      lage: lage(a, 0),
    }));

    return (
      <div className="flex flex-col items-center gap-6 py-4 overflow-y-auto">
        <KuratierteAkkordWahl
          gewaehlteId={akkord.id}
          aufWahl={(a) => {
            setzeLernAkkord(a.id);
          }}
        />

        <HandWahl />

        <AkkordVorbereitung
          titel={`Passende Akkordfolge: ${vierAkkorde.map((a) => a.symbol).join(" – ")}`}
          eintraege={eintraege}
          haende={haende}
          aufBereit={() => setPhase("uebung")}
        />
      </div>
    );
  }

  return (
    <Lauf
      key={`${akkord.id}#${variation}#${haende}`}
      vierAkkorde={vierAkkorde}
      haende={haende}
      aufVorbereitung={() => setPhase("vorbereitung")}
      aufNaechste={naechsteVariation}
    />
  );
}

function Lauf({
  vierAkkorde,
  haende,
  aufVorbereitung,
  aufNaechste,
}: {
  vierAkkorde: Akkord[];
  haende: Haende;
  aufVorbereitung: () => void;
  aufNaechste: () => void;
}) {
  // 8 Schläge/Schritte in variierender Reihenfolge
  const kette = useMemo(() => wuerfleFolge(vierAkkorde, 8), [vierAkkorde]);
  const { schritte, bassGrenze } = useMemo(() => schritteAusKette(kette, haende), [kette, haende]);

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

  const [namenSichtbar, setNamenSichtbar] = useState(false);

  const aktuellerAkkord = lauf.fertig
    ? kette.length - 1
    : (schritte[lauf.index]?.akkordIndex ?? 0);

  return (
    <div className="flex flex-col h-full bg-papier">
      <div className="flex shrink-0 items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {kette.map((a, i) => {
            const gespielt = lauf.fertig || i < aktuellerAkkord;
            const istAktiv = i === aktuellerAkkord;
            const text = namenSichtbar || gespielt ? a.symbol : String(i + 1);

            return (
              <span
                key={`${i}-${a.id}`}
                className={`flex rounded-xl px-3 py-1 text-sm font-bold transition-all duration-200 ${
                  gespielt
                    ? "bg-mint text-tinte opacity-80"
                    : istAktiv
                      ? "bg-[#EADCF5] text-[#785BA3] ring-2 ring-[#785BA3]/40 scale-105"
                      : "bg-white/80 text-tinte-leise border border-[#785BA3]/10"
                }`}
              >
                {text}
              </span>
            );
          })}

          <button
            type="button"
            onClick={() => setNamenSichtbar((v) => !v)}
            className="ml-1 rounded-full bg-white border border-[#785BA3]/20 px-3 py-1 text-xs font-bold text-[#785BA3] hover:bg-[#EADCF5]/60 transition-colors shrink-0"
          >
            {namenSichtbar ? "Namen ausblenden" : "Namen einblenden"}
          </button>
        </div>

        <button
          type="button"
          onClick={aufVorbereitung}
          className="shrink-0 rounded-full bg-white border border-[#785BA3]/20 px-5 py-2 text-sm font-semibold text-tinte transition-colors hover:bg-[#EADCF5]"
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
            beschreibung={vierAkkorde.map((a) => a.symbol).join(" – ")}
          />
        }
        hervorgehoben={hervorgehoben}
        klaviaturVon={bereich.von}
        klaviaturBis={bereich.bis}
      />
    </div>
  );
}
