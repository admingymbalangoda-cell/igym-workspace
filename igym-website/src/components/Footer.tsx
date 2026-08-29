"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
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

interface FooterProps {
  initialSettings?: GlobalSettings | null;
}

export default function Footer({ initialSettings }: FooterProps) {
  const [settings, setSettings] = useState<GlobalSettings | null>(initialSettings || null);

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
        console.error("Error fetching website_global_settings in Footer:", err);
      }
    }

    fetchSettings();
  }, []);

  const phone1Display = settings?.whatsapp_number && settings.whatsapp_number.trim()
    ? settings.whatsapp_number
    : DEFAULT_SETTINGS.whatsapp_number;
  const phone2Display = settings?.phone_2 && settings.phone_2.trim()
    ? settings.phone_2
    : DEFAULT_SETTINGS.phone_2;
  const emailDisplay = settings?.email && settings.email.trim()
    ? settings.email
    : DEFAULT_SETTINGS.email;

  const phone1Tel = phone1Display.replace(/[^\d+]/g, "");
  const phone2Tel = phone2Display.replace(/[^\d+]/g, "");

  return (
    <footer id="contact-footer" className="bg-zinc-950 border-t border-zinc-800 pt-16 sm:pt-20 pb-10 sm:pb-12 relative text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-zinc-900 p-1 border border-zinc-800 flex items-center justify-center shadow-lg shadow-red-600/10 overflow-hidden">
                <Image
                  src="/images/igym-logo.png"
                  alt="IGYM Balangoda Logo"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">IGYM</span>
                  <span className="text-xs font-bold text-red-500 ml-1 uppercase tracking-widest">BALANGODA</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Established 2019</p>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              IGYM — Where Strength Meets Excellence. Promoting natural fitness, disciplined training, proper nutrition, and sustainable lifestyle choices.
            </p>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=100092853317314"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl glass-card border border-zinc-800 flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-500/50 hover:scale-110 transition-all shadow-md"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@igym_balangoda?_r=1&_t=ZS-99GIgJeYt6X"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-xl glass-card border border-zinc-800 flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-500/50 hover:scale-110 transition-all shadow-md"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.05.82.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/igym_balangoda?igsi=MWV5NnI1c2g0Ymhpeg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl glass-card border border-zinc-800 flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-500/50 hover:scale-110 transition-all shadow-md"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#about" className="hover:text-red-500 transition-colors">About IGYM</a></li>
              <li><a href="#features" className="hover:text-red-500 transition-colors">Features & Tech</a></li>
              <li><a href="#gallery" className="hover:text-red-500 transition-colors">Facility Gallery</a></li>
              <li><a href="#calculator" className="hover:text-red-500 transition-colors">BMI Calculator</a></li>
              <li><a href="#pricing" className="hover:text-red-500 transition-colors">Membership Plans</a></li>
              <li><a href="#reviews" className="hover:text-red-500 transition-colors">Member Reviews</a></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">Opening Hours</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Monday – Saturday:</span>
                  <span>05:30 AM – 10:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Sunday:</span>
                  <span>08:00 AM – 08:00 PM</span>
                </div>
              </li>
              <li className="pt-2 border-t border-zinc-800 text-[11px] text-amber-400 font-bold">
                ⚠️ Closed on Poya Days
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>IGYM, Main Street, Balangoda, Sri Lanka</span>
              </li>
              <li className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-semibold text-white">Owner (Hasanka):</span>
                </div>
                <div className="pl-6 space-y-0.5 font-medium text-slate-300">
                  <a href={`tel:${phone1Tel}`} className="hover:text-red-500 block">{phone1Display}</a>
                  <a href={`tel:${phone2Tel}`} className="hover:text-red-500 block">{phone2Display}</a>
                </div>
              </li>
              <li className="space-y-1 pt-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-semibold text-white">Email:</span>
                </div>
                <div className="pl-6 space-y-0.5 text-[11px] text-slate-300 truncate">
                  <a href={`mailto:${emailDisplay}`} className="hover:text-red-500 block truncate">{emailDisplay}</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Developer Credit */}
        <div className="pt-6 sm:pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} IGYM Balangoda. All rights reserved.</p>
          <p className="text-slate-400 font-medium text-[11px] sm:text-xs">
            Designed & Developed by <span className="text-red-500 font-semibold">CodeGraph Solutions</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
