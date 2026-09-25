import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, IBM_Plex_Mono } from "next/font/google";
import "@/styles/globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Wheels On Rentals — Self-Drive Car Rental Services",
    template: "%s | Wheels On Rentals",
  },
  description:
    "Drive it. Love it. Own the journey. Well-maintained, fuel-efficient self-drive cars with 24x7 roadside assistance — no drivers, no dispatch, just the keys.",
  metadataBase: new URL("https://wheelsonrentals.example.com"),
  openGraph: {
    title: "Wheels On Rentals — Self-Drive Car Rental Services",
    description: "Drive it. Love it. Own the journey.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
