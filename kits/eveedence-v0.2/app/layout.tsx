import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import "@/design-system/eveedence.css";

export const metadata: Metadata = {
  title: "Eveedence — Governança e Asseguração de IA",
  description: "Governança de IA que você consegue provar. Explore o esforço de reunir evidências de decisões, controles e resultados de processos que usam IA.",
  icons: { icon: "/brand/eveedence-logotipo.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" data-theme="light"><body>{children}</body></html>;
}
