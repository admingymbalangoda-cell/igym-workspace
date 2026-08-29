"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Quote, CheckCircle, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface Transformation {
  id?: number | string;
  member_name?: string | null;
  name?: string | null;
  member_status?: string | null;
  badge_text?: string | null;
  result?: string | null;
  duration_text?: string | null;
  timeframe?: string | null;
  review_text?: string | null;
  comment?: string | null;
  rating?: number | string | null;
  category?: string | null;
  tag?: string | null;
  image_url?: string | null;
  image?: string | null;
  created_at?: string;
}

const DEFAULT_TRANSFORMATIONS: Transformation[] = [
  {
    id: 1,
    member_name: "Pathum Rathnayake",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba1.webp",
    badge_text: "Lost 14 kg in 4 Months",
    review_text: "IGYM Balangoda changed my lifestyle completely! The trainers created a custom diet plan that fit my busy schedule perfectly. The transformation surprised even my family.",
    rating: 5,
    category: "Weight Loss",
    duration_text: "4 Months",
  },
  {
    id: 2,
    member_name: "Shani Wickramasinghe",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba2.webp",
    badge_text: "Gained Lean Muscle & Tone",
    review_text: "The equipment is brand new and high tech. Plus, having personal guidance to log reps and progress makes staying consistent effortless.",
    rating: 5,
    category: "Muscle Gain",
    duration_text: "5 Months",
  },
  {
    id: 3,
    member_name: "Dimuthu Jayawardena",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba3.webp",
    badge_text: "Dropped 10 kg Body Fat",
    review_text: "Best gym environment in Balangoda! Friendly coaches, super clean facilities, and high-energy group workouts every single week.",
    rating: 5,
    category: "Fat Loss",
    duration_text: "3 Months",
  },
  {
    id: 4,
    member_name: "Kasun Jayasuriya",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba4.webp",
    badge_text: "Core Strength & 12 kg Loss",
    review_text: "I used to suffer from lower back pain until Coach Kasun fixed my deadlift form. Down 12 kg and feeling stronger than ever at age 34.",
    rating: 5,
    category: "Weight Loss",
    duration_text: "6 Months",
  },
  {
    id: 5,
    member_name: "Dilini Fernando",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba5.webp",
    badge_text: "Postpartum Fitness (-11 kg)",
    review_text: "Regaining my fitness after pregnancy felt overwhelming until I joined IGYM. The female trainers are extremely knowledgeable and encouraging.",
    rating: 5,
    category: "Weight Loss",
    duration_text: "4 Months",
  },
  {
    id: 6,
    member_name: "Nalin Gunasekara",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba6.webp",
    badge_text: "Built 8 kg Lean Mass",
    review_text: "Subscribed to the Pro Performance tier. The structured hypertrophy routine and protein macro advice gave me the gains I wanted for years.",
    rating: 5,
    category: "Muscle Gain",
    duration_text: "6 Months",
  },
  {
    id: 7,
    member_name: "Thilina Alwis",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba7.webp",
    badge_text: "Shredded 15 kg Fat",
    review_text: "Combination of morning HIIT classes and strict diet tracking at IGYM got me in the best shape of my life for my wedding.",
    rating: 5,
    category: "Fat Loss",
    duration_text: "5 Months",
  },
  {
    id: 8,
    member_name: "Kavindi Perera",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba8.webp",
    badge_text: "Toned Arms & Waist (-8 kg)",
    review_text: "Love the community vibe and top-tier cardio machines. The staff makes sure every member feels welcome regardless of fitness level.",
    rating: 5,
    category: "Fat Loss",
    duration_text: "3 Months",
  },
  {
    id: 9,
    member_name: "Nuwan Abeysekara",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba9.webp",
    badge_text: "Rehabbed Knee & Gained Power",
    review_text: "After a knee injury, IGYM's tailored strength rehab program helped me rebuild leg strength safely. Truly professional trainers.",
    rating: 5,
    category: "Body Recomp",
    duration_text: "4 Months",
  },
  {
    id: 10,
    member_name: "Roshan Kumara",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba10.webp",
    badge_text: "Lost 16 kg in 5 Months",
    review_text: "Consistency + IGYM coaching = results. The mobile app tracking kept me accountable every single day.",
    rating: 5,
    category: "Weight Loss",
    duration_text: "5 Months",
  },
  {
    id: 11,
    member_name: "Chathuri Mendis",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba11.webp",
    badge_text: "Gained Fitness & Body Confidence",
    review_text: "Group aerobics and strength sessions are incredible. I've built so much stamina and confidence since joining IGYM Balangoda.",
    rating: 5,
    category: "Body Recomp",
    duration_text: "3 Months",
  },
  {
    id: 12,
    member_name: "Sahan Rajapaksha",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba12.webp",
    badge_text: "Body Recomposition (-9 kg Fat)",
    review_text: "The bio-tracking machines and meal plan guidance helped me drop fat while adding visible shoulder and chest definition.",
    rating: 5,
    category: "Body Recomp",
    duration_text: "4 Months",
  },
  {
    id: 13,
    member_name: "Manjula Bandara",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba13.webp",
    badge_text: "Lost 13 kg & Health Boost",
    review_text: "My doctor recommended exercise, and joining IGYM was the best decision. Health parameters improved significantly in 90 days.",
    rating: 5,
    category: "Weight Loss",
    duration_text: "3 Months",
  },
  {
    id: 14,
    member_name: "Isuru Liyanage",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba14.webp",
    badge_text: "Six-Pack Abs & Powerlifting PR",
    review_text: "Heavy lifting section has high quality barbells and bumper plates. Coach Nalin helped me achieve my lifetime PRs.",
    rating: 5,
    category: "Muscle Gain",
    duration_text: "6 Months",
  },
  {
    id: 15,
    member_name: "Sachini Gamage",
    member_status: "Verified IGYM Member",
    image_url: "/images/reviews/ba15.webp",
    badge_text: "Overall Toning & Flexibility",
    review_text: "Super atmosphere, modern lockers, and supportive atmosphere. Highly recommended fitness center in Balangoda!",
    rating: 5,
    category: "Fat Loss",
    duration_text: "4 Months",
  },
];

