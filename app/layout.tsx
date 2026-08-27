import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
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
  themeColor: "#fdfbf7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${nunito.variable} h-full antialiased`}>
      <body className="keine-auswahl h-full overflow-hidden">{children}</body>
    </html>
  );
}
