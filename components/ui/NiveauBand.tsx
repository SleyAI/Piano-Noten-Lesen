"use client";

/**
 * Anfaenger, Fortgeschritten, Profi — und wie weit das laufende Niveau ist.
 *
 * Der Wechsel ist nie gesperrt. Ist ein Niveau durchgehakt, sagt das Band es
 * freundlich und schlaegt das naechste vor; wer vorher wechseln moechte,
 * tippt einfach drauf.
 */

import Link from "next/link";
import {
  NIVEAUS,
  type Niveau,
  fortschritt,
  naechstesNiveau,
  niveauTitel,
} from "@/lib/music/niveau";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";

export function NiveauBand({ className }: { className?: string }) {
  const hydriert = useHydriert();
  const niveau = useEinstellungen((z) => z.niveau);
  const setzeNiveau = useEinstellungen((z) => z.setzeNiveau);
  const beherrscht = useEinstellungen((z) => z.beherrscht);

  if (!hydriert) return <div className={`h-[4.5rem] ${className ?? ""}`} />;

  const stand = fortschritt(niveau, beherrscht);
  const weiter = naechstesNiveau(niveau);

  return (
    <section
      className={`flex flex-wrap items-center gap-3 rounded-[1.75rem] bg-papier-tief px-5 py-4 ${className ?? ""}`}
    >
      <div className="flex gap-2" role="radiogroup" aria-label="Niveau">
        {NIVEAUS.map((stufe) => (
          <NiveauKnopf
            key={stufe.id}
            aktiv={niveau === stufe.id}
            titel={stufe.titel}
            onClick={() => setzeNiveau(stufe.id)}
          />
        ))}
      </div>

      <p className="text-sm text-tinte-leise">
        {stand.vollstaendig && weiter ? (
          <>
            Alles als {niveauTitel(niveau)} abgehakt —{" "}
            <button
              type="button"
              onClick={() => setzeNiveau(weiter)}
              className="font-semibold text-tinte underline underline-offset-2"
            >
              weiter zu {niveauTitel(weiter)}?
            </button>
          </>
        ) : (
          <>
            {stand.geschafft} von {stand.gesamt} abgehakt
          </>
        )}
      </p>

      <Link
        href="/stand"
        className="ml-auto rounded-full bg-white/70 px-4 py-1.5 text-sm text-tinte transition-colors hover:bg-mint"
      >
        Was gehört dazu?
      </Link>
    </section>
  );
}

function NiveauKnopf({
  aktiv,
  titel,
  onClick,
}: {
  aktiv: boolean;
  titel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={aktiv}
      onClick={onClick}
      className={`rounded-2xl px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
        aktiv ? "bg-mint text-tinte" : "bg-white/70 text-tinte-leise hover:bg-mint/40"
      }`}
    >
      {titel}
    </button>
  );
}

/** Kurzfassung fuers Innere einer Uebungsseite. */
export function NiveauHinweis({ niveau }: { niveau: Niveau }) {
  return <span className="text-xs text-tinte-leise">{niveauTitel(niveau)}</span>;
}
