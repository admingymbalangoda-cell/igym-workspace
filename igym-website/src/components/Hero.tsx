"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Zap, Users, Flame, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface GalleryImage {
  id?: string;
  image_url: string;
  title?: string;
  created_at?: string;
}

interface HeroProps {
  initialImages?: GalleryImage[];
}

export default function Hero({ initialImages = [] }: HeroProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data, error } = await supabase
          .from("website_gallery_images")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setImages(data);
        }
      } catch (err) {
        console.error("Error fetching website_gallery_images:", err);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, images.length]);

  // Prevent out of bounds slide index if images change dynamically
  useEffect(() => {
    if (currentSlide >= images.length && images.length > 0) {
      setCurrentSlide(0);
    }
  }, [images, currentSlide]);

  const nextSlide = () => {
    if (images.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    if (images.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section
      className="relative pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pt-24 lg:pb-12 overflow-hidden flex items-center min-h-[600px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Auto-Fading Background Image Slider */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-75 scale-105" : "opacity-0 scale-100 pointer-events-none"
            }`}
            style={{ transitionProperty: "opacity, transform" }}
          >
            <Image
              src={img.image_url}
              alt={img.title || "IGYM Balangoda"}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}

        {/* Soft Dark Solid Overlay & Gradient for High Contrast Readability */}
        <div className="absolute inset-0 bg-zinc-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.18),rgba(0,0,0,0))]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full glass-card border border-red-500/35 mb-2.5 sm:mb-3 text-[11px] sm:text-xs font-semibold text-red-500 tracking-wide shadow-md shadow-red-500/10">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50" />
            IGYM BALANGODA — ESTABLISHED 2019
          </div>

          {/* Real Tagline / Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15] mb-3 sm:mb-3.5">
            STRONG BODY 🏋️ <br className="hidden sm:inline" />
            STRONG MIND 🧘 <br />
            <span className="text-gradient">👉 BETTER YOU 😎</span>
          </h1>

          {/* Real Mission Sub-headline */}
          <p className="text-sm sm:text-lg text-slate-200 mb-3.5 sm:mb-4 leading-relaxed font-medium max-w-2xl drop-shadow border-l-2 border-red-500 pl-3.5 sm:pl-4 italic">
            "To provide the knowledge, training, and environment everyone needs to reach their full potential."
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-4 sm:mb-5">
            <a
              href="#pricing"
              className="px-6 py-3.5 sm:px-8 sm:py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
            >
              Start Your Transformation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#pricing"
              className="px-6 py-3.5 sm:px-8 sm:py-3.5 glass-panel hover:bg-white/10 text-white font-semibold text-xs sm:text-sm rounded-xl border border-zinc-700/80 transition-all flex items-center justify-center gap-2 text-center"
            >
              Our Philosophy & Standard
            </a>
          </div>

          {/* Slider Pagination Controls & Live Caption */}
          {images.length > 0 && (
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={prevSlide}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full glass-card flex items-center justify-center text-white hover:text-red-500 hover:border-red-500/50 transition-all shadow-sm"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full glass-card flex items-center justify-center text-white hover:text-red-500 hover:border-red-500/50 transition-all shadow-sm"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Slide Dots */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? "w-6 sm:w-8 bg-red-500 shadow-sm shadow-red-500/40" : "w-1.5 sm:w-2 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {images[currentSlide]?.title && (
                <span className="text-[11px] sm:text-xs text-slate-300 font-medium hidden sm:inline-block border-l border-zinc-700 pl-3.5 italic truncate max-w-xs">
                  {images[currentSlide].title}
                </span>
              )}
            </div>
          )}

          {/* Key Quick Stats (Compact 2x2 on Mobile, 4-col on Tablet/Desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3.5 sm:pt-4 border-t border-zinc-800">
            <div className="glass-card p-3 sm:p-4 rounded-xl text-center sm:text-left border border-zinc-800">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="text-xl sm:text-2xl font-black text-white">1,200+</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Active Members</p>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-xl text-center sm:text-left border border-zinc-800">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="text-xl sm:text-2xl font-black text-white">100%</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Natural Fitness</p>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-xl text-center sm:text-left border border-zinc-800">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="text-xl sm:text-2xl font-black text-white">2019</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Est. Excellence</p>
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-xl text-center sm:text-left border border-zinc-800">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
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
