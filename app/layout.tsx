import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Optimized Typography
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Panel | Command Center",
  description: "Secure and efficient professional admin dashboard for comprehensive user management and system control.",
  icons: {
    icon: "https://img.icons8.com/fluency/48/shield.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.variable} h-full font-sans`}>
        <LayoutShell>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
