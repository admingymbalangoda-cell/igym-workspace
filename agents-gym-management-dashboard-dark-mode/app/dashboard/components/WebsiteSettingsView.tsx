"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  DollarSign,
  Layers,
  Flame,
  Save,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  UploadCloud,
  Eye,
  BookOpen,
  Building2,
  PhoneCall,
  UserCheck,
  Star,
  Award,
  Smartphone,
  Trophy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface WebsitePricingPlan {
  id: string;
  name: string;
  category: "base" | "cardio" | string;
  price: number;
  period: string;
  features: string[];
  badge?: string;
  popular?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WebsiteGalleryImage {
  id: string;
  image_url: string;
  storage_path?: string;
  title?: string;
  created_at?: string;
}

export interface WebsiteAboutSectionData {
  id?: number;
  heading: string;
  subheading: string;
  paragraph_1: string;
  paragraph_2: string;
  quote_text: string;
  quote_author: string;
  badge_title: string;
  badge_subtitle: string;
  image_url: string;
  storage_path?: string;
}

export interface WebsiteFacilityCard {
  id: string;
  title: string;
  description: string;
  badge_text?: string;
  image_url: string;
  storage_path?: string;
  display_order?: number;
  created_at?: string;
}

export interface WebsiteGlobalSettings {
  id?: number;
  whatsapp_number: string;
  updated_at?: string;
}

export interface WebsiteCoach {
  id: string;
  name: string;
  title: string;
  rating?: number;
  certification?: string;
  focus?: string;
  image_url: string;
  storage_path?: string;
  display_order?: number;
  created_at?: string;
}

export interface WebsiteAppPromoData {
  id?: number;
  badge_text: string;
  heading: string;
  description: string;
  feature_1: string;
  feature_2: string;
  feature_3: string;
  feature_4: string;
  image_url: string;
  storage_path?: string;
}

export interface WebsiteTransformation {
  id: string;
  member_name: string;
  member_status: string;
  review_text: string;
  rating: number;
  badge_text: string;
  duration_text: string;
  category: "Weight Loss" | "Muscle Gain" | "Fat Loss" | "Body Recomp" | string;
  image_url: string;
  storage_path?: string;
  display_order?: number;
  created_at?: string;
}

/**
 * Client-side image compression using HTML5 Canvas API.
 * Resizes image to max 1920x1920 and compresses to WebP/JPEG format at 0.8 quality (~100KB - 300KB).
 * If compression fails for any reason, logs the error and gracefully falls back to the original file.
 */
const compressImageFile = (
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    try {
      // If file is already small (<= 150KB), resolve directly
      if (file.size <= 150 * 1024) {
        resolve(file);
        return;
      }

      const img = document.createElement("img");
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          console.warn("FileReader loaded empty result, falling back to original file.");
          resolve(file);
        }
      };

      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Scale down proportionally if wider/taller than max dimensions
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.warn("Canvas 2D context unavailable, falling back to original file.");
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Export to WebP format at 0.8 quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.warn("Canvas toBlob output empty, falling back to original file.");
                resolve(file);
                return;
              }

              const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
              const compressedFile = new File([blob], `${baseName}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
              });

              console.log(
                `Compressed image "${file.name}" (${(file.size / 1024).toFixed(1)}KB) -> "${compressedFile.name}" (${(compressedFile.size / 1024).toFixed(1)}KB)`
              );

              resolve(compressedFile);
            },
            "image/webp",
            quality
          );
        } catch (err) {
          console.error("Canvas image compression error, falling back to original file:", err);
          resolve(file);
        }
      };

      img.onerror = (err) => {
        console.error("Image load error during compression, falling back to original file:", err);
        resolve(file);
      };

      reader.onerror = (err) => {
        console.error("FileReader error during compression, falling back to original file:", err);
        resolve(file);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("compressImageFile top-level error, falling back to original file:", err);
      resolve(file);
    }
  });
};

const DEFAULT_WEBSITE_PLANS: WebsitePricingPlan[] = [
  {
    id: "9ef2d121-a601-4344-a165-2f465ee9c017",
    name: "Men Membership",
    category: "base",
    price: 4500,
    period: "/ month",
    features: [
      "Full Plate-Loaded & Weight Floor Access",
      "Locker & Shower Access",
      "Free Form & Posture Orientation",
      "No Treadmill Access",
      "Smart iGYM Mobile App Sync",
    ],
  },
  {
    id: "f7ac42f7-9c0d-41f9-ac6a-f1e01372cdb9",
    name: "Ladies Membership",
    category: "base",
    price: 3000,
    period: "/ month",
    features: [
      "Full Resistance & Weight Floor Access",
      "Locker & Shower Access",
      "Free Nutrition & Meal Assessment",
      "No Treadmill Access",
    ],
  },
  {
    id: "588d4813-2be4-4ed6-a0be-592cdea58eb6",
    name: "Student Special",
    category: "base",
    price: 2500,
    period: "/ month",
    features: [
      "Full Weight Floor Access",
      "Under-20 ID required at signup",
      "Free Initial Fitness Plan",
      "No Treadmill Access",
      "iGYM Mobile App Access",
    ],
  },
  {
    id: "1f354c06-9428-47ee-bb9d-bab483512100",
    name: "Couple Membership",
    category: "base",
    price: 5500,
    period: "/ month",
    features: [
      "2 Full Access Passes",
      "Weight Floor & Resistance Deck",
      "Locker & Shower Access",
      "No Treadmill Access",
      "Joint Progress Tracking",
    ],
  },
  {
    id: "0588e1cc-920e-43b1-be61-f7946e86d3d0",
    name: "Men Membership",
    category: "cardio",
    price: 5000,
    period: "/ month",
    features: [
      "Full Weight Floor & Power Cages",
      "20 Minutes Max Treadmill Access",
      "Locker & Shower Access",
      "Free Form & Posture Orientation",
      "Smart iGYM Mobile App Sync",
    ],
  },
  {
    id: "86340c2e-6bc3-4de9-a801-c98ce53901a5",
    name: "Ladies Membership",
    category: "cardio",
    price: 4500,
    period: "/ month",
    features: [
      "Full Weight & Cardio Area Access",
      "20 Minutes Max Treadmill Access",
      "Locker & Shower Access",
      "Free Nutrition & Meal Assessment",
    ],
  },
  {
    id: "890c165f-f5a1-4a4f-a560-5bd61c78a576",
    name: "Student Special",
    category: "cardio",
    price: 4000,
    period: "/ month",
    features: [
      "Full Weight Floor & Cardio Area Access",
      "Under-20 ID required at signup",
      "Free Initial Fitness Plan",
      "20 Minutes Max Treadmill Access",
      "iGYM Mobile App Access",
    ],
  },
  {
    id: "66c87226-3e3a-4eb6-8ae0-db8045eece3e",
    name: "Couple Membership",
    category: "cardio",
    price: 8500,
    period: "/ month",
    features: [
      "2 Full Access Passes (Weight Floor + Cardio Area)",
      "20 Minutes Max Treadmill Access for Both",
      "Locker & Shower Access",
      "Custom Diet Guidance",
      "Joint Progress Tracking",
    ],
  },
];

const DEFAULT_ABOUT_DATA: WebsiteAboutSectionData = {
  heading: "ELEVATE YOUR FITNESS JOURNEY",
  subheading: "ABOUT OUR GYM & PHILOSOPHY",
  paragraph_1:
    "Founded in 2019 in Balangoda, iGYM was built with a single mission: to empower individuals through disciplined training, state-of-the-art equipment, and expert coaching.",
  paragraph_2:
    "Whether you are looking to build raw strength, improve endurance, or transform your lifestyle, our supportive community and dedicated trainers are here to guide every step of your transformation.",
  quote_text: "Consistency is the key to unlocking your true physical potential.",
  quote_author: "iGYM Head Coach",
  badge_title: "ESTABLISHED 2019",
  badge_subtitle: "BALANGODA, SRI LANKA",
  image_url:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
};

const DEFAULT_FACILITY_CARDS: WebsiteFacilityCard[] = [
  {
    id: "fac-1",
    title: "Strength & Resistance Zone",
    description:
      "Heavy-duty squat racks, Olympic barbells, dumbbell racks up to 50kg, and plate-loaded machines built for intense bodybuilding & strength gains.",
    badge_text: "BODYBUILDING & STRENGTH",
    image_url:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
    display_order: 1,
  },
  {
    id: "fac-2",
    title: "Cardio & Endurance Deck",
    description:
      "Commercial treadmills, stationary cycles, and elliptical trainers with real-time heart-rate monitoring to maximize fat burn.",
    badge_text: "FAT BURN & STAMINA",
    image_url:
      "https://images.unsplash.com/photo-1576678927484-cc909957088c?w=800&auto=format&fit=crop&q=80",
    display_order: 2,
  },
  {
    id: "fac-3",
    title: "Functional & Core Arena",
    description:
      "Kettlebells, battle ropes, medicine balls, plyo boxes, and spacious mat space for high-intensity interval training and agility drills.",
    badge_text: "HIIT & MOBILITY",
    image_url:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    display_order: 3,
  },
];

const DEFAULT_GLOBAL_SETTINGS: WebsiteGlobalSettings = {
  id: 1,
  whatsapp_number: "+94771234567",
};

const DEFAULT_COACHES: WebsiteCoach[] = [
  {
    id: "coach-1",
    name: "Coach Marcus Vance",
    title: "Head Bodybuilding & Strength Specialist",
    rating: 5.0,
    certification: "IFBB Pro Card & NSCA-CSCS Certified",
    focus: "Hypertrophy, Powerlifting & Contest Prep",
    image_url:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&auto=format&fit=crop&q=80",
    display_order: 1,
  },
  {
    id: "coach-2",
    name: "Coach Elena Rostova",
    title: "Cardio & Functional HIIT Master Coach",
    rating: 4.9,
    certification: "ACE Certified Personal Trainer & Precision Nutrition",
    focus: "Fat Loss, Conditioning & Core Endurance",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80",
    display_order: 2,
  },
  {
    id: "coach-3",
    name: "Coach David Miller",
    title: "Rehabilitation & Athletic Performance Coach",
    rating: 4.8,
    certification: "NASM Master Trainer & Functional Movement Specialist",
    focus: "Posture Correction, Injury Rehab & Agility",
    image_url:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
    display_order: 3,
  },
];

const DEFAULT_APP_PROMO_DATA: WebsiteAppPromoData = {
  id: 1,
  badge_text: "IGYM MOBILE APP",
  heading: "WORKOUT & TRACK MEMBERSHIP ON THE GO",
  description:
    "Access digital attendance QR passes, track weight progress, view personal workout logs, and renew your membership directly from your smartphone.",
  feature_1: "Digital Attendance & QR Entry Pass",
  feature_2: "Real-Time Workout & Progress Tracking",
  feature_3: "Online Membership Renewal & Payments",
  feature_4: "Personal Trainer Guidance & Chat Support",
  image_url:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
};

const DEFAULT_TRANSFORMATIONS: WebsiteTransformation[] = [
  {
    id: "trans-1",
    member_name: "Kavinda Perera",
    member_status: "Verified iGYM Member",
    review_text:
      "iGYM transformed my lifestyle completely. With dedicated personal coaching and intense strength training, I shed fat and gained solid muscle mass.",
    rating: 5.0,
    badge_text: "LOST 14 KG",
    duration_text: "4 Months",
    category: "Weight Loss",
    image_url:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80",
    display_order: 1,
  },
  {
    id: "trans-2",
    member_name: "Sahan Fernando",
    member_status: "Verified iGYM Member",
    review_text:
      "The cardio deck and nutrition guidelines at iGYM were game changers for me. Consistently hitting targets helped me reach peak conditioning.",
    rating: 5.0,
    badge_text: "GAINED 8 KG MUSCLE",
    duration_text: "6 Months",
    category: "Muscle Gain",
    image_url:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80",
    display_order: 2,
  },
];

type SettingsTabKey =
  | "pricing"
  | "gallery"
  | "about"
  | "facilities"
  | "contact"
  | "coaches"
  | "app-promo"
  | "transformations";

export default function WebsiteSettingsView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("pricing");
  const [plans, setPlans] = useState<WebsitePricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Edit Modal State
  const [editingPlan, setEditingPlan] = useState<WebsitePricingPlan | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    category: "base" | "cardio" | string;
    price: number;
    period: string;
    badge: string;
    popular: boolean;
    features: string[];
  }>({
    name: "",
    category: "base",
    price: 0,
    period: "/ month",
    badge: "",
    popular: false,
    features: [],
  });
  const [newFeatureText, setNewFeatureText] = useState<string>("");

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<WebsiteGalleryImage[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  // About Section State
  const [aboutData, setAboutData] = useState<WebsiteAboutSectionData>(DEFAULT_ABOUT_DATA);
  const [isAboutLoading, setIsAboutLoading] = useState<boolean>(true);
  const [isAboutSaving, setIsAboutSaving] = useState<boolean>(false);
  const [aboutSelectedFile, setAboutSelectedFile] = useState<File | null>(null);
  const [aboutPreviewUrl, setAboutPreviewUrl] = useState<string | null>(null);

  // Facility Cards State
  const [facilityCards, setFacilityCards] = useState<WebsiteFacilityCard[]>([]);
  const [isFacilityLoading, setIsFacilityLoading] = useState<boolean>(true);
  const [isFacilitySaving, setIsFacilitySaving] = useState<boolean>(false);
  const [deletingFacilityId, setDeletingFacilityId] = useState<string | null>(null);

  // Facility Modal / Form State
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState<boolean>(false);
  const [editingFacilityCard, setEditingFacilityCard] = useState<WebsiteFacilityCard | null>(null);
  const [facilityForm, setFacilityForm] = useState<{
    title: string;
    description: string;
    badge_text: string;
    image_url: string;
  }>({
    title: "",
    description: "",
    badge_text: "",
    image_url: "",
  });
  const [facilitySelectedFile, setFacilitySelectedFile] = useState<File | null>(null);
  const [facilityPreviewUrl, setFacilityPreviewUrl] = useState<string | null>(null);

  // Global Contact Settings State
  const [globalSettings, setGlobalSettings] = useState<WebsiteGlobalSettings>(DEFAULT_GLOBAL_SETTINGS);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(true);
  const [isGlobalSaving, setIsGlobalSaving] = useState<boolean>(false);

  // Coaches State
  const [coaches, setCoaches] = useState<WebsiteCoach[]>([]);
  const [isCoachesLoading, setIsCoachesLoading] = useState<boolean>(true);
  const [isCoachSaving, setIsCoachSaving] = useState<boolean>(false);
  const [deletingCoachId, setDeletingCoachId] = useState<string | null>(null);

  // Coach Modal / Form State
  const [isCoachModalOpen, setIsCoachModalOpen] = useState<boolean>(false);
  const [editingCoach, setEditingCoach] = useState<WebsiteCoach | null>(null);
  const [coachForm, setCoachForm] = useState<{
    name: string;
    title: string;
    rating: number;
    certification: string;
    focus: string;
    image_url: string;
  }>({
    name: "",
    title: "",
    rating: 4.9,
    certification: "",
    focus: "",
    image_url: "",
  });
  const [coachSelectedFile, setCoachSelectedFile] = useState<File | null>(null);
  const [coachPreviewUrl, setCoachPreviewUrl] = useState<string | null>(null);

  // App Promo Section State
  const [appPromoData, setAppPromoData] = useState<WebsiteAppPromoData>(DEFAULT_APP_PROMO_DATA);
  const [isAppPromoLoading, setIsAppPromoLoading] = useState<boolean>(true);
  const [isAppPromoSaving, setIsAppPromoSaving] = useState<boolean>(false);
  const [appPromoSelectedFile, setAppPromoSelectedFile] = useState<File | null>(null);
  const [appPromoPreviewUrl, setAppPromoPreviewUrl] = useState<string | null>(null);

  // Member Transformations State
  const [transformations, setTransformations] = useState<WebsiteTransformation[]>([]);
  const [isTransLoading, setIsTransLoading] = useState<boolean>(true);
  const [isTransSaving, setIsTransSaving] = useState<boolean>(false);
  const [deletingTransId, setDeletingTransId] = useState<string | null>(null);

  // Transformation Modal / Form State
  const [isTransModalOpen, setIsTransModalOpen] = useState<boolean>(false);
  const [editingTrans, setEditingTrans] = useState<WebsiteTransformation | null>(null);
  const [transForm, setTransForm] = useState<{
    member_name: string;
    member_status: string;
    review_text: string;
    rating: number;
    badge_text: string;
    duration_text: string;
    category: "Weight Loss" | "Muscle Gain" | "Fat Loss" | "Body Recomp" | string;
    image_url: string;
  }>({
    member_name: "",
    member_status: "Verified iGYM Member",
    review_text: "",
    rating: 5.0,
    badge_text: "",
    duration_text: "",
    category: "Weight Loss",
    image_url: "",
  });
  const [transSelectedFile, setTransSelectedFile] = useState<File | null>(null);
  const [transPreviewUrl, setTransPreviewUrl] = useState<string | null>(null);

  // Auto-dismiss alert notices
  const showNotice = (type: "success" | "error" | "info", text: string) => {
    setStatusNotice({ type, text });
    setTimeout(() => setStatusNotice(null), 5000);
  };

  // Fetch Pricing Plans from Supabase
  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_pricing_plans")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Supabase fetch error:", error);
        setPlans(DEFAULT_WEBSITE_PLANS);
      } else if (data && data.length > 0) {
        const formattedPlans: WebsitePricingPlan[] = data.map((item: any) => {
          let parsedFeatures: string[] = [];
          if (Array.isArray(item.features)) {
            parsedFeatures = item.features;
          } else if (typeof item.features === "string") {
            try {
              parsedFeatures = JSON.parse(item.features);
            } catch {
              parsedFeatures = [item.features];
            }
          }
          return {
            id: String(item.id),
            name: item.name || item.title || "Package Plan",
            category: (item.category === "cardio" ? "cardio" : "base") as "base" | "cardio",
            price: Number(item.price) || 0,
            period: item.period || item.billing_cycle || "/ month",
            badge: item.badge || (item.popular ? "Popular" : "Standard"),
            popular: Boolean(item.popular),
            features: parsedFeatures.length > 0 ? parsedFeatures : ["Standard Gym Access"],
            created_at: item.created_at,
          };
        });
        setPlans(formattedPlans);
      } else {
        setPlans(DEFAULT_WEBSITE_PLANS);
      }
    } catch (err: any) {
      console.error("Error fetching pricing plans:", err);
      setPlans(DEFAULT_WEBSITE_PLANS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Gallery Images from Supabase
  const fetchGalleryImages = useCallback(async () => {
    setIsGalleryLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_gallery_images")
        .select("id, image_url")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gallery Fetch Error:", error);
        alert("Gallery Fetch Error: " + JSON.stringify(error));
        setGalleryImages([]);
      } else {
        console.log("Fetched Gallery:", data);
        setGalleryImages((data as WebsiteGalleryImage[]) || []);
      }
    } catch (err: any) {
      console.error("Gallery Fetch Error:", err);
      alert("Gallery Fetch Error: " + (err?.message || JSON.stringify(err)));
      setGalleryImages([]);
    } finally {
      setIsGalleryLoading(false);
    }
  }, []);

  // Fetch About Section Data from Supabase (where id = 1)
  const fetchAboutSection = useCallback(async () => {
    setIsAboutLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_about_section")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("Supabase fetch about section error:", error);
      } else if (data) {
        setAboutData({
          id: 1,
          heading: data.heading || DEFAULT_ABOUT_DATA.heading,
          subheading: data.subheading || DEFAULT_ABOUT_DATA.subheading,
          paragraph_1: data.paragraph_1 || DEFAULT_ABOUT_DATA.paragraph_1,
          paragraph_2: data.paragraph_2 || DEFAULT_ABOUT_DATA.paragraph_2,
          quote_text: data.quote_text || DEFAULT_ABOUT_DATA.quote_text,
          quote_author: data.quote_author || DEFAULT_ABOUT_DATA.quote_author,
          badge_title: data.badge_title || DEFAULT_ABOUT_DATA.badge_title,
          badge_subtitle: data.badge_subtitle || DEFAULT_ABOUT_DATA.badge_subtitle,
          image_url: data.image_url || DEFAULT_ABOUT_DATA.image_url,
          storage_path: data.storage_path || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching about section:", err);
    } finally {
      setIsAboutLoading(false);
    }
  }, []);

  // Fetch Facility Cards from Supabase
  const fetchFacilityCards = useCallback(async () => {
    setIsFacilityLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_facility_cards")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Supabase fetch facility cards error:", error);
        setFacilityCards(DEFAULT_FACILITY_CARDS);
      } else if (data && data.length > 0) {
        const formattedData: WebsiteFacilityCard[] = data.map((item: any) => ({
          id: String(item.id),
          title: item.title || "Facility Card",
          description: item.description || "",
          badge_text: item.badge_text || item.badge || "",
          image_url: item.image_url || "",
          storage_path: item.storage_path || "",
          display_order: item.display_order || 0,
          created_at: item.created_at,
        }));
        setFacilityCards(formattedData);
      } else {
        setFacilityCards(DEFAULT_FACILITY_CARDS);
      }
    } catch (err: any) {
      console.error("Error fetching facility cards:", err);
      setFacilityCards(DEFAULT_FACILITY_CARDS);
    } finally {
      setIsFacilityLoading(false);
    }
  }, []);

  // Fetch Global Contact Settings (id = 1)
  const fetchGlobalSettings = useCallback(async () => {
    setIsGlobalLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_global_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("Supabase fetch global settings error:", error);
      } else if (data) {
        setGlobalSettings({
          id: 1,
          whatsapp_number: data.whatsapp_number || DEFAULT_GLOBAL_SETTINGS.whatsapp_number,
        });
      }
    } catch (err: any) {
      console.error("Error fetching global settings:", err);
    } finally {
      setIsGlobalLoading(false);
    }
  }, []);

  // Fetch Coaches from Supabase
  const fetchCoaches = useCallback(async () => {
    setIsCoachesLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_coaches")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Supabase fetch coaches error:", error);
        setCoaches(DEFAULT_COACHES);
      } else if (data && data.length > 0) {
        const formattedData: WebsiteCoach[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name || "Coach",
          title: item.title || "",
          rating: Number(item.rating) || 4.9,
          certification: item.certification || "",
          focus: item.focus || "",
          image_url: item.image_url || "",
          storage_path: item.storage_path || "",
          display_order: item.display_order || 0,
          created_at: item.created_at,
        }));
        setCoaches(formattedData);
      } else {
        setCoaches(DEFAULT_COACHES);
      }
    } catch (err: any) {
      console.error("Error fetching coaches:", err);
      setCoaches(DEFAULT_COACHES);
    } finally {
      setIsCoachesLoading(false);
    }
  }, []);

  // Fetch App Promo Section Data from Supabase (where id = 1)
  const fetchAppPromoSection = useCallback(async () => {
    setIsAppPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_app_promo_section")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("Supabase fetch app promo section error:", error);
      } else if (data) {
        setAppPromoData({
          id: 1,
          badge_text: data.badge_text || DEFAULT_APP_PROMO_DATA.badge_text,
          heading: data.heading || DEFAULT_APP_PROMO_DATA.heading,
          description: data.description || DEFAULT_APP_PROMO_DATA.description,
          feature_1: data.feature_1 || DEFAULT_APP_PROMO_DATA.feature_1,
          feature_2: data.feature_2 || DEFAULT_APP_PROMO_DATA.feature_2,
          feature_3: data.feature_3 || DEFAULT_APP_PROMO_DATA.feature_3,
          feature_4: data.feature_4 || DEFAULT_APP_PROMO_DATA.feature_4,
          image_url: data.image_url || DEFAULT_APP_PROMO_DATA.image_url,
          storage_path: data.storage_path || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching app promo section:", err);
    } finally {
      setIsAppPromoLoading(false);
    }
  }, []);

  // Fetch Member Transformations from Supabase (created_at descending)
  const fetchTransformations = useCallback(async () => {
    setIsTransLoading(true);
    try {
      const { data, error } = await supabase
        .from("website_transformations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch transformations error:", error);
        setTransformations(DEFAULT_TRANSFORMATIONS);
      } else if (data && data.length > 0) {
        const formattedData: WebsiteTransformation[] = data.map((item: any) => ({
          id: String(item.id),
          member_name: item.member_name || "iGYM Member",
          member_status: item.member_status || "Verified iGYM Member",
          review_text: item.review_text || "",
          rating: Number(item.rating) || 5.0,
          badge_text: item.badge_text || "TRANSFORMATION",
          duration_text: item.duration_text || "Result",
          category: item.category || "Weight Loss",
          image_url: item.image_url || "",
          storage_path: item.storage_path || "",
          display_order: item.display_order || 0,
          created_at: item.created_at,
        }));
        setTransformations(formattedData);
      } else {
        setTransformations(DEFAULT_TRANSFORMATIONS);
      }
    } catch (err: any) {
      console.error("Error fetching transformations:", err);
      setTransformations(DEFAULT_TRANSFORMATIONS);
    } finally {
      setIsTransLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchGalleryImages();
    fetchAboutSection();
    fetchFacilityCards();
    fetchGlobalSettings();
    fetchCoaches();
    fetchAppPromoSection();
    fetchTransformations();
  }, [
    fetchPlans,
    fetchGalleryImages,
    fetchAboutSection,
    fetchFacilityCards,
    fetchGlobalSettings,
    fetchCoaches,
    fetchAppPromoSection,
    fetchTransformations,
  ]);

  // Handle About Section image file selection
  const handleAboutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("error", "Please select a valid image file for the About section.");
      return;
    }

    setAboutSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAboutPreviewUrl(url);
  };

  const handleClearAboutSelectedFile = () => {
    setAboutSelectedFile(null);
    if (aboutPreviewUrl) {
      URL.revokeObjectURL(aboutPreviewUrl);
      setAboutPreviewUrl(null);
    }
  };

  // Save/Update About Section record in Supabase (where id = 1)
  const handleSaveAboutSection = async () => {
    setIsAboutSaving(true);
    try {
      let finalImageUrl = aboutData.image_url;
      let finalStoragePath = aboutData.storage_path;

      // 1. Upload new image file if selected
      if (aboutSelectedFile) {
        const compressedFile = await compressImageFile(aboutSelectedFile, 1920, 1920, 0.8);
        const fileExt = compressedFile.name.split(".").pop() || "webp";
        const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `about_${Date.now()}_${sanitizedName}.${fileExt}`;

        const { error: uploadErr } = await supabase
          .storage
          .from("website_gallery")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          console.error("About section image upload error:", uploadErr);
          alert("Error saving: " + uploadErr.message);
          setIsAboutSaving(false);
          return;
        }

        const { data: urlData } = supabase
          .storage
          .from("website_gallery")
          .getPublicUrl(fileName);

        finalImageUrl = urlData.publicUrl;
        finalStoragePath = fileName;
      }

      // 2. Prepare payload matching exact database columns
      const payload = {
        heading: aboutData.heading.trim(),
        subheading: aboutData.subheading.trim(),
        paragraph_1: aboutData.paragraph_1.trim(),
        paragraph_2: aboutData.paragraph_2.trim(),
        quote_text: aboutData.quote_text.trim(),
        quote_author: aboutData.quote_author.trim(),
        badge_title: aboutData.badge_title.trim(),
        badge_subtitle: aboutData.badge_subtitle.trim(),
        image_url: finalImageUrl,
        storage_path: finalStoragePath || "",
      };

      // 3. Strictly update where id = 1
      const { error } = await supabase
        .from("website_about_section")
        .update(payload)
        .eq("id", 1);

      // 4. Catch database error
      if (error) {
        console.error("Supabase update error:", error);
        alert("Error saving: " + error.message);
        setIsAboutSaving(false);
        return;
      }

      // 5. Success feedback & state reset
      alert("About section saved successfully!");
      setAboutData((prev) => ({
        ...prev,
        ...payload,
      }));
      setAboutSelectedFile(null);
      if (aboutPreviewUrl) {
        URL.revokeObjectURL(aboutPreviewUrl);
        setAboutPreviewUrl(null);
      }

      showNotice("success", "About section saved successfully!");
      router.refresh();
      await fetchAboutSection();
    } catch (err: any) {
      console.error("Error saving About section:", err);
      alert("Error saving: " + (err?.message || err));
    } finally {
      setIsAboutSaving(false);
    }
  };

  // Facility Card Event Handlers
  const handleOpenAddFacilityModal = () => {
    setEditingFacilityCard(null);
    setFacilityForm({
      title: "",
      description: "",
      badge_text: "",
      image_url: "",
    });
    setFacilitySelectedFile(null);
    if (facilityPreviewUrl) {
      URL.revokeObjectURL(facilityPreviewUrl);
      setFacilityPreviewUrl(null);
    }
    setIsFacilityModalOpen(true);
  };

  const handleOpenEditFacilityModal = (card: WebsiteFacilityCard) => {
    setEditingFacilityCard(card);
    setFacilityForm({
      title: card.title,
      description: card.description,
      badge_text: card.badge_text || "",
      image_url: card.image_url,
    });
    setFacilitySelectedFile(null);
    if (facilityPreviewUrl) {
      URL.revokeObjectURL(facilityPreviewUrl);
      setFacilityPreviewUrl(null);
    }
    setIsFacilityModalOpen(true);
  };

  const handleFacilityFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("error", "Please select a valid image file.");
      return;
    }

    setFacilitySelectedFile(file);
    const url = URL.createObjectURL(file);
    setFacilityPreviewUrl(url);
  };

  const handleClearFacilitySelectedFile = () => {
    setFacilitySelectedFile(null);
    if (facilityPreviewUrl) {
      URL.revokeObjectURL(facilityPreviewUrl);
      setFacilityPreviewUrl(null);
    }
  };

  // Save / Insert / Update Facility Card
  const handleSaveFacilityCard = async () => {
    const title = facilityForm.title.trim();
    const description = facilityForm.description.trim();
    const badge_text = facilityForm.badge_text.trim();
    let image_url = facilityForm.image_url.trim();
    let storage_path = editingFacilityCard?.storage_path || "";

    if (!title) {
      alert("Please enter a facility title.");
      return;
    }
    if (!description) {
      alert("Please enter a facility description.");
      return;
    }

    setIsFacilitySaving(true);
    try {
      // Upload image if selected
      if (facilitySelectedFile) {
        const compressedFile = await compressImageFile(facilitySelectedFile, 1920, 1920, 0.8);
        const fileExt = compressedFile.name.split(".").pop() || "webp";
        const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `facility_${Date.now()}_${sanitizedName}.${fileExt}`;

        const { error: uploadErr } = await supabase
          .storage
          .from("website_gallery")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          console.error("Facility image upload error:", uploadErr);
          alert("DB Error: " + uploadErr.message);
          setIsFacilitySaving(false);
          return;
        }

        const { data: urlData } = supabase
          .storage
          .from("website_gallery")
          .getPublicUrl(fileName);

        image_url = urlData.publicUrl;
        storage_path = fileName;
      }

      if (!image_url) {
        alert("Please select or upload a facility image.");
        setIsFacilitySaving(false);
        return;
      }

      if (editingFacilityCard) {
        // Strict Update
        const { data: updatedRows, error } = await supabase
          .from("website_facility_cards")
          .update({
            title,
            description,
            badge_text,
            image_url,
            storage_path,
          })
          .eq("id", editingFacilityCard.id)
          .select();

        if (error) {
          alert("DB Error: " + error.message);
          setIsFacilitySaving(false);
          return;
        }

        const updatedObj: WebsiteFacilityCard =
          updatedRows && updatedRows[0]
            ? {
                id: String(updatedRows[0].id),
                title: updatedRows[0].title || title,
                description: updatedRows[0].description || description,
                badge_text: updatedRows[0].badge_text || badge_text,
                image_url: updatedRows[0].image_url || image_url,
                storage_path: updatedRows[0].storage_path || storage_path,
                display_order: updatedRows[0].display_order || editingFacilityCard.display_order,
              }
            : {
                ...editingFacilityCard,
                title,
                description,
                badge_text,
                image_url,
                storage_path,
              };

        setFacilityCards((prev) =>
          prev.map((c) => (c.id === editingFacilityCard.id ? updatedObj : c))
        );
        showNotice("success", "Facility card updated successfully!");
        alert("Facility card updated successfully!");
      } else {
        // Strict Insert
        const { data: newRows, error } = await supabase
          .from("website_facility_cards")
          .insert([
            {
              title,
              description,
              badge_text,
              image_url,
              storage_path,
              display_order: facilityCards.length + 1,
            },
          ])
          .select();

        if (error) {
          alert("DB Error: " + error.message);
          setIsFacilitySaving(false);
          return;
        }

        const newObj: WebsiteFacilityCard =
          newRows && newRows[0]
            ? {
                id: String(newRows[0].id),
                title: newRows[0].title || title,
                description: newRows[0].description || description,
                badge_text: newRows[0].badge_text || badge_text,
                image_url: newRows[0].image_url || image_url,
                storage_path: newRows[0].storage_path || storage_path,
                display_order: newRows[0].display_order || facilityCards.length + 1,
              }
            : {
                id: Date.now().toString(),
                title,
                description,
                badge_text,
                image_url,
                storage_path,
                display_order: facilityCards.length + 1,
              };

        setFacilityCards((prev) => [...prev, newObj]);
        showNotice("success", "Facility card added successfully!");
        alert("Facility card added successfully!");
      }

      setIsFacilityModalOpen(false);
      setEditingFacilityCard(null);
      setFacilitySelectedFile(null);
      if (facilityPreviewUrl) {
        URL.revokeObjectURL(facilityPreviewUrl);
        setFacilityPreviewUrl(null);
      }

      router.refresh();
      await fetchFacilityCards();
    } catch (err: any) {
      console.error("Error saving facility card:", err);
      alert("DB Error: " + (err?.message || err));
    } finally {
      setIsFacilitySaving(false);
    }
  };

  // Delete Facility Card
  const handleDeleteFacilityCard = async (card: WebsiteFacilityCard) => {
    if (!confirm(`Are you sure you want to delete "${card.title}"?`)) {
      return;
    }

    setDeletingFacilityId(card.id);
    try {
      const storagePath =
        card.storage_path ||
        card.image_url.split("/website_gallery/").pop()?.split("?")[0];

      if (storagePath && storagePath.startsWith("facility_")) {
        const { error: storageErr } = await supabase
          .storage
          .from("website_gallery")
          .remove([storagePath]);

        if (storageErr) {
          console.warn("Storage removal notice:", storageErr.message);
        }
      }

      const { error } = await supabase
        .from("website_facility_cards")
        .delete()
        .eq("id", card.id);

      if (error) {
        alert("DB Error: " + error.message);
        setDeletingFacilityId(null);
        return;
      }

      setFacilityCards((prev) => prev.filter((item) => String(item.id) !== String(card.id)));
      showNotice("success", "Facility card deleted successfully.");
      router.refresh();
      await fetchFacilityCards();
    } catch (err: any) {
      console.error("Delete facility card error:", err);
      alert("DB Error: " + (err?.message || err));
    } finally {
      setDeletingFacilityId(null);
    }
  };

  // Save WhatsApp Number to website_global_settings (id = 1)
  const handleSaveGlobalSettings = async () => {
    const whatsapp_number = globalSettings.whatsapp_number.trim();
    if (!whatsapp_number) {
      alert("Please enter a WhatsApp number.");
      return;
    }

    setIsGlobalSaving(true);
    try {
      const payload = {
        id: 1,
        whatsapp_number,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("website_global_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        console.error("Supabase update global settings error:", error);
        alert("DB Error: " + error.message);
        setIsGlobalSaving(false);
        return;
      }

      showNotice("success", "WhatsApp number saved successfully!");
      alert("WhatsApp number saved successfully!");
      router.refresh();
      await fetchGlobalSettings();
    } catch (err: any) {
      console.error("Error saving global settings:", err);
      alert("DB Error: " + (err?.message || err));
    } finally {
      setIsGlobalSaving(false);
    }
  };

  // Coach Modal Handlers
  const handleOpenAddCoachModal = () => {
    setEditingCoach(null);
    setCoachForm({
      name: "",
      title: "",
      rating: 4.9,
      certification: "",
      focus: "",
      image_url: "",
    });
    setCoachSelectedFile(null);
    if (coachPreviewUrl) {
      URL.revokeObjectURL(coachPreviewUrl);
      setCoachPreviewUrl(null);
    }
    setIsCoachModalOpen(true);
  };

  const handleOpenEditCoachModal = (coach: WebsiteCoach) => {
    setEditingCoach(coach);
    setCoachForm({
      name: coach.name,
      title: coach.title,
      rating: coach.rating || 4.9,
      certification: coach.certification || "",
      focus: coach.focus || "",
      image_url: coach.image_url,
    });
    setCoachSelectedFile(null);
    if (coachPreviewUrl) {
      URL.revokeObjectURL(coachPreviewUrl);
      setCoachPreviewUrl(null);
    }
    setIsCoachModalOpen(true);
  };

  const handleCoachFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("error", "Please select a valid image file for the coach.");
      return;
    }

    setCoachSelectedFile(file);
    const url = URL.createObjectURL(file);
    setCoachPreviewUrl(url);
  };

  const handleClearCoachSelectedFile = () => {
    setCoachSelectedFile(null);
    if (coachPreviewUrl) {
      URL.revokeObjectURL(coachPreviewUrl);
      setCoachPreviewUrl(null);
    }
  };

  // Save Coach (Insert / Update) with Client-Side Image Compression (max width 800px)
  const handleSaveCoach = async () => {
    const name = coachForm.name.trim();
    const title = coachForm.title.trim();
    const rating = Number(coachForm.rating) || 4.9;
    const certification = coachForm.certification.trim();
    const focus = coachForm.focus.trim();
    let image_url = coachForm.image_url.trim();
    let storage_path = editingCoach?.storage_path || "";

    if (!name) {
      alert("Please enter the coach's name.");
      return;
    }
    if (!title) {
      alert("Please enter the coach's title.");
      return;
    }

    setIsCoachSaving(true);
    try {
      // Upload coach image with client-side compression (max-width: 800px)
      if (coachSelectedFile) {
        const compressedFile = await compressImageFile(coachSelectedFile, 800, 800, 0.8);
        const fileExt = compressedFile.name.split(".").pop() || "webp";
        const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `coach_${Date.now()}_${sanitizedName}.${fileExt}`;

        const { error: uploadErr } = await supabase
          .storage
          .from("website_gallery")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          console.error("Coach photo upload error:", uploadErr);
          alert("DB Error: " + uploadErr.message);
          setIsCoachSaving(false);
          return;
        }

        const { data: urlData } = supabase
          .storage
          .from("website_gallery")
          .getPublicUrl(fileName);

        image_url = urlData.publicUrl;
        storage_path = fileName;
      }

      if (!image_url) {
        alert("Please select or upload a photo for the coach.");
        setIsCoachSaving(false);
        return;
      }

      if (editingCoach) {
        // Strict Update
        const { data: updatedRows, error } = await supabase
          .from("website_coaches")
          .update({
            name,
            title,
            rating,
            certification,
            focus,
            image_url,
            storage_path,
          })
          .eq("id", editingCoach.id)
          .select();

        if (error) {
          alert("DB Error: " + error.message);
          setIsCoachSaving(false);
          return;
        }

        const updatedObj: WebsiteCoach = updatedRows && updatedRows[0]
          ? {
              id: String(updatedRows[0].id),
              name: updatedRows[0].name || name,
              title: updatedRows[0].title || title,
              rating: Number(updatedRows[0].rating) || rating,
              certification: updatedRows[0].certification || certification,
              focus: updatedRows[0].focus || focus,
              image_url: updatedRows[0].image_url || image_url,
              storage_path: updatedRows[0].storage_path || storage_path,
              display_order: updatedRows[0].display_order || editingCoach.display_order,
            }
          : {
              ...editingCoach,
              name,
              title,
              rating,
              certification,
              focus,
              image_url,
              storage_path,
            };

        setCoaches((prev) =>
          prev.map((c) => (c.id === editingCoach.id ? updatedObj : c))
        );
        showNotice("success", "Coach updated successfully!");
        alert("Coach updated successfully!");
      } else {
        // Strict Insert
        const { data: newRows, error } = await supabase
          .from("website_coaches")
          .insert([
            {
              name,
              title,
              rating,
              certification,
              focus,
              image_url,
              storage_path,
              display_order: coaches.length + 1,
            },
          ])
          .select();

        if (error) {
          alert("DB Error: " + error.message);
          setIsCoachSaving(false);
          return;
        }

        const newObj: WebsiteCoach = newRows && newRows[0]
          ? {
              id: String(newRows[0].id),
              name: newRows[0].name || name,
              title: newRows[0].title || title,
              rating: Number(newRows[0].rating) || rating,
              certification: newRows[0].certification || certification,
              focus: newRows[0].focus || focus,
              image_url: newRows[0].image_url || image_url,
              storage_path: newRows[0].storage_path || storage_path,
              display_order: newRows[0].display_order || coaches.length + 1,
            }
          : {
              id: Date.now().toString(),
              name,
              title,
              rating,
              certification,
              focus,
              image_url,
              storage_path,
              display_order: coaches.length + 1,
            };

        setCoaches((prev) => [...prev, newObj]);
        showNotice("success", "Coach added successfully!");
        alert("Coach added successfully!");
      }

      setIsCoachModalOpen(false);
      setEditingCoach(null);
      setCoachSelectedFile(null);
      if (coachPreviewUrl) {
        URL.revokeObjectURL(coachPreviewUrl);
        setCoachPreviewUrl(null);
      }

      router.refresh();
      await fetchCoaches();
    } catch (err: any) {
      console.error("Error saving coach:", err);
      alert("DB Error: " + (err?.message || err));
    } finally {
      setIsCoachSaving(false);
    }
  };

  // Delete Coach
  const handleDeleteCoach = async (coach: WebsiteCoach) => {
    if (!confirm(`Are you sure you want to delete coach "${coach.name}"?`)) {
      return;
    }

    setDeletingCoachId(coach.id);
    try {
      const storagePath =
        coach.storage_path ||
        coach.image_url.split("/website_gallery/").pop()?.split("?")[0];

      if (storagePath && storagePath.startsWith("coach_")) {
        const { error: storageErr } = await supabase
          .storage
          .from("website_gallery")
          .remove([storagePath]);

        if (storageErr) {
          console.warn("Storage removal notice:", storageErr.message);
        }
      }

      const { error } = await supabase
        .from("website_coaches")
        .delete()
        .eq("id", coach.id);

      if (error) {
        alert("DB Error: " + error.message);
        setDeletingCoachId(null);
        return;
      }

      setCoaches((prev) => prev.filter((item) => String(item.id) !== String(coach.id)));
      showNotice("success", "Coach deleted successfully.");
      router.refresh();
      await fetchCoaches();
    } catch (err: any) {
      console.error("Delete coach error:", err);
      alert("DB Error: " + (err?.message || err));
    } finally {
      setDeletingCoachId(null);
    }
  };

  // App Promo file selection
  const handleAppPromoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("error", "Please select a valid image file for the app promo section.");
      return;
    }

    setAppPromoSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAppPromoPreviewUrl(url);
  };

  const handleClearAppPromoSelectedFile = () => {
    setAppPromoSelectedFile(null);
    if (appPromoPreviewUrl) {
      URL.revokeObjectURL(appPromoPreviewUrl);
      setAppPromoPreviewUrl(null);
    }
  };

  // Save/Update App Promo Section record in Supabase (where id = 1)
  const handleSaveAppPromoSection = async () => {
    setIsAppPromoSaving(true);
    try {
      let finalImageUrl = appPromoData.image_url;
      let finalStoragePath = appPromoData.storage_path;

      // 1. Upload compressed image file if selected
      if (appPromoSelectedFile) {
        const compressedFile = await compressImageFile(appPromoSelectedFile, 1920, 1920, 0.8);
        const fileExt = compressedFile.name.split(".").pop() || "webp";
        const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `app_promo_${Date.now()}_${sanitizedName}.${fileExt}`;

        const { error: uploadErr } = await supabase
          .storage
          .from("website_gallery")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          console.error("App promo image upload error:", uploadErr);
          alert("Error saving: " + uploadErr.message);
          setIsAppPromoSaving(false);
          return;
        }

        const { data: urlData } = supabase
          .storage
          .from("website_gallery")
          .getPublicUrl(fileName);

        finalImageUrl = urlData.publicUrl;
        finalStoragePath = fileName;
      }

      // 2. Prepare payload matching exact database columns
      const payload = {
        badge_text: appPromoData.badge_text.trim(),
        heading: appPromoData.heading.trim(),
        description: appPromoData.description.trim(),
        feature_1: appPromoData.feature_1.trim(),
        feature_2: appPromoData.feature_2.trim(),
        feature_3: appPromoData.feature_3.trim(),
        feature_4: appPromoData.feature_4.trim(),
        image_url: finalImageUrl,
        storage_path: finalStoragePath || "",
        updated_at: new Date().toISOString(),
      };

      // 3. Strictly update where id = 1
      const { error } = await supabase
        .from("website_app_promo_section")
        .update(payload)
        .eq("id", 1);

      if (error) {
        console.error("Supabase update app promo error:", error);
        alert("Error saving: " + error.message);
        setIsAppPromoSaving(false);
        return;
      }

      // 4. Success feedback & instant state reset
      alert("App promo section saved successfully!");
      setAppPromoData((prev) => ({
        ...prev,
        ...payload,
      }));
      setAppPromoSelectedFile(null);
      if (appPromoPreviewUrl) {
        URL.revokeObjectURL(appPromoPreviewUrl);
        setAppPromoPreviewUrl(null);
      }

      showNotice("success", "App promo section saved successfully!");
      router.refresh();
      await fetchAppPromoSection();
    } catch (err: any) {
      console.error("Error saving app promo section:", err);
      alert("Error saving: " + (err?.message || err));
    } finally {
      setIsAppPromoSaving(false);
    }
  };

  // Transformation Modal Handlers
  const handleOpenAddTransModal = () => {
    setEditingTrans(null);
    setTransForm({
      member_name: "",
      member_status: "Verified iGYM Member",
      review_text: "",
      rating: 5.0,
      badge_text: "",
      duration_text: "",
      category: "Weight Loss",
      image_url: "",
    });
    setTransSelectedFile(null);
    if (transPreviewUrl) {
      URL.revokeObjectURL(transPreviewUrl);
      setTransPreviewUrl(null);
    }
    setIsTransModalOpen(true);
  };

  const handleOpenEditTransModal = (trans: WebsiteTransformation) => {
    setEditingTrans(trans);
    setTransForm({
      member_name: trans.member_name,
      member_status: trans.member_status || "Verified iGYM Member",
      review_text: trans.review_text || "",
      rating: trans.rating || 5.0,
      badge_text: trans.badge_text || "",
      duration_text: trans.duration_text || "",
      category: trans.category || "Weight Loss",
      image_url: trans.image_url || "",
    });
    setTransSelectedFile(null);
    if (transPreviewUrl) {
      URL.revokeObjectURL(transPreviewUrl);
      setTransPreviewUrl(null);
    }
    setIsTransModalOpen(true);
  };

  const handleTransFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("error", "Please select a valid image file for the transformation.");
      return;
    }

    setTransSelectedFile(file);
    const url = URL.createObjectURL(file);
    setTransPreviewUrl(url);
  };

  const handleClearTransSelectedFile = () => {
    setTransSelectedFile(null);
    if (transPreviewUrl) {
      URL.revokeObjectURL(transPreviewUrl);
      setTransPreviewUrl(null);
    }
  };

  // Save/Update Transformation with Canvas Compression
  const handleSaveTransformation = async () => {
    const member_name = transForm.member_name.trim();
    const member_status = transForm.member_status.trim() || "Verified iGYM Member";
    const review_text = transForm.review_text.trim();
    const rating = Number(transForm.rating) || 5.0;
    const badge_text = transForm.badge_text.trim();
    const duration_text = transForm.duration_text.trim();
    const category = transForm.category;
    let image_url = transForm.image_url.trim();
    let storage_path = editingTrans?.storage_path || "";

    if (!member_name) {
      alert("Please enter the member name.");
      return;
    }
    if (!badge_text) {
      alert("Please enter the badge text (e.g. LOST 14 KG).");
      return;
    }
    if (!duration_text) {
      alert("Please enter the duration text (e.g. 4 Months).");
      return;
    }
    if (!review_text) {
      alert("Please enter the review text.");
      return;
    }

    setIsTransSaving(true);
    try {
      // Intercept file upload & compress using canvas (max width 1920px, target ~100KB-300KB)
      if (transSelectedFile) {
        const compressedFile = await compressImageFile(transSelectedFile, 1920, 1920, 0.8);
        const fileExt = compressedFile.name.split(".").pop() || "webp";
        const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `transformation_${Date.now()}_${sanitizedName}.${fileExt}`;

        const { error: uploadErr } = await supabase
          .storage
          .from("website_gallery")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          console.error("Transformation image upload error:", uploadErr);
          alert("Error saving: " + uploadErr.message);
          setIsTransSaving(false);
          return;
        }

        const { data: urlData } = supabase
          .storage
          .from("website_gallery")
          .getPublicUrl(fileName);

        image_url = urlData.publicUrl;
        storage_path = fileName;
      }

      if (!image_url) {
        alert("Please select or upload a transformation photo.");
        setIsTransSaving(false);
        return;
      }

      if (editingTrans) {
        // Update
        const { data: updatedRows, error } = await supabase
          .from("website_transformations")
          .update({
            member_name,
            member_status,
            review_text,
            rating,
            badge_text,
            duration_text,
            category,
            image_url,
            storage_path,
          })
          .eq("id", editingTrans.id)
          .select();

        if (error) {
          alert("Error saving: " + error.message);
          setIsTransSaving(false);
          return;
        }

        const updatedObj: WebsiteTransformation = updatedRows && updatedRows[0]
          ? {
              id: String(updatedRows[0].id),
              member_name: updatedRows[0].member_name || member_name,
              member_status: updatedRows[0].member_status || member_status,
              review_text: updatedRows[0].review_text || review_text,
              rating: Number(updatedRows[0].rating) || rating,
              badge_text: updatedRows[0].badge_text || badge_text,
              duration_text: updatedRows[0].duration_text || duration_text,
              category: updatedRows[0].category || category,
              image_url: updatedRows[0].image_url || image_url,
              storage_path: updatedRows[0].storage_path || storage_path,
            }
          : {
              ...editingTrans,
              member_name,
              member_status,
              review_text,
              rating,
              badge_text,
              duration_text,
              category,
              image_url,
              storage_path,
            };

        setTransformations((prev) =>
          prev.map((t) => (t.id === editingTrans.id ? updatedObj : t))
        );
        showNotice("success", "Transformation updated successfully!");
        alert("Transformation updated successfully!");
      } else {
        // Insert
        const { data: newRows, error } = await supabase
          .from("website_transformations")
          .insert([
            {
              member_name,
              member_status,
              review_text,
              rating,
              badge_text,
              duration_text,
              category,
              image_url,
              storage_path,
            },
          ])
          .select();

        if (error) {
          alert("Error saving: " + error.message);
          setIsTransSaving(false);
          return;
        }

        const newObj: WebsiteTransformation = newRows && newRows[0]
          ? {
              id: String(newRows[0].id),
              member_name: newRows[0].member_name || member_name,
              member_status: newRows[0].member_status || member_status,
              review_text: newRows[0].review_text || review_text,
              rating: Number(newRows[0].rating) || rating,
              badge_text: newRows[0].badge_text || badge_text,
              duration_text: newRows[0].duration_text || duration_text,
              category: newRows[0].category || category,
              image_url: newRows[0].image_url || image_url,
              storage_path: newRows[0].storage_path || storage_path,
            }
          : {
              id: Date.now().toString(),
              member_name,
              member_status,
              review_text,
              rating,
              badge_text,
              duration_text,
              category,
              image_url,
              storage_path,
            };

        setTransformations((prev) => [newObj, ...prev]);
        showNotice("success", "Transformation added successfully!");
        alert("Transformation added successfully!");
      }

      setIsTransModalOpen(false);
      setEditingTrans(null);
      setTransSelectedFile(null);
      if (transPreviewUrl) {
        URL.revokeObjectURL(transPreviewUrl);
        setTransPreviewUrl(null);
      }

      router.refresh();
      await fetchTransformations();
    } catch (err: any) {
      console.error("Error saving transformation:", err);
      alert("Error saving: " + (err?.message || err));
    } finally {
      setIsTransSaving(false);
    }
  };

  // Delete Transformation
  const handleDeleteTransformation = async (trans: WebsiteTransformation) => {
    if (!confirm(`Are you sure you want to delete transformation for "${trans.member_name}"?`)) {
      return;
    }

    setDeletingTransId(trans.id);
    try {
      const storagePath =
        trans.storage_path ||
        trans.image_url.split("/website_gallery/").pop()?.split("?")[0];

      if (storagePath && storagePath.startsWith("transformation_")) {
        const { error: storageErr } = await supabase
          .storage
          .from("website_gallery")
          .remove([storagePath]);

        if (storageErr) {
          console.warn("Storage removal notice:", storageErr.message);
        }
      }

      const { error } = await supabase
        .from("website_transformations")
        .delete()
        .eq("id", trans.id);

      if (error) {
        alert("Error deleting: " + error.message);
        setDeletingTransId(null);
        return;
      }

      setTransformations((prev) => prev.filter((t) => String(t.id) !== String(trans.id)));
      showNotice("success", "Transformation deleted successfully.");
      router.refresh();
      await fetchTransformations();
    } catch (err: any) {
      console.error("Delete transformation error:", err);
      alert("Error deleting: " + (err?.message || err));
    } finally {
      setDeletingTransId(null);
    }
  };

  // Gallery Upload File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("error", "Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotice("error", "Selected file size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Upload image to Supabase Storage Bucket `website_gallery` & Save to `website_gallery_images` Table
  const handleUploadImage = async () => {
    if (!selectedFile) {
      showNotice("error", "Please select an image file first.");
      return;
    }

    setIsUploading(true);
    try {
      // 0. Compress image client-side using HTML5 canvas (target 100KB-300KB, max 1920px width)
      const compressedFile = await compressImageFile(selectedFile, 1920, 1920, 0.8);

      const fileExt = compressedFile.name.split(".").pop() || "webp";
      const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${sanitizedName}.${fileExt}`;

      // 1. Upload compressed file to bucket `website_gallery`
      const { error: uploadErr } = await supabase
        .storage
        .from("website_gallery")
        .upload(fileName, compressedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) {
        console.error("Storage upload error:", uploadErr);
        alert("Storage Error: " + JSON.stringify(uploadErr));
        showNotice("error", `Upload failed: ${uploadErr.message}`);
        setIsUploading(false);
        return;
      }

      // 2. Get Public URL
      const { data: urlData } = supabase
        .storage
        .from("website_gallery")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // 3. Exact Payload: { image_url: publicUrl }
      const { data: newRow, error: dbErr } = await supabase
        .from("website_gallery_images")
        .insert([{ image_url: publicUrl }])
        .select();

      if (dbErr) {
        console.error("Database insert error:", dbErr);
        alert("DB Error: " + JSON.stringify(dbErr));
        showNotice("error", `Database record insert failed: ${dbErr.message || JSON.stringify(dbErr)}`);
        setIsUploading(false);
        return;
      }

      // 4. Immediate State Update
      if (newRow && newRow.length > 0) {
        setGalleryImages((prev) => [newRow[0] as WebsiteGalleryImage, ...prev]);
      }

      handleClearSelectedFile();
      showNotice("success", "Gallery image uploaded successfully!");
      router.refresh();
      await fetchGalleryImages();
    } catch (err: any) {
      console.error("Error uploading gallery image:", err);
      alert("Upload Error: " + (err?.message || JSON.stringify(err)));
      showNotice("error", `Upload error: ${err?.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Image from `website_gallery` Bucket and `website_gallery_images` Table
  const handleDeleteImage = async (img: WebsiteGalleryImage) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) {
      return;
    }

    setDeletingId(img.id);
    try {
      const storagePath =
        img.storage_path ||
        img.image_url.split("/website_gallery/").pop()?.split("?")[0] ||
        img.image_url.split("/").pop();

      if (storagePath) {
        const { error: storageErr } = await supabase
          .storage
          .from("website_gallery")
          .remove([storagePath]);

        if (storageErr) {
          console.warn("Storage removal warning:", storageErr.message);
        }
      }

      const { error: dbErr } = await supabase
        .from("website_gallery_images")
        .delete()
        .eq("id", img.id);

      if (dbErr) {
        console.error("Database delete error:", dbErr);
        showNotice("error", `Delete failed: ${dbErr.message}`);
        setDeletingId(null);
        return;
      }

      setGalleryImages((prev) => prev.filter((item) => item.id !== img.id));
      showNotice("success", "Gallery image deleted successfully.");
      router.refresh();
      await fetchGalleryImages();
    } catch (err: any) {
      console.error("Delete gallery image error:", err);
      showNotice("error", `Delete error: ${err?.message || err}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Open Edit Modal for a plan
  const handleOpenEditModal = (plan: WebsitePricingPlan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      category: plan.category,
      price: plan.price,
      period: plan.period || "/ month",
      badge: plan.badge || "",
      popular: Boolean(plan.popular),
      features: [...(plan.features || [])],
    });
    setNewFeatureText("");
  };

  // Add Feature item to list
  const handleAddFeature = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setEditForm((prev) => ({
      ...prev,
      features: [...prev.features, trimmed],
    }));
    setNewFeatureText("");
  };

  // Edit Feature text at index
  const handleFeatureTextChange = (index: number, value: string) => {
    setEditForm((prev) => {
      const updated = [...prev.features];
      updated[index] = value;
      return { ...prev, features: updated };
    });
  };

  // Remove Feature item at index
  const handleRemoveFeature = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Save updates back to Supabase
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    const packageId = editingPlan.id;
    const newName = editForm.name.trim();
    const newPrice = Number(editForm.price);
    const newCategory = editForm.category;
    const newFeatures = editForm.features.filter((f) => f.trim().length > 0);

    if (!newName) {
      alert("Please enter a package name.");
      return;
    }
    if (newPrice < 0) {
      alert("Price cannot be negative.");
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload: Record<string, any> = {
        name: newName,
        price: newPrice,
        category: newCategory,
        features: newFeatures,
      };

      // 1. Strictly target row by .eq('id', packageId)
      const { error } = await supabase
        .from("website_pricing_plans")
        .update(updatePayload)
        .eq("id", packageId);

      // 2 & 3. Explicit error check and alert error vs success
      if (error) {
        console.error("Supabase update error:", error);
        alert("Failed to save: " + error.message);
        setIsSaving(false);
        return;
      }

      // 4. Forcefully update local React state & call router.refresh()
      const updatedPlanObj: WebsitePricingPlan = {
        ...editingPlan,
        name: newName,
        price: newPrice,
        category: newCategory,
        features: newFeatures,
      };

      setPlans((prev) =>
        prev.map((p) => (p.id === packageId ? updatedPlanObj : p))
      );

      router.refresh();
      await fetchPlans();

      setEditingPlan(null);
      alert("Saved successfully!");
    } catch (err: any) {
      console.error("Error saving package:", err);
      alert("Failed to save: " + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // Group plans visually
  const basePlans = plans.filter((p) => p.category === "base");
  const cardioPlans = plans.filter((p) => p.category === "cardio");

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/60 via-zinc-900 to-amber-950/40 p-6 border border-cyan-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
              <Globe className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Website Settings & Dynamic Pricing Plans
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
                  Live Supabase DB
                </span>
              </div>
              <p className="text-sm text-zinc-300 mt-1 max-w-2xl">
                Manage gym membership packages, adjust fees, and customize feature bullet points for your public website landing page in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchPlans}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2 border border-zinc-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Alert / Notice Display */}
      {statusNotice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
            statusNotice.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
              : statusNotice.type === "error"
              ? "bg-rose-950/60 border-rose-500/50 text-rose-300"
              : "bg-cyan-950/60 border-cyan-500/50 text-cyan-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusNotice.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : statusNotice.type === "error" ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
          <button
            onClick={() => setStatusNotice(null)}
            className="p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODERN HORIZONTAL TAB NAVIGATION BAR */}
      <div className="border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { key: "pricing" as SettingsTabKey, label: "Pricing Packages", icon: Layers, count: plans.length },
            { key: "gallery" as SettingsTabKey, label: "Gallery", icon: ImageIcon, count: galleryImages.length },
            { key: "about" as SettingsTabKey, label: "About Us", icon: BookOpen },
            { key: "facilities" as SettingsTabKey, label: "Facility Zones", icon: Building2, count: facilityCards.length },
            { key: "contact" as SettingsTabKey, label: "Contact Info", icon: PhoneCall },
            { key: "coaches" as SettingsTabKey, label: "Coaches", icon: UserCheck, count: coaches.length },
            { key: "app-promo" as SettingsTabKey, label: "App Promo", icon: Smartphone },
            { key: "transformations" as SettingsTabKey, label: "Transformations", icon: Trophy, count: transformations.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-950/30 scale-105"
                    : "bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/40"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-sm font-medium text-zinc-400">Loading website settings from Supabase...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* TAB 1: PRICING PACKAGES */}
          {activeTab === "pricing" && (
            <div className="space-y-10">
              {/* SECTION 1: BASE PACKAGES */}
              <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Base Packages
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Standard gym membership tiers focusing on floor access, weights & general workout setup.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {basePlans.length} {basePlans.length === 1 ? "Plan" : "Plans"}
              </span>
            </div>

            {basePlans.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-zinc-500 text-xs font-mono">
                No Base Packages found in category &quot;base&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {basePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onEdit={() => handleOpenEditModal(plan)} />
                ))}
              </div>
            )}
          </section>

              {/* SECTION 2: CARDIO PACKAGES */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Cardio & Treadmill Packages
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Premium and cardio-inclusive tiers featuring treadmill, fat burn zones & specialized access.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {cardioPlans.length} {cardioPlans.length === 1 ? "Plan" : "Plans"}
                  </span>
                </div>

                {cardioPlans.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-zinc-900/30 border border-zinc-800 text-zinc-500 text-xs font-mono">
                    No Cardio Packages found in category &quot;cardio&quot;.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cardioPlans.map((plan) => (
                      <PlanCard key={plan.id} plan={plan} onEdit={() => handleOpenEditModal(plan)} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: GALLERY MANAGEMENT */}
          {activeTab === "gallery" && (
            <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Gallery Management
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Upload, display, and manage high-resolution gym photos for your public website gallery in real-time.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchGalleryImages}
                  disabled={isGalleryLoading}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGalleryLoading ? "animate-spin text-emerald-400" : ""}`} />
                  Refresh Gallery
                </button>
                <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {galleryImages.length} {galleryImages.length === 1 ? "Image" : "Images"}
                </span>
              </div>
            </div>

            {/* Upload Area */}
            <div className="p-5 rounded-2xl bg-[#0f1422] border border-cyan-500/30 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                Upload New Gallery Image
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Upload Drop Zone / Input */}
                <div className="md:col-span-2">
                  <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-500/40 rounded-xl bg-cyan-950/10 hover:bg-cyan-950/20 cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-cyan-300 group-hover:underline">
                          Click to select image
                        </span>{" "}
                        <span className="text-xs text-zinc-400">or drop photo file here</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Supports PNG, JPG, WEBP, GIF (Max 10MB)
                      </span>
                    </div>
                  </label>
                </div>

                {/* Selected Image Preview & Actions */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 h-full min-h-[140px]">
                  {previewUrl ? (
                    <div className="relative w-full flex flex-col items-center space-y-3">
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-cyan-400/50 shadow-md">
                        <img
                          src={previewUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleClearSelectedFile}
                          disabled={isUploading}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                          title="Clear selected file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={handleUploadImage}
                        disabled={isUploading}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading to Bucket...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            Upload & Save Image
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-zinc-500 text-xs py-4">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
                      Select an image file on the left to preview & upload
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Images Grid */}
            {isGalleryLoading ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Fetching gallery images from Supabase...</p>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-400">No Gallery Images Found</p>
                <p className="text-xs text-zinc-500">
                  Upload your first gym photo using the box above to showcase in the website gallery.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 shadow-lg transition-all duration-300 hover:shadow-cyan-950/40"
                  >
                    {/* Always-visible Red Delete Badge Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img);
                      }}
                      disabled={deletingId === img.id}
                      className="absolute top-2 right-2 z-20 p-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg border border-rose-400/50 backdrop-blur-md transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                      title="Delete this image from storage & database"
                    >
                      {deletingId === img.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Thumbnail Image */}
                    <img
                      src={img.image_url ? img.image_url : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80"}
                      alt="Gallery Image"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80";
                      }}
                    />

                    {/* Hover Overlay with Action Buttons */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-3 z-10">
                      <button
                        onClick={() => setActivePreviewImage(img.image_url)}
                        className="w-28 py-1.5 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 border border-cyan-400/40 text-xs font-bold backdrop-blur-md transition-all hover:scale-105 flex items-center justify-center gap-1.5"
                        title="View Image Fullscreen"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      <button
                        onClick={() => handleDeleteImage(img)}
                        disabled={deletingId === img.id}
                        className="w-28 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white border border-rose-400/50 text-xs font-bold backdrop-blur-md transition-all hover:scale-105 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        title="Delete Image from Storage & DB"
                      >
                        {deletingId === img.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

          {/* TAB 3: ABOUT US MANAGEMENT */}
          {activeTab === "about" && (
            <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    About Us & Philosophy Management
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Update mission statement, philosophy paragraphs, coach quote, badges, and section photo.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchAboutSection}
                disabled={isAboutLoading}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAboutLoading ? "animate-spin text-cyan-400" : ""}`} />
                Refresh About Data
              </button>
            </div>

            {isAboutLoading ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Loading About section data from Supabase...</p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0f1422] border border-cyan-500/30 shadow-xl space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-zinc-300">
                  {/* Headings */}
                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Main Section Heading
                    </label>
                    <input
                      type="text"
                      value={aboutData.heading}
                      onChange={(e) => setAboutData({ ...aboutData, heading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. ELEVATE YOUR FITNESS JOURNEY"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Subheading / Category Title
                    </label>
                    <input
                      type="text"
                      value={aboutData.subheading}
                      onChange={(e) => setAboutData({ ...aboutData, subheading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. ABOUT OUR GYM & PHILOSOPHY"
                    />
                  </div>

                  {/* Badges */}
                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Badge Title (e.g. Year / Tag)
                    </label>
                    <input
                      type="text"
                      value={aboutData.badge_title}
                      onChange={(e) => setAboutData({ ...aboutData, badge_title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                      placeholder="ESTABLISHED 2019"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Badge Subtitle (e.g. Location / Tagline)
                    </label>
                    <input
                      type="text"
                      value={aboutData.badge_subtitle}
                      onChange={(e) => setAboutData({ ...aboutData, badge_subtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                      placeholder="BALANGODA, SRI LANKA"
                    />
                  </div>

                  {/* Paragraph 1 */}
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Paragraph 1 (Main Intro Story)
                    </label>
                    <textarea
                      rows={3}
                      value={aboutData.paragraph_1}
                      onChange={(e) => setAboutData({ ...aboutData, paragraph_1: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                      placeholder="Write the first paragraph of the about section..."
                    />
                  </div>

                  {/* Paragraph 2 */}
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Paragraph 2 (Philosophy & Community Focus)
                    </label>
                    <textarea
                      rows={3}
                      value={aboutData.paragraph_2}
                      onChange={(e) => setAboutData({ ...aboutData, paragraph_2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                      placeholder="Write the second paragraph of the about section..."
                    />
                  </div>

                  {/* Quote Text & Author */}
                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Quote Text Highlight
                    </label>
                    <input
                      type="text"
                      value={aboutData.quote_text}
                      onChange={(e) => setAboutData({ ...aboutData, quote_text: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 italic"
                      placeholder="Consistency is key..."
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Quote Author / Attribution
                    </label>
                    <input
                      type="text"
                      value={aboutData.quote_author}
                      onChange={(e) => setAboutData({ ...aboutData, quote_author: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. Head Coach"
                    />
                  </div>
                </div>

                {/* Image Upload & Preview Row */}
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <label className="block font-bold text-white uppercase tracking-wider text-[10px]">
                    About Section Image
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Current / Preview Image */}
                    <div className="relative w-44 h-28 rounded-xl overflow-hidden border border-cyan-500/40 shrink-0 bg-black">
                      <img
                        src={(aboutPreviewUrl || aboutData.image_url) ? (aboutPreviewUrl || aboutData.image_url) : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"}
                        alt="About Section Preview"
                        className="w-full h-full object-cover"
                      />
                      {aboutPreviewUrl && (
                        <button
                          type="button"
                          onClick={handleClearAboutSelectedFile}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors"
                          title="Cancel new photo selection"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 cursor-pointer transition-colors text-xs font-bold w-fit">
                        <UploadCloud className="w-4 h-4" />
                        <span>{aboutSelectedFile ? "Change Selected Image" : "Upload New Image File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAboutFileChange}
                          disabled={isAboutSaving}
                          className="hidden"
                        />
                      </label>

                      {aboutSelectedFile ? (
                        <p className="text-xs text-cyan-400 font-mono">
                          Selected: {aboutSelectedFile.name} (Will upload on save)
                        </p>
                      ) : (
                        <p className="text-[11px] text-zinc-400">
                          Or edit image URL directly:
                        </p>
                      )}

                      <input
                        type="text"
                        value={aboutData.image_url}
                        onChange={(e) => setAboutData({ ...aboutData, image_url: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#161c2e] border border-zinc-700 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-400"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Save Action Footer */}
                <div className="flex items-center justify-end border-t border-zinc-800/80 pt-4">
                  <button
                    type="button"
                    onClick={handleSaveAboutSection}
                    disabled={isAboutSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isAboutSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving About Section...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save About Section
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
          )}

          {/* TAB 4: FACILITY MANAGEMENT */}
          {activeTab === "facilities" && (
            <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Facility Management
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Manage gym zone cards, equipment highlights, high-res photos, and descriptions displayed on your landing page.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddFacilityModal}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Facility Card
                </button>
                <button
                  onClick={fetchFacilityCards}
                  disabled={isFacilityLoading}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFacilityLoading ? "animate-spin text-amber-400" : ""}`} />
                  Refresh
                </button>
                <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {facilityCards.length} {facilityCards.length === 1 ? "Zone" : "Zones"}
                </span>
              </div>
            </div>

            {isFacilityLoading ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Loading facility cards from Supabase...</p>
              </div>
            ) : facilityCards.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 space-y-2">
                <Building2 className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-400">No Facility Cards Found</p>
                <p className="text-xs text-zinc-500">
                  Click &quot;Add Facility Card&quot; above to create your first gym facility card.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilityCards.map((card) => (
                  <div
                    key={card.id}
                    className="group relative rounded-2xl overflow-hidden bg-[#0f1422] border border-zinc-800 hover:border-amber-500/50 shadow-xl transition-all duration-300 hover:shadow-amber-950/20 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Image */}
                      <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                        <img
                          src={card.image_url ? card.image_url : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"}
                          alt={card.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80";
                          }}
                        />
                        {card.badge_text && (
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/90 text-black shadow-lg backdrop-blur-sm">
                            {card.badge_text}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditFacilityModal(card)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all hover:scale-105 flex items-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFacilityCard(card)}
                        disabled={deletingFacilityId === card.id}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/30 transition-all hover:scale-105 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {deletingFacilityId === card.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

          {/* TAB 5: GLOBAL CONTACT SETTINGS */}
          {activeTab === "contact" && (
            <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Global Contact Settings
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Configure your official WhatsApp contact number used across the public website for instant member inquiries.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchGlobalSettings}
                disabled={isGlobalLoading}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGlobalLoading ? "animate-spin text-emerald-400" : ""}`} />
                Refresh Contact Settings
              </button>
            </div>

            {isGlobalLoading ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Loading WhatsApp contact settings...</p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0f1422] border border-emerald-500/30 shadow-xl space-y-5">
                <div className="max-w-md space-y-2">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    WhatsApp Contact Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-emerald-400 font-extrabold">
                      WA
                    </span>
                    <input
                      type="text"
                      value={globalSettings.whatsapp_number}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, whatsapp_number: e.target.value })}
                      className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                      placeholder="e.g. +94771234567"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Include country code (e.g. +94). This number triggers direct WhatsApp chat links on the landing page.
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSaveGlobalSettings}
                    disabled={isGlobalSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isGlobalSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving WhatsApp Number...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save WhatsApp Number
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
          )}

          {/* TAB 6: COACHES MANAGEMENT */}
          {activeTab === "coaches" && (
            <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Coaches Management
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Manage trainer profiles, certifications, ratings, focus areas, and high-res photos.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddCoachModal}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Coach Profile
                </button>
                <button
                  onClick={fetchCoaches}
                  disabled={isCoachesLoading}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCoachesLoading ? "animate-spin text-indigo-400" : ""}`} />
                  Refresh
                </button>
                <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {coaches.length} {coaches.length === 1 ? "Coach" : "Coaches"}
                </span>
              </div>
            </div>

            {isCoachesLoading ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Loading coach profiles from Supabase...</p>
              </div>
            ) : coaches.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-400">No Coaches Found</p>
                <p className="text-xs text-zinc-500">
                  Click &quot;Add Coach Profile&quot; above to create your first trainer profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="group relative rounded-2xl overflow-hidden bg-[#0f1422] border border-zinc-800 hover:border-indigo-500/50 shadow-xl transition-all duration-300 hover:shadow-indigo-950/20 flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
                        <img
                          src={coach.image_url ? coach.image_url : "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&auto=format&fit=crop&q=80"}
                          alt={coach.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&auto=format&fit=crop&q=80";
                          }}
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-black/80 text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {coach.rating || 4.9}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2.5">
                        <div>
                          <h3 className="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                            {coach.name}
                          </h3>
                          <p className="text-xs font-semibold text-indigo-400 mt-0.5">
                            {coach.title}
                          </p>
                        </div>

                        {coach.certification && (
                          <div className="flex items-start gap-1.5 text-xs text-zinc-300">
                            <Award className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-snug text-zinc-300">{coach.certification}</span>
                          </div>
                        )}

                        {coach.focus && (
                          <p className="text-[11px] text-zinc-400 italic border-t border-zinc-800/60 pt-2">
                            Specialty Focus: {coach.focus}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditCoachModal(coach)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all hover:scale-105 flex items-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCoach(coach)}
                        disabled={deletingCoachId === coach.id}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/30 transition-all hover:scale-105 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {deletingCoachId === coach.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

          {/* TAB 7: APP PROMO MANAGEMENT */}
          {activeTab === "app-promo" && (
            <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    App Promo Management
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Update mobile app showcase badge, main heading, features, and app mockup screenshot.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchAppPromoSection}
                disabled={isAppPromoLoading}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAppPromoLoading ? "animate-spin text-cyan-400" : ""}`} />
                Refresh App Promo Data
              </button>
            </div>

            {isAppPromoLoading ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Loading App Promo section data from Supabase...</p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0f1422] border border-cyan-500/30 shadow-xl space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-zinc-300">
                  {/* Badge Text */}
                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Badge Text / Category Label
                    </label>
                    <input
                      type="text"
                      value={appPromoData.badge_text}
                      onChange={(e) => setAppPromoData({ ...appPromoData, badge_text: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. IGYM MOBILE APP"
                    />
                  </div>

                  {/* Main Heading */}
                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Main Section Heading
                    </label>
                    <input
                      type="text"
                      value={appPromoData.heading}
                      onChange={(e) => setAppPromoData({ ...appPromoData, heading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. WORKOUT & TRACK MEMBERSHIP ON THE GO"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Section Description
                    </label>
                    <textarea
                      rows={3}
                      value={appPromoData.description}
                      onChange={(e) => setAppPromoData({ ...appPromoData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                      placeholder="Describe the app highlights and features..."
                    />
                  </div>

                  {/* 4 Feature Inputs */}
                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Feature Bullet 1
                    </label>
                    <input
                      type="text"
                      value={appPromoData.feature_1}
                      onChange={(e) => setAppPromoData({ ...appPromoData, feature_1: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Feature 1..."
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Feature Bullet 2
                    </label>
                    <input
                      type="text"
                      value={appPromoData.feature_2}
                      onChange={(e) => setAppPromoData({ ...appPromoData, feature_2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Feature 2..."
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Feature Bullet 3
                    </label>
                    <input
                      type="text"
                      value={appPromoData.feature_3}
                      onChange={(e) => setAppPromoData({ ...appPromoData, feature_3: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Feature 3..."
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                      Feature Bullet 4
                    </label>
                    <input
                      type="text"
                      value={appPromoData.feature_4}
                      onChange={(e) => setAppPromoData({ ...appPromoData, feature_4: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Feature 4..."
                    />
                  </div>
                </div>

                {/* Image Upload & Preview Row */}
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-4">
                  <label className="block font-bold text-white uppercase tracking-wider text-[10px]">
                    App Mockup Image (Compressed before upload)
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Preview */}
                    <div className="relative w-44 h-28 rounded-xl overflow-hidden border border-cyan-500/40 shrink-0 bg-black">
                      <img
                        src={(appPromoPreviewUrl || appPromoData.image_url) ? (appPromoPreviewUrl || appPromoData.image_url) : "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80"}
                        alt="App Promo Preview"
                        className="w-full h-full object-cover"
                      />
                      {appPromoPreviewUrl && (
                        <button
                          type="button"
                          onClick={handleClearAppPromoSelectedFile}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors"
                          title="Cancel new image selection"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 cursor-pointer transition-colors text-xs font-bold w-fit">
                        <UploadCloud className="w-4 h-4" />
                        <span>{appPromoSelectedFile ? "Change Image File" : "Upload App Mockup Image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAppPromoFileChange}
                          disabled={isAppPromoSaving}
                          className="hidden"
                        />
                      </label>

                      {appPromoSelectedFile ? (
                        <p className="text-xs text-cyan-400 font-mono">
                          Selected: {appPromoSelectedFile.name} (Compressing to ~100KB-300KB)
                        </p>
                      ) : (
                        <p className="text-[11px] text-zinc-400">
                          Or edit image URL directly:
                        </p>
                      )}

                      <input
                        type="text"
                        value={appPromoData.image_url}
                        onChange={(e) => setAppPromoData({ ...appPromoData, image_url: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#161c2e] border border-zinc-700 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-400"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Save Action Footer */}
                <div className="flex items-center justify-end border-t border-zinc-800/80 pt-4">
                  <button
                    type="button"
                    onClick={handleSaveAppPromoSection}
                    disabled={isAppPromoSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isAppPromoSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving App Promo...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save App Promo
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
          )}

          {/* TAB 8: MEMBER TRANSFORMATIONS MANAGEMENT */}
          {activeTab === "transformations" && (
            <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Member Transformations Management
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Manage member success stories, before/after results, category badges, and reviews.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddTransModal}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Transformation Story
                </button>
                <button
                  onClick={fetchTransformations}
                  disabled={isTransLoading}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTransLoading ? "animate-spin text-amber-400" : ""}`} />
                  Refresh
                </button>
                <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {transformations.length} {transformations.length === 1 ? "Story" : "Stories"}
                </span>
              </div>
            </div>

            {isTransLoading ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Loading transformation records from Supabase...</p>
              </div>
            ) : transformations.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 space-y-2">
                <Trophy className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-400">No Transformation Stories Found</p>
                <p className="text-xs text-zinc-500">
                  Click &quot;Add Transformation Story&quot; above to create your first success story.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transformations.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden bg-[#0f1422] border border-zinc-800 hover:border-amber-500/50 shadow-xl transition-all duration-300 hover:shadow-amber-950/20 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview & Badges */}
                      <div className="relative h-52 w-full bg-zinc-950 overflow-hidden">
                        <img
                          src={item.image_url ? item.image_url : "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80"}
                          alt={item.member_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Category Tag */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-black/80 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                          {item.category}
                        </span>

                        {/* Top Rating */}
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-black/80 text-amber-400 border border-amber-500/40 backdrop-blur-md flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {item.rating || 5.0}
                        </span>

                        {/* Bottom Badge Text & Duration */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg uppercase tracking-wider">
                            {item.badge_text}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/90 text-zinc-300 border border-zinc-700 font-mono">
                            {item.duration_text}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2.5 text-xs">
                        <div>
                          <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                            {item.member_name}
                          </h3>
                          <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {item.member_status}
                          </p>
                        </div>

                        {item.review_text && (
                          <p className="text-zinc-400 text-xs leading-relaxed italic border-t border-zinc-800/60 pt-2 line-clamp-3">
                            &quot;{item.review_text}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditTransModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all hover:scale-105 flex items-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTransformation(item)}
                        disabled={deletingTransId === item.id}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/30 transition-all hover:scale-105 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {deletingTransId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {activePreviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePreviewImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePreviewImage ? activePreviewImage : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"}
              alt="Full View"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}

      {/* ADD / EDIT COACH MODAL */}
      {isCoachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border border-indigo-500/40 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-xs text-zinc-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingCoach ? "Edit Coach Profile" : "Add New Coach Profile"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Set trainer name, title, star rating, certifications, and high-res photo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCoachModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={coachForm.name}
                    onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. Coach Marcus Vance"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Title / Position
                  </label>
                  <input
                    type="text"
                    value={coachForm.title}
                    onChange={(e) => setCoachForm({ ...coachForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. Head Bodybuilding Specialist"
                  />
                </div>
              </div>

              {/* Rating & Certification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Star Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={coachForm.rating}
                    onChange={(e) => setCoachForm({ ...coachForm, rating: parseFloat(e.target.value) || 4.9 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-indigo-400"
                    placeholder="4.9"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Certifications / Credentials
                  </label>
                  <input
                    type="text"
                    value={coachForm.certification}
                    onChange={(e) => setCoachForm({ ...coachForm, certification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. IFBB Pro & NSCA-CSCS Certified"
                  />
                </div>
              </div>

              {/* Specialty Focus */}
              <div>
                <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                  Specialty Focus Areas
                </label>
                <input
                  type="text"
                  value={coachForm.focus}
                  onChange={(e) => setCoachForm({ ...coachForm, focus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-indigo-400"
                  placeholder="e.g. Hypertrophy, Powerlifting & Contest Prep"
                />
              </div>

              {/* Photo File & URL */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                <label className="block font-bold text-white uppercase tracking-wider text-[10px]">
                  Coach Photo (Compressed before upload)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview */}
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-indigo-500/40 shrink-0 bg-black">
                    <img
                      src={(coachPreviewUrl || coachForm.image_url) ? (coachPreviewUrl || coachForm.image_url) : "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80"}
                      alt="Coach Preview"
                      className="w-full h-full object-cover"
                    />
                    {coachPreviewUrl && (
                      <button
                        type="button"
                        onClick={handleClearCoachSelectedFile}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-pointer transition-colors text-xs font-bold w-fit">
                      <UploadCloud className="w-4 h-4" />
                      <span>{coachSelectedFile ? "Change Photo File" : "Upload Photo File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoachFileChange}
                        disabled={isCoachSaving}
                        className="hidden"
                      />
                    </label>

                    {coachSelectedFile ? (
                      <p className="text-xs text-indigo-400 font-mono">
                        Selected: {coachSelectedFile.name} (Compressing to ~100KB-300KB)
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-400">
                        Or enter photo URL directly:
                      </p>
                    )}

                    <input
                      type="text"
                      value={coachForm.image_url}
                      onChange={(e) => setCoachForm({ ...coachForm, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-400"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCoachModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCoach}
                disabled={isCoachSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {isCoachSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Coach Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {activePreviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePreviewImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePreviewImage}
              alt="Full View"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}

      {/* ADD / EDIT FACILITY MODAL */}
      {isFacilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border border-amber-500/40 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-xs text-zinc-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingFacilityCard ? "Edit Facility Card" : "Add New Facility Card"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Provide zone title, badge category, description, and high-resolution photo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFacilityModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                  Facility Title
                </label>
                <input
                  type="text"
                  value={facilityForm.title}
                  onChange={(e) => setFacilityForm({ ...facilityForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Strength & Resistance Zone"
                />
              </div>

              {/* Badge Text */}
              <div>
                <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                  Badge Text / Tag
                </label>
                <input
                  type="text"
                  value={facilityForm.badge_text}
                  onChange={(e) => setFacilityForm({ ...facilityForm, badge_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                  placeholder="e.g. BODYBUILDING & STRENGTH"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={facilityForm.description}
                  onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  placeholder="Describe the equipment, floor space, and training highlights..."
                />
              </div>

              {/* Image File & URL */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                <label className="block font-bold text-white uppercase tracking-wider text-[10px]">
                  Facility Image Photo
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview */}
                  <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-black">
                    <img
                      src={(facilityPreviewUrl || facilityForm.image_url) ? (facilityPreviewUrl || facilityForm.image_url) : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80"}
                      alt="Facility Preview"
                      className="w-full h-full object-cover"
                    />
                    {facilityPreviewUrl && (
                      <button
                        type="button"
                        onClick={handleClearFacilitySelectedFile}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer transition-colors text-xs font-bold w-fit">
                      <UploadCloud className="w-4 h-4" />
                      <span>{facilitySelectedFile ? "Change Image File" : "Upload Image File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFacilityFileChange}
                        disabled={isFacilitySaving}
                        className="hidden"
                      />
                    </label>

                    {facilitySelectedFile ? (
                      <p className="text-xs text-amber-400 font-mono">
                        Selected: {facilitySelectedFile.name}
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-400">
                        Or enter image URL directly:
                      </p>
                    )}

                    <input
                      type="text"
                      value={facilityForm.image_url}
                      onChange={(e) => setFacilityForm({ ...facilityForm, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-400"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsFacilityModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFacilityCard}
                disabled={isFacilitySaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isFacilitySaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Facility Card
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TRANSFORMATION MODAL */}
      {isTransModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border border-amber-500/40 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-xs text-zinc-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingTrans ? "Edit Transformation Story" : "Add New Transformation Story"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Set member name, status, rating, badge, duration, category, review, and photo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTransModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Member Name & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={transForm.member_name}
                    onChange={(e) => setTransForm({ ...transForm, member_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Kavinda Perera"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Member Status Label
                  </label>
                  <input
                    type="text"
                    value={transForm.member_status}
                    onChange={(e) => setTransForm({ ...transForm, member_status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                    placeholder="Verified iGYM Member"
                  />
                </div>
              </div>

              {/* Category Dropdown & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Category
                  </label>
                  <select
                    value={transForm.category}
                    onChange={(e) => setTransForm({ ...transForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Body Recomp">Body Recomp</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Star Rating (1 - 5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={transForm.rating}
                    onChange={(e) => setTransForm({ ...transForm, rating: parseFloat(e.target.value) || 5.0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                    placeholder="5.0"
                  />
                </div>
              </div>

              {/* Badge Text & Duration Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Badge Text (e.g. LOST 14 KG)
                  </label>
                  <input
                    type="text"
                    value={transForm.badge_text}
                    onChange={(e) => setTransForm({ ...transForm, badge_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                    placeholder="e.g. LOST 14 KG"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Duration Text (e.g. 4 Months)
                  </label>
                  <input
                    type="text"
                    value={transForm.duration_text}
                    onChange={(e) => setTransForm({ ...transForm, duration_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                    placeholder="e.g. 4 Months"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block mb-1 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                  Member Review / Testimonial
                </label>
                <textarea
                  rows={3}
                  value={transForm.review_text}
                  onChange={(e) => setTransForm({ ...transForm, review_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white leading-relaxed focus:outline-none focus:border-amber-400"
                  placeholder="Share member experience & transformation details..."
                />
              </div>

              {/* Photo File & URL */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                <label className="block font-bold text-white uppercase tracking-wider text-[10px]">
                  Transformation Photo (Compressed before upload)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview */}
                  <div className="relative w-36 h-24 rounded-xl overflow-hidden border-2 border-amber-500/40 shrink-0 bg-black">
                    <img
                      src={(transPreviewUrl || transForm.image_url) ? (transPreviewUrl || transForm.image_url) : "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80"}
                      alt="Transformation Preview"
                      className="w-full h-full object-cover"
                    />
                    {transPreviewUrl && (
                      <button
                        type="button"
                        onClick={handleClearTransSelectedFile}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer transition-colors text-xs font-bold w-fit">
                      <UploadCloud className="w-4 h-4" />
                      <span>{transSelectedFile ? "Change Photo File" : "Upload Photo File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTransFileChange}
                        disabled={isTransSaving}
                        className="hidden"
                      />
                    </label>

                    {transSelectedFile ? (
                      <p className="text-xs text-amber-400 font-mono">
                        Selected: {transSelectedFile.name} (Compressing to ~100KB-300KB)
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-400">
                        Or enter photo URL directly:
                      </p>
                    )}

                    <input
                      type="text"
                      value={transForm.image_url}
                      onChange={(e) => setTransForm({ ...transForm, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-400"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsTransModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTransformation}
                disabled={isTransSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isTransSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Transformation Story
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PACKAGE MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f1422] border border-cyan-500/40 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Edit Package: <span className="text-cyan-400">{editingPlan.name}</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Update package pricing, classification, and feature bullet points.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-5 text-xs text-zinc-300">
              {/* Name & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Package Name / Title
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    placeholder="e.g. Men's Standard"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Category (Visual Grouping)
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        category: e.target.value as "base" | "cardio",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  >
                    <option value="base">Base Package</option>
                    <option value="cardio">Cardio & Treadmill</option>
                  </select>
                </div>
              </div>

              {/* Price & Billing Period Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Monthly Fee / Price (LKR Rs.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold">LKR</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full pl-14 pr-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                      placeholder="4000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Billing Period Text
                  </label>
                  <input
                    type="text"
                    value={editForm.period}
                    onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="/ month"
                  />
                </div>
              </div>

              {/* Badge & Popular Toggle Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block mb-1.5 font-bold text-zinc-300 uppercase tracking-wider text-[10px]">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={editForm.badge}
                    onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161c2e] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. Popular, Best Value"
                  />
                </div>

                <div className="pt-4 sm:pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl bg-[#161c2e] border border-zinc-800 hover:border-zinc-700">
                    <input
                      type="checkbox"
                      checked={editForm.popular}
                      onChange={(e) => setEditForm({ ...editForm, popular: e.target.checked })}
                      className="w-4 h-4 accent-cyan-500 rounded"
                    />
                    <div>
                      <span className="font-bold text-white block">Mark as Popular Plan</span>
                      <span className="text-[10px] text-zinc-400">Highlights card on website</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dynamic Features List (JSONB Array Editor) */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white uppercase tracking-wider text-[10px]">
                    Bullet Features ({editForm.features.length})
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">JSONB Array Data</span>
                </div>

                {/* Existing Bullet Items */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editForm.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-zinc-500 font-mono text-[10px] w-4 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureTextChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#161c2e] border border-zinc-700/80 text-white focus:outline-none focus:border-cyan-400 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Remove Bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {editForm.features.length === 0 && (
                    <p className="text-zinc-500 text-center py-2 italic text-[11px]">
                      No feature bullets added yet. Add your first feature below.
                    </p>
                  )}
                </div>

                {/* Add New Feature Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Add new feature bullet point..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/40 flex items-center gap-1.5 transition-all text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Add Bullet
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlan}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Package Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Single Plan Display Card Component
function PlanCard({
  plan,
  onEdit,
}: {
  plan: WebsitePricingPlan;
  onEdit: () => void;
}) {
  const isCardio = plan.category === "cardio";

  return (
    <div
      className={`group relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border ${
        plan.popular
          ? "bg-gradient-to-b from-[#141d33] via-[#0f1526] to-[#0c0f1a] border-cyan-500/60 shadow-xl shadow-cyan-950/40 hover:border-cyan-400"
          : "bg-[#0f1422]/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-[#121829]"
      }`}
    >
      {/* Popular / Badge Banner */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
            isCardio
              ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
              : "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
          }`}
        >
          {plan.category === "cardio" ? "CARDIO + TREADMILL" : "BASE PACKAGE"}
        </span>

        {plan.badge && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {plan.badge}
          </span>
        )}
      </div>

      {/* Title & Price Header */}
      <div className="space-y-2 mb-5">
        <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-zinc-400">LKR</span>
          <span className="text-3xl font-black text-white font-mono tracking-tight">
            {plan.price.toLocaleString("en-US")}
          </span>
          <span className="text-xs font-medium text-zinc-400">{plan.period || "/ month"}</span>
        </div>
      </div>

      {/* Feature Bullet Points */}
      <div className="space-y-2.5 mb-6 flex-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/60 pb-1">
          Included Features
        </p>
        <ul className="space-y-2">
          {plan.features && plan.features.length > 0 ? (
            plan.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 flex-shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span className="leading-snug">{feat}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-zinc-500 italic">No features listed.</li>
          )}
        </ul>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-zinc-800/80">
        <button
          onClick={onEdit}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-cyan-600/30 text-zinc-200 hover:text-cyan-300 border border-zinc-700 hover:border-cyan-500/50 text-xs font-extrabold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-cyan-950/50"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Package & Features
        </button>
      </div>
    </div>
  );
}
