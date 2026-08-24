"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Quote, CheckCircle, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Pathum Rathnayake",
    image: "/images/reviews/ba1.webp",
    result: "Lost 14 kg in 4 Months",
    comment: "iGYM Balangoda changed my lifestyle completely! The trainers created a custom diet plan that fit my busy schedule perfectly. The transformation surprised even my family.",
    rating: 5,
    tag: "Weight Loss",
    timeframe: "4 Months",
  },
  {
    id: 2,
    name: "Shani Wickramasinghe",
    image: "/images/reviews/ba2.webp",
    result: "Gained Lean Muscle & Tone",
    comment: "The equipment is brand new and high tech. Plus, having personal guidance to log reps and progress makes staying consistent effortless.",
    rating: 5,
    tag: "Muscle Gain",
    timeframe: "5 Months",
  },
  {
    id: 3,
    name: "Dimuthu Jayawardena",
    image: "/images/reviews/ba3.webp",
    result: "Dropped 10 kg Body Fat",
    comment: "Best gym environment in Balangoda! Friendly coaches, super clean facilities, and high-energy group workouts every single week.",
    rating: 5,
    tag: "Fat Loss",
    timeframe: "3 Months",
  },
  {
    id: 4,
    name: "Kasun Jayasuriya",
    image: "/images/reviews/ba4.webp",
    result: "Core Strength & 12 kg Loss",
    comment: "I used to suffer from lower back pain until Coach Kasun fixed my deadlift form. Down 12 kg and feeling stronger than ever at age 34.",
    rating: 5,
    tag: "Weight Loss",
    timeframe: "6 Months",
  },
  {
    id: 5,
    name: "Dilini Fernando",
    image: "/images/reviews/ba5.webp",
    result: "Postpartum Fitness (-11 kg)",
    comment: "Regaining my fitness after pregnancy felt overwhelming until I joined iGYM. The female trainers are extremely knowledgeable and encouraging.",
    rating: 5,
    tag: "Weight Loss",
    timeframe: "4 Months",
  },
  {
    id: 6,
    name: "Nalin Gunasekara",
    image: "/images/reviews/ba6.webp",
    result: "Built 8 kg Lean Mass",
    comment: "Subscribed to the Pro Performance tier. The structured hypertrophy routine and protein macro advice gave me the gains I wanted for years.",
    rating: 5,
    tag: "Muscle Gain",
    timeframe: "6 Months",
  },
  {
    id: 7,
    name: "Thilina Alwis",
    image: "/images/reviews/ba7.webp",
    result: "Shredded 15 kg Fat",
    comment: "Combination of morning HIIT classes and strict diet tracking at iGYM got me in the best shape of my life for my wedding.",
    rating: 5,
    tag: "Fat Loss",
    timeframe: "5 Months",
  },
  {
    id: 8,
    name: "Kavindi Perera",
    image: "/images/reviews/ba8.webp",
    result: "Toned Arms & Waist (-8 kg)",
    comment: "Love the community vibe and top-tier cardio machines. The staff makes sure every member feels welcome regardless of fitness level.",
    rating: 5,
    tag: "Fat Loss",
    timeframe: "3 Months",
  },
  {
    id: 9,
    name: "Nuwan Abeysekara",
    image: "/images/reviews/ba9.webp",
    result: "Rehabbed Knee & Gained Power",
    comment: "After a knee injury, iGYM's tailored strength rehab program helped me rebuild leg strength safely. Truly professional trainers.",
    rating: 5,
    tag: "Body Recomp",
    timeframe: "4 Months",
  },
  {
    id: 10,
    name: "Roshan Kumara",
    image: "/images/reviews/ba10.webp",
    result: "Lost 16 kg in 5 Months",
    comment: "Consistency + iGYM coaching = results. The mobile app tracking kept me accountable every single day.",
    rating: 5,
    tag: "Weight Loss",
    timeframe: "5 Months",
  },
  {
    id: 11,
    name: "Chathuri Mendis",
    image: "/images/reviews/ba11.webp",
    result: "Gained Fitness & Body Confidence",
    comment: "Group aerobics and strength sessions are incredible. I've built so much stamina and confidence since joining iGYM Balangoda.",
    rating: 5,
    tag: "Body Recomp",
    timeframe: "3 Months",
  },
  {
    id: 12,
    name: "Sahan Rajapaksha",
    image: "/images/reviews/ba12.webp",
    result: "Body Recomposition (-9 kg Fat)",
    comment: "The bio-tracking machines and meal plan guidance helped me drop fat while adding visible shoulder and chest definition.",
    rating: 5,
    tag: "Body Recomp",
    timeframe: "4 Months",
  },
  {
    id: 13,
    name: "Manjula Bandara",
    image: "/images/reviews/ba13.webp",
    result: "Lost 13 kg & Health Boost",
    comment: "My doctor recommended exercise, and joining iGYM was the best decision. Health parameters improved significantly in 90 days.",
    rating: 5,
    tag: "Weight Loss",
    timeframe: "3 Months",
  },
  {
    id: 14,
    name: "Isuru Liyanage",
    image: "/images/reviews/ba14.webp",
    result: "Six-Pack Abs & Powerlifting PR",
    comment: "Heavy lifting section has high quality barbells and bumper plates. Coach Nalin helped me achieve my lifetime PRs.",
    rating: 5,
    tag: "Muscle Gain",
    timeframe: "6 Months",
  },
  {
    id: 15,
    name: "Sachini Gamage",
    image: "/images/reviews/ba15.webp",
    result: "Overall Toning & Flexibility",
    comment: "Super atmosphere, modern lockers, and supportive atmosphere. Highly recommended fitness center in Balangoda!",
    rating: 5,
    tag: "Fat Loss",
    timeframe: "4 Months",
  },
];

