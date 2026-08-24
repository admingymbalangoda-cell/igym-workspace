"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

const galleryImages = [
  {
    src: "/images/gallery/gym-1.webp",
    title: "Strength & Resistance Zone",
    subtitle: "Imported plate-loaded machines & power cages",
    category: "Heavy Weights",
  },
  {
    src: "/images/gallery/gym-2.webp",
    title: "Cardio & Endurance Deck",
    subtitle: "Smart touch treadmills & biometric rowers",
    category: "Cardio",
  },
  {
    src: "/images/gallery/gym-3.webp",
    title: "Free Weights & Dumbbells Area",
    subtitle: "Full rack up to 50kg & incline benches",
    category: "Free Weights",
  },
  {
    src: "/images/gallery/gym-4.webp",
    title: "Functional & HIIT Studio",
    subtitle: "Battle ropes, kettlebells & plyo boxes",
    category: "Functional Studio",
  },
  {
    src: "/images/gallery/gym-5.webp",
    title: "Recovery & Personal Coaching",
    subtitle: "Dedicated 1-on-1 posture & stretching lounge",
    category: "Recovery Zone",
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-16 sm:py-24 relative bg-[#0b0f17] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full glass-card border border-[#00f2fe]/30 mb-4 text-[11px] sm:text-xs font-semibold text-[#00f2fe] tracking-wide uppercase">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {galleryImages.map((item, idx) => (
            <div
              key={idx}
              className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-white/10 hover:border-[#00f2fe]/40 transition-all duration-300 shadow-xl ${
                idx === 0 ? "col-span-1 md:col-span-2 lg:col-span-2" : "col-span-1"
              }`}
            >
              {/* Aspect Ratio Container for uniform rendering */}
              <div className={`relative w-full ${idx === 0 ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-[4/3]"} overflow-hidden bg-slate-900`}>
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#0b0f17]/80 text-[#00f2fe] border border-[#00f2fe]/30 backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                {/* Content Overlay at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1 group-hover:text-[#00f2fe] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm font-medium">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
