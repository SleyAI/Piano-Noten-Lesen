import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { Lernuebersicht } from "@/components/ui/Lernuebersicht";

export const metadata = { title: "Dein Stand — Noten & Akkorde lernen" };

export default function StandSeite() {
  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile titel="Dein Stand" unterzeile="Was gehört zu deinem Niveau?" />
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        <Lernuebersicht />
      </div>
    </div>
  );
}
