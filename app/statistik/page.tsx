import { Kopfzeile } from "@/components/ui/Kopfzeile";
import { Statistik } from "@/components/ui/Statistik";

export const metadata = { title: "Statistik — Noten & Akkorde lernen" };

export default function StatistikSeite() {
  return (
    <div className="flex h-full flex-col bg-papier">
      <Kopfzeile titel="Statistik" unterzeile="Wie viel du bisher geübt hast" />
      <div className="min-h-0 flex-1 overflow-y-auto px-6">
        <Statistik />
      </div>
    </div>
  );
}
