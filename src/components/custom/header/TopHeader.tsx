"use client";
import { useState, useEffect } from "react";
import { RefreshCcw, CheckCircle2, Clock } from "lucide-react";
import { IconToggle } from "../toggle";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(date: Date | null): string {
  if (!date) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TopHeader({ handleReloadRequest }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeStr, setTimeStr] = useState("");

  // Load last refresh time from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("lastRefreshTime");
    if (stored) setLastRefresh(new Date(stored));
  }, []);

  // Update "time ago" label every 30s
  useEffect(() => {
    const update = () => setTimeStr(timeAgo(lastRefresh));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [lastRefresh]);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setShowSuccess(false);
    try {
      await handleReloadRequest();
      const now = new Date();
      setLastRefresh(now);
      localStorage.setItem("lastRefreshTime", now.toISOString());
      setTimeStr(timeAgo(now));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between px-5 py-3 bg-white/70 dark:bg-slate-900/70 midnight:bg-zinc-950/60 backdrop-blur-xl border-b border-pink-500/10 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-pink-500/30 ring-2 ring-white/20 dark:ring-black/20">
          E
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-400 drop-shadow-sm">
          UniCC
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <IconToggle />

        {/* Refresh pill button */}
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 overflow-hidden
            ${isLoading
              ? "bg-pink-500/10 border-pink-500/20 cursor-not-allowed"
              : showSuccess
              ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20 hover:shadow-md hover:shadow-pink-500/20 active:scale-95"
            }`}
        >
          {/* Shimmer sweep while loading */}
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
          )}

          {/* Icon */}
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </motion.div>
            ) : (
              <motion.div
                key="refresh"
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={isLoading
                  ? { repeat: Infinity, duration: 0.8, ease: "linear" }
                  : { duration: 0.3 }
                }
              >
                <RefreshCcw className={`w-4 h-4 ${isLoading ? "text-pink-500" : showSuccess ? "text-emerald-500" : "text-pink-500"}`} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text + time */}
          <div className="flex flex-col items-start leading-none">
            <span className={`text-[11px] font-bold ${showSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-pink-600 dark:text-blue-400"}`}>
              {isLoading ? "Syncing…" : showSuccess ? "Updated!" : "Refresh"}
            </span>
            {timeStr && !isLoading && (
              <span className="flex items-center gap-0.5 text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {timeStr}
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
