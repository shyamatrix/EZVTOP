"use client";

import { motion } from "framer-motion";
import { Building2, Clock, User, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface CourseCardProps {
  a: {
    courseTitle: string;
    slotName: string;
    slotVenue: string;
    time: string;
    faculty: string;
    attendedClasses: number;
    totalClasses: number;
    attendancePercentage: number;
  };
  onClick: () => void;
  activeDay: string;
  isHoliday: boolean;
  decimalValues: boolean;
}

export default function CourseCard({
  a,
  onClick,
  activeDay,
  isHoliday,
  decimalValues,
}: CourseCardProps) {
  const [ongoing, setOngoing] = useState(false);
  const lab = a.slotName.split("")[0] === "L";
  const attendanceVal = a.attendancePercentage;

  const isOngoing = () => {
    if (!a.time || !activeDay) return false;

    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();
    if (!today.startsWith(activeDay.slice(0, 3).toUpperCase())) return false;

    const [startStr, endStr] = a.time.split("-").map((t) => t.trim());
    if (!startStr || !endStr) return false;

    const parseTime = (str: string) => {
      const [hour, minute] = str.split(":").map(Number);
      const d = new Date();
      let h = hour;
      let m = minute || 0;
      if (h < 8) h += 12;
      d.setHours(h, m, 0, 0);
      return d;
    };

    const start = parseTime(startStr);
    const end = parseTime(endStr);
    const now = new Date();

    return now >= start && now <= end;
  };

  useEffect(() => {
    setOngoing(isOngoing());
  }, [a.time, activeDay]);

  // Determine status styling
  let statusColor = "text-rose-500 dark:text-rose-400";
  let accentBorder = "border-l-rose-500";
  let statusIcon = <XCircle className="w-4 h-4 text-rose-500" />;
  
  if (attendanceVal >= 85) {
    statusColor = "text-emerald-500 dark:text-emerald-400";
    accentBorder = "border-l-emerald-500";
    statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  } else if (attendanceVal >= 75) {
    statusColor = "text-pink-500 dark:text-blue-400";
    accentBorder = "border-l-pink-500";
    statusIcon = <AlertTriangle className="w-4 h-4 text-pink-500" />;
  }

  // Calculate class forecasts
  const attended = a.attendedClasses;
  const total = a.totalClasses;
  const percentage = total > 0 ? (attended / total) * 100 : 0;

  let forecastText = "";
  let forecastType: "low" | "critical" | "good" = "good";

  if (total > 0) {
    if (percentage < 75) {
      const needed = Math.ceil((0.75 * total - attended) / (1 - 0.75));
      const neededValue = lab ? Math.ceil(needed / 2) : needed;
      forecastText = `Attend next ${neededValue} class${neededValue > 1 ? "es" : ""} to reach 75%`;
      forecastType = "critical";
    } else {
      const canMiss = Math.floor(attended / 0.75 - total);
      const canMissValue = lab ? Math.floor(canMiss / 2) : canMiss;
      if (canMissValue === 0) {
        forecastText = "On the edge! Don't miss next class";
        forecastType = "low";
      } else {
        forecastText = `Safe to miss next ${canMissValue} class${canMissValue > 1 ? "es" : ""}`;
        forecastType = "good";
      }
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer rounded-3xl p-5 border-l-4 ${accentBorder} border border-white/20 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/45 backdrop-blur-xl flex flex-col justify-between h-full transition-all duration-300 ${
        ongoing && !isHoliday
          ? "shadow-[0_0_25px_0_rgba(251,191,36,0.15)] ring-1 ring-blue-400/50"
          : "shadow-md hover:shadow-xl hover:shadow-pink-500/5"
      }`}
    >
      {/* Ongoing Class Spotlight */}
      {ongoing && !isHoliday && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-500/20 to-transparent text-[9px] font-bold text-pink-600 dark:text-blue-400 px-3 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
          Ongoing Class
        </div>
      )}

      {/* Main Ticket Layout */}
      <div className="flex justify-between items-start gap-4">
        {/* Left Side Info */}
        <div className="flex-1 space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-blue-400 tracking-wider">
              {a.slotName}
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mt-0.5 tracking-tight leading-tight">
              {a.courseTitle}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs text-gray-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate font-medium">{a.slotVenue}</span>
            </div>
            
            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate font-medium">{a.time}</span>
            </div>
            
            <div className="flex items-center gap-1.5 col-span-2 min-w-0">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate font-medium">{a.faculty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Tear Dotted Separator */}
      <div className="my-4 relative flex items-center justify-between">
        <div className="w-3 h-6 rounded-r-full bg-background border-y border-r border-white/20 dark:border-zinc-800/60 -ml-5 flex-shrink-0"></div>
        <div className="flex-1 border-t border-dashed border-gray-300 dark:border-zinc-800 mx-2"></div>
        <div className="w-3 h-6 rounded-l-full bg-background border-y border-l border-white/20 dark:border-zinc-800/60 -mr-5 flex-shrink-0"></div>
      </div>

      {/* Lower Ticket Stub - Class Forecast Section */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Forecast
          </span>
        </div>
        
        {total > 0 ? (
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              forecastType === "critical"
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : forecastType === "low"
                ? "bg-pink-500/10 text-pink-500 border-pink-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}
          >
            {forecastText}
          </span>
        ) : (
          <span className="text-xs font-bold text-gray-400">No classes held yet</span>
        )}
      </div>

      {/* Sleek bottom percentage progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full ${
            attendanceVal < 75 
              ? "bg-rose-500" 
              : attendanceVal < 85 
              ? "bg-blue-400" 
              : "bg-emerald-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${attendanceVal}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
