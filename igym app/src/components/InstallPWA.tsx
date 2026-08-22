"use client";

import React, { useState, useEffect } from "react";
import { Dumbbell, Download, X, Share, PlusSquare } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    if (isStandalone) return;

    // Check if user dismissed prompt in current session
    const isDismissed = sessionStorage.getItem("igym_pwa_prompt_dismissed");
    if (isDismissed) return;

    // Detect iOS user agent
    const ua = window.navigator.userAgent;
    const isIOSUser = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSUser);

    if (isIOSUser) {
      // Show prompt banner for iOS Safari after a short delay
      const timer = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(timer);
    }

    // Capture standard beforeinstallprompt event for Android/Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSModal(false);
    sessionStorage.setItem("igym_pwa_prompt_dismissed", "true");
  };

  if (!showBanner && !showIOSModal) return null;

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      {showBanner && !showIOSModal && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[9999] bg-[#0d101a]/95 border border-emerald-500/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-emerald-950/50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-[#0d101a] rounded-[10px] flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-emerald-400 transform -rotate-12" />
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                  Install iGYM Member App
                </h4>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Add iGYM to your home screen for quick access to your workouts & membership.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-zinc-500 hover:text-white p-1 transition-colors shrink-0"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-zinc-800/80">
            <button
              onClick={handleDismiss}
              className="flex-1 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all text-center"
            >
              Not now
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d101a] border border-emerald-500/50 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30">
              <div className="w-full h-full bg-[#0d101a] rounded-[14px] flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-emerald-400 transform -rotate-12" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Install iGYM on iOS</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Follow these simple steps in Safari to add iGYM to your iPhone home screen:
              </p>
            </div>

            <div className="bg-[#141824] border border-zinc-800 rounded-xl p-3.5 space-y-3 text-left text-xs font-medium text-zinc-300">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="flex items-center gap-1.5">
                  Tap the <Share className="w-4 h-4 text-emerald-400 inline" /> <strong>Share</strong> icon in Safari toolbar.
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="flex items-center gap-1.5">
                  Scroll down and tap <PlusSquare className="w-4 h-4 text-emerald-400 inline" /> <strong>Add to Home Screen</strong>.
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in top-right corner to launch iGYM instantly!
                </span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
