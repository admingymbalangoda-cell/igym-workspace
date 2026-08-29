"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface GlobalSettings {
  id?: number;
  whatsapp_number?: string | null;
  phone_2?: string | null;
  email?: string | null;
}

const DEFAULT_SETTINGS = {
  whatsapp_number: "076-1643242",
  phone_2: "070-4207307",
  email: "hadankade1996@gmail.com",
};

interface ContactSectionProps {
  initialSettings?: GlobalSettings | null;
}

export default function ContactSection({ initialSettings }: ContactSectionProps) {
  const [settings, setSettings] = useState<GlobalSettings | null>(initialSettings || null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from("website_global_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (!error && data) {
          setSettings(data);
        }
      } catch (err) {
        console.error("Error fetching website_global_settings in ContactSection:", err);
      }
    }

    fetchSettings();
  }, []);

  const whatsappDisplay = settings?.whatsapp_number && settings.whatsapp_number.trim()
    ? settings.whatsapp_number
    : DEFAULT_SETTINGS.whatsapp_number;
  const phone2Display = settings?.phone_2 && settings.phone_2.trim()
    ? settings.phone_2
    : DEFAULT_SETTINGS.phone_2;
  const emailDisplay = settings?.email && settings.email.trim()
    ? settings.email
    : DEFAULT_SETTINGS.email;

  // Clean WhatsApp number format for wa.me URL
  const cleanWhatsappNumber = (whatsappDisplay || "+94761643242")
    .replace(/[^\d+]/g, "")
    .replace(/^\+/, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phone, message } = formData;

    const messageTemplate = `Hello IGYM Team, you have a new inquiry from the website.\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}\n\n*Message:*\n${message}`;

    const encodedMessage = encodeURIComponent(messageTemplate);
    const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    // Clear form fields
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="py-16 sm:py-24 relative bg-zinc-950 border-t border-zinc-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-red-500/10 border border-red-500/35 text-[11px] sm:text-xs font-bold text-red-500 uppercase tracking-wider mb-4 shadow-sm shadow-red-500/10">
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
          <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-2xl relative flex flex-col justify-between bg-zinc-900/80">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Send Us a Message</h3>
              <p className="text-xs text-slate-400 mb-6 sm:mb-8">
                Fill out the form below and our team will get back to you shortly via WhatsApp.
              </p>

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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-[#25D366]/25 hover:shadow-[#25D366]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  Send Message via WhatsApp
                </button>
              </form>
            </div>

            {/* Quick Contact Badges */}
            <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>{whatsappDisplay} / {phone2Display}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300 truncate">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href={`mailto:${emailDisplay}`} className="truncate hover:text-red-500 transition-colors">{emailDisplay}</a>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps Embed */}
          <div className="relative w-full h-full min-h-[350px] sm:min-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden glass-card border border-zinc-800 shadow-2xl flex flex-col bg-zinc-900/80">
            <div className="p-3.5 sm:p-4 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
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
