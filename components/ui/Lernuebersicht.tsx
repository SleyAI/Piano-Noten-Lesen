"use client";

/**
 * Was gehoert zu diesem Niveau, und was davon kann ich schon?
 *
 * Zwei Listen: die Notenpakete, die dieses Niveau ausmachen, und die Akkorde,
 * die dazukommen. Beides laesst sich anhaken. Das Abhaken schaltet nichts
 * frei und sperrt nichts — es ist eine Merkliste fuer einen selbst, damit man
 * sieht, wo man steht, ohne dass irgendwo ein Punktestand mitlaeuft.
 */

import {
  NIVEAUS,
  type Lernziel,
  fortschritt,
  lernziele,
  naechstesNiveau,
  niveauHinweis,
  niveauTitel,
} from "@/lib/music/niveau";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";

export function Lernuebersicht() {
  const hydriert = useHydriert();
  const niveau = useEinstellungen((z) => z.niveau);
  const setzeNiveau = useEinstellungen((z) => z.setzeNiveau);
  const beherrscht = useEinstellungen((z) => z.beherrscht);
  const schalten = useEinstellungen((z) => z.schalteLernziel);
  const vergessen = useEinstellungen((z) => z.vergisssLernziele);

  if (!hydriert) return <div className="h-full bg-papier" />;

  const menge = new Set(beherrscht);
  const ziele = lernziele(niveau);
  const noten = ziele.filter((z) => z.art === "noten");
  const akkorde = ziele.filter((z) => z.art === "akkord");
  const stand = fortschritt(niveau, beherrscht);
  const weiter = naechstesNiveau(niveau);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Niveau">
          {NIVEAUS.map((stufe) => (
            <button
              key={stufe.id}
              type="button"
              role="radio"
              aria-checked={niveau === stufe.id}
              onClick={() => setzeNiveau(stufe.id)}
              className={`rounded-2xl px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
                niveau === stufe.id
                  ? "bg-mint text-tinte"
                  : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
              }`}
            >
              {stufe.titel}
            </button>
          ))}
        </div>
        <p className="max-w-3xl text-sm leading-snug text-tinte-leise">
          {niveauHinweis(niveau)}
        </p>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-3xl bg-creme/60 px-5 py-4">
        <p className="text-sm text-tinte">
          {stand.geschafft} von {stand.gesamt} als {niveauTitel(niveau)} abgehakt.
        </p>
        {stand.vollstaendig && weiter && (
          <button
            type="button"
            onClick={() => setzeNiveau(weiter)}
            className="rounded-full bg-mint px-5 py-1.5 text-sm font-semibold text-tinte transition-colors hover:bg-mint-tief"
          >
            weiter zu {niveauTitel(weiter)}
          </button>
        )}
        <button
          type="button"
          onClick={vergessen}
          className="ml-auto rounded-full bg-white/70 px-4 py-1.5 text-xs text-tinte-leise transition-colors hover:bg-papier-tief"
        >
          alle Haken zurücksetzen
        </button>
      </section>

      <Abschnitt
        titel="Noten"
        text="Die Landmark-Stufen, die auf diesem Niveau zur Verfügung stehen."
        ziele={noten}
        beherrscht={menge}
        schalten={schalten}
        breit
      />

      <Abschnitt
        titel="Akkorde"
        text={
          niveau === "anfaenger"
            ? "Alle sechs kommen ohne eine einzige schwarze Taste aus."
            : "Neu auf diesem Niveau — die Akkorde der Stufen darunter stehen weiterhin zur Verfügung."
        }
        ziele={akkorde}
        beherrscht={menge}
        schalten={schalten}
      />
    </div>
  );
}

function Abschnitt({
  titel,
  text,
  ziele,
  beherrscht,
  schalten,
  breit = false,
}: {
  titel: string;
  text: string;
  ziele: Lernziel[];
  beherrscht: ReadonlySet<string>;
  schalten: (id: string) => void;
  /** Breite Kacheln mit Hinweistext statt schmaler Chips. */
  breit?: boolean;
}) {
  if (ziele.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-sm font-semibold text-tinte">{titel}</h2>
        <p className="text-xs text-tinte-leise">{text}</p>
      </div>

      <div className={breit ? "grid grid-cols-3 gap-2" : "flex flex-wrap gap-1.5"}>
        {ziele.map((ziel) => {
          const an = beherrscht.has(ziel.id);
          return (
            <button
              key={ziel.id}
              type="button"
              role="checkbox"
              aria-checked={an}
              onClick={() => schalten(ziel.id)}
              className={`transition-colors duration-200 ${
                breit
                  ? "flex flex-col gap-1 rounded-2xl px-4 py-3 text-left"
                  : "rounded-full px-4 py-2 text-sm font-semibold"
              } ${
                an ? "bg-mint text-tinte" : "bg-papier-tief text-tinte-leise hover:bg-mint/40"
              }`}
            >
              <span className="flex items-baseline gap-2 font-semibold">
                <span aria-hidden>{an ? "✓" : "○"}</span>
                {ziel.titel}
              </span>
              {breit && <span className="text-xs leading-snug opacity-80">{ziel.hinweis}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
