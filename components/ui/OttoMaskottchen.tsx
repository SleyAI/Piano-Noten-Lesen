"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import maskottchenBild from "@/public/maskottchen.png";
import { spieleTon } from "@/lib/audio/engine";
import { useEinstellungen } from "@/lib/store/einstellungen";

interface NotePartikel {
  id: number;
  symbol: string;
  color: string;
  size: number;
  dx: number;
  dy: number;
  rot: number;
  scale: number;
  dur: number;
  delay: number;
}

const NOTEN_SYMBOLE = ["♪", "♫", "♩", "♬", "𝄞", "𝄢", "♭", "♯", "♮", "✨", "⭐"];

const FARBEN = [
  "#785BA3", // Lavendel
  "#9874CC", // Helles Flieder
  "#553C7B", // Tiefes Violett
  "#B395E0", // Leuchtendes Flieder
  "#E892A8", // Sanftes Rosa
  "#4EBA86", // Frisches Mint
  "#4A9DE0", // Himmelsblau
  "#F5B738", // Warmes Gold
  "#FA8C74", // Koralle
];

// Melodische Akkord-Arpeggios beim Antippen von Otto (in MIDI-Noten)
const AKKORD_ARPEGGIOS = [
  [72, 76, 79, 84], // C-Dur (C5 - E5 - G5 - C6)
  [72, 77, 81, 84], // F-Dur (C5 - F5 - A5 - C6)
  [74, 79, 83, 86], // G-Dur (D5 - G5 - H5 - D6)
  [72, 76, 79, 83, 84], // Cmaj7 Glitzer
  [69, 72, 76, 81], // A-Moll
  [72, 74, 76, 79, 81, 84], // Pentatonik Fanfare
];

export function OttoMaskottchen({
  className = "",
  bildClassName = "w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16",
}: {
  className?: string;
  bildClassName?: string;
}) {
  const klangAn = useEinstellungen((z) => z.klangAn);
  const [partikel, setPartikel] = useState<NotePartikel[]>([]);
  const [wirdGeklickt, setWirdGeklickt] = useState(false);
  const zaehlerRef = useRef(0);
  const akkordIndexRef = useRef(0);

  const feuereNoten = useCallback(() => {
    // 1. Klick-Animation auf Otto
    setWirdGeklickt(true);
    window.setTimeout(() => setWirdGeklickt(false), 550);

    // 2. Freudiges kleines Arpeggio abspielen (wenn Ton nicht komplett ausgestellt)
    if (klangAn !== false) {
      const akkord = AKKORD_ARPEGGIOS[akkordIndexRef.current % AKKORD_ARPEGGIOS.length];
      akkordIndexRef.current++;
      akkord.forEach((midi, i) => {
        window.setTimeout(() => {
          try {
            spieleTon(midi, 0.32);
          } catch {
            // AudioContext evtl. noch nicht aktiviert — ignorieren
          }
        }, i * 45);
      });
    }

    // 3. Zwischen 22 und 28 Noten erzeugen, die fontänenartig hochschießen
    const anzahl = Math.floor(Math.random() * 7) + 22;
    const neuePartikel: NotePartikel[] = [];

    for (let i = 0; i < anzahl; i++) {
      zaehlerRef.current++;
      const symbol = NOTEN_SYMBOLE[Math.floor(Math.random() * NOTEN_SYMBOLE.length)];
      const color = FARBEN[Math.floor(Math.random() * FARBEN.length)];

      // Fontänen-Verteilung: Breit nach links und rechts, hoch nach oben
      // dx zwischen -150px und +150px
      const seite = (i % 3 === 0 ? 0 : (i % 2 === 0 ? 1 : -1));
      const basisDx = seite === 0 ? (Math.random() - 0.5) * 60 : seite * (Math.random() * 110 + 35);
      const dx = Math.round(basisDx + (Math.random() - 0.5) * 25);

      // dy schießt kräftig nach oben (negative Y-Werte): zwischen -110px und -290px
      const dy = Math.round(-(Math.random() * 170 + 110));

      const rot = Math.round((Math.random() - 0.5) * 160);
      const scale = Number((Math.random() * 0.6 + 0.95).toFixed(2));
      const size = Math.round(Math.random() * 14 + 16); // 16px bis 30px
      const dur = Math.round(Math.random() * 500 + 950); // 950ms bis 1450ms
      const delay = Math.round(Math.random() * 120); // 0 bis 120ms Stagger

      neuePartikel.push({
        id: zaehlerRef.current,
        symbol,
        color,
        size,
        dx,
        dy,
        rot,
        scale,
        dur,
        delay,
      });
    }

    setPartikel((vorher) => [...vorher, ...neuePartikel]);

    // Nach Ablauf der längsten Animation die Partikel aufräumen
    const maxZeit = 1450 + 150 + 100;
    window.setTimeout(() => {
      setPartikel((aktuell) => aktuell.filter((p) => !neuePartikel.some((np) => np.id === p.id)));
    }, maxZeit);
  }, [klangAn]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={feuereNoten}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          feuereNoten();
        }
      }}
      aria-label="Otto antippen für fliegende Noten"
      title="Tippe auf Otto für tanzende Noten! ✨"
      className={`relative shrink-0 select-none flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#785BA3]/40 rounded-full ${className}`}
    >
      {/* Sanft schwebende Noten im Ruhezustand */}
      <span
        className="absolute -top-2.5 -left-2.5 text-base sm:text-lg font-bold text-[#785BA3] animate-note-1 pointer-events-none"
        aria-hidden
      >
        ♪
      </span>
      <span
        className="absolute -top-3.5 -right-2.5 text-lg sm:text-xl font-bold text-[#9874CC] animate-note-2 pointer-events-none"
        aria-hidden
      >
        ♫
      </span>
      <span
        className="absolute -bottom-1 -right-2 text-sm sm:text-base font-bold text-[#785BA3] animate-note-3 pointer-events-none"
        aria-hidden
      >
        ♩
      </span>
      <span
        className="absolute -bottom-1 -left-2 text-xs sm:text-sm font-bold text-[#9874CC] animate-note-2 pointer-events-none"
        aria-hidden
      >
        ♬
      </span>

      {/* Maskottchen-Bild mit Animation */}
      <div
        className={`relative ${wirdGeklickt ? "animate-[otto-klick_0.55s_ease-out]" : "animate-huepfen"}`}
      >
        <Image
          src={maskottchenBild}
          alt="Otto das Maskottchen"
          priority
          className={`${bildClassName} object-contain filter drop-shadow-sm pointer-events-none`}
        />
      </div>

      {/* Hochschießende Noten-Partikel bei Klick */}
      {partikel.map((p) => (
        <span
          key={p.id}
          aria-hidden
          className="pointer-events-none absolute z-30 font-bold select-none will-change-transform leading-none"
          style={
            {
              color: p.color,
              fontSize: `${p.size}px`,
              left: "50%",
              top: "50%",
              animation: `note-schiessen ${p.dur}ms cubic-bezier(0.12, 0.95, 0.28, 1) ${p.delay}ms forwards`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--rot": `${p.rot}deg`,
              "--scale": `${p.scale}`,
            } as React.CSSProperties
          }
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