const categories = ["All", "Weight Loss", "Muscle Gain", "Fat Loss", "Body Recomp"];

interface TestimonialsProps {
  initialTransformations?: Transformation[];
}

export default function Testimonials({
  initialTransformations = [],
}: TestimonialsProps) {
  const [transformations, setTransformations] = useState<Transformation[]>(initialTransformations);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function fetchTransformations() {
      try {
        const { data, error } = await supabase
          .from("website_transformations")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setTransformations(data);
        }
      } catch (err) {
        console.error("Error fetching website_transformations:", err);
      }
    }

    fetchTransformations();
  }, []);

  const activeDataset = transformations.length > 0 ? transformations : DEFAULT_TRANSFORMATIONS;

  // Filter transformations by active category
  const filteredReviews = activeDataset.filter((item) => {
    if (activeCategory === "All") return true;
    const cat = item.category || item.tag;
    return cat === activeCategory;
  });

  // Calculate dynamic count for each category tab
  const getCategoryCount = (catName: string) => {
    if (catName === "All") return activeDataset.length;
    return activeDataset.filter((item) => {
      const cat = item.category || item.tag;
      return cat === catName;
    }).length;
  };

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
    <section id="reviews" className="py-24 relative bg-zinc-900/60 border-t border-zinc-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Carousel Navigation Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-red-500/35 mb-4 text-xs font-semibold text-red-500 tracking-wide uppercase shadow-sm shadow-red-500/10">
              <Sparkles className="w-3.5 h-3.5" />
              MEMBER TRANSFORMATIONS
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              REAL PEOPLE, REAL RESULTS
            </h2>
            <p className="mt-3 text-slate-400 text-base sm:text-lg">
              Explore authentic Sri Lankan member transformations and success stories at IGYM Balangoda.
            </p>
          </div>

          {/* Carousel Next / Prev Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-3 rounded-xl glass-card text-slate-400 hover:text-white hover:border-red-500/50 transition-all border border-zinc-800"
              aria-label={isPaused ? "Play Carousel" : "Pause Carousel"}
              title={isPaused ? "Resume Auto-play" : "Pause Auto-play"}
            >
              {isPaused ? <Play className="w-5 h-5 text-red-500" /> : <Pause className="w-5 h-5" />}
            </button>
            <button
              onClick={handlePrev}
              className="p-3 rounded-xl glass-card text-white hover:text-red-500 hover:border-red-500/50 transition-all shadow-md border border-zinc-800 active:scale-95"
              aria-label="Previous Reviews"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-xl glass-card text-white hover:text-red-500 hover:border-red-500/50 transition-all shadow-md border border-zinc-800 active:scale-95"
              aria-label="Next Reviews"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30"
                    : "glass-card text-slate-300 hover:text-white hover:border-zinc-700 border border-zinc-800"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
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
            {filteredReviews.map((rev, idx) => {
              const name = rev.member_name || rev.name || "IGYM Member";
              const status = rev.member_status || "Verified IGYM Member";
              const badgeText = rev.badge_text || rev.result || "Transformation";
              const durationText = rev.duration_text || rev.timeframe || "";
              const reviewText = rev.review_text || rev.comment || "";
              const categoryTag = rev.category || rev.tag || "Transformation";

              const defaultFallbackImg = `/images/reviews/ba${(idx % 15) + 1}.webp`;
              const imageUrl = rev.image_url && rev.image_url.trim()
                ? rev.image_url
                : (rev.image && rev.image.trim() ? rev.image : defaultFallbackImg);

              const parsedRating = typeof rev.rating === "number" ? rev.rating : parseInt(String(rev.rating || 5));
              const ratingNum = Math.min(5, Math.max(1, isNaN(parsedRating) ? 5 : parsedRating));

              return (
                <div
                  key={"id" in rev && rev.id ? rev.id : idx}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3 flex"
                >
                  <div className="glass-card rounded-3xl p-6 border border-zinc-800 hover:border-red-500/50 transition-all duration-300 flex flex-col justify-between group shadow-xl bg-zinc-900/50 w-full">
                    <div className="flex-1 flex flex-col">
                      {/* Fixed Uniform Height Image Container */}
                      <div className="relative w-full h-56 sm:h-60 rounded-2xl overflow-hidden bg-zinc-900 mb-5 border border-zinc-800 shadow-inner shrink-0">
                        <Image
                          src={imageUrl}
                          alt={`${name} Transformation`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Gradient Overlay for badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-zinc-950/40" />

                        {/* Transformation Result Badge */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-[11px] uppercase tracking-wide shadow-lg shadow-red-600/30">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {badgeText}
                          </span>
                        </div>

                        {/* Timeframe / Duration Badge */}
                        {durationText && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="px-2.5 py-1 rounded-md bg-zinc-950/90 text-slate-300 text-[10px] font-bold border border-zinc-800 backdrop-blur-md">
                              {durationText}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rating & Quote */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(ratingNum)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <Quote className="w-5 h-5 text-red-500/30" />
                      </div>

                      <p className="text-slate-300 text-sm leading-relaxed mb-6 italic flex-1">
                        "{reviewText}"
                      </p>
                    </div>

                    {/* Member Details */}
                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between mt-auto shrink-0">
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-red-500 transition-colors">
                          {name}
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">{status}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 text-[11px] font-bold border border-red-500/25">
                        {categoryTag}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  idx === currentIndex ? "w-8 bg-red-500 shadow-sm shadow-red-500/40" : "w-2.5 bg-white/20 hover:bg-white/40"
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
