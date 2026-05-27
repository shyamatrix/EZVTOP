"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RadarChart, calculateFATTotal, getBaseCode } from "./marksDislay";

interface AnalysisTabProps {
  data?: { courses?: any[] };
  attendance?: any[];
  allGradesData?: { grades?: Record<string, { gpa?: string; grades?: any[] }> };
}

// Colour ramp for GPA 0–10
function gpaColor(gpa: number) {
  if (gpa >= 9) return { bar: "from-violet-500 to-purple-600", text: "text-violet-600 dark:text-violet-400" };
  if (gpa >= 8) return { bar: "from-emerald-500 to-teal-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (gpa >= 7) return { bar: "from-blue-500 to-indigo-500", text: "text-blue-600 dark:text-blue-400" };
  if (gpa >= 6) return { bar: "from-blue-400 to-pink-500", text: "text-pink-600 dark:text-blue-400" };
  return { bar: "from-red-400 to-rose-600", text: "text-red-500 dark:text-red-400" };
}

// Shorten semester key for bar-chart labels (tight space)
function shortSem(key: string) {
  const parts = key.trim().split(/\s+/);
  if (parts.length >= 3) return `${parts[0]} '${parts[parts.length - 1].slice(-2)}`;
  return key;
}

export default function AnalysisTab({ data, attendance, allGradesData }: AnalysisTabProps) {
  // ── Semester list ─────────────────────────────────────────────────────────
  const semesterKeys: string[] = useMemo(() => {
    if (!allGradesData?.grades) return [];
    return Object.keys(allGradesData.grades).filter((k) => allGradesData.grades![k]);
  }, [allGradesData]);

  const [activeSemIdx, setActiveSemIdx] = useState(() =>
    semesterKeys.length > 0 ? semesterKeys.length - 1 : 0
  );

  const activeSem = semesterKeys[activeSemIdx] ?? null;
  const semData = activeSem && allGradesData?.grades ? allGradesData.grades[activeSem] : null;
  const isCurrentSem = activeSemIdx === semesterKeys.length - 1;

  // ── Current-semester radar: use COMBINED marks (same as Marks tab) ────────
  const currentRadarData = useMemo(() => {
    if (!data?.courses) return [];

    // Group courses by base code to handle embedded (theory + lab) pairs
    const grouped: Record<string, any[]> = {};
    data.courses.forEach((c: any) => {
      const base = getBaseCode(c.courseCode);
      if (!grouped[base]) grouped[base] = [];
      grouped[base].push(c);
    });

    // For each unique base code, compute the representative percentage
    const seen = new Set<string>();
    const result: { label: string; pct: number; isFAT: boolean }[] = [];

    data.courses.forEach((c: any) => {
      const base = getBaseCode(c.courseCode);
      if (seen.has(base)) return; // already processed this embedded pair
      seen.add(base);

      const calc = calculateFATTotal(c, data, attendance ?? []);
      const isFAT = calc.fatStatus === "FAT ISSUED";

      let pct: number;

      if (calc.isEmbedded && calc.calculatedTotal !== null) {
        // Embedded course → use the combined weighted score
        pct = parseFloat(calc.calculatedTotal);
      } else {
        // Regular course → weighted score / weight percent × 100
        const t = c.assessments.reduce(
          (acc: any, asm: any) => {
            acc.wp += Number(asm.weightagePercent) || 0;
            acc.wm += Number(asm.weightageMark) || 0;
            return acc;
          },
          { wp: 0, wm: 0 }
        );
        pct = t.wp > 0 ? (t.wm / t.wp) * 100 : 0;
      }

      const label = c.courseCode?.replace(/\(.*?\)/g, "").trim().slice(-6) || "";
      result.push({ label, pct, isFAT });
    });

    return result.slice(0, 10);
  }, [data, attendance]);

  // ── Historical semester radar: grade-point based ──────────────────────────
  const histRadarData = useMemo(() => {
    if (!semData?.grades) return [];
    const gradePointMap: Record<string, number> = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };
    return semData.grades.slice(0, 10).map((g: any) => ({
      label: g.courseCode?.replace(/\(.*?\)/g, "").trim().slice(-6) || "",
      pct: ((gradePointMap[g.grade] ?? 0) / 10) * 100,
      isFAT: true,
    }));
  }, [semData]);

  const radarData = isCurrentSem && currentRadarData.length >= 3 ? currentRadarData : histRadarData;
  const radarValid = radarData.length >= 3;

  const avg = radarValid ? radarData.reduce((s, d) => s + d.pct, 0) / radarData.length : 0;
  const best = radarValid ? radarData.reduce((a, b) => (a.pct > b.pct ? a : b)) : null;
  const worst = radarValid ? radarData.reduce((a, b) => (a.pct < b.pct ? a : b)) : null;
  const gpa = semData?.gpa ? Number(semData.gpa) : null;
  const gc = gpa !== null ? gpaColor(gpa) : null;

  // ── GPA trend ─────────────────────────────────────────────────────────────
  const gpaTrend = useMemo(() => {
    if (!allGradesData?.grades) return [];
    return semesterKeys.map((k) => ({
      key: k,
      short: shortSem(k),
      gpa: Number(allGradesData.grades![k]?.gpa) || 0,
    }));
  }, [semesterKeys, allGradesData]);

  const maxGpa = Math.max(...gpaTrend.map((d) => d.gpa), 1);

  return (
    <div className="p-4 space-y-5 pb-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Performance Analysis</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Combined marks radar · GPA trend · per-course breakdown
        </p>
      </div>

      {/* ── Semester Switcher ── */}
      {semesterKeys.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSemIdx((i) => Math.max(0, i - 1))}
            disabled={activeSemIdx === 0}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-pink-500/10 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {semesterKeys.map((k, i) => {
              const isActive = i === activeSemIdx;
              return (
                <button
                  key={k}
                  onClick={() => setActiveSemIdx(i)}
                  className={`relative flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-pink-900 dark:text-pink-950"
                      : "bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:text-pink-500"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSemBubble"
                      className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 rounded-xl shadow-sm shadow-pink-500/20"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{k}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setActiveSemIdx((i) => Math.min(semesterKeys.length - 1, i + 1))}
            disabled={activeSemIdx === semesterKeys.length - 1}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-pink-500/10 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Active label + GPA badge ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSem ?? "current"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {activeSem ?? "Current Semester"}
            {isCurrentSem && (
              <span className="ml-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Current
              </span>
            )}
          </p>
          {gpa !== null && gc && (
            <span className={`px-3 py-1 rounded-full text-xs font-black border bg-white dark:bg-slate-900 ${gc.text} border-current/20`}>
              GPA {gpa.toFixed(2)}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── GPA Trend Chart ── */}
      {gpaTrend.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700 shadow-sm p-5"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">GPA Trend</p>
          <div className="flex items-end gap-2 h-28">
            {gpaTrend.map((d, i) => {
              const isActive = semesterKeys[activeSemIdx] === d.key;
              const height = maxGpa > 0 ? (d.gpa / maxGpa) * 100 : 0;
              const col = gpaColor(d.gpa);
              return (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col items-center justify-end gap-1 cursor-pointer"
                  onClick={() => setActiveSemIdx(i)}
                >
                  <span className={`text-[9px] font-bold ${isActive ? col.text : "text-gray-400 dark:text-gray-600"}`}>
                    {d.gpa > 0 ? d.gpa.toFixed(1) : "–"}
                  </span>
                  <div className="w-full rounded-t-lg overflow-hidden relative" style={{ height: "80px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.04 }}
                      className={`absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t ${
                        isActive ? col.bar : "from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600"
                      } transition-all`}
                    />
                  </div>
                  <span className={`text-[8px] font-semibold truncate max-w-full text-center ${
                    isActive ? "text-pink-500" : "text-gray-400 dark:text-gray-600"
                  }`}>
                    {d.short}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Radar Card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSem ?? "current"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden"
        >
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {isCurrentSem ? "Combined Marks Radar" : "Grade-Point Radar"}
            </p>
            <p className="text-base font-bold text-gray-800 dark:text-gray-100 mt-0.5">
              {activeSem ?? "Current Semester"} Overview
            </p>
          </div>

          {radarValid ? (
            <div className="flex flex-col lg:flex-row items-center gap-4 px-5 pb-5">
              <div className="flex-shrink-0">
                <RadarChart courses={radarData} />
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <div className="rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-teal-600 dark:text-teal-400 font-bold">
                    {isCurrentSem ? "Avg Combined" : "Avg Score"}
                  </p>
                  <p className="text-2xl font-black text-teal-700 dark:text-teal-300 mt-1">{avg.toFixed(1)}%</p>
                </div>
                {best && (
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Best</p>
                    <p className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-1">{best.label}</p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">{best.pct.toFixed(1)}%</p>
                  </div>
                )}
                {worst && (
                  <div className="rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/10 border border-pink-500/20 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-pink-600 dark:text-blue-400 font-bold">Needs Work</p>
                    <p className="text-base font-black text-pink-700 dark:text-blue-300 mt-1">{worst.label}</p>
                    <p className="text-xs text-pink-600/70 dark:text-blue-400/70">{worst.pct.toFixed(1)}%</p>
                  </div>
                )}

                {/* Mini horizontal bars */}
                <div className="sm:col-span-3 space-y-2 mt-1">
                  {radarData.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 w-16 flex-shrink-0 truncate">{c.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.pct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 }}
                          className={`h-full rounded-full ${
                            c.pct >= 75 ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                              : c.pct >= 50 ? "bg-gradient-to-r from-blue-400 to-orange-400"
                              : "bg-gradient-to-r from-red-400 to-rose-500"
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-bold w-10 text-right flex-shrink-0 ${
                        c.pct >= 75 ? "text-emerald-600 dark:text-emerald-400"
                          : c.pct >= 50 ? "text-pink-600 dark:text-blue-400"
                          : "text-red-500"
                      }`}>{c.pct.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-5 pb-6 text-center text-gray-400 dark:text-gray-500">
              <p className="text-sm font-semibold">Not enough data</p>
              <p className="text-xs mt-1">At least 3 courses needed for the radar chart.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
