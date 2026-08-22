"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Lock, Mail, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorNotice("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorNotice("");

    const targetEmail = email.trim();

    try {
      // 1. Authenticate strictly with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password,
      });

      if (authError) {
        setErrorNotice(authError.message || "Invalid login credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      // 2. Successful Supabase Auth Login
      if (authData?.user) {
        const user = authData.user;
        let userRole = "staff";
        let userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

        // Query admin_roles table for the user's role metadata
        try {
          const { data: roleData } = await supabase
            .from("admin_roles")
            .select("role, full_name")
            .eq("email", user.email)
            .maybeSingle();

          if (roleData?.role) {
            const rawRole = String(roleData.role).toLowerCase();
            if (rawRole.includes("owner") || rawRole.includes("super")) {
              userRole = "owner";
            } else if (rawRole.includes("dev") || rawRole.includes("admin")) {
              userRole = "developer";
            } else {
              userRole = "staff";
            }
          } else {
            const emailLower = (user.email || "").toLowerCase();
            if (emailLower.includes("owner")) userRole = "owner";
            else if (emailLower.includes("dev")) userRole = "developer";
          }

          if (roleData?.full_name) {
            userName = roleData.full_name;
          }
        } catch (roleErr) {
          console.error("admin_roles query error:", roleErr);
        }

        // Store user display metadata
        try {
          localStorage.setItem("userRole", userRole);
          localStorage.setItem("userName", userName);
          localStorage.setItem("userEmail", user.email || targetEmail);
        } catch (e) {
          console.warn("⚠️ localStorage save warning:", e);
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Login catch handler:", err);
      setErrorNotice(err?.message || "Sign in failed. Please check your connection and credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/20 to-pink-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0e1018]/90 border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-7 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-[#07070a] rounded-[14px] flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-cyan-400 transform -rotate-12" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            IGYM Portal Log In <Sparkles className="w-4 h-4 text-cyan-400" />
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in with your registered account credentials to access the portal.
          </p>
        </div>

        {/* Error Notice */}
        {errorNotice && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Dedicated Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131622] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131622] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-black" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="pt-2 border-t border-zinc-800/80 text-center">
          <p className="text-[11px] text-zinc-500">
            IGYM Management System • Role-Based Access Control Active
          </p>
        </div>
      </div>
    </div>
  );
}
