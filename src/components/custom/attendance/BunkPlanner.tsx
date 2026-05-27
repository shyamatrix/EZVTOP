"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Sparkles, Minus, Plus } from "lucide-react";

interface Course {
  courseCode: string;
  courseTitle: string;
  slotName: string;
  faculty: string;
  attendedClasses: number;
  totalClasses: number;
  attendancePercentage: number;
}

export default function BunkPlanner({ attendance }: { attendance: Course[] }) {
  // Keyed by courseCode
  const [simulatedClasses, setSimulatedClasses] = useState<Record<string, { skip: number; attend: number }>>({});

  const handleSimulate = (courseCode: string, type: "skip" | "attend", change: number) => {
    setSimulatedClasses((prev) => {
      const current = prev[courseCode] || { skip: 0, attend: 0 };
      const nextVal = Math.max(0, current[type] + change);

      return {
        ...prev,
        [courseCode]: {
          skip: type === "skip" ? nextVal : 0,
          attend: type === "attend" ? nextVal : 0,
        },
      };
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Description */}
      <div className="px-1 text-center sm:text-left mt-2">
        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
          Bunk planner
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-lg">
          Plan your bunks responsibly. Check how many classes you can afford to miss, or simulate attendance changes in real-time.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance.map((course, idx) => {
          const courseCode = course.courseCode;
          const lab = courseCode.endsWith("(L)");
          const attended = course.attendedClasses;
          const total = course.totalClasses;
          
          const currentPercent = course.attendancePercentage;

          // Attendance criteria safety calculations
          const isLow = currentPercent < 75;
          let recoveryCount = 0;
          let safeMissCount = 0;

          if (isLow) {
            const needed = Math.ceil((0.75 * total - attended) / 0.25);
            recoveryCount = lab ? Math.ceil(needed / 2) : needed;
          } else {
            const canMiss = Math.floor(attended / 0.75 - total);
            safeMissCount = lab ? Math.floor(canMiss / 2) : canMiss;
          }

          // Simulation state
          const sim = simulatedClasses[courseCode] || { skip: 0, attend: 0 };
          const simWeight = lab ? 2 : 1;
          const simAttended = attended + sim.attend * simWeight;
          const simTotal = total + (sim.skip + sim.attend) * simWeight;
          const simPercent = simTotal > 0 ? parseFloat(((simAttended / simTotal) * 100).toFixed(1)) : 0;
          const isSimulating = sim.skip > 0 || sim.attend > 0;
          const displayPercent = isSimulating ? simPercent : currentPercent;

          const isSimPercentLow = displayPercent < 75;

          return (
            <motion.div
              key={courseCode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white/40 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Card Title Row */}
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black text-pink-600 dark:text-blue-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                      {course.slotName}
                    </span>
                    <span className="text-[9.5px] font-bold text-gray-400 dark:text-zinc-500">
                      {courseCode}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white leading-snug line-clamp-2">
                    {course.courseTitle}
                  </h3>
                </div>

                {/* Percentage Ring / Tag */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-base font-extrabold ${
                    isSimPercentLow 
                      ? "text-red-500 dark:text-red-400" 
                      : displayPercent >= 85 
                      ? "text-emerald-500 dark:text-emerald-400" 
                      : "text-pink-500 dark:text-blue-400"
                  }`}>
                    {displayPercent}%
                  </span>
                  <p className="text-[9px] text-gray-400 dark:text-zinc-500 font-semibold mt-0.5">
                    {isSimulating ? `${simAttended}/${simTotal}` : `${attended}/${total}`} hrs
                  </p>
                </div>
              </div>

              {/* Status Alert Box */}
              <div className={`p-3 rounded-2xl flex items-start gap-2.5 border transition-colors ${
                isSimPercentLow 
                  ? "bg-red-500/5 border-red-500/10 text-red-700 dark:text-red-300" 
                  : displayPercent === 75 
                  ? "bg-pink-500/5 border-pink-500/10 text-pink-700 dark:text-blue-300"
                  : "bg-emerald-500/5 border-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }`}>
                {isSimPercentLow ? (
                  <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}

                <div className="text-xs leading-relaxed">
                  {isSimulating ? (
                    <div>
                      <p className="font-bold">Simulated Projection</p>
                      {isSimPercentLow ? (
                        <p className="font-light opacity-90 mt-0.5">
                          In this scenario, attendance falls below the 75% limit. You'd need to attend more.
                        </p>
                      ) : (
                        <p className="font-light opacity-90 mt-0.5">
                          Attendance is safe. You'd remain above the 75% threshold.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {isLow ? (
                        <div>
                          <p className="font-bold">Attendance Critical</p>
                          <p className="font-light opacity-90 mt-0.5">
                            Must attend <strong>{recoveryCount}</strong> more {lab ? "lab" : "class"}{recoveryCount !== 1 ? (lab ? "s" : "es") : ""} to recover.
                          </p>
                        </div>
                      ) : safeMissCount === 0 ? (
                        <div>
                          <p className="font-bold">On the Edge</p>
                          <p className="font-light opacity-90 mt-0.5">
                            Attendance is exactly at 75%. You cannot afford to miss any more classes.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold">Bunks Available</p>
                          <p className="font-light opacity-90 mt-0.5">
                            You can miss <strong>{safeMissCount}</strong> {lab ? "lab" : "class"}{safeMissCount !== 1 ? (lab ? "s" : "es") : ""} and stay above 75%.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bunk Simulator Panel */}
              <div className="border-t border-gray-200/10 dark:border-zinc-800/40 pt-3 space-y-2.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-zinc-500">
                  <span>Bunk Simulator</span>
                  {isSimulating && (
                    <button
                      onClick={() =>
                        setSimulatedClasses((prev) => ({
                          ...prev,
                          [courseCode]: { skip: 0, attend: 0 },
                        }))
                      }
                      className="text-[9px] hover:text-pink-500 transition-colors uppercase font-black"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  {/* Skip counter */}
                  <div className="flex-1 flex items-center justify-between bg-white/30 dark:bg-zinc-900/30 border border-gray-200/30 dark:border-zinc-800/50 rounded-2xl px-3 py-1.5">
                    <span className="text-[10px] font-bold text-red-500">
                      Skip {lab && <span className="opacity-55 lowercase font-normal">(2h)</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSimulate(courseCode, "skip", -1)}
                        disabled={sim.skip === 0}
                        className="w-5 h-5 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full disabled:opacity-40 transition-all"
                      >
                        <Minus className="w-3 h-3 text-gray-400" />
                      </button>
                      <span className="w-3 text-center text-xs font-bold">{sim.skip}</span>
                      <button
                        onClick={() => handleSimulate(courseCode, "skip", 1)}
                        className="w-5 h-5 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-all"
                      >
                        <Plus className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Attend counter */}
                  <div className="flex-1 flex items-center justify-between bg-white/30 dark:bg-zinc-900/30 border border-gray-200/30 dark:border-zinc-800/50 rounded-2xl px-3 py-1.5">
                    <span className="text-[10px] font-bold text-emerald-500">
                      Attend {lab && <span className="opacity-55 lowercase font-normal">(2h)</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSimulate(courseCode, "attend", -1)}
                        disabled={sim.attend === 0}
                        className="w-5 h-5 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full disabled:opacity-40 transition-all"
                      >
                        <Minus className="w-3 h-3 text-gray-400" />
                      </button>
                      <span className="w-3 text-center text-xs font-bold">{sim.attend}</span>
                      <button
                        onClick={() => handleSimulate(courseCode, "attend", 1)}
                        className="w-5 h-5 flex items-center justify-center bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-all"
                      >
                        <Plus className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
