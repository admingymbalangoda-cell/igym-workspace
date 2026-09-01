"use client";

import React, { useState } from "react";
import { RefreshCw, Search, Send, TrendingUp, X, Zap } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Member } from "@/app/dashboard/page";

interface ActiveRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onOpenBulkActivate: () => void;
  selectedBulkInactiveMemberIds: string[];
  setSelectedBulkInactiveMemberIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ActiveRateModal({
  isOpen,
  onClose,
  members,
  onOpenBulkActivate,
  selectedBulkInactiveMemberIds,
  setSelectedBulkInactiveMemberIds,
}: ActiveRateModalProps) {
  const [activeRateSearchQuery, setActiveRateSearchQuery] = useState("");
  const [activeRateTabFilter, setActiveRateTabFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendReminder = async (mem: Member) => {
    setSendingReminderId(mem.id);
    try {
      const reminderText = `Hello ${mem.name || "Member"}, this is an automated reminder that your gym membership is expiring/has expired. Please renew at the front desk. Thank you!`;
      const { error } = await supabase.from("chat_messages").insert([
        {
          member_id: mem.id,
          sender_id: "admin",
          receiver_id: mem.id,
          message: reminderText,
        },
      ]);

      if (error) {
        console.error("⚠️ Failed to send in-app renewal reminder:", error.message);
        alert(`⚠️ Could not send in-app reminder: ${error.message}`);
      } else {
        alert(`In-app reminder sent to ${mem.name}!`);
      }
    } catch (err: any) {
      console.error("⚠️ Exception sending in-app reminder:", err);
      alert(`⚠️ Error sending reminder: ${err?.message || err}`);
    } finally {
      setSendingReminderId(null);
    }
  };

  const checkIsMemberExpired = (m: any): boolean => {
    const statusLower = (m.status || "").toString().trim().toLowerCase();
    if (statusLower === "inactive" || statusLower === "expired") {
      return true;
    }
    const expVal = m.expiry_date || m.expiryDate;
    if (expVal) {
      const expDate = new Date(expVal);
      if (!isNaN(expDate.getTime()) && expDate < new Date()) {
        return true;
      }
    }
    return false;
  };

  const activeMembersList = members.filter((m) => !checkIsMemberExpired(m));
  const inactiveMembersList = members.filter((m) => checkIsMemberExpired(m));

  const currentFilteredMembers = members
    .filter((m) => {
      const isExpired = checkIsMemberExpired(m);
      if (activeRateTabFilter === "ACTIVE") return !isExpired;
      if (activeRateTabFilter === "INACTIVE") return isExpired;
      return true;
    })
    .filter((m) => {
      const q = activeRateSearchQuery.trim().toLowerCase();
      if (!q) return true;
      const fullName = (m.name || (m as any).full_name || "").toLowerCase();
      const memberId = (m.id || (m as any).member_id || "").toLowerCase();
      const phone = (m.phone || "").toLowerCase();
      return fullName.includes(q) || memberId.includes(q) || phone.includes(q);
    });

  const currentInactiveMembers = currentFilteredMembers.filter((m) => checkIsMemberExpired(m));
  const allCurrentInactiveSelected =
    currentInactiveMembers.length > 0 &&
    currentInactiveMembers.every((m) => selectedBulkInactiveMemberIds.includes(m.id));

  const handleSelectAllInactiveToggle = () => {
    if (allCurrentInactiveSelected) {
      const inactiveIdSet = new Set(currentInactiveMembers.map((m) => m.id));
      setSelectedBulkInactiveMemberIds((prev) => prev.filter((id) => !inactiveIdSet.has(id)));
    } else {
      const newIds = currentInactiveMembers.map((m) => m.id);
      setSelectedBulkInactiveMemberIds((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const getPackageColorClasses = (tier?: string | null) => {
    const t = (tier || "").toLowerCase();
    if (t.includes("men")) {
      return "bg-blue-500/15 text-blue-300 border-blue-500/40";
    }
    if (t.includes("ladies") || t.includes("women")) {
      return "bg-pink-500/15 text-pink-300 border-pink-500/40";
    }
    if (t.includes("student")) {
      return "bg-yellow-500/15 text-yellow-300 border-yellow-500/40";
    }
    if (t.includes("couple") || t.includes("family")) {
      return "bg-purple-500/15 text-purple-300 border-purple-500/40";
    }
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#150f14] border border-pink-500/40 w-full max-w-6xl rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Active vs Inactive Rate Analysis
              </h3>
              <p className="text-xs text-pink-300/80">
                Comprehensive status breakdown of all gym members and one-click renewal reminders.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticky Filter Tabs, Search & Bulk Activate Controls */}
        <div className="sticky top-0 z-20 bg-[#150f14] py-2 border-b border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-[#1d121b] p-1 rounded-xl border border-zinc-800 flex-wrap">
            <button
              onClick={() => setActiveRateTabFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeRateTabFilter === "ALL" ? "bg-pink-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setActiveRateTabFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeRateTabFilter === "ACTIVE" ? "bg-lime-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Active 🟢 ({activeMembersList.length})
            </button>
            <button
              onClick={() => setActiveRateTabFilter("INACTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                activeRateTabFilter === "INACTIVE" ? "bg-rose-500 text-white shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Expired / Inactive 🔴 ({inactiveMembersList.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Bulk Activate Button */}
            <button
              onClick={onOpenBulkActivate}
              disabled={selectedBulkInactiveMemberIds.length === 0}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
              title="Select inactive members via checkboxes below and click to bulk activate"
            >
              <Zap className="w-3.5 h-3.5 fill-black" /> Bulk Activate Selected ({selectedBulkInactiveMemberIds.length})
            </button>

            {/* Sticky Search Bar */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search active members..."
                value={activeRateSearchQuery}
                onChange={(e) => setActiveRateSearchQuery(e.target.value)}
                className="w-full bg-[#1d121b] border border-pink-500/30 rounded-xl pl-10 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Members Status Table */}
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-zinc-800 sticky top-0 bg-[#150f14]">
                <th className="pb-3 pl-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentInactiveSelected}
                    onChange={handleSelectAllInactiveToggle}
                    disabled={currentInactiveMembers.length === 0}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer disabled:opacity-30"
                    title="Select / Deselect all inactive members in view"
                  />
                </th>
                <th className="pb-3 pl-2">MEMBER & PHONE</th>
                <th className="pb-3">CATEGORY</th>
                <th className="pb-3 whitespace-nowrap">JOINED DATE</th>
                <th className="pb-3 whitespace-nowrap">EXPIRE DATE</th>
                <th className="pb-3 whitespace-nowrap">STATUS</th>
                <th className="pb-3 pr-2 text-right whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {currentFilteredMembers.map((mem) => {
                const isExpired = checkIsMemberExpired(mem);
                const isSelected = selectedBulkInactiveMemberIds.includes(mem.id);

                return (
                  <tr key={mem.id} className={`hover:bg-zinc-800/40 transition-colors ${isSelected ? "bg-emerald-950/20" : ""}`}>
                    <td className="py-3 pl-2 w-10 text-center">
                      {isExpired ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBulkInactiveMemberIds((prev) => [...prev, mem.id]);
                            } else {
                              setSelectedBulkInactiveMemberIds((prev) => prev.filter((id) => id !== mem.id));
                            }
                          }}
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                        />
                      ) : (
                        <span className="text-zinc-600 font-mono text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3 pl-2">
                      <h4 className="font-bold text-white text-xs sm:text-sm">{mem.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">{mem.phone}</span>
                    </td>
                    <td className="py-3 text-xs">
                      <span className={`px-2.5 py-1 rounded font-bold border text-[10px] ${getPackageColorClasses(mem.tier)}`}>
                        {mem.tier || "No Active Plan"}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-zinc-400 text-xs whitespace-nowrap">{mem.joinDate}</td>
                    <td className="py-3 font-mono text-xs text-pink-300 font-semibold whitespace-nowrap">
                      {mem.expiryDate ? mem.expiryDate : "N/A"}
                    </td>
                    <td className="py-3 text-xs whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          !isExpired
                            ? "bg-lime-500/20 text-lime-300 border border-lime-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {!isExpired ? "Active 🟢" : "Inactive/Expired 🔴"}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right whitespace-nowrap">
                      {isExpired ? (
                        <button
                          onClick={() => handleSendReminder(mem)}
                          disabled={sendingReminderId === mem.id}
                          className="px-4 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                          {sendingReminderId === mem.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Remind Renew
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Up to date</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-xs text-pink-300 font-mono">
            Overall Active Membership Rate:{" "}
            <strong className="text-pink-400">
              {members.length > 0 ? ((activeMembersList.length / members.length) * 100).toFixed(1) : "0.0"}%
            </strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
