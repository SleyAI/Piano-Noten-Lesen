"use client";

import Image from "next/image";
import maskottchenBild from "@/public/maskottchen.png";
import { dauerText } from "@/lib/practice/uebungszeit";
import { useUebungszeit } from "@/lib/store/uebungszeit";

const LOB_SPRUECHE = [
  "Gut gemacht!",
  "Klasse geübt!",
  "Tolle Leistung!",
  "Weiter so!",
  "Super durchgehalten!",
  "Du machst tolle Fortschritte!",
  "Fantastisch gemacht!",
  "Wunderbar geübt!",
  "Jede Minute zählt – stark!",
];

export function SessionEndeModal() {
  const letzteDauer = useUebungszeit((z) => z.letzteDauer);
  const quittiere = useUebungszeit((z) => z.quittiere);

  if (letzteDauer === null) return null;

  // Deterministischer und abwechslungsreicher Spruch basierend auf der Dauer
  const spruchIndex = Math.abs(Math.floor(letzteDauer * 31 + 7)) % LOB_SPRUECHE.length;
  const spruch = LOB_SPRUECHE[spruchIndex];

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

        {/* Lobspruch */}
        <div>
          <h3 className="font-titel text-2xl sm:text-3xl font-bold text-[#785BA3]">
            {spruch}
          </h3>
          <p className="text-sm font-semibold text-tinte-leise mt-1.5">
            Du hast gerade {dauerText(letzteDauer)} geübt.
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
