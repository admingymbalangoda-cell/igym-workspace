import { Dumbbell, Award, Star } from "lucide-react";

const coaches = [
  {
    name: "Coach Kasun Perera",
    role: "Head Fitness Director & Bodybuilding Lead",
    cert: "IFBB Certified Master Trainer (10+ Yrs Exp)",
    spec: "Hypertrophy, Powerlifting & Contest Prep",
    rating: "4.9 / 5.0",
  },
  {
    name: "Coach Amanda Silva",
    role: "Senior Female Fitness & Yoga Specialist",
    cert: "ACE Certified Personal Trainer",
    spec: "Weight Loss, Pilates & Posture Correction",
    rating: "5.0 / 5.0",
  },
  {
    name: "Coach Nalin Fernando",
    role: "Crossfit & HIIT Head Coach",
    cert: "NSCA Strength & Conditioning Specialist",
    spec: "Fat Loss, Metabolic Conditioning & Endurance",
    rating: "4.9 / 5.0",
  },
  {
    name: "Coach Dilini Jayasinghe",
    role: "Group Aerobics & Zumba Instructor",
    cert: "ZIN International Dance & Fitness Certified",
    spec: "Cardio Dance, Rhythm Fitness & Core Toning",
    rating: "4.8 / 5.0",
  },
];

export default function Trainers() {
  return (
    <section id="trainers" className="py-24 relative bg-[#0b0f17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#00f2fe] mb-3">EXPERTS BEHIND YOUR RESULTS</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            MEET OUR CERTIFIED COACHES
          </p>
          <p className="mt-3 text-slate-400 text-base">
            Dedicated professionals committed to guiding your form, nutrition, and mindset every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {coaches.map((coach, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 border border-white/10 group hover:border-[#00f2fe]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00f2fe]/20 to-[#4facfe]/20 border border-[#00f2fe]/30 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Dumbbell className="w-8 h-8 text-[#00f2fe]" />
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {coach.rating}
                </div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00f2fe] transition-colors">
                  {coach.name}
                </h3>
                <p className="text-xs font-semibold text-[#00f2fe] mb-4">{coach.role}</p>

                <div className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{coach.cert}</span>
                  </div>
                  <p className="text-slate-400 pl-6">
                    <strong className="text-slate-200">Focus:</strong> {coach.spec}
                  </p>
                </div>
              </div>

              <a
                href="http://localhost:3000/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-lg text-xs font-bold text-center text-slate-200 glass-card hover:bg-white/10 hover:text-white transition-all"
              >
                Book 1-on-1 Session
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
