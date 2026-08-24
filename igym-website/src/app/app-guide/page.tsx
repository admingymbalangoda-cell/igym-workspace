import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Smartphone,
  Share,
  MoreVertical,
  PlusSquare,
  ArrowLeft,
  CheckCircle2,
  Apple,
  Globe,
  ArrowRight,
  Activity,
  QrCode,
  Sparkles,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "App Guide - Your Fitness Journey in Your Pocket | iGYM",
  description: "Learn how to install the iGYM Member Progressive Web App on iOS and Android devices.",
};

const appScreenshots = [
  {
    title: "Live Dashboard & Metric Sync",
    desc: "Track daily workouts, active calories burned, and body fat percentage trends.",
    image: "/images/app-mockup.webp",
  },
  {
    title: "Instant Digital QR Access",
    desc: "Scan your unique member QR code at the gym front desk for instant contactless check-in.",
    image: "/images/qr-code.webp",
  },
  {
    title: "Personalized Coach Guidance",
    desc: "Receive daily macro nutrient targets and workout adjustments from your assigned coach.",
    image: "/hero-bg.png",
  },
];

export default function AppGuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00f2fe] glass-card px-4 py-2 rounded-xl border border-[#00f2fe]/30 hover:border-[#00f2fe]/60 transition-all mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* 1. HERO SECTION */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-xs font-bold text-[#00f2fe] uppercase tracking-wider mb-4">
              <Smartphone className="w-4 h-4" />
              OFFICIAL MEMBER APP GUIDE
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              YOUR FITNESS JOURNEY <br />
              <span className="text-gradient">IN YOUR POCKET</span>
            </h1>
            <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
              Experience instant QR access, workout tracking, and trainer messaging. No App Store or Play Store download required—install our Progressive Web App (PWA) directly onto your phone screen.
            </p>
          </div>

          {/* 2. APP FEATURES (2-3 Screenshots Placeholders) */}
          <div className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#00f2fe] uppercase tracking-widest block mb-2">
                APP INTERFACE PREVIEW
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                POWERFUL FEATURES AT YOUR FINGERTIPS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {appScreenshots.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-3xl p-6 border border-white/10 hover:border-[#00f2fe]/40 transition-all group shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Screenshot Placeholder Container */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 mb-6 border border-white/10">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00f2fe] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#00f2fe] font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Feature Included
                    </span>
                    <span>v2.4 Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. INSTALLATION GUIDE (Visual Guide for iOS & Android) */}
          <div className="mb-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#00f2fe] uppercase tracking-widest block mb-2">
                STEP-BY-STEP SETUP
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                HOW TO INSTALL THE iGYM PWA
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Follow these simple steps on your mobile web browser to add iGYM to your home screen.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* iOS Safari Guide */}
              <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Apple className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">For iPhone / iOS</h3>
                    <p className="text-xs text-slate-400">Using Apple Safari Browser</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 glass-card p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-[#00f2fe] text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        Open Safari Browser
                      </h4>
                      <p className="text-xs text-slate-300">
                        Navigate to our member website address on your iPhone.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 glass-card p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-[#00f2fe] text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        Tap 'Share' Icon <Share className="w-4 h-4 text-[#00f2fe]" />
                      </h4>
                      <p className="text-xs text-slate-300">
                        At the bottom Safari toolbar, tap the square Share icon with the arrow pointing up.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 glass-card p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-[#00f2fe] text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        Tap 'Add to Home Screen' <PlusSquare className="w-4 h-4 text-[#00f2fe]" />
                      </h4>
                      <p className="text-xs text-slate-300">
                        Scroll down the share menu options and select <strong>"Add to Home Screen"</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Android Chrome Guide */}
              <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">For Android</h3>
                    <p className="text-xs text-slate-400">Using Google Chrome Browser</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 glass-card p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        Open Chrome Browser
                      </h4>
                      <p className="text-xs text-slate-300">
                        Navigate to our member website address on your Android phone.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 glass-card p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        Tap 'Menu' (3 dots) <MoreVertical className="w-4 h-4 text-emerald-400" />
                      </h4>
                      <p className="text-xs text-slate-300">
                        Tap the three vertical dots menu icon located at the top-right corner of Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 glass-card p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        Tap 'Add to Home Screen' <PlusSquare className="w-4 h-4 text-emerald-400" />
                      </h4>
                      <p className="text-xs text-slate-300">
                        Select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong> from the dropdown menu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. FINAL CTA: "Go to Member Login" */}
          <div className="glass-panel p-10 rounded-3xl border border-[#00f2fe]/40 text-center space-y-6 bg-gradient-to-br from-slate-950 via-[#0d1422] to-[#0b0f17] shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center mx-auto text-[#00f2fe]">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-3xl font-extrabold text-white">READY TO LOG IN?</h3>
            <p className="text-slate-300 text-base max-w-xl mx-auto">
              Click below to access your iGYM member account, log reps, and scan QR attendance.
            </p>

            <div className="pt-2">
              <a
                href="https://igym-member-2wi4uros5-igym2.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-black text-base rounded-xl shadow-2xl shadow-[#00f2fe]/25 hover:shadow-[#00f2fe]/40 hover:scale-105 transition-all group"
              >
                Go to Member Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
