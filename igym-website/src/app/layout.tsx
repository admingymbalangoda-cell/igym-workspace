import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "iGYM Balangoda - Premier Fitness Center & Smart Health Club",
  description: "Transform your body and mind at iGYM Balangoda. High-tech fitness equipment, certified expert coaches, custom nutrition plans, and 24/7 smart access.",
  keywords: ["iGYM", "Balangoda Gym", "Fitness Center Sri Lanka", "Smart Gym", "Personal Training", "Workout Classes"],
  authors: [{ name: "iGYM Team" }],
  openGraph: {
    title: "iGYM Balangoda - Premier Fitness Center",
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
    <html lang="en" className={`${inter.variable} dark scroll-smooth`}>
      <body className="bg-[#0b0f17] text-slate-100 min-h-screen font-sans selection:bg-[#00f2fe]/30 selection:text-[#00f2fe]">
        {children}
      </body>
    </html>
  );
}
