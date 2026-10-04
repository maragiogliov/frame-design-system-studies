import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Archivo, Newsreader, JetBrains_Mono } from "next/font/google";
import { BASE_CONFIG, primitiveVars, toCSSVars } from "@/system/tokens";
import "./globals.css";
import "./scenes.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Design Systems — a study by Victor Maragioglio",
  description:
    "An interactive study of how design systems encode decisions, propagate change, drift, are governed and evolve. The page is built as a design system and behaves like one.",
  authors: [{ name: "Victor Maragioglio", url: "https://victormaragioglio.com" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F3F1EA",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // First paint is already resolved from the token system (v4.0 defaults).
  const vars = { ...primitiveVars(), ...toCSSVars(BASE_CONFIG) } as CSSProperties;
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${newsreader.variable} ${mono.variable}`}
      style={vars}
      data-mode="light"
      data-contrast="standard"
      data-motion="full"
      data-focus="ring"
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
