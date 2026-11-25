import type { Metadata } from "next";
import {
  Archivo,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Alexis Benoliel — Product Engineer",
  description:
    "Interfaces that hold, between people and AI. Senior fullstack product engineer based in Paris.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body className="bg-desk">{children}</body>
    </html>
  );
}
