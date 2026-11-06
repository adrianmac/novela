import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Novela | Every celebration has a story",
  description: "Bridal boutique management software — appointments, alterations, inventory, and events in one place.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://novela.app'),
  openGraph: {
    title: "Novela | Every celebration has a story",
    description: "Bridal boutique management software — appointments, alterations, inventory, and events in one place.",
    siteName: "Novela",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novela | Every celebration has a story",
    description: "Bridal boutique management software — appointments, alterations, inventory, and events in one place.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans bg-[#F8F4F0] antialiased`}>
        {children}
      </body>
    </html>
  );
}
