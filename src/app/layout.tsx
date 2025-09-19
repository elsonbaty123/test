import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import branding from "@/config/branding";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "حاسبة تغذية القطة - حساب سعرات علمي + بوكسات شهرية",
  description: "حاسبة علمية لتغذية القطط بناءً على NRC و WSAVA. حساب السعرات اليومية، جدول أسبوعي، وصنع بوكسات شهرية مع تكاليف.",
  keywords: ["تغذية قطط", "حاسبة سعرات", "بوكسات قطط", "قطط", "حيوانات أليفة", "Next.js", "تغذية بيطرية"],
  authors: [{ name: "فريق المشروع" }],
  openGraph: {
    title: "حاسبة تغذية القطة",
    description: "أداة شاملة لحساب تغذية القطط مع خطط أسبوعية وشهرية",
    url: "https://your-site.com",
    siteName: "حاسبة القطط",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "حاسبة تغذية القطة",
    description: "أداة شاملة لحساب تغذية القطط مع خطط أسبوعية وشهرية",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
      { url: branding.logoUrl, type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      // iOS Safari prefers PNG; if you add apple-touch-icon.png in public/, it will override this
      { url: "/favicon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#4a90e2" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} antialiased bg-background text-foreground font-tajawal`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
