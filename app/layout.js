import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "VidMetrics — YouTube Competitor Intelligence",
    template: "%s | VidMetrics",
  },
  description:
    "Analyze any YouTube channel in seconds. Uncover views, engagement rates, view velocity, and channel scores to understand what's working and who's winning.",
  keywords: [
    "youtube analytics",
    "competitor analysis",
    "youtube channel metrics",
    "video performance",
    "creator intelligence",
    "youtube dashboard",
  ],
  authors: [{ name: "VidMetrics" }],
  creator: "VidMetrics",
  openGraph: {
    title: "VidMetrics — YouTube Competitor Intelligence",
    description:
      "Analyze any YouTube channel in seconds. Uncover views, engagement rates, view velocity, and channel scores.",
    type: "website",
    locale: "en_US",
    siteName: "VidMetrics",
  },
  twitter: {
    card: "summary",
    title: "VidMetrics — YouTube Competitor Intelligence",
    description:
      "Analyze any YouTube channel in seconds. Uncover views, engagement rates, view velocity, and channel scores.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
