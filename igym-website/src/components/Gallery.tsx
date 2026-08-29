"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface FacilityCard {
  id?: number | string;
  title?: string | null;
  description?: string | null;
  badge_text?: string | null;
  image_url?: string | null;
  display_order?: number | null;
}

const DEFAULT_FACILITY_CARDS = [
  {
    image_url: "/images/gallery/gym-1.webp",
    title: "Strength & Resistance Zone",
    description: "Imported plate-loaded machines & power cages",
    badge_text: "Heavy Weights",
  },
  {
    image_url: "/images/gallery/gym-2.webp",
    title: "Cardio & Endurance Deck",
    description: "Smart touch treadmills & biometric rowers",
    badge_text: "Cardio",
  },
  {
    image_url: "/images/gallery/gym-3.webp",
    title: "Free Weights & Dumbbells Area",
    description: "Full rack up to 50kg & incline benches",
    badge_text: "Free Weights",
  },
  {
    image_url: "/images/gallery/gym-4.webp",
    title: "Functional & HIIT Studio",
    description: "Battle ropes, kettlebells & plyo boxes",
    badge_text: "Functional Studio",
  },
  {
    image_url: "/images/gallery/gym-5.webp",
    title: "Recovery & Personal Coaching",
    description: "Dedicated 1-on-1 posture & stretching lounge",
    badge_text: "Recovery Zone",
  },
];

interface GalleryProps {
  initialData?: FacilityCard[];
}

export default function Gallery({ initialData = [] }: GalleryProps) {
  const [cards, setCards] = useState<FacilityCard[]>(initialData);

  useEffect(() => {
    async function fetchCards() {
      try {
        const { data, error } = await supabase
          .from("website_facility_cards")
          .select("*")
          .order("display_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setCards(data);
        }
      } catch (err) {
        console.error("Error fetching website_facility_cards:", err);
      }
    }

    fetchCards();
  }, []);

  const displayCards = cards.length > 0 ? cards : DEFAULT_FACILITY_CARDS;

  return (
    <section id="gallery" className="py-16 sm:py-24 relative bg-zinc-900/60 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full glass-card border border-red-500/35 mb-4 text-[11px] sm:text-xs font-semibold text-red-500 tracking-wide uppercase shadow-sm shadow-red-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            WORLD-CLASS GYM & EQUIPMENT
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            EXPLORE OUR FACILITY
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-lg">
            Step into Balangoda's premier fitness center. High-tech equipment, pristine hygiene, and inspiring training spaces.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {displayCards.map((item, idx) => {
            const defaultFallback = DEFAULT_FACILITY_CARDS[idx % DEFAULT_FACILITY_CARDS.length];
            const title = item.title && item.title.trim() ? item.title : defaultFallback.title;
            const description = item.description && item.description.trim() ? item.description : defaultFallback.description;
            const badgeText = item.badge_text && item.badge_text.trim() ? item.badge_text : defaultFallback.badge_text;
            const imageUrl = item.image_url && item.image_url.trim() ? item.image_url : defaultFallback.image_url;

            return (
              <div
                key={("id" in item && item.id) ? item.id : idx}
                className={`group relative min-h-[300px] sm:min-h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-zinc-800 hover:border-red-500/50 transition-all duration-300 shadow-xl flex flex-col justify-end ${
                  idx === 0 ? "col-span-1 md:col-span-2 lg:col-span-2" : "col-span-1"
                }`}
              >
                {/* Background Image filling full height of card container */}
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out z-0"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity z-0" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-zinc-900/90 text-red-500 border border-red-500/35 backdrop-blur-md shadow-md">
                    {badgeText}
                  </span>
                </div>

                {/* Content Overlay - Anchored to bottom */}
                <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 z-10">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1 group-hover:text-red-500 transition-colors">
                    {title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm font-medium">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
