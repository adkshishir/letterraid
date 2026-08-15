import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";

// DESIGN.md: one family for headers and body — geometric but rounded, friendly
// without being cartoonish.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

// Used for word tiles / letter skeletons: fixed-width slots make blank vs.
// revealed letters line up without any layout math.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#16141C" },
    { media: "(prefers-color-scheme: light)", color: "#FBF8F5" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4041",
  ),
  title: {
    default: "LetterRaid — real-time word games you play against someone",
    // Per-route titles fill the %s; see docs/SEO.md for the naming pattern.
    template: "%s | LetterRaid",
  },
  description:
    "Fast head-to-head word games. Grab words off a shared table of letters and steal the ones they took — no turns, no signup, just share a room code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
