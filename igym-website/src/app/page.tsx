import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import Features from "@/components/Features";
import Gallery from "@/components/Gallery";
import BmiCalculator from "@/components/BmiCalculator";
import Pricing from "@/components/Pricing";
import Trainers from "@/components/Trainers";
import AppSection from "@/components/AppSection";
import Testimonials from "@/components/Testimonials";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <Features />
        <Gallery />
        <BmiCalculator />
        <Pricing />
        <Trainers />
        <AppSection />
        <Testimonials />
        {/* Contact Us Section with 2-Column Grid Form & Google Maps right before Footer */}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
