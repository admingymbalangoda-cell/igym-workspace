import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IGYM Balangoda - Premier Fitness Center & Smart Health Club",
  description: "Transform your body and mind at IGYM Balangoda. High-tech fitness equipment, certified expert coaches, custom nutrition plans, and 24/7 smart access.",
  keywords: ["IGYM", "Balangoda Gym", "Fitness Center Sri Lanka", "Smart Gym", "Personal Training", "Workout Classes"],
  authors: [{ name: "IGYM Team" }],
  openGraph: {
    title: "IGYM Balangoda - Premier Fitness Center",
    description: "Elevate your workout experience with state-of-the-art equipment, certified coaches, and modern facilities.",
    images: ["/hero-bg.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark scroll-smooth`} suppressHydrationWarning>
      <body className="bg-zinc-950 text-slate-100 min-h-screen font-sans selection:bg-red-500/30 selection:text-red-500">
        {children}
      </body>
    </html>
  );
}
