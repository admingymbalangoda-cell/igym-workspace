"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, ArrowRight, Activity, User, GraduationCap, Heart, Tag, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PackagePlan {
  id?: string;
  name: string;
  price: number | string;
  category: "base" | "cardio";
  features: string[];
  desc?: string;
}

const defaultPricingData: Record<"base" | "cardio", PackagePlan[]> = {
  base: [
    {
      name: "Men Membership",
      price: 3500,
      category: "base",
      desc: "Full weight floor & resistance training area access.",
      features: [
        "Full Plate-Loaded & Weight Floor Access",
        "Locker & Shower Access",
        "Free Form & Posture Orientation",
        "No Treadmill Access",
        "Smart IGYM Mobile App Sync",
      ],
    },
    {
      name: "Ladies Membership",
      price: 3000,
      category: "base",
      desc: "Fitness guidance & weight floor access for ladies.",
      features: [
        "Full Resistance & Weight Floor Access",
        "Locker & Shower Access",
        "Free Nutrition & Meal Assessment",
        "No Treadmill Access",
      ],
    },
    {
      name: "Student Special",
      price: 2500,
      category: "base",
      desc: "Valid for students under 20 years old.",
      features: [
        "Full Weight Floor Access",
        "Under-20 ID required at signup",
        "Free Initial Fitness Plan",
        "No Treadmill Access",
        "IGYM Mobile App Access",
      ],
    },
    {
      name: "Couple Membership",
      price: 5500,
      category: "base",
      desc: "Combined workout pass for couples training together.",
      features: [
        "2 Full Access Passes",
        "Weight Floor & Resistance Deck",
        "Locker & Shower Access",
        "No Treadmill Access",
        "Joint Progress Tracking",
      ],
    },
  ],
  cardio: [
    {
      name: "Men Membership",
      price: 5000,
      category: "cardio",
      desc: "Includes full weight floor PLUS biometric treadmills.",
      features: [
        "Full Weight Floor & Power Cages",
        "20 Minutes Max Treadmill Access",
        "Locker & Shower Access",
        "Free Form & Posture Orientation",
        "Smart IGYM Mobile App Sync",
      ],
    },
    {
      name: "Ladies Membership",
      price: 4500,
      category: "cardio",
      desc: "Cardio area & weight floor access with treadmills.",
      features: [
        "Full Weight & Cardio Area Access",
        "20 Minutes Max Treadmill Access",
        "Locker & Shower Access",
        "Free Nutrition & Meal Assessment",
      ],
    },
    {
      name: "Student Special",
      price: 4000,
      category: "cardio",
      desc: "Valid for students under 20 years old.",
      features: [
        "Full Weight Floor & Cardio Area Access",
        "Under-20 ID required at signup",
        "Free Initial Fitness Plan",
        "20 Minutes Max Treadmill Access",
        "IGYM Mobile App Access",
      ],
    },
    {
      name: "Couple Membership",
      price: 8500,
      category: "cardio",
      desc: "All-inclusive dual membership with treadmills for 2 people.",
      features: [
        "2 Full Access Passes (Weight Floor + Cardio Area)",
        "20 Minutes Max Treadmill Access for Both",
        "Locker & Shower Access",
        "Custom Diet Guidance",
        "Joint Progress Tracking",
      ],
    },
  ],
};

function getPlanIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("student")) return GraduationCap;
  if (lower.includes("couple")) return Heart;
  return User;
}

function getPlanDesc(name: string, category: "base" | "cardio") {
  const lower = name.toLowerCase();
  if (lower.includes("student")) return "Valid for students under 20 years old.";
  if (lower.includes("couple")) {
    return category === "cardio"
      ? "All-inclusive dual membership with treadmills for 2 people."
      : "Combined workout pass for couples training together.";
  }
  if (lower.includes("ladies")) {
    return category === "cardio"
      ? "Cardio area & weight floor access with treadmills."
      : "Fitness guidance & weight floor access for ladies.";
  }
  return category === "cardio"
    ? "Includes full weight floor PLUS biometric treadmills."
    : "Full weight floor & resistance training area access.";
}

export interface GlobalSettings {
  id?: number;
  whatsapp_number?: string | null;
  phone_2?: string | null;
  email?: string | null;
}

interface PricingProps {
  initialSettings?: GlobalSettings | null;
}

