"use client";

import React, { useState } from "react";
import { CreditCard, Plus, Trash2, TrendingUp, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { GymPackage } from "@/app/dashboard/page";

interface PackagePricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymPackages: GymPackage[];
  setGymPackages: React.Dispatch<React.SetStateAction<GymPackage[]>>;
  defaultOfficialGymPackages: GymPackage[];
}

export default function PackagePricingModal({
  isOpen,
  onClose,
  gymPackages,
  setGymPackages,
  defaultOfficialGymPackages,
}: PackagePricingModalProps) {
  const [showAddNewPackageCard, setShowAddNewPackageCard] = useState(false);
  const [newPackageForm, setNewPackageForm] = useState({
    name: "",
    price: 5000,
    billingCycle: "Monthly" as "Monthly" | "Annual" | "Per Session" | "Daily",
    description: "",
    badge: "Standard",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#101420] border border-cyan-500/40 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Gym Packages & Pricing Manager
              </h3>
              <p className="text-xs text-cyan-300/80">
                Customize gym membership packages, adjust fees, and add new tiers for your members.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Actions & Reset to Official iGYM Rates */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171d2e] p-3 rounded-xl border border-cyan-900/40">
          <span className="text-xs font-mono text-cyan-300 font-bold">
            Active Membership Packages: <strong className="text-white text-sm">{gymPackages.length} Tiers</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                if (confirm("Reset packages in Supabase database to official iGYM Balangoda price list?")) {
                  try {
                    await supabase.from("gym_packages").delete().not("package_name", "is", null);
                    const newOfficial: GymPackage[] = [];
                    for (const p of defaultOfficialGymPackages) {
                      const { data: insData } = await supabase
                        .from("gym_packages")
                        .insert([
                          {
                            package_name: p.name,
                            price: p.price,
                            billing_cycle: p.billingCycle,
                            description: p.description,
                            badge: p.badge,
                          },
                        ])
                        .select()
                        .single();
                      if (insData) {
                        const actualName = insData.package_name || p.name;
                        newOfficial.push({
                          id: String(insData.id),
                          name: actualName,
                          package_name: actualName,
                          price: Number(insData.price),
                          billingCycle: insData.billing_cycle || p.billingCycle,
                          description: insData.description || p.description,
                          badge: insData.badge || p.badge,
                        });
                      }
                    }
                    setGymPackages(newOfficial);
                    alert("✅ Gym Packages reset to official rates in Supabase DB!");
                  } catch (e: any) {
                    alert(`⚠️ Failed to reset packages in database: ${e.message}`);
                  }
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all border border-zinc-700 cursor-pointer"
              title="Reset to official iGYM Fitness Center pricing tiers"
            >
              Reset Official Rates 🔄
            </button>
            <button
              onClick={() => setShowAddNewPackageCard(!showAddNewPackageCard)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {showAddNewPackageCard ? "Close Form" : "Add New Package"}
            </button>
          </div>
        </div>

        {/* Long-Term Membership Discount Rules Banner */}
        <div className="bg-gradient-to-r from-cyan-950/60 via-[#111927] to-cyan-950/40 border border-cyan-500/40 rounded-xl p-3.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Official Long-Term Membership Discount Rules
            </h4>
            <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-400/40">
              Automatic Rules Active 🏷️
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
            <div className="bg-[#0b111e] p-2 rounded-xl border border-cyan-500/30">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">03 Month Package</span>
              <span className="text-sm font-extrabold text-lime-400">10% OFF</span>
            </div>
            <div className="bg-[#0b111e] p-2 rounded-xl border border-cyan-500/30">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">06 Month Package</span>
              <span className="text-sm font-extrabold text-cyan-300">20% OFF</span>
            </div>
            <div className="bg-[#0b111e] p-2 rounded-xl border border-cyan-500/30">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">12 Month Package</span>
              <span className="text-sm font-extrabold text-amber-300">30% OFF</span>
            </div>
          </div>
        </div>

        {/* Add New Package Card */}
        {showAddNewPackageCard && (
          <div className="bg-[#151b2a] border border-cyan-500/50 rounded-xl p-4 space-y-3 shadow-lg animate-in slide-in-from-top-3 duration-200">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Create Custom Package
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Package Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Student Discount Membership"
                  value={newPackageForm.name}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, name: e.target.value })}
                  className="w-full bg-[#0d121c] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Price (LKR) *</label>
                <input
                  type="number"
                  value={newPackageForm.price}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, price: Number(e.target.value) })}
                  className="w-full bg-[#0d121c] border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Billing Cycle</label>
                <select
                  value={newPackageForm.billingCycle}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, billingCycle: e.target.value as any })}
                  className="w-full bg-[#0d121c] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500 font-bold"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                  <option value="Per Session">Per Session</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Access to all gym equipment during off-peak hours..."
                value={newPackageForm.description}
                onChange={(e) => setNewPackageForm({ ...newPackageForm, description: e.target.value })}
                className="w-full bg-[#0d121c] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddNewPackageCard(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newPackageForm.name.trim()) {
                    alert("Please enter a package name!");
                    return;
                  }

                  try {
                    const pkgNameVal = newPackageForm.name.trim();
                    const { data: insData, error: insErr } = await supabase
                      .from("gym_packages")
                      .insert([
                        {
                          package_name: pkgNameVal,
                          price: Number(newPackageForm.price),
                          billing_cycle: newPackageForm.billingCycle,
                          description: newPackageForm.description || "Gym membership access pass",
                          badge: newPackageForm.badge,
                        },
                      ])
                      .select();

                    if (!insErr && insData && insData.length > 0) {
                      const item = insData[0];
                      const actualName = item.package_name || pkgNameVal;
                      const createdPkg: GymPackage = {
                        id: String(item.id),
                        name: actualName,
                        package_name: actualName,
                        price: Number(item.price),
                        billingCycle: item.billing_cycle || newPackageForm.billingCycle,
                        description: item.description || "",
                        badge: item.badge || newPackageForm.badge,
                      };
                      setGymPackages((prev) => [...prev, createdPkg]);
                      setNewPackageForm({
                        name: "",
                        price: 5000,
                        billingCycle: "Monthly",
                        description: "",
                        badge: "Standard",
                      });
                      setShowAddNewPackageCard(false);
                    } else if (insErr) {
                      alert(`⚠️ Failed to save package to database: ${insErr.message}`);
                    }
                  } catch (dbErr: any) {
                    alert(`⚠️ Exception creating package in database: ${dbErr.message}`);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-black font-extrabold text-xs shadow-md cursor-pointer"
              >
                Save New Package
              </button>
            </div>
          </div>
        )}

        {/* Gym Packages List Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gymPackages.length > 0 ? (
            gymPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-[#161c2c] border border-zinc-800 hover:border-cyan-500/50 rounded-xl p-4 space-y-2.5 transition-all shadow-md group relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                    {pkg.badge}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                      {pkg.billingCycle}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const targetPkgName = pkg.package_name || pkg.name;
                        if (confirm(`Are you sure you want to delete package "${targetPkgName}" from database?`)) {
                          try {
                            const { error: delErr } = await supabase
                              .from("gym_packages")
                              .delete()
                              .or(`id.eq.${pkg.id},package_name.eq.${targetPkgName}`);

                            if (!delErr) {
                              setGymPackages((prev) => prev.filter((p) => p.id !== pkg.id));
                            } else {
                              alert(`⚠️ Failed to delete package from database: ${delErr.message}`);
                            }
                          } catch (delErr: any) {
                            alert(`⚠️ Exception deleting package: ${delErr.message}`);
                          }
                        }
                      }}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Delete Package from Database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-white text-sm">{pkg.package_name || pkg.name}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{pkg.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400">Price (LKR):</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-cyan-400 font-mono">Rs.</span>
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={async (e) => {
                        const val = Number(e.target.value);
                        const targetPkgName = pkg.package_name || pkg.name;
                        setGymPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, price: val } : p)));
                        try {
                          await supabase
                            .from("gym_packages")
                            .update({ price: val })
                            .or(`id.eq.${pkg.id},package_name.eq.${targetPkgName}`);
                        } catch (updErr) {
                          console.error("Database package price update notice:", updErr);
                        }
                      }}
                      className="w-24 bg-[#0d121c] border border-cyan-500/40 rounded-lg px-2 py-1 text-white font-mono font-extrabold text-xs text-right focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-8 text-center bg-[#141a29] border border-zinc-800 rounded-xl space-y-2">
              <CreditCard className="w-8 h-8 text-cyan-500/40 mx-auto" />
              <p className="text-xs text-zinc-400 font-medium">
                No gym packages found in database. Click "Add New Package" above to create one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
