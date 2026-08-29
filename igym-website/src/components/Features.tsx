import { Activity, Dumbbell, HeartPulse, Smartphone, Video, Flame } from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    title: "High-Tech Smart Equipment",
    description: "Imported biometrically integrated workout machines designed for maximum biomechanical efficiency and injury prevention.",
    color: "text-red-500",
  },
  {
    icon: HeartPulse,
    title: "1-on-1 Personal Training",
    description: "Tailored fitness programs built by certified trainers who track your progress daily and keep you motivated.",
    color: "text-red-500",
  },
  {
    icon: Smartphone,
    title: "Mobile App Access & Progress Tracking",
    description: "Easily track your body weight changes over time and receive direct workout instructions and advice from your trainer through the IGYM app.",
    color: "text-red-500",
  },
  {
    icon: Activity,
    title: "Custom Diet & Meal Planning",
    description: "Personalized Sri Lankan macro nutrient breakdown calculated for your specific muscle building or weight loss goals.",
    color: "text-red-500",
  },
  {
    icon: Video,
    title: "Online Personal Training",
    description: "Get expert guidance, live feedback, and personalized workout routines from our certified trainers through interactive online coaching sessions, no matter where you are.",
    color: "text-red-500",
  },
  {
    icon: Flame,
    title: "Cardio & Strength Zones",
    description: "Fully equipped and spacious workout areas featuring advanced treadmills, power cages, and free weights tailored for both intense cardio burns and heavy lifting.",
    color: "text-red-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">WHY CHOOSE IGYM BALANGODA</h2>
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
              className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:border-red-500/50 transition-all border border-zinc-800 shadow-xl"
            >
              <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-red-500/50 transition-all shadow-md">
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors">
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
