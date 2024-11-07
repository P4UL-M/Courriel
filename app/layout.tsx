import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Courriel",
  description: "Courriel is a modern email client built with Next.js to access your emails with Google and Microsoft.",
  applicationName: "Courriel",
  keywords: ["email", "client", "google", "microsoft", "next.js"],
  creator: "Paul Mairesse",
  publisher: "Paul Mairesse",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`bg-white text-gray-800 ${inter.className}`}>
      <body className={`${geistSans.variable} ${geistMono.variable} flex h-screen antialiased`}>
        <main className="flex-grow overflow-hidden">
          <Toaster position="top-right" />
          {children}
        </main>
      </body>
    </html>
  );
}
