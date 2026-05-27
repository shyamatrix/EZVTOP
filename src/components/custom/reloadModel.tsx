"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, AlertCircle, Check } from "lucide-react";

const STEP_ICONS = {
  pending: (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="flex items-center justify-center"
    >
      <Loader2 className="w-3.5 h-3.5 text-blue-400" />
    </motion.div>
  ),
  done: (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex items-center justify-center"
    >
      <Check className="w-3.5 h-3.5 text-emerald-400" />
    </motion.div>
  ),
  error: (
    <div className="flex items-center justify-center">
      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
    </div>
  ),
};

function parseSteps(message: string): { label: string; status: "done" | "error" | "pending" }[] {
  if (!message) return [];
  return message
    .split("\n")
    .filter(Boolean)
    .map((line) => ({
      label: line.replace(/^[✅❌]\s*/, "").trim(),
      status: line.startsWith("✅") ? "done" : line.startsWith("❌") ? "error" : "pending",
    }));
}

interface ReloadModalProps {
  message: string;
  onClose: () => void;
  progressBar: number;
}

export function ReloadModal({ message, onClose, progressBar }: ReloadModalProps) {
  const steps = parseSteps(message);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(id);
  }, []);

  const isDone = progressBar >= 100;
  const hasError = message.includes("❌");

  // SVG Circular progress configurations
  const radius = 54;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius; // ~339.29
  // Safeguard progressBar range 0-100
  const cleanProgress = Math.min(Math.max(progressBar || 0, 0), 100);
  const strokeDashoffset = circumference - (cleanProgress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fadeIn"
    >
      {/* Blurred glass backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-950/85 shadow-2xl backdrop-blur-2xl text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 flex flex-col items-center">
          {/* Circular Progress Area */}
          <div className="relative flex items-center justify-center w-36 h-36 mb-6">
            {/* Soft inner glow ring */}
            <div className="absolute inset-2 rounded-full bg-slate-900 border border-white/5 shadow-inner" />

            {/* Circular SVG Progress */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" /> {/* Amber-500 */}
                  <stop offset="50%" stopColor="#d97706" /> {/* Amber-600 */}
                  <stop offset="100%" stopColor="#eab308" /> {/* Yellow-500 */}
                </linearGradient>
                <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" /> {/* Emerald-500 */}
                  <stop offset="100%" stopColor="#059669" /> {/* Emerald-600 */}
                </linearGradient>
                <linearGradient id="errorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" /> {/* Red-400 */}
                  <stop offset="100%" stopColor="#dc2626" /> {/* Red-600 */}
                </linearGradient>
              </defs>
              
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={strokeWidth}
              />
              
              {/* Dynamic Path */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={hasError ? "url(#errorGrad)" : isDone ? "url(#successGrad)" : "url(#circleGrad)"}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Central display inside the circle */}
            <div className="z-10 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {hasError ? (
                  <motion.div
                    key="error"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-red-500 flex flex-col items-center"
                  >
                    <AlertCircle className="w-10 h-10 mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">Failed</span>
                  </motion.div>
                ) : isDone ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-emerald-400 flex flex-col items-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400/80 mt-1">Ready</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="progress"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-200 to-pink-400 bg-clip-text text-transparent">
                      {cleanProgress}%
                    </span>
                    <span className="text-[9px] uppercase font-semibold tracking-widest text-white/40 mt-1">
                      Syncing
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Heading */}
          <h3 className="text-lg font-bold text-center mb-3 tracking-tight">
            {hasError ? (
              <span className="bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">Sync Interrupted</span>
            ) : isDone ? (
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">All Synchronized</span>
            ) : (
              <span className="bg-gradient-to-r from-blue-200 to-pink-400 bg-clip-text text-transparent text-opacity-90">Refreshing Data{dots}</span>
            )}
          </h3>

          {/* Patience message - Sleek design */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full text-center px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-sm mb-6"
          >
            {hasError ? (
              <p className="text-xs text-red-300/80 leading-relaxed font-light">
                An issue occurred while trying to connect to VTOP or Moodle. Please double-check your credentials and try again.
              </p>
            ) : isDone ? (
              <div className="space-y-1">
                <p className="text-xs text-emerald-300/90 leading-relaxed font-semibold">
                  Thanks for your patience!
                </p>
                <p className="text-[11px] text-white/50 leading-relaxed font-light">
                  Your academic records, schedules, and attendance are now updated.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-blue-200/90 leading-relaxed font-medium animate-pulse">
                  Thanks for your patience!
                </p>
                <p className="text-[11px] text-white/40 leading-relaxed font-light">
                  We are securely fetching your classes, attendance, grades, and moodle portal tasks.
                </p>
              </div>
            )}
          </motion.div>

          {/* Steps Logs */}
          <div className="w-full text-left space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            <div className="text-[9px] uppercase tracking-wider text-white/30 font-semibold mb-1.5 px-1">
              Activity Logs
            </div>
            <AnimatePresence initial={false}>
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.03]"
                >
                  <div className="flex-shrink-0">{STEP_ICONS[step.status]}</div>
                  <span
                    className={`text-xs leading-none font-medium truncate ${
                      step.status === "done"
                        ? "text-gray-300"
                        : step.status === "error"
                        ? "text-red-400"
                        : "text-blue-300/90"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {steps.length === 0 && (
              <p className="text-xs text-white/30 text-center py-4 font-light">
                Initializing safe connection...
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
