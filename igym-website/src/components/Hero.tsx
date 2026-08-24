"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Zap, Users, Flame, Award, ChevronLeft, ChevronRight } from "lucide-react";

const heroImages = [
  {
    src: "/hero-bg.png",
    alt: "iGYM Balangoda Main Interior",
    caption: "State-of-the-Art Bio-Tracking Equipment",
  },
  {
    src: "/images/gallery/gym-1.webp",
    alt: "Plate Loaded Strength & Resistance Deck",
    caption: "Heavy Weight & Powerlifting Area",
  },
  {
    src: "/images/gallery/gym-2.webp",
    alt: "Biometric Cardio Treadmills & Rowers",
    caption: "High Intensity Cardio & Fat Burn Deck",
  },
  {
    src: "/images/gallery/gym-3.webp",
    alt: "Free Weights & Dumbbells Zone",
    caption: "Comprehensive Free Weights up to 50kg",
  },
  {
    src: "/images/gallery/gym-4.webp",
    alt: "Functional Training & Group HIIT Studio",
    caption: "Guided Group Fitness & Zumba Studio",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section
      className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20 overflow-hidden min-h-[85vh] lg:min-h-[90vh] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Auto-Fading Background Image Slider */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-75 scale-105" : "opacity-0 scale-100 pointer-events-none"
            }`}
            style={{ transitionProperty: "opacity, transform" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}

        {/* Soft Dark Solid Overlay & Gradient for High Contrast Readability */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/55 to-[#0b0f17]/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,242,254,0.12),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full glass-card border border-[#00f2fe]/30 mb-4 sm:mb-5 text-[11px] sm:text-xs font-semibold text-[#00f2fe] tracking-wide shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-[#00f2fe] animate-pulse" />
            IGYM BALANGODA — ESTABLISHED 2020
          </div>

          {/* Real Tagline / Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15] mb-4 sm:mb-5">
            STRONG BODY 🏋️ <br className="hidden sm:inline" />
            STRONG MIND 🧘 <br />
            <span className="text-gradient">👉 BETTER YOU 😎</span>
          </h1>

          {/* Real Mission Sub-headline */}
          <p className="text-sm sm:text-lg text-slate-200 mb-5 sm:mb-6 leading-relaxed font-medium max-w-2xl drop-shadow border-l-2 border-[#00f2fe] pl-3.5 sm:pl-4 italic">
            "To provide the knowledge, training, and environment everyone needs to reach their full potential."
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-6 sm:mb-7">
            <a
              href="#pricing"
              className="px-6 py-3.5 sm:px-8 sm:py-3.5 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-[#00f2fe]/25 hover:shadow-[#00f2fe]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
            >
              Start Your Transformation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#about"
              className="px-6 py-3.5 sm:px-8 sm:py-3.5 glass-panel hover:bg-white/10 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/15 transition-all flex items-center justify-center gap-2 text-center"
            >
              Our Philosophy & Standard
            </a>
          </div>

          {/* Slider Pagination Controls & Live Caption */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={prevSlide}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full glass-card flex items-center justify-center text-white hover:text-[#00f2fe] hover:border-[#00f2fe]/40 transition-all"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full glass-card flex items-center justify-center text-white hover:text-[#00f2fe] hover:border-[#00f2fe]/40 transition-all"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "w-6 sm:w-8 bg-[#00f2fe]" : "w-1.5 sm:w-2 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <span className="text-[11px] sm:text-xs text-slate-300 font-medium hidden sm:inline-block border-l border-white/20 pl-3.5 italic truncate max-w-xs">
              {heroImages[currentSlide].caption}
            </span>
          </div>

          {/* Key Quick Stats (Compact 2x2 on Mobile, 4-col on Tablet/Desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-white/10">
            <div className="glass-card p-3 sm:p-4 rounded-xl text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f2fe]" />
                <span className="text-xl sm:text-2xl font-black text-white">1,200+</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Active Members</p>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-xl text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f2fe]" />
                <span className="text-xl sm:text-2xl font-black text-white">100%</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Natural Fitness</p>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-xl text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span className="text-xl sm:text-2xl font-black text-white">2020</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Est. Excellence</p>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-xl text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-xl sm:text-2xl font-black text-white">24/7</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Smart App Sync</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
