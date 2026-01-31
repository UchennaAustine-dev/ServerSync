import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/react-query-provider";
import type { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ServeSync - Food Delivery & Restaurant Management",
    template: "%s | ServeSync",
  },
  description:
    "Order from the best local restaurants with real-time tracking. Fast delivery, amazing food.",
  keywords: [
    "food delivery",
    "restaurants",
    "order food",
    "fast delivery",
    "local restaurants",
  ],
  authors: [{ name: "ServeSync" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://serversync.com",
    siteName: "ServeSync",
    title: "ServeSync - Food Delivery & Restaurant Management",
    description:
      "Order from the best local restaurants with real-time tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ServeSync - Food Delivery",
    description:
      "Order from the best local restaurants with real-time tracking.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${plusJakarta.variable} font-body text-secondary antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
