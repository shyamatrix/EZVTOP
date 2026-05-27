"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, Clock, MessageSquare, Award, Zap, Eye, EyeOff } from "lucide-react";

interface StatsCardsProps {
  attendancePercentage: {
    percentage?: string;
    str?: string;
    [key: string]: any;
  };
  ODhoursData: any[];
  setODhoursIsOpen: (isOpen: boolean) => void;
  marksData: {
    cgpa?: {
      cgpa?: string;
      creditsEarned?: string | number;
      nonGradedRequirement?: string | number;
    };
    [key: string]: any;
  };
  feedbackStatus?: {
    MidSem?: { Curriculum: boolean; Course: boolean };
    EndSem?: { Curriculum: boolean; Course: boolean };
  };
  setGradesDisplayIsOpen: (isOpen: boolean) => void;
  CGPAHidden: boolean;
  setCGPAHidden: (hidden: boolean) => void;
  attendancePercentageOrString: string;
  setAttendancePercentageOrString: (type: string) => void;
}

export default function StatsCards({
  attendancePercentage,
  ODhoursData,
  setODhoursIsOpen,
  marksData,
  feedbackStatus,
  setGradesDisplayIsOpen,
  CGPAHidden,
  setCGPAHidden,
  attendancePercentageOrString,
  setAttendancePercentageOrString,
}: StatsCardsProps) {
  const totalODHours =
    ODhoursData && ODhoursData.length > 0 && ODhoursData[0].courses
      ? ODhoursData.reduce((sum, day) => sum + day.total, 0)
      : 0;

  const cardBase =
    "relative overflow-hidden cursor-pointer p-6 rounded-3xl backdrop-blur-xl border flex flex-col justify-between transition-all duration-300 group";

  // Common glassmorphism classes with amber/yellow themed borders and gradients
  const glassStyle =
    "bg-white/30 dark:bg-zinc-950/40 border-white/20 dark:border-zinc-800/60 shadow-[0_8px_32px_0_rgba(251,191,36,0.05)] hover:shadow-[0_12px_40px_0_rgba(251,191,36,0.1)]";

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Attendance Card - Spans 2 columns */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`${cardBase} ${glassStyle} col-span-2`}
          onClick={() =>
            setAttendancePercentageOrString(
              attendancePercentageOrString === "percentage" ? "str" : "percentage"
            )
          }
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all duration-500"></div>
          
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-blue-400">
              Attendance
            </span>
            <div className="p-2 rounded-2xl bg-blue-100 dark:bg-pink-500/10 text-pink-600 dark:text-blue-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-6 flex flex-col">
            <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight select-none">
              {attendancePercentage[attendancePercentageOrString] || "0%"}
            </span>
            <span className="text-[10px] mt-2 text-gray-500 dark:text-zinc-400 font-medium">
              Tap to show {attendancePercentageOrString === "percentage" ? "details" : "percentage"}
            </span>
          </div>
        </motion.div>

        {/* CGPA Card - Spans 2 columns if Feedback is missing, or is placed side-by-side */}
        {marksData?.cgpa && (
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${cardBase} ${glassStyle} col-span-2`}
            onClick={() => setCGPAHidden(!CGPAHidden)}
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all duration-500"></div>
            
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-blue-400">
                CGPA Tracker
              </span>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-yellow-100 dark:bg-pink-500/10 text-pink-600 dark:text-blue-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight select-none">
                  {CGPAHidden ? "•••" : marksData?.cgpa?.cgpa}
                </span>
                <span className="text-[10px] mt-2 text-gray-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                  {CGPAHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  Tap to {CGPAHidden ? "reveal" : "hide"} CGPA
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* OD Hours Card - Spans 1 column */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`${cardBase} ${glassStyle} col-span-1`}
          onClick={() => setODhoursIsOpen(true)}
        >
          <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-orange-400/10 rounded-full blur-2xl group-hover:bg-orange-400/20 transition-all duration-500"></div>
          
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-orange-400">
              OD Hours
            </span>
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-pink-500/10 text-pink-600 dark:text-orange-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-6">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {totalODHours}
            </span>
            <span className="text-xs font-semibold text-gray-400 block mt-1">
              / 40 limit
            </span>
          </div>
        </motion.div>

        {/* Credits Earned Card - Spans 1 column */}
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`${cardBase} ${glassStyle} col-span-1`}
          onClick={() => setGradesDisplayIsOpen(true)}
        >
          <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all duration-500"></div>
          
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-blue-400">
              Credits
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-pink-500/10 text-pink-600 dark:text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-6">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {Number(marksData?.cgpa?.creditsEarned || 0) + Number(marksData?.cgpa?.nonGradedRequirement || 0)}
            </span>
            <span className="text-xs font-semibold text-gray-400 block mt-1">
              Earned
            </span>
          </div>
        </motion.div>

        {/* Feedback Card - Spans 2 columns if present */}
        {feedbackStatus && (
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${cardBase} ${glassStyle} col-span-2`}
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-400/5 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase tracking-wider font-semibold text-pink-600 dark:text-blue-400">
                Feedback Status
              </span>
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-pink-500/10 text-pink-600 dark:text-blue-400">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            
            <div className="mt-4 flex gap-4 items-center justify-between">
              <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-medium block">
                  Mid Sem
                </span>
                <span
                  className={`text-xs font-black uppercase mt-1 block ${
                    feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-rose-500 dark:text-rose-400"
                  }`}
                >
                  {feedbackStatus?.MidSem?.Curriculum && feedbackStatus?.MidSem?.Course
                    ? "Done"
                    : "Pending"}
                </span>
              </div>
              
              <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-2xl p-2.5 text-center">
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-medium block">
                  End Sem
                </span>
                <span
                  className={`text-xs font-black uppercase mt-1 block ${
                    feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-rose-500 dark:text-rose-400"
                  }`}
                >
                  {feedbackStatus?.EndSem?.Curriculum && feedbackStatus?.EndSem?.Course
                    ? "Done"
                    : "Pending"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
        
      </div>
    </div>
  );
}
