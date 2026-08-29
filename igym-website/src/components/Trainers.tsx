"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dumbbell, Award, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface Coach {
  id?: number | string;
  name: string;
  title?: string | null;
  role?: string | null;
  rating?: string | null;
  certification?: string | null;
  cert?: string | null;
  focus?: string | null;
  spec?: string | null;
  image_url?: string | null;
  display_order?: number | null;
}

const DEFAULT_COACHES: Coach[] = [
  {
    name: "Coach Kasun Perera",
    title: "Head Fitness Director & Bodybuilding Lead",
    rating: "4.9 / 5.0",
    certification: "IFBB Certified Master Trainer (10+ Yrs Exp)",
    focus: "Hypertrophy, Powerlifting & Contest Prep",
    image_url: "",
  },
  {
    name: "Coach Amanda Silva",
    title: "Senior Female Fitness & Yoga Specialist",
    rating: "5.0 / 5.0",
    certification: "ACE Certified Personal Trainer",
    focus: "Weight Loss, Pilates & Posture Correction",
    image_url: "",
  },
  {
    name: "Coach Nalin Fernando",
    title: "Crossfit & HIIT Head Coach",
    rating: "4.9 / 5.0",
    certification: "NSCA Strength & Conditioning Specialist",
    focus: "Fat Loss, Metabolic Conditioning & Endurance",
    image_url: "",
  },
  {
    name: "Coach Dilini Jayasinghe",
    title: "Group Aerobics & Zumba Instructor",
    rating: "4.8 / 5.0",
    certification: "ZIN International Dance & Fitness Certified",
    focus: "Cardio Dance, Rhythm Fitness & Core Toning",
    image_url: "",
  },
];

interface TrainersProps {
  initialCoaches?: Coach[];
  whatsappNumber?: string;
}

export default function Trainers({
  initialCoaches = [],
  whatsappNumber = "+94761643242",
}: TrainersProps) {
  const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);
  const [phone, setPhone] = useState<string>(whatsappNumber);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: coachesData, error: e1 } = await supabase
          .from("website_coaches")
          .select("*")
          .order("display_order", { ascending: true });

        if (!e1 && coachesData && coachesData.length > 0) {
          setCoaches(coachesData);
        }

        const { data: settingsData, error: e2 } = await supabase
          .from("website_global_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (!e2 && settingsData?.whatsapp_number) {
          setPhone(settingsData.whatsapp_number);
        }
      } catch (err) {
        console.error("Error fetching website_coaches or global_settings:", err);
      }
    }

    fetchData();
  }, []);

  const displayCoaches = coaches.length > 0 ? coaches : DEFAULT_COACHES;

  // Clean phone number format for WhatsApp URL (strip all non-digit chars, except leading country code digits)
  const cleanWhatsappNumber = (phone || "+94761643242")
    .replace(/[^\d+]/g, "")
    .replace(/^\+/, "");

  return (
    <section id="trainers" className="py-24 relative bg-zinc-900/60 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">
            EXPERTS BEHIND YOUR RESULTS
          </h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            MEET OUR CERTIFIED COACHES
          </p>
          <p className="mt-3 text-slate-400 text-base">
            Dedicated professionals committed to guiding your form, nutrition, and mindset every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCoaches.map((coach, idx) => {
            const name = coach.name;
            const title = coach.title || coach.role || "Certified Coach";
            const rating = coach.rating || "5.0 / 5.0";
            const cert = coach.certification || coach.cert || "Certified Fitness Specialist";
            const focus = coach.focus || coach.spec || "Personalized Fitness & Strength";
            const imageUrl = coach.image_url;

            const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
              `Hi, I would like to book a 1-on-1 session with ${name}`
            )}`;

            return (
              <div
                key={"id" in coach && coach.id ? coach.id : idx}
                className="glass-card rounded-2xl p-6 border border-zinc-800 hover:border-red-500/50 transition-all flex flex-col justify-between shadow-xl bg-zinc-900/50 group"
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600/20 to-rose-600/20 border border-red-500/35 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform overflow-hidden relative shadow-inner">
                    {imageUrl && imageUrl.trim() ? (
                      <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        sizes="64px"
                        className="object-cover object-center rounded-2xl"
                      />
                    ) : (
                      <Dumbbell className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {rating}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-500 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs font-semibold text-red-500 mb-4">{title}</p>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-zinc-800 pt-4 mb-6">
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{cert}</span>
                    </div>
                    <p className="text-slate-400 pl-6">
                      <strong className="text-slate-200">Focus:</strong> {focus}
                    </p>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-center text-slate-200 glass-card border border-zinc-800 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  Book 1-on-1 Session
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
