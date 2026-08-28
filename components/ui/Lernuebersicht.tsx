"use client";

/**
 * Der Uebungsplan: was gehoert zu welchem Niveau, und was kann ich schon?
 *
 * Alle drei Stufen stehen untereinander da — Anfaenger, Fortgeschritten,
 * Profi —, jede mit ihren Noten und ihren Akkorden. Nichts ist gesperrt und
 * nichts versteckt; wer als Anfaenger wissen will, was ein Nonakkord ist,
 * soll ihn hier finden.
 *
 * Das Abhaken schaltet nichts frei. Es ist eine Merkliste fuer einen selbst,
 * damit man sieht, wo man steht, ohne dass irgendwo ein Punktestand
 * mitlaeuft.
 */

import {
  NIVEAUS,
  type Lernziel,
  type Niveau,
  fortschritt,
  gesamtFortschritt,
  lernziele,
} from "@/lib/music/niveau";
import { useEinstellungen } from "@/lib/store/einstellungen";
import { useHydriert } from "@/lib/store/hydriert";

export function Lernuebersicht() {
  const hydriert = useHydriert();
  const beherrscht = useEinstellungen((z) => z.beherrscht);
  const schalten = useEinstellungen((z) => z.schalteLernziel);
  const vergessen = useEinstellungen((z) => z.vergisssLernziele);

  if (!hydriert) return <div className="h-full bg-papier" />;

  const menge = new Set(beherrscht);
  const gesamt = gesamtFortschritt(beherrscht);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <section className="flex flex-wrap items-center gap-3 rounded-3xl bg-creme/60 px-5 py-4">
        <p className="text-sm text-tinte">
          {gesamt.geschafft} von {gesamt.gesamt} Punkten des ganzen Plans abgehakt.
        </p>
        <button
          type="button"
          onClick={vergessen}
          className="ml-auto rounded-full bg-white/70 px-4 py-1.5 text-xs text-tinte-leise transition-colors hover:bg-papier-tief"
        >
          alle Haken zurücksetzen
        </button>
      </section>

      {NIVEAUS.map((stufe) => (
        <NiveauPlan
          key={stufe.id}
          niveau={stufe.id}
          titel={stufe.titel}
          hinweis={stufe.hinweis}
          beherrscht={menge}
          schalten={schalten}
        />
      ))}
    </div>
  );
}

function NiveauPlan({
  niveau,
  titel,
  hinweis,
  beherrscht,
  schalten,
}: {
  niveau: Niveau;
  titel: string;
  hinweis: string;
  beherrscht: ReadonlySet<string>;
  schalten: (id: string) => void;
}) {
  const ziele = lernziele(niveau);
  const stand = fortschritt(niveau, [...beherrscht]);
  const noten = ziele.filter((z) => z.art === "noten");
  const akkorde = ziele.filter((z) => z.art === "akkord");

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-bold text-tinte">{titel}</h2>
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
            stand.vollstaendig ? "bg-mint text-tinte" : "bg-papier-tief text-tinte-leise"
          }`}
        >
          {stand.geschafft} von {stand.gesamt}
        </span>
      </div>
      <p className="max-w-3xl text-sm leading-snug text-tinte-leise">{hinweis}</p>

      <Abschnitt titel="Noten" ziele={noten} beherrscht={beherrscht} schalten={schalten} breit />
      <Abschnitt titel="Akkorde" ziele={akkorde} beherrscht={beherrscht} schalten={schalten} />
    </section>
  );
}

function Abschnitt({
  titel,
  ziele,
  beherrscht,
  schalten,
  breit = false,
}: {
  titel: string;
  ziele: Lernziel[];
  beherrscht: ReadonlySet<string>;
  schalten: (id: string) => void;
  /** Breite Kacheln mit Hinweistext statt schmaler Chips. */
  breit?: boolean;
}) {
  if (ziele.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-tinte-leise">{titel}</h3>

      <div className={breit ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-1.5"}>
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
    </div>
  );
}
