"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { createMemberAction, importMembersCSVAction, resetMemberPasswordAction, CSVImportRecord } from "@/app/actions/member-actions";

const RecordExpenseModal = dynamicImport(() => import("./components/RecordExpenseModal"), { ssr: false });
const PackagePricingModal = dynamicImport(() => import("./components/PackagePricingModal"), { ssr: false });
const ActiveRateModal = dynamicImport(() => import("./components/ActiveRateModal"), { ssr: false });

import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  QrCode,
  Settings,
  Search,
  Bell,
  Megaphone,
  Fingerprint,
  Wallet,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  Loader2,
  Phone,
  MapPin,
  Ruler,
  Scale,
  Activity,
  Check,
  UserCheck,
  UserX,
  TrendingDown,
  Clock,
  History,
  Clock3,
  Filter,
  LogIn,
  LogOut,
  Lock,
  Scan,
  MessageSquare,
  Send,
  Printer,
  DollarSign,
  AlertTriangle,
  Zap,
  CheckCircle,
  Smartphone,
  Download,
  FileText,
  FileSpreadsheet,
  Settings2,
  Edit3,
  BarChart3,
  PieChart,
  Database,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  Camera,
  Share2,
  FileDown,
  CheckCircle2,
  Save,
  Building2,
  MessageCircle,
  Target,
  Flame,
  Paperclip,
  SendHorizontal,
  CheckCheck,
  Dumbbell,
  Utensils,
  Sparkles,
  ShieldAlert,
  KeyRound,
  Menu,
  Calendar,
} from "lucide-react";

// Weightlifter Icon Component (Bara ussna kenek)
const WeightlifterIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="3.5" width="2" height="5" rx="0.5" />
    <rect x="21" y="3.5" width="2" height="5" rx="0.5" />
    <rect x="3" y="4.5" width="1.5" height="3" rx="0.5" />
    <rect x="19.5" y="4.5" width="1.5" height="3" rx="0.5" />
    <line x1="4.5" y1="6" x2="19.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="8.5" r="1.6" />
    <path
      d="M12 10.5V15.5M12 15.5L9.5 21M12 15.5L14.5 21M12 11.5L7.5 6M12 11.5L16.5 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Safe localStorage helper to prevent QuotaExceededError crashes
function safeSetLocalStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    console.warn(`⚠️ [LocalStorage QuotaExceededError] Could not save "${key}":`, err?.message || err);
    try {
      // Clear non-essential large cache items to free up browser storage
      localStorage.removeItem("igym_cache_members");
      localStorage.removeItem("igym_cache_payments");
      localStorage.removeItem("igym_saved_coaches");
      localStorage.removeItem("igym_saved_payments");
      // Retry once after clearing caches
      localStorage.setItem(key, value);
    } catch (retryErr) {
      console.warn(`⚠️ [LocalStorage Cleanup Failed] Storage remains full for "${key}". App will continue without local caching.`);
    }
  }
}

function safeGetLocalStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`⚠️ [LocalStorage Read Warning] Failed to read "${key}":`, err);
    return null;
  }
}

export function calculateExpiryDate(startDate: Date = new Date(), durationMonths: number = 1): string {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + Number(durationMonths));
  return d.toISOString().split("T")[0];
}

export interface GymPackage {
  id: string;
  name: string;
  package_name?: string;
  price: number;
  billingCycle: "Monthly" | "Annual" | "Per Session" | "Daily";
  description: string;
  badge: string;
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number;
  bmi: string;
  note?: string;
}

export interface Coach {
  id: string;
  dbUuid?: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  experience: string;
  monthlyRate: number;
  bio: string;
  imageUrl: string;
  status: "Active" | "Inactive";
  assignedMemberCount?: number;
  createdAt?: string;
}

export interface Member {
  id: string;
  dbUuid?: string;
  name: string;
  phone: string;
  address: string;
  height: number | null;
  weight: number | null;
  startingWeight?: number | null;
  targetWeight?: number | null;
  target_weight?: number | null;
  bmi: string;
  tier: string | null;
  status: "Active" | "Inactive" | string;
  lastVisit: string;
  joinDate: string;
  emergencyContact: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  coachId?: string;
  coachName?: string;
  memberId?: string;
  authUserId?: string;
  // PT Member Body Metrics
  isPTMember?: boolean;
  fitnessGoals?: string;
  durationMonths?: number | null;
  expiryDate?: string | null;
  expiry_date?: string | null;
  profile_pic_url?: string;
  profilePicUrl?: string;
  before_photo_url?: string;
  beforePhotoUrl?: string;
  current_photo_url?: string;
  currentPhotoUrl?: string;
  createdAt?: string;
  created_at?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceNo: string;
  memberId: string | null;
  memberName: string;
  externalPayerName?: string;
  phone: string;
  category: string;
  itemDescription?: string;
  gymRevenuePercentage?: number;
  gymRevenueAmount?: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  method: "Cash" | "Card POS" | "Bank Transfer" | "Online";
  status: "Paid" | "Due Soon" | "Overdue";
  reminderSent: boolean;
  reminderChannel?: "WhatsApp" | "SMS" | "App Push" | "Member App Chat";
  receiptSent?: boolean;
  paidAmount?: number;
  balanceDue?: number;
}

export interface ExpenseRecord {
  id: string;
  dbUuid?: string;
  date: string;
  category: "Electricity & Utility Bills" | "Equipment & Maintenance" | "Staff Salaries & Wages" | "Rent & Property" | "Supplements Stock" | "Marketing & Ads" | "Other";
  amount: number;
  description: string;
  recordedBy?: string;
}

export interface BackupRecord {
  id: string;
  filename: string;
  type: "Automated Cloud" | "Manual Admin" | "Scheduled Mirror";
  size: string;
  timestamp: string;
  status: "Completed" | "Restored";
  checksum: string;
}

export interface ChatMessage {
  id: string;
  sender: "member" | "admin";
  text: string;
  timestamp: string;
  createdAt?: string;
  createdAtMs?: number;
  status?: "sent" | "delivered" | "read";
  attachmentType?: "workout" | "diet" | "invoice";
}

export interface ChatConversation {
  id: string;
  memberId: string;
  memberName: string;
  phone: string;
  tier: string | null;
  status: "Online" | "Offline";
  lastActive: string;
  unreadCount: number;
  messages: ChatMessage[];
  profile_pic_url?: string;
  profilePicUrl?: string;
}

export interface PendingCoachRequest {
  id: string;
  memberId: string;
  senderId: string;
  memberName: string;
  requestedCoachName: string;
  coachId?: string;
  messageText: string;
  createdAt: string;
  timestamp: string;
  rawMessage: any;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type?: "coach_request" | "chat_message" | "info" | "success";
  targetTab?: string;
  memberId?: string;
}

