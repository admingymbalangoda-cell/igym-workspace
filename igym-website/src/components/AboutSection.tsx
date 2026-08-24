import Image from "next/image";
import { ShieldCheck, Dumbbell, Sparkles, Target, HeartPulse, Award } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 relative bg-[#0d131f] border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card border border-[#00f2fe]/30 shadow-2xl group">
              <Image
                src="/images/gallery/gym-1.webp"
                alt="iGYM Balangoda Training Floor"
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel border border-white/15 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] flex items-center justify-center text-slate-950 font-black shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">PROMOTING NATURAL FITNESS</h4>
                    <p className="text-xs text-slate-300">Disciplined Training & Real Transformation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-xs font-bold text-[#00f2fe] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              OUR PHILOSOPHY & STORY
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              IGYM – MORE THAN A GYM. <br />
              <span className="text-gradient">A STANDARD OF STRENGTH, DISCIPLINE, & EXCELLENCE.</span>
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              IGym was established in 2020 with a clear purpose — to redefine the fitness experience by bringing together premium training, expert knowledge, quality equipment, and an environment designed for transformation. As an organization that promotes natural fitness, we are committed to helping individuals achieve their goals through disciplined training, proper nutrition, consistency, and sustainable lifestyle choices.
            </p>

            <p className="text-slate-300 text-base leading-relaxed">
              From the beginning, our vision has been to create a space where every individual can train with purpose, build confidence, and unlock their true potential. Our philosophy is simple: <strong className="text-white">A stronger body. A stronger mind. A stronger life.</strong>
            </p>

            <div className="glass-card p-6 rounded-2xl border-l-4 border-l-[#00f2fe] border-y border-r border-white/10 bg-slate-900/60">
              <p className="text-slate-200 text-sm italic leading-relaxed">
                "At IGym, fitness goes beyond appearance. We believe true strength is built through knowledge, consistency, discipline, and the right environment. That is why we are committed to promoting natural fitness and providing the guidance, training, and standards needed to help every member become a stronger and better version of themselves."
              </p>
              <p className="mt-3 text-xs font-bold text-[#00f2fe] uppercase tracking-wider">
                IGym — Where Strength Meets Excellence.
              </p>
            </div>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="glass-card p-3.5 rounded-xl border border-white/10 text-center">
                <Dumbbell className="w-5 h-5 text-[#00f2fe] mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Quality Equipment</span>
              </div>
              <div className="glass-card p-3.5 rounded-xl border border-white/10 text-center">
                <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Disciplined Training</span>
              </div>
              <div className="glass-card p-3.5 rounded-xl border border-white/10 text-center">
                <HeartPulse className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Proper Nutrition</span>
              </div>
              <div className="glass-card p-3.5 rounded-xl border border-white/10 text-center">
                <ShieldCheck className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Sustainable Life</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
