import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import { Wachhalter } from "@/components/ui/Wachhalter";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Fuer Ueberschriften und grosse Zahlen. `SOFT` rundet die Serifen ab, `opsz`
 * bleibt klein — so steht neben der runden Grotesk ein warmer Serif und keine
 * Zeitungsschrift.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  // Variabel geladen: die Gewichte kommen aus der Achse, `SOFT` rundet die
  // Serifen. Beides zusammen mit festen Gewichten geht nicht.
  axes: ["SOFT", "opsz"],
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
  themeColor: "#fdfbf7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${nunito.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="keine-auswahl h-full overflow-hidden">
        <Wachhalter />
        {children}
      </body>
    </html>
  );
}
