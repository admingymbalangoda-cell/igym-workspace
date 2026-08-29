"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, Dumbbell, Sparkles, Target, HeartPulse, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface AboutData {
  id?: number;
  heading?: string | null;
  subheading?: string | null;
  paragraph_1?: string | null;
  paragraph_2?: string | null;
  quote_text?: string | null;
  quote_author?: string | null;
  image_url?: string | null;
  badge_title?: string | null;
  badge_subtitle?: string | null;
}

const DEFAULT_ABOUT_DATA = {
  heading: "IGYM – MORE THAN A GYM.",
  subheading: "A STANDARD OF STRENGTH, DISCIPLINE, & EXCELLENCE.",
  paragraph_1:
    "IGYM was established in 2019 with a clear purpose — to redefine the fitness experience by bringing together premium training, expert knowledge, quality equipment, and an environment designed for transformation. As an organization that promotes natural fitness, we are committed to helping individuals achieve their goals through disciplined training, proper nutrition, consistency, and sustainable lifestyle choices.",
  paragraph_2:
    "From the beginning, our vision has been to create a space where every individual can train with purpose, build confidence, and unlock their true potential. Our philosophy is simple: A stronger body. A stronger mind. A stronger life.",
  quote_text:
    "At IGYM, fitness goes beyond appearance. We believe true strength is built through knowledge, consistency, discipline, and the right environment. That is why we are committed to promoting natural fitness and providing the guidance, training, and standards needed to help every member become a stronger and better version of themselves.",
  quote_author: "IGYM — Where Strength Meets Excellence.",
  image_url: "/images/gallery/gym-1.webp",
  badge_title: "PROMOTING NATURAL FITNESS",
  badge_subtitle: "Disciplined Training & Real Transformation",
};

function getValue(val: string | null | undefined, fallback: string): string {
  return val && val.trim() ? val : fallback;
}

interface AboutSectionProps {
  initialData?: AboutData | null;
}

export default function AboutSection({ initialData }: AboutSectionProps) {
  const [data, setData] = useState<AboutData | null>(initialData || null);

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const { data: result, error } = await supabase
          .from("website_about_section")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (!error && result) {
          setData(result);
        }
      } catch (err) {
        console.error("Error fetching website_about_section:", err);
      }
    }

    fetchAboutData();
  }, []);

  const heading = getValue(data?.heading, DEFAULT_ABOUT_DATA.heading);
  const subheading = getValue(data?.subheading, DEFAULT_ABOUT_DATA.subheading);
  const paragraph1 = getValue(data?.paragraph_1, DEFAULT_ABOUT_DATA.paragraph_1);
  const paragraph2 = getValue(data?.paragraph_2, DEFAULT_ABOUT_DATA.paragraph_2);
  const quoteText = getValue(data?.quote_text, DEFAULT_ABOUT_DATA.quote_text);
  const quoteAuthor = getValue(data?.quote_author, DEFAULT_ABOUT_DATA.quote_author);
  const badgeTitle = getValue(data?.badge_title, DEFAULT_ABOUT_DATA.badge_title);
  const badgeSubtitle = getValue(data?.badge_subtitle, DEFAULT_ABOUT_DATA.badge_subtitle);
  const imageUrl = getValue(data?.image_url, DEFAULT_ABOUT_DATA.image_url);

  // Clean leading/trailing quotes if present in string
  const formattedQuoteText = quoteText.replace(/^["'\s]+|["'\s]+$/g, "");

  return (
    <section id="about" className="py-24 relative bg-zinc-900/60 border-t border-zinc-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card border border-red-500/35 shadow-2xl shadow-red-500/10 group">
              <Image
                src={imageUrl}
                alt={badgeTitle || "IGYM Balangoda Training Floor"}
                fill
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />

              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel border border-zinc-700/80 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white font-black shrink-0 shadow-md shadow-red-600/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">{badgeTitle}</h4>
                    <p className="text-xs text-slate-300">{badgeSubtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/35 text-xs font-bold text-red-500 uppercase tracking-wider shadow-sm shadow-red-500/10">
              <Sparkles className="w-4 h-4" />
              OUR PHILOSOPHY & STORY
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {heading} <br />
              <span className="text-gradient uppercase">{subheading}</span>
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              {paragraph1}
            </p>

            <p className="text-slate-300 text-base leading-relaxed">
              {paragraph2}
            </p>

            <div className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500 border-y border-r border-zinc-800 bg-zinc-900/90 shadow-md">
              <p className="text-slate-200 text-sm italic leading-relaxed">
                "{formattedQuoteText}"
              </p>
              <p className="mt-3 text-xs font-bold text-red-500 uppercase tracking-wider">
                {quoteAuthor}
              </p>
            </div>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="glass-card p-3.5 rounded-xl border border-zinc-800 text-center">
                <Dumbbell className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Quality Equipment</span>
              </div>
              <div className="glass-card p-3.5 rounded-xl border border-zinc-800 text-center">
                <Target className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Disciplined Training</span>
              </div>
              <div className="glass-card p-3.5 rounded-xl border border-zinc-800 text-center">
                <HeartPulse className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Proper Nutrition</span>
              </div>
              <div className="glass-card p-3.5 rounded-xl border border-zinc-800 text-center">
                <ShieldCheck className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-200 block">Sustainable Life</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
