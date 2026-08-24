import { Activity, Dumbbell, ShieldCheck, HeartPulse, Sparkles, Smartphone, Users, Trophy } from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    title: "High-Tech Smart Equipment",
    description: "Imported biometrically integrated workout machines designed for maximum biomechanical efficiency and injury prevention.",
    color: "text-[#00f2fe]",
  },
  {
    icon: HeartPulse,
    title: "1-on-1 Personal Training",
    description: "Tailored fitness programs built by certified trainers who track your progress daily and keep you motivated.",
    color: "text-[#4facfe]",
  },
  {
    icon: Smartphone,
    title: "Mobile App Access & Progress Tracking",
    description: "Track your workout reps, body weight trends, attendance, and instant trainer feedback directly in the iGYM app.",
    color: "text-emerald-400",
  },
  {
    icon: Activity,
    title: "Custom Diet & Meal Planning",
    description: "Personalized Sri Lankan macro nutrient breakdown calculated for your specific muscle building or weight loss goals.",
    color: "text-amber-400",
  },
  {
    icon: Users,
    title: "Energetic Group Fitness Classes",
    description: "Zumba, High Intensity Interval Training (HIIT), Power Lifting, Bodybuilding, and Yoga led by expert instructors.",
    color: "text-purple-400",
  },
  {
    icon: Trophy,
    title: "Recovery & Sauna Facilities",
    description: "Accelerate muscle recovery and detoxify with dedicated steam sauna zones and sports therapy sessions.",
    color: "text-rose-400",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative bg-[#0b0f17]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#00f2fe] mb-3">WHY CHOOSE iGYM BALANGODA</h2>
          <p className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            WORLD-CLASS FITNESS EXPERIENCE
          </p>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            We provide everything you need to reach peak performance in a supportive, hygienic, and high-energy environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:border-[#00f2fe]/40 transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#00f2fe]/50 transition-all">
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00f2fe] transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
