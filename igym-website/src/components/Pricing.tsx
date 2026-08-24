"use client";

import { useState } from "react";
import { Check, Sparkles, ArrowRight, Activity, User, GraduationCap, Heart, Tag, Info } from "lucide-react";

export default function Pricing() {
  const [packageType, setPackageType] = useState<"base" | "cardio">("cardio");

  // Real Pricing Data from Gym Owner
  const pricingData = {
    base: [
      {
        title: "Men Membership",
        price: "Rs. 3,500",
        period: "/month",
        icon: User,
        desc: "Full weight room & resistance training floor access.",
        popular: false,
        features: [
          "Full Plate-Loaded & Weight Room Access",
          "Locker Room & Shower Access",
          "Free Form & Posture Orientation",
          "No Treadmill Access",
          "Smart iGYM Mobile App Sync",
        ],
      },
      {
        title: "Ladies Membership",
        price: "Rs. 3,000",
        period: "/month",
        icon: User,
        desc: "Dedicated female fitness guidance & strength floor.",
        popular: false,
        features: [
          "Full Resistance & Weight Floor Access",
          "Locker Room & Shower Access",
          "Free Nutrition & Meal Assessment",
          "No Treadmill Access",
          "Female Coach Guidance",
        ],
      },
      {
        title: "Student Special",
        price: "Rs. 2,500",
        period: "/month",
        icon: GraduationCap,
        desc: "Discounted rate for active school & college students.",
        popular: true,
        features: [
          "Full Weight Room Access",
          "Student ID Required at Signup",
          "Free Initial Fitness Plan",
          "No Treadmill Access",
          "iGYM Mobile App Access",
        ],
      },
      {
        title: "Couple Membership",
        price: "Rs. 5,500",
        period: "/month",
        icon: Heart,
        desc: "Combined workout pass for couples training together.",
        popular: false,
        features: [
          "2 Full Access Passes",
          "Weight Room & Resistance Deck",
          "Locker & Shower Access",
          "No Treadmill Access",
          "Joint Progress Tracking",
        ],
      },
    ],
    cardio: [
      {
        title: "Men Membership",
        price: "Rs. 5,000",
        period: "/month",
        icon: User,
        desc: "Includes full weight room PLUS unlimited biometric treadmills.",
        popular: false,
        features: [
          "Full Weight Room & Power Cages",
          "Unlimited Treadmill & Cardio Access",
          "Locker Room & Shower Access",
          "Free Form & Posture Orientation",
          "Smart iGYM Mobile App Sync",
        ],
      },
      {
        title: "Ladies Membership",
        price: "Rs. 4,500",
        period: "/month",
        icon: User,
        desc: "Complete cardio burn, aerobics & resistance access.",
        popular: false,
        features: [
          "Full Weight & Cardio Floor Access",
          "Unlimited Treadmill Access",
          "Locker Room & Shower Access",
          "Free Nutrition & Meal Assessment",
          "Female Coach Guidance",
        ],
      },
      {
        title: "Student Special",
        price: "Rs. 4,000",
        period: "/month",
        icon: GraduationCap,
        desc: "Full cardio & weight room access for verified students.",
        popular: true,
        features: [
          "Full Weight & Treadmill Access",
          "Student ID Required at Signup",
          "Free Initial Fitness Plan",
          "Unlimited Cardio Burn",
          "iGYM Mobile App Access",
        ],
      },
      {
        title: "Couple Membership",
        price: "Rs. 8,500",
        period: "/month",
        icon: Heart,
        desc: "All-inclusive dual membership with treadmills for 2 people.",
        popular: false,
        features: [
          "2 Full Access Passes (Weight + Cardio)",
          "Unlimited Treadmill Access for Both",
          "Locker & Shower Access",
          "Custom Diet Guidance",
          "Joint Progress Tracking",
        ],
      },
    ],
  };

  const currentPlans = pricingData[packageType];

  return (
    <section id="pricing" className="py-16 sm:py-24 relative bg-[#0d131f] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full glass-card border border-[#00f2fe]/30 mb-4 text-[11px] sm:text-xs font-semibold text-[#00f2fe] tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            TRANSPARENT MEMBERSHIP PACKAGES
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            IGYM MEMBERSHIP PLANS
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-lg">
            Choose the membership tier that matches your goals.
          </p>

          {/* Admission Fee Badge Banner */}
          <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider max-w-full text-center">
            <Tag className="w-4 h-4 shrink-0" />
            <span>One-Time Admission Fee: Rs. 1,500/= (For All New Registrations)</span>
          </div>

          {/* Package Switcher Toggle */}
          <div className="mt-8 inline-flex flex-col sm:flex-row items-stretch sm:items-center p-1.5 rounded-2xl glass-card border border-white/15 w-full sm:w-auto gap-1">
            <button
              onClick={() => setPackageType("base")}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center ${
                packageType === "base"
                  ? "bg-[#00f2fe] text-slate-950 shadow-md shadow-[#00f2fe]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Base Packages (Without Treadmills)
            </button>
            <button
              onClick={() => setPackageType("cardio")}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                packageType === "cardio"
                  ? "bg-[#00f2fe] text-slate-950 shadow-md shadow-[#00f2fe]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" />
              Cardio Packages (With Treadmills)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid (4 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-12 sm:mb-14">
          {currentPlans.map((plan, idx) => {
            const Icon = plan.icon;

            // Generate professional structured WhatsApp message
            const whatsappMessage = `Hello iGYM Team, 🏋️‍♂️\n\nI would like to register for the *${plan.title}* (${plan.price}).\nCould you please guide me through the admission process?\n\nMy Name: ____________________`;
            const whatsappUrl = `https://wa.me/94761643242?text=${encodeURIComponent(whatsappMessage)}`;

            return (
              <div
                key={idx}
                className={`rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.popular
                    ? "glass-panel border-2 border-[#00f2fe] shadow-2xl shadow-[#00f2fe]/15 md:scale-105 z-10"
                    : "glass-card border border-white/10 hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                    Most Popular Student Choice
                  </div>
                )}

                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{plan.title}</h3>
                  <p className="text-xs text-slate-400 mb-5 h-8">{plan.desc}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
                  </div>

                  <div className="space-y-2.5 pt-5 border-t border-white/10 mb-6">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#00f2fe] shrink-0 mt-0.5" />
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
                    plan.popular
                      ? "bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 shadow-lg shadow-[#00f2fe]/25 hover:opacity-95"
                      : "glass-card text-white hover:border-[#00f2fe]/50"
                  }`}
                >
                  Join Package <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Long-Term Discounts & Special Services Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Long Term Savings */}
          <div className="lg:col-span-7 glass-panel p-5 sm:p-6 rounded-2xl border border-white/15 space-y-4">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#00f2fe]" />
              LONG-TERM MEMBERSHIP DISCOUNTS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="glass-card p-3 rounded-xl text-center border border-white/10 flex sm:flex-col justify-between sm:justify-center items-center">
                <span className="text-xs font-bold text-slate-400">3 MONTHS</span>
                <span className="text-base sm:text-lg font-black text-[#00f2fe]">10% OFF</span>
              </div>
              <div className="glass-card p-3 rounded-xl text-center border border-white/10 flex sm:flex-col justify-between sm:justify-center items-center">
                <span className="text-xs font-bold text-slate-400">6 MONTHS</span>
                <span className="text-base sm:text-lg font-black text-emerald-400">20% OFF</span>
              </div>
              <div className="glass-card p-3 rounded-xl text-center border border-white/10 flex sm:flex-col justify-between sm:justify-center items-center">
                <span className="text-xs font-bold text-slate-400">12 MONTHS</span>
                <span className="text-base sm:text-lg font-black text-amber-400">30% OFF</span>
              </div>
            </div>
          </div>

          {/* Personal Training & Diet Plan Note */}
          <div className="lg:col-span-5 glass-panel p-5 sm:p-6 rounded-2xl border border-[#00f2fe]/30 bg-gradient-to-br from-[#0d1422] to-[#0b0f17] flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe] shrink-0">
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-1">PERSONAL TRAINING & NUTRITION</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Customized diet plans & 1-on-1 personal training packages are available upon request with our certified coaches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
