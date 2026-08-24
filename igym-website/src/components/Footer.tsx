import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact-footer" className="bg-[#070a10] border-t border-white/10 pt-16 sm:pt-20 pb-10 sm:pb-12 relative text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900/80 p-1 border border-white/15 flex items-center justify-center shadow-lg shadow-[#00f2fe]/10 overflow-hidden">
                <Image
                  src="/images/igym-logo.png"
                  alt="iGYM Balangoda Logo"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">iGYM</span>
                  <span className="text-xs font-bold text-[#00f2fe] ml-1 uppercase tracking-widest">BALANGODA</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Established 2020</p>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              IGym — Where Strength Meets Excellence. Promoting natural fitness, disciplined training, proper nutrition, and sustainable lifestyle choices.
            </p>

            <div className="pt-2">
              <a
                href="https://igym-member-2wi4uros5-igym2.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] rounded-xl shadow-lg shadow-[#00f2fe]/20 hover:scale-[1.02] transition-all inline-flex items-center gap-2"
              >
                Member Portal Access
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#about" className="hover:text-[#00f2fe] transition-colors">About IGym</a></li>
              <li><a href="#features" className="hover:text-[#00f2fe] transition-colors">Features & Tech</a></li>
              <li><a href="#gallery" className="hover:text-[#00f2fe] transition-colors">Facility Gallery</a></li>
              <li><a href="#calculator" className="hover:text-[#00f2fe] transition-colors">BMI Calculator</a></li>
              <li><a href="#pricing" className="hover:text-[#00f2fe] transition-colors">Membership Plans</a></li>
              <li><a href="#reviews" className="hover:text-[#00f2fe] transition-colors">Member Reviews</a></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">Opening Hours</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#00f2fe] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Monday – Saturday:</span>
                  <span>05:30 AM – 10:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#00f2fe] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Sunday:</span>
                  <span>08:00 AM – 08:00 PM</span>
                </div>
              </li>
              <li className="pt-2 border-t border-white/10 text-[11px] text-amber-400 font-bold">
                ⚠️ Closed on Poya Days
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#00f2fe] shrink-0 mt-0.5" />
                <span>IGym, Main Street, Balangoda, Sri Lanka</span>
              </li>
              <li className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00f2fe] shrink-0" />
                  <span className="font-semibold text-white">Owner (Hasanka):</span>
                </div>
                <div className="pl-6 space-y-0.5 font-medium text-slate-300">
                  <a href="tel:0761643242" className="hover:text-[#00f2fe] block">076-1643242</a>
                  <a href="tel:0761644343" className="hover:text-[#00f2fe] block">076-1644343</a>
                  <a href="tel:0704207307" className="hover:text-[#00f2fe] block">070-4207307</a>
                </div>
              </li>
              <li className="space-y-1 pt-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#00f2fe] shrink-0" />
                  <span className="font-semibold text-white">Emails:</span>
                </div>
                <div className="pl-6 space-y-0.5 text-[11px] text-slate-300 truncate">
                  <a href="mailto:igym.balangoda1@gmail.com" className="hover:text-[#00f2fe] block truncate">igym.balangoda1@gmail.com</a>
                  <a href="mailto:hadankade1996@gmail.com" className="hover:text-[#00f2fe] block truncate">hadankade1996@gmail.com</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} IGym Balangoda. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>IGym — Where Strength Meets Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
