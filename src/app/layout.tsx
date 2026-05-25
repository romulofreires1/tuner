import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novello App",
  description: "Gerado pelo static-deploy skill",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
