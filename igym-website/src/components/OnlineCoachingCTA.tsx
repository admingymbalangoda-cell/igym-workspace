"use client";

import { useState, useEffect } from "react";
import { Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface GlobalSettings {
  id?: number;
  whatsapp_number?: string | null;
  phone_2?: string | null;
  email?: string | null;
}

interface OnlineCoachingCTAProps {
  initialSettings?: GlobalSettings | null;
}

export default function OnlineCoachingCTA({ initialSettings }: OnlineCoachingCTAProps) {
  const [settings, setSettings] = useState<GlobalSettings | null>(initialSettings || null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from("website_global_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (!error && data) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Error fetching website_global_settings in OnlineCoachingCTA:", err);
      }
    }

    fetchSettings();
  }, []);

  const rawPhone = settings?.whatsapp_number && settings.whatsapp_number.trim()
    ? settings.whatsapp_number
    : "+94761643242";

  const cleanWhatsappNumber = rawPhone.replace(/[^\d+]/g, "").replace(/^\+/, "");

  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    "Hello IGYM Team, I am interested in your Online Coaching plans. Could you please provide more details?"
  )}`;

  return (
    <section id="online-coaching" className="py-12 sm:py-16 relative bg-zinc-900/60 border-t border-zinc-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-red-500/35 shadow-2xl shadow-red-500/10 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900">
          {/* Subtle Glow Overlays */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Main Text Content */}
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/35 text-xs font-bold text-red-500 uppercase tracking-wider shadow-sm shadow-red-500/10">
                <Globe className="w-4 h-4" />
                ONLINE FITNESS & COACHING
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Train With Us From Anywhere — <span className="text-gradient">Online Coaching</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-3xl">
                Can't make it to our facility in Balangoda? No problem. Get personalized workout routines and custom diet plans from our certified coaches, designed to be executed at any gym or from the comfort of your home.
              </p>

              {/* Feature Highlights Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-semibold text-slate-200">
                <div className="flex items-center gap-2 glass-card px-3.5 py-2 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>Customized Workout Routines</span>
                </div>
                <div className="flex items-center gap-2 glass-card px-3.5 py-2 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>Tailored Diet & Macro Plans</span>
                </div>
                <div className="flex items-center gap-2 glass-card px-3.5 py-2 rounded-xl border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>1-on-1 Trainer Support</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button Column */}
            <div className="lg:col-span-4 flex items-center justify-center lg:justify-end pt-2 lg:pt-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 sm:py-4.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group text-center"
              >
                Inquire About Online Coaching
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