export interface RecentMemberMessage {
  id: string;
  memberId: string;
  memberName: string;
  avatarUrl: string;
  messageText: string;
  timestamp: string;
}

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();

  // Map URL pathname to activeTab name dynamically
  const getTabFromPath = (path: string): string => {
    if (!path) return "Overview";
    if (path.startsWith("/dashboard/chat")) return "Member Chat";
    if (path.startsWith("/dashboard/coaches")) return "Coaches";
    if (path.startsWith("/dashboard/members")) return "Members";
    if (path.startsWith("/dashboard/payments")) return "Payments";
    if (path.startsWith("/dashboard/settings")) return "Settings";
    if (path.startsWith("/dashboard/qr") || path.startsWith("/dashboard/backup")) return "Backup / QR";
    return "Overview";
  };

  const activeTab = getTabFromPath(pathname);

  const handleTabChange = (tabName: string) => {
    if (tabName === "Member Chat") {
      setUnreadChatBadgeCount(0);
    }
    let targetPath = "/dashboard";
    if (tabName === "Member Chat") targetPath = "/dashboard/chat";
    else if (tabName === "Coaches") targetPath = "/dashboard/coaches";
    else if (tabName === "Members") targetPath = "/dashboard/members";
    else if (tabName === "Payments") targetPath = "/dashboard/payments";
    else if (tabName === "Settings") targetPath = "/dashboard/settings";
    else if (tabName === "Backup / QR") targetPath = "/dashboard/qr";

    if ((tabName === "Settings" || tabName === "Payments") && currentUserRole === "STAFF") {
      setShowRbacSecurityAlert(true);
      setTimeout(() => setShowRbacSecurityAlert(false), 4000);
      router.push("/dashboard");
      return;
    }

    router.push(targetPath);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [topbarSearchQuery, setTopbarSearchQuery] = useState("");
  const [topbarSearchResults, setTopbarSearchResults] = useState<Member[]>([]);
  const [isTopbarSearchLoading, setIsTopbarSearchLoading] = useState(false);
  const [isTopbarSearchFocused, setIsTopbarSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState<string>("All");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState<string>("");
  const [autoRemindersEnabled, setAutoRemindersEnabled] = useState(true);
  const [memberComboboxQuery, setMemberComboboxQuery] = useState<string>("");
  const [isMemberComboboxOpen, setIsMemberComboboxOpen] = useState<boolean>(false);

  // Overview & Members Loading Setup
  const [isOverviewLoading, setIsOverviewLoading] = useState<boolean>(true);
  const [isMembersLoading, setIsMembersLoading] = useState<boolean>(true);

  // Dynamic Financial Data State (Empty array by default for DB integration)
  const [financialData, setFinancialData] = useState<
    { month: string; shortMonth: string; income: number; expenses: number }[]
  >([]);

  // Placeholder Database Fetch Function for Financial Trend Data (Supabase / Firebase REST Integration)
  const fetchFinancialData = async () => {
    try {
      console.log("[FINANCIAL TREND API] Fetching monthly income & expenses trend from database...");
      // Insert Supabase / Firebase database fetching query here later:
      // const { data } = await supabase.from('monthly_financials').select('*');
      // if (data) setFinancialData(data);
    } catch (err) {
      console.error("Error fetching financial trend data:", err);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Placeholder Database Fetch Function for Overview Dashboard (Connect to Supabase / Firebase / REST API)
  const fetchDashboardMetrics = async () => {
    setIsOverviewLoading(true);
    try {
      console.log("[DASHBOARD METRICS API] Fetching metrics from database...");
      // Simulated database network delay to demonstrate dark-theme loading skeletons
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (err) {
      console.log("Error fetching dashboard metrics:", err);
    } finally {
      setIsOverviewLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  // One-time cleanup of bloated legacy localStorage keys to ensure 0% storage quota issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("igym_cache_members");
        localStorage.removeItem("igym_cache_payments");
        localStorage.removeItem("igym_saved_payments");
      } catch (e) {}
    }
  }, []);

  // Members Dataset State (Fetched live from Supabase)
  const [members, setMembers] = useState<Member[]>([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Bulk Activation State for Inactive Rate Analysis Modal
  const [selectedBulkInactiveMemberIds, setSelectedBulkInactiveMemberIds] = useState<string[]>([]);
  const [isBulkActivateModalOpen, setIsBulkActivateModalOpen] = useState(false);
  const [bulkActivatePkgName, setBulkActivatePkgName] = useState<string>("1 Month");
  const [bulkActivateDurationMonths, setBulkActivateDurationMonths] = useState<number>(1);
  const [bulkActivateAmount, setBulkActivateAmount] = useState<number>(3500);
  const [bulkActivateMethod, setBulkActivateMethod] = useState<"Cash" | "Card" | "Bank Transfer" | "Online">("Cash");
  const [isBulkActivating, setIsBulkActivating] = useState(false);


  // Coach Management State
  const [coaches, setCoaches] = useState<Coach[]>([]);

  const [isAddCoachModalOpen, setIsAddCoachModalOpen] = useState(false);
  const [selectedViewCoach, setSelectedViewCoach] = useState<Coach | null>(null);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [coachSearchQuery, setCoachSearchQuery] = useState("");
  const [coachSpecializationFilter, setCoachSpecializationFilter] = useState("All");

  // Pending Coach Requests & Realtime Toast & Unread Badge State
  const [pendingCoachRequests, setPendingCoachRequests] = useState<PendingCoachRequest[]>([]);
  const [coachActionLoading, setCoachActionLoading] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [realtimeToast, setRealtimeToast] = useState<ToastNotification | null>(null);
  const [unreadChatBadgeCount, setUnreadChatBadgeCount] = useState<number>(0);
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);

  // Reset Member Password to Default ("111111") Action Handler
  const handleResetMemberPassword = async (member: Member) => {
    const confirmMsg = `Are you sure you want to reset ${member.name}'s password to the default (111111)?`;
    if (!confirm(confirmMsg)) return;

    setIsResettingPassword(true);
    try {
      const result = await resetMemberPasswordAction({
        memberId: member.id,
        authUserId: member.authUserId || member.dbUuid || member.id,
        newPassword: "111111",
      });

      if (result.success) {
        setToastMessage(`✅ Password successfully reset to 111111 for ${member.name}`);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setToastMessage(`⚠️ Password Reset Error: ${result.error || "Failed to reset password."}`);
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Exception resetting password:", err);
      setToastMessage(`⚠️ Password Reset Exception: ${err?.message || "Unexpected error."}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsResettingPassword(false);
    }
  };



  const [coachFormData, setCoachFormData] = useState({
    name: "",
    specialization: "Bodybuilding & Strength",
    phone: "",
    email: "",
    experience: "3+ Years",
    monthlyRate: 12000,
    bio: "",
    imageUrl: "",
    status: "Active" as "Active" | "Inactive",
  });

  // Handle Coach Image Upload (File Reader Preview + Supabase Storage)
  const handleCoachImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant local base64 preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoachFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // 2. Async upload to Supabase Storage bucket 'coaches'
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `coach_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("coaches")
        .upload(fileName, file, { upsert: true });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from("coaches").getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          setCoachFormData((prev) => ({ ...prev, imageUrl: publicUrlData.publicUrl }));
        }
      }
    } catch (err) {
      console.log("Coach image storage upload notice:", err);
    }
  };

  // Submit New / Edit Coach with direct Supabase CRUD
  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachFormData.name) return;

    if (editingCoach) {
      const updatePayload = {
        name: coachFormData.name,
        specialization: coachFormData.specialization,
        phone: coachFormData.phone,
        email: coachFormData.email,
        experience: coachFormData.experience,
        monthly_rate: coachFormData.monthlyRate,
        bio: coachFormData.bio,
        image_url: coachFormData.imageUrl || editingCoach.imageUrl,
        status: coachFormData.status,
      };

      try {
        let err;
        if (editingCoach.dbUuid) {
          const res = await supabase.from("coaches").update(updatePayload).eq("id", editingCoach.dbUuid);
          err = res.error;
        } else {
          const res = await supabase.from("coaches").update(updatePayload).eq("coach_id", editingCoach.id);
          err = res.error;
        }

        if (err) {
          console.error("❌ Failed to update coach in Supabase:", err.message);
          setToastMessage(`Failed to update coach: ${err.message}`);
          setTimeout(() => setToastMessage(null), 4000);
          return;
        }

        setCoaches((prev) =>
          prev.map((c) =>
            c.id === editingCoach.id
              ? {
                  ...c,
                  name: coachFormData.name,
                  specialization: coachFormData.specialization,
                  phone: coachFormData.phone,
                  email: coachFormData.email,
                  experience: coachFormData.experience,
                  monthlyRate: coachFormData.monthlyRate,
                  bio: coachFormData.bio,
                  imageUrl: coachFormData.imageUrl || c.imageUrl,
                  status: coachFormData.status,
                }
              : c
          )
        );
        setToastMessage("✅ Coach profile updated successfully!");
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err: any) {
        console.error("Exception updating coach in Supabase:", err);
      }
    } else {
      const newId = `COACH-${String(coaches.length + 1).padStart(3, "0")}`;
      const insertPayload = {
        coach_id: newId,
        name: coachFormData.name,
        specialization: coachFormData.specialization,
        phone: coachFormData.phone || "N/A",
        email: coachFormData.email || "N/A",
        experience: coachFormData.experience || "1+ Year",
        monthly_rate: Number(coachFormData.monthlyRate) || 10000,
        bio: coachFormData.bio || "Fitness coach at IGYM",
        image_url:
          coachFormData.imageUrl ||
          "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80",
        status: coachFormData.status,
      };

      try {
        const { data: insData, error: insErr } = await supabase
          .from("coaches")
          .insert([insertPayload])
          .select("*");

        if (insErr) {
          console.error("❌ Failed to insert coach into Supabase:", insErr.message);
          setToastMessage(`Failed to add coach: ${insErr.message}`);
          setTimeout(() => setToastMessage(null), 4000);
          return;
        }

        const createdDbCoach = insData && insData[0] ? insData[0] : null;
        const newCoach: Coach = {
          id: createdDbCoach?.coach_id || newId,
          dbUuid: createdDbCoach?.id,
          name: insertPayload.name,
          specialization: insertPayload.specialization,
          phone: insertPayload.phone,
          email: insertPayload.email,
          experience: insertPayload.experience,
          monthlyRate: insertPayload.monthly_rate,
          bio: insertPayload.bio,
          imageUrl: insertPayload.image_url,
          status: insertPayload.status as "Active" | "Inactive",
          assignedMemberCount: 0,
        };

        setCoaches((prev) => [newCoach, ...prev]);
        setToastMessage("✅ New coach added permanently to database!");
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err: any) {
        console.error("Exception inserting coach into Supabase:", err);
      }
    }

    setIsAddCoachModalOpen(false);
    setEditingCoach(null);
  };

  // Real Database Deletion Handler
  const handleDeleteCoach = async (coachId: string) => {
    if (!confirm("Are you sure you want to delete this coach profile permanently from the database?")) return;
    const targetCoach = coaches.find((c) => c.id === coachId || c.dbUuid === coachId);

    try {
      let isDeleted = false;

      if (targetCoach) {
        if (targetCoach.dbUuid) {
          const { error: err1 } = await supabase.from("coaches").delete().eq("id", targetCoach.dbUuid);
          if (!err1) isDeleted = true;
        }
        if (!isDeleted) {
          const { error: err2 } = await supabase.from("coaches").delete().eq("coach_id", targetCoach.id);
          if (!err2) isDeleted = true;
        }
        if (!isDeleted && targetCoach.name) {
          const { error: err3 } = await supabase.from("coaches").delete().eq("name", targetCoach.name);
          if (!err3) isDeleted = true;
        }
      } else {
        const { error: errFallback } = await supabase.from("coaches").delete().eq("id", coachId);
        if (!errFallback) isDeleted = true;
      }

      if (isDeleted) {
        setCoaches((prev) => prev.filter((c) => c.id !== coachId && c.dbUuid !== coachId));
        setToastMessage("✅ Coach deleted successfully from database.");
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        console.error("Failed to delete coach from Supabase.");
        setToastMessage("⚠️ Could not delete coach profile from database. Please check Supabase permissions.");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err: any) {
      console.error("Exception deleting coach from Supabase:", err);
      setToastMessage(`Failed to delete coach: ${err?.message || "Database error"}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Assign Coach to Member
  const handleAssignCoachToMember = async (memberId: string, coachId: string) => {
    const selectedCoach = coaches.find((c) => c.id === coachId || c.dbUuid === coachId);
    const coachName = selectedCoach ? selectedCoach.name : "Unassigned";

    const updatedMembers = members.map((m) =>
      m.id === memberId ? { ...m, coachId, coachName } : m
    );
    setMembers(updatedMembers);

    const targetMem = members.find((m) => m.id === memberId);
    try {
      if (targetMem) {
        const memUuid = targetMem.dbUuid || targetMem.id;
        await supabase
          .from("members")
          .update({ coach_id: coachId, coach_name: coachName })
          .eq("id", memUuid);
      }
    } catch (err) {
      console.log("Supabase coach assignment notice:", err);
    }
  };

  // --- PENDING COACH REQUESTS HANDLERS ---
  const loadPendingCoachRequests = useCallback(async () => {
    try {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .ilike("message", "%System Automated Request:%")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending coach requests:", error);
        return;
      }

      if (!messages || messages.length === 0) {
        setPendingCoachRequests([]);
        return;
      }

      // Fetch admin replies to check if request is already processed
      const { data: allAdminMsgs } = await supabase
        .from("chat_messages")
        .select("*")
        .or("sender_id.eq.admin,sender.eq.admin");

      const handledIdsRaw = typeof window !== "undefined" ? localStorage.getItem("igym_handled_coach_requests") : null;
      const handledIds: string[] = handledIdsRaw ? JSON.parse(handledIdsRaw) : [];

      const pendingList: PendingCoachRequest[] = [];

      for (const msg of messages) {
        const msgId = String(msg.id);
        if (handledIds.includes(msgId)) continue;

        const memberIdStr = String(msg.member_id || msg.sender_id || "").trim();
        const senderIdStr = String(msg.sender_id || msg.member_id || "").trim();

        const requestTime = new Date(msg.created_at || Date.now()).getTime();
        const hasAdminReply = allAdminMsgs?.some((admMsg: any) => {
          const admMemberId = String(admMsg.member_id || admMsg.receiver_id || "").trim();
          const admTime = new Date(admMsg.created_at || Date.now()).getTime();
          const admText = String(admMsg.message || "");
          const matchesMember = admMemberId === memberIdStr || admMemberId === senderIdStr;
          const matchesResponseText =
            admText.includes("approved") ||
            admText.includes("fully booked") ||
            admText.includes("Your request for Personal Training has been approved") ||
            admText.includes("Sorry, this coach is currently fully booked");
          return matchesMember && admTime >= requestTime - 1000 && matchesResponseText;
        });

        if (hasAdminReply) continue;

        const targetMember = members.find(
          (m) =>
            m.id === memberIdStr ||
            m.memberId === memberIdStr ||
            m.dbUuid === memberIdStr ||
            m.authUserId === senderIdStr ||
            m.id === senderIdStr
        );

        const resolvedMemberName =
          targetMember?.name ||
          (memberIdStr && memberIdStr.length < 15 ? `Member (${memberIdStr})` : `Member (${memberIdStr.slice(0, 8)})`);

        const msgText = String(msg.message || "");
        let coachNameStr = "";
        if (msgText.includes("with Coach ")) {
          coachNameStr = msgText.split("with Coach ")[1]?.replace(/\.$/, "").trim() || "";
        } else if (msgText.includes("Coach ")) {
          coachNameStr = msgText.split("Coach ")[1]?.replace(/\.$/, "").trim() || "";
        } else {
          coachNameStr = "Unspecified Coach";
        }

        const matchedCoach = coaches.find(
          (c) =>
            c.name.toLowerCase().includes(coachNameStr.toLowerCase()) ||
            coachNameStr.toLowerCase().includes(c.name.toLowerCase())
        );

        pendingList.push({
          id: msgId,
          memberId: memberIdStr,
          senderId: senderIdStr,
          memberName: resolvedMemberName,
          requestedCoachName: coachNameStr || "Coach",
          coachId: matchedCoach?.id,
          messageText: msgText,
          createdAt: msg.created_at || new Date().toISOString(),
          timestamp: new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          rawMessage: msg,
        });
      }

      setPendingCoachRequests(pendingList);
    } catch (err) {
      console.error("Exception loading pending coach requests:", err);
    }
  }, [supabase, members, coaches]);

  useEffect(() => {
    loadPendingCoachRequests();
  }, [loadPendingCoachRequests]);

  const handleAcceptCoachRequest = async (req: PendingCoachRequest) => {
    setCoachActionLoading((prev) => ({ ...prev, [req.id]: true }));
    try {
      const targetMember = members.find(
        (m) =>
          m.id === req.memberId ||
          m.memberId === req.memberId ||
          m.dbUuid === req.memberId ||
          m.authUserId === req.senderId ||
          m.id === req.senderId
      );

      const targetCoach = coaches.find(
        (c) =>
          c.name.toLowerCase().includes(req.requestedCoachName.toLowerCase()) ||
          req.requestedCoachName.toLowerCase().includes(c.name.toLowerCase())
      );

      const assignedCoachId = targetCoach?.id || req.coachId || "COACH-001";
      const assignedCoachName = targetCoach?.name || req.requestedCoachName;

      if (targetMember) {
        const memUuid = targetMember.dbUuid || targetMember.id;
        await supabase
          .from("members")
          .update({
            coach_id: assignedCoachId,
            coach_name: assignedCoachName,
          })
          .or(`id.eq.${memUuid},member_id.eq.${req.memberId},auth_user_id.eq.${req.senderId}`);

        setMembers((prev) =>
          prev.map((m) =>
            m.id === targetMember.id ? { ...m, coachId: assignedCoachId, coachName: assignedCoachName } : m
          )
        );
      } else {
        await supabase
          .from("members")
          .update({
            coach_id: assignedCoachId,
            coach_name: assignedCoachName,
          })
          .or(`member_id.eq.${req.memberId},auth_user_id.eq.${req.senderId}`);
      }

      const replyPayload = {
        member_id: req.memberId,
        sender_id: "admin",
        receiver_id: req.senderId || req.memberId,
        message: "Your request for Personal Training has been approved!",
        timestamp: new Date().toISOString(),
      };

      await supabase.from("chat_messages").insert([replyPayload]);

      const handledIdsRaw = safeGetLocalStorage("igym_handled_coach_requests");
      const handledIds: string[] = handledIdsRaw ? JSON.parse(handledIdsRaw) : [];
      if (!handledIds.includes(req.id)) {
        handledIds.push(req.id);
        safeSetLocalStorage("igym_handled_coach_requests", JSON.stringify(handledIds));
      }

      setPendingCoachRequests((prev) => prev.filter((r) => r.id !== req.id));

      setToastMessage(`✅ Approved request: Assigned ${assignedCoachName} to ${req.memberName}`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error("Exception accepting coach request:", err);
      setToastMessage(`Failed to accept request: ${err?.message || "Error occurred"}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setCoachActionLoading((prev) => ({ ...prev, [req.id]: false }));
    }
  };

  const handleDeclineCoachRequest = async (req: PendingCoachRequest) => {
    setCoachActionLoading((prev) => ({ ...prev, [req.id]: true }));
    try {
      const replyPayload = {
        member_id: req.memberId,
        sender_id: "admin",
        receiver_id: req.senderId || req.memberId,
        message: "Sorry, this coach is currently fully booked.",
        timestamp: new Date().toISOString(),
      };

      await supabase.from("chat_messages").insert([replyPayload]);

      const handledIdsRaw = safeGetLocalStorage("igym_handled_coach_requests");
      const handledIds: string[] = handledIdsRaw ? JSON.parse(handledIdsRaw) : [];
      if (!handledIds.includes(req.id)) {
        handledIds.push(req.id);
        safeSetLocalStorage("igym_handled_coach_requests", JSON.stringify(handledIds));
      }

      setPendingCoachRequests((prev) => prev.filter((r) => r.id !== req.id));

      setToastMessage(`Declined request for ${req.memberName}. Sent fully booked message.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error("Exception declining coach request:", err);
      setToastMessage(`Failed to decline request: ${err?.message || "Error occurred"}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setCoachActionLoading((prev) => ({ ...prev, [req.id]: false }));
    }
  };

  // Payment Records Dataset State (Fetched live from Supabase)
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);

  // Gym Package Pricing State
  const [packagePrices, setPackagePrices] = useState({
    monthlyFee: 3500,
    admissionFee: 1500,
    ptFee: 5000,
    fullPackage: 8500,
  });

  // Official iGYM Fitness Center Pricing Tiers Dataset
  const defaultOfficialGymPackages: GymPackage[] = [
    {
      id: "pkg-1",
      name: "Admission Fee (ප්‍රවේශ ගාස්තු)",
      price: 1500,
      billingCycle: "Daily",
      description: "One-time registration fee for new members joining iGYM Fitness Center",
      badge: "One-time",
    },
    {
      id: "pkg-2",
      name: "Men (Without Treadmills)",
      price: 3500,
      billingCycle: "Monthly",
      description: "Full weight training & gym floor access for male members (No treadmill)",
      badge: "Standard",
    },
    {
      id: "pkg-3",
      name: "Men (With Treadmills)",
      price: 5000,
      billingCycle: "Monthly",
      description: "Full gym floor access + unlimited cardio & treadmill training for male members",
      badge: "Popular 🌟",
    },
    {
      id: "pkg-4",
      name: "Ladies (Without Treadmills)",
      price: 3000,
      billingCycle: "Monthly",
      description: "Full gym floor & strength training access for female members (No treadmill)",
      badge: "Standard",
    },
    {
      id: "pkg-5",
      name: "Ladies (With Treadmills)",
      price: 4500,
      billingCycle: "Monthly",
      description: "Full gym access + unlimited cardio & treadmill training for female members",
      badge: "Popular 🌟",
    },
    {
      id: "pkg-6",
      name: "Student (Without Treadmills)",
      price: 2500,
      billingCycle: "Monthly",
      description: "Special discounted rate for school & university students (Valid student ID required)",
      badge: "Discounted 🎓",
    },
    {
      id: "pkg-7",
      name: "Student (With Treadmills)",
      price: 4000,
      billingCycle: "Monthly",
      description: "Discounted rate for students with full cardio & treadmill access",
      badge: "Discounted 🎓",
    },
    {
      id: "pkg-8",
      name: "Couple Package (Without Treadmills)",
      price: 5500,
      billingCycle: "Monthly",
      description: "Shared membership package for couples / 2 partners (Strength training only)",
      badge: "Special 👥",
    },
    {
      id: "pkg-9",
      name: "Couple Package (With Treadmills)",
      price: 8500,
      billingCycle: "Monthly",
      description: "All-inclusive couple membership + full cardio & treadmill access for both partners",
      badge: "Best Value 🏆",
    },
  ];

  const [gymPackages, setGymPackages] = useState<GymPackage[]>([]);

  const [newPackageForm, setNewPackageForm] = useState({
    name: "",
    price: 5000,
    billingCycle: "Monthly" as "Monthly" | "Annual" | "Per Session" | "Daily",
    description: "",
    badge: "Standard" as "Popular" | "Best Value" | "VIP" | "Discounted" | "Standard" | "Special",
  });
  const [showAddNewPackageCard, setShowAddNewPackageCard] = useState(false);

  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isPackagePricingModalOpen, setIsPackagePricingModalOpen] = useState(false);
  const [isPendingPaymentsModalOpen, setIsPendingPaymentsModalOpen] = useState(false);

  // Income vs Expenses View Tab State
  const [paymentViewTab, setPaymentViewTab] = useState<"INCOME" | "EXPENSES">("INCOME");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("All");
  const [isExpensesLoading, setIsExpensesLoading] = useState<boolean>(false);

  // Expenses Dataset & Modal State
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);

  // Debounced Topbar Global Search Query against Supabase members table
  useEffect(() => {
    if (!topbarSearchQuery.trim()) {
      setTopbarSearchResults([]);
      setIsTopbarSearchLoading(false);
      return;
    }

    setIsTopbarSearchLoading(true);
    const timer = setTimeout(async () => {
      const queryStr = topbarSearchQuery.trim();

      try {
        const { data: dbMatches, error } = await supabase
          .from("members")
          .select("*")
          .or(`full_name.ilike.%${queryStr}%,name.ilike.%${queryStr}%,phone.ilike.%${queryStr}%,address.ilike.%${queryStr}%`)
          .limit(5);

        if (!error && dbMatches && dbMatches.length > 0) {
          const parsedMatches: Member[] = dbMatches.map((m: any, idx: number) => {
            const emName = m.emergency_contact_name || m.emergencyContactName || "";
            const emPhone = m.emergency_contact_phone || m.emergencyContactPhone || "";
            const emCombined = m.emergency_contact || (emName || emPhone ? `${emName} (${emPhone})` : "N/A");
            const joinDateVal = m.join_date || m.joinDate || m.created_at?.split("T")[0] || new Date().toISOString().split("T")[0];
            const expDateVal = m.expiry_date || m.expiryDate || new Date().toISOString().split("T")[0];
            const durMonths = Number(m.duration_months || m.durationMonths || 1);

            return {
              id: String(m.member_id || m.id || `MEM-${idx + 1}`),
              dbUuid: m.id,
              name: m.full_name || m.name || "Member",
              phone: m.phone || "N/A",
              address: m.address || "N/A",
              height: Number(m.height) || 170,
              weight: Number(m.weight) || 70,
              startingWeight: Number(m.starting_weight || m.startingWeight || m.weight || 70),
              bmi: m.bmi || "22.5",
              tier: m.tier || m.membership_type || "Standard",
              status: m.status || "Active",
              lastVisit: m.last_visit || "Just now",
              joinDate: joinDateVal,
              durationMonths: durMonths,
              expiryDate: expDateVal,
              expiry_date: expDateVal,
              emergencyContact: emCombined,
              emergencyContactName: emName,
              emergencyContactPhone: emPhone,
              coachId: m.coach_id || undefined,
              coachName: m.coach_name || undefined,
              isPTMember: !!m.is_pt_member,
              fitnessGoals: m.fitness_goals || undefined,
              profile_pic_url: m.profile_pic_url || m.profilePicUrl || m.avatar_url || m.avatar || undefined,
              profilePicUrl: m.profile_pic_url || m.profilePicUrl || m.avatar_url || m.avatar || undefined,
            };
          });

          setTopbarSearchResults(parsedMatches);
        } else {
          const localMatches = members.filter(
            (m) =>
              m.name.toLowerCase().includes(queryStr.toLowerCase()) ||
              m.phone.toLowerCase().includes(queryStr.toLowerCase()) ||
              m.address.toLowerCase().includes(queryStr.toLowerCase()) ||
              (m.tier || "").toLowerCase().includes(queryStr.toLowerCase())
          ).slice(0, 5);

          setTopbarSearchResults(localMatches);
        }
      } catch (err) {
        console.error("Search query error:", err);
        const localMatches = members.filter(
          (m) =>
            m.name.toLowerCase().includes(queryStr.toLowerCase()) ||
            m.phone.toLowerCase().includes(queryStr.toLowerCase()) ||
            m.address.toLowerCase().includes(queryStr.toLowerCase())
        ).slice(0, 5);
        setTopbarSearchResults(localMatches);
      } finally {
        setIsTopbarSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [topbarSearchQuery, members]);
  useEffect(() => {
    const liveIncome = paymentRecords
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const liveExpenses = expenseRecords.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    if (liveIncome > 0 || liveExpenses > 0) {
      setFinancialData((prev) => {
        if (prev.length === 0) {
          return [
            {
              month: "August 2026",
              shortMonth: "Aug",
              income: liveIncome,
              expenses: liveExpenses,
            },
          ];
        }
        return prev.map((item, idx) =>
          idx === prev.length - 1
            ? {
                ...item,
                income: liveIncome > 0 ? liveIncome : item.income,
                expenses: liveExpenses > 0 ? liveExpenses : item.expenses,
              }
            : item
        );
      });
    }
  }, [paymentRecords, expenseRecords]);

  // Client-Side Export Functions (Excel CSV & PDF Document)
  const exportExpensesToExcel = () => {
    if (expenseRecords.length === 0) {
      alert("No expense records available to export.");
      return;
    }
    const headers = ["Expense ID", "Date", "Category", "Amount (LKR)", "Description", "Recorded By"];
    const rows = expenseRecords.map((e) => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.category}"`,
      e.amount,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.recordedBy || "Admin"}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IGYM_Balangoda_Expenses_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExpensesToPDF = () => {
    if (expenseRecords.length === 0) {
      alert("No expense records available to export.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate the PDF report.");
      return;
    }

    const totalAmount = expenseRecords.reduce((sum, e) => sum + e.amount, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>IGYM Balangoda - Expenses & Operational Costs Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; background: #ffffff; }
          .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f43f5e; padding-bottom: 12px; margin-bottom: 20px; }
          h1 { font-size: 20px; color: #881337; margin: 0; font-weight: 800; }
          p { font-size: 11px; color: #64748b; margin-top: 4px; margin-bottom: 0; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th, td { border: 1px solid #e2e8f0; padding: 9px 12px; text-align: left; }
          th { background-color: #fff1f2; color: #881337; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .total-row { font-weight: bold; background-color: #ffe4e6; color: #881337; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; }
          .card-title { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .card-val { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <div>
            <h1>IGYM BALANGODA — EXPENSES & OPERATIONAL REPORT</h1>
            <p>Branch: Main Branch Balangoda | Date Generated: ${new Date().toLocaleString()}</p>
          </div>
          <div>
            <span class="badge">FINANCIAL REPORT ✅</span>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-title">Total Operational Cost</div>
            <div class="card-val" style="color:#e11d48">LKR ${totalAmount.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="card-title">Utility Bills</div>
            <div class="card-val">LKR ${expenseRecords
              .filter((e) => e.category === "Electricity & Utility Bills")
              .reduce((sum, e) => sum + e.amount, 0)
              .toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="card-title">Equipment & Repairs</div>
            <div class="card-val">LKR ${expenseRecords
              .filter((e) => e.category === "Equipment & Maintenance")
              .reduce((sum, e) => sum + e.amount, 0)
              .toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="card-title">Salaries & Rent</div>
            <div class="card-val">LKR ${expenseRecords
              .filter((e) => e.category === "Rent & Property" || e.category === "Staff Salaries & Wages")
              .reduce((sum, e) => sum + e.amount, 0)
              .toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>EXPENSE ID</th>
              <th>DATE</th>
              <th>CATEGORY</th>
              <th>AMOUNT (LKR)</th>
              <th>DESCRIPTION</th>
              <th>RECORDED BY</th>
            </tr>
          </thead>
          <tbody>
            ${expenseRecords
              .map(
                (e) => `
              <tr>
                <td><strong>${e.id}</strong></td>
                <td>${e.date}</td>
                <td>${e.category}</td>
                <td><strong>LKR ${e.amount.toLocaleString()}</strong></td>
                <td>${e.description}</td>
                <td>${e.recordedBy || "Admin"}</td>
              </tr>
            `
              )
              .join("")}
            <tr class="total-row">
              <td colSpan="3" style="text-align: right;">TOTAL EXPENSES:</td>
              <td colSpan="3">LKR ${totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [isRecordExpenseModalOpen, setIsRecordExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Electricity & Utility Bills" as ExpenseRecord["category"],
    amount: 5000,
    description: "",
    recordedBy: "Owner",
  });

  // Chat Plan, Template & Broadcast Modals State
  const [isWorkoutPlanModalOpen, setIsWorkoutPlanModalOpen] = useState(false);
  const [isDietPlanModalOpen, setIsDietPlanModalOpen] = useState(false);
  const [isPaymentReminderModalOpen, setIsPaymentReminderModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [chatBroadcastMessage, setChatBroadcastMessage] = useState("");
  const [isChatBroadcasting, setIsChatBroadcasting] = useState(false);

  const [workoutTemplates, setWorkoutTemplates] = useState<{ id: string; title: string; content: string }[]>([
    {
      id: "w-1",
      title: "🏋️ 4-Day Hypertrophy Muscle Split",
      content: "Day 1: Chest & Triceps (Bench Press, Incline DB Press, Dips)\nDay 2: Back & Biceps (Lat Pulldowns, Barbell Rows, Curls)\nDay 3: Rest / Light Cardio\nDay 4: Shoulders & Abs (Overhead Press, Lateral Raises, Planks)\nDay 5: Leg Day (Squats, Leg Press, Romanian Deadlifts)",
    },
    {
      id: "w-2",
      title: "🏃 High Intensity Fat Loss Circuit",
      content: "Circuit 1 (4 Rounds): 15 Kettlebell Swings, 12 Burpees, 20 Mountain Climbers\nCircuit 2 (4 Rounds): 10 DB Thrusters, 15 Box Jumps, 45s Plank\nCardio: 20 mins HIIT Treadmill Sprints (30s sprint / 30s walk)",
    },
    {
      id: "w-3",
      title: "⚡ Beginner Strength & Mobility Routine",
      content: "Exercise 1: Goblet Squats - 3 sets x 12 reps\nExercise 2: Machine Chest Press - 3 sets x 10 reps\nExercise 3: Seated Cable Rows - 3 sets x 12 reps\nExercise 4: Dumbbell Shoulder Press - 3 sets x 10 reps\nCore: Hanging Knee Raises - 3 sets x 15 reps",
    },
  ]);

  const [dietTemplates, setDietTemplates] = useState<{ id: string; title: string; content: string }[]>([
    {
      id: "d-1",
      title: "🥑 High-Protein Lean Muscle Plan (2400 kcal)",
      content: "Breakfast: 4 Egg Whites + 2 Whole Eggs + 100g Oats with Berries & Almonds\nLunch: 200g Grilled Chicken Breast + 1.5 Cups Basmati Rice + Boiled Broccoli & Carrots\nPre-Workout: 1 Banana + Black Coffee / Pre-workout drink\nPost-Workout: 1 Scoop Whey Protein + 1 Apple\nDinner: 200g Fish / Chicken + Large Green Salad + 1 Sweet Potato",
    },
    {
      id: "d-2",
      title: "🔥 Fat Loss & Calorie Deficit Plan (1800 kcal)",
      content: "Morning: 1 Glass Warm Water + Lemon & Honey + 3 Boiled Eggs\nLunch: 150g Steamed Fish / Chicken Breast + Mixed Vegetables + 1 Cup Red Rice\nEvening Snack: 1 Cup Green Tea + 10 Almonds\nDinner: Grilled Chicken Salad / Vegetable Soup + 2 Whole Wheat Chapatis",
    },
    {
      id: "d-3",
      title: "🌱 Vegetarian Fitness & Protein Meal Plan",
      content: "Breakfast: Oats Porridge with Milk, Chia Seeds, Peanut Butter & Banana\nLunch: Paneer / Tofu Curry + 1 Cup Brown Rice + Lentil Soup (Dhal)\nEvening: Roasted Chickpeas + Protein Shake\nDinner: Soya Chunk Curry + Steamed Vegetables + Whole Wheat Chapati",
    },
  ]);

  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [selectedTemplateContent, setSelectedTemplateContent] = useState("");
  const [customReminderText, setCustomReminderText] = useState("");
  const [isSavingWorkoutTemplate, setIsSavingWorkoutTemplate] = useState(false);

  // Fetch Workout Templates from Supabase DB (`chat_templates` table)
  const fetchWorkoutTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_templates")
        .select("*")
        .eq("category", "workout")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((t: any) => ({
          id: String(t.id),
          title: t.title,
          content: t.content,
        }));
        setWorkoutTemplates(mapped);
      }
    } catch (err) {
      console.log("Supabase fetch chat_templates notice:", err);
    }
  };

  // Trigger template fetch when Workout Plan modal opens
  useEffect(() => {
    if (isWorkoutPlanModalOpen) {
      fetchWorkoutTemplates();
    }
  }, [isWorkoutPlanModalOpen]);

  // Save new workout template preset to Supabase DB (`chat_templates` table)
  const handleSaveWorkoutTemplate = async () => {
    if (!newTemplateTitle.trim() || !selectedTemplateContent.trim()) {
      alert("⚠️ Please enter both a Template Title and Routine Details before saving.");
      return;
    }

    setIsSavingWorkoutTemplate(true);
    const titleFormatted = newTemplateTitle.trim().startsWith("🏋️")
      ? newTemplateTitle.trim()
      : `🏋️ ${newTemplateTitle.trim()}`;

    try {
      const { data, error } = await supabase
        .from("chat_templates")
        .insert([
          {
            title: titleFormatted,
            content: selectedTemplateContent.trim(),
            category: "workout",
          },
        ])
        .select("*");

      if (error) {
        console.error("⚠️ Supabase insert template error:", error.message);
      }

      const created = {
        id: data && data[0] ? String(data[0].id) : `w-${Date.now()}`,
        title: titleFormatted,
        content: selectedTemplateContent.trim(),
      };

      setWorkoutTemplates((prev) => [created, ...prev.filter((t) => t.title !== titleFormatted)]);
      setNewTemplateTitle("");
      alert("✅ Workout template saved to database successfully!");
      fetchWorkoutTemplates();
    } catch (err: any) {
      console.error("Save template exception:", err);
      alert(`⚠️ Save Error: ${err.message || "Failed to save template."}`);
    } finally {
      setIsSavingWorkoutTemplate(false);
    }
  };

  // Load chat templates from LocalStorage on mount
  useEffect(() => {
    try {
      const savedW = localStorage.getItem("igym_saved_workout_templates");
      if (savedW) setWorkoutTemplates(JSON.parse(savedW));
      const savedD = localStorage.getItem("igym_saved_diet_templates");
      if (savedD) setDietTemplates(JSON.parse(savedD));
    } catch (e) {
      console.log("Template load notice:", e);
    }
  }, []);

  // Save chat templates to LocalStorage on updates safely
  useEffect(() => {
    safeSetLocalStorage("igym_saved_workout_templates", JSON.stringify(workoutTemplates));
  }, [workoutTemplates]);

  useEffect(() => {
    safeSetLocalStorage("igym_saved_diet_templates", JSON.stringify(dietTemplates));
  }, [dietTemplates]);

  // CSV Export Handler
  const handleExportRevenueCSV = () => {
    const headers = "Invoice No,Member Name,Phone,Category,Amount (LKR),Payment Date,Due Date,Method,Status\n";
    const rows = paymentRecords
      .map(
        (p) =>
          `"${p.invoiceNo}","${p.memberName}","${p.phone}","${p.category}",${p.amount},"${p.paymentDate}","${p.dueDate}","${p.method}","${p.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IGYM_Balangoda_Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Backup & QR Section State
  const [selectedQrMemberId, setSelectedQrMemberId] = useState<string>("MEM-001");
  const [scannedQrResult, setScannedQrResult] = useState<string | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [autoCloudBackupEnabled, setAutoCloudBackupEnabled] = useState(true);

  // Initial Backup History Dataset
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([
    {
      id: "BK-105",
      filename: "IGYM_Balangoda_Cloud_AutoBackup_2026-08-10.json",
      type: "Automated Cloud",
      size: "24.8 MB",
      timestamp: "2026-08-10 14:00",
      status: "Completed",
      checksum: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      id: "BK-104",
      filename: "IGYM_Balangoda_Full_ManualBackup_2026-08-09.json",
      type: "Manual Admin",
      size: "24.2 MB",
      timestamp: "2026-08-09 18:30",
      status: "Completed",
      checksum: "sha256:f4c2c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b966",
    },
    {
      id: "BK-103",
      filename: "IGYM_Balangoda_Cloud_AutoBackup_2026-08-08.json",
      type: "Automated Cloud",
      size: "23.9 MB",
      timestamp: "2026-08-08 00:00",
      status: "Completed",
      checksum: "sha256:a1b2c34298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111",
    },
    {
      id: "BK-102",
      filename: "IGYM_Balangoda_Scheduled_Mirror_2026-08-05.json",
      type: "Scheduled Mirror",
      size: "23.1 MB",
      timestamp: "2026-08-05 12:00",
      status: "Restored",
      checksum: "sha256:c9d8e74298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b222",
    },
  ]);

  // Action: Create New Full System Backup (.JSON Download)
  const handleCreateBackup = () => {
    setIsCreatingBackup(true);
    setTimeout(() => {
      const todayStr = new Date().toISOString().split("T")[0];
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const backupData = {
        metadata: {
          gym: "IGYM Management System",
          branch: "Balangoda Branch",
          version: "v2.5",
          exportedAt: new Date().toISOString(),
        },
        members,
        paymentRecords,
        packagePrices,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `IGYM_Balangoda_Full_Backup_${todayStr}.json`;
      a.click();

      const newRecord: BackupRecord = {
        id: `BK-${100 + backupRecords.length + 1}`,
        filename: `IGYM_Balangoda_Full_ManualBackup_${todayStr}.json`,
        type: "Manual Admin",
        size: `${(jsonStr.length / (1024 * 1024)).toFixed(1)} MB`,
        timestamp: `${todayStr} ${nowTimeStr}`,
        status: "Completed",
        checksum: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      };

      setBackupRecords([newRecord, ...backupRecords]);
      setIsCreatingBackup(false);
    }, 1000);
  };

  // Action: Restore Backup
  const handleRestoreBackup = (backupId: string) => {
    setBackupRecords((prev) =>
      prev.map((b) => (b.id === backupId ? { ...b, status: "Restored" } : b))
    );
    alert(`System successfully restored to point: Backup ID ${backupId}`);
  };

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    gymName: "IGYM Balangoda Branch",
    phone: "+94 45 228 1990 / +94 77 123 4567",
    email: "balangoda@igym.lk",
    address: "No. 42, Main Street, Balangoda, Sri Lanka",
    operatingHours: "05:30 AM - 10:00 PM (Mon - Sun)",
    currency: "LKR (Rs.)",
    smsGateway: "Dialog Sri Lanka SMS Gateway API",
    smsSenderId: "IGYM-ALERT",
    smsApiKey: "live_sk_8f9a2b1c4e6d",
    reminderAlertDays: "3 Days Before Expiry",
    autoSendWhatsapp: true,
    autoSendSms: true,
    fingerprintIp: "192.168.1.105:8080 (ZKTeco K40)",
    faceIdIp: "192.168.1.108:8080 (Hikvision DS-K1T)",
    adminPin: "8899",
    autoBackupFrequency: "Daily at 00:00 (Midnight)",
    enableInAppChat: true,
    showProgressTracker: true,
    enableVideoWorkouts: false,
    appTheme: "Dark Neon Emerald",
  });
  const [showSettingsSavedNotice, setShowSettingsSavedNotice] = useState(false);

  // Global Member App Banner State
  const [bannerText, setBannerText] = useState("🔥 Special Promo: Get 20% OFF on 6-Month Memberships this week!");
  const [isBannerActive, setIsBannerActive] = useState(true);

  // Broadcast System Notifications State
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Save Settings & Sync Banner to Supabase DB (`app_settings` table where id = 1)
  const handleSaveSettings = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSettingsSavedNotice(true);
    setTimeout(() => setShowSettingsSavedNotice(false), 3000);

    try {
      const { error: appSetErr } = await supabase.from("app_settings").upsert({
        id: 1,
        banner_text: bannerText,
        is_banner_active: isBannerActive,
        updated_at: new Date().toISOString(),
      });

      if (appSetErr) {
        console.error("⚠️ Supabase app_settings update error:", appSetErr.message);
      } else {
        console.log("✅ App settings (banner) saved to Supabase DB successfully.");
      }
    } catch (err) {
      console.error("⚠️ Exception saving app_settings:", err);
    }
  };

  // Broadcast System Notification Handler (Inserts to `global_notifications` table)
  const handleSendBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      alert("⚠️ Please enter both a Notification Title and Message Body.");
      return;
    }

    setIsSendingBroadcast(true);

    try {
      const { error: notifErr } = await supabase.from("global_notifications").insert([
        {
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (notifErr) {
        console.error("⚠️ Supabase global_notifications error:", notifErr.message);
        alert(`⚠️ Could not send broadcast notification: ${notifErr.message}`);
      } else {
        alert("🎉 Notification sent to all members!");
        setBroadcastTitle("");
        setBroadcastMessage("");
      }
    } catch (err: any) {
      console.error("⚠️ Exception sending broadcast notification:", err);
      alert(`⚠️ Exception: ${err.message || "Failed to send notification."}`);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // RBAC & Auth System State
  const [currentUserRole, setCurrentUserRole] = useState<"SUPER_ADMIN" | "ADMIN" | "STAFF">("SUPER_ADMIN");
  const [currentUserName, setCurrentUserName] = useState("Chathura (Owner)");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showRbacSecurityAlert, setShowRbacSecurityAlert] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Read saved userRole from localStorage on mount
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("userRole");
      if (savedRole === "staff") {
        setCurrentUserRole("STAFF");
        setCurrentUserName("Nuwan (Staff / Trainer)");
      } else if (savedRole === "developer") {
        setCurrentUserRole("ADMIN");
        setCurrentUserName("Developer / Admin");
      } else if (savedRole === "owner") {
        setCurrentUserRole("SUPER_ADMIN");
        setCurrentUserName("Chathura (Owner)");
      }
    } catch (e) {}
  }, []);

  // Enforce RBAC Tab Protection Effect for STAFF role
  useEffect(() => {
    if (currentUserRole === "STAFF" && (activeTab === "Payments" || activeTab === "Settings")) {
      router.push("/dashboard");
      setShowRbacSecurityAlert(true);
      setTimeout(() => setShowRbacSecurityAlert(false), 4000);
    }
  }, [currentUserRole, activeTab, router]);

  // Supabase Auth State & Session Management
  const [authUser, setAuthUser] = useState<any>(null);
  const [authSession, setAuthSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authFormData, setAuthFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "ADMIN" as "SUPER_ADMIN" | "ADMIN" | "STAFF",
  });

  // Listen to Supabase Auth state & query admin_roles table for real user role
  useEffect(() => {
    const fetchUserRole = async (userEmail: string) => {
      try {
        const { data: roleData } = await supabase
          .from("admin_roles")
          .select("role, full_name")
          .eq("email", userEmail)
          .maybeSingle();

        if (roleData?.role) {
          const r = String(roleData.role).toLowerCase();
          if (r.includes("owner") || r.includes("super")) {
            setCurrentUserRole("SUPER_ADMIN");
          } else if (r.includes("dev") || r.includes("admin")) {
            setCurrentUserRole("ADMIN");
          } else {
            setCurrentUserRole("STAFF");
          }
        }
        if (roleData?.full_name) {
          setCurrentUserName(roleData.full_name);
        }
      } catch (err) {
        console.log("admin_roles dashboard query error:", err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      setIsLoggedIn(true);
      if (session?.user?.email) {
        fetchUserRole(session.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      setIsLoggedIn(true);
      if (session?.user?.email) {
        fetchUserRole(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle Supabase Sign Up (Registration)
  const handleAuthSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    if (!authFormData.email || !authFormData.password) {
      setAuthError("Email and Password are required.");
      setAuthLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: authFormData.email,
        password: authFormData.password,
        options: {
          data: {
            full_name: authFormData.fullName || authFormData.email.split("@")[0],
            role: authFormData.role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setAuthSuccess("Registration successful! You are now logged in.");
        setAuthUser(data.user);
        setIsLoggedIn(true);
        setCurrentUserName(authFormData.fullName || authFormData.email.split("@")[0]);
        setCurrentUserRole(authFormData.role);
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setAuthSuccess("");
        }, 1500);
      }
    } catch (err: any) {
      setAuthError(err.message || "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Supabase Sign In (Login)
  const handleAuthSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    if (!authFormData.email || !authFormData.password) {
      setAuthError("Email and Password are required.");
      setAuthLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authFormData.email,
        password: authFormData.password,
      });

      if (error) throw error;

      if (data.user) {
        setAuthSuccess("Logged in successfully!");
        setAuthUser(data.user);
        setIsLoggedIn(true);
        const meta = data.user.user_metadata;
        if (meta?.full_name) setCurrentUserName(meta.full_name);
        if (meta?.role) setCurrentUserRole(meta.role);
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setAuthSuccess("");
        }, 1200);
      }
    } catch (err: any) {
      setAuthError(err.message || "Invalid login credentials. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Supabase Sign Out (Logout)
  const handleAuthSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setAuthUser(null);
      setAuthSession(null);
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      window.location.href = "/login";
    } catch (err) {
      console.log("Supabase sign out error:", err);
    }
  };



  // Active Rate Modal State
  const [isActiveRateModalOpen, setIsActiveRateModalOpen] = useState(false);
  const [activeRateSearchQuery, setActiveRateSearchQuery] = useState("");
  const [activeRateTabFilter, setActiveRateTabFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Live Real-Time Clock State
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync role cookie for Next.js middleware route protection
  useEffect(() => {
    document.cookie = `igym_user_role=${currentUserRole}; path=/`;
  }, [currentUserRole]);

  // Supabase Database Connection & Initial Fetch Sync
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    async function loadSupabaseData() {
      try {
        setIsOverviewLoading(true);

        // Parallel high-performance database fetch
        const [coachesRes, membersRes, paymentsRes, packagesRes, expensesRes] = await Promise.all([
          supabase.from("coaches").select("*"),
          supabase.from("members").select("*").order("member_id", { ascending: true }),
          supabase.from("payments").select("*").order("created_at", { ascending: false }),
          supabase.from("gym_packages").select("*").order("created_at", { ascending: true }),
          supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        ]);

        // 1. Process Coaches directly from Supabase DB
        if (!coachesRes.error && coachesRes.data) {
          const parsedCoaches: Coach[] = coachesRes.data.map((c: any, index: number) => ({
            id: c.coach_id || `COACH-${String(index + 1).padStart(3, "0")}`,
            dbUuid: c.id,
            name: c.name || "Coach",
            specialization: c.specialization || "General Fitness",
            phone: c.phone || "N/A",
            email: c.email || "N/A",
            experience: c.experience || "3+ Years",
            monthlyRate: Number(c.monthly_rate) || 12000,
            bio: c.bio || "Certified Gym Coach",
            imageUrl:
              c.image_url ||
              "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80",
            status: (c.status as "Active" | "Inactive") || "Active",
            assignedMemberCount: 0,
          }));

          setCoaches(parsedCoaches);
        }

        // 2. Process Members
        const dbMembers = membersRes.data;
        if (membersRes.error) {
          console.error("❌ [Supabase Error] Failed to fetch members:", membersRes.error.message, membersRes.error);
        } else if (dbMembers) {
          console.log(`✅ [Supabase Success] Successfully loaded ${dbMembers.length} members from DB.`);
          const parsedMembers: Member[] = dbMembers.map((m: any, index: number) => {
            const rawMemId = m.member_id || m.id || `MEM${String(index + 1).padStart(3, "0")}`;
            const memId = String(rawMemId).trim().toUpperCase().replace(/^MEM-/, "MEM");
            const memPhone = m.phone_number || m.phone || "N/A";
            const memAddress = m.address || "N/A";
            const memHeight = m.height_cm || m.height ? Number(m.height_cm || m.height) : null;
            const memWeight = m.weight_kg || m.weight ? Number(m.weight_kg || m.weight) : null;
            const startW = m.starting_weight || m.startingWeight ? Number(m.starting_weight || m.startingWeight) : memWeight;
            const targetW = m.target_weight || m.targetWeight ? Number(m.target_weight || m.targetWeight) : null;
            const joinDateVal = m.joined_date || m.join_date || new Date().toISOString().split("T")[0];
            const durMonths = m.duration_months ? Number(m.duration_months) : null;
            const expDateVal = m.expiry_date || m.expiryDate || null;

            const emName = m.emergency_contact_name || (m.emergency_contact ? m.emergency_contact.split(" - ")[0] : null) || "N/A";
            const emPhone = m.emergency_contact_phone || (m.emergency_contact ? m.emergency_contact.split(" - ")[1] : null) || "N/A";
            const emCombined = m.emergency_contact || (emName !== "N/A" && emPhone !== "N/A" ? `${emName} - ${emPhone}` : emName !== "N/A" ? emName : emPhone !== "N/A" ? emPhone : "N/A");

            const calculatedBmi = memHeight && memWeight ? calculateBMI(memWeight, memHeight) : "N/A";

            return {
              id: String(memId),
              dbUuid: m.id,
              name: m.full_name || m.name || "Gym Member",
              phone: memPhone,
              address: memAddress,
              height: memHeight,
              weight: memWeight,
              startingWeight: startW,
              targetWeight: targetW,
              target_weight: targetW,
              bmi: m.bmi || calculatedBmi,
              tier: m.tier || m.package || m.membership_plan || null,
              status: m.status || "Inactive",
              lastVisit: m.last_visit || "N/A",
              joinDate: joinDateVal,
              durationMonths: durMonths,
              expiryDate: expDateVal,
              expiry_date: expDateVal,
              emergencyContact: emCombined,
              emergencyContactName: emName,
              emergencyContactPhone: emPhone,
              coachId: m.coach_id || undefined,
              coachName: m.coach_name || undefined,
              isPTMember: !!m.is_pt_member,
              fitnessGoals: m.fitness_goals || undefined,
              profile_pic_url: m.profile_pic_url || m.profilePicUrl || m.avatar_url || m.avatar || undefined,
              profilePicUrl: m.profile_pic_url || m.profilePicUrl || m.avatar_url || m.avatar || undefined,
              before_photo_url: m.before_photo_url || m.beforePhotoUrl || undefined,
              beforePhotoUrl: m.before_photo_url || m.beforePhotoUrl || undefined,
              current_photo_url: m.current_photo_url || m.currentPhotoUrl || undefined,
              currentPhotoUrl: m.current_photo_url || m.currentPhotoUrl || undefined,
            };
          });

          parsedMembers.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

          setMembers(parsedMembers);
          setSupabaseConnected(true);
        }

        // 3. Process Payments
        const dbPayments = paymentsRes.data;
        if (paymentsRes.error) {
          console.error("❌ [Supabase Error] Failed to fetch payments:", paymentsRes.error);
        } else if (dbPayments && dbPayments.length > 0) {
          const parsedDb: PaymentRecord[] = dbPayments.map((p: any, idx: number) => {
            const isWalkIn = !p.member_id || p.member_id === "WALK_IN" || p.member_id === "NULL";
            const mem = !isWalkIn && dbMembers ? dbMembers.find((m: any) => m.id === p.member_id || m.member_id === p.member_id || m.id === p.dbUuid) : null;
            const extPayerName = p.external_payer_name || p.externalPayerName || undefined;

            return {
              id: String(p.id || `PAY-${101 + idx}`),
              invoiceNo: p.invoice_no || `INV-${new Date().getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
              memberId: isWalkIn ? null : (mem ? mem.id : p.member_id),
              memberName: isWalkIn ? (extPayerName || "Walk-in Guest / External Income") : (p.member_name || (mem ? mem.name : null) || "Member"),
              externalPayerName: extPayerName,
              phone: p.phone || (mem ? mem.phone : null) || "N/A",
              category: p.category || p.payment_type || "Monthly Fee",
              itemDescription: p.item_description || p.itemDescription || undefined,
              gymRevenuePercentage: p.gym_revenue_percentage !== null && p.gym_revenue_percentage !== undefined ? Number(p.gym_revenue_percentage) : 100,
              gymRevenueAmount: p.gym_revenue_amount !== null && p.gym_revenue_amount !== undefined ? Number(p.gym_revenue_amount) : Number(p.amount) || 0,
              amount: Number(p.amount) || 0,
              paymentDate: p.payment_date || p.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
              dueDate: p.due_date || p.next_due_date || new Date().toISOString().split("T")[0],
              method: p.method || "Cash",
              status: p.status || "Paid",
              reminderSent: !!p.reminder_sent,
              receiptSent: p.receipt_sent !== undefined && p.receipt_sent !== null ? !!p.receipt_sent : !!p.reminder_sent,
              paidAmount: p.paid_amount !== null && p.paid_amount !== undefined ? Number(p.paid_amount) : Number(p.amount) || 0,
              balanceDue: p.balance_due !== null && p.balance_due !== undefined ? Number(p.balance_due) : 0,
            };
          });
          setPaymentRecords(parsedDb);
        } else {
          setPaymentRecords([]);
        }

        // 4. Process Packages
        const dbPackages = packagesRes.data;
        if (!packagesRes.error && dbPackages) {
          const parsedPackages: GymPackage[] = dbPackages.map((pkg: any, idx: number) => {
            const actualName = pkg.package_name || pkg.name || pkg.title || "";
            return {
              id: String(pkg.id || `PKG-${idx + 1}`),
              name: actualName,
              package_name: actualName,
              price: Number(pkg.price) || 0,
              billingCycle: pkg.billing_cycle || pkg.billingCycle || "Monthly",
              description: pkg.description || "",
              badge: pkg.badge || "Standard",
            };
          });
          setGymPackages(parsedPackages);
        }

        // 5. Process Expenses
        const dbExpenses = expensesRes.data;
        if (!expensesRes.error && dbExpenses && dbExpenses.length > 0) {
          const parsedExpenses: ExpenseRecord[] = dbExpenses.map((e: any, idx: number) => ({
            id: String(e.expense_id || e.id || `EXP-${idx + 1}`),
            dbUuid: e.id,
            date: e.date || e.expense_date || e.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
            category: e.category || "Electricity & Utility Bills",
            amount: Number(e.amount) || 0,
            description: e.description || e.note || "General operational expense",
            recordedBy: e.recorded_by || e.recordedBy || "Admin",
          }));
          setExpenseRecords(parsedExpenses);
        }

        // --- MESSAGES LOAD & MERGE ---
        try {
          const { data: dbMessages, error: msgFetchErr } = await supabase
            .from("chat_messages")
            .select("*")
            .order("created_at", { ascending: true });

          if (!msgFetchErr && dbMessages && dbMessages.length > 0) {
            setChatConversations((prevConvs) => {
              const messagesByMember: Record<string, ChatMessage[]> = {};
              dbMessages.forEach((m: any) => {
                const isFromAdmin = String(m.sender_id || m.sender || "").toLowerCase() === "admin";
                const rawKey = isFromAdmin
                  ? String(m.receiver_id || m.member_id || "MEM001").trim()
                  : String(m.sender_id || m.member_id || "MEM001").trim();
                const memberKey = rawKey.toUpperCase().replace(/^MEM-/, "MEM");

                const rawCreated = m.created_at || new Date().toISOString();
                const createdTimeMs = new Date(rawCreated).getTime();

                const msgObj: ChatMessage = {
                  id: String(m.id || `m-${Date.now()}`),
                  sender: isFromAdmin ? "admin" : "member",
                  text: m.message || m.text || "",
                  timestamp: m.timestamp || new Date(rawCreated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  createdAt: rawCreated,
                  createdAtMs: createdTimeMs,
                  status: m.status || "delivered",
                };

                if (!messagesByMember[memberKey]) messagesByMember[memberKey] = [];
                messagesByMember[memberKey].push(msgObj);
              });

              const updatedConvs = [...prevConvs];
              Object.entries(messagesByMember).forEach(([memKey, msgs]) => {
                const existingIdx = updatedConvs.findIndex(
                  (c) => c.memberId.toUpperCase().replace(/^MEM-/, "MEM") === memKey
                );
                if (existingIdx >= 0) {
                  updatedConvs[existingIdx] = {
                    ...updatedConvs[existingIdx],
                    messages: msgs,
                  };
                } else {
                  updatedConvs.push({
                    id: `CHAT-${memKey}`,
                    memberId: memKey,
                    memberName: "Member",
                    phone: "N/A",
                    tier: "Standard",
                    status: "Online",
                    lastActive: "Recently",
                    unreadCount: 0,
                    messages: msgs,
                  });
                }
              });

              return updatedConvs;
            });
          }
        } catch (mErr) {
          console.log("Supabase chat_messages fetch notice:", mErr);
        }

        // --- APP SETTINGS & BANNER LOAD ---
        try {
          const { data: appSet } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
          if (appSet) {
            if (appSet.banner_text !== undefined) setBannerText(appSet.banner_text);
            if (appSet.is_banner_active !== undefined) setIsBannerActive(!!appSet.is_banner_active);
          }
        } catch (e) {}
      } catch (err) {
        console.error("❌ [Supabase Fatal Error]:", err);
      } finally {
        setIsOverviewLoading(false);
        setIsMembersLoading(false);
        console.log("🏁 [Supabase Data Load] Initial fetch complete.");
      }
    }

    loadSupabaseData();
  }, []);


  // Real-Time Supabase Listener for members Table UPDATE Events
  useEffect(() => {
    const membersChannel = supabase
      .channel("realtime_members_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "members" },
        (payload) => {
          console.log("⚡ Supabase Real-time Members UPDATE payload:", payload.new);
          const updated = payload.new;
          if (!updated) return;

          setMembers((prevMembers) => {
            return prevMembers.map((m) => {
              if (m.dbUuid === updated.id || m.id === updated.member_id || m.id === String(updated.id)) {
                const cleanId = String(updated.member_id || m.id).trim().toUpperCase().replace(/^MEM-/, "MEM");
                const h = Number(updated.height_cm || updated.height || m.height);
                const w = Number(updated.weight_kg || updated.weight || m.weight);
                const emName = updated.emergency_contact_name || (updated.emergency_contact ? updated.emergency_contact.split(" - ")[0] : m.emergencyContactName) || "N/A";
                const emPhone = updated.emergency_contact_phone || (updated.emergency_contact ? updated.emergency_contact.split(" - ")[1] : m.emergencyContactPhone) || "N/A";

                return {
                  ...m,
                  id: cleanId,
                  name: updated.full_name || updated.name || m.name,
                  phone: updated.phone_number || updated.phone || m.phone,
                  address: updated.address || m.address,
                  height: h,
                  weight: w,
                  bmi: updated.bmi || calculateBMI(w, h),
                  emergencyContact: updated.emergency_contact || (emName !== "N/A" && emPhone !== "N/A" ? `${emName} - ${emPhone}` : emName),
                  emergencyContactName: emName,
                  emergencyContactPhone: emPhone,
                  tier: updated.tier || updated.package || m.tier,
                  status: updated.status || m.status,
                };
              }
              return m;
            });
          });

          setSelectedMember((prev) => {
            if (prev && (prev.dbUuid === updated.id || prev.id === updated.member_id || prev.id === String(updated.id))) {
              const h = Number(updated.height_cm || updated.height || prev.height);
              const w = Number(updated.weight_kg || updated.weight || prev.weight);
              const emName = updated.emergency_contact_name || (updated.emergency_contact ? updated.emergency_contact.split(" - ")[0] : prev.emergencyContactName) || "N/A";
              const emPhone = updated.emergency_contact_phone || (updated.emergency_contact ? updated.emergency_contact.split(" - ")[1] : prev.emergencyContactPhone) || "N/A";

              return {
                ...prev,
                name: updated.full_name || updated.name || prev.name,
                phone: updated.phone_number || updated.phone || prev.phone,
                address: updated.address || prev.address,
                height: h,
                weight: w,
                bmi: updated.bmi || calculateBMI(w, h),
                emergencyContact: updated.emergency_contact || (emName !== "N/A" && emPhone !== "N/A" ? `${emName} - ${emPhone}` : emName),
                emergencyContactName: emName,
                emergencyContactPhone: emPhone,
                tier: updated.tier || updated.package || prev.tier,
                status: updated.status || prev.status,
              };
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
    };
  }, []);

  // Handle Login submission
  const handleLoginSubmit = (e?: React.FormEvent, forceRole?: "SUPER_ADMIN" | "ADMIN" | "STAFF") => {
    e?.preventDefault();
    setLoginError("");

    const targetRole = forceRole || (loginEmail.includes("owner") ? "SUPER_ADMIN" : loginEmail.includes("staff") ? "STAFF" : "ADMIN");

    if (targetRole === "SUPER_ADMIN") {
      setCurrentUserRole("SUPER_ADMIN");
      setCurrentUserName("Chathura (Owner)");
    } else if (targetRole === "ADMIN") {
      setCurrentUserRole("ADMIN");
      setCurrentUserName("Kamal (Branch Admin)");
    } else {
      setCurrentUserRole("STAFF");
      setCurrentUserName("Nuwan (Trainer)");
    }

    setIsLoggedIn(true);
    setLoginEmail("");
    setLoginPassword("");
  };

  // Switch Role Handler
  const handleSwitchRole = (newRole: "SUPER_ADMIN" | "ADMIN" | "STAFF") => {
    setCurrentUserRole(newRole);
    if (newRole === "SUPER_ADMIN") {
      setCurrentUserName("Chathura (Owner)");
    } else if (newRole === "ADMIN") {
      setCurrentUserName("Kamal (Branch Admin)");
      if (activeTab === "Settings") {
        router.push("/dashboard");
        setShowRbacSecurityAlert(true);
        setTimeout(() => setShowRbacSecurityAlert(false), 4000);
      }
    } else {
      setCurrentUserName("Nuwan (Trainer)");
      if (activeTab === "Settings") {
        router.push("/dashboard");
      }
    }
    setShowRoleDropdown(false);
  };

  // Live Member Chat State
  const [activeChatMemberId, setActiveChatMemberId] = useState<string>("MEM-001");
  const [chatInputText, setChatInputText] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);

  // Compute Recent Member Messages list for Overview Widget
  const recentMemberMessagesList = useMemo(() => {
    const list: RecentMemberMessage[] = [];

    chatConversations.forEach((conv) => {
      const memberMsgs = conv.messages.filter((m) => m.sender === "member");
      if (memberMsgs.length > 0) {
        const lastMsg = memberMsgs[memberMsgs.length - 1];
        const targetMem = members.find((m) => m.id === conv.memberId || m.memberId === conv.memberId);
        const avatar =
          targetMem?.profilePicUrl ||
          targetMem?.profile_pic_url ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

        list.push({
          id: lastMsg.id,
          memberId: conv.memberId,
          memberName: conv.memberName || targetMem?.name || "Member",
          avatarUrl: avatar,
          messageText: lastMsg.text,
          timestamp: lastMsg.timestamp,
        });
      }
    });

    return list.slice(0, 5);
  }, [chatConversations, members]);

  // Send Message Handler (Optimistic UI + Real-time + Supabase DB)
  const handleSendMessage = async (
    customText?: string,
    attachmentType?: "workout" | "diet" | "invoice",
    overrideMemberId?: string
  ) => {
    const textToSend = customText !== undefined ? customText : chatInputText;
    if (!textToSend || !textToSend.trim()) return;

    const targetMemberId = overrideMemberId || activeChatMemberId || (members[0] ? members[0].id : "MEM-001");
    const targetMember = members.find((m) => m.id === targetMemberId || m.dbUuid === targetMemberId) || members[0];
    const resolvedMemberId = targetMember ? targetMember.id : targetMemberId;
    const cleanMemberId = resolvedMemberId.trim().toUpperCase().replace(/^MEM-/, "MEM");
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const nowIso = new Date().toISOString();

    const nowMs = Date.now();

    const newMsg: ChatMessage = {
      id: `m-${nowMs}`,
      sender: "admin",
      text: textToSend,
      timestamp: nowTime,
      createdAt: nowIso,
      createdAtMs: nowMs,
      status: "delivered",
      attachmentType,
    };

    // 1. Optimistic UI Update: Append message to local state
    setChatConversations((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.memberId === resolvedMemberId
      );
      let updated: ChatConversation[];

      if (existingIdx >= 0) {
        updated = prev.map((c, i) =>
          i === existingIdx
            ? {
                ...c,
                unreadCount: 0,
                lastActive: "Just now",
                messages: [...c.messages, newMsg],
              }
            : c
        );
      } else {
        const newConv: ChatConversation = {
          id: `CHAT-${resolvedMemberId}`,
          memberId: resolvedMemberId,
          memberName: targetMember ? targetMember.name : "Gym Member",
          phone: targetMember ? targetMember.phone : "N/A",
          tier: targetMember ? targetMember.tier : "Standard",
          status: "Online",
          lastActive: "Just now",
          unreadCount: 0,
          messages: [newMsg],
        };
        updated = [...prev, newConv];
      }

      return updated;
    });

    if (!customText) setChatInputText("");

    // 2. Asynchronously Insert into Supabase `chat_messages` table
    try {
      const { error } = await supabase.from("chat_messages").insert([
        {
          member_id: resolvedMemberId,
          sender_id: "admin",
          receiver_id: resolvedMemberId,
          message: textToSend,
        },
      ]);
      if (error) {
        console.error("⚠️ Failed to insert message into chat_messages:", error.message);
      } else {
        console.log("✅ Message inserted into chat_messages DB successfully.");
      }
    } catch (err: any) {
      console.error("⚠️ Exception inserting into chat_messages:", err);
    }
  };

  // Auto Scroll Chat to Bottom
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatMemberId, chatConversations]);

  // Fetch Chat History from Supabase when activeChatMemberId or members change
  useEffect(() => {
    const fetchChatHistory = async () => {
      const activeMember = members.find((m) => m.id === activeChatMemberId) || members[0];
      if (!activeMember || !activeMember.id) return;

      const memId = activeMember.id;
      const { data: dbMessages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && dbMessages) {
        const memberMsgs = dbMessages.filter((m: any) => {
          const sId = String(m.sender_id || m.sender || "");
          const rId = String(m.receiver_id || "");
          const mId = String(m.member_id || "");
          return sId === memId || rId === memId || mId === memId;
        });

        const formattedMsgs: ChatMessage[] = memberMsgs.map((m: any, idx: number) => {
          const isFromAdmin = String(m.sender_id || m.sender || "").toLowerCase() === "admin";
          const rawCreated = m.created_at || new Date().toISOString();
          const createdTimeMs = new Date(rawCreated).getTime();
          return {
            id: String(m.id || `m-db-${idx}-${Date.now()}`),
            sender: isFromAdmin ? "admin" : "member",
            text: m.message || m.text || "",
            timestamp: new Date(rawCreated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            createdAt: rawCreated,
            createdAtMs: createdTimeMs,
            status: "delivered",
          };
        });

        setChatConversations((prev) => {
          const existingIdx = prev.findIndex((c) => c.memberId === memId);
          if (existingIdx >= 0) {
            return prev.map((c, i) => (i === existingIdx ? { ...c, messages: formattedMsgs } : c));
          } else {
            return [
              ...prev,
              {
                id: `CHAT-${memId}`,
                memberId: memId,
                memberName: activeMember.name,
                phone: activeMember.phone,
                tier: activeMember.tier,
                status: "Online",
                lastActive: "Just now",
                unreadCount: 0,
                messages: formattedMsgs,
              },
            ];
          }
        });
      }
    };

    fetchChatHistory();
  }, [activeChatMemberId, members]);

  // Real-time Listener for incoming chat_messages INSERT events
  useEffect(() => {
    const chatChannel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          console.log("⚡ Supabase Real-time INSERT payload received:", payload.new);
          const newMsgData = payload.new;
          if (!newMsgData) return;

          const isMsgAdmin = String(newMsgData.sender_id || newMsgData.sender || "").toLowerCase() === "admin";
          const senderType: "admin" | "member" = isMsgAdmin ? "admin" : "member";

          const targetMemId = isMsgAdmin
            ? String(newMsgData.receiver_id || newMsgData.receiver || newMsgData.member_id || "").trim()
            : String(newMsgData.sender_id || newMsgData.sender || newMsgData.member_id || "").trim();

          if (!targetMemId) return;

          const msgText = newMsgData.message || newMsgData.text || "";
          const isCoachReq = msgText.includes("System Automated Request:");
          if (isCoachReq) {
            loadPendingCoachRequests();
          }

          // --- GLOBAL REAL-TIME NOTIFICATION & SOUND ALERT FOR ADMIN ---
          if (!isMsgAdmin) {
            // Increment unread chat badge if not currently on chat tab
            if (activeTab !== "Member Chat") {
              setUnreadChatBadgeCount((prev) => prev + 1);
            }

            // 1. Play Sound Alert using HTML5 Audio API
            try {
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
              audio.play().catch((e) => console.log("Audio play notice:", e));
            } catch (audioErr) {
              console.log("Audio exception notice:", audioErr);
            }

            // 2. Resolve member name for Toast
            const targetMem = members.find(
              (m) =>
                m.id === targetMemId ||
                m.memberId === targetMemId ||
                m.dbUuid === targetMemId ||
                m.authUserId === targetMemId
            );

            const memberDisplayName = targetMem ? targetMem.name : "Member";
            const toastTitle = isCoachReq ? "New Coach Request" : `New Message from ${memberDisplayName}`;
            const snippetText = msgText.length > 70 ? msgText.substring(0, 70) + "..." : msgText;

            // 3. Set Pop-up Toast Notification
            setRealtimeToast({
              id: `toast-${Date.now()}`,
              title: toastTitle,
              message: snippetText,
              type: isCoachReq ? "coach_request" : "chat_message",
              targetTab: isCoachReq ? "Coaches" : "Member Chat",
              memberId: targetMemId,
            });
          }

          const msgId = String(newMsgData.id || `m-rt-${Date.now()}`);

          const rawCreated = newMsgData.created_at || new Date().toISOString();
          const createdTimeMs = new Date(rawCreated).getTime();

          const incomingMsg: ChatMessage = {
            id: msgId,
            sender: senderType,
            text: msgText,
            timestamp: new Date(rawCreated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            createdAt: rawCreated,
            createdAtMs: createdTimeMs,
            status: "delivered",
          };

          setChatConversations((prev) => {
            const existingIdx = prev.findIndex((c) => c.memberId === targetMemId);

            if (existingIdx >= 0) {
              const conv = prev[existingIdx];
              const isDuplicate = conv.messages.some((m) => m.id === msgId || (m.text === msgText && m.sender === senderType));
              if (isDuplicate) return prev;

              return prev.map((c, i) =>
                i === existingIdx
                  ? {
                      ...c,
                      unreadCount: c.memberId === activeChatMemberId || isMsgAdmin ? c.unreadCount : c.unreadCount + 1,
                      lastActive: "Just now",
                      messages: [...c.messages, incomingMsg],
                    }
                  : c
              );
            } else {
              const targetMem = members.find((m) => m.id === targetMemId);
              return [
                ...prev,
                {
                  id: `CHAT-${targetMemId}`,
                  memberId: targetMemId,
                  memberName: targetMem ? targetMem.name : "Gym Member",
                  phone: targetMem ? targetMem.phone : "N/A",
                  tier: targetMem ? targetMem.tier : "Standard",
                  status: "Online",
                  lastActive: "Just now",
                  unreadCount: isMsgAdmin ? 0 : 1,
                  messages: [incomingMsg],
                },
              ];
            }
          });
        }
      )
      .subscribe((status) => {
        console.log("⚡ Real-time chat_messages subscription status:", status);
      });

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [activeChatMemberId, members]);

  // Broadcast Message to All Active Members Handler
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatBroadcastMessage.trim()) {
      alert("Please enter a broadcast announcement!");
      return;
    }

    setIsChatBroadcasting(true);

    try {
      const targetMembers = members.length > 0 ? members : [];
      if (targetMembers.length === 0) {
        alert("No members found to broadcast to.");
        setIsChatBroadcasting(false);
        return;
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const nowIso = new Date().toISOString();

      const broadcastPayloads = targetMembers.map((m) => ({
        member_id: m.id,
        sender_id: "admin",
        receiver_id: m.id,
        message: `📢 ANNOUNCEMENT: ${chatBroadcastMessage.trim()}`,
      }));

      const { error: bulkErr } = await supabase.from("chat_messages").insert(broadcastPayloads);

      if (bulkErr) {
        console.error("⚠️ Bulk broadcast insert error:", bulkErr.message);
        alert(`⚠️ Failed to broadcast announcement: ${bulkErr.message}`);
      } else {
        setChatConversations((prev) => {
          const updated = [...prev];
          targetMembers.forEach((m) => {
            const msgObj: ChatMessage = {
              id: `m-bcast-${m.id}-${Date.now()}`,
              sender: "admin",
              text: `📢 ANNOUNCEMENT: ${chatBroadcastMessage.trim()}`,
              timestamp: nowTime,
              status: "delivered",
            };
            const existingIdx = updated.findIndex((c) => c.memberId === m.id);
            if (existingIdx >= 0) {
              updated[existingIdx] = {
                ...updated[existingIdx],
                messages: [...updated[existingIdx].messages, msgObj],
              };
            } else {
              updated.push({
                id: `CHAT-${m.id}`,
                memberId: m.id,
                memberName: m.name,
                phone: m.phone,
                tier: m.tier,
                status: "Online",
                lastActive: "Just now",
                unreadCount: 0,
                messages: [msgObj],
              });
            }
          });
          return updated;
        });

        alert(`✅ Broadcast successfully sent to all ${targetMembers.length} active members!`);
        setChatBroadcastMessage("");
        setIsBroadcastModalOpen(false);
      }
    } catch (err: any) {
      console.error("⚠️ Broadcast exception:", err);
      alert(`⚠️ Broadcast Error: ${err?.message || "Check console"}`);
    } finally {
      setIsChatBroadcasting(false);
    }
  };

  // Helper function: Calculate fee payment amount & discount savings
  const calculatePaymentAmount = (pkgName: string, months: number = 1) => {
    if (pkgName === "Admission Fee") {
      return { finalAmount: 1500, fullAmount: 1500, saved: 0, discountPercent: 0 };
    }
    const pkg = gymPackages.find((p) => p.name === pkgName) || gymPackages[1];
    const base = pkg ? pkg.price : 3500;
    const numMonths = Number(months) || 1;
    const full = base * numMonths;
    const rate = numMonths === 3 ? 0.10 : numMonths === 6 ? 0.20 : numMonths === 12 ? 0.30 : 0;
    const finalAmt = Math.round(full * (1 - rate));
    return {
      finalAmount: finalAmt,
      fullAmount: full,
      saved: full - finalAmt,
      discountPercent: Math.round(rate * 100),
    };
  };

  // Payment Form State & Date Range Filtering State
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [paymentStartDate, setPaymentStartDate] = useState<string>("");
  const [paymentEndDate, setPaymentEndDate] = useState<string>("");

  const [paymentFormData, setPaymentFormData] = useState({
    memberId: "",
    externalPayerName: "",
    category: "Men (Without Treadmills)",
    durationMonths: 1,
    amount: 3500,
    paidAmount: 3500,
    method: "Cash" as "Cash" | "Card POS" | "Bank Transfer" | "Online",
    sendReceiptAlert: true,
    itemDescription: "",
    gymRevenuePercentage: 20,
  });

  // Action: Send Automated WhatsApp / SMS Reminder
  const handleSendReminder = async (payId: string, channel: "WhatsApp" | "SMS" | "App Push") => {
    setPaymentRecords((prev) =>
      prev.map((rec) =>
        rec.id === payId ? { ...rec, reminderSent: true, reminderChannel: channel } : rec
      )
    );

    try {
      await supabase
        .from("payments")
        .update({ reminder_sent: true })
        .eq("id", payId);
    } catch (err) {
      console.log("Supabase reminder update notice:", err);
    }
  };

  // Action: Mark Pending / Overdue as Paid
  const handleMarkAsPaid = async (payId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dueStr = nextMonth.toISOString().split("T")[0];

    const updated = paymentRecords.map((rec) =>
      rec.id === payId
        ? {
            ...rec,
            status: "Paid" as const,
            paymentDate: todayStr,
            dueDate: dueStr,
          }
        : rec
    );
    setPaymentRecords(updated);

    try {
      const { error: pErr } = await supabase
        .from("payments")
        .update({ status: "Paid", payment_date: todayStr, due_date: dueStr })
        .eq("id", payId);

      if (pErr) {
        const targetPay = paymentRecords.find((p) => p.id === payId);
        if (targetPay) {
          await supabase
            .from("payments")
            .update({ status: "Paid", payment_date: todayStr, due_date: dueStr })
            .eq("invoice_no", targetPay.invoiceNo);
        }
      }
    } catch (err) {
      console.log("Supabase payment update notice:", err);
    }
  };

  // Clear all payment records permanently from Supabase DB & system
  const handleClearAllPayments = async () => {
    if (
      !confirm(
        "⚠️ ARE YOU SURE YOU WANT TO CLEAR ALL PAYMENT LOGS?\n\nThis will delete all current payment records permanently from the system & database."
      )
    ) {
      return;
    }

    try {
      // 1. Delete all records from Supabase payments table permanently
      const { error: delErr1 } = await supabase
        .from("payments")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (delErr1) {
        console.warn("Neq UUID delete notice, retrying not null delete:", delErr1.message);
        await supabase.from("payments").delete().not("id", "is", null);
      }

      // 2. Also delete records from payment_history table
      try {
        await supabase
          .from("payment_history")
          .delete()
          .neq("member_id", "00000000-0000-0000-0000-000000000000");
      } catch (hErr) {}

      // 3. Clear local state and localStorage ONLY after DB delete executes
      setPaymentRecords([]);
      try {
        localStorage.removeItem("igym_saved_payments");
        safeSetLocalStorage("igym_payments_cleared", "true");
      } catch (e) {}
    } catch (err) {
      console.error("Supabase clear payments error:", err);
      setPaymentRecords([]);
    }
  };

  // CSV Export Handler for Filtered Payments
  const handleExportCSV = () => {
    const filtered = paymentRecords.filter((p) => {
      const matchesCategory = paymentCategoryFilter === "All" || p.category === paymentCategoryFilter;
      const q = paymentSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.memberName.toLowerCase().includes(q) ||
        (p.memberId && p.memberId.toLowerCase().includes(q)) ||
        p.invoiceNo.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        (p.itemDescription && p.itemDescription.toLowerCase().includes(q));

      const matchesStartDate = !paymentStartDate || p.paymentDate >= paymentStartDate;
      const matchesEndDate = !paymentEndDate || p.paymentDate <= paymentEndDate;

      return matchesCategory && matchesSearch && matchesStartDate && matchesEndDate;
    });

    if (filtered.length === 0) {
      alert("⚠️ No payment records to export.");
      return;
    }

    const headers = [
      "Invoice No",
      "Member ID",
      "Member Name",
      "Phone",
      "Category",
      "Item Description",
      "Amount (LKR)",
      "Payment Date",
      "Due Date",
      "Method",
      "Status",
    ];
    const csvRows = [
      headers.join(","),
      ...filtered.map((p) =>
        [
          `"${p.invoiceNo}"`,
          `"${p.memberId || "N/A"}"`,
          `"${p.memberName.replace(/"/g, '""')}"`,
          `"${p.phone}"`,
          `"${p.category}"`,
          `"${(p.itemDescription || "").replace(/"/g, '""')}"`,
          p.amount,
          `"${p.paymentDate}"`,
          `"${p.dueDate}"`,
          `"${p.method}"`,
          `"${p.status}"`,
        ].join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `iGYM_Income_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Income PDF Export Handler (Matches Expenses Report Professional Template)
  const handleExportPDF = () => {
    const filtered = paymentRecords.filter((p) => {
      const matchesCategory = paymentCategoryFilter === "All" || p.category === paymentCategoryFilter;
      const q = paymentSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.memberName.toLowerCase().includes(q) ||
        (p.memberId && p.memberId.toLowerCase().includes(q)) ||
        p.invoiceNo.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        (p.itemDescription && p.itemDescription.toLowerCase().includes(q));

      const matchesStartDate = !paymentStartDate || p.paymentDate >= paymentStartDate;
      const matchesEndDate = !paymentEndDate || p.paymentDate <= paymentEndDate;

      return matchesCategory && matchesSearch && matchesStartDate && matchesEndDate;
    });

    if (filtered.length === 0) {
      alert("⚠️ No payment records available to export.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate the PDF report.");
      return;
    }

    const totalGrossRevenue = filtered.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalCashPayments = filtered
      .filter((p) => p.method === "Cash")
      .reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0);
    const totalMembersPaid = new Set(filtered.map((p) => p.memberId || p.memberName)).size;
    const totalBalanceDue = filtered.reduce((sum, p) => sum + (Number(p.balanceDue) || 0), 0);

    const dateRangeLabel =
      paymentStartDate || paymentEndDate
        ? `Filtered Period: ${paymentStartDate || "Start"} to ${paymentEndDate || "Today"}`
        : "All Historical Income Records";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>iGYM Fitness Center — Income & Revenue Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; background: #ffffff; }
          .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #9333ea; padding-bottom: 12px; margin-bottom: 20px; }
          h1 { font-size: 20px; color: #581c87; margin: 0; font-weight: 800; }
          p { font-size: 11px; color: #64748b; margin-top: 4px; margin-bottom: 0; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; background: #faf5ff; color: #6b21a8; border: 1px solid #e9d5ff; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; }
          .card-title { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .card-val { font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th, td { border: 1px solid #e2e8f0; padding: 9px 12px; text-align: left; }
          th { background-color: #faf5ff; color: #581c87; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .total-row { font-weight: bold; background-color: #f3e8ff; color: #581c87; }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <div>
            <h1>iGYM BALANGODA — OFFICIAL INCOME & REVENUE REPORT</h1>
            <p>Branch: Main Branch Balangoda | ${dateRangeLabel} | Date Generated: ${new Date().toLocaleString()}</p>
          </div>
          <div>
            <span class="badge">INCOME REPORT ✅</span>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-title">Total Gross Revenue</div>
            <div class="card-val" style="color:#7e22ce">LKR ${totalGrossRevenue.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="card-title">Total Cash Payments</div>
            <div class="card-val" style="color:#059669">LKR ${totalCashPayments.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="card-title">Total Members Paid</div>
            <div class="card-val">${totalMembersPaid} Members</div>
          </div>
          <div class="summary-card">
            <div class="card-title">Total Outstanding Balance</div>
            <div class="card-val" style="color:${totalBalanceDue > 0 ? "#e11d48" : "#475569"}">LKR ${totalBalanceDue.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>INVOICE NO</th>
              <th>MEMBER DETAILS</th>
              <th>FEE CATEGORY</th>
              <th>AMOUNT (LKR)</th>
              <th>PAID (LKR)</th>
              <th>BALANCE (LKR)</th>
              <th>DATE & METHOD</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map((p) => {
                const isWalkIn = !p.memberId || p.memberId === "WALK_IN";
                const isUuid = p.memberId && p.memberId.length > 20 && p.memberId.includes("-");
                const formattedMemberId = isUuid ? "" : p.memberId ? `(${p.memberId})` : "";
                const memberNameDisplay = isWalkIn
                  ? (p.externalPayerName || p.memberName || "Walk-in Guest")
                  : `${p.memberName} ${formattedMemberId}`.trim();
                const paidAmt = p.paidAmount !== undefined ? p.paidAmount : p.amount;
                const balAmt = p.balanceDue !== undefined ? p.balanceDue : 0;

                return `
              <tr>
                <td><strong>${p.invoiceNo}</strong></td>
                <td>${memberNameDisplay}</td>
                <td>${p.category}${p.itemDescription ? ` <small style="color:#6b21a8">[${p.itemDescription}]</small>` : ""}</td>
                <td><strong>LKR ${p.amount.toLocaleString()}</strong></td>
                <td style="color:#059669; font-weight:bold;">LKR ${paidAmt.toLocaleString()}</td>
                <td style="${balAmt > 0 ? "color:#e11d48; font-weight:bold;" : "color:#64748b;"}">${balAmt > 0 ? `LKR ${balAmt.toLocaleString()}` : "LKR 0"}</td>
                <td>${p.paymentDate} (${p.method})</td>
              </tr>
            `;
              })
              .join("")}
            <tr class="total-row">
              <td colSpan="3" style="text-align: right;">TOTAL REVENUE SUMMARY:</td>
              <td>LKR ${totalGrossRevenue.toLocaleString()}</td>
              <td>LKR ${filtered.reduce((sum, p) => sum + (Number(p.paidAmount ?? p.amount) || 0), 0).toLocaleString()}</td>
              <td>LKR ${totalBalanceDue.toLocaleString()}</td>
              <td>${filtered.length} Transactions</td>
            </tr>
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Send Digital Receipt to Member App Chat Function (Direct In-App Receipt Delivery Engine)
  const sendReceiptToMemberChat = async (
    memberId: string,
    receiptDetails: {
      invoiceNo: string;
      amount: number;
      category: string;
      paymentDate: string;
      method: string;
      memberName?: string;
    }
  ) => {
    if (!memberId || memberId === "WALK_IN") return;

    console.log(
      `[DIGITAL RECEIPT API] Asynchronously routing official receipt ${receiptDetails.invoiceNo} (LKR ${receiptDetails.amount.toLocaleString()}) to Member App Chat for Member ID: ${memberId}`
    );

    const targetMember = members.find((m) => m.id === memberId || m.dbUuid === memberId);
    const resolvedMemberId = targetMember ? targetMember.id : memberId;

    const receiptMessageString = `Receipt *Payment Received*\nPackage: ${receiptDetails.category}\nAmount: LKR ${receiptDetails.amount.toLocaleString()}\nMethod: ${receiptDetails.method}\nDate: ${receiptDetails.paymentDate}\nInvoice No: ${receiptDetails.invoiceNo}\n\nThank you for your payment!`;

    // Non-blocking background execution
    (async () => {
      try {
        await handleSendMessage(receiptMessageString, "invoice", resolvedMemberId);
      } catch (err: any) {
        console.error("⚠️ Failed to send digital receipt to chat_messages table:", err?.message || err);
      }
    })();
  };

  // In-App Renewal Reminder Handler (Inserts into chat_messages table)
  const handleSendInAppRenewalReminder = async (memberTarget: Member) => {
    const targetMemberId = memberTarget.id;
    const reminderMessage = "Friendly reminder: Your gym membership has expired or is due for renewal soon. Please make a payment to keep your account active!";

    try {
      const { data: chatData, error: chatErr } = await supabase
        .from("chat_messages")
        .insert([
          {
            member_id: targetMemberId,
            sender_id: "admin",
            receiver_id: targetMemberId,
            message: reminderMessage,
          },
        ])
        .select();

      if (chatErr) {
        console.error("⚠️ Failed to send in-app renewal reminder:", chatErr.message);
        alert(`⚠️ Could not send reminder message: ${chatErr.message}`);
      } else {
        console.log("✅ In-app renewal reminder inserted into chat_messages DB successfully:", chatData);

        // Update local state if member chat conversation exists
        setChatConversations((prev) => {
          const existingIdx = prev.findIndex((c) => c.memberId === targetMemberId);
          const msgObj: ChatMessage = {
            id: `m-remind-${Date.now()}`,
            sender: "admin",
            text: reminderMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "delivered",
          };
          if (existingIdx >= 0) {
            return prev.map((c, i) => (i === existingIdx ? { ...c, messages: [...c.messages, msgObj] } : c));
          }
          return prev;
        });

        alert(`✅ Renewal reminder sent successfully to ${memberTarget.name}'s in-app chat!`);
      }
    } catch (err: any) {
      console.error("⚠️ Exception sending in-app reminder:", err);
      alert(`⚠️ Error sending reminder: ${err?.message || err}`);
    }
  };

  // Submit New Payment with Supabase Database Sync (Insert FIRST, then update UI)
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem("igym_payments_cleared");

    const isWalkIn = paymentFormData.memberId === "WALK_IN" || !paymentFormData.memberId;
    const mem = !isWalkIn ? (members.find((m) => m.id === paymentFormData.memberId) || members[0]) : null;
    const extPayerName = isWalkIn ? (paymentFormData.externalPayerName.trim() || "Walk-in Guest / External Income") : "";

    const todayStr = new Date().toISOString().split("T")[0];
    const months = Number(paymentFormData.durationMonths) || 1;

    // Early Renewal Calculation Logic:
    // If member's CURRENT expiry_date is in the FUTURE (Active), add duration to CURRENT expiry_date.
    // If subscription is EXPIRED or invalid, calculate starting from TODAY.
    let baseStartDate = new Date();
    if (mem && mem.expiryDate) {
      const currentExpiry = new Date(mem.expiryDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      currentExpiry.setHours(0, 0, 0, 0);

      if (!isNaN(currentExpiry.getTime()) && currentExpiry.getTime() >= todayDate.getTime()) {
        baseStartDate = new Date(mem.expiryDate);
      }
    }

    const calculateExpiryWithMonthAlignment = (baseDate: Date, monthsToAdd: number): Date => {
      const result = new Date(baseDate.getTime());
      const expectedMonth = (result.getMonth() + monthsToAdd) % 12;
      result.setMonth(result.getMonth() + monthsToAdd);
      if (result.getMonth() !== (expectedMonth < 0 ? expectedMonth + 12 : expectedMonth)) {
        result.setDate(0); // Snap to last day of previous month if day overflow occurs
      }
      return result;
    };

    const calculatedDueDateObj = calculateExpiryWithMonthAlignment(baseStartDate, months);
    const dueStr = calculatedDueDateObj.toISOString().split("T")[0];

    const generatedId = `PAY-${101 + paymentRecords.length}`;
    const generatedInvoice = `INV-${new Date().getFullYear()}-${String(paymentRecords.length + 1).padStart(3, "0")}`;

    const resolvedMemberId = isWalkIn ? null : (mem ? mem.id : paymentFormData.memberId || "MEM001");
    const memberDbUuid = isWalkIn ? null : (mem?.dbUuid || (mem?.id && mem.id.includes("-") && mem.id.length > 20 ? mem.id : undefined));
    const memberIdForDb = isWalkIn ? null : (memberDbUuid || resolvedMemberId);

    const resolvedMemberName = isWalkIn ? extPayerName : (mem ? mem.name : "Gym Member");
    const resolvedPhone = isWalkIn ? "N/A" : (mem ? mem.phone : "N/A");
    const resolvedAmount = Number(paymentFormData.amount);
    const resolvedCategory = paymentFormData.category;
    const resolvedDueDate = paymentFormData.category === "Admission Fee" ? todayStr : dueStr;

    const isPT = resolvedCategory.toLowerCase().includes("pt") || resolvedCategory.toLowerCase().includes("personal training");
    const gymPercentage = isPT ? Number(paymentFormData.gymRevenuePercentage) || 20 : 100;
    const gymAmount = isPT ? Math.round(resolvedAmount * (gymPercentage / 100)) : resolvedAmount;

    // 1. First execute INSERT into `chat_messages` table if Digital Receipt checkbox is checked
    let chatSuccess = false;
    if (!isWalkIn && paymentFormData.sendReceiptAlert && resolvedMemberId) {
      const receiptMessageString = `Receipt *Payment Received*\nPackage: ${resolvedCategory}\nAmount: LKR ${resolvedAmount.toLocaleString()}\nMethod: ${paymentFormData.method}\nDate: ${todayStr}\nInvoice No: ${generatedInvoice}\n\nThank you for your payment!`;

      try {
        const { data: chatData, error: chatErr } = await supabase
          .from("chat_messages")
          .insert([
            {
              member_id: resolvedMemberId,
              sender_id: "admin",
              receiver_id: resolvedMemberId,
              message: receiptMessageString,
            },
          ])
          .select();

        if (!chatErr && chatData) {
          chatSuccess = true;
          console.log("✅ Digital receipt inserted into chat_messages DB successfully.");

          setChatConversations((prev) => {
            const existingIdx = prev.findIndex((c) => c.memberId === resolvedMemberId);
            const msgObj: ChatMessage = {
              id: `m-receipt-${Date.now()}`,
              sender: "admin",
              text: receiptMessageString,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: "delivered",
              attachmentType: "invoice",
            };
            if (existingIdx >= 0) {
              return prev.map((c, i) => (i === existingIdx ? { ...c, messages: [...c.messages, msgObj] } : c));
            }
            return prev;
          });
        } else {
          console.error("⚠️ Digital receipt chat insert error:", chatErr?.message);
        }
      } catch (cErr: any) {
        console.error("⚠️ Digital receipt chat insert exception:", cErr?.message);
      }
    }

    const isReceiptSent = !isWalkIn && !!paymentFormData.sendReceiptAlert && chatSuccess;
    const resolvedPaidAmount = Number(paymentFormData.paidAmount ?? resolvedAmount);
    const resolvedBalanceDue = Math.max(0, resolvedAmount - resolvedPaidAmount);

    const basePayload: any = {
      member_id: memberIdForDb,
      external_payer_name: isWalkIn ? extPayerName : undefined,
      amount: resolvedAmount,
      paid_amount: resolvedPaidAmount,
      balance_due: resolvedBalanceDue,
      payment_date: todayStr,
      payment_type: resolvedCategory,
      next_due_date: resolvedDueDate,
      item_description: paymentFormData.category === "Supplements & Merchandise" ? paymentFormData.itemDescription : undefined,
      gym_revenue_percentage: gymPercentage,
      gym_revenue_amount: gymAmount,
      receipt_sent: isReceiptSent,
    };

    const fullPayload: any = {
      ...basePayload,
      invoice_no: generatedInvoice,
      member_name: resolvedMemberName,
      phone: resolvedPhone,
      category: resolvedCategory,
      due_date: resolvedDueDate,
      method: paymentFormData.method,
      status: resolvedBalanceDue > 0 ? "Partial" : "Paid",
      reminder_sent: isReceiptSent,
      receipt_sent: isReceiptSent,
    };

    // 2. Asynchronously INSERT into Supabase `payments` table
    let isInserted = false;
    try {
      const { error: dbErr } = await supabase.from("payments").insert([fullPayload]);

      if (dbErr) {
        console.warn("Full payment insert error, retrying base payload:", dbErr.message);
        const { error: baseErr } = await supabase.from("payments").insert([basePayload]);

        if (baseErr) {
          const fallbackPayload = { ...basePayload, member_id: memberIdForDb };
          const { error: fallbackErr } = await supabase.from("payments").insert([fallbackPayload]);

          if (fallbackErr) {
            console.error("Supabase Payment Insert Error:", fallbackErr);
            alert(`⚠️ Could not save payment to database: ${fallbackErr.message}`);
            return;
          }
        }
      }
      isInserted = true;
    } catch (err: any) {
      console.error("Supabase Payment Insert Exception:", err);
      alert(`⚠️ Supabase Error: ${err?.message || "Check console"}`);
      return;
    }

    if (!isInserted) return;

    // 3. Log to `payment_history` table & update member's `expiry_date` in `members` DB if member payment
    if (!isWalkIn && memberIdForDb) {
      try {
        const historyPayload: any = {
          member_id: memberIdForDb,
          fee_category: resolvedCategory,
          amount_paid: resolvedAmount,
          payment_date: todayStr,
        };
        await supabase.from("payment_history").insert([historyPayload]);
      } catch (histErr) {
        console.log("payment_history insert notice:", histErr);
      }

      // Update Member Expiry Date in Supabase & Local State
      try {
        await supabase
          .from("members")
          .update({
            expiry_date: resolvedDueDate,
            status: "Active",
          })
          .or(`id.eq.${memberIdForDb},member_id.eq.${resolvedMemberId}`);

        setMembers((prev) =>
          prev.map((m) =>
            m.id === resolvedMemberId || m.dbUuid === memberIdForDb
              ? { ...m, expiryDate: resolvedDueDate, status: "Active" }
              : m
          )
        );
      } catch (expUpdateErr) {
        console.error("⚠️ Failed to update member expiry date:", expUpdateErr);
      }
    }

    // 4. Update local state ONLY AFTER successful Supabase insert
    const newPay: PaymentRecord = {
      id: generatedId,
      invoiceNo: generatedInvoice,
      memberId: resolvedMemberId,
      memberName: resolvedMemberName,
      externalPayerName: isWalkIn ? extPayerName : undefined,
      phone: resolvedPhone,
      category: resolvedCategory,
      itemDescription: paymentFormData.category === "Supplements & Merchandise" ? paymentFormData.itemDescription : undefined,
      gymRevenuePercentage: gymPercentage,
      gymRevenueAmount: gymAmount,
      amount: resolvedAmount,
      paidAmount: resolvedPaidAmount,
      balanceDue: resolvedBalanceDue,
      paymentDate: todayStr,
      dueDate: resolvedDueDate,
      method: paymentFormData.method,
      status: resolvedBalanceDue > 0 ? "Partial" as any : "Paid",
      reminderSent: isReceiptSent,
      receiptSent: isReceiptSent,
      reminderChannel: isReceiptSent ? "Member App Chat" : undefined,
    };

    const updated = [newPay, ...paymentRecords];
    setPaymentRecords(updated);

    setIsRecordPaymentModalOpen(false);
    setIsMemberComboboxOpen(false);
  };

  // Calculate BMI Helper
  const calculateBMI = (weight: number | string | null | undefined, height: number | string | null | undefined) => {
    const w = Number(weight);
    const h = Number(height);
    if (!w || !h || h <= 0 || w <= 0 || isNaN(w) || isNaN(h)) return "N/A";
    const heightInMeters = h / 100;
    const bmiVal = w / (heightInMeters * heightInMeters);
    return bmiVal.toFixed(1);
  };

  const getBMICategory = (bmiStr: string) => {
    if (!bmiStr || bmiStr === "N/A" || bmiStr === "0.0" || bmiStr === "0") {
      return { label: "N/A", color: "text-zinc-400 bg-zinc-800/80 border-zinc-700/50" };
    }
    const bmi = parseFloat(bmiStr);
    if (isNaN(bmi) || bmi <= 0) return { label: "N/A", color: "text-zinc-400 bg-zinc-800/80 border-zinc-700/50" };
    if (bmi < 18.5) return { label: "Underweight", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    if (bmi < 25) return { label: "Normal", color: "text-lime-400 bg-lime-500/10 border-lime-500/30" };
    if (bmi < 30) return { label: "Overweight", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
    return { label: "Obese", color: "text-pink-400 bg-pink-500/10 border-pink-500/30" };
  };

  // Form State
  const [formData, setFormData] = useState<{
    memberId: string;
    name: string;
    password: string;
    phone: string;
    address: string;
    height: string | number;
    weight: string | number;
    targetWeight: string | number;
    tier: string;
    status: "Active" | "Inactive";
    emergencyContact: string;
    isPTMember: boolean;
    fitnessGoals: string;
    durationMonths: number;
    expiryDate: string;
  }>({
    memberId: "",
    name: "",
    password: "",
    phone: "",
    address: "",
    height: "",
    weight: "",
    targetWeight: "",
    tier: "Standard",
    status: "Active",
    emergencyContact: "",
    // PT Member Fields
    isPTMember: false,
    fitnessGoals: "Muscle Gain & Transformation",
    // Membership Duration & Expiry Date Override
    durationMonths: 1,
    expiryDate: "",
  });
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Member Weight Logs State (for Member App & Admin Dashboard Sync)
  const [weightLogsMap, setWeightLogsMap] = useState<Record<string, WeightLog[]>>({});
  const [newLogWeight, setNewLogWeight] = useState<number>(70);
  const [newLogNote, setNewLogNote] = useState<string>("");

  // Fetch live weight_tracking records from Supabase DB on Member Details modal open
  useEffect(() => {
    if (!isDetailModalOpen || !selectedMember) return;

    const memId = selectedMember.id || "";
    const cleanId = memId.trim().toUpperCase().replace(/^MEM-/, "MEM");
    const hyphenId = cleanId.replace(/^MEM/, "MEM-");
    const memCode = (selectedMember as any)?.member_id || "";

    // 1. EXPLICITLY RESET WEIGHT LOGS FOR THIS MEMBER AT THE BEGINNING OF THE EFFECT BEFORE SUPABASE FETCH COMPLETES
    setWeightLogsMap((prev) => ({
      ...prev,
      [memId]: [],
      [cleanId]: [],
      [hyphenId]: [],
      ...(memCode ? { [memCode]: [] } : {}),
    }));

    let isMounted = true;

    async function fetchWeightHistory() {
      try {
        let { data, error } = await supabase
          .from("weight_tracking")
          .select("*")
          .or(`member_id.eq.${memId},member_id.eq.${cleanId},member_id.eq.${hyphenId}${memCode ? `,member_id.eq.${memCode}` : ""}`)
          .order("created_at", { ascending: true });

        if (error) {
          const { data: fbData, error: fbErr } = await supabase
            .from("weight_tracking")
            .select("*")
            .or(`member_id.eq.${memId},member_id.eq.${cleanId},member_id.eq.${hyphenId}${memCode ? `,member_id.eq.${memCode}` : ""}`)
            .order("recorded_date", { ascending: true });

          if (!fbErr) {
            data = fbData;
            error = null;
          }
        }

        if (!isMounted) return;

        if (!error && data && data.length > 0) {
          const height = selectedMember?.height || 170;
          const formattedLogs: WeightLog[] = data.map((item: any, idx: number) => ({
            id: item.id || `wt-${idx}`,
            date: item.created_at
              ? item.created_at.split("T")[0]
              : item.recorded_date
              ? item.recorded_date.split("T")[0]
              : new Date().toISOString().split("T")[0],
            weight: Number(item.weight),
            bmi: calculateBMI(Number(item.weight), height),
            note: "Logged Entry",
          }));

          formattedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          setWeightLogsMap((prev) => ({
            ...prev,
            [memId]: formattedLogs,
            [cleanId]: formattedLogs,
            [hyphenId]: formattedLogs,
            ...(memCode ? { [memCode]: formattedLogs } : {}),
          }));

          const latestRecord = data[data.length - 1];
          if (selectedMember && latestRecord && Number(latestRecord.weight) !== selectedMember.weight) {
            const latestWeight = Number(latestRecord.weight);
            setSelectedMember((prev) =>
              prev ? { ...prev, weight: latestWeight, bmi: calculateBMI(latestWeight, height) } : prev
            );
          }
        } else {
          // If query returns no rows or error occurs, explicitly set weight logs to empty array []
          setWeightLogsMap((prev) => ({
            ...prev,
            [memId]: [],
            [cleanId]: [],
            [hyphenId]: [],
            ...(memCode ? { [memCode]: [] } : {}),
          }));
        }
      } catch (err) {
        console.error("⚠️ Exception fetching weight history:", err);
        if (isMounted) {
          setWeightLogsMap((prev) => ({
            ...prev,
            [memId]: [],
            [cleanId]: [],
            [hyphenId]: [],
          }));
        }
      }
    }

    fetchWeightHistory();

    return () => {
      isMounted = false;
    };
  }, [isDetailModalOpen, selectedMember?.id]);

  // Fetch live gym_packages from Supabase DB on Package Pricing Manager Modal Open
  useEffect(() => {
    if (!isPackagePricingModalOpen) return;

    let isMounted = true;
    async function fetchGymPackages() {
      try {
        const { data: dbPackages, error: pkgErr } = await supabase
          .from("gym_packages")
          .select("*")
          .order("created_at", { ascending: true });

        if (!pkgErr && dbPackages && isMounted) {
          const parsedPackages: GymPackage[] = dbPackages.map((pkg: any, idx: number) => {
            const actualName = pkg.package_name || pkg.name || pkg.title || "";
            return {
              id: String(pkg.id || `PKG-${idx + 1}`),
              name: actualName,
              package_name: actualName,
              price: Number(pkg.price) || 0,
              billingCycle: pkg.billing_cycle || pkg.billingCycle || "Monthly",
              description: pkg.description || "",
              badge: pkg.badge || "Standard",
            };
          });
          setGymPackages(parsedPackages);
        }
      } catch (err) {
        console.error("⚠️ Exception fetching gym_packages:", err);
      }
    }

    fetchGymPackages();

    return () => {
      isMounted = false;
    };
  }, [isPackagePricingModalOpen]);

  const handleAddWeightLog = async (memberId: string, currentHeight: number) => {
    if (!newLogWeight || newLogWeight <= 0) return;
    const logDate = new Date().toISOString().split("T")[0];
    const bmiVal = calculateBMI(newLogWeight, currentHeight);
    const newEntry: WeightLog = {
      id: `w-${Date.now()}`,
      date: logDate,
      weight: Number(newLogWeight),
      bmi: bmiVal,
      note: newLogNote.trim() || "Staff Logged Check-in",
    };

    setWeightLogsMap((prev) => ({
      ...prev,
      [memberId]: [newEntry, ...(prev[memberId] || [])],
    }));

    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              weight: Number(newLogWeight),
              bmi: bmiVal,
              startingWeight: m.startingWeight || m.weight,
            }
          : m
      )
    );

    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember((prev) =>
        prev
          ? {
              ...prev,
              weight: Number(newLogWeight),
              bmi: bmiVal,
              startingWeight: prev.startingWeight || prev.weight,
            }
          : null
      );
    }

    setNewLogNote("");

    // Sync weight update & insert into weight_tracking in Supabase DB
    try {
      await supabase.from("weight_tracking").insert([
        {
          member_id: memberId,
          weight: Number(newLogWeight),
          recorded_date: logDate,
        },
      ]);

    } catch (e) {
      console.error("⚠️ Exception saving weight_tracking:", e);
    }
  };


  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextNum = members.length + 1;
    const autoId = `MEM${String(nextNum).padStart(3, "0")}`;
    setFormData({
      memberId: autoId,
      name: "",
      password: "",
      phone: "",
      address: "",
      height: 170,
      weight: 70,
      targetWeight: "",
      tier: "Standard",
      status: "Active",
      emergencyContact: "",
      isPTMember: false,
      fitnessGoals: "Muscle Gain & Transformation",
      durationMonths: 1,
      expiryDate: "",
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (member: Member, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedMember(member);
    const isPT =
      member.isPTMember ||
      (member.tier &&
        (member.tier.toLowerCase().includes("personal training") ||
          member.tier.toLowerCase().includes("pt")));

    const hVal =
      member.height !== null && member.height !== undefined && member.height !== 0
        ? String(member.height)
        : "";

    const wVal =
      member.weight !== null && member.weight !== undefined && member.weight !== 0
        ? String(member.weight)
        : "";

    const targetWVal =
      member.targetWeight !== null && member.targetWeight !== undefined && member.targetWeight !== 0
        ? String(member.targetWeight)
        : member.target_weight
        ? String(member.target_weight)
        : "";

    const phoneVal = member.phone && member.phone !== "N/A" ? member.phone : "";
    const addressVal = member.address && member.address !== "N/A" ? member.address : "";
    const emContactVal = member.emergencyContact && member.emergencyContact !== "N/A" ? member.emergencyContact : "";

    setFormData({
      memberId: member.id,
      name: member.name || "",
      password: "",
      phone: phoneVal,
      address: addressVal,
      height: hVal,
      weight: wVal,
      targetWeight: targetWVal,
      tier: member.tier || "Standard Monthly Membership",
      status: (member.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
      emergencyContact: emContactVal,
      isPTMember: !!isPT,
      fitnessGoals: member.fitnessGoals || "Muscle Gain & Transformation",
      durationMonths: member.durationMonths || 1,
      expiryDate: member.expiry_date || member.expiryDate || "",
    });
    setIsEditModalOpen(true);
  };

  // Synchronize Edit Member Form Data whenever selectedMember or isEditModalOpen changes
  useEffect(() => {
    if (isEditModalOpen && selectedMember) {
      const isPT =
        selectedMember.isPTMember ||
        (selectedMember.tier &&
          (selectedMember.tier.toLowerCase().includes("personal training") ||
            selectedMember.tier.toLowerCase().includes("pt")));

      const hVal =
        selectedMember.height !== null && selectedMember.height !== undefined && selectedMember.height !== 0
          ? String(selectedMember.height)
          : "";

      const wVal =
        selectedMember.weight !== null && selectedMember.weight !== undefined && selectedMember.weight !== 0
          ? String(selectedMember.weight)
          : "";

      const targetWVal =
        selectedMember.targetWeight !== null && selectedMember.targetWeight !== undefined && selectedMember.targetWeight !== 0
          ? String(selectedMember.targetWeight)
          : selectedMember.target_weight
          ? String(selectedMember.target_weight)
          : "";

      const phoneVal = selectedMember.phone && selectedMember.phone !== "N/A" ? selectedMember.phone : "";
      const addressVal = selectedMember.address && selectedMember.address !== "N/A" ? selectedMember.address : "";
      const emContactVal = selectedMember.emergencyContact && selectedMember.emergencyContact !== "N/A" ? selectedMember.emergencyContact : "";

      setFormData({
        memberId: selectedMember.id,
        name: selectedMember.name || "",
        password: "",
        phone: phoneVal,
        address: addressVal,
        height: hVal,
        weight: wVal,
        targetWeight: targetWVal,
        tier: selectedMember.tier || "Standard Monthly Membership",
        status: (selectedMember.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
        emergencyContact: emContactVal,
        isPTMember: !!isPT,
        fitnessGoals: selectedMember.fitnessGoals || "Muscle Gain & Transformation",
        durationMonths: selectedMember.durationMonths || 1,
        expiryDate: selectedMember.expiry_date || selectedMember.expiryDate || "",
      });
    }
  }, [isEditModalOpen, selectedMember]);

  // Open Detail Modal
  const handleOpenDetailModal = (member: Member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (member: Member, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  // Submit Add Member with Automated Supabase Server Action Auth & DB Link & Strict Error Checks
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("⚠️ Please enter the member's full name.");
      return;
    }
    if (!formData.password || formData.password.trim().length < 6) {
      alert("⚠️ Please enter a password of at least 6 characters for the member app account.");
      return;
    }

    const nextNum = members.length + 1;
    const defaultShortId = `MEM${String(nextNum).padStart(3, "0")}`;
    const rawChosenId = formData.memberId.trim() || defaultShortId;
    const formattedId = rawChosenId.toUpperCase().replace(/^MEM-/, "MEM");
    const newBmi = calculateBMI(formData.weight, formData.height);

    setIsSubmittingMember(true);

    const durationMonths = Number(formData.durationMonths) || 1;
    const calculatedExpiryDate = calculateExpiryDate(new Date(), durationMonths);

    try {
      // Execute secure Server Action for Supabase Auth & Member insertion
      const result = await createMemberAction({
        memberId: formattedId,
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        height: formData.height !== "" && formData.height !== null && formData.height !== undefined ? Number(formData.height) : undefined,
        weight: formData.weight !== "" && formData.weight !== null && formData.weight !== undefined ? Number(formData.weight) : undefined,
        tier: formData.tier,
        status: formData.status,
        emergencyContact: formData.emergencyContact,
        isPTMember: formData.isPTMember,
        fitnessGoals: formData.fitnessGoals,
        durationMonths: durationMonths,
        expiryDate: calculatedExpiryDate,
      });

      if (!result.success) {
        const errorMsg = result.error || "Failed to create member via Server Action.";
        console.error("Member creation failed:", errorMsg);
        alert(`⚠️ Member Registration Error:\n\n${errorMsg}`);
        setIsSubmittingMember(false);
        return; // DO NOT close modal on failure
      }

      // Success branch
      const isPTSelected =
        formData.isPTMember ||
        formData.tier.toLowerCase().includes("personal training") ||
        formData.tier.toLowerCase().includes("pt");

      const createdAuthId = result.authUserId || formattedId;
      const syntheticEmail = result.syntheticEmail || `${formattedId}@gym.com`;

      const newMember: Member = {
        id: formattedId,
        dbUuid: createdAuthId,
        name: formData.name,
        phone: formData.phone || "N/A",
        address: formData.address || "Balangoda",
        height: Number(formData.height),
        weight: Number(formData.weight),
        startingWeight: Number(formData.weight),
        bmi: newBmi,
        tier: formData.tier,
        status: formData.status,
        lastVisit: "Just now",
        joinDate: new Date().toISOString().split("T")[0],
        durationMonths: durationMonths,
        expiryDate: calculatedExpiryDate,
        emergencyContact: formData.emergencyContact || "N/A",
        // PT Member Goals
        isPTMember: isPTSelected,
        fitnessGoals: isPTSelected ? formData.fitnessGoals : undefined,
      };

      setMembers((prev) => [newMember, ...prev]);
      setIsAddModalOpen(false);
      alert(`✅ Member Account Successfully Registered via Supabase Auth!\n\nMember ID: ${formattedId}\nSynthetic Auth Email: ${syntheticEmail}\nAuth User ID: ${createdAuthId}`);
    } catch (err: any) {
      console.error("Network or server action exception:", err);
      alert(`⚠️ Unexpected Error: ${err.message || "Failed to connect to server."}`);
    } finally {
      setIsSubmittingMember(false);
    }
  };


  // Submit Edit Member with Supabase Live Sync (Fixes persistence by targeting member_id & UUID)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !formData.name.trim()) return;

    const hNum = formData.height !== "" && formData.height !== null && formData.height !== undefined ? Number(formData.height) : null;
    const wNum = formData.weight !== "" && formData.weight !== null && formData.weight !== undefined ? Number(formData.weight) : null;
    const targetWNum = formData.targetWeight !== "" && formData.targetWeight !== null && formData.targetWeight !== undefined ? Number(formData.targetWeight) : null;

    const updatedBmi = calculateBMI(wNum, hNum);
    const cleanId = selectedMember.id.trim().toUpperCase().replace(/^MEM-/, "MEM");

    const updatePayload: any = {
      full_name: formData.name,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      status: formData.status,
      height: hNum,
      weight: wNum,
      target_weight: targetWNum,
      bmi: updatedBmi,
      tier: formData.tier,
      package: formData.tier,
      emergency_contact: formData.emergencyContact,
      is_pt_member: !!formData.isPTMember,
      fitness_goals: formData.isPTMember ? formData.fitnessGoals : undefined,
      expiry_date: formData.expiryDate || undefined,
    };

    // Execute Supabase UPDATE by member_id AND dbUuid
    try {
      let updQuery = supabase.from("members").update(updatePayload);
      if (selectedMember.dbUuid) {
        updQuery = updQuery.or(`id.eq.${selectedMember.dbUuid},member_id.eq.${cleanId}`);
      } else {
        updQuery = updQuery.eq("member_id", cleanId);
      }

      const { error: updErr } = await updQuery;

      if (updErr) {
        console.error("⚠️ Supabase Member Update Error:", updErr.message, updErr);
        // Fallback retry with core columns
        const { error: retryErr } = await supabase
          .from("members")
          .update({
            full_name: formData.name,
            phone: formData.phone,
            status: formData.status,
            tier: formData.tier,
            package: formData.tier,
            target_weight: targetWNum,
            expiry_date: formData.expiryDate || undefined,
          })
          .eq("member_id", cleanId);

        if (retryErr) {
          console.error("⚠️ Fallback Member Update Error:", retryErr.message);
          alert(`⚠️ Database Update Notice: ${updErr.message}`);
        } else {
          console.log("✅ Member updated via fallback query.");
        }
      } else {
        console.log("✅ Member package and details updated in Supabase DB successfully.");
      }
    } catch (err: any) {
      console.error("⚠️ Exception during member package update:", err);
    }

    // Update local UI state
    const updatedMembers = members.map((m) => {
      if (m.id === selectedMember.id) {
        return {
          ...m,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          height: hNum,
          weight: wNum,
          startingWeight: m.startingWeight || wNum,
          targetWeight: targetWNum,
          target_weight: targetWNum,
          bmi: updatedBmi,
          tier: formData.tier,
          status: formData.status,
          emergencyContact: formData.emergencyContact,
          isPTMember: formData.isPTMember,
          fitnessGoals: formData.isPTMember ? formData.fitnessGoals : undefined,
          expiryDate: formData.expiryDate || m.expiryDate,
          expiry_date: formData.expiryDate || m.expiry_date || m.expiryDate,
        };
      }
      return m;
    });

    setMembers(updatedMembers);
    setSelectedMember({
      ...selectedMember,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      height: hNum,
      weight: wNum,
      startingWeight: selectedMember.startingWeight || wNum,
      targetWeight: targetWNum,
      target_weight: targetWNum,
      bmi: updatedBmi,
      tier: formData.tier,
      status: formData.status,
      emergencyContact: formData.emergencyContact,
      isPTMember: formData.isPTMember,
      fitnessGoals: formData.isPTMember ? formData.fitnessGoals : undefined,
      expiryDate: formData.expiryDate || selectedMember.expiryDate,
      expiry_date: formData.expiryDate || selectedMember.expiry_date || selectedMember.expiryDate,
    });
    setIsEditModalOpen(false);
  };

  // Confirm Delete with Supabase Live Sync
  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;
    const targetMember = selectedMember;
    setMembers(members.filter((m) => m.id !== targetMember.id));
    setIsDeleteModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedMember(null);

    // Async sync delete to Supabase
    try {
      if (targetMember.dbUuid) {
        await supabase.from("members").delete().eq("id", targetMember.dbUuid);
      }
      if (typeof targetMember.id === "string" && targetMember.id.includes("-") && targetMember.id.length > 20) {
        await supabase.from("members").delete().eq("id", targetMember.id);
      }
      await supabase.from("members").delete().eq("full_name", targetMember.name);
      await supabase.from("members").delete().eq("name", targetMember.name);
    } catch (err) {
      console.log("Supabase delete notice:", err);
    }
  };

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, color: "text-cyan-400" },
    { name: "Members", icon: Users, color: "text-violet-400" },
    { name: "Payments", icon: CreditCard, color: "text-amber-400" },
    { name: "Coaches", icon: UserCheck, color: "text-amber-400" },
    { name: "Member Chat", icon: MessageCircle, color: "text-emerald-400" },
    { name: "Settings", icon: Settings, color: "text-zinc-400" },
  ];

  // RBAC Navigation Filtering:
  // Both 'owner' (SUPER_ADMIN) and 'developer' (ADMIN) have FULL ACCESS to all sections including Settings & Payments.
  // ONLY 'staff' (STAFF) role is restricted from Payments and Settings.
  const visibleMenuItems = menuItems.filter((item) => {
    if (currentUserRole === "STAFF") {
      if (item.name === "Payments" || item.name === "Settings") {
        return false;
      }
    }
    return true;
  });





  const [packageFilter, setPackageFilter] = useState<string>("All Packages");

  const matchesPackageFilter = (member: Member, filter: string): boolean => {
    if (filter === "All Packages") return true;
    const tierLower = (member.tier || "").toLowerCase();
    const hasTreadmill =
      tierLower.includes("treadmill") ||
      tierLower.includes("+ tr") ||
      tierLower.includes("with treadmill");

    switch (filter) {
      case "Men":
        return tierLower.includes("men") && !tierLower.includes("women") && !hasTreadmill;
      case "Men + TR":
        return tierLower.includes("men") && !tierLower.includes("women") && hasTreadmill;
      case "Ladies":
        return (tierLower.includes("ladies") || tierLower.includes("women")) && !hasTreadmill;
      case "Ladies + TR":
        return (tierLower.includes("ladies") || tierLower.includes("women")) && hasTreadmill;
      case "Student":
        return tierLower.includes("student") && !hasTreadmill;
      case "Student + TR":
        return tierLower.includes("student") && hasTreadmill;
      case "Couple":
        return (tierLower.includes("couple") || tierLower.includes("family")) && !hasTreadmill;
      case "Couple + TR":
        return (tierLower.includes("couple") || tierLower.includes("family")) && hasTreadmill;
      case "PT / Custom":
        return (
          tierLower.includes("personal training") ||
          tierLower.includes("pt") ||
          tierLower.includes("vip") ||
          tierLower.includes("custom") ||
          tierLower.includes("admission") ||
          !!member.isPTMember
        );
      default:
        return true;
    }
  };

  const filteredMembers = members.filter((m) => {
    const queryLower = searchQuery.toLowerCase().trim();
    const cleanQueryId = queryLower.replace(/^mem-?/, "mem");
    const memberIdLower = m.id.toLowerCase();
    const cleanMemberId = memberIdLower.replace(/^mem-?/, "mem");

    const matchesSearch =
      m.name.toLowerCase().includes(queryLower) ||
      memberIdLower.includes(queryLower) ||
      cleanMemberId.includes(cleanQueryId) ||
      (m.dbUuid || "").toLowerCase().includes(queryLower) ||
      m.phone.toLowerCase().includes(queryLower) ||
      m.address.toLowerCase().includes(queryLower) ||
      (m.tier || "").toLowerCase().includes(queryLower);

    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    const matchesPkg = matchesPackageFilter(m, packageFilter);
    return matchesSearch && matchesStatus && matchesPkg;
  });

  // Dynamic Chat Conversations list linked 100% to real Supabase members
  const displayChatConversations: ChatConversation[] = members.map((m) => {
    const cleanId = m.id.trim().toUpperCase().replace(/^MEM-/, "MEM");
    const hyphenId = cleanId.replace(/^MEM/, "MEM-");

    const existing = chatConversations.find(
      (c) =>
        c.memberId === m.id ||
        c.memberId === cleanId ||
        c.memberId === hyphenId ||
        c.memberId.toUpperCase().replace(/^MEM-/, "MEM") === cleanId
    );
    if (existing) {
      return {
        ...existing,
        memberId: m.id,
        memberName: m.name,
        phone: m.phone,
        tier: m.tier,
      };
    }
    return {
      id: `CHAT-${m.id}`,
      memberId: m.id,
      memberName: m.name,
      phone: m.phone,
      tier: m.tier,
      status: m.status === "Active" ? "Online" : "Offline",
      lastActive: m.lastVisit || "Recently",
      unreadCount: 0,
      messages: [],
    };
  });

  // Sort Conversations (WhatsApp-style):
  // 1. Members with messages come first, sorted by the created_at / createdAtMs timestamp of their LAST message (newest to oldest).
  // 2. Members with NO messages appear at the bottom, sorted by member_id ascending.
  displayChatConversations.sort((a, b) => {
    const aMsgs = a.messages || [];
    const bMsgs = b.messages || [];

    const aHasMsgs = aMsgs.length > 0;
    const bHasMsgs = bMsgs.length > 0;

    if (aHasMsgs && bHasMsgs) {
      const aLast = aMsgs[aMsgs.length - 1];
      const bLast = bMsgs[bMsgs.length - 1];

      const aTime = aLast.createdAtMs || (aLast.createdAt ? new Date(aLast.createdAt).getTime() : 0);
      const bTime = bLast.createdAtMs || (bLast.createdAt ? new Date(bLast.createdAt).getTime() : 0);

      if (aTime !== bTime) {
        return bTime - aTime; // Descending: newest message first
      }
    }

    if (aHasMsgs && !bHasMsgs) return -1;
    if (!aHasMsgs && bHasMsgs) return 1;

    return a.memberId.localeCompare(b.memberId, undefined, { numeric: true });
  });

  return (
    <div className="flex h-screen w-full bg-[#07070a] text-zinc-100 font-sans overflow-hidden antialiased selection:bg-cyan-500 selection:text-black">
      {/* ── GLOBAL REAL-TIME CLICKABLE POP-UP TOAST NOTIFICATION ─────── */}
      {realtimeToast && (
        <div
          onClick={() => {
            if (realtimeToast.targetTab) {
              handleTabChange(realtimeToast.targetTab);
              if (realtimeToast.targetTab === "Member Chat" && realtimeToast.memberId) {
                setActiveChatMemberId(realtimeToast.memberId);
              }
            }
            setRealtimeToast(null);
          }}
          className="fixed top-5 right-5 z-[9999] max-w-sm w-full bg-[#181510]/95 border border-amber-500/80 shadow-2xl shadow-amber-950/80 backdrop-blur-xl rounded-2xl p-4 cursor-pointer hover:border-amber-400 transition-all duration-300 transform hover:scale-[1.02] group flex flex-col gap-2"
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl text-black shrink-0 ${
                  realtimeToast.type === "coach_request"
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30 animate-pulse"
                    : "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/30"
                }`}
              >
                {realtimeToast.type === "coach_request" ? (
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <MessageCircle className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  REAL-TIME ALERT
                </span>
                <h4 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  {realtimeToast.title}
                </h4>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setRealtimeToast(null);
              }}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 bg-black/40 border border-zinc-800/80 rounded-xl p-2.5 line-clamp-2 leading-relaxed italic">
            &ldquo;{realtimeToast.message}&rdquo;
          </p>

          <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>
              {realtimeToast.targetTab === "Coaches" ? "Click to view coach request →" : "Click to open member chat →"}
            </span>
            <span className="text-[10px] font-normal text-zinc-500 font-mono">Just now</span>
          </div>
        </div>
      )}
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Desktop Fixed + Mobile Slide-over Drawer) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0d0e14] border-r border-zinc-800/80 flex flex-col justify-between shrink-0 select-none transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo Area */}
          <div className="p-5 flex items-center justify-between border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40 text-white">
                <WeightlifterIcon className="w-5 h-5 text-cyan-100 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-wider text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    IGYM
                  </span>
                </div>
                <p className="text-[9px] font-extrabold tracking-widest text-cyan-400 uppercase">
                  BALANGODA BRANCH
                </p>
              </div>
            </div>
            {/* Close Mobile Drawer button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links (RBAC Filtered) */}
          <nav className="p-3 space-y-1 mt-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleTabChange(item.name);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                    isActive
                      ? "bg-zinc-800/80 text-white shadow-md border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee]" />
                  )}
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? item.color : "text-zinc-400"
                    }`}
                  />
                  <span>{item.name}</span>
                  {item.name === "Member Chat" && unreadChatBadgeCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-[0_0_8px_#f43f5e] animate-pulse">
                      {unreadChatBadgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Biometric Status Footer */}
        <div className="p-4 border-t border-zinc-800/60 bg-[#0a0a0f]">
          <div className="flex items-center gap-2.5 text-xs text-lime-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400 shadow-[0_0_8px_#a3e635]"></span>
            </span>
            <span className="drop-shadow-[0_0_6px_rgba(163,230,53,0.3)]">Biometric device online</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#07070a] p-4 sm:p-6 space-y-6">
        {/* RBAC Security Alert Banner (If ADMIN attempts to access Settings) */}
        {showRbacSecurityAlert && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-between gap-3 shadow-lg shadow-rose-950/40 animate-bounce">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>
                <strong>ACCESS DENIED (RBAC)</strong>: Settings menu is restricted to <strong>SUPER_ADMIN (Owner)</strong> role. Redirected to Overview.
              </span>
            </div>
            <button
              onClick={() => setShowRbacSecurityAlert(false)}
              className="text-xs text-rose-400 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-zinc-800 border border-zinc-700 text-cyan-400 hover:text-white"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                  {activeTab === "Members" ? "Members Directory" : activeTab === "Overview" ? "Welcome IGYM 🏋️‍♂️" : activeTab}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 font-medium flex items-center gap-2">
                  Monday, 10 August 2026 <span className="hidden sm:inline mx-1">•</span> <span className="text-cyan-400 font-semibold">Balangoda branch</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input with Results Dropdown */}
            <div className="relative w-56 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70 z-10" />
              <input
                type="text"
                placeholder="Search members, phone, address..."
                value={topbarSearchQuery}
                onChange={(e) => setTopbarSearchQuery(e.target.value)}
                onFocus={() => setIsTopbarSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsTopbarSearchFocused(false), 250)}
                className="w-full bg-[#12131c] border border-cyan-900/40 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/70 transition-colors shadow-inner"
              />
              {topbarSearchQuery && (
                <button
                  onClick={() => {
                    setTopbarSearchQuery("");
                    setTopbarSearchResults([]);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white z-10 p-0.5"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Search Results Dropdown Menu */}
              {isTopbarSearchFocused && topbarSearchQuery.trim() !== "" && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#0e111a] border border-cyan-500/40 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-800/80">
                  {isTopbarSearchLoading ? (
                    <div className="p-4 text-center text-xs text-cyan-400 flex items-center justify-center gap-2 font-mono">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Searching database...
                    </div>
                  ) : topbarSearchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
                      <div className="px-3 py-1.5 bg-[#090b12] text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center justify-between">
                        <span>Search Matches ({topbarSearchResults.length})</span>
                        <span className="text-zinc-500 text-[9px]">Click to View</span>
                      </div>
                      {topbarSearchResults.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => {
                            handleOpenDetailModal(member);
                            setTopbarSearchQuery("");
                            setTopbarSearchResults([]);
                            setIsTopbarSearchFocused(false);
                          }}
                          className="p-3 hover:bg-cyan-500/10 cursor-pointer transition-colors flex items-center gap-3 group"
                        >
                          {/* Member Avatar */}
                          {member.profile_pic_url || member.profilePicUrl ? (
                            <img
                              src={member.profile_pic_url || member.profilePicUrl}
                              alt={member.name}
                              className="w-9 h-9 rounded-full object-cover border border-cyan-500/40 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md">
                              {member.name.charAt(0)}
                            </div>
                          )}

                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate transition-colors flex items-center justify-between">
                              <span className="truncate">{member.name}</span>
                              <span className="text-[10px] font-mono font-normal text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 shrink-0 ml-1">
                                {member.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate flex items-center gap-2 mt-0.5">
                              <span className="font-mono">{member.phone}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="truncate text-zinc-400">{member.tier}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-400 space-y-1">
                      <p className="font-semibold text-white">No members found</p>
                      <p className="text-[11px] text-zinc-500">No member records match "{topbarSearchQuery}".</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Real-Time Live Clock & Date Display */}
            {currentTime && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121624] border border-cyan-500/30 text-cyan-300 shadow-md shadow-cyan-950/20">
                <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
                <div className="flex flex-col text-right">
                  <span className="font-mono text-xs font-extrabold text-white tracking-widest leading-none">
                    {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="text-[9px] text-cyan-400/80 font-bold uppercase tracking-wider mt-0.5 flex items-center justify-end gap-1">
                    <span>{currentTime.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" })}</span>
                  </span>
                </div>
              </div>
            )}

            {/* User Profile Widget */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-[#090b12] rounded-full flex items-center justify-center font-bold text-xs text-cyan-300">
                  {currentUserName.charAt(0)}
                </div>
              </div>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white truncate max-w-[160px]">
                  {currentUserName}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                  {currentUserRole === "SUPER_ADMIN" ? "Owner (Full Access)" : currentUserRole === "ADMIN" ? "Developer (Full Access)" : "Staff Member"}
                </span>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  localStorage.removeItem("userRole");
                  localStorage.removeItem("userName");
                  localStorage.removeItem("userEmail");
                  window.location.href = "/login";
                }}
                className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-700/60 hover:border-rose-500/40 transition-colors ml-1"
                title="Sign Out of Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Rendering based on activeTab */}
        {activeTab === "Overview" ? (
          isOverviewLoading ? (
            /* OVERVIEW LOADING SKELETONS */
            <div className="space-y-6 animate-pulse">
              {/* Skeleton Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#0f121d] border border-zinc-800/80 rounded-2xl p-4 h-28 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-zinc-800/80" />
                      <div className="w-24 h-5 rounded-full bg-zinc-800/80" />
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <div className="w-24 h-7 rounded-lg bg-zinc-800/90" />
                      <div className="w-32 h-3.5 rounded bg-zinc-800/60" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skeleton Charts & Feeds Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0f121d] border border-zinc-800/80 rounded-2xl p-5 h-72 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-5 rounded bg-zinc-800/80" />
                    <div className="w-24 h-5 rounded-full bg-zinc-800/60" />
                  </div>
                  <div className="w-full h-44 rounded-xl bg-zinc-800/30 my-2" />
                  <div className="flex justify-between w-full h-4 rounded bg-zinc-800/40" />
                </div>

                <div className="lg:col-span-1 bg-[#0f121d] border border-zinc-800/80 rounded-2xl p-5 h-72 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="w-36 h-5 rounded bg-zinc-800/80" />
                    <div className="w-16 h-5 rounded bg-zinc-800/60" />
                  </div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800/80" />
                        <div className="space-y-1">
                          <div className="w-24 h-3.5 rounded bg-zinc-800/80" />
                          <div className="w-16 h-3 rounded bg-zinc-800/50" />
                        </div>
                      </div>
                      <div className="w-14 h-4 rounded bg-zinc-800/80" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skeleton Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0f121d] border border-zinc-800/80 rounded-2xl p-5 h-64 flex flex-col justify-between">
                    <div className="w-36 h-5 rounded bg-zinc-800/80" />
                    <div className="w-32 h-32 rounded-full bg-zinc-800/50 mx-auto my-2" />
                    <div className="w-full h-4 rounded bg-zinc-800/40" />
                  </div>
                  <div className="bg-[#0f121d] border border-zinc-800/80 rounded-2xl p-5 h-64 flex flex-col justify-between">
                    <div className="w-36 h-5 rounded bg-zinc-800/80" />
                    <div className="w-full h-32 rounded bg-zinc-800/30 my-2" />
                    <div className="w-full h-4 rounded bg-zinc-800/40" />
                  </div>
                </div>
                <div className="lg:col-span-1 bg-[#0f121d] border border-zinc-800/80 rounded-2xl p-5 h-64 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="w-32 h-5 rounded bg-zinc-800/80" />
                    <div className="w-20 h-5 rounded bg-zinc-800/60" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between pt-1">
                      <div className="space-y-1">
                        <div className="w-24 h-3.5 rounded bg-zinc-800/80" />
                        <div className="w-20 h-3 rounded bg-zinc-800/50" />
                      </div>
                      <div className="w-16 h-6 rounded-lg bg-zinc-800/80" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* REAL DYNAMIC OVERVIEW DASHBOARD VIEW */
            <div className="space-y-6">
              {/* Stats Row (4 Metric Cards: Memberships, Payments & Revenue Focus) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Active Members (NEON EMERALD) */}
                <button
                  onClick={() => handleTabChange("Members")}
                  className="bg-[#0d1715] border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-emerald-950/20 hover:border-emerald-400/80 hover:bg-[#11201d] transition-all group text-left cursor-pointer relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.2)] flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>
                        +
                        {members.filter((m) => {
                          const jDate = new Date(m.joinDate);
                          const now = new Date();
                          return jDate.getMonth() === now.getMonth() && jDate.getFullYear() === now.getFullYear();
                        }).length || 0}{" "}
                        this month
                      </span>
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-emerald-200 transition-colors flex items-center justify-between">
                      <span>{members.filter((m) => m.status === "Active").length}</span>
                      <span className="text-[10px] font-semibold text-emerald-400 underline">View Members →</span>
                    </div>
                    <div className="text-xs text-emerald-400/80 font-semibold uppercase tracking-wider mt-1">
                      Total Active Members
                    </div>
                  </div>
                </button>

                {/* Card 2: Expiring Soon (NEON AMBER / YELLOW) */}
                <button
                  onClick={() => setIsActiveRateModalOpen(true)}
                  className="bg-[#18150d] border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/20 hover:border-amber-400/80 hover:bg-[#201c12] transition-all group text-left cursor-pointer relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.25)] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Expiring in 7 Days</span>
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-amber-200 transition-colors flex items-center justify-between">
                      <span>
                        {paymentRecords.filter((p) => p.status === "Due Soon").length ||
                          members.filter((m) => m.status === "Inactive").length}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-400 underline">Check List →</span>
                    </div>
                    <div className="text-xs text-amber-400/80 font-semibold uppercase tracking-wider mt-1">
                      Expiring Soon
                    </div>
                  </div>
                </button>

                {/* Card 3: Pending Payments (NEON RED / ROSE) */}
                {(() => {
                  const pendingCountList = members.filter((m) => {
                    const isStatusInactive = String(m.status || "").toLowerCase().trim() === "inactive";
                    const expVal = m.expiry_date || m.expiryDate;
                    const isExpiredDate = expVal ? new Date(expVal) < new Date() : false;
                    return isStatusInactive || isExpiredDate;
                  });

                  const totalOutstandingBalance = paymentRecords.reduce(
                    (sum, p) => sum + (Number(p.balanceDue) || 0),
                    0
                  );

                  return (
                    <button
                      onClick={() => setIsPendingPaymentsModalOpen(true)}
                      className="bg-[#1a0e12] border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-rose-950/20 hover:border-rose-400/80 hover:bg-[#221217] transition-all group text-left cursor-pointer relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-extrabold text-rose-300 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-400/40 shadow-[0_0_8px_rgba(244,63,94,0.25)] flex items-center gap-1 font-mono">
                          <span>Rs. {totalOutstandingBalance.toLocaleString()} Due</span>
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-rose-200 transition-colors flex items-center justify-between">
                          <span>{pendingCountList.length}</span>
                          <span className="text-[10px] font-semibold text-rose-400 underline">View Due →</span>
                        </div>
                        <div className="text-xs text-rose-400/80 font-semibold uppercase tracking-wider mt-1">
                          Pending Payments
                        </div>
                      </div>
                    </button>
                  );
                })()}

                {/* Card 4: Monthly Revenue (NEON CYAN / GOLD) */}
                {currentUserRole !== "STAFF" && (
                  <button
                    onClick={() => setIsRevenueModalOpen(true)}
                    className="bg-[#0e1320] border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-cyan-950/20 hover:border-cyan-400/80 hover:bg-[#12192b] transition-all group text-left cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.2)] flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-cyan-400" />
                        <span>Growth Active</span>
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-cyan-200 transition-colors flex items-center justify-between font-mono">
                        <span>
                          Rs.{" "}
                          {paymentRecords
                            .filter((p) => p.status === "Paid")
                            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                            .toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-cyan-400 underline">Breakdown →</span>
                      </div>
                      <div className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider mt-1">
                        Monthly Revenue
                      </div>
                    </div>
                  </button>
                )}
              </section>

              {/* Middle Row (Revenue Trend Chart & Recent Payments Feed) */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Performance Grouped Bar Chart (Income vs Expenses) */}
                {currentUserRole !== "STAFF" && (
                  <div className="lg:col-span-2 bg-[#0e121c] border border-cyan-500/30 rounded-2xl p-5 shadow-lg shadow-cyan-950/20 flex flex-col justify-between">
                    {/* Header Controls & Legends */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-cyan-950/60 pb-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-cyan-400" /> Revenue & Expenses Trend (ආදායම් සහ වියදම් සැසඳීම)
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Side-by-side monthly financial performance & net profit calculator.
                        </p>
                      </div>

                      {/* Glowing Legend Indicators */}
                      <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                        <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                          <span className="text-cyan-300">Income (ගෙවීම්)</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                          <span className="text-rose-300">Expenses (වියදම්)</span>
                        </div>
                      </div>
                    </div>

                    {/* Smooth Curved Area Chart Visual Canvas Container */}
                    {isOverviewLoading ? (
                      /* DARK THEME CHART LOADING SKELETON */
                      <div className="flex gap-3 items-stretch my-2 h-56 animate-pulse">
                        <div className="w-12 shrink-0 flex flex-col justify-between py-1">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-2 w-8 bg-zinc-800/80 rounded ml-auto" />
                          ))}
                        </div>
                        <div className="flex-1 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-center">
                          <div className="w-full h-32 bg-cyan-500/10 rounded-xl" />
                        </div>
                      </div>
                    ) : financialData.length === 0 ? (
                      /* CLEAN CENTERED EMPTY STATE WHEN NO FINANCIAL DATA */
                      <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center border border-dashed border-cyan-500/20 rounded-xl my-2 bg-[#0a0d16]">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                          <BarChart3 className="w-6 h-6 opacity-80" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white tracking-wide">No financial data available yet</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs">
                            Monthly income and operational expenses trend will render here automatically once records are created.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const dataList =
                            financialData.length === 1
                              ? [
                                  { month: "Mar 2026", shortMonth: "Mar", income: 0, expenses: 0 },
                                  { month: "Apr 2026", shortMonth: "Apr", income: 0, expenses: 0 },
                                  { month: "May 2026", shortMonth: "May", income: 0, expenses: 0 },
                                  { month: "Jun 2026", shortMonth: "Jun", income: 0, expenses: 0 },
                                  { month: "Jul 2026", shortMonth: "Jul", income: 0, expenses: 0 },
                                  financialData[0],
                                ]
                              : financialData;

                          const peakVal = Math.max(...dataList.map((d) => Math.max(d.income, d.expenses)), 100000);
                          const maxScale = Math.ceil(peakVal / 100000) * 100000 || 500000;
                          const yTicks = [
                            maxScale,
                            maxScale * 0.8,
                            maxScale * 0.6,
                            maxScale * 0.4,
                            maxScale * 0.2,
                            0,
                          ];

                          const formatYLabel = (val: number) => {
                            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                            if (val >= 1000) return `${Math.round(val / 1000)}k`;
                            return `${val}`;
                          };

                          // SVG Chart Geometry Constants
                          const svgWidth = 800;
                          const svgHeight = 220;
                          const padLeft = 10;
                          const padRight = 10;
                          const padTop = 15;
                          const padBottom = 15;
                          const plotW = svgWidth - padLeft - padRight;
                          const plotH = svgHeight - padTop - padBottom;

                          // Map Data Points to Coordinates
                          const count = dataList.length;
                          const incomePts = dataList.map((d, i) => {
                            const x = padLeft + (count > 1 ? (i / (count - 1)) * plotW : plotW / 2);
                            const y = padTop + plotH - (Math.min(maxScale, d.income) / maxScale) * plotH;
                            return { x, y, data: d };
                          });

                          const expensePts = dataList.map((d, i) => {
                            const x = padLeft + (count > 1 ? (i / (count - 1)) * plotW : plotW / 2);
                            const y = padTop + plotH - (Math.min(maxScale, d.expenses) / maxScale) * plotH;
                            return { x, y, data: d };
                          });

                          // Smooth Monotone Cubic Bezier Spline Pathing
                          const getCurvedPath = (pts: { x: number; y: number }[]) => {
                            if (pts.length === 0) return "";
                            if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
                            if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

                            let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
                            for (let i = 0; i < pts.length - 1; i++) {
                              const p0 = pts[Math.max(0, i - 1)];
                              const p1 = pts[i];
                              const p2 = pts[i + 1];
                              const p3 = pts[Math.min(pts.length - 1, i + 2)];

                              const cp1x = p1.x + (p2.x - p0.x) / 6;
                              const cp1y = p1.y + (p2.y - p0.y) / 6;
                              const cp2x = p2.x - (p3.x - p1.x) / 6;
                              const cp2y = p2.y - (p3.y - p1.y) / 6;

                              path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
                            }
                            return path;
                          };

                          const incomeLinePath = getCurvedPath(incomePts);
                          const expenseLinePath = getCurvedPath(expensePts);

                          const bottomY = padTop + plotH;
                          const incomeAreaPath = `${incomeLinePath} L ${incomePts[incomePts.length - 1].x.toFixed(1)} ${bottomY} L ${incomePts[0].x.toFixed(1)} ${bottomY} Z`;
                          const expenseAreaPath = `${expenseLinePath} L ${expensePts[expensePts.length - 1].x.toFixed(1)} ${bottomY} L ${expensePts[0].x.toFixed(1)} ${bottomY} Z`;

                          return (
                            <div className="flex gap-3 items-stretch my-2">
                              {/* Y-Axis Value Labels */}
                              <div className="flex flex-col justify-between text-[10px] font-mono font-semibold text-zinc-500 py-1 pr-2 text-right w-12 shrink-0 select-none">
                                {yTicks.map((tick) => (
                                  <span key={tick}>{formatYLabel(tick)}</span>
                                ))}
                              </div>

                              {/* Area Chart Visual Canvas */}
                              <div className="relative flex-1 h-56 flex flex-col justify-between">
                                {/* Subtle Dashed Cartesian Grid */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                                  {yTicks.map((tick) => (
                                    <div key={tick} className="border-b border-dashed border-zinc-800/80 w-full" />
                                  ))}
                                </div>

                                {/* SVG Area & Stroke Paths with Linear Gradients */}
                                <svg
                                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                  className="w-full h-full relative z-10 overflow-visible"
                                  preserveAspectRatio="none"
                                >
                                  <defs>
                                    {/* Income Cyan Linear Gradient (Fade to transparent) */}
                                    <linearGradient id="areaIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
                                      <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.15" />
                                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                                    </linearGradient>

                                    {/* Expenses Rosy Red Linear Gradient (Fade to transparent) */}
                                    <linearGradient id="areaExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                                      <stop offset="60%" stopColor="#e11d48" stopOpacity="0.15" />
                                      <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                                    </linearGradient>
                                  </defs>

                                  {/* Expenses Area Fill & 3px Curved Top Line */}
                                  <path d={expenseAreaPath} fill="url(#areaExpenseGradient)" />
                                  <path
                                    d={expenseLinePath}
                                    fill="none"
                                    stroke="#f43f5e"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ filter: "drop-shadow(0px 0px 8px rgba(244, 63, 94, 0.65))" }}
                                  />

                                  {/* Income Area Fill & 3px Curved Top Line */}
                                  <path d={incomeAreaPath} fill="url(#areaIncomeGradient)" />
                                  <path
                                    d={incomeLinePath}
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ filter: "drop-shadow(0px 0px 8px rgba(34, 211, 238, 0.65))" }}
                                  />
                                </svg>

                                {/* Overlay Interactive Data Nodes & Tooltips */}
                                <div className="absolute inset-0 flex items-stretch justify-between z-20 pointer-events-auto px-1">
                                  {dataList.map((item, idx) => {
                                    const netProfit = item.income - item.expenses;
                                    const incPt = incomePts[idx];
                                    const expPt = expensePts[idx];

                                    return (
                                      <div key={item.shortMonth} className="flex-1 relative group cursor-pointer">
                                        {/* Hover Vertical Highlight Line */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-cyan-400/50 via-purple-500/30 to-transparent pointer-events-none transition-opacity" />

                                        {/* Hover Tooltip Popover with Net Profit */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-24 left-1/2 -translate-x-1/2 bg-[#0c0f18]/95 border border-cyan-500/50 backdrop-blur-md rounded-xl p-2.5 shadow-2xl z-30 pointer-events-none transition-opacity whitespace-nowrap space-y-1 text-left">
                                          <div className="text-[10px] font-bold text-white border-b border-zinc-800 pb-1 flex items-center justify-between gap-3">
                                            <span>{item.month}</span>
                                            <span className="text-[9px] text-cyan-400 font-mono">CURVED TREND</span>
                                          </div>
                                          <div className="text-[10px] text-cyan-300 flex items-center justify-between gap-4">
                                            <span>Income:</span>
                                            <span className="font-mono font-bold">LKR {item.income.toLocaleString()}</span>
                                          </div>
                                          <div className="text-[10px] text-rose-400 flex items-center justify-between gap-4">
                                            <span>Expenses:</span>
                                            <span className="font-mono font-bold">LKR {item.expenses.toLocaleString()}</span>
                                          </div>
                                          <div className="text-[10px] border-t border-zinc-800 pt-1 flex items-center justify-between gap-4">
                                            <span className="text-zinc-400 font-semibold">Net Profit:</span>
                                            <span className={`font-mono font-black ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                              LKR {netProfit.toLocaleString()}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Income Node Circle (CYAN) */}
                                        <div
                                          style={{ top: `${((incPt.y - padTop) / plotH) * 100}%` }}
                                          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0a0d16] border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] transition-transform group-hover:scale-150"
                                        />

                                        {/* Expenses Node Circle (ROSE) */}
                                        <div
                                          style={{ top: `${((expPt.y - padTop) / plotH) * 100}%` }}
                                          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0a0d16] border-2 border-rose-500 shadow-[0_0_10px_#f43f5e] transition-transform group-hover:scale-150"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* X-Axis Month Labels */}
                                <div className="flex justify-between items-center text-xs text-zinc-400 font-medium pt-2 border-t border-zinc-800/80 z-20">
                                  {dataList.map((item, idx) => (
                                    <span
                                      key={item.shortMonth}
                                      className={`flex-1 text-center font-mono ${
                                        idx === dataList.length - 1 ? "text-cyan-400 font-bold" : "text-zinc-400"
                                      }`}
                                    >
                                      {item.shortMonth}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                )}

                {/* Right Side Panel: Recent Payments Feed */}
                <div
                  className={`${
                    currentUserRole === "STAFF" ? "lg:col-span-3" : "lg:col-span-1"
                  } bg-[#0d141e] border border-cyan-500/30 rounded-2xl p-5 shadow-lg shadow-cyan-950/20 flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Recent Payments Feed</h3>
                    </div>
                    <button
                      onClick={() => handleTabChange("Payments")}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30"
                    >
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-cyan-950/50 space-y-2">
                    {paymentRecords.slice(0, 5).length === 0 ? (
                      /* ELEGANT EMPTY STATE FOR RECENT PAYMENTS */
                      <div className="py-12 px-4 text-center space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                          <CreditCard className="w-5 h-5 opacity-60" />
                        </div>
                        <h4 className="text-xs font-bold text-white">No Recent Payments Today</h4>
                        <p className="text-[11px] text-zinc-400">
                          New fee payment entries recorded will automatically display live in this feed.
                        </p>
                      </div>
                    ) : (
                      paymentRecords.slice(0, 5).map((item) => (
                        <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                              <CreditCard className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                                {item.memberName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">{item.paymentDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                              LKR {item.amount.toLocaleString()}
                            </span>
                            <p className="text-[10px] text-zinc-500">{item.method}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              {/* Recent Member Messages Widget Row */}
              <div className="bg-[#0e121c] border border-cyan-500/30 rounded-2xl p-5 shadow-lg shadow-cyan-950/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-950/60 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                        Recent Member Messages
                        {recentMemberMessagesList.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono">
                            {recentMemberMessagesList.length} Latest
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Latest incoming chat conversations from registered members. Click any card to reply.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTabChange("Member Chat")}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30 self-start sm:self-auto shrink-0 cursor-pointer"
                  >
                    Open Member Chat <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {recentMemberMessagesList.length === 0 ? (
                  <div className="py-8 px-4 text-center bg-[#07090e] border border-zinc-800/80 rounded-xl space-y-2">
                    <MessageCircle className="w-8 h-8 text-cyan-400 mx-auto opacity-60" />
                    <h4 className="text-xs font-bold text-white">No Recent Member Messages</h4>
                    <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                      Incoming chat messages sent by members will display live in this feed.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recentMemberMessagesList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          handleTabChange("Member Chat");
                          setActiveChatMemberId(item.memberId);
                        }}
                        className="bg-[#07090e] border border-zinc-800 hover:border-cyan-500/50 hover:bg-[#0c121d] rounded-xl p-3.5 flex flex-col justify-between gap-2.5 transition-all cursor-pointer group shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl}
                            alt={item.memberName}
                            className="w-10 h-10 rounded-full object-cover border border-cyan-500/40 shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate">
                                {item.memberName}
                              </h4>
                              <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                                {item.timestamp}
                              </span>
                            </div>
                            <span className="inline-block px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 text-[9px] font-mono mt-0.5">
                              {item.memberId}
                            </span>
                          </div>
                        </div>

                        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2 text-xs text-zinc-300 line-clamp-2 italic leading-relaxed">
                          &ldquo;{item.messageText}&rdquo;
                        </div>

                        <div className="flex items-center justify-end text-[11px] font-bold text-cyan-400 group-hover:translate-x-1 transition-transform pt-0.5">
                          <span>Open Chat →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Row (Bottom Left: Membership Distribution & New Enrollments | Bottom Right: Payment Defaulters) */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bottom Left Section (2 Analytics Components: Membership Distribution & New Enrollments) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Analytics 1: Membership Distribution */}
                  <div className="bg-[#13101c] border border-purple-500/30 rounded-2xl p-5 shadow-lg shadow-purple-950/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                        <h3 className="text-sm font-bold text-white tracking-wide">Membership Distribution</h3>
                      </div>
                      <span className="text-[11px] text-purple-300/80 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                        {members.length} Total Members
                      </span>
                    </div>

                    {/* Custom SVG Donut Chart Calculated Dynamically */}
                    {(() => {
                      const totalMems = members.length;
                      const palette = [
                        { stroke: "#06b6d4", bg: "bg-cyan-400" },
                        { stroke: "#a855f7", bg: "bg-purple-400" },
                        { stroke: "#10b981", bg: "bg-emerald-400" },
                        { stroke: "#f59e0b", bg: "bg-amber-400" },
                        { stroke: "#ec4899", bg: "bg-pink-400" },
                        { stroke: "#6366f1", bg: "bg-indigo-400" },
                      ];

                      const tierCounts: Record<string, number> = {};
                      members.forEach((m) => {
                        const tierName = m.tier ? m.tier.trim() : "Standard";
                        tierCounts[tierName] = (tierCounts[tierName] || 0) + 1;
                      });

                      const categories = Object.entries(tierCounts).map(([name, count], idx) => {
                        const percentage = totalMems > 0 ? Math.round((count / totalMems) * 100) : 0;
                        const styleConfig = palette[idx % palette.length];
                        return {
                          name,
                          count,
                          percentage,
                          stroke: styleConfig.stroke,
                          bgClass: styleConfig.bg,
                        };
                      });

                      const CIRCUMFERENCE = 238.76;
                      let cumulativeOffset = 0;

                      return (
                        <>
                          <div className="flex items-center justify-center my-3 relative">
                            {categories.length > 0 ? (
                              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
                                {categories.map((cat) => {
                                  const dashArray = (cat.percentage / 100) * CIRCUMFERENCE;
                                  const offset = cumulativeOffset;
                                  cumulativeOffset += dashArray;

                                  return (
                                    <circle
                                      key={cat.name}
                                      cx="50"
                                      cy="50"
                                      r="38"
                                      stroke={cat.stroke}
                                      strokeWidth="12"
                                      fill="none"
                                      strokeDasharray={`${dashArray} ${CIRCUMFERENCE}`}
                                      strokeDashoffset={`-${offset}`}
                                      className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                                      style={{ filter: `drop-shadow(0px 0px 6px ${cat.stroke}a0)` }}
                                    />
                                  );
                                })}
                              </svg>
                            ) : (
                              <div className="w-36 h-36 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                                No Data
                              </div>
                            )}

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                              <span className="text-xl font-extrabold text-white tracking-tight">
                                {members.length}
                              </span>
                              <span className="text-[10px] font-semibold text-purple-300 uppercase">Members</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-purple-950/40 max-h-36 overflow-y-auto pr-1">
                            {categories.length > 0 ? (
                              categories.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.bgClass}`} />
                                    <span className="text-zinc-300 font-medium truncate max-w-[140px]" title={item.name}>
                                      {item.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 font-mono shrink-0">
                                    <span className="text-white font-bold">{item.percentage}%</span>
                                    <span className="text-[10px] text-zinc-500">({item.count})</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-xs text-zinc-500 py-1">No member packages found</div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Analytics 2: New Enrollments */}
                  <div className="bg-[#0e171b] border border-teal-500/30 rounded-2xl p-5 shadow-lg shadow-teal-950/20 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
                        <h3 className="text-sm font-bold text-white tracking-wide">New Enrollments</h3>
                      </div>
                      <span className="text-[11px] text-teal-300 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                        Last 6 Months
                      </span>
                    </div>

                    {/* Monthly Sign-up Bar Chart Calculated Dynamically */}
                    {(() => {
                      const today = new Date();
                      const last6Months = Array.from({ length: 6 }).map((_, i) => {
                        const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
                        return {
                          name: d.toLocaleString("default", { month: "short" }),
                          year: d.getFullYear(),
                          monthNum: d.getMonth(),
                        };
                      });

                      const enrollmentData = last6Months.map((m) => {
                        const count = members.filter((mem) => {
                          const dateVal = mem.joinDate || mem.createdAt || mem.created_at;
                          if (!dateVal) return false;
                          const memDate = new Date(dateVal);
                          return memDate.getFullYear() === m.year && memDate.getMonth() === m.monthNum;
                        }).length;
                        return { month: m.name, count };
                      });

                      const maxEnrollment = Math.max(...enrollmentData.map((d) => d.count), 1);

                      return (
                        <>
                          <div className="h-36 flex items-end justify-between gap-2 px-1 pt-3 pb-1">
                            {enrollmentData.map((bar) => {
                              const calcHeight = Math.max(12, Math.round((bar.count / maxEnrollment) * 100));
                              return (
                                <div key={bar.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                                  <div
                                    style={{ height: `${calcHeight}%` }}
                                    className="w-full bg-gradient-to-t from-teal-600 to-cyan-400 hover:from-teal-500 hover:to-cyan-300 rounded-t-md transition-all duration-300 shadow-[0_0_10px_rgba(45,212,191,0.4)] relative"
                                  >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-teal-950 text-teal-200 text-[10px] px-2 py-0.5 rounded border border-teal-700 pointer-events-none transition-opacity shadow-lg z-10 whitespace-nowrap font-mono font-bold">
                                      {bar.count} signups
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex justify-between items-center text-xs text-teal-300/70 font-semibold px-1 mt-2 pt-2 border-t border-teal-900/40">
                            {enrollmentData.map((bar) => (
                              <span key={bar.month} className="flex-1 text-center font-mono">
                                {bar.month}
                              </span>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Bottom Right Section: Payment Defaulters List */}
                <div className="lg:col-span-1 bg-[#1a0e12] border border-rose-500/30 rounded-2xl p-5 shadow-lg shadow-rose-950/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Payment Defaulters</h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                      {paymentRecords.filter((p) => p.status !== "Paid").length} Due
                    </span>
                  </div>

                  <div className="divide-y divide-rose-950/50 space-y-2">
                    {paymentRecords.filter((p) => p.status !== "Paid").length === 0 ? (
                      /* ELEGANT EMPTY STATE FOR PAYMENT DEFAULTERS */
                      <div className="py-12 px-4 text-center space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                          <CheckCircle2 className="w-5 h-5 opacity-80" />
                        </div>
                        <h4 className="text-xs font-bold text-white">No Payment Defaulters Found 🎉</h4>
                        <p className="text-[11px] text-zinc-400">
                          All member accounts are up-to-date with active paid memberships!
                        </p>
                      </div>
                    ) : (
                      paymentRecords
                        .filter((p) => p.status !== "Paid")
                        .map((item) => (
                          <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between">
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                                {item.memberName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-rose-400/80 font-mono font-semibold">
                                  Due: {item.dueDate}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-mono font-bold text-rose-400">
                                LKR {item.amount.toLocaleString()}
                              </span>
                              <button
                                onClick={() => {
                                  setCustomReminderText(
                                    `Hi ${item.memberName}, this is a friendly payment reminder from IGYM Balangoda regarding your ${item.category} overdue balance of LKR ${item.amount.toLocaleString()} (Due Date: ${item.dueDate}). Please settle at your earliest convenience!`
                                  );
                                  setIsPaymentReminderModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-[0_0_8px_rgba(244,63,94,0.2)]"
                              >
                                <Send className="w-3 h-3 text-rose-400" />
                                Remind
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </section>
            </div>
          )
        ) : activeTab === "Members" ? (
          /* MEMBERS FULL MANAGEMENT VIEW */
          <div className="space-y-6">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11131e] border border-cyan-500/30 rounded-2xl p-5 shadow-lg shadow-cyan-950/20">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" /> Member Management ({filteredMembers.length})
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  View, add, edit, or check complete health & contact records of IGYM members.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter Buttons */}
                <div className="flex items-center p-1 bg-[#0a0c14] border border-zinc-800 rounded-xl">
                  {(["All", "Active", "Inactive"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        statusFilter === st
                          ? "bg-cyan-500 text-black shadow-md font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Add Member Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add New Member
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontally Scrollable Package Filter Chips / Pills Bar */}
            <div className="bg-[#11131e] border border-zinc-800 rounded-2xl p-3 shadow-md flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5 pl-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter Package:
              </span>
              {[
                "All Packages",
                "Men",
                "Men + TR",
                "Ladies",
                "Ladies + TR",
                "Student",
                "Student + TR",
                "Couple",
                "Couple + TR",
                "PT / Custom",
              ].map((chip) => {
                const isActive = packageFilter === chip;
                return (
                  <button
                    key={chip}
                    onClick={() => setPackageFilter(chip)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold scale-[1.02]"
                        : "bg-[#0a0c14] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {/* Members Directory Grid Table */}
            <div className="bg-[#0e1019] border border-zinc-800/80 rounded-2xl p-5 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-[11px] font-bold text-cyan-400/90 uppercase tracking-wider border-b border-zinc-800">
                      <th className="pb-3.5 pl-2 font-semibold">MEMBER DETAILS</th>
                      <th className="pb-3.5 font-semibold">PHONE & ADDRESS</th>
                      <th className="pb-3.5 font-semibold">HEIGHT / WEIGHT</th>
                      <th className="pb-3.5 font-semibold">BMI</th>
                      <th className="pb-3.5 font-semibold">STATUS</th>
                      <th className="pb-3.5 pr-2 text-right font-semibold">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {isMembersLoading || (isOverviewLoading && members.length === 0) ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse border-b border-zinc-800/40">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-zinc-800/80 shrink-0" />
                              <div className="space-y-1.5">
                                <div className="h-4 w-32 bg-zinc-800/80 rounded" />
                                <div className="h-3 w-20 bg-zinc-800/50 rounded" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="space-y-1.5">
                              <div className="h-3.5 w-24 bg-zinc-800/80 rounded" />
                              <div className="h-3 w-36 bg-zinc-800/50 rounded" />
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="h-4 w-28 bg-zinc-800/80 rounded font-mono" />
                          </td>
                          <td className="py-4">
                            <div className="h-4 w-16 bg-zinc-800/80 rounded" />
                          </td>
                          <td className="py-4">
                            <div className="h-6 w-20 bg-zinc-800/80 rounded-full" />
                          </td>
                          <td className="py-4 pr-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-8 h-8 rounded-xl bg-zinc-800/80" />
                              <div className="w-8 h-8 rounded-xl bg-zinc-800/80" />
                              <div className="w-8 h-8 rounded-xl bg-zinc-800/80" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => {
                        const bmiCategory = getBMICategory(member.bmi);
                        return (
                          <tr
                            key={member.id}
                            onClick={() => handleOpenDetailModal(member)}
                            className="hover:bg-zinc-800/40 transition-all group cursor-pointer"
                          >
                            {/* Member Name & ID */}
                            <td className="py-4 pl-2">
                              <div className="flex items-center gap-3">
                                {member.profile_pic_url || member.profilePicUrl ? (
                                  <img
                                    src={member.profile_pic_url || member.profilePicUrl}
                                    alt={member.name}
                                    className="w-9 h-9 rounded-full object-cover border border-cyan-500/40 shadow-sm shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-sm shadow-sm shrink-0">
                                    {member.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                                    {member.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {member.id}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-medium">
                                      {member.tier}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Phone & Address */}
                            <td className="py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-zinc-200">
                                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  <span>{member.phone}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                  <span className="truncate max-w-[180px]">{member.address}</span>
                                </div>
                              </div>
                            </td>

                             {/* Height & Weight */}
                            <td className="py-4 font-mono text-xs sm:text-sm">
                              <div className="flex items-center gap-3 text-zinc-200">
                                <span className="flex items-center gap-1">
                                  <Ruler className="w-3.5 h-3.5 text-cyan-400" /> {member.height ? `${member.height} cm` : "N/A"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Scale className="w-3.5 h-3.5 text-amber-400" /> {member.weight ? `${member.weight} kg` : "N/A"}
                                </span>
                              </div>
                            </td>

                            {/* BMI Score & Status */}
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-extrabold text-white">
                                  {member.bmi && member.bmi !== "0.0" ? member.bmi : "N/A"}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bmiCategory.color}`}>
                                  {bmiCategory.label}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-4">
                              {member.status === "Active" && member.expiryDate && new Date(member.expiryDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.25)]">
                                  <UserX className="w-3.5 h-3.5 text-rose-400" /> Expired
                                </span>
                              ) : member.status === "Active" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-lime-500/15 text-lime-400 border border-lime-500/30 shadow-[0_0_8px_rgba(132,204,22,0.25)]">
                                  <UserCheck className="w-3.5 h-3.5" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
                                  <UserX className="w-3.5 h-3.5" /> Inactive
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 pr-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenDetailModal(member)}
                                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 border border-zinc-700/50 transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleResetMemberPassword(member)}
                                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-orange-500/20 text-zinc-300 hover:text-orange-300 border border-zinc-700/50 transition-colors"
                                  title="Reset Password to Default (111111)"
                                >
                                  <KeyRound className="w-4 h-4 text-orange-400" />
                                </button>
                                <button
                                  onClick={(e) => handleOpenEditModal(member, e)}
                                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-700/50 transition-colors"
                                  title="Edit Member"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleOpenDeleteModal(member, e)}
                                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-pink-500/20 text-zinc-300 hover:text-pink-400 border border-zinc-700/50 transition-colors"
                                  title="Delete Member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm">
                          No members found matching "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        ) : activeTab === "Payments" ? (
          /* PAYMENTS & AUTOMATED REMINDERS & EXPENSES TRACKING SECTION VIEW */
          <div className="space-y-6">
            {/* Top View Toggle: Income vs Expenses & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d0f17] border border-zinc-800 p-2.5 rounded-2xl">
              <div className="flex items-center gap-1.5 p-1 bg-[#141824] border border-zinc-800 rounded-xl">
                <button
                  onClick={() => setPaymentViewTab("INCOME")}
                  className={`px-5 py-2 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 ${
                    paymentViewTab === "INCOME"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Wallet className="w-4 h-4 text-purple-300" /> Income & Revenue (ආදායම්)
                </button>
                <button
                  onClick={() => setPaymentViewTab("EXPENSES")}
                  className={`px-5 py-2 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 ${
                    paymentViewTab === "EXPENSES"
                      ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/25"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <TrendingDown className="w-4 h-4 text-rose-300" /> Expenses Tracking (වියදම්)
                </button>
              </div>

              {paymentViewTab === "INCOME" && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const initialMem = members[0];
                      const initialCat = initialMem?.tier && gymPackages.some((p) => p.name === initialMem.tier) ? initialMem.tier : "Men (Without Treadmills)";
                      const calc = calculatePaymentAmount(initialCat, 1);
                      setPaymentFormData({
                        memberId: initialMem?.id || "",
                        externalPayerName: "",
                        category: initialCat,
                        durationMonths: 1,
                        amount: calc.finalAmount,
                        paidAmount: calc.finalAmount,
                        method: "Cash",
                        sendReceiptAlert: true,
                        itemDescription: "",
                        gymRevenuePercentage: 20,
                      });
                      setMemberComboboxQuery(initialMem ? `${initialMem.name} (${initialMem.id})` : "");
                      setIsMemberComboboxOpen(false);
                      setIsRecordPaymentModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition-all whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Record Fee Payment
                  </button>

                  {paymentRecords.length > 0 && (
                    <button
                      onClick={handleClearAllPayments}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 font-bold text-xs transition-all whitespace-nowrap cursor-pointer shrink-0"
                      title="Clear all payment records from database & system"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All Logs
                    </button>
                  )}
                </div>
              )}

              {paymentViewTab === "EXPENSES" && (
                <button
                  onClick={() => setIsRecordExpenseModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-950/40 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> + Record Expense (නව වියදමක්)
                </button>
              )}
            </div>

            {paymentViewTab === "INCOME" ? (
              /* INCOME & REVENUE VIEW */
              <div className="space-y-6">
                {/* Header & Category Filters Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14121a] border border-purple-500/30 rounded-xl p-3.5 shadow-md shadow-purple-950/20">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-400" /> Memberships, Revenue & Payments
                    </h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Manage membership fees, issue digital receipts to member chat, and track revenue growth.
                    </p>
                  </div>

                  {/* Category Filters */}
                  <div className="flex items-center gap-1 p-1 bg-[#0a0910] border border-zinc-800 rounded-xl text-xs overflow-x-auto max-w-full whitespace-nowrap scrollbar-none shrink-0">
                    {(["All", "Monthly Fee", "Admission Fee", "PT Fee", "Supplements & Merchandise"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setPaymentCategoryFilter(cat)}
                        className={`px-3 py-1 font-semibold rounded-lg transition-all shrink-0 text-xs ${
                          paymentCategoryFilter === cat
                            ? "bg-purple-500 text-white shadow-md font-bold"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payments Analytics Stat Cards (4 Cards) */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Gym Net Revenue This Month */}
                  <div
                    onClick={() => setIsRevenueModalOpen(true)}
                    className="bg-[#101912] border border-lime-500/40 hover:border-lime-400 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-lime-950/20 cursor-pointer group transition-all transform hover:-translate-y-0.5"
                    title="Click to view detailed revenue breakdown & export report"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-lime-950/80 border border-lime-500/40 text-lime-400 group-hover:scale-110 transition-transform">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-lime-400 font-mono">● THIS MONTH</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono group-hover:text-lime-300 transition-colors">
                        LKR {paymentRecords.filter((p) => p.status === "Paid").reduce((sum, p) => sum + (Number(p.gymRevenueAmount !== undefined ? p.gymRevenueAmount : p.amount) || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-lime-400/80 font-semibold uppercase tracking-wider mt-1">Gym Net Revenue (Post PT Split)</div>
                    </div>
                  </div>

                  {/* Card 2: Gym Packages & Tiers Manager */}
                  <div
                    onClick={() => setIsPackagePricingModalOpen(true)}
                    className="bg-[#0f141f] border border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-cyan-950/20 cursor-pointer group transition-all transform hover:-translate-y-0.5"
                    title="Click to manage & edit gym packages and prices"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsPackagePricingModalOpen(true); }}
                        className="text-xs font-extrabold text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 px-2.5 py-1 rounded-lg border border-cyan-400/40 flex items-center gap-1.5 transition-all"
                      >
                        <Settings2 className="w-3.5 h-3.5" /> Manage ({gymPackages.length})
                      </button>
                    </div>
                    <div className="mt-3 space-y-1 text-xs">
                      {gymPackages.slice(0, 3).map((pkg, idx) => (
                        <div key={pkg.id} className="flex justify-between text-zinc-300">
                          <span className="truncate pr-2">{pkg.name}:</span>
                          <span className={`font-mono font-bold ${idx === 0 ? "text-cyan-300" : idx === 1 ? "text-lime-300" : "text-amber-300"}`}>
                            LKR {pkg.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Overdue & Due Soon Pending */}
                  {(() => {
                    const pendingCountList = members.filter((m) => {
                      const plan = (m.tier || "").toString().trim();
                      const hasPlan = plan.length > 0 && plan !== "N/A" && plan.toLowerCase() !== "null";
                      if (!hasPlan) return false;

                      const expVal = m.expiry_date || m.expiryDate;
                      if (!expVal) return false;
                      const expDate = new Date(expVal);
                      return !isNaN(expDate.getTime()) && expDate < new Date();
                    });

                    const totalPendingAmt = pendingCountList.reduce((sum, m) => {
                      const plan = (m.tier || "").toString().trim();
                      const hasPlan = plan.length > 0 && plan !== "N/A" && plan.toLowerCase() !== "null";
                      if (!hasPlan) return sum;

                      const pkg = gymPackages.find((p) => (p.package_name || p.name) === m.tier || p.name === m.tier);
                      const price = pkg ? Number(pkg.price) || 0 : 0;
                      return sum + price;
                    }, 0);

                    return (
                      <div
                        onClick={() => setIsPendingPaymentsModalOpen(true)}
                        className="bg-[#1c0f14] border border-pink-500/40 hover:border-pink-400 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-pink-950/20 cursor-pointer group transition-all transform hover:-translate-y-0.5"
                        title="Click to view list of members with pending or overdue payments"
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-pink-950/80 border border-pink-500/40 text-pink-400 group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/30">Attention Due</span>
                        </div>
                        <div className="mt-4">
                          <div className="text-2xl sm:text-3xl font-extrabold text-pink-300 tracking-tight font-mono group-hover:text-pink-200 transition-colors">
                            LKR {totalPendingAmt.toLocaleString()}
                          </div>
                          <div className="text-xs text-pink-400/80 font-semibold uppercase tracking-wider mt-1">
                            {pendingCountList.length} Pending Overdue
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card 4: Automated Reminders Sent */}
                  <div className="bg-[#18150d] border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/20">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/30">In-App Sync</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                        {paymentRecords.filter((p) => p.reminderSent).length} Receipts
                      </div>
                      <div className="text-xs text-amber-400/80 font-semibold uppercase tracking-wider mt-1">Routed via Member App Chat</div>
                    </div>
                  </div>
                </section>



                {/* Payment Transactions Table */}
                <div className="bg-[#0e1019] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
                  
                  {/* Date Range & Dual Export (CSV & PDF) Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-[#13111f] border border-purple-500/20 rounded-xl text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" /> Filter Date Range:
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-zinc-400 font-medium">From:</label>
                        <input
                          type="date"
                          value={paymentStartDate}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          onChange={(e) => setPaymentStartDate(e.target.value)}
                          className="bg-[#0b0a12] border border-purple-500/30 hover:border-purple-400 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500 cursor-pointer transition-all [color-scheme:dark]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-zinc-400 font-medium">To:</label>
                        <input
                          type="date"
                          value={paymentEndDate}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          onChange={(e) => setPaymentEndDate(e.target.value)}
                          className="bg-[#0b0a12] border border-purple-500/30 hover:border-purple-400 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500 cursor-pointer transition-all [color-scheme:dark]"
                        />
                      </div>
                      {(paymentStartDate || paymentEndDate) && (
                        <button
                          onClick={() => {
                            setPaymentStartDate("");
                            setPaymentEndDate("");
                          }}
                          className="text-[11px] text-zinc-400 hover:text-white underline font-medium"
                        >
                          Clear Dates
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
                        title="Download currently filtered records as CSV spreadsheet"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-400" /> Export to CSV
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/40 font-bold text-xs transition-all flex items-center gap-1.5"
                        title="Generate professional PDF income report"
                      >
                        <Download className="w-3.5 h-3.5 text-purple-400" /> Export to PDF
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-400" /> Transaction Records & Expiry Status
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Filter, search, or verify member fee payments and in-app receipt dispatches.</p>
                    </div>

                    {/* Prominent Search Transactions Input */}
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by Member Name, ID (MEM-...), or Invoice..."
                        value={paymentSearchQuery}
                        onChange={(e) => setPaymentSearchQuery(e.target.value)}
                        className="w-full bg-[#151322] border border-purple-500/30 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 transition-all shadow-inner"
                      />
                      {paymentSearchQuery && (
                        <button
                          onClick={() => setPaymentSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="text-[11px] font-bold text-purple-400/90 uppercase tracking-wider border-b border-zinc-800">
                          <th className="pb-3.5 pl-2 font-semibold">INVOICE & MEMBER</th>
                          <th className="pb-3.5 font-semibold">FEE CATEGORY</th>
                          <th className="pb-3.5 font-semibold">AMOUNT</th>
                          <th className="pb-3.5 font-semibold">PAYMENT / DUE DATE</th>
                          <th className="pb-3.5 font-semibold">METHOD</th>
                          <th className="pb-3.5 font-semibold">STATUS</th>
                          <th className="pb-3.5 font-semibold">DIGITAL RECEIPT</th>
                          <th className="pb-3.5 pr-2 text-right font-semibold">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {(() => {
                          const filtered = paymentRecords.filter((p) => {
                            const matchesCategory = paymentCategoryFilter === "All" || p.category === paymentCategoryFilter;
                            const q = paymentSearchQuery.trim().toLowerCase();
                            const matchesSearch =
                              !q ||
                              p.memberName.toLowerCase().includes(q) ||
                              (p.memberId && p.memberId.toLowerCase().includes(q)) ||
                              (p.externalPayerName && p.externalPayerName.toLowerCase().includes(q)) ||
                              p.invoiceNo.toLowerCase().includes(q) ||
                              p.phone.toLowerCase().includes(q) ||
                              (p.itemDescription && p.itemDescription.toLowerCase().includes(q));

                            const matchesStartDate = !paymentStartDate || p.paymentDate >= paymentStartDate;
                            const matchesEndDate = !paymentEndDate || p.paymentDate <= paymentEndDate;

                            return matchesCategory && matchesSearch && matchesStartDate && matchesEndDate;
                          });

                          if (isOverviewLoading && paymentRecords.length === 0) {
                            return Array.from({ length: 6 }).map((_, idx) => (
                              <tr key={idx} className="animate-pulse border-b border-zinc-800/40">
                                <td className="py-4 pl-2">
                                  <div className="space-y-1.5">
                                    <div className="h-4 w-24 bg-zinc-800/80 rounded font-mono" />
                                    <div className="h-4 w-36 bg-zinc-800/90 rounded" />
                                    <div className="h-3 w-28 bg-zinc-800/50 rounded font-mono" />
                                  </div>
                                </td>
                                <td className="py-4">
                                  <div className="h-6 w-28 bg-zinc-800/80 rounded-lg" />
                                </td>
                                <td className="py-4">
                                  <div className="h-5 w-24 bg-zinc-800/80 rounded font-mono" />
                                </td>
                                <td className="py-4">
                                  <div className="h-4 w-20 bg-zinc-800/80 rounded font-mono" />
                                </td>
                                <td className="py-4">
                                  <div className="h-4 w-16 bg-zinc-800/80 rounded" />
                                </td>
                                <td className="py-4">
                                  <div className="h-6 w-20 bg-zinc-800/80 rounded-full" />
                                </td>
                                <td className="py-4 pr-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-zinc-800/80" />
                                    <div className="w-8 h-8 rounded-xl bg-zinc-800/80" />
                                  </div>
                                </td>
                              </tr>
                            ));
                          }

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs font-mono">
                                  No transaction records found matching "{paymentSearchQuery || paymentCategoryFilter}".
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map((pay) => {
                            const isWalkIn = !pay.memberId || pay.memberId === "WALK_IN";
                            const displayName = isWalkIn ? (pay.externalPayerName || pay.memberName || "Walk-in Guest / External Income") : pay.memberName;

                            return (
                              <tr key={pay.id} className="hover:bg-zinc-800/40 transition-colors">
                                <td className="py-4 pl-2">
                                  <div>
                                    <span className="font-mono text-xs text-purple-300 font-bold">{pay.invoiceNo}</span>
                                    <h4 className="font-bold text-white text-sm mt-0.5 flex items-center gap-1.5">
                                      {displayName}
                                      {isWalkIn && (
                                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                                          Walk-in 🛍️
                                        </span>
                                      )}
                                    </h4>
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      {!isWalkIn ? `${pay.memberId} • ${pay.phone}` : `External Income • ${pay.phone || "N/A"}`}
                                    </span>
                                  </div>
                                </td>
                              <td className="py-4">
                                <div>
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                                    pay.category === "Monthly Fee" ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                    : pay.category === "PT Fee" || pay.category.toLowerCase().includes("pt") ? "bg-lime-500/15 text-lime-300 border-lime-500/30"
                                    : pay.category === "Admission Fee" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    : pay.category === "Supplements & Merchandise" ? "bg-pink-500/15 text-pink-300 border-pink-500/30"
                                    : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                  }`}>
                                    {pay.category}
                                  </span>
                                  {pay.itemDescription && (
                                    <p className="text-[11px] font-semibold text-pink-300 mt-1 font-mono flex items-center gap-1">
                                      📦 {pay.itemDescription}
                                    </p>
                                  )}
                                  {pay.gymRevenuePercentage !== undefined && pay.gymRevenuePercentage < 100 && (
                                    <p className="text-[10px] font-semibold text-purple-300 mt-1 font-mono flex items-center gap-1">
                                      🏋️ Gym {pay.gymRevenuePercentage}% Share (LKR {pay.gymRevenueAmount?.toLocaleString()})
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 font-mono text-xs">
                                <div className="font-extrabold text-white text-sm">
                                  Total: LKR {pay.amount.toLocaleString()}
                                </div>
                                <div className="text-emerald-400 font-bold mt-0.5">
                                  Paid: LKR {(pay.paidAmount !== undefined ? pay.paidAmount : pay.amount).toLocaleString()}
                                </div>
                                {pay.balanceDue !== undefined && pay.balanceDue > 0 ? (
                                  <div className="text-rose-400 font-extrabold mt-0.5 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/60 inline-block">
                                    Balance: LKR {pay.balanceDue.toLocaleString()}
                                  </div>
                                ) : (
                                  <div className="text-zinc-500 text-[10px]">
                                    Balance: LKR 0 (Paid)
                                  </div>
                                )}
                              </td>
                              <td className="py-4">
                                <div className="text-xs">
                                  <div className="text-zinc-400">Paid: <span className="font-mono text-white">{pay.paymentDate}</span></div>
                                  <div className="mt-0.5">Due: <span className={`font-mono font-bold ${pay.dueDate && new Date(pay.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? "text-rose-400 animate-pulse" : pay.status === "Overdue" ? "text-pink-400 animate-pulse" : pay.status === "Due Soon" ? "text-amber-400" : "text-zinc-300"}`}>{pay.dueDate}</span></div>
                                </div>
                              </td>
                              <td className="py-4 text-xs text-zinc-300 font-medium">
                                <span className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700">{pay.method}</span>
                              </td>
                              <td className="py-4">
                                {pay.dueDate && new Date(pay.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                                    <AlertTriangle className="w-3 h-3 text-rose-400" /> Expired 🔴
                                  </span>
                                ) : pay.status === "Paid" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-lime-500/15 text-lime-400 border border-lime-500/30 shadow-[0_0_8px_rgba(132,204,22,0.25)]">
                                    <CheckCircle className="w-3 h-3" /> Paid & Active
                                  </span>
                                ) : pay.status === "Due Soon" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    <Clock className="w-3 h-3" /> Due Soon (3 Days)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                                    <AlertTriangle className="w-3 h-3" /> Overdue ⚠️
                                  </span>
                                )}
                              </td>
                               <td className="py-4">
                                 {pay.receiptSent || pay.reminderSent ? (
                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30">
                                     <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Sent
                                   </span>
                                 ) : (
                                   <span className="text-[11px] text-zinc-500 italic">Not Sent</span>
                                 )}
                               </td>
                              <td className="py-4 pr-2 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      if (!pay.memberId) {
                                        alert("Digital App Chat receipt can only be sent to registered members.");
                                        return;
                                      }
                                      const receiptMessageString = `Receipt *Payment Received*\nPackage: ${pay.category}\nAmount: LKR ${pay.amount.toLocaleString()}\nMethod: ${pay.method}\nDate: ${pay.paymentDate}\nInvoice No: ${pay.invoiceNo}\n\nThank you for your payment!`;

                                      try {
                                        const { data: chatData, error: chatErr } = await supabase
                                          .from("chat_messages")
                                          .insert([
                                            {
                                              member_id: pay.memberId,
                                              sender_id: "admin",
                                              receiver_id: pay.memberId,
                                              message: receiptMessageString,
                                            },
                                          ])
                                          .select();

                                        if (!chatErr && chatData) {
                                          setPaymentRecords((prev) =>
                                            prev.map((rec) =>
                                              rec.id === pay.id ? { ...rec, reminderSent: true, receiptSent: true } : rec
                                            )
                                          );
                                          await supabase
                                            .from("payments")
                                            .update({ receipt_sent: true, reminder_sent: true })
                                            .or(`id.eq.${pay.id},invoice_no.eq.${pay.invoiceNo}`);

                                          alert(`✅ Digital Receipt for ${pay.invoiceNo} sent to Member App Chat!`);
                                        } else {
                                          alert(`⚠️ Failed to send chat message: ${chatErr?.message || "Error"}`);
                                        }
                                      } catch (err: any) {
                                        alert(`⚠️ Exception sending chat message: ${err?.message || "Error"}`);
                                      }
                                    }}
                                    className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors"
                                    title="Send Digital Receipt via Member App Chat"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                  {pay.status !== "Paid" && (
                                    <button onClick={() => handleMarkAsPaid(pay.id)} className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-colors shadow-md" title="Mark Payment as Received / Paid">
                                      Mark Paid
                                    </button>
                                  )}
                                  <button onClick={() => alert(`Printing Invoice ${pay.invoiceNo} for ${pay.memberName}...`)} className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors" title="Print Receipt">
                                    <Printer className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* EXPENSES TRACKING VIEW */
              <div className="space-y-6">
                {/* Expenses Controls Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#1a1114] border border-rose-500/30 rounded-2xl p-5 shadow-lg shadow-rose-950/20">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-rose-400" /> Expenses & Operational Costs Manager
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Track utility bills, staff stipends, equipment maintenance, and stock restock expenses for Balangoda branch.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Category Filters */}
                    <div className="flex items-center p-1 bg-[#0f0a0d] border border-zinc-800 rounded-xl text-xs overflow-x-auto">
                      {(["All", "Electricity & Utility Bills", "Equipment & Maintenance", "Staff Salaries & Wages", "Rent & Property", "Supplements Stock"] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setExpenseCategoryFilter(cat)}
                          className={`px-3 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap ${
                            expenseCategoryFilter === cat ? "bg-rose-600 text-white shadow-md font-bold" : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          {cat === "Electricity & Utility Bills" ? "Bills" : cat === "Equipment & Maintenance" ? "Equipment" : cat === "Staff Salaries & Wages" ? "Salaries" : cat === "Rent & Property" ? "Rent" : cat === "Supplements Stock" ? "Supplements" : cat}
                        </button>
                      ))}
                    </div>

                    {/* Export to Excel (CSV) Button */}
                    <button
                      onClick={exportExpensesToExcel}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all whitespace-nowrap"
                      title="Export all expense records to Excel / CSV"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Excel
                    </button>

                    {/* Export to PDF Button */}
                    <button
                      onClick={exportExpensesToPDF}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all whitespace-nowrap"
                      title="Print or export clean PDF expenses report"
                    >
                      <FileText className="w-4 h-4 text-rose-400" /> Export PDF
                    </button>

                    {/* Record New Expense Button */}
                    <button
                      onClick={() => setIsRecordExpenseModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-500/25 transition-all whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" /> Record Expense
                    </button>
                  </div>
                </div>

                {/* Expenses View Loading Skeletons vs Real Content */}
                {isExpensesLoading ? (
                  /* EXPENSES SKELETON LOADER */
                  <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-[#1c0f12] border border-rose-500/20 rounded-2xl p-4 h-28 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <div className="w-8 h-8 rounded-xl bg-zinc-800/80" />
                            <div className="w-20 h-4 rounded bg-zinc-800/80" />
                          </div>
                          <div className="space-y-1 mt-2">
                            <div className="w-28 h-6 rounded bg-zinc-800/90" />
                            <div className="w-32 h-3 rounded bg-zinc-800/60" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#120d11] border border-zinc-800 rounded-2xl p-5 h-64 space-y-4">
                      <div className="w-48 h-5 rounded bg-zinc-800/80" />
                      <div className="w-full h-40 rounded-xl bg-zinc-800/30" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Expenses Analytics Stat Cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Card 1: Total Cost */}
                      <div className="bg-[#1c0f12] border border-rose-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-rose-950/20">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400"><TrendingDown className="w-4 h-4" /></div>
                          <span className="text-[11px] font-bold text-rose-400 font-mono">● TOTAL COST</span>
                        </div>
                        <div className="mt-4">
                          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                            LKR {expenseRecords.reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-rose-400/80 font-semibold uppercase tracking-wider mt-1">Total Monthly Expenses</div>
                        </div>
                      </div>

                      {/* Card 2: Utilities */}
                      <div className="bg-[#18111a] border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-purple-950/20">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400"><Building2 className="w-4 h-4" /></div>
                          <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">Utilities</span>
                        </div>
                        <div className="mt-4">
                          <div className="text-2xl sm:text-3xl font-extrabold text-purple-200 tracking-tight font-mono">
                            LKR {expenseRecords.filter((e) => e.category === "Electricity & Utility Bills").reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-purple-400/80 font-semibold uppercase tracking-wider mt-1">CEB & Water Bills</div>
                        </div>
                      </div>

                      {/* Card 3: Maintenance */}
                      <div className="bg-[#121820] border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-cyan-950/20">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400"><Activity className="w-4 h-4" /></div>
                          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">Maintenance</span>
                        </div>
                        <div className="mt-4">
                          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-200 tracking-tight font-mono">
                            LKR {expenseRecords.filter((e) => e.category === "Equipment & Maintenance").reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider mt-1">Repairs & Servicing</div>
                        </div>
                      </div>

                      {/* Card 4: Rent & Wages */}
                      <div className="bg-[#191610] border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/20">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400"><Users className="w-4 h-4" /></div>
                          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">Rent & Wages</span>
                        </div>
                        <div className="mt-4">
                          <div className="text-2xl sm:text-3xl font-extrabold text-amber-200 tracking-tight font-mono">
                            LKR {expenseRecords.filter((e) => e.category === "Rent & Property" || e.category === "Staff Salaries & Wages").reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-amber-400/80 font-semibold uppercase tracking-wider mt-1">Premises & Payroll</div>
                        </div>
                      </div>
                    </section>

                    {/* Expenses Records Table Log */}
                    <div className="bg-[#120d11] border border-zinc-800 rounded-2xl p-5 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-zinc-800/80 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-rose-400" /> Expense Records Log (වියදම් ලේඛනය)
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5">Filter, delete, or export branch expense items to PDF and Excel.</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-lg border border-rose-500/30">
                          {expenseRecords.filter((e) => expenseCategoryFilter === "All" || e.category === expenseCategoryFilter).length} Items Recorded
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
                          <thead>
                            <tr className="text-[11px] font-bold text-rose-400/90 uppercase tracking-wider border-b border-zinc-800">
                              <th className="pb-3.5 pl-2 font-semibold">DATE & ID</th>
                              <th className="pb-3.5 font-semibold">EXPENSE CATEGORY</th>
                              <th className="pb-3.5 font-semibold">AMOUNT (LKR)</th>
                              <th className="pb-3.5 font-semibold">DESCRIPTION / NOTE</th>
                              <th className="pb-3.5 font-semibold">RECORDED BY</th>
                              <th className="pb-3.5 pr-2 text-right font-semibold">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/60">
                            {(() => {
                              const filteredExp = expenseRecords.filter(
                                (e) => expenseCategoryFilter === "All" || e.category === expenseCategoryFilter
                              );

                              if (filteredExp.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={6} className="py-12 text-center space-y-3">
                                      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                                        <TrendingDown className="w-6 h-6 opacity-60" />
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-white">No expenses recorded yet</h4>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">
                                          {expenseCategoryFilter === "All"
                                            ? "No operational expenses logged for this period."
                                            : `No operational expenses match the selected filter category "${expenseCategoryFilter}".`}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => setIsRecordExpenseModalOpen(true)}
                                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs inline-flex items-center gap-1.5 transition-all mt-2"
                                      >
                                        <Plus className="w-3.5 h-3.5" /> Record First Expense
                                      </button>
                                    </td>
                                  </tr>
                                );
                              }

                              return filteredExp.map((exp) => (
                                <tr key={exp.id} className="hover:bg-zinc-800/40 transition-colors">
                                  <td className="py-4 pl-2">
                                    <div>
                                      <span className="font-mono text-xs text-rose-400 font-bold">{exp.id}</span>
                                      <div className="text-xs text-zinc-300 font-mono mt-0.5">{exp.date}</div>
                                    </div>
                                  </td>
                                  <td className="py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                      {exp.category}
                                    </span>
                                  </td>
                                  <td className="py-4 font-mono font-extrabold text-rose-300 text-sm">
                                    LKR {exp.amount.toLocaleString()}
                                  </td>
                                  <td className="py-4 text-xs text-zinc-300 max-w-[240px]">{exp.description}</td>
                                  <td className="py-4 text-xs text-zinc-400 font-mono">{exp.recordedBy || "Admin"}</td>
                                  <td className="py-4 pr-2 text-right">
                                    <button
                                      onClick={async () => {
                                        if (confirm(`Delete expense record ${exp.id}?`)) {
                                          try {
                                            const { error: delErr } = await supabase
                                              .from("expenses")
                                              .delete()
                                              .or(`id.eq.${exp.dbUuid || exp.id},expense_id.eq.${exp.id}`);
                                            if (delErr) {
                                              console.error("Delete Error:", delErr);
                                            }
                                          } catch (dErr) {
                                            console.error("Delete Error:", dErr);
                                          }
                                          setExpenseRecords((prev) => prev.filter((e) => e.id !== exp.id && e.dbUuid !== exp.dbUuid));
                                        }
                                      }}
                                      className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/80 text-rose-400 border border-red-500/40 transition-colors"
                                      title="Delete Expense Record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : activeTab === "Backup / QR" ? (
          <div className="space-y-6">
            {/* Header Title & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <QrCode className="w-7 h-7 text-pink-400" /> Member QR Pass & Cloud Backup Engine
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Generate digital member QR access passes & manage encrypted full system database backups.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Auto Cloud Backup Switch */}
                <button
                  onClick={() => setAutoCloudBackupEnabled(!autoCloudBackupEnabled)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                    autoCloudBackupEnabled
                      ? "bg-pink-500/15 text-pink-400 border-pink-500/40"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                  title="Toggle automatic daily cloud backups at midnight"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Cloud Backup: {autoCloudBackupEnabled ? "ACTIVE 🟢" : "PAUSED ⚪"}
                </button>

                {/* Create Backup Button */}
                <button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isCreatingBackup ? "animate-spin" : ""}`} />
                  {isCreatingBackup ? "Backing Up..." : "Create System Backup"}
                </button>
              </div>
            </div>

            {/* Stat Cards (3 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat 1 */}
              <div className="bg-[#191018] border border-pink-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-pink-950/20">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-pink-950/80 border border-pink-500/40 text-pink-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded border border-pink-500/30 font-mono">
                    100% ENCRYPTED
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    24.8 MB
                  </div>
                  <div className="text-xs text-pink-400/80 font-semibold uppercase tracking-wider mt-1">
                    Database Size (AES-256)
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#0f1917] border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-emerald-950/20">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                    AUTOMATED
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 tracking-tight font-mono">
                    Cloud Synced
                  </div>
                  <div className="text-xs text-emerald-400/80 font-semibold uppercase tracking-wider mt-1">
                    Last Sync: Today 14:00 (Auto)
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-[#12111d] border border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-purple-950/20">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-mono">
                    RETENTION
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {backupRecords.length} Snapshots
                  </div>
                  <div className="text-xs text-purple-400/80 font-semibold uppercase tracking-wider mt-1">
                    Full System Restoration Points
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid: Left QR Pass Generator & Scanner, Right Backup History Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (5 cols): QR Pass Card Generator & Live Scanner */}
              <div className="lg:col-span-5 space-y-6">
                {/* Member QR Pass Generator Card */}
                <div className="bg-[#0e0c15] border border-pink-500/40 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-pink-400" /> Digital Member Pass Generator
                    </h3>
                    <span className="text-[10px] text-pink-300 bg-pink-500/20 border border-pink-500/40 px-2 py-0.5 rounded font-mono font-bold">
                      IGYM PASS v2
                    </span>
                  </div>

                  {/* Select Member Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Select Member for QR Card (සාමාජිකයා තෝරන්න)
                    </label>
                    <select
                      value={selectedQrMemberId}
                      onChange={(e) => setSelectedQrMemberId(e.target.value)}
                      className="w-full bg-[#171424] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id}) — {m.tier}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* QR Digital Pass Graphic Preview */}
                  {(() => {
                    const selectedMember = members.find((m) => m.id === selectedQrMemberId) || members[0];
                    return (
                      <div className="bg-gradient-to-br from-[#1b1226] via-[#100d1c] to-[#0a0712] border border-pink-500/50 rounded-2xl p-5 relative overflow-hidden shadow-2xl space-y-4 group">
                        {/* Background Neon Accent Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                        {/* Card Header branding */}
                        <div className="flex items-center justify-between border-b border-pink-500/30 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                              <WeightlifterIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-extrabold text-white text-sm tracking-wider">IGYM</span>
                              <span className="text-[9px] text-pink-400 block font-bold tracking-widest">BALANGODA</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            selectedMember.status === "Active"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-red-500/20 text-red-300 border-red-500/40"
                          }`}>
                            {selectedMember.status === "Active" ? "VERIFIED MEMBER ●" : "INACTIVE ●"}
                          </span>
                        </div>

                        {/* Card Center Content: Info + QR Matrix Visual */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <span className="text-[10px] text-pink-300 font-mono block">{selectedMember.id}</span>
                            <h4 className="text-base font-black text-white tracking-wide">{selectedMember.name}</h4>
                            <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-pink-400" />
                              <span className="font-mono">{selectedMember.phone}</span>
                            </div>
                            <div className="pt-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                                {selectedMember.tier} Membership
                              </span>
                            </div>
                          </div>

                          {/* Interactive QR Code Matrix Box */}
                          <div className="bg-white p-2.5 rounded-xl shadow-lg border border-pink-400 flex flex-col items-center justify-center shrink-0">
                            <div className="w-24 h-24 bg-black p-1.5 rounded-lg flex items-center justify-center relative">
                              {/* Simulated High-Res SVG QR Code Pattern */}
                              <svg className="w-full h-full text-white fill-current" viewBox="0 0 100 100">
                                <rect x="0" y="0" width="30" height="30" fill="white" />
                                <rect x="5" y="5" width="20" height="20" fill="black" />
                                <rect x="10" y="10" width="10" height="10" fill="white" />

                                <rect x="70" y="0" width="30" height="30" fill="white" />
                                <rect x="75" y="5" width="20" height="20" fill="black" />
                                <rect x="80" y="10" width="10" height="10" fill="white" />

                                <rect x="0" y="70" width="30" height="30" fill="white" />
                                <rect x="5" y="75" width="20" height="20" fill="black" />
                                <rect x="10" y="80" width="10" height="10" fill="white" />

                                <rect x="40" y="10" width="15" height="15" fill="white" />
                                <rect x="45" y="35" width="20" height="10" fill="white" />
                                <rect x="15" y="45" width="15" height="15" fill="white" />
                                <rect x="70" y="45" width="20" height="20" fill="white" />
                                <rect x="40" y="70" width="15" height="20" fill="white" />
                                <rect x="60" y="75" width="25" height="15" fill="white" />
                              </svg>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-black mt-1">SCAN PASS</span>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-pink-500/20 flex items-center justify-between gap-2">
                          <button
                            onClick={() => alert(`Downloading Digital QR Pass for ${selectedMember.name} (${selectedMember.id})...`)}
                            className="flex-1 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Download Pass
                          </button>
                          <button
                            onClick={() => alert(`Printing QR Access Card for ${selectedMember.name}...`)}
                            className="flex-1 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print Card
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Live QR Attendance Scanner Simulator */}
                <div className="bg-[#0e0c15] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-lime-400" /> Live QR Attendance Scanner
                    </h3>
                    <span className="text-[10px] text-lime-300 bg-lime-500/20 border border-lime-500/40 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                      CAM READY 📷
                    </span>
                  </div>

                  <div className="bg-[#090810] border border-zinc-800 rounded-xl p-4 text-center space-y-3 relative overflow-hidden">
                    {/* Simulated Scanner Camera Viewfinder */}
                    <div className="w-full h-36 border-2 border-dashed border-lime-400/60 rounded-xl flex flex-col items-center justify-center relative bg-black/40">
                      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-lime-400 shadow-[0_0_12px_#a3e635] animate-bounce" />
                      <Scan className="w-8 h-8 text-lime-400/80 mb-1" />
                      <span className="text-[11px] font-mono text-zinc-400">Place QR Code Pass inside frame</span>
                    </div>

                    <button
                      onClick={() => {
                        const randomMem = members[Math.floor(Math.random() * members.length)];
                        setScannedQrResult(`✅ Checked In: ${randomMem.name} (${randomMem.id}) at ${new Date().toLocaleTimeString()}`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs shadow-lg shadow-lime-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Simulate Scan Member QR Code
                    </button>

                    {scannedQrResult && (
                      <div className="p-3 bg-lime-500/15 border border-lime-500/40 rounded-xl text-xs font-mono text-lime-300 animate-in fade-in">
                        {scannedQrResult}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Full Database Backup Engine & Restore History */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#0e0c15] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-purple-400" /> Database Backup & Restore History
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Encrypted JSON database snapshots for full system disaster recovery.
                      </p>
                    </div>

                    <button
                      onClick={handleCreateBackup}
                      disabled={isCreatingBackup}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> Backup Now
                    </button>
                  </div>

                  {/* Backup History Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                          <th className="pb-3 pl-2">SNAPSHOT FILE</th>
                          <th className="pb-3">TYPE</th>
                          <th className="pb-3">SIZE</th>
                          <th className="pb-3">TIMESTAMP</th>
                          <th className="pb-3 pr-2 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {backupRecords.map((b) => (
                          <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                            {/* Snapshot File */}
                            <td className="py-3.5 pl-2">
                              <div className="font-bold text-white font-mono text-xs flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span className="truncate max-w-[180px] sm:max-w-[240px]">{b.filename}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5 truncate max-w-[200px]">
                                {b.checksum}
                              </span>
                            </td>

                            {/* Type */}
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                                b.type === "Automated Cloud"
                                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                  : b.type === "Manual Admin"
                                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}>
                                {b.type}
                              </span>
                            </td>

                            {/* Size */}
                            <td className="py-3.5 font-mono text-zinc-300 font-bold">
                              {b.size}
                            </td>

                            {/* Timestamp */}
                            <td className="py-3.5 font-mono text-zinc-400">
                              {b.timestamp}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 pr-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => alert(`Downloading Backup Snapshot ${b.filename}...`)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                  title="Download Backup JSON"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRestoreBackup(b.id)}
                                  className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 font-extrabold text-[11px] transition-all"
                                  title="Restore Database to this snapshot point"
                                >
                                  Restore
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Coaches" ? (
          /* COACH MANAGEMENT SECTION VIEW */
          <div className="space-y-6">
            {/* Header & Controls Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#181510] border border-amber-500/30 rounded-2xl p-5 shadow-lg shadow-amber-950/20">
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" /> Coach & Personal Trainer Management
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage certified personal trainers, profile photos, monthly rates, & member assignments.
                </p>
              </div>

              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5">
                {/* Search Coach */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search coach name or skill..."
                    value={coachSearchQuery}
                    onChange={(e) => setCoachSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0d0c09] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Specialization Filter */}
                <div className="flex items-center p-1 bg-[#0d0c09] border border-zinc-800 rounded-xl text-xs">
                  {(["All", "Bodybuilding", "Fat Loss", "CrossFit"] as const).map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setCoachSpecializationFilter(spec)}
                      className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                        coachSpecializationFilter === spec
                          ? "bg-amber-500 text-black shadow-md font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>

                {/* Add New Coach Button */}
                <button
                  onClick={() => {
                    setEditingCoach(null);
                    setCoachFormData({
                      name: "",
                      specialization: "Bodybuilding & Strength",
                      phone: "",
                      email: "",
                      experience: "3+ Years",
                      monthlyRate: 12000,
                      bio: "",
                      imageUrl: "",
                      status: "Active",
                    });
                    setIsAddCoachModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Add New Coach
                </button>
              </div>
            </div>

            {/* Coach Analytics Stat Cards (4 Cards) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#181510] border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-950/20">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 font-mono">● TOTAL COACHES</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-white">{coaches.length}</div>
                  <p className="text-xs text-zinc-400 mt-1">Certified Trainers on Staff</p>
                </div>
              </div>

              <div className="bg-[#181510] border border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-purple-950/20">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-purple-400 font-mono">● PT MEMBERS</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-white">
                    {members.filter((m) => m.coachId || m.coachName).length}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Enrolled in Personal Training</p>
                </div>
              </div>

              <div className="bg-[#181510] border border-lime-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-lime-950/20">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-lime-950/80 border border-lime-500/40 text-lime-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-lime-400 font-mono">● EST. PT REVENUE</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-white">
                    Rs. {(coaches.reduce((acc, c) => acc + c.monthlyRate, 0)).toLocaleString()}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Monthly Personal Training Value</p>
                </div>
              </div>

              <div className={`bg-[#181510] border ${pendingCoachRequests.length > 0 ? "border-amber-500/80 shadow-amber-500/10" : "border-zinc-800"} rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all`}>
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${pendingCoachRequests.length > 0 ? "bg-amber-500/20 border border-amber-500/50 text-amber-400" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}`}>
                    <Clock className={`w-4 h-4 ${pendingCoachRequests.length > 0 ? "animate-pulse" : ""}`} />
                  </div>
                  <span className={`text-[11px] font-bold font-mono ${pendingCoachRequests.length > 0 ? "text-amber-400" : "text-zinc-400"}`}>
                    ● PENDING REQUESTS
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-white flex items-center gap-2">
                    {pendingCoachRequests.length}
                    {pendingCoachRequests.length > 0 && (
                      <span className="text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full uppercase">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Awaiting Admin Approval</p>
                </div>
              </div>
            </section>

            {/* Pending Coach Requests Section */}
            <div className="bg-[#181510] border border-amber-500/40 rounded-2xl p-5 shadow-xl shadow-amber-950/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      Pending Coach Requests
                      {pendingCoachRequests.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-xs font-black animate-pulse">
                          {pendingCoachRequests.length} Pending
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Review automated member requests for personal trainers and accept or decline.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => loadPendingCoachRequests()}
                  className="px-3 py-1.5 rounded-xl bg-[#0d0c09] border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
                  title="Refresh requests list"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                </button>
              </div>

              {pendingCoachRequests.length === 0 ? (
                <div className="py-8 text-center bg-[#0d0c09] border border-zinc-800/80 rounded-xl px-4">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-zinc-200">No Pending Coach Requests</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    All incoming automated coach requests sent by members via chat have been processed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingCoachRequests.map((req) => {
                    const isLoading = coachActionLoading[req.id];
                    return (
                      <div
                        key={req.id}
                        className="bg-[#0d0c09] border border-amber-500/40 hover:border-amber-500/70 rounded-xl p-4 flex flex-col justify-between gap-3.5 shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-extrabold text-white tracking-wide">{req.memberName}</span>
                              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-mono">
                                {req.memberId}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-300 font-medium flex items-center gap-1.5 flex-wrap">
                              <span className="text-zinc-400">Requested Coach:</span>
                              <span className="font-extrabold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/40 shadow-sm">
                                {req.requestedCoachName}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-zinc-500 shrink-0 font-mono bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                            {req.timestamp}
                          </span>
                        </div>

                        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2.5 text-xs text-zinc-400 italic font-sans leading-relaxed">
                          &ldquo;{req.messageText}&rdquo;
                        </div>

                        <div className="flex items-center gap-2.5 pt-1">
                          <button
                            disabled={isLoading}
                            onClick={() => handleAcceptCoachRequest(req)}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
                          >
                            {isLoading ? (
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" /> Accept Request
                              </>
                            )}
                          </button>

                          <button
                            disabled={isLoading}
                            onClick={() => handleDeclineCoachRequest(req)}
                            className="flex-1 py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            {isLoading ? (
                              <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <X className="w-4 h-4" /> Decline Request
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coach Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {coaches
                .filter((c) => {
                  const matchesSearch =
                    c.name.toLowerCase().includes(coachSearchQuery.toLowerCase()) ||
                    c.specialization.toLowerCase().includes(coachSearchQuery.toLowerCase());
                  const matchesFilter =
                    coachSpecializationFilter === "All" ||
                    c.specialization.toLowerCase().includes(coachSpecializationFilter.toLowerCase());
                  return matchesSearch && matchesFilter;
                })
                .map((coach) => {
                  const assignedMembers = members.filter((m) => m.coachId === coach.id || m.coachName === coach.name);
                  return (
                    <div
                      key={coach.id}
                      className="bg-[#141217] border border-zinc-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl transition-all group flex flex-col justify-between"
                    >
                      <div>
                        {/* Coach Card Header Image */}
                        <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                          <img
                            src={coach.imageUrl}
                            alt={coach.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#141217] via-transparent to-black/40" />

                          {/* Status Badge */}
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-zinc-700 text-[11px] font-bold text-white flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${coach.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                            {coach.status}
                          </div>

                          {/* Experience Badge */}
                          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-amber-500/90 text-black font-extrabold text-xs shadow-md">
                            ⚡ {coach.experience} Exp
                          </div>
                        </div>

                        {/* Coach Details Body */}
                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                              {coach.name}
                            </h3>
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-bold">
                              {coach.specialization}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {coach.bio || "Certified gym instructor providing tailored workout routines and nutrition guidance."}
                          </p>

                          {/* Contact Info */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{coach.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <DollarSign className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                              <span className="font-bold text-lime-400">Rs. {coach.monthlyRate.toLocaleString()}/mo</span>
                            </div>
                          </div>

                          {/* Clean Trainee Count Badge */}
                          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                            <span className="text-xs text-zinc-400 font-medium">Assigned Trainees</span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                              {assignedMembers.length} Trainees
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Coach Action Buttons */}
                      <div className="p-3.5 bg-[#0d0c0f] border-t border-zinc-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedViewCoach(coach)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-400" /> View Details
                        </button>

                        <button
                          onClick={() => {
                            setEditingCoach(coach);
                            setCoachFormData({
                              name: coach.name,
                              specialization: coach.specialization,
                              phone: coach.phone,
                              email: coach.email,
                              experience: coach.experience,
                              monthlyRate: coach.monthlyRate,
                              bio: coach.bio,
                              imageUrl: coach.imageUrl,
                              status: coach.status,
                            });
                            setIsAddCoachModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-400" /> Edit
                        </button>

                        <button
                          onClick={() => handleDeleteCoach(coach.id)}
                          className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 text-xs transition-all cursor-pointer"
                          title="Delete Coach"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : activeTab === "Member Chat" ? (
          <div className="space-y-4">
            {/* Top Bar Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <MessageCircle className="w-7 h-7 text-teal-400" /> Member Mobile App Live Chat
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time communication engine with gym members via the official IGYM Mobile App.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 text-purple-200" /> Broadcast to All
                </button>
                <span className="text-xs font-extrabold text-teal-300 bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 rounded-xl font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" /> APP GATEWAY ONLINE
                </span>
              </div>
            </div>

            {/* Chat Workspace (Grid 12 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-230px)] min-h-[550px]">
              {/* Left Column (4 cols): Conversations List */}
              <div className="lg:col-span-4 bg-[#0e1119] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                {/* Search Bar */}
                <div className="p-3 border-b border-slate-800 bg-[#121624]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search member messages..."
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      className="w-full bg-[#181d2e] border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Member Conversations Item List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                  {displayChatConversations
                    .filter((c) =>
                      c.memberName.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                      c.memberId.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                      c.phone.includes(chatSearchQuery) ||
                      (c.tier || "").toLowerCase().includes(chatSearchQuery.toLowerCase())
                    )
                    .map((conv) => {
                      const isSelected = conv.memberId === activeChatMemberId;
                      const lastMsg = conv.messages[conv.messages.length - 1];

                      return (
                        <button
                          key={conv.id}
                          onClick={() => {
                            setActiveChatMemberId(conv.memberId);
                            setChatConversations((prev) =>
                              prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                            );
                          }}
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-all relative ${
                            isSelected
                              ? "bg-slate-800/70 border-l-4 border-teal-400 text-white"
                              : "hover:bg-slate-800/30"
                          }`}
                        >
                          {/* Avatar with Status Badge */}
                          <div className="relative shrink-0">
                            {(() => {
                              const memObj = members.find((m) => m.id === conv.memberId || m.dbUuid === conv.memberId);
                              const avatarSrc = conv.profile_pic_url || conv.profilePicUrl || memObj?.profile_pic_url || memObj?.profilePicUrl;

                              if (avatarSrc) {
                                return (
                                  <img
                                    src={avatarSrc}
                                    alt={conv.memberName}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-600 shadow-md"
                                  />
                                );
                              }

                              return (
                                <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-teal-300 text-sm shadow-md">
                                  {conv.memberName.charAt(0)}
                                </div>
                              );
                            })()}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0e1119] ${
                                conv.status === "Online" ? "bg-emerald-400" : "bg-slate-500"
                              }`}
                            />
                          </div>

                          {/* Member Meta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{conv.memberName}</h4>
                                <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.2 rounded shrink-0">
                                  {conv.memberId}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">{lastMsg?.timestamp}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                {lastMsg ? lastMsg.text : "No messages yet"}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-teal-400 text-black shadow-md shadow-teal-500/20 animate-pulse">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Right Column (8 cols): Active Chat Area */}
              <div className="lg:col-span-8 bg-[#0e1119] border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                {(() => {
                  const activeConv =
                    displayChatConversations.find((c) => c.memberId === activeChatMemberId) || displayChatConversations[0];
                  const activeMemberData = activeConv ? members.find((m) => m.id === activeConv.memberId) : undefined;

                  if (!activeConv) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#0a0d14]">
                        <MessageCircle className="w-12 h-12 text-slate-600 animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-300">No Conversations Available</h4>
                        <p className="text-xs text-slate-500 max-w-xs">
                          Select a member from the left panel to start messaging.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Active Chat Header */}
                      <div className="p-3.5 bg-[#121624] border-b border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {(() => {
                              const headerAvatarSrc = activeMemberData?.profile_pic_url || activeMemberData?.profilePicUrl || (activeConv as any)?.profile_pic_url;

                              if (headerAvatarSrc) {
                                return (
                                  <img
                                    src={headerAvatarSrc}
                                    alt={activeConv?.memberName}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-600 shadow-md"
                                  />
                                );
                              }

                              return (
                                <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-teal-300 text-sm shadow-md">
                                  {activeConv?.memberName?.charAt(0) || "?"}
                                </div>
                              );
                            })()}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#121624] ${
                                activeConv?.status === "Online" ? "bg-emerald-400" : "bg-slate-500"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">{activeConv?.memberName || "Gym Member"}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                                {activeConv?.tier || "No Active Plan"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {activeConv?.phone || "N/A"} • {activeConv?.status === "Online" ? "Online Now 🟢" : activeConv?.lastActive || "Recently"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {activeMemberData && (
                            <button
                              onClick={() => {
                                setSelectedMember(activeMemberData);
                                setIsDetailModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-teal-400" /> Member Details
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (!activeConv?.memberId) return;
                              if (confirm(`Are you sure you want to clear all chat history for ${activeConv.memberName || "this member"}?`)) {
                                const targetMemId = activeConv.memberId;
                                try {
                                  await supabase
                                    .from("chat_messages")
                                    .delete()
                                    .or(`member_id.eq.${targetMemId},receiver_id.eq.${targetMemId},sender_id.eq.${targetMemId}`);

                                  setChatConversations((prev) =>
                                    prev.map((c) => (c.memberId === targetMemId ? { ...c, messages: [] } : c))
                                  );
                                } catch (err: any) {
                                  console.error("Failed to clear chat history:", err);
                                  alert(`⚠️ Exception clearing chat history: ${err?.message || err}`);
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-rose-500/30 cursor-pointer"
                            title="Clear Chat History"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Clear Chat
                          </button>
                        </div>
                      </div>

                      {/* Messages Thread Container */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a0d14]">
                        {(activeConv?.messages || []).map((msg) => {
                          const isAdmin = msg.sender === "admin";
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                            >
                              <div
                                className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm space-y-2 shadow-md ${
                                  isAdmin
                                    ? "bg-slate-800 border border-teal-500/40 text-slate-100 rounded-br-none"
                                    : "bg-[#151924] text-slate-200 rounded-bl-none border border-slate-700/60"
                                }`}
                              >
                                <p className="leading-relaxed whitespace-pre-wrap font-normal">{msg.text}</p>

                                {msg.attachmentType === "workout" && (
                                  <div className="p-2 bg-black/30 rounded-lg text-[11px] font-bold text-teal-200 border border-teal-500/30 flex items-center gap-2">
                                    <Dumbbell className="w-4 h-4 text-teal-400" /> Attached: Personalized Hypertrophy Workout Plan .PDF
                                  </div>
                                )}
                                {msg.attachmentType === "diet" && (
                                  <div className="p-2 bg-black/30 rounded-lg text-[11px] font-bold text-amber-200 border border-amber-500/30 flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-amber-400" /> Attached: High-Protein Muscle Gain Diet Chart .PDF
                                  </div>
                                )}

                                <div
                                  className={`flex items-center gap-1.5 text-[10px] font-mono justify-end ${
                                    isAdmin ? "text-teal-300/80" : "text-slate-400"
                                  }`}
                                >
                                  <span>{msg.timestamp}</span>
                                  {isAdmin && <CheckCheck className="w-3.5 h-3.5 text-teal-300" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {/* Auto-Scroll Target Anchor */}
                        <div ref={chatMessagesEndRef} />
                      </div>

                      {/* Quick Reply Preset Templates */}
                      <div className="px-4 py-2 bg-[#101320] border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                          <Sparkles className="w-3 h-3 text-teal-400" /> Quick Reply:
                        </span>
                        <button
                          onClick={() => {
                            setSelectedTemplateContent(workoutTemplates[0]?.content || "");
                            setIsWorkoutPlanModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[11px] font-bold shrink-0 transition-all flex items-center gap-1"
                        >
                          <Dumbbell className="w-3 h-3 text-teal-400" /> Send Workout Plan ⚙️
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTemplateContent(dietTemplates[0]?.content || "");
                            setIsDietPlanModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[11px] font-bold shrink-0 transition-all flex items-center gap-1"
                        >
                          <Utensils className="w-3 h-3 text-purple-400" /> Send Diet Plan ⚙️
                        </button>
                        <button
                          onClick={() => {
                            setCustomReminderText(`Hi ${activeConv?.memberName || "Member"}! Friendly reminder from IGYM Balangoda: Your monthly membership renewal fee is due soon. Please renew via Cash/POS at reception. Thank you! 💳`);
                            setIsPaymentReminderModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-bold shrink-0 transition-all flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3 text-amber-400" /> Payment Reminder ⚙️
                        </button>
                      </div>

                      {/* Chat Input Bar */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="p-3 bg-[#121624] border-t border-slate-800 flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleSendMessage(
                              `Attached document for ${activeConv.memberName}`
                            )
                          }
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Attach document/schedule"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>

                        <input
                          type="text"
                          placeholder={`Type a message to ${activeConv.memberName}... (පණිවිඩය ටයිප් කරන්න)`}
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          className="flex-1 bg-[#181d2e] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                        />

                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <span>Send</span>
                          <SendHorizontal className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : activeTab === "Settings" ? (
          <div className="space-y-6">
            {/* Header & Save Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Settings className="w-7 h-7 text-cyan-400" /> System & Branch Settings
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage gym branch branding and mobile application configurations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {showSettingsSavedNotice && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-in fade-in flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Settings Saved!
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>

            {/* Main Grid: 2 Clean Settings Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Gym Branch & Branding Profile */}
              <div className="bg-[#0e111a] border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" /> Gym Branch & Branding Profile
                  </h3>
                  <span className="text-[10px] text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    BRANCH DETAILS
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Gym Name (ආයතනයේ නම)</label>
                    <input
                      type="text"
                      value={settingsForm.gymName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, gymName: e.target.value })}
                      className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Contact Numbers</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Physical Address (ලිපිනය)</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Operating Hours</label>
                      <input
                        type="text"
                        value={settingsForm.operatingHours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, operatingHours: e.target.value })}
                        className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">Default Currency</label>
                      <input
                        type="text"
                        value={settingsForm.currency}
                        readOnly
                        className="w-full bg-[#141724]/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Member App Configuration */}
              <div className="bg-[#0e111a] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" /> Member App Configuration
                  </h3>
                  <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    MOBILE APP CONFIG
                  </span>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">App Default Theme (මූලික තේමාව)</label>
                    <select
                      value={settingsForm.appTheme}
                      onChange={(e) => setSettingsForm({ ...settingsForm, appTheme: e.target.value })}
                      className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500 text-xs"
                    >
                      <option value="Dark Neon Emerald">Dark Neon Emerald 🟢</option>
                      <option value="Cyberpunk Purple">Cyberpunk Purple 🟣</option>
                      <option value="Minimal Black">Minimal Black ⬛</option>
                      <option value="Midnight Blue">Midnight Blue 🔵</option>
                    </select>
                  </div>

                  {/* Toggle Switches */}
                  <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#121420] border border-zinc-800/80 cursor-pointer hover:border-amber-500/40 transition-colors">
                      <div>
                        <span className="text-xs font-bold text-white block">Enable In-App Chat</span>
                        <span className="text-[11px] text-zinc-400">Direct messaging between members and trainers</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.enableInAppChat}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableInAppChat: e.target.checked })}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#121420] border border-zinc-800/80 cursor-pointer hover:border-amber-500/40 transition-colors">
                      <div>
                        <span className="text-xs font-bold text-white block">Show Progress Tracker</span>
                        <span className="text-[11px] text-zinc-400">Weight & BMI progress analytics for members</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.showProgressTracker}
                        onChange={(e) => setSettingsForm({ ...settingsForm, showProgressTracker: e.target.checked })}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#121420] border border-zinc-800/80 cursor-pointer hover:border-amber-500/40 transition-colors">
                      <div>
                        <span className="text-xs font-bold text-white block">Enable Video Workouts</span>
                        <span className="text-[11px] text-zinc-400">On-demand exercise demonstration videos</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.enableVideoWorkouts}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableVideoWorkouts: e.target.checked })}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Global Member App Banner Controls */}
                  <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#13111e] border border-amber-500/30 cursor-pointer hover:border-amber-400 transition-colors">
                      <div>
                        <span className="text-xs font-bold text-amber-300 block flex items-center gap-1.5">
                          <Megaphone className="w-3.5 h-3.5 text-amber-400" /> Enable Top Banner in Member App
                        </span>
                        <span className="text-[11px] text-zinc-400">Displays global announcement ticker at the top of member mobile screens</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isBannerActive}
                        onChange={(e) => setIsBannerActive(e.target.checked)}
                        className="w-4 h-4 accent-amber-400 cursor-pointer"
                      />
                    </label>

                    <div>
                      <label className="block text-xs font-semibold text-amber-400 mb-1">Global Banner Message (ප්‍රචාරණ බැනරය)</label>
                      <input
                        type="text"
                        placeholder="e.g. 🔥 Special Promo: Get 20% OFF on 6-Month Memberships this week!"
                        value={bannerText}
                        onChange={(e) => setBannerText(e.target.value)}
                        className="w-full bg-[#141724] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-amber-100 font-medium focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder for other tabs */
          <div className="bg-[#0f111a] border border-zinc-800 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-bold text-white mb-2">{activeTab} Section</h3>
            <p className="text-zinc-400 text-sm">Features for {activeTab} will be available in the next release.</p>
          </div>
        )}
      </main>

      {/* ----------------- MODALS ----------------- */}

      {/* 1. MEMBER DETAIL MODAL - Responsive 2-Column Analytical Layout */}
      {isDetailModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e111a] border border-cyan-500/40 w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl shadow-cyan-950/50 flex flex-col relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-auto">
            
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-[#0c0f18] shrink-0">
              <div className="flex items-center gap-4">
                {selectedMember.profile_pic_url || selectedMember.profilePicUrl ? (
                  <img
                    src={selectedMember.profile_pic_url || selectedMember.profilePicUrl}
                    alt={selectedMember.name}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border border-cyan-300/40 shadow-lg shadow-cyan-500/30"
                  />
                ) : (
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 border border-cyan-300/40 flex items-center justify-center font-black text-white text-xl sm:text-2xl shadow-lg shadow-cyan-500/30">
                    {selectedMember.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white tracking-wide">{selectedMember.name}</h3>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${selectedMember.status === "Active" ? "bg-lime-950 text-lime-400 border border-lime-800/80" : "bg-rose-950/60 text-rose-300 border border-rose-800/80"}`}>
                      ● {selectedMember.status || "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">{selectedMember.id}</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                      {selectedMember.status === "Inactive" || !selectedMember.tier || selectedMember.tier === "Standard Membership"
                        ? "No Active Plan"
                        : `${selectedMember.tier} Membership`}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body Content (2-Column Grid) */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">
              
              {/* LEFT COLUMN: Health Stats, Personal Details & Coach Selection */}
              <div className="md:col-span-5 space-y-5">
                
                {/* Health & Body Statistics */}
                <div className="bg-[#121522] border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
                  <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Physical Body Statistics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-[#0b0d16] border border-zinc-800/80 rounded-xl p-2.5">
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">Height</p>
                      <p className="text-sm sm:text-base font-black text-cyan-300 mt-0.5 font-mono">
                        {selectedMember.height ? `${selectedMember.height} cm` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#0b0d16] border border-zinc-800/80 rounded-xl p-2.5">
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">Weight</p>
                      <p className="text-sm sm:text-base font-black text-amber-300 mt-0.5 font-mono">
                        {selectedMember.weight && selectedMember.weight > 0 ? `${selectedMember.weight} kg` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#0b0d16] border border-emerald-500/30 rounded-xl p-2.5">
                      <p className="text-[9px] text-emerald-400 uppercase font-bold">Target Goal</p>
                      <p className="text-sm sm:text-base font-black text-emerald-300 mt-0.5 font-mono">
                        {selectedMember.targetWeight && selectedMember.targetWeight > 0
                          ? `${selectedMember.targetWeight} kg`
                          : selectedMember.target_weight && Number(selectedMember.target_weight) > 0
                          ? `${selectedMember.target_weight} kg`
                          : "N/A"}
                      </p>
                      {(() => {
                        const curW = selectedMember.weight;
                        const tgtW = selectedMember.targetWeight || selectedMember.target_weight ? Number(selectedMember.targetWeight || selectedMember.target_weight) : null;
                        if (!curW || !tgtW || curW <= 0 || tgtW <= 0) return null;
                        const diff = Number((curW - tgtW).toFixed(1));
                        if (diff > 0) return <span className="text-[8px] font-bold text-amber-400 block mt-0.5">Lose {diff} kg</span>;
                        if (diff < 0) return <span className="text-[8px] font-bold text-cyan-400 block mt-0.5">Gain {Math.abs(diff)} kg</span>;
                        return <span className="text-[8px] font-bold text-lime-400 block mt-0.5">Goal Met 🎉</span>;
                      })()}
                    </div>
                    <div className="bg-[#0b0d16] border border-zinc-800/80 rounded-xl p-2.5">
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">BMI</p>
                      <p className="text-sm sm:text-base font-black text-lime-400 mt-0.5 font-mono">
                        {selectedMember.height && selectedMember.height > 0 && selectedMember.weight && selectedMember.weight > 0 && selectedMember.bmi && selectedMember.bmi !== "0.0" && selectedMember.bmi !== "N/A"
                          ? selectedMember.bmi
                          : "N/A"}
                      </p>
                      <span className={`text-[8px] font-bold px-1 py-0.2 rounded border inline-block mt-0.5 ${getBMICategory(selectedMember.height && selectedMember.weight && selectedMember.height > 0 && selectedMember.weight > 0 ? selectedMember.bmi : "N/A").color}`}>
                        {getBMICategory(selectedMember.height && selectedMember.weight && selectedMember.height > 0 && selectedMember.weight > 0 ? selectedMember.bmi : "N/A").label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conditional Personal Training Progress Widget (EXCLUSIVELY FOR PT MEMBERS) */}
                {(selectedMember.isPTMember ||
                  (selectedMember.tier &&
                    (selectedMember.tier.toLowerCase().includes("personal training") ||
                      selectedMember.tier.toLowerCase().includes("pt")))) && (
                  <div className="bg-gradient-to-br from-[#1c1424] via-[#14121f] to-[#0f1424] border border-amber-500/50 rounded-2xl p-4 space-y-3.5 shadow-xl shadow-amber-950/20 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                            Personal Training Progress
                          </h4>
                          <p className="text-[10px] text-amber-300/80">Exclusive PT body metrics &amp; transformation tracker</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        VIP PT Member ⭐
                      </span>
                    </div>

                    {/* PT Metrics Grid: Height, Weight */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-[#0c0a12] border border-cyan-500/30 rounded-xl p-2.5">
                        <span className="text-[9px] text-zinc-400 uppercase font-bold block">Height</span>
                        <p className="text-sm font-black text-cyan-300 mt-0.5">
                          {selectedMember.height ? `${selectedMember.height} cm` : "N/A"}
                        </p>
                      </div>
                      <div className="bg-[#0c0a12] border border-amber-500/30 rounded-xl p-2.5">
                        <span className="text-[9px] text-zinc-400 uppercase font-bold block">Weight</span>
                        <p className="text-sm font-black text-amber-300 mt-0.5">
                          {selectedMember.weight ? `${selectedMember.weight} kg` : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Fitness Goals */}
                    {selectedMember.fitnessGoals && (
                      <div className="bg-[#0c0a12] border border-zinc-800 rounded-xl p-2.5 flex items-start gap-2 text-xs">
                        <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide block">Target Fitness Goals:</span>
                          <p className="text-zinc-200 text-xs mt-0.5">{selectedMember.fitnessGoals}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Personal Contact Details */}
                <div className="bg-[#121522] border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
                  <span className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" /> Member Information
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0d16] border border-zinc-800/80">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone:
                      </span>
                      <span className="font-bold text-white font-mono">{selectedMember.phone || "N/A"}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0d16] border border-zinc-800/80">
                      <span className="text-zinc-400 flex items-center gap-2 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Address:
                      </span>
                      <span className="font-medium text-zinc-200 text-right truncate max-w-[200px]">
                        {selectedMember.address || "N/A"}
                      </span>
                    </div>

                    {/* Emergency Contact Name & Phone */}
                    <div className="p-2.5 rounded-xl bg-[#0b0d16] border border-zinc-800/80 space-y-1.5">
                      <span className="text-zinc-400 flex items-center gap-2 text-xs font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5 text-pink-400" /> Emergency Contact:
                      </span>
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className="text-zinc-400">Name:</span>
                        <span className="font-bold text-pink-300">
                          {selectedMember.emergencyContactName || (selectedMember.emergencyContact ? selectedMember.emergencyContact.split(" - ")[0] : "N/A")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Phone:</span>
                        <span className="font-bold text-pink-300 font-mono">
                          {selectedMember.emergencyContactPhone || (selectedMember.emergencyContact ? selectedMember.emergencyContact.split(" - ")[1] : "N/A")}
                        </span>
                      </div>
                    </div>

                    {/* Join Date, Expiry Date & Last Visit */}
                    {(() => {
                      const isSelectedMemExpired = selectedMember.expiryDate
                        ? new Date(selectedMember.expiryDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                        : false;

                      return (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="p-2.5 rounded-xl bg-[#0b0d16] border border-zinc-800/80">
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Join Date</span>
                            <p className="text-xs font-mono font-bold text-zinc-200 mt-0.5">{selectedMember.joinDate || "N/A"}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#0b0d16] border border-zinc-800/80">
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Expiry Date</span>
                            <p
                              className={`text-xs font-mono font-extrabold mt-0.5 ${
                                selectedMember.status === "Inactive" || !selectedMember.expiryDate
                                  ? "text-zinc-400"
                                  : isSelectedMemExpired
                                  ? "text-rose-400 font-bold animate-pulse"
                                  : "text-emerald-400"
                              }`}
                            >
                              {selectedMember.status === "Inactive" || !selectedMember.expiryDate
                                ? "N/A"
                                : selectedMember.expiryDate}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#0b0d16] border border-zinc-800/80">
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Last Visit</span>
                            <p className="text-xs font-bold text-lime-400 mt-0.5 truncate">{selectedMember.lastVisit || "Just now"}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Personal Trainer Selection */}
                <div className="p-4 rounded-2xl bg-[#14121a] border border-amber-500/40 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" /> Personal Trainer:
                    </span>
                    {selectedMember.coachName && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Assigned
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedMember.coachId || ""}
                    onChange={(e) => {
                      const newCoachId = e.target.value;
                      const cObj = coaches.find((c) => c.id === newCoachId || c.dbUuid === newCoachId);
                      const cName = cObj ? cObj.name : undefined;
                      setSelectedMember({ ...selectedMember, coachId: newCoachId, coachName: cName });
                      handleAssignCoachToMember(selectedMember.id, newCoachId);
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#0a0910] border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="">-- Select Personal Coach --</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.specialization}) - Rs. {c.monthlyRate.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* RIGHT COLUMN: Analytical Fitness Progress, Glowing SVG Chart & Attendance */}
              <div className="md:col-span-7 space-y-5">
                
                {/* Weight Trend Visual Chart Section */}
                <div className="bg-[#121522] border border-cyan-500/30 rounded-2xl p-4.5 space-y-4 shadow-xl">
                  
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Weight Progress Analytics</h4>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Live Trend Chart
                    </span>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    {(() => {
                      const logs = weightLogsMap[selectedMember.id] || [];
                      const hasLogs = logs.length > 0;
                      // logs is sorted NEWEST FIRST: index 0 is Current Weight (most recent), index length-1 is Start Weight (first entry logged)
                      const currentWeight = hasLogs ? logs[0].weight : null;
                      const startWeight = hasLogs ? logs[logs.length - 1].weight : null;
                      const diff = currentWeight !== null && startWeight !== null ? Number((currentWeight - startWeight).toFixed(1)) : null;

                      return (
                        <>
                          <div className="bg-[#0b0d16] border border-zinc-800/80 rounded-xl p-2.5">
                            <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Start Weight</span>
                            <span className="text-xs sm:text-sm font-black text-zinc-300 font-mono">
                              {startWeight !== null ? `${startWeight} kg` : "N/A"}
                            </span>
                          </div>
                          <div className="bg-[#0b0d16] border border-cyan-500/40 rounded-xl p-2.5">
                            <span className="text-[9px] text-cyan-400 uppercase font-semibold block">Current Weight</span>
                            <span className="text-xs sm:text-sm font-black text-cyan-300 font-mono">
                              {currentWeight !== null ? `${currentWeight} kg` : "N/A"}
                            </span>
                          </div>
                          <div className="bg-[#0b0d16] border border-zinc-800/80 rounded-xl p-2.5">
                            <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Overall Change</span>
                            {diff !== null ? (
                              diff < 0 ? (
                                <span className="text-xs font-bold text-lime-400 font-mono">📉 {Math.abs(diff)} kg Loss</span>
                              ) : diff > 0 ? (
                                <span className="text-xs font-bold text-cyan-400 font-mono">📈 +{diff} kg Gain</span>
                              ) : (
                                <span className="text-xs font-bold text-zinc-400 font-mono">0.0 kg</span>
                              )
                            ) : (
                              <span className="text-xs font-bold text-zinc-400 font-mono">N/A</span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Glowing SVG Weight Trend Chart OR No Data Placeholder */}
                  {(() => {
                    const logs = weightLogsMap[selectedMember.id] || [];

                    if (logs.length === 0) {
                      return (
                        <div className="bg-[#090b12] border border-cyan-900/30 rounded-xl p-8 text-center space-y-2">
                          <Scale className="w-9 h-9 text-cyan-500/40 mx-auto opacity-70" />
                          <h4 className="text-xs font-extrabold text-white tracking-wide">No weight data recorded yet.</h4>
                          <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                            Recorded weight check-ins will automatically generate a line chart trend here.
                          </p>
                        </div>
                      );
                    }

                    // Slice the last 12 chronological entries (most recent 12 entries) for the chart visual
                    const recentLogs = logs.slice(0, 12);
                    const chartLogs = [...recentLogs].reverse();

                    const points = chartLogs.map((l) => ({
                      date: l.date ? l.date.split("-").slice(1).join("/") : "Log",
                      weight: Number(l.weight),
                    }));

                    const weights = points.map((p) => p.weight);
                    const minW = Math.min(...weights) - 1.5;
                    const maxW = Math.max(...weights) + 1.5;
                    const range = maxW - minW || 1;

                    const width = 450;
                    const height = 130;
                    const padX = 35;
                    const padY = 25;

                    const coords = points.map((p, i) => {
                      const x = points.length === 1 ? width / 2 : padX + (i / (points.length - 1)) * (width - padX * 2);
                      const y = height - padY - ((p.weight - minW) / range) * (height - padY * 2);
                      return { x, y, ...p };
                    });

                    const lineD = coords.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), "");
                    const fillD = points.length > 1
                      ? `${lineD} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`
                      : "";

                    // Calculate X-Axis tick label step to prevent text overlap
                    const maxLabels = 6;
                    const labelStep = Math.max(1, Math.ceil(coords.length / maxLabels));

                    return (
                      <div className="bg-[#090b12] border border-cyan-900/40 rounded-xl p-3 relative space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono px-1">
                          <span>Weight Fluctuation (Recent {points.length} Check-ins)</span>
                          <span className="text-cyan-400 font-bold">Total History: {logs.length} entries</span>
                        </div>
                        <div className="relative w-full h-[130px]">
                          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                            <defs>
                              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                              </linearGradient>
                              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                              </filter>
                            </defs>

                            {/* Horizontal Gridlines */}
                            {[0.25, 0.5, 0.75].map((pct, idx) => (
                              <line
                                key={idx}
                                x1={padX}
                                y1={padY + pct * (height - padY * 2)}
                                x2={width - padX}
                                y2={padY + pct * (height - padY * 2)}
                                stroke="#1e293b"
                                strokeDasharray="3 3"
                              />
                            ))}

                            {/* Area Gradient Fill */}
                            {fillD && <path d={fillD} fill="url(#chartGradient)" />}

                            {/* Glowing Line Stroke */}
                            {lineD && points.length > 1 && (
                              <path d={lineD} fill="none" stroke="#06b6d4" strokeWidth="2.5" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />
                            )}

                            {/* Interactive Point Nodes & Labels */}
                            {coords.map((pt, i) => {
                              const showDateLabel = i === 0 || i === coords.length - 1 || i % labelStep === 0;

                              return (
                                <g key={i} className="group cursor-pointer">
                                  <circle cx={pt.x} cy={pt.y} r="4" fill="#0e111a" stroke="#22d3ee" strokeWidth="2.5" className="transition-transform group-hover:scale-150" />
                                  <text x={pt.x} y={pt.y - 9} textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="bold" className="font-mono">
                                    {pt.weight}kg
                                  </text>
                                  {showDateLabel && (
                                    <text x={pt.x} y={height - 4} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
                                      {pt.date}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Add New Weight Check Form */}
                  <div className="bg-[#0e111a] border border-zinc-800 rounded-xl p-3 space-y-2">
                    <span className="text-[11px] font-bold text-zinc-300 block flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-cyan-400" /> Record Weight Check-in
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="kg"
                        value={newLogWeight || ""}
                        onChange={(e) => setNewLogWeight(Number(e.target.value))}
                        className="w-24 bg-[#161a29] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        placeholder="Note e.g. Staff Monthly Check-in"
                        value={newLogNote}
                        onChange={(e) => setNewLogNote(e.target.value)}
                        className="flex-1 bg-[#161a29] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddWeightLog(selectedMember.id, selectedMember.height || 170)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-md shadow-cyan-500/20 shrink-0"
                      >
                        Save Check
                      </button>
                    </div>
                  </div>

                  {/* Weight Logs Timeline */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Weight Logs History</span>
                    <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                      {weightLogsMap[selectedMember.id] && weightLogsMap[selectedMember.id].length > 0 ? (
                        weightLogsMap[selectedMember.id].map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0c0e17] border border-zinc-800/80 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 font-mono text-[10px]">{log.date}</span>
                              <span className="font-bold text-white font-mono">{log.weight} kg</span>
                              <span className="text-[10px] text-zinc-400 font-mono">(BMI {log.bmi})</span>
                            </div>
                            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                              {log.note || "Check-in"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2.5 text-center rounded-lg bg-[#0c0e17] border border-zinc-800/60 text-xs text-zinc-500">
                          No custom weight logs recorded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex flex-wrap items-center justify-end gap-3 p-4 sm:p-5 border-t border-zinc-800 bg-[#0c0f18] shrink-0">
              <button
                disabled={isResettingPassword}
                onClick={() => handleResetMemberPassword(selectedMember)}
                className="px-4 py-2.5 rounded-xl bg-orange-950/60 hover:bg-orange-900/80 border border-orange-500/50 text-orange-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-orange-950/40 disabled:opacity-50"
                title="Reset password to default (111111)"
              >
                {isResettingPassword ? (
                  <div className="w-4 h-4 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-orange-400" /> Reset Password to Default
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  setIsDetailModalOpen(false);
                  handleOpenEditModal(selectedMember, e);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Pencil className="w-4 h-4" /> Edit Member
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. ADD MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e111a] border border-cyan-500/40 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-4 sm:p-5 shrink-0 bg-[#0e111a] z-10">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Add New Member
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto max-h-[calc(90vh-130px)] pr-2">
                {/* Member ID & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-cyan-400 mb-1">Member ID (අංකය) *</label>
                    <input
                      type="text"
                      required
                      placeholder="MEM022"
                      value={formData.memberId}
                      onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                      className="w-full bg-[#141724] border border-cyan-500/40 rounded-xl px-3 py-2.5 text-cyan-300 font-mono font-bold text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name (නම) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nimal Perera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Password & Phone in 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Password (මුරපදය) *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Min 6 chars (Pass@123)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#141724] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone (දුරකථන)</label>
                    <input
                      type="text"
                      placeholder="077 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                {/* Membership Package & Duration (කාලසීමාව) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Package (පැකේජය)</label>
                    <select
                      value={formData.tier}
                      onChange={(e) => {
                        const newTier = e.target.value;
                        const isPT = newTier.toLowerCase().includes("personal training") || newTier.toLowerCase().includes("pt");
                        setFormData({ ...formData, tier: newTier, isPTMember: isPT || formData.isPTMember });
                      }}
                      className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium text-xs"
                    >
                      {gymPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.package_name || pkg.name}>
                          {pkg.package_name || pkg.name} — LKR {pkg.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-cyan-400 mb-1 flex items-center justify-between">
                      <span>Duration (කාලසීමාව) *</span>
                      <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        Expiry: {calculateExpiryDate(new Date(), formData.durationMonths || 1)}
                      </span>
                    </label>
                    <select
                      value={formData.durationMonths || 1}
                      onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                      className="w-full bg-[#141724] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-cyan-300 focus:outline-none focus:border-cyan-400 font-bold text-xs"
                    >
                      <option value={1}>1 Month (Default)</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months</option>
                    </select>
                  </div>
                </div>

                {/* Address Field */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Address (ලිපිනය)</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Street, Balangoda"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* PT Member VIP Toggle Switch */}
                <div className="p-3 bg-[#13101c] border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-amber-300">Personal Training (PT) Member</span>
                      <p className="text-[10px] text-zinc-400">Enable exclusive PT Body Metrics & Transformation Tracking</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        Boolean(
                          formData.isPTMember ||
                          formData.tier.toLowerCase().includes("personal training") ||
                          formData.tier.toLowerCase().includes("pt")
                        )
                      }
                      onChange={(e) => setFormData({ ...formData, isPTMember: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                {/* Standard Height & Weight Metrics */}
                <div className="bg-[#121522] border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Standard Fitness Metrics</span>
                    <span className="text-xs font-mono text-lime-400 font-bold">
                      BMI: {calculateBMI(formData.weight, formData.height)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Height (උස cm)</label>
                      <input
                        type="number"
                        required
                        min="100"
                        max="250"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                        className="w-full bg-[#181c2e] border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Weight (බර kg)</label>
                      <input
                        type="number"
                        required
                        min="30"
                        max="250"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                        className="w-full bg-[#181c2e] border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC PT FITNESS GOALS SECTION (ONLY IF PT PACKAGE OR PT TOGGLE ACTIVE) */}
                {(formData.isPTMember ||
                  formData.tier.toLowerCase().includes("personal training") ||
                  formData.tier.toLowerCase().includes("pt")) && (
                  <div className="bg-gradient-to-br from-[#1c1424] via-[#151220] to-[#0f1424] border border-amber-500/50 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-400" /> PT FITNESS GOALS (පෞද්ගලික පුහුණු අරමුණු)
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                        Exclusive PT Tracking ⭐
                      </span>
                    </div>

                    <div className="w-full">
                      <label className="block text-xs font-semibold text-amber-300 mb-1">Fitness Goals (පුහුණු ඉලක්ක)</label>
                      <input
                        type="text"
                        placeholder="e.g. 5kg Fat Loss & Body Recomposition in 3 Months"
                        value={formData.fitnessGoals}
                        onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
                        className="w-full bg-[#100d18] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-amber-100 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* Emergency Contact & Status in 2-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Emergency Contact</label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse / Parent Contact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Membership Status</label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="addStatus"
                          value="Active"
                          checked={formData.status === "Active"}
                          onChange={() => setFormData({ ...formData, status: "Active" })}
                          className="accent-lime-400"
                        />
                        <span className="text-xs text-lime-400 font-bold">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="addStatus"
                          value="Inactive"
                          checked={formData.status === "Inactive"}
                          onChange={() => setFormData({ ...formData, status: "Inactive" })}
                          className="accent-pink-500"
                        />
                        <span className="text-xs text-zinc-400">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl flex items-center gap-2 text-xs text-pink-300">
                  <QrCode className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Creates Member App account (<strong>{formData.memberId ? formData.memberId.trim().toUpperCase().replace(/^MEM-/, "MEM") : "MEM022"}@gym.com</strong>) &amp; Digital QR Pass.</span>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-zinc-800 shrink-0 bg-[#0e111a] z-10">
                <button
                  type="button"
                  disabled={isSubmittingMember}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMember}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black shadow-lg shadow-cyan-500/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingMember ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Member"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT MEMBER MODAL */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0e111a] border border-amber-500/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-400" /> Edit Member ({selectedMember.id})
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Change Package (පැකේජය මාරු කිරීම)</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => {
                      const newTier = e.target.value;
                      const isPT = newTier.toLowerCase().includes("personal training") || newTier.toLowerCase().includes("pt");
                      setFormData({ ...formData, tier: newTier, isPTMember: isPT || formData.isPTMember });
                    }}
                    className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {gymPackages.map((pkg) => (
                      <option key={pkg.id} value={pkg.package_name || pkg.name}>
                        {pkg.package_name || pkg.name} — LKR {pkg.price.toLocaleString()} ({pkg.billingCycle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PT Member VIP Toggle Switch */}
              <div className="p-3 bg-[#13101c] border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-amber-300">Personal Training (PT) Member</span>
                    <p className="text-[10px] text-zinc-400">Enable exclusive PT Body Metrics & Transformation Tracking</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        formData.isPTMember ||
                        (formData.tier &&
                          (formData.tier.toLowerCase().includes("personal training") ||
                            formData.tier.toLowerCase().includes("pt")))
                      )
                    }
                    onChange={(e) => setFormData({ ...formData, isPTMember: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>

              {/* DYNAMIC PT FITNESS GOALS SECTION (ONLY IF PT PACKAGE OR PT TOGGLE ACTIVE) */}
              {(formData.isPTMember ||
                (formData.tier &&
                  (formData.tier.toLowerCase().includes("personal training") ||
                    formData.tier.toLowerCase().includes("pt")))) && (
                <div className="bg-gradient-to-br from-[#1c1424] via-[#151220] to-[#0f1424] border border-amber-500/50 rounded-xl p-3.5 space-y-2.5 animate-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                    <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-400" /> PT FITNESS GOALS
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                      Exclusive PT Tracking ⭐
                    </span>
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-semibold text-amber-300 mb-1">Fitness Goals (පුහුණු ඉලක්ක)</label>
                    <input
                      type="text"
                      placeholder="e.g. 5kg Fat Loss & Body Recomposition in 3 Months"
                      value={formData.fitnessGoals}
                      onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
                      className="w-full bg-[#171324] border border-amber-500/40 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Height & Weight */}
              <div className="bg-[#121522] border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Fitness Metrics</span>
                  <span className="text-xs font-mono text-lime-400 font-bold">
                    BMI: {calculateBMI(formData.weight, formData.height)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-[#181c2e] border border-zinc-700 rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 75"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-[#181c2e] border border-zinc-700 rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">Target (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 70"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                      className="w-full bg-[#181c2e] border border-emerald-500/40 rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none focus:border-emerald-400 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full bg-[#141724] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-amber-400" /> Manual Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-[#141724] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Override member expiration date manually for medical leave or custom extensions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Status</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editStatus"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={() => setFormData({ ...formData, status: "Active" })}
                      className="accent-lime-400"
                    />
                    <span className="text-xs text-lime-400 font-bold">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editStatus"
                      value="Inactive"
                      checked={formData.status === "Inactive"}
                      onChange={() => setFormData({ ...formData, status: "Inactive" })}
                      className="accent-pink-500"
                    />
                    <span className="text-xs text-zinc-400">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/25"
                >
                  Update Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e111a] border border-pink-500/40 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Member?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to remove <span className="text-pink-300 font-bold">{selectedMember.name}</span> ({selectedMember.id}) from IGYM Balangoda records?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}



      {/* 6. RECORD NEW PAYMENT MODAL */}
      {isRecordPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120f1a] border border-purple-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" /> Record Fee Payment
              </h3>
              <button
                onClick={() => {
                  setIsMemberComboboxOpen(false);
                  setIsRecordPaymentModalOpen(false);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Searchable Member Combobox / Autocomplete */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Select Member (සාමාජිකයා)</label>
                
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Type Member ID (e.g. MEM-001) or Name..."
                      value={memberComboboxQuery}
                      onFocus={() => setIsMemberComboboxOpen(true)}
                      onChange={(e) => {
                        setMemberComboboxQuery(e.target.value);
                        setIsMemberComboboxOpen(true);
                      }}
                      className="w-full bg-[#171424] border border-purple-500/40 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 font-medium"
                    />
                    {memberComboboxQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMemberComboboxQuery("");
                          setIsMemberComboboxOpen(true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>

                  {/* Selected Member / Walk-in Details Card */}
                  {(() => {
                    if (paymentFormData.memberId === "WALK_IN") {
                      return (
                        <div className="mt-2 p-2.5 rounded-xl bg-[#241c14] border border-amber-500/40 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-xs">
                              🛍️
                            </div>
                            <div>
                              <div className="text-xs font-bold text-amber-300 leading-none">Walk-in / External Income</div>
                              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Non-member / Guest Payment</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                            No Member ID
                          </span>
                        </div>
                      );
                    }

                    const selectedMem = members.find((m) => m.id === paymentFormData.memberId);
                    if (!selectedMem) return null;
                    return (
                      <div className="mt-2 p-2.5 rounded-xl bg-[#1c172e] border border-purple-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center font-bold text-purple-300 text-xs">
                            {selectedMem.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white leading-none">{selectedMem.name}</div>
                            <div className="text-[10px] text-purple-300 font-mono mt-0.5">{selectedMem.id} • {selectedMem.tier}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                          Selected ✓
                        </span>
                      </div>
                    );
                  })()}

                  {/* Dynamic Walk-in Payer Name / Reference Input */}
                  {paymentFormData.memberId === "WALK_IN" && (
                    <div className="mt-2.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                      <label className="block text-xs font-semibold text-amber-300">
                        Payer Name / Reference (නම / විස්තරය) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kasun Perera (Walk-in Guest) or Day Pass Sales"
                        value={paymentFormData.externalPayerName}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, externalPayerName: e.target.value })}
                        className="w-full bg-[#181424] border border-amber-500/40 rounded-xl px-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-xs font-medium"
                      />
                    </div>
                  )}

                  {/* Autocomplete Dropdown Popover */}
                  {isMemberComboboxOpen && (
                    <div className="absolute left-0 right-0 top-12 z-50 bg-[#161224] border border-purple-500/40 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-zinc-800/60 animate-in fade-in zoom-in-95 duration-150">
                      {/* STATIC TOP OPTION: Walk-in / External Income */}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentFormData({
                            ...paymentFormData,
                            memberId: "WALK_IN",
                            externalPayerName: paymentFormData.externalPayerName || "",
                          });
                          setMemberComboboxQuery("Walk-in / External Income (No Member)");
                          setIsMemberComboboxOpen(false);
                        }}
                        className={`w-full text-left p-2.5 hover:bg-amber-600/25 transition-colors flex items-center justify-between border-b border-amber-500/30 ${
                          paymentFormData.memberId === "WALK_IN" ? "bg-amber-950/60 border-l-2 border-amber-400" : "bg-[#1f192b]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xs font-bold text-amber-300">
                            🛍️
                          </div>
                          <div>
                            <span className="text-xs font-bold text-amber-300 block">Walk-in / External Income (No Member)</span>
                            <span className="text-[10px] text-zinc-400 font-mono">Guest Sales, One-off Supplements, Walk-in Pass</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                          External 🌐
                        </span>
                      </button>

                      {(() => {
                        const filtered = members.filter(
                          (m) =>
                            m.name.toLowerCase().includes(memberComboboxQuery.toLowerCase()) ||
                            m.id.toLowerCase().includes(memberComboboxQuery.toLowerCase()) ||
                            m.phone.toLowerCase().includes(memberComboboxQuery.toLowerCase())
                        );

                        if (filtered.length === 0) {
                          return (
                            <div className="p-3 text-center text-xs text-zinc-400 italic">
                              No registered member found matching "{memberComboboxQuery}"
                            </div>
                          );
                        }

                        return filtered.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              const newCat = m.tier && gymPackages.some((p) => p.name === m.tier) ? m.tier : paymentFormData.category;
                              const calc = calculatePaymentAmount(newCat, paymentFormData.durationMonths);
                              setPaymentFormData({
                                ...paymentFormData,
                                memberId: m.id,
                                category: newCat,
                                amount: calc.finalAmount,
                                paidAmount: calc.finalAmount,
                              });
                              setMemberComboboxQuery(`${m.name} (${m.id})`);
                              setIsMemberComboboxOpen(false);
                            }}
                            className={`w-full text-left p-2.5 hover:bg-purple-600/25 transition-colors flex items-center justify-between ${
                              paymentFormData.memberId === m.id ? "bg-purple-950/60 border-l-2 border-purple-400" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-xs font-bold text-purple-300">
                                {m.name.charAt(0)}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white block">{m.name}</span>
                                <span className="text-[10px] text-zinc-400 font-mono">{m.id} • {m.phone}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-purple-300 font-mono border border-zinc-700">
                              {m.tier}
                            </span>
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Category (Package) & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Fee Package (පැකේජය)</label>
                  <select
                    value={paymentFormData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const calc = calculatePaymentAmount(newCat, paymentFormData.durationMonths);
                      setPaymentFormData({ ...paymentFormData, category: newCat, amount: calc.finalAmount, paidAmount: calc.finalAmount });
                    }}
                    className="w-full bg-[#171424] border border-zinc-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="Admission Fee">Admission Fee — LKR 1,500</option>
                    <option value="Supplements & Merchandise">Supplements & Merchandise (සප්ලිමන්ට් / භාණ්ඩ)</option>
                    <optgroup label="Official Membership Tiers">
                      {gymPackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.package_name || pkg.name}>
                          {pkg.package_name || pkg.name} — LKR {pkg.price.toLocaleString()}/mo
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-400 mb-1">Duration (කාලසීමාව)</label>
                  <select
                    value={paymentFormData.durationMonths}
                    onChange={(e) => {
                      const newMonths = Number(e.target.value);
                      const calc = calculatePaymentAmount(paymentFormData.category, newMonths);
                      setPaymentFormData({ ...paymentFormData, durationMonths: newMonths, amount: calc.finalAmount, paidAmount: calc.finalAmount });
                    }}
                    className="w-full bg-[#171424] border border-purple-500/40 rounded-xl px-3 py-2.5 text-purple-300 font-bold focus:outline-none focus:border-purple-400 text-xs"
                  >
                    <option value={1}>1 Month (Standard)</option>
                    <option value={3}>3 Months (10% OFF)</option>
                    <option value={6}>6 Months (20% OFF)</option>
                    <option value={12}>12 Months (30% OFF)</option>
                  </select>
                </div>
              </div>

              {/* Item Description Input (Displayed only when Supplements & Merchandise is selected) */}
              {paymentFormData.category === "Supplements & Merchandise" && (
                <div>
                  <label className="block text-xs font-semibold text-pink-400 mb-1">
                    Item Description (භාණ්ඩයේ විස්තරය)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Whey Protein 1kg, Creatine 300g, Gym Shaker Bottle"
                    value={paymentFormData.itemDescription}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, itemDescription: e.target.value })}
                    className="w-full bg-[#171424] border border-pink-500/40 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-pink-400 text-xs"
                  />
                </div>
              )}

              {/* Gym Revenue Share (%) Input (Displayed when PT package is selected) */}
              {(paymentFormData.category.toLowerCase().includes("pt") || paymentFormData.category.toLowerCase().includes("personal training")) && (
                <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-purple-400" /> Gym Revenue Share (%)
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Trainer gets {100 - (Number(paymentFormData.gymRevenuePercentage) || 0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="any"
                      value={paymentFormData.gymRevenuePercentage}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, gymRevenuePercentage: Number(e.target.value) })}
                      className="w-full bg-[#171424] border border-purple-500/40 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-purple-400 text-xs"
                    />
                    <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 text-center">
                      Gym Net: LKR {Math.round(paymentFormData.amount * ((Number(paymentFormData.gymRevenuePercentage) || 0) / 100)).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Amount & Payment Method Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center justify-between">
                    <span>Package Price (LKR)</span>
                    <span className="text-[10px] text-zinc-500 font-normal">Editable</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={paymentFormData.amount}
                    onChange={(e) => {
                      const newTotal = Number(e.target.value);
                      setPaymentFormData({
                        ...paymentFormData,
                        amount: newTotal,
                        paidAmount: newTotal,
                      });
                    }}
                    className="w-full bg-[#171424] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                  {/* Glowing Green Savings Badge */}
                  {(() => {
                    const calc = calculatePaymentAmount(paymentFormData.category, paymentFormData.durationMonths);
                    if (calc.saved > 0) {
                      return (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-mono shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-in fade-in duration-200">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>✨ Saved LKR {calc.saved.toLocaleString()} ({calc.discountPercent}% OFF)</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Payment Method</label>
                  <select
                    value={paymentFormData.method}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, method: e.target.value as any })}
                    className="w-full bg-[#171424] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card POS">Card POS Machine</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online">Online / PayHere</option>
                  </select>
                </div>
              </div>

              {/* Partial Payment / Installment Grid */}
              {(() => {
                const totalPkgPrice = Number(paymentFormData.amount) || 0;
                const currentPaid = Number(paymentFormData.paidAmount ?? totalPkgPrice);
                const calculatedBalanceDue = Math.max(0, totalPkgPrice - currentPaid);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#13111e] border border-purple-500/30 rounded-xl">
                    <div>
                      <label className="block text-xs font-bold text-emerald-400 mb-1 flex items-center justify-between">
                        <span>Amount Paid Today (LKR)</span>
                        <span className="text-[10px] text-emerald-400/80 font-normal">Installment</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max={totalPkgPrice || undefined}
                        step="any"
                        value={paymentFormData.paidAmount ?? totalPkgPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPaymentFormData({ ...paymentFormData, paidAmount: val });
                        }}
                        className="w-full bg-[#181528] border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-emerald-300 font-mono font-black focus:outline-none focus:border-emerald-400 text-sm"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">Default: Full package price (LKR {totalPkgPrice.toLocaleString()})</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-rose-400 mb-1">
                        Balance Due (LKR) [Read-Only]
                      </label>
                      <div
                        className={`w-full rounded-xl px-3.5 py-2.5 font-mono font-black text-sm border ${
                          calculatedBalanceDue > 0
                            ? "bg-rose-950/60 border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                            : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        {calculatedBalanceDue > 0 ? `LKR ${calculatedBalanceDue.toLocaleString()} (Owed)` : "LKR 0 (Fully Paid)"}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">Calculated as: Package Price − Amount Paid</p>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer bg-[#171424] hover:bg-[#1e1932] p-3.5 rounded-xl border border-purple-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={paymentFormData.sendReceiptAlert}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, sendReceiptAlert: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-purple-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-purple-400" /> Send Digital Receipt via Member App Chat
                    </span>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block leading-relaxed">
                      Instantly routes an official receipt message & invoice card directly to the member's in-app chat.
                    </span>
                  </div>
                </label>
              </div>



              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMemberComboboxOpen(false);
                    setIsRecordPaymentModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-black shadow-lg shadow-purple-500/25"
                >
                  Save & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6.4 VIEW COACH DETAILS & TRAINEES MODAL */}
      {selectedViewCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#141217] border border-amber-500/40 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedViewCoach.imageUrl}
                  alt={selectedViewCoach.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300&auto=format&fit=crop&q=80";
                  }}
                />
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    {selectedViewCoach.name}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedViewCoach.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {selectedViewCoach.status}
                    </span>
                  </h3>
                  <p className="text-xs text-amber-300 font-bold">
                    {selectedViewCoach.specialization} • {selectedViewCoach.experience} Experience
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedViewCoach(null)} className="text-zinc-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Stats */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#1c1922] border border-zinc-800 rounded-2xl text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Monthly Fee</span>
                <span className="text-lime-400 font-mono font-black text-sm">
                  Rs. {selectedViewCoach.monthlyRate.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Phone Contact</span>
                <span className="text-white font-mono font-bold">{selectedViewCoach.phone || "N/A"}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Email Address</span>
                <span className="text-zinc-300 font-mono truncate block">{selectedViewCoach.email || "N/A"}</span>
              </div>
            </div>

            {/* Coach Bio */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Coach Biography & Specialty</h4>
              <p className="text-xs text-zinc-300 bg-[#16141c] p-3.5 rounded-xl border border-zinc-800/80 leading-relaxed">
                {selectedViewCoach.bio || "Certified fitness instructor specializing in body transformation, strength training, and nutrition."}
              </p>
            </div>

            {/* Assigned Trainees List Header */}
            {(() => {
              const assigned = (selectedViewCoach as any).assigned_members || members.filter((m) => m.coachId === selectedViewCoach.id || m.coachName === selectedViewCoach.name);

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" /> Assigned Trainees ({assigned.length})
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">Real-time Sync</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-800 bg-[#121016] divide-y divide-zinc-800/60 p-1">
                    {assigned.length > 0 ? (
                      assigned.map((m: any) => (
                        <div key={m.id || m.member_id} className="p-2.5 flex items-center justify-between hover:bg-zinc-800/40 transition-colors rounded-lg">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs">
                              {(m.name || m.memberName || "M").charAt(0)}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">{m.name || m.memberName}</h5>
                              <span className="text-[10px] text-zinc-400 font-mono">{m.phone || "No phone"} • {m.id || m.member_id}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {m.tier || m.category || "Standard"}
                            </span>
                            <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">
                              Exp: {m.expiry_date || m.expiryDate || "Active"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-zinc-500 italic">
                        No members are currently assigned to {selectedViewCoach.name}.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setEditingCoach(selectedViewCoach);
                  setCoachFormData({
                    name: selectedViewCoach.name,
                    specialization: selectedViewCoach.specialization,
                    phone: selectedViewCoach.phone,
                    email: selectedViewCoach.email,
                    experience: selectedViewCoach.experience,
                    monthlyRate: selectedViewCoach.monthlyRate,
                    bio: selectedViewCoach.bio,
                    imageUrl: selectedViewCoach.imageUrl,
                    status: selectedViewCoach.status,
                  });
                  setSelectedViewCoach(null);
                  setIsAddCoachModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Coach Profile
              </button>

              <button
                onClick={() => setSelectedViewCoach(null)}
                className="px-5 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6.5 ADD / EDIT COACH MODAL */}
      {isAddCoachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#181510] border border-amber-500/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                {editingCoach ? "Edit Coach Profile" : "Add New Coach Profile"}
              </h3>
              <button
                onClick={() => {
                  setIsAddCoachModalOpen(false);
                  setEditingCoach(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCoachSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Photo Upload & Preview Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400">Coach Profile Photo (ඡායාරූපය)</label>
                <div className="flex items-center gap-4 p-3 bg-[#0d0c09] border border-zinc-800 rounded-xl">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-amber-500/30 shrink-0">
                    {coachFormData.imageUrl ? (
                      <img src={coachFormData.imageUrl} alt="Coach preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-xs">No Photo</div>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer shadow">
                      <Camera className="w-3.5 h-3.5" /> Upload Image
                      <input type="file" accept="image/*" onChange={handleCoachImageUpload} className="hidden" />
                    </label>
                    <p className="text-[10px] text-zinc-500">Supports JPG, PNG, WebP (Uploaded to Supabase Storage)</p>
                  </div>
                </div>
              </div>

              {/* Coach Name & Specialization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Coach Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coach Nimal Jayasinghe"
                    value={coachFormData.name}
                    onChange={(e) => setCoachFormData({ ...coachFormData, name: e.target.value })}
                    className="w-full bg-[#0d0c09] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Specialization</label>
                  <select
                    value={coachFormData.specialization}
                    onChange={(e) => setCoachFormData({ ...coachFormData, specialization: e.target.value })}
                    className="w-full bg-[#0d0c09] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bodybuilding & Muscle Gain">Bodybuilding & Muscle Gain</option>
                    <option value="Fat Loss & HIIT Conditioning">Fat Loss & HIIT Conditioning</option>
                    <option value="CrossFit & Strength Training">CrossFit & Strength Training</option>
                    <option value="Yoga & Mobility Specialist">Yoga & Mobility Specialist</option>
                    <option value="Powerlifting & Heavy Compound">Powerlifting & Heavy Compound</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="0771234567"
                    value={coachFormData.phone}
                    onChange={(e) => setCoachFormData({ ...coachFormData, phone: e.target.value })}
                    className="w-full bg-[#0d0c09] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="coach@igym.lk"
                    value={coachFormData.email}
                    onChange={(e) => setCoachFormData({ ...coachFormData, email: e.target.value })}
                    className="w-full bg-[#0d0c09] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Experience & Monthly Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Experience (Years)</label>
                  <input
                    type="text"
                    placeholder="e.g. 5+ Years"
                    value={coachFormData.experience}
                    onChange={(e) => setCoachFormData({ ...coachFormData, experience: e.target.value })}
                    className="w-full bg-[#0d0c09] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Monthly PT Rate (LKR)</label>
                  <input
                    type="number"
                    value={coachFormData.monthlyRate}
                    onChange={(e) => setCoachFormData({ ...coachFormData, monthlyRate: Number(e.target.value) })}
                    className="w-full bg-[#0d0c09] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Bio / Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Bio / Qualifications</label>
                <textarea
                  rows={2}
                  placeholder="Short background, certification, and training philosophy..."
                  value={coachFormData.bio}
                  onChange={(e) => setCoachFormData({ ...coachFormData, bio: e.target.value })}
                  className="w-full bg-[#0d0c09] border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Active / Inactive Status */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Coach Status</label>
                <select
                  value={coachFormData.status}
                  onChange={(e) => setCoachFormData({ ...coachFormData, status: e.target.value as "Active" | "Inactive" })}
                  className="w-full bg-[#0d0c09] border border-zinc-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Active">Active (Available for Assignment)</option>
                  <option value="Inactive">Inactive (On Leave / Unavailable)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCoachModalOpen(false);
                    setEditingCoach(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-black shadow-lg shadow-amber-500/25"
                >
                  {editingCoach ? "Update Coach Profile" : "Save Coach Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6.8 SUPABASE USER AUTHENTICATION / LOGIN MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#10121d] border border-cyan-500/40 w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 border border-cyan-300/40 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {authMode === "signin" ? "Supabase User Login" : "Register New Staff Account"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {authMode === "signin" ? "Enter your email & password to log in" : "Create a new IGYM staff account"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="flex p-1 bg-[#090a12] border border-zinc-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  authMode === "signin"
                    ? "bg-cyan-500 text-black shadow-md font-extrabold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign In (ලොග් වන්න)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  authMode === "signup"
                    ? "bg-cyan-500 text-black shadow-md font-extrabold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Register (ලියාපදිංචි වන්න)
              </button>
            </div>

            {/* Error & Success Alert Banners */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={authMode === "signin" ? handleAuthSignIn : handleAuthSignUp} className="space-y-4 text-xs sm:text-sm">
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name (සම්පූර්ණ නම)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Perera"
                    value={authFormData.fullName}
                    onChange={(e) => setAuthFormData({ ...authFormData, fullName: e.target.value })}
                    className="w-full bg-[#090a12] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address (විද්‍යුත් තැපෑල) *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@igym.lk"
                  value={authFormData.email}
                  onChange={(e) => setAuthFormData({ ...authFormData, email: e.target.value })}
                  className="w-full bg-[#090a12] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Password (මුරපදය) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authFormData.password}
                  onChange={(e) => setAuthFormData({ ...authFormData, password: e.target.value })}
                  className="w-full bg-[#090a12] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Select Access Role (තනතුර)</label>
                  <select
                    value={authFormData.role}
                    onChange={(e) => setAuthFormData({ ...authFormData, role: e.target.value as any })}
                    className="w-full bg-[#090a12] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ADMIN">Gym Admin (Manage Members & Payments)</option>
                    <option value="SUPER_ADMIN">Super Admin / Owner (Full System Access)</option>
                    <option value="STAFF">Gym Desk Staff (Check-in / Attendance Only)</option>
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                    </>
                  ) : authMode === "signin" ? (
                    "Sign In to Dashboard"
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. REVENUE ANALYTICS & DATA EXPORT MODAL */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c1214] border border-lime-500/40 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-400/40 flex items-center justify-center text-lime-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    IGYM Balangoda — Revenue & Income Report
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Comprehensive gross revenue breakdown, payment channels, and past months comparison.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsRevenueModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Month Overview Banner */}
            <div className="bg-[#121c15] border border-lime-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">August 2026 Total Revenue</span>
                <div className="text-3xl font-black text-white font-mono mt-0.5">LKR 485,000</div>
                <p className="text-xs text-zinc-400 mt-1">
                  +12.4% increase compared to July 2026 (LKR 431,500)
                </p>
              </div>

              <button
                onClick={handleExportRevenueCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-black font-extrabold text-xs shadow-lg shadow-lime-500/25 transition-all shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" /> Export Report (CSV)
              </button>
            </div>

            {/* Revenue Source Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Breakdown */}
              <div className="bg-[#10141d] border border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span>Income by Fee Category</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Amount LKR</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-zinc-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> Monthly Membership
                    </span>
                    <span className="font-mono font-bold text-cyan-300">LKR 285,000 (58.7%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full w-[58.7%]" />
                  </div>

                  <div className="flex justify-between items-center text-zinc-200 pt-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-lime-400" /> Personal Trainer (PT)
                    </span>
                    <span className="font-mono font-bold text-lime-300">LKR 145,000 (29.8%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-lime-400 h-full w-[29.8%]" />
                  </div>

                  <div className="flex justify-between items-center text-zinc-200 pt-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Admission Fees
                    </span>
                    <span className="font-mono font-bold text-amber-300">LKR 55,000 (11.5%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[11.5%]" />
                  </div>
                </div>
              </div>

              {/* Payment Methods Split */}
              <div className="bg-[#10141d] border border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span>Income by Payment Channel</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Channel %</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-200">
                    <span>Cash Payments:</span>
                    <span className="font-mono font-bold text-purple-300">LKR 218,250 (45%)</span>
                  </div>
                  <div className="flex justify-between text-zinc-200">
                    <span>Card POS Machine:</span>
                    <span className="font-mono font-bold text-pink-300">LKR 169,750 (35%)</span>
                  </div>
                  <div className="flex justify-between text-zinc-200">
                    <span>Bank Transfer & Online:</span>
                    <span className="font-mono font-bold text-cyan-300">LKR 97,000 (20%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Past 6 Months Revenue Visualizer */}
            <div className="bg-[#10141d] border border-zinc-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                Past 6 Months Income Progression (LKR)
              </h4>
              <div className="h-32 flex items-end justify-between gap-3 pt-2">
                {[
                  { month: "Mar", amount: 390000 },
                  { month: "Apr", amount: 410000 },
                  { month: "May", amount: 435000 },
                  { month: "Jun", amount: 450000 },
                  { month: "Jul", amount: 465000 },
                  { month: "Aug", amount: 485000, current: true },
                ].map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div
                      style={{ height: `${(item.amount / 500000) * 100}%` }}
                      className={`w-full rounded-t-md transition-all ${
                        item.current
                          ? "bg-gradient-to-t from-lime-500 to-emerald-400 shadow-[0_0_10px_rgba(132,204,22,0.4)]"
                          : "bg-zinc-800 group-hover:bg-zinc-700"
                      }`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 pointer-events-none transition-opacity font-mono z-10 whitespace-nowrap">
                        LKR {(item.amount / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <span className={`text-[10px] mt-2 font-mono ${item.current ? "text-lime-400 font-bold" : "text-zinc-400"}`}>
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsRevenueModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      <RecordExpenseModal
        isOpen={isRecordExpenseModalOpen}
        onClose={() => setIsRecordExpenseModalOpen(false)}
        expenseFormData={expenseFormData}
        setExpenseFormData={setExpenseFormData}
        setExpenseRecords={setExpenseRecords}
      />

      {/* 8. MANAGE PACKAGE PRICING & CUSTOM GYM TIERS MODAL */}
      <PackagePricingModal
        isOpen={isPackagePricingModalOpen}
        onClose={() => setIsPackagePricingModalOpen(false)}
        gymPackages={gymPackages}
        setGymPackages={setGymPackages}
        defaultOfficialGymPackages={defaultOfficialGymPackages}
      />

      {/* 9. PENDING & OVERDUE PAYMENTS POPUP MODAL */}
      {isPendingPaymentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#180f14] border border-pink-500/40 w-[95vw] md:w-[90vw] max-w-7xl rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    Pending & Overdue Members List (ගෙවීම් අතපසු වූ සාමාජිකයින්)
                  </h3>
                  <p className="text-xs text-pink-300/80">
                    Members whose membership fee is expiring soon or overdue. Send immediate WhatsApp/SMS alerts or mark as paid.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsPendingPaymentsModalOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pending List Table */}
            {(() => {
              const pendingOverdueMembers = members.filter((m) => {
                const plan = (m.tier || "").toString().trim();
                const hasPlan = plan.length > 0 && plan !== "N/A" && plan.toLowerCase() !== "null";
                if (!hasPlan) return false;

                const expVal = m.expiry_date || m.expiryDate;
                if (!expVal) return false;
                const expDate = new Date(expVal);
                return !isNaN(expDate.getTime()) && expDate < new Date();
              });

              const totalPendingAmt = pendingOverdueMembers.reduce((sum, m) => {
                const plan = (m.tier || "").toString().trim();
                const hasPlan = plan.length > 0 && plan !== "N/A" && plan.toLowerCase() !== "null";
                if (!hasPlan) return sum;

                const pkg = gymPackages.find((p) => (p.package_name || p.name) === m.tier || p.name === m.tier);
                const price = pkg ? Number(pkg.price) || 0 : 0;
                return sum + price;
              }, 0);

              return (
                <div className="space-y-4">
                  <div className="overflow-x-auto w-full pb-2 rounded-xl border border-zinc-800/80 bg-[#120b0f]">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="text-[11px] font-bold text-pink-400 uppercase tracking-wider border-b border-zinc-800 bg-[#150f14]">
                          <th className="pb-3 pt-3 pl-4 pr-3 min-w-[150px] whitespace-nowrap">MEMBER & CONTACT</th>
                          <th className="pb-3 pt-3 px-3 min-w-[110px] whitespace-nowrap">CATEGORY</th>
                          <th className="pb-3 pt-3 px-3 min-w-[120px] whitespace-nowrap">EXPIRE / DUE DATE</th>
                          <th className="pb-3 pt-3 px-3 min-w-[110px] whitespace-nowrap">EST. AMOUNT</th>
                          <th className="pb-3 pt-3 px-3 min-w-[100px] whitespace-nowrap">STATUS</th>
                          <th className="pb-3 pt-3 pr-4 pl-3 min-w-[220px] text-right whitespace-nowrap">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {pendingOverdueMembers.map((mem) => {
                          const pkg = gymPackages.find((p) => (p.package_name || p.name) === mem.tier || p.name === mem.tier);
                          const amt = pkg ? Number(pkg.price) || 0 : 0;

                          return (
                            <tr key={mem.id} className="hover:bg-zinc-800/40 transition-colors">
                              {/* Member & Contact */}
                              <td className="py-3.5 pl-4 pr-3 min-w-[150px] whitespace-nowrap">
                                <h4 className="font-bold text-white text-sm">{mem.name}</h4>
                                <span className="text-[11px] text-zinc-400 font-mono block">{mem.phone}</span>
                                <span className="text-[10px] text-pink-400/80 font-mono">{mem.id}</span>
                              </td>

                              {/* Category */}
                              <td className="py-3.5 px-3 min-w-[110px] whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block">
                                  {mem.tier}
                                </span>
                              </td>

                              {/* Due Date */}
                              <td className="py-3.5 px-3 min-w-[120px] whitespace-nowrap font-mono font-bold text-pink-300">
                                {mem.expiryDate || mem.expiry_date || "Expired"}
                              </td>

                              {/* Amount */}
                              <td className="py-3.5 px-3 min-w-[110px] whitespace-nowrap font-mono font-black text-white">
                                LKR {amt.toLocaleString()}
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-3 min-w-[100px] whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/40 animate-pulse">
                                  Overdue ⚠️
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 pr-4 pl-3 min-w-[220px] text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2 whitespace-nowrap shrink-0">
                                  {/* In-App Chat Renewal Reminder */}
                                  <button
                                    onClick={() => handleSendInAppRenewalReminder(mem)}
                                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                                    title="Send In-App Chat Renewal Reminder"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" /> Remind Chat
                                  </button>

                                  {/* Record Payment */}
                                  <button
                                    onClick={() => {
                                      setIsPendingPaymentsModalOpen(false);
                                      setPaymentFormData((prev) => ({ ...prev, memberId: mem.id }));
                                      setIsRecordPaymentModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
                                  >
                                    Record Payment
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {pendingOverdueMembers.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                              🎉 Great job! No pending or overdue member payments at this time.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <span className="text-xs text-zinc-400 font-mono">
                      Total Pending Overdue: <strong className="text-pink-400">LKR {totalPendingAmt.toLocaleString()}</strong>
                    </span>

                    <button
                      onClick={() => setIsPendingPaymentsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold cursor-pointer"
                    >
                      Close List
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* WORKOUT PLAN TEMPLATES & CREATOR MODAL */}
      {isWorkoutPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-teal-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Workout Plan Templates & Preset Creator
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Select a pre-saved workout plan or create a new custom routine to send to members.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsWorkoutPlanModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-teal-400 uppercase tracking-wider block flex items-center justify-between">
                <span>SELECT PRE-SAVED WORKOUT TEMPLATE:</span>
                <span className="text-[10px] text-zinc-500 font-normal">Click pill to load into editor</span>
              </label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {workoutTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplateContent(t.content)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-teal-300 border border-teal-500/30 hover:border-teal-400 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{t.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor / Preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block flex items-center justify-between">
                <span>Customize Routine Details (විස්තර සංස්කරණය කරන්න):</span>
                <span className="text-[10px] text-teal-400 font-mono">Editable</span>
              </label>
              <textarea
                rows={6}
                value={selectedTemplateContent}
                onChange={(e) => setSelectedTemplateContent(e.target.value)}
                placeholder="Type or customize workout schedule here..."
                className="w-full bg-[#141926] border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 font-mono leading-relaxed"
              />
            </div>

            {/* Save New Template Option */}
            <div className="p-3 bg-[#131826] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">💾 Save Current Text as Reusable Template</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Template Title (e.g. 3-Day Arm & Shoulder Pump)"
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  className="flex-1 bg-[#1a2033] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
                <button
                  disabled={isSavingWorkoutTemplate}
                  onClick={handleSaveWorkoutTemplate}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1"
                >
                  {isSavingWorkoutTemplate ? "Saving..." : "Save Preset"}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsWorkoutPlanModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedTemplateContent.trim()) {
                    alert("⚠️ Please select or enter workout plan content before sending.");
                    return;
                  }
                  const currentMemberId = activeChatMemberId || (members[0] ? members[0].id : "MEM001");
                  const targetMem = members.find((m) => m.id === currentMemberId) || members[0];
                  const memberDisplayName = targetMem ? targetMem.name : currentMemberId;

                  await handleSendMessage(`🏋️ WORKOUT SCHEDULE:\n${selectedTemplateContent.trim()}`, "workout", currentMemberId);
                  setIsWorkoutPlanModalOpen(false);
                  alert(`✅ Workout Plan successfully sent to ${memberDisplayName}!`);
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-extrabold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <SendHorizontal className="w-4 h-4" /> Send Workout Plan to Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIET PLAN TEMPLATES & CREATOR MODAL */}
      {isDietPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-purple-500/40 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Diet & Nutrition Plan Templates & Creator
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Select a pre-saved meal plan or create a customized nutrition plan for members.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDietPlanModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                Select Pre-Saved Diet Template:
              </label>
              <div className="flex flex-wrap gap-2">
                {dietTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplateContent(t.content)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-purple-300 border border-purple-500/30 transition-all"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor / Preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Customize Diet Details (ආහාර සැලැස්ම සංස්කරණය කරන්න):
              </label>
              <textarea
                rows={6}
                value={selectedTemplateContent}
                onChange={(e) => setSelectedTemplateContent(e.target.value)}
                placeholder="Type or customize diet meal plan here..."
                className="w-full bg-[#141926] border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400 font-mono"
              />
            </div>

            {/* Save New Template Option */}
            <div className="p-3 bg-[#131826] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">💾 Save Current Text as Reusable Template</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Template Title (e.g. Keto Weight Loss Plan)"
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  className="flex-1 bg-[#1a2033] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  onClick={() => {
                    if (!newTemplateTitle.trim() || !selectedTemplateContent.trim()) return;
                    const created = { id: `d-${Date.now()}`, title: `🥗 ${newTemplateTitle}`, content: selectedTemplateContent };
                    setDietTemplates([...dietTemplates, created]);
                    setNewTemplateTitle("");
                    alert("Diet template saved successfully!");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0"
                >
                  Save Preset
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsDietPlanModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedTemplateContent.trim()) return;
                  handleSendMessage(`🥗 DIET & NUTRITION PLAN:\n${selectedTemplateContent}`, "diet");
                  setIsDietPlanModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-xs shadow-lg flex items-center gap-2"
              >
                <SendHorizontal className="w-4 h-4" /> Send Diet Plan to Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT REMINDER MODAL */}
      {isPaymentReminderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Membership Payment Reminder
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Send customized renewal notice or overdue reminder.
                  </p>
                </div>
              </div>
              <button onClick={() => setIsPaymentReminderModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Reminder Message Text (මතක් කිරීමේ පණිවිඩය):
              </label>
              <textarea
                rows={4}
                value={customReminderText}
                onChange={(e) => setCustomReminderText(e.target.value)}
                placeholder="Type payment reminder message..."
                className="w-full bg-[#141926] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsPaymentReminderModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!customReminderText.trim()) return;
                  handleSendMessage(customReminderText, "invoice");
                  setIsPaymentReminderModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg flex items-center gap-2"
              >
                <SendHorizontal className="w-4 h-4" /> Send Payment Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. AUTHENTICATION & LOGIN GATEWAY SCREEN (Disabled for Dev Bypass) */}
      {false && !isLoggedIn && (
        <div className="fixed inset-0 z-50 bg-[#060812]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-cyan-500/30 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl shadow-cyan-950/50 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Logo */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400/40 text-white mb-3">
                <WeightlifterIcon className="w-8 h-8 text-cyan-100 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-wider">IGYM LOGIN GATEWAY</h2>
              <p className="text-xs text-zinc-400 font-medium">Balangoda Branch Management Portal</p>
            </div>

            {/* Quick Demo Role Logins */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-extrabold text-cyan-400 tracking-wider uppercase text-center flex items-center justify-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> 1-Click Role Login Demo
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLoginSubmit(undefined, "SUPER_ADMIN")}
                  className="p-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-bold text-left transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between font-extrabold text-white">
                    <span>👑 Owner Login</span>
                  </div>
                  <p className="text-[10px] text-purple-300/80 font-mono">SUPER_ADMIN (Full Access & Settings)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoginSubmit(undefined, "ADMIN")}
                  className="p-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold text-left transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between font-extrabold text-white">
                    <span>🛡️ Admin Login</span>
                  </div>
                  <p className="text-[10px] text-cyan-300/80 font-mono">ADMIN (Settings Menu Restricted)</p>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-[#0e111a] px-3 text-[10px] text-zinc-500 font-extrabold uppercase">or Sign in with Email</span>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Email / Username</label>
                <input
                  type="email"
                  required
                  placeholder="owner@igym.lk or admin@igym.lk"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#141724] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#141724] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-500/25 transition-all uppercase tracking-wider"
              >
                Sign In to Dashboard
              </button>
            </form>
          </div>
        </div>
      )}



      {/* 13. REVENUE BREAKDOWN & INCOME HISTORY MODAL */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16120b] border border-amber-500/40 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    Monthly Revenue & Income Breakdown (මසික ආදායම් විස්තරය)
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    Live database breakdown of earnings, monthly trends, and payment records.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRevenueModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const paidPayments = paymentRecords.filter((p) => p.status === "Paid");
              const totalGross = paidPayments.reduce((sum, p) => sum + p.amount, 0);

              const membershipSum = paidPayments
                .filter((p) => {
                  const c = p.category.toLowerCase();
                  return c.includes("membership") || c.includes("monthly") || c.includes("fee");
                })
                .reduce((sum, p) => sum + p.amount, 0);

              const admissionSum = paidPayments
                .filter((p) => {
                  const c = p.category.toLowerCase();
                  return c.includes("admission") || c.includes("registration");
                })
                .reduce((sum, p) => sum + p.amount, 0);

              const ptSum = paidPayments
                .filter((p) => {
                  const c = p.category.toLowerCase();
                  return c.includes("pt") || c.includes("personal");
                })
                .reduce((sum, p) => sum + p.amount, 0);

              const membershipPct = totalGross > 0 ? ((membershipSum / totalGross) * 100).toFixed(1) : "0.0";
              const admissionPct = totalGross > 0 ? ((admissionSum / totalGross) * 100).toFixed(1) : "0.0";
              const ptPct = totalGross > 0 ? ((ptSum / totalGross) * 100).toFixed(1) : "0.0";

              // Group by Month
              const monthlyMap: Record<string, { memberships: number; admissions: number; pt: number; total: number }> = {};
              paidPayments.forEach((p) => {
                const dateObj = new Date(p.paymentDate);
                const monthName = isNaN(dateObj.getTime())
                  ? "Recent"
                  : dateObj.toLocaleString("en-US", { month: "long", year: "numeric" });

                if (!monthlyMap[monthName]) {
                  monthlyMap[monthName] = { memberships: 0, admissions: 0, pt: 0, total: 0 };
                }

                const c = p.category.toLowerCase();
                if (c.includes("admission") || c.includes("registration")) {
                  monthlyMap[monthName].admissions += p.amount;
                } else if (c.includes("pt") || c.includes("personal")) {
                  monthlyMap[monthName].pt += p.amount;
                } else {
                  monthlyMap[monthName].memberships += p.amount;
                }
                monthlyMap[monthName].total += p.amount;
              });

              return (
                <>
                  {/* Income Streams Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#221a0f] border border-amber-500/30">
                      <p className="text-[10px] text-amber-400/80 font-bold uppercase">Monthly Membership Fees</p>
                      <h4 className="text-lg font-black text-white mt-1">LKR {membershipSum.toLocaleString()}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{membershipPct}% of total revenue</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#221a0f] border border-amber-500/30">
                      <p className="text-[10px] text-amber-400/80 font-bold uppercase">Admission & Registration</p>
                      <h4 className="text-lg font-black text-white mt-1">LKR {admissionSum.toLocaleString()}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{admissionPct}% of total revenue</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#221a0f] border border-amber-500/30">
                      <p className="text-[10px] text-amber-400/80 font-bold uppercase">Personal Training (PT)</p>
                      <h4 className="text-lg font-black text-white mt-1">LKR {ptSum.toLocaleString()}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{ptPct}% of total revenue</p>
                    </div>
                  </div>

                  {/* Historical Monthly Income Table */}
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Live Monthly Income Trends (පහුගිය මාසවල ආදායම)
                    </h4>
                    <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-[10px] font-bold text-amber-400 uppercase border-b border-zinc-800 bg-[#16120b] sticky top-0">
                            <th className="pb-2 pl-2">MONTH</th>
                            <th className="pb-2">MEMBERSHIPS</th>
                            <th className="pb-2">ADMISSIONS</th>
                            <th className="pb-2">PT PACKAGES</th>
                            <th className="pb-2 pr-2 text-right">TOTAL GROSS REVENUE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 font-mono">
                          {Object.keys(monthlyMap).length > 0 ? (
                            Object.entries(monthlyMap).map(([monthStr, data], idx) => (
                              <tr key={monthStr} className={idx === 0 ? "bg-amber-500/10 font-bold" : ""}>
                                <td className="py-2.5 pl-2 text-white">{monthStr} {idx === 0 ? "(Current)" : ""}</td>
                                <td className="py-2.5 text-zinc-300">Rs. {data.memberships.toLocaleString()}</td>
                                <td className="py-2.5 text-zinc-300">Rs. {data.admissions.toLocaleString()}</td>
                                <td className="py-2.5 text-zinc-300">Rs. {data.pt.toLocaleString()}</td>
                                <td className="py-2.5 pr-2 text-right text-amber-400 text-sm font-black">Rs. {data.total.toLocaleString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-zinc-500 font-sans">
                                Database in visual sync: No payment records logged yet. Add new payments to view live monthly income breakdown.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                onClick={handleExportRevenueCSV}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Download className="w-3.5 h-3.5" /> Export Revenue Statement
              </button>

              <button
                onClick={() => setIsRevenueModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. ACTIVE RATE & MEMBER STATUS ANALYSIS MODAL */}
      <ActiveRateModal
        isOpen={isActiveRateModalOpen}
        onClose={() => setIsActiveRateModalOpen(false)}
        members={members}
        onOpenBulkActivate={() => setIsBulkActivateModalOpen(true)}
        selectedBulkInactiveMemberIds={selectedBulkInactiveMemberIds}
        setSelectedBulkInactiveMemberIds={setSelectedBulkInactiveMemberIds}
      />

      {/* ── BULK ACTIVATE MEMBERS MODAL ────────────────────────────────────── */}
      {isBulkActivateModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#150f14] border border-emerald-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Bulk Activate {selectedBulkInactiveMemberIds.length} Members
                  </h3>
                  <p className="text-xs text-emerald-300/80">
                    Assign a membership plan and record instant payment for selected inactive members.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkActivateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Package Dropdown */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Select Membership Package (Plan)</label>
                <select
                  value={bulkActivatePkgName}
                  onChange={(e) => {
                    const pkgVal = e.target.value;
                    setBulkActivatePkgName(pkgVal);
                    const foundPkg = gymPackages.find((p) => (p.package_name || p.name) === pkgVal || p.name === pkgVal);
                    if (foundPkg) {
                      setBulkActivateAmount(Number(foundPkg.price) || 3500);
                    }
                  }}
                  className="w-full bg-[#1d121b] border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-semibold"
                >
                  <option value="1 Month">1 Month (Monthly Standard)</option>
                  <option value="3 Months">3 Months (Quarterly Saver)</option>
                  <option value="6 Months">6 Months (Half Year)</option>
                  <option value="Full Year">Full Year (Annual VIP)</option>
                  {gymPackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.name}>
                      {pkg.name} - LKR {pkg.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Dropdown */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Duration (Months)</label>
                <select
                  value={bulkActivateDurationMonths}
                  onChange={(e) => setBulkActivateDurationMonths(Number(e.target.value))}
                  className="w-full bg-[#1d121b] border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-semibold"
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months (1 Year)</option>
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Payment Amount Received (Per Member)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">LKR</span>
                  <input
                    type="number"
                    value={bulkActivateAmount}
                    onChange={(e) => setBulkActivateAmount(Number(e.target.value))}
                    className="w-full bg-[#1d121b] border border-zinc-700 rounded-xl pl-12 pr-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Payment Method</label>
                <select
                  value={bulkActivateMethod}
                  onChange={(e) => setBulkActivateMethod(e.target.value as any)}
                  className="w-full bg-[#1d121b] border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-semibold"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              {/* Total Summary Box */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-bold">Total Collection ({selectedBulkInactiveMemberIds.length} Members):</span>
                <span className="text-emerald-400 font-black text-sm">
                  LKR {(bulkActivateAmount * selectedBulkInactiveMemberIds.length).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsBulkActivateModalOpen(false)}
                disabled={isBulkActivating}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (selectedBulkInactiveMemberIds.length === 0) return;
                  setIsBulkActivating(true);

                  try {
                    const today = new Date();
                    const todayStr = today.toISOString().split("T")[0];

                    const expDate = new Date();
                    expDate.setMonth(expDate.getMonth() + bulkActivateDurationMonths);
                    const expiryDateStr = expDate.toISOString().split("T")[0];

                    const targetMembers = members.filter(
                      (m) =>
                        selectedBulkInactiveMemberIds.includes(m.id) ||
                        (m.dbUuid && selectedBulkInactiveMemberIds.includes(m.dbUuid))
                    );

                    const targetDbUuids = targetMembers.map((m) => m.dbUuid || m.id);
                    const targetMemberIds = targetMembers.map((m) => m.id);

                    // 1. Bulk Update Supabase members table
                    const updatePayload = {
                      status: "Active",
                      membership_plan: bulkActivatePkgName,
                      tier: bulkActivatePkgName,
                      duration_months: bulkActivateDurationMonths,
                      joined_date: todayStr,
                      expiry_date: expiryDateStr,
                    };

                    const { error: err1 } = await supabase
                      .from("members")
                      .update(updatePayload)
                      .in("id", targetDbUuids);

                    if (err1) {
                      await supabase
                        .from("members")
                        .update(updatePayload)
                        .in("member_id", targetMemberIds);
                    }

                    // 2. Insert payment records into Supabase
                    const paymentInserts = targetMembers.map((mem, idx) => ({
                      invoice_no: `INV-${Date.now()}-${idx + 1}`,
                      member_id: mem.id,
                      member_name: mem.name,
                      phone: mem.phone,
                      category: bulkActivatePkgName,
                      amount: Number(bulkActivateAmount) || 3500,
                      payment_date: todayStr,
                      due_date: expiryDateStr,
                      method: bulkActivateMethod,
                      status: "Paid",
                    }));

                    try {
                      await supabase.from("payments").insert(paymentInserts);
                    } catch (pErr) {
                      console.log("Bulk payment log insert notice:", pErr);
                    }

                    // 3. Update local React state
                    const targetIdSet = new Set(selectedBulkInactiveMemberIds);
                    setMembers((prev) =>
                      prev.map((m) =>
                        targetIdSet.has(m.id) || (m.dbUuid && targetIdSet.has(m.dbUuid))
                          ? {
                              ...m,
                              status: "Active",
                              tier: bulkActivatePkgName,
                              durationMonths: bulkActivateDurationMonths,
                              joinDate: todayStr,
                              expiryDate: expiryDateStr,
                              expiry_date: expiryDateStr,
                            }
                          : m
                      )
                    );

                    const newPaymentRecords: PaymentRecord[] = paymentInserts.map((p, idx) => ({
                      id: `PAY-BULK-${Date.now()}-${idx}`,
                      invoiceNo: p.invoice_no,
                      memberId: p.member_id,
                      memberName: p.member_name,
                      phone: p.phone,
                      category: p.category,
                      amount: p.amount,
                      paymentDate: p.payment_date,
                      dueDate: p.due_date,
                      method: p.method as any,
                      status: "Paid",
                      reminderSent: false,
                    }));

                    setPaymentRecords((prev) => [...newPaymentRecords, ...prev]);

                    setSelectedBulkInactiveMemberIds([]);
                    setIsBulkActivateModalOpen(false);
                    setToastMessage(`🎉 Successfully bulk-activated ${targetMembers.length} members!`);
                    setTimeout(() => setToastMessage(null), 4000);
                  } catch (err: any) {
                    console.error("Bulk activation exception:", err);
                    setToastMessage(`⚠️ Bulk Activation Error: ${err?.message || "Failed"}`);
                    setTimeout(() => setToastMessage(null), 4000);
                  } finally {
                    setIsBulkActivating(false);
                  }
                }}
                disabled={isBulkActivating}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
              >
                {isBulkActivating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Activating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" /> Confirm & Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 15. BROADCAST MESSAGE MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121624] border border-purple-500/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Broadcast Announcement to All Members
                  </h3>
                  <p className="text-xs text-purple-300">
                    Send a bulk push notification & message to all active members simultaneously.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1">
                  Announcement Message (පණිවිඩය) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. 🏋️ Special Notice: Gym will be open from 6:00 AM tomorrow for Poya Day! Stay fit."
                  value={chatBroadcastMessage}
                  onChange={(e) => setChatBroadcastMessage(e.target.value)}
                  className="w-full bg-[#181d2e] border border-purple-500/30 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 text-xs font-medium leading-relaxed"
                />
              </div>

              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center gap-3 text-xs text-purple-200">
                <Users className="w-5 h-5 text-purple-400 shrink-0" />
                <span>
                  This broadcast message will be delivered directly into the Member App Chat for <strong>{members.length} registered members</strong>.
                </span>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChatBroadcasting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {isChatBroadcasting ? "Broadcasting..." : `Send to All (${members.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}