export default function Pricing({ initialSettings }: PricingProps) {
  const [packageType, setPackageType] = useState<"base" | "cardio">("cardio");
  const [plansData, setPlansData] = useState<Record<"base" | "cardio", PackagePlan[]>>(defaultPricingData);
  const [settings, setSettings] = useState<GlobalSettings | null>(initialSettings || null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: plansData, error: e1 } = await supabase
          .from("website_pricing_plans")
          .select("*")
          .order("created_at", { ascending: true });

        if (!e1 && plansData && plansData.length > 0) {
          const fetchedData: Record<"base" | "cardio", PackagePlan[]> = {
            base: [],
            cardio: [],
          };

          plansData.forEach((item: any) => {
            const cat = item.category === "base" ? "base" : "cardio";
            fetchedData[cat].push({
              id: item.id,
              name: item.name,
              price: item.price,
              category: cat,
              desc: item.desc || getPlanDesc(item.name, cat),
              features: Array.isArray(item.features) ? item.features : [],
            });
          });

          if (fetchedData.base.length > 0 || fetchedData.cardio.length > 0) {
            setPlansData({
              base: fetchedData.base.length > 0 ? fetchedData.base : defaultPricingData.base,
              cardio: fetchedData.cardio.length > 0 ? fetchedData.cardio : defaultPricingData.cardio,
            });
          }
        }

        const { data: settingsData, error: e2 } = await supabase
          .from("website_global_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (!e2 && settingsData) {
          setSettings(settingsData);
        }
      } catch (err) {
        console.error("Failed to load pricing plans or settings:", err);
      }
    }

    fetchData();
  }, []);

  const rawPhone = settings?.whatsapp_number && settings.whatsapp_number.trim()
    ? settings.whatsapp_number
    : "+94761643242";

  const cleanWhatsappNumber = rawPhone.replace(/[^\d+]/g, "").replace(/^\+/, "");

  const currentPlans = plansData[packageType] || [];

  return (
    <section id="pricing" className="py-16 sm:py-24 relative bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full glass-card border border-red-500/35 mb-4 text-[11px] sm:text-xs font-semibold text-red-500 tracking-wide uppercase shadow-sm shadow-red-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            TRANSPARENT MEMBERSHIP PACKAGES
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            IGYM MEMBERSHIP PLANS
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-lg">
            Choose the membership tier that matches your goals.
          </p>

          {/* Prominent Long-Term Savings Banner (Top Highlight) */}
          <div className="mt-6 mb-2 inline-flex flex-col sm:flex-row items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-zinc-900 to-red-950/60 border border-red-500/35 shadow-xl shadow-red-500/10 max-w-2xl w-full text-center">
            <div className="flex items-center gap-2 text-white font-black text-xs sm:text-sm uppercase tracking-wider shrink-0">
              <span className="text-base sm:text-lg">🔥</span>
              <span>Long-Term Savings:</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold flex-wrap justify-center">
              <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm">
                3 Months: 10% OFF
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
                6 Months: 20% OFF
              </span>
              <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm">
                12 Months: 30% OFF
              </span>
            </div>
          </div>

          {/* Admission Fee Badge Banner */}
          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider max-w-full text-center">
            <Tag className="w-4 h-4 shrink-0" />
            <span>One-Time Admission Fee: Rs. 1,500/= (For All New Registrations)</span>
          </div>

          {/* Package Switcher Toggle */}
          <div className="mt-8 inline-flex flex-col sm:flex-row items-stretch sm:items-center p-1.5 rounded-2xl glass-card border border-zinc-800 w-full sm:w-auto gap-1 bg-zinc-900/80 shadow-md">
            <button
              onClick={() => setPackageType("base")}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                packageType === "base"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Base Packages (Without Treadmills)
            </button>
            <button
              onClick={() => setPackageType("cardio")}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                packageType === "cardio"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" />
              Cardio Packages (With Treadmills)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid (4 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-10 sm:mb-12">
          {currentPlans.map((plan, idx) => {
            const Icon = getPlanIcon(plan.name);
            const isPopular = plan.name.toLowerCase().includes("student");
            const formattedPrice =
              typeof plan.price === "number"
                ? `Rs. ${plan.price.toLocaleString()}`
                : String(plan.price).startsWith("Rs.")
                ? plan.price
                : `Rs. ${plan.price}`;

            // Generate professional structured WhatsApp message
            const whatsappMessage = `Hello IGYM Team, 🏋️‍♂️\n\nI would like to register for the *${plan.name}* (${formattedPrice}).\nCould you please guide me through the admission process?\n\nMy Name: ____________________`;
            const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            return (
              <div
                key={plan.id || idx}
                className={`rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                  isPopular
                    ? "glass-panel border-2 border-red-500 shadow-2xl shadow-red-600/25 md:scale-105 z-10 bg-zinc-900/90"
                    : "glass-card border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 shadow-lg"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-red-600/30 whitespace-nowrap">
                    Most Popular Student Choice
                  </div>
                )}

                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-5 h-8">{plan.desc || getPlanDesc(plan.name, packageType)}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-black text-white">{formattedPrice}</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </div>

                  <div className="space-y-2.5 pt-5 border-t border-zinc-800 mb-6">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 rounded-xl font-extrabold text-xs text-center transition-all flex items-center justify-center gap-2 ${
                    isPopular
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 hover:opacity-95"
                      : "glass-card text-white border border-zinc-700 hover:border-red-500/50"
                  }`}
                >
                  Join Package <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Personal Training & Diet Plan Note */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-red-500/35 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-500 shrink-0 shadow-sm">
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-1">
                PERSONAL TRAINING & NUTRITION GUIDANCE
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Customized diet plans & 1-on-1 personal training packages are available upon request with our certified coaches.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent("Hello IGYM Team, I would like to inquire about Personal Training & Custom Diet Plans.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all shrink-0"
          >
            Inquire via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
