import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import Features from "@/components/Features";
import Gallery from "@/components/Gallery";
import BmiCalculator from "@/components/BmiCalculator";
import OnlineCoachingCTA from "@/components/OnlineCoachingCTA";
import Pricing from "@/components/Pricing";
import Trainers from "@/components/Trainers";
import AppSection from "@/components/AppSection";
import Testimonials from "@/components/Testimonials";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const { data: galleryImages } = await supabase
    .from("website_gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: aboutData } = await supabase
    .from("website_about_section")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const { data: facilityCards } = await supabase
    .from("website_facility_cards")
    .select("*")
    .order("display_order", { ascending: true });

  const { data: coaches } = await supabase
    .from("website_coaches")
    .select("*")
    .order("display_order", { ascending: true });

  const { data: globalSettings } = await supabase
    .from("website_global_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const { data: appPromoData } = await supabase
    .from("website_app_promo_section")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const { data: transformations } = await supabase
    .from("website_transformations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <Navbar />
      <main className="flex-1">
        <Hero initialImages={galleryImages || []} />
        <AboutSection initialData={aboutData} />
        <Features />
        <Gallery initialData={facilityCards || []} />
        <BmiCalculator />
        <OnlineCoachingCTA initialSettings={globalSettings} />
        <Pricing initialSettings={globalSettings} />
        <Trainers
          initialCoaches={coaches || []}
          whatsappNumber={globalSettings?.whatsapp_number || "+94761643242"}
        />
        <AppSection initialData={appPromoData} />
        <Testimonials initialTransformations={transformations || []} />
        {/* Contact Us Section with 2-Column Grid Form & Google Maps right before Footer */}
        <ContactSection initialSettings={globalSettings} />
      </main>
      <Footer initialSettings={globalSettings} />
    </div>
  );
}
