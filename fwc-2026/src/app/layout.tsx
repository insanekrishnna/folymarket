import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    // default: "Test - Demmo",
    default: "World Cup 2026 Predictions - Predict the FIFA World Cup",
    template: "%s - World Cup 2026 Predictions",
  },
  description:
    "World Cup 2026 Predictions in USA, Canada & Mexico. Predict match scores, build your bracket and compete with your friends for glory.",
  applicationName: "World Cup 2026 Predictions",
  keywords: [
    "World Cup 2026",
    "FIFA World Cup 2026",
    "World Cup predictions",
    "World Cup bracket",
    "USA Canada Mexico",
    "football predictions",
  ],
  authors: [{ name: "World Cup 2026 Predictions" }],
  creator: "World Cup 2026 Predictions",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en-US",
    url: siteUrl,
    siteName: "World Cup 2026 Predictions",
    title: "World Cup 2026 Predictions - Predict the FIFA World Cup",
    description:
      "Predict the 104 matches of the 2026 World Cup, build your bracket and compete with friends.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "World Cup 2026 Predictions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "World Cup 2026 Predictions",
    description:
      "Predict the 2026 World Cup and compete with your friends for the trophy.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "sports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
