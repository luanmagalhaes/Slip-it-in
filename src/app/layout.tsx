import type { Metadata, Viewport } from "next";
import { Anton, Baloo_2, Inter } from "next/font/google";
import { brand } from "@/data/copy";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const baloo = Baloo_2({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-baloo",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
  applicationName: brand.name,
  appleWebApp: {
    capable: true,
    title: brand.name,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1d1440",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${anton.variable} ${baloo.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
