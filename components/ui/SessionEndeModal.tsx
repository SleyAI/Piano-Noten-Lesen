"use client";

import Image from "next/image";
import maskottchenBild from "@/public/maskottchen.png";
import { useUebungszeit } from "@/lib/store/uebungszeit";

function ermittleLob(sekunden: number): { titel: string; untertitel: string } {
  const minuten = Math.floor(sekunden / 60);

  // Unter 1 Minute
  if (sekunden < 60) {
    const sprueche = ["Bleib dran!", "Jeder Anfang zählt!", "Schon warmgespielt?"];
    const titel = sprueche[sekunden % sprueche.length];
    return {
      titel,
      untertitel: "Du hast gerade weniger als eine Minute geübt. Bleib dran und nimm dir gleich noch ein paar Minuten!",
    };
  }

  // 1 bis 5 Minuten
  if (minuten <= 5) {
    const sprueche = ["Bleib dran!", "Guter Einstieg!", "Weiter so!"];
    const titel = sprueche[minuten % sprueche.length];
    const text = minuten === 1 ? "1 Minute" : `${minuten} Minuten`;
    return {
      titel,
      untertitel: `Du hast gerade ${text} geübt. Bleib dran, regelmäßiges Üben bringt den Erfolg!`,
    };
  }

  // 6 bis 10 Minuten
  if (minuten <= 10) {
    const sprueche = ["Gut gemacht!", "Schöne Session!", "Klasse geübt!"];
    const titel = sprueche[minuten % sprueche.length];
    return {
      titel,
      untertitel: `Du hast gerade ${minuten} Minuten geübt.`,
    };
  }

  // 11 bis 29 Minuten
  if (minuten < 30) {
    const sprueche = ["Super gemacht!", "Starke Leistung!", "Toller Fortschritt!"];
    const titel = sprueche[minuten % sprueche.length];
    return {
      titel,
      untertitel: `Du hast gerade ${minuten} Minuten konzentriert geübt!`,
    };
  }

  // Ab 30 Minuten
  const sprueche = ["Fantastisch!", "Fantastische Leistung!", "Herausragende Ausdauer!"];
  const titel = sprueche[minuten % sprueche.length];
  return {
    titel,
    untertitel: `Du hast gerade ${minuten} Minuten geübt. Großartige Ausdauer!`,
  };
}

export function SessionEndeModal() {
  const letzteDauer = useUebungszeit((z) => z.letzteDauer);
  const quittiere = useUebungszeit((z) => z.quittiere);

  if (letzteDauer === null) return null;

  const { titel, untertitel } = ermittleLob(letzteDauer);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-auftauchen"
    >
      <div className="relative flex flex-col items-center gap-4 rounded-[32px] bg-white p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-[#785BA3]/20">
        {/* Maskottchen ohne Noten drumherum */}
        <div className="flex items-center justify-center py-1">
          <Image
            src={maskottchenBild}
            alt="Maskottchen"
            priority
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-sm pointer-events-none"
          />
        </div>

        {/* Lobspruch passend zur Dauer */}
        <div>
          <h3 className="font-titel text-2xl sm:text-3xl font-bold text-[#785BA3]">
            {titel}
          </h3>
          <p className="text-sm font-semibold text-tinte-leise mt-1.5">
            {untertitel}
          </p>
        </div>

        {/* Schließen Button */}
        <button
          type="button"
          onClick={quittiere}
          className="w-full rounded-full bg-[#785BA3] px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-[#654B8D] hover:-translate-y-0.5 active:scale-98 transition-all mt-2"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
