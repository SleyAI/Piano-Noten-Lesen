/**
 * Geuebte Zeit: zusammenzaehlen und lesbar machen.
 *
 * Gezaehlt wird nach Kalendertagen in der Zeitzone des Geraets, nicht nach
 * UTC — wer um 23 Uhr uebt, hat an diesem Abend geuebt und nicht am naechsten
 * Morgen. Eine Session, die ueber Mitternacht laeuft, zaehlt ganz zu dem Tag,
 * an dem sie begonnen hat; sie zu teilen waere genauer, aber niemand liest
 * eine Statistik so genau.
 *
 * Alles hier ist reine Rechnerei ohne Speicher — der Speicher liegt im Store.
 */

/** Sekunden je Kalendertag, Schluessel "JJJJ-MM-TT". */
export type Uebungstage = Record<string, number>;

/** Der Tagesschluessel zu einem Zeitpunkt, in Ortszeit. */
export function tagesSchluessel(zeit: Date | number = Date.now()): string {
  const d = typeof zeit === "number" ? new Date(zeit) : zeit;
  const monat = String(d.getMonth() + 1).padStart(2, "0");
  const tag = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${monat}-${tag}`;
}

/** Denselben Schluessel wieder als Datum lesen. */
export function ausSchluessel(schluessel: string): Date {
  const [jahr, monat, tag] = schluessel.split("-").map(Number);
  return new Date(jahr, monat - 1, tag);
}

/** Sekunden auf einen Tag buchen und die neue Tabelle liefern. */
export function bucheAufTag(
  tage: Uebungstage,
  sekunden: number,
  zeit: Date | number = Date.now(),
): Uebungstage {
  if (sekunden <= 0) return tage;
  const schluessel = tagesSchluessel(zeit);
  return { ...tage, [schluessel]: (tage[schluessel] ?? 0) + sekunden };
}

export function sekundenAmTag(tage: Uebungstage, zeit: Date | number = Date.now()): number {
  return tage[tagesSchluessel(zeit)] ?? 0;
}

export function sekundenGesamt(tage: Uebungstage): number {
  return Object.values(tage).reduce((summe, s) => summe + s, 0);
}

/** An wie vielen Tagen wurde ueberhaupt geuebt? */
export function aktiveTage(tage: Uebungstage): number {
  return Object.values(tage).filter((s) => s > 0).length;
}

export interface Tageseintrag {
  schluessel: string;
  datum: Date;
  sekunden: number;
}

/**
 * Die letzten `anzahl` Tage, aelteste zuerst — auch die leeren.
 *
 * Ein Balkendiagramm mit Luecken erzaehlt mehr als eine Liste, in der nur die
 * guten Tage stehen.
 */
export function letzteTage(
  tage: Uebungstage,
  anzahl: number,
  bis: Date | number = Date.now(),
): Tageseintrag[] {
  const ende = typeof bis === "number" ? new Date(bis) : new Date(bis);
  const eintraege: Tageseintrag[] = [];

  for (let i = anzahl - 1; i >= 0; i -= 1) {
    const datum = new Date(ende.getFullYear(), ende.getMonth(), ende.getDate() - i);
    const schluessel = tagesSchluessel(datum);
    eintraege.push({ schluessel, datum, sekunden: tage[schluessel] ?? 0 });
  }

  return eintraege;
}

/**
 * Wie viele Tage am Stueck wurde bis heute geuebt?
 *
 * Heute darf noch leer sein — der Tag ist ja nicht vorbei. Dann zaehlt die
 * Serie ab gestern, damit sie nicht jeden Morgen auf null springt.
 */
export function serie(tage: Uebungstage, bis: Date | number = Date.now()): number {
  const ende = typeof bis === "number" ? new Date(bis) : new Date(bis);
  const start = sekundenAmTag(tage, ende) > 0 ? 0 : 1;

  let laenge = 0;
  for (let i = start; ; i += 1) {
    const datum = new Date(ende.getFullYear(), ende.getMonth(), ende.getDate() - i);
    if ((tage[tagesSchluessel(datum)] ?? 0) <= 0) break;
    laenge += 1;
  }
  return laenge;
}

// --- Anzeige ----------------------------------------------------------------

/** Laufende Uhr: "0:42", "12:07", "1:03:20". */
export function uhrzeitText(sekunden: number): string {
  const ganze = Math.max(0, Math.floor(sekunden));
  const s = String(ganze % 60).padStart(2, "0");
  const m = Math.floor(ganze / 60) % 60;
  const h = Math.floor(ganze / 3600);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** Ausgeschrieben, fuer ganze Saetze: "23 Minuten", "1 Stunde 5 Minuten". */
export function dauerText(sekunden: number): string {
  const minuten = Math.floor(sekunden / 60);
  if (minuten < 1) return "weniger als eine Minute";

  const stunden = Math.floor(minuten / 60);
  const rest = minuten % 60;
  const stundenText = stunden === 1 ? "eine Stunde" : `${stunden} Stunden`;
  const minutenText = rest === 1 ? "eine Minute" : `${rest} Minuten`;

  if (stunden === 0) return minutenText;
  if (rest === 0) return stundenText;
  return `${stundenText} ${minutenText}`;
}

/** Knapp, fuer Kacheln und Balken: "0 min", "23 min", "3 h 05". */
export function kurzeDauer(sekunden: number): string {
  const minuten = Math.floor(sekunden / 60);
  if (minuten < 60) return `${minuten} min`;
  return `${Math.floor(minuten / 60)} h ${String(minuten % 60).padStart(2, "0")}`;
}

/** Wochentag als zwei Buchstaben, fuer die Achse des Diagramms. */
export function wochentagKurz(datum: Date): string {
  return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][datum.getDay()];
}
