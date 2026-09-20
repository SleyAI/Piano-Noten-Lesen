import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { Wachhalter } from "@/components/ui/Wachhalter";
import { Sidebar } from "@/components/ui/Sidebar";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Fredoka für gemütliche, runde und bauchige Überschriften im Stil der Rezept-App.
 */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noten & Akkorde lernen",
  description:
    "Ruhiges Uebungsprogramm zum Notenlesen und Akkordspiel — mit E-Piano oder unterwegs am Tablet.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F4EFF8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="keine-auswahl flex h-full overflow-hidden bg-papier text-tinte">
        <Wachhalter />
        <Sidebar />
        <div className="flex-1 h-full min-w-0 overflow-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
