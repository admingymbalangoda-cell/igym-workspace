"use client";

import { useState } from "react";
import { Calculator, Flame, Scale, Activity, RefreshCw } from "lucide-react";

export default function BmiCalculator() {
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState<number>(1.375); // moderate

  const calculateBmi = () => {
    if (!height || !weight) return { bmi: 0, category: "", color: "" };
    const heightInMeters = height / 100;
    const bmiVal = weight / (heightInMeters * heightInMeters);

    let category = "";
    let color = "";

    if (bmiVal < 18.5) {
      category = "Underweight";
      color = "text-amber-400";
    } else if (bmiVal >= 18.5 && bmiVal < 24.9) {
      category = "Normal / Healthy Weight";
      color = "text-emerald-400";
    } else if (bmiVal >= 25 && bmiVal < 29.9) {
      category = "Overweight";
      color = "text-orange-400";
    } else {
      category = "Obese";
      color = "text-rose-500";
    }

    return { bmi: parseFloat(bmiVal.toFixed(1)), category, color };
  };

  const calculateBmr = () => {
    // Harris-Benedict Equation
    let bmr = 0;
    if (gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
    const tdee = Math.round(bmr * activity);
    return {
      tdee,
      cut: tdee - 500,
      bulk: tdee + 400,
    };
  };

  const res = calculateBmi();
  const calories = calculateBmr();

  return (
    <section id="calculator" className="py-24 relative bg-[#0d131f] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00f2fe]/10 text-[#00f2fe] text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              SMART FITNESS METRICS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              CALCULATE YOUR BMI & DAILY CALORIE NEEDS
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Understand your starting point. Use our interactive fitness calculator to instantly determine your Body Mass Index (BMI) and recommended daily calorie intake for body transformation.
            </p>

            <div className="glass-card p-5 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">BMI &lt; 18.5</span>
                <span className="text-amber-400 font-semibold">Underweight</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">BMI 18.5 - 24.9</span>
                <span className="text-emerald-400 font-semibold">Healthy Range</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">BMI 25 - 29.9</span>
                <span className="text-orange-400 font-semibold">Overweight</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">BMI ≥ 30</span>
                <span className="text-rose-500 font-semibold">Obese</span>
              </div>
            </div>
          </div>

          {/* Calculator Card */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      gender === "male"
                        ? "bg-[#00f2fe] text-slate-950 shadow-md shadow-[#00f2fe]/20"
                        : "glass-card text-slate-300 hover:text-white"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      gender === "female"
                        ? "bg-[#00f2fe] text-slate-950 shadow-md shadow-[#00f2fe]/20"
                        : "glass-card text-slate-300 hover:text-white"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Age: {age} yrs</label>
                <input
                  type="range"
                  min="12"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-[#00f2fe] cursor-pointer mt-2"
                />
              </div>

              {/* Height */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Height (cm)</label>
                  <span className="text-sm font-bold text-[#00f2fe]">{height} cm</span>
                </div>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/15 rounded-lg px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-[#00f2fe]"
                />
              </div>

              {/* Weight */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Weight (kg)</label>
                  <span className="text-sm font-bold text-[#00f2fe]">{weight} kg</span>
                </div>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-slate-900/90 border border-white/15 rounded-lg px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-[#00f2fe]"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Weekly Workout Frequency</label>
              <select
                value={activity}
                onChange={(e) => setActivity(Number(e.target.value))}
                className="w-full bg-slate-900/90 border border-white/15 rounded-lg px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-[#00f2fe]"
              >
                <option value={1.2}>Sedentary (Little or no workout)</option>
                <option value={1.375}>Lightly Active (1-3 days/week)</option>
                <option value={1.55}>Moderately Active (3-5 days/week)</option>
                <option value={1.725}>Very Active (6-7 days/week hard workout)</option>
              </select>
            </div>

            {/* Results Grid */}
            <div className="bg-slate-950/80 rounded-2xl p-6 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* BMI Card */}
              <div className="text-center sm:text-left sm:border-r border-white/10 sm:pr-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your BMI</p>
                <div className="flex items-baseline justify-center sm:justify-start gap-3">
                  <span className="text-4xl font-black text-white">{res.bmi}</span>
                  <span className={`text-sm font-bold ${res.color}`}>{res.category}</span>
                </div>
              </div>

              {/* Calories Card */}
              <div className="text-center sm:text-left space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Daily Intake</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Maintain Weight:</span>
                  <span className="font-bold text-[#00f2fe]">{calories.tdee} kcal</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Fat Loss (Cut):</span>
                  <span className="font-bold text-emerald-400">{calories.cut} kcal</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Muscle Gain (Bulk):</span>
                  <span className="font-bold text-amber-400">{calories.bulk} kcal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