const categories = ["All", "Weight Loss", "Muscle Gain", "Fat Loss", "Body Recomp"];

export default function Testimonials() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  // Filter reviews by active category
  const filteredReviews = reviews.filter(
    (rev) => activeCategory === "All" || rev.tag === activeCategory
  );

  // Determine cards to show based on screen width (1 mobile, 2 tablet, 3 desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, filteredReviews.length - cardsToShow);

  // Auto-playing carousel effect every 4.5 seconds
  useEffect(() => {
    if (isPaused || filteredReviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= maxIndex) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex, filteredReviews.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  };

  // Calculate total indicator dots
  const totalPages = Math.max(1, filteredReviews.length - cardsToShow + 1);

  return (
    <section id="reviews" className="py-24 relative bg-[#0d131f] border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Carousel Navigation Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-[#00f2fe]/30 mb-4 text-xs font-semibold text-[#00f2fe] tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              MEMBER TRANSFORMATIONS
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              REAL PEOPLE, REAL RESULTS
            </h2>
            <p className="mt-3 text-slate-400 text-base sm:text-lg">
              Explore authentic Sri Lankan member transformations and success stories at iGYM Balangoda.
            </p>
          </div>

          {/* Carousel Next / Prev Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 rounded-xl glass-card text-slate-400 hover:text-white hover:border-[#00f2fe]/40 transition-all"
              aria-label={isPaused ? "Play Carousel" : "Pause Carousel"}
              title={isPaused ? "Resume Auto-play" : "Pause Auto-play"}
            >
              {isPaused ? <Play className="w-5 h-5 text-[#00f2fe]" /> : <Pause className="w-5 h-5" />}
            </button>
            <button
              onClick={handlePrev}
              className="p-3 rounded-xl glass-card text-white hover:text-[#00f2fe] hover:border-[#00f2fe]/40 transition-all shadow-lg active:scale-95"
              aria-label="Previous Reviews"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-xl glass-card text-white hover:text-[#00f2fe] hover:border-[#00f2fe]/40 transition-all shadow-lg active:scale-95"
              aria-label="Next Reviews"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 shadow-lg shadow-[#00f2fe]/20"
                  : "glass-card text-slate-300 hover:text-white hover:border-white/20"
              }`}
            >
              {cat} {cat === "All" ? `(${reviews.length})` : ""}
            </button>
          ))}
        </div>

        {/* Auto-Playing Reviews Carousel Container */}
        <div
          className="relative overflow-hidden py-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`,
            }}
          >
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
              >
                <div className="glass-card rounded-3xl p-6 border border-white/10 hover:border-[#00f2fe]/40 transition-all duration-300 flex flex-col justify-between group shadow-xl h-full">
                  <div>
                    {/* Fixed Aspect-Ratio Image Container */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 mb-5 border border-white/10 shadow-inner">
                      <Image
                        src={rev.image}
                        alt={`${rev.name} Transformation`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Gradient Overlay for badges */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40" />

                      {/* Transformation Result Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00f2fe] text-slate-950 font-black text-[11px] uppercase tracking-wide shadow-md">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {rev.result}
                        </span>
                      </div>

                      {/* Timeframe Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-md bg-slate-950/80 text-slate-300 text-[10px] font-bold border border-white/10 backdrop-blur-md">
                          {rev.timeframe}
                        </span>
                      </div>
                    </div>

                    {/* Rating & Quote */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <Quote className="w-5 h-5 text-[#00f2fe]/30" />
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Member Details */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-[#00f2fe] transition-colors">
                        {rev.name}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">Verified iGYM Member</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[#00f2fe]/10 text-[#00f2fe] text-[11px] font-bold border border-[#00f2fe]/20">
                      {rev.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-8 bg-[#00f2fe]" : "w-2.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to review page ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
