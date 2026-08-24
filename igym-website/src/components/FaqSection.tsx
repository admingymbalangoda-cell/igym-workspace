"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What are the opening hours of IGym Balangoda?",
    a: "We are open Monday to Saturday from 05:30 AM to 10:00 PM, and on Sundays from 08:00 AM to 08:00 PM. Please note that IGym is closed on Poya Days.",
  },
  {
    q: "What is the admission fee for new members?",
    a: "There is a one-time admission fee of Rs. 1,500/= for all new registrations, giving you full access to membership packages and fitness assessment.",
  },
  {
    q: "What is the difference between Base Packages and Cardio Packages?",
    a: "Base Packages (Men Rs. 3,500, Ladies Rs. 3,000, Student Rs. 2,500, Couple Rs. 5,500) include full weight room and plate-loaded resistance floor access without treadmills. Cardio Packages (Men Rs. 5,000, Ladies Rs. 4,500, Student Rs. 4,000, Couple Rs. 8,500) include unlimited biometric treadmill & cardio burn access.",
  },
  {
    q: "Are long-term membership discounts available?",
    a: "Yes! We offer 10% OFF for 3 Months upfront payments, 20% OFF for 6 Months, and 30% OFF for 12 Months full year memberships.",
  },
  {
    q: "What is IGym's natural fitness philosophy?",
    a: "Established in 2020, IGym promotes natural fitness—focusing on sustainable lifestyle choices, disciplined training, proper Sri Lankan macro nutrition, consistency, and safe form without shortcut risks.",
  },
  {
    q: "Are customized diet plans and personal training available?",
    a: "Absolutely! Customized diet plans and 1-on-1 personal training packages with certified coaches are available upon request.",
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 relative bg-[#0b0f17]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#00f2fe] mb-3">GOT QUESTIONS?</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            FREQUENTLY ASKED QUESTIONS
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left font-bold text-white flex justify-between items-center gap-4 hover:text-[#00f2fe] transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#00f2fe] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
