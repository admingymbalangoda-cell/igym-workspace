import Image from "next/image";
import Link from "next/link";
import { Smartphone, QrCode, ArrowRight, ShieldCheck, Zap, Activity, CheckCircle2 } from "lucide-react";

export default function AppSection() {
  return (
    <section id="app-section" className="py-24 relative bg-[#0b0f17] border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-[#00f2fe]/30 relative overflow-hidden shadow-2xl bg-gradient-to-br from-slate-950 via-[#0d1422] to-[#0b0f17]">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f2fe]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-xs font-bold text-[#00f2fe] uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                GET THE iGYM MEMBER APP
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                YOUR FITNESS JOURNEY, <br />
                <span className="text-gradient">ALWAYS IN YOUR POCKET</span>
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Log your daily workout reps, track body weight trends, scan digital QR code entry at the gym front desk, and stay connected with certified coaches anywhere.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-5 h-5 text-[#00f2fe] shrink-0" />
                  <span className="text-xs font-bold text-slate-200">Instant QR Gym Check-in</span>
                </div>
                <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-white/10">
                  <Activity className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-200">Live Rep & Metric Tracker</span>
                </div>
                <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-white/10">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-200">Direct Trainer Messaging</span>
                </div>
                <div className="flex items-center gap-3 glass-card p-3.5 rounded-xl border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-200">Personal Diet Sync</span>
                </div>
              </div>

              {/* Primary CTA Button specified by user */}
              <div className="pt-4">
                <Link
                  href="/app-guide"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-[#00f2fe]/25 hover:shadow-[#00f2fe]/40 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <Smartphone className="w-5 h-5" />
                  Learn How to Access Our App
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Mockup & QR Code Column */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center gap-6">
              {/* Mobile Phone Mockup Image */}
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden glass-card border border-white/20 shadow-2xl group">
                <Image
                  src="/images/app-mockup.webp"
                  alt="iGYM Member App Dashboard Mockup"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* QR Code Placeholder Card */}
              <div className="glass-card p-4 rounded-2xl border border-white/15 flex items-center gap-4 w-full max-w-sm">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-white/20">
                  <Image
                    src="/images/qr-code.webp"
                    alt="iGYM App Scan QR Code"
                    fill
                    sizes="64px"
                    className="object-cover object-center"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Scan QR Code</h4>
                  <p className="text-[11px] text-slate-400">Scan with your smartphone camera to quickly access the app installation guide.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
