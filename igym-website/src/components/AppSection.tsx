"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Smartphone, ShieldCheck, Zap, Activity, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface AppPromoData {
  id?: number;
  badge_text?: string | null;
  heading?: string | null;
  description?: string | null;
  feature_1?: string | null;
  feature_2?: string | null;
  feature_3?: string | null;
  feature_4?: string | null;
  image_url?: string | null;
}

const DEFAULT_APP_PROMO_DATA = {
  badge_text: "GET THE IGYM MEMBER APP",
  heading: "YOUR FITNESS JOURNEY, ALWAYS IN YOUR POCKET",
  description:
    "Log your daily workout reps, track body weight trends, scan digital QR code entry at the gym front desk, and stay connected with certified coaches anywhere.",
  feature_1: "Instant QR Gym Check-in",
  feature_2: "Live Rep & Metric Tracker",
  feature_3: "Direct Trainer Messaging",
  feature_4: "Personal Diet Sync",
  image_url: "/images/app-mockup.webp",
};

function getValue(val: string | null | undefined, fallback: string): string {
  return val && val.trim() ? val : fallback;
}

interface AppSectionProps {
  initialData?: AppPromoData | null;
}

export default function AppSection({ initialData }: AppSectionProps) {
  const [data, setData] = useState<AppPromoData | null>(initialData || null);

  useEffect(() => {
    async function fetchAppPromoData() {
      try {
        const { data: result, error } = await supabase
          .from("website_app_promo_section")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (!error && result) {
          setData(result);
        }
      } catch (err) {
        console.error("Error fetching website_app_promo_section:", err);
      }
    }

    fetchAppPromoData();
  }, []);

  const badgeText = getValue(data?.badge_text, DEFAULT_APP_PROMO_DATA.badge_text);
  const heading = getValue(data?.heading, DEFAULT_APP_PROMO_DATA.heading);
  const description = getValue(data?.description, DEFAULT_APP_PROMO_DATA.description);
  const feature1 = getValue(data?.feature_1, DEFAULT_APP_PROMO_DATA.feature_1);
  const feature2 = getValue(data?.feature_2, DEFAULT_APP_PROMO_DATA.feature_2);
  const feature3 = getValue(data?.feature_3, DEFAULT_APP_PROMO_DATA.feature_3);
  const feature4 = getValue(data?.feature_4, DEFAULT_APP_PROMO_DATA.feature_4);
  const imageUrl = getValue(data?.image_url, DEFAULT_APP_PROMO_DATA.image_url);

  return (
    <section id="app-section" className="py-24 relative bg-zinc-950 border-t border-zinc-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-red-500/35 relative overflow-hidden shadow-2xl shadow-red-500/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/35 text-xs font-bold text-red-500 uppercase tracking-wider shadow-sm shadow-red-500/10">
                <Smartphone className="w-4 h-4" />
                {badgeText}
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase">
                {heading}
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                {description}
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-200">{feature1}</span>
                </div>
                <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-zinc-800">
                  <Activity className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-200">{feature2}</span>
                </div>
                <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-zinc-800">
                  <Zap className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-200">{feature3}</span>
                </div>
                <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-zinc-800">
                  <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-200">{feature4}</span>
                </div>
              </div>
            </div>

            {/* Right Mockup Column */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              {/* Mobile Phone Mockup Image */}
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden glass-card border border-zinc-700/80 shadow-2xl group">
                <Image
                  src={imageUrl}
                  alt={heading}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
