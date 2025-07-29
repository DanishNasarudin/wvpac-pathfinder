import Providers from "@/lib/providers";
import logo from "@/public/logo.png";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const base = process.env.NEXT_PUBLIC_BASE_URL!;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pathfinder",
  description: "Conventions Pathfinder",
  icons: {
    icon: [
      { url: new URL("/favicon.ico", base), type: "image/x-icon" },
      {
        url: new URL("/favicon-16x16.png", base),
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: new URL("/favicon-32x32.png", base),
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: new URL("/android-chrome-192x192.png", base),
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: new URL("/android-chrome-512x512.png", base),
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "Pathfinder",
    title: "Pathfinder",
    description: "Conventions Pathfinder",
    images: [
      {
        url: logo.src,
        width: logo.width,
        height: logo.height,
        alt: "Pathfinder",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
