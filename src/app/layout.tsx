import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AppProviders } from "@/components/providers/AppProviders";
import type { Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07080d",
};

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "The Gaming Adda — Console Slot Booking",
    template: "%s | The Gaming Adda",
  },
  description:
    "Book PlayStation, Xbox, Nintendo, PC, and VR gaming console slots at The Gaming Adda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rajdhani.variable} ${orbitron.variable} h-full`}
    >
      <body className="flex min-h-dvh flex-col text-[length:var(--text-base)] antialiased">
        <AppProviders>
          <Header />
          <AppShell>
            <main className="flex-1">{children}</main>
          </AppShell>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
