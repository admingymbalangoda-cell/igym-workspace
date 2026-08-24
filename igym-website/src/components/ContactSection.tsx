"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 4000);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 relative bg-[#0b0f17] border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[11px] sm:text-xs font-bold text-[#00f2fe] uppercase tracking-wider mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            GET IN TOUCH WITH US
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            CONTACT IGYM BALANGODA
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-lg">
            Have questions about membership, personal training, or diet plans? Send us a message or visit our fitness center.
          </p>
        </div>

        {/* 2-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Column: Contact Form */}
          <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl relative flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Send Us a Message</h3>
              <p className="text-xs text-slate-400 mb-6 sm:mb-8">
                Fill out the form below and our team will get back to you shortly.
              </p>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 my-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Message Sent Successfully!</h4>
                  <p className="text-xs text-slate-300">
                    Thank you for reaching out to IGym Balangoda. We will contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kasun Perera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] transition-all"
                    />
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="076-1643242"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] transition-all"
                      />
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Your Message / Inquiry
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Ask about membership packages, personal training, or diet plans..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#00f2fe] focus:ring-1 focus:ring-[#00f2fe] transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-[#00f2fe]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact Badges */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-[#00f2fe] shrink-0" />
                <span>076-1643242 / 076-1644343</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300 truncate">
                <Mail className="w-4 h-4 text-[#00f2fe] shrink-0" />
                <span className="truncate">igym.balangoda1@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps Embed */}
          <div className="relative w-full h-full min-h-[350px] sm:min-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-white/15 shadow-2xl flex flex-col">
            <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <MapPin className="w-4 h-4 text-[#00f2fe] shrink-0" />
                <span className="truncate">IGYM FITNESS CENTER — BALANGODA</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0 ml-2">Main Street</span>
            </div>

            <div className="flex-1 w-full h-full min-h-[300px] sm:min-h-[380px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.0165424993056!2d80.70459207419992!3d6.644866921742713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3f30058d438f5%3A0x4c1e8e8a218208f9!2sIGYM%20FITNESS%20CENTER!5e0!3m2!1sen!2slk!4v1787563084942!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full border-0 min-h-[300px] sm:min-h-[380px]"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
