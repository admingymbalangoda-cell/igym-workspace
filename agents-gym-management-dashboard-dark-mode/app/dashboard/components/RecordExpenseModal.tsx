"use client";

import React from "react";
import { TrendingDown, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseFormData: any;
  setExpenseFormData: (data: any) => void;
  setExpenseRecords: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function RecordExpenseModal({
  isOpen,
  onClose,
  expenseFormData,
  setExpenseFormData,
  setExpenseRecords,
}: RecordExpenseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#120e17] border border-rose-500/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Record Gym Expense</h3>
              <p className="text-xs text-rose-300/80">Log operational costs, bills, equipment maintenance & salaries.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!expenseFormData.amount || expenseFormData.amount <= 0) {
              alert("Please enter a valid expense amount!");
              return;
            }

            const expId = `EXP-${Date.now().toString().slice(-4)}`;
            const expDate = expenseFormData.date || new Date().toISOString().split("T")[0];
            const expCategory = expenseFormData.category;
            const expAmount = Number(expenseFormData.amount);
            const expDesc = expenseFormData.description || "General operational expense";
            const expRecordedBy = expenseFormData.recordedBy || "Admin";

            const newExpensePayload = {
              expense_id: expId,
              date: expDate,
              category: expCategory,
              amount: expAmount,
              description: expDesc,
              recorded_by: expRecordedBy,
            };

            try {
              const { data: insertData, error: insertError } = await supabase
                .from("expenses")
                .insert([newExpensePayload])
                .select();

              if (insertError) {
                console.error("Insert Error:", insertError);
                alert(`Failed to save expense to database: ${insertError.message}`);
                return;
              }

              const createdDbItem = insertData && insertData.length > 0 ? insertData[0] : null;

              const newExp = {
                id: String(createdDbItem?.expense_id || createdDbItem?.id || expId),
                dbUuid: createdDbItem?.id,
                date: expDate,
                category: expCategory,
                amount: expAmount,
                description: expDesc,
                recordedBy: expRecordedBy,
              };

              setExpenseRecords((prev) => [newExp, ...prev]);
              onClose();
              setExpenseFormData({
                date: new Date().toISOString().split("T")[0],
                category: "Electricity & Utility Bills",
                amount: 5000,
                description: "",
                recordedBy: "Owner",
              });
            } catch (err) {
              console.error("Insert Error:", err);
              alert("Failed to save expense due to an unexpected error.");
            }
          }}
          className="space-y-4 text-xs sm:text-sm"
        >
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Expense Category *</label>
            <select
              value={expenseFormData.category}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value as any })}
              className="w-full bg-[#17121e] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
            >
              <option value="Electricity & Utility Bills">Electricity & Utility Bills</option>
              <option value="Equipment & Maintenance">Equipment & Maintenance</option>
              <option value="Staff Salaries & Wages">Staff Salaries & Wages</option>
              <option value="Rent & Property">Rent & Property</option>
              <option value="Supplements Stock">Supplements Stock</option>
              <option value="Marketing & Ads">Marketing & Ads</option>
              <option value="Other">Other Miscellaneous Expenses</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Amount in LKR *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="5000"
                value={expenseFormData.amount || ""}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: Number(e.target.value) })}
                className="w-full bg-[#17121e] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={expenseFormData.date}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                className="w-full bg-[#17121e] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Description / Note</label>
            <input
              type="text"
              placeholder="e.g. Monthly Electricity Bill payment or pulley replacement"
              value={expenseFormData.description}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
              className="w-full bg-[#17121e] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Recorded By</label>
            <input
              type="text"
              value={expenseFormData.recordedBy}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, recordedBy: e.target.value })}
              className="w-full bg-[#17121e] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/40"
            >
              Save Expense Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
