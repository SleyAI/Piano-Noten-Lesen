import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { Lernuebersicht } from "@/components/ui/Lernuebersicht";

export const metadata = { title: "Übungsplan — Noten & Akkorde lernen" };

export default function StandSeite() {
  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile
        titel="Übungsplan"
        unterzeile="Anfänger, Fortgeschritten, Profi — und was davon schon sitzt"
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        <Lernuebersicht />
      </div>
    </div>
  );
}
