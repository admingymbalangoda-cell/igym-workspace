"use client";

import { useState } from "react";
import { Clock, User, Flame } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const scheduleData = [
  { day: "Monday", time: "06:00 AM - 07:30 AM", title: "Sunrise HIIT Burn", coach: "Coach Kasun", category: "HIIT", intensity: "High" },
  { day: "Monday", time: "05:00 PM - 06:30 PM", title: "Heavy Weight & Muscle Build", coach: "Coach Nalin", category: "Strength", intensity: "Extreme" },
  { day: "Tuesday", time: "06:30 AM - 07:30 AM", title: "Core & Abs Conditioning", coach: "Coach Amanda", category: "Core", intensity: "Medium" },
  { day: "Tuesday", time: "05:30 PM - 07:00 PM", title: "Zumba & Cardio Dance", coach: "Coach Dilini", category: "Cardio", intensity: "High" },
  { day: "Wednesday", time: "06:00 AM - 07:30 AM", title: "Full Body Strength", coach: "Coach Kasun", category: "Strength", intensity: "High" },
  { day: "Wednesday", time: "05:00 PM - 06:30 PM", title: "Crossfit & Kettlebell", coach: "Coach Nalin", category: "HIIT", intensity: "Extreme" },
  { day: "Thursday", time: "06:30 AM - 07:30 AM", title: "Yoga & Flexibility", coach: "Coach Amanda", category: "Yoga", intensity: "Low" },
  { day: "Thursday", time: "05:30 PM - 07:00 PM", title: "Kickboxing & Conditioning", coach: "Coach Kasun", category: "Combat", intensity: "High" },
  { day: "Friday", time: "06:00 AM - 07:30 AM", title: "Leg Day & Glutes Special", coach: "Coach Nalin", category: "Strength", intensity: "Extreme" },
  { day: "Friday", time: "05:00 PM - 06:30 PM", title: "Friday Night Fat Shred", coach: "Coach Dilini", category: "HIIT", intensity: "High" },
  { day: "Saturday", time: "07:00 AM - 08:30 AM", title: "Weekend Warrior Powerlifter", coach: "Head Coach Kasun", category: "Strength", intensity: "Extreme" },
  { day: "Saturday", time: "04:00 PM - 05:30 PM", title: "Calisthenics & Mobility", coach: "Coach Amanda", category: "Bodyweight", intensity: "Medium" },
  { day: "Sunday", time: "08:00 AM - 09:30 AM", title: "Active Recovery & Steam Sauna", coach: "Team IGYM", category: "Recovery", intensity: "Low" },
];

export default function ScheduleSection() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  const filtered = scheduleData.filter((item) => item.day === selectedDay);

  return (
    <section id="schedule" className="py-24 relative bg-zinc-900/60 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">WEEKLY CLASS TIMETABLE</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            WORKOUT SCHEDULE AT IGYM
          </p>
          <p className="mt-3 text-slate-400 text-base">
            Select a day to view scheduled guided workout sessions led by certified fitness coaches.
          </p>
        </div>

        {/* Day Selectors */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedDay === day
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30"
                  : "glass-card text-slate-300 hover:text-white hover:border-zinc-700 border border-zinc-800"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-red-500/50 transition-all bg-zinc-900/50 shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wide border border-red-500/25">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-orange-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {item.intensity} Intensity
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {item.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-500" />
                      {item.coach}
                    </span>
                  </div>
                </div>

                <a
                  href="#pricing"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-lg shadow hover:bg-red-700 shadow-red-600/20 transition-all whitespace-nowrap"
                >
                  Book Slot
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 glass-card rounded-2xl text-slate-400 border border-zinc-800">
              No classes scheduled for {selectedDay}. Open floor training available 05:00 AM - 10:00 PM.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
