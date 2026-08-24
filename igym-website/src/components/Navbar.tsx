"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, Smartphone } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-panel py-2.5 shadow-2xl border-b border-white/10"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-xl bg-slate-900/80 p-1 border border-white/15 flex items-center justify-center shadow-lg shadow-[#00f2fe]/10 group-hover:scale-105 transition-transform overflow-hidden">
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
              <span className="text-2xl font-black tracking-tight text-white">iGYM</span>
              <span className="text-xs font-bold text-[#00f2fe] ml-1 uppercase tracking-widest">BALANGODA</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Fitness & Health Club</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          <a href="#about" className="text-sm font-medium text-slate-300 hover:text-[#00f2fe] transition-colors">
            About Us
          </a>
          <a href="#features" className="text-sm font-medium text-slate-300 hover:text-[#00f2fe] transition-colors">
            Features
          </a>
          <a href="#gallery" className="text-sm font-medium text-slate-300 hover:text-[#00f2fe] transition-colors">
            Facility
          </a>
          <a href="#calculator" className="text-sm font-medium text-slate-300 hover:text-[#00f2fe] transition-colors">
            BMI Calculator
          </a>
          <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-[#00f2fe] transition-colors">
            Membership
          </a>
          <a href="#reviews" className="text-sm font-medium text-slate-300 hover:text-[#00f2fe] transition-colors">
            Reviews
          </a>
          <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-[#00f2fe] transition-colors">
            Contact
          </a>
        </nav>

        {/* Quick Action CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/app-guide"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 glass-card rounded-lg hover:border-[#00f2fe]/40 hover:text-white transition-all"
          >
            <Smartphone className="w-4 h-4 text-[#00f2fe]" />
            Get Mobile App
          </Link>
          <a
            href="#pricing"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] rounded-lg shadow-md shadow-[#00f2fe]/20 hover:opacity-95 hover:scale-[1.02] transition-all"
          >
            Join Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile menu toggle button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white glass-card"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-4 pb-6 mt-3 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00f2fe] py-2 text-base font-medium"
            >
              About Us
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00f2fe] py-2 text-base font-medium"
            >
              Features
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00f2fe] py-2 text-base font-medium"
            >
              Facility Gallery
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00f2fe] py-2 text-base font-medium"
            >
              BMI Calculator
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00f2fe] py-2 text-base font-medium"
            >
              Membership
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00f2fe] py-2 text-base font-medium"
            >
              Member Reviews
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-[#00f2fe] py-2 text-base font-medium"
            >
              Contact
            </a>
          </nav>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="/app-guide"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-slate-200 glass-card rounded-lg flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-[#00f2fe]" />
              Get Mobile App
            </Link>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] rounded-lg shadow-lg"
            >
              Join Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
