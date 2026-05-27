"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, FlaskConical, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
// ─── helpers ──────────────────────────────────────────────────────────────────
const formatNumber = (num) => {
  const n = Number(num);
  if (num == null || isNaN(n)) return "–";
  return Number(n.toFixed(2)).toString();
};

// ─── Radar / Spider Chart ─────────────────────────────────────────────────────
export function RadarChart({ courses }: { courses: { label: string; pct: number; isFAT: boolean }[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 100;
  const rings = [25, 50, 75, 100];
  const n = courses.length;
  if (n < 3) return null;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const polygonPts = (r: number) =>
    Array.from({ length: n }, (_, i) => point(i, r))
      .map((p) => `${p.x},${p.y}`)
      .join(" ");

  const dataPts = courses
    .map((c, i) => point(i, (c.pct / 100) * maxR))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Ring grid */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={polygonPts((r / 100) * maxR)}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-200 dark:text-slate-700"
          />
        ))}

        {/* Ring labels */}
        {rings.map((r) => (
          <text
            key={`lbl-${r}`}
            x={cx + 3}
            y={cy - (r / 100) * maxR + 3}
            fontSize="7"
            className="fill-gray-300 dark:fill-slate-600"
            textAnchor="start"
          >
            {r}%
          </text>
        ))}

        {/* Axis lines */}
        {courses.map((_, i) => {
          const p = point(i, maxR);
          return (
            <line
              key={`ax-${i}`}
              x1={cx} y1={cy}
              x2={p.x} y2={p.y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-200 dark:text-slate-700"
            />
          );
        })}

        {/* Data polygon fill */}
        <motion.polygon
          points={dataPts}
          fill="url(#radarGrad)"
          fillOpacity={0.35}
          stroke="url(#radarStroke)"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data dots */}
        {courses.map((c, i) => {
          const p = point(i, (c.pct / 100) * maxR);
          return (
            <motion.circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={c.isFAT ? "#10B981" : "#F59E0B"}
              stroke="white"
              strokeWidth={1.5}
              initial={{ r: 0 }}
              animate={{ r: 4 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
            />
          );
        })}

        {/* Axis labels */}
        {courses.map((c, i) => {
          const p = point(i, maxR + 18);
          const anchor = p.x < cx - 2 ? "end" : p.x > cx + 2 ? "start" : "middle";
          return (
            <text
              key={`txt-${i}`}
              x={p.x}
              y={p.y + 3}
              fontSize="8"
              fontWeight="700"
              textAnchor={anchor}
              className="fill-gray-500 dark:fill-gray-400"
            >
              {c.label}
            </text>
          );
        })}

        <defs>
          <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> FAT Issued</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> Pending</span>
      </div>
    </div>
  );
}

// ─── Course Detail Panel ───────────────────────────────────────────────────────
function CourseDetailPanel({ course, calc, totals, onBack }) {
  const pct = totals.weightPercent > 0 ? (totals.weighted / totals.weightPercent) * 100 : 0;
  const isFATIssued = calc.fatStatus === "FAT ISSUED";

  return (
    <motion.div
      key="detail"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 38 }}
      className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-[#0d0f14] midnight:bg-black overflow-y-auto"
    >
      {/* ── Hero header ── */}
      <div
        className={`relative flex-shrink-0 px-5 pt-12 pb-8 overflow-hidden ${
          isFATIssued
            ? "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700"
            : "bg-gradient-to-br from-pink-500 via-pink-500 to-rose-600"
        }`}
      >
        {/* decorative circles */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/20 blur-2xl" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="relative flex items-center gap-2 text-white/90 font-semibold mb-6 group"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 group-hover:bg-white/30 transition-all">
            <ArrowLeft size={16} />
          </span>
          <span className="text-sm uppercase tracking-widest">Back to Marks</span>
        </button>

        {/* Course info */}
        <div className="relative flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">{course.courseCode}</p>
            <h2 className="text-white font-bold text-xl leading-snug break-words">{course.courseTitle}</h2>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-sm">
                {course.courseType}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm ${
                  isFATIssued
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-black/20 text-white/80 border border-white/20"
                }`}
              >
                {isFATIssued ? "✓ FAT ISSUED" : "⏳ FAT NOT ISSUED"}
              </span>
            </div>

            <div className="mt-4 flex gap-6 text-white/80 text-xs">
              {course.faculty && (
                <span>
                  <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Faculty</span>
                  {course.faculty}
                </span>
              )}
              {course.slot && (
                <span>
                  <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Slot</span>
                  {course.slot}
                </span>
              )}
            </div>
          </div>

          {/* Large progress ring */}
          <div className="flex-shrink-0 w-24 h-24">
            <CircularProgressbar
              value={pct}
              text={`${Math.round(pct)}%`}
              styles={buildStyles({
                pathColor: "rgba(255,255,255,0.9)",
                textColor: "#fff",
                trailColor: "rgba(255,255,255,0.2)",
                strokeLinecap: "round",
                textSize: "1.4em",
                pathTransitionDuration: 0.6,
              })}
            />
          </div>
        </div>

        {/* Summary pills */}
        <div className="relative flex gap-3 mt-6 flex-wrap">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <p className="text-white/60 text-[10px] uppercase tracking-widest">Weighted</p>
            <p className="text-white font-bold text-lg">{formatNumber(totals.weighted)}</p>
            <p className="text-white/50 text-[10px]">/ {formatNumber(totals.weightPercent)}</p>
          </div>
          {calc.calculatedTotal && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-widest">Combined</p>
              <p className="text-white font-bold text-lg">{calc.calculatedTotal}</p>
              <p className="text-white/50 text-[10px]">/ 100</p>
            </div>
          )}
          {calc.isEmbedded && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-widest">Credits</p>
              <p className="text-white font-bold text-sm">{calc.creditsInfo.split("(")[0].trim()}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Assessment list ── */}
      <div className="flex-1 px-4 pt-6 pb-10 space-y-3 max-w-2xl mx-auto w-full">
        <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 px-1">
          Assessment Breakdown
        </p>

        {course.assessments.map((asm, i) => {
          const scored = Number(asm.scoredMark) || 0;
          const max = Number(asm.maxMark) || 0;
          const rowPct = max > 0 ? (scored / max) * 100 : 0;
          const isFat =
            asm.title?.toLowerCase().includes("final") ||
            asm.title?.toLowerCase().includes("fat") ||
            asm.title?.toLowerCase().includes("written test");

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 midnight:bg-gray-950 shadow-sm border border-gray-100 dark:border-slate-700 midnight:border-gray-800 p-4"
            >
              {/* FAT accent stripe */}
              {isFat && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 to-teal-600" />
              )}

              <div className="flex justify-between items-start mb-3 pl-1">
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 midnight:text-gray-100">
                    {asm.title}
                    {isFat && (
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black uppercase tracking-wider align-middle">
                        FAT
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Weightage: {formatNumber(asm.weightagePercent)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base text-gray-900 dark:text-gray-100 midnight:text-gray-100">
                    {formatNumber(asm.scoredMark)}
                    <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">/{formatNumber(asm.maxMark)}</span>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Weighted: {formatNumber(asm.weightageMark)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 midnight:bg-gray-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rowPct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.05 + 0.1 }}
                  className={`h-full rounded-full ${
                    rowPct >= 70
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                      : rowPct >= 40
                      ? "bg-gradient-to-r from-blue-400 to-pink-500"
                      : "bg-gradient-to-r from-red-400 to-rose-500"
                  }`}
                />
              </div>
              <p className="text-right text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {rowPct.toFixed(1)}% of component
              </p>
            </motion.div>
          );
        })}

        {/* Totals card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black midnight:from-black midnight:to-black p-4 mt-4 border border-slate-700/50">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Totals</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest">Max</p>
              <p className="text-white font-bold text-lg">{formatNumber(totals.max)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest">Scored</p>
              <p className="text-white font-bold text-lg">{formatNumber(totals.scored)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest">Weighted</p>
              <p className="text-white font-bold text-lg">
                {formatNumber(totals.weighted)}/{formatNumber(totals.weightPercent)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Shared helpers (exported for reuse in AnalysisTab) ──────────────────────
export const getBaseCode = (code: string) => code?.replace(/\(.*?\)/g, "").trim() || "";

export function calculateFATTotal(course: any, data: any, attendance: any[]) {
  if (!attendance || !Array.isArray(attendance)) {
    const hasFat = course.assessments?.some((asm: any) => {
      const t = asm.title?.toLowerCase() || "";
      return (t.includes("final") || t.includes("fat") || t.includes("written test")) && asm.scoredMark !== null && asm.scoredMark !== "";
    });
    return { isEmbedded: false, fatStatus: hasFat ? "FAT ISSUED" : "FAT NOT ISSUED", calculatedTotal: null, creditsInfo: "" };
  }

  const baseCode = getBaseCode(course.courseCode);
  const matchingSchedule = attendance.filter((a: any) => getBaseCode(a.courseCode) === baseCode);

  let theoryCredits = 0, labCredits = 0;
  matchingSchedule.forEach((a: any) => {
    const type = a.courseType?.toLowerCase() || "";
    const isLab = type.includes("lab") || type.includes("practical") || a.courseCode?.endsWith("(L)");
    const creds = parseFloat(a.credits) || 0;
    if (isLab) labCredits = creds; else theoryCredits = creds;
  });

  const isEmbedded = course.courseType?.toLowerCase().includes("embedded") || (theoryCredits > 0 && labCredits > 0) || course.courseCode?.endsWith("E");

  if (!isEmbedded) {
    const hasFat = course.assessments?.some((asm: any) => {
      const t = asm.title?.toLowerCase() || "";
      return (t.includes("final") || t.includes("fat") || t.includes("written test")) && asm.scoredMark !== null && asm.scoredMark !== "";
    });
    return { isEmbedded: false, fatStatus: hasFat ? "FAT ISSUED" : "FAT NOT ISSUED", calculatedTotal: null, creditsInfo: "" };
  }

  const finalTheoryCreds = theoryCredits > 0 ? theoryCredits : 3;
  const finalLabCreds = labCredits > 0 ? labCredits : 1;
  const totalCredits = finalTheoryCreds + finalLabCreds;

  const matchingCourses = (data?.courses ?? []).filter((c: any) => getBaseCode(c.courseCode) === baseCode);
  const bothPartsHaveFat = matchingCourses.every((c: any) =>
    c.assessments?.some((asm: any) => {
      const t = asm.title?.toLowerCase() || "";
      return (t.includes("final") || t.includes("fat") || t.includes("written test")) && asm.scoredMark !== null && asm.scoredMark !== "" && asm.scoredMark !== "-";
    })
  );

  if (!bothPartsHaveFat) {
    return {
      isEmbedded: true,
      fatStatus: "FAT NOT ISSUED",
      calculatedTotal: null,
      creditsInfo: `T: ${finalTheoryCreds}L / L: ${finalLabCreds}L (Ratio: ${finalTheoryCreds}:${finalLabCreds})`,
    };
  }

  let theoryScore = 0, labScore = 0;
  matchingCourses.forEach((c: any) => {
    const type = c.courseType?.toLowerCase() || "";
    const isLabCard = type.includes("lab") || type.includes("practical") || c.courseCode?.endsWith("(L)");
    const pt = c.assessments.reduce((acc: any, asm: any) => {
      acc.weightPercent += Number(asm.weightagePercent) || 0;
      acc.weighted += Number(asm.weightageMark) || 0;
      return acc;
    }, { weightPercent: 0, weighted: 0 });
    const score = pt.weightPercent > 0 ? (pt.weighted / pt.weightPercent) * 100 : 0;
    if (isLabCard) labScore = score; else theoryScore = score;
  });

  const combinedTotal = (theoryScore * (finalTheoryCreds / totalCredits)) + (labScore * (finalLabCreds / totalCredits));

  return {
    isEmbedded: true,
    fatStatus: "FAT ISSUED",
    calculatedTotal: combinedTotal.toFixed(2),
    creditsInfo: `T: ${finalTheoryCreds}L / L: ${finalLabCreds}L (Ratio: ${finalTheoryCreds}:${finalLabCreds})`,
  };
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function MarksDisplay({ data, attendance }) {
  const [openCourse, setOpenCourse] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  if (!data || !data.courses || data.courses.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-3 select-none">
        <h1 className="text-2xl font-black text-gray-950 dark:text-white uppercase tracking-tight">Academic Marks</h1>
        <div className="py-12 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl">
          <h2 className="text-sm font-extrabold text-pink-500/90 dark:text-blue-400/90 uppercase tracking-widest">
            No Marks Data Available
          </h2>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold mt-1.5 uppercase tracking-wider">
            Your evaluation and exam marks list is empty.
          </p>
        </div>
      </div>
    );
  }

  const filteredCourses = data.courses.filter((course) => {
    const calc = calculateFATTotal(course, data, attendance);
    const q = search.toLowerCase();
    const matchesSearch = course.courseCode.toLowerCase().includes(q) || course.courseTitle.toLowerCase().includes(q);
    const matchesFilter =
      filter === "All" ||
      (filter === "Embedded" && calc.isEmbedded) ||
      (filter === "FAT Issued" && calc.fatStatus === "FAT ISSUED") ||
      (filter === "FAT Not Issued" && calc.fatStatus === "FAT NOT ISSUED");
    return matchesSearch && matchesFilter;
  });

  const totalFATIssued = data.courses.reduce((s, c) => s + (calculateFATTotal(c, data, attendance).fatStatus === "FAT ISSUED" ? 1 : 0), 0);
  const totalCourses = data.courses.length;

  // Find open course for detail view
  const activeCourse = openCourse ? data.courses.find((c) => c.slNo === openCourse) : null;
  const activeCalc = activeCourse ? calculateFATTotal(activeCourse, data, attendance) : null;
  const activeTotals = activeCourse
    ? activeCourse.assessments.reduce(
        (acc, asm) => {
          acc.max += Number(asm.maxMark) || 0;
          acc.scored += Number(asm.scoredMark) || 0;
          acc.weightPercent += Number(asm.weightagePercent) || 0;
          acc.weighted += Number(asm.weightageMark) || 0;
          return acc;
        },
        { max: 0, scored: 0, weightPercent: 0, weighted: 0 }
      )
    : null;

  return (
    <div className="relative">
      {/* ── Detail Panel (slides over grid) ── */}
      <AnimatePresence>
        {activeCourse && activeCalc && activeTotals && (
          <CourseDetailPanel
            course={activeCourse}
            calc={activeCalc}
            totals={activeTotals}
            onBack={() => setOpenCourse(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Grid View ── */}
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 midnight:text-gray-100">
            Academic Marks
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {totalFATIssued}/{totalCourses} courses with FAT results published
          </p>
        </div>

        {/* FAT progress bar */}
        <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 midnight:bg-gray-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalCourses > 0 ? (totalFATIssued / totalCourses) * 100 : 0}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
          />
        </div>



        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="🔍  Search by code or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 dark:border-slate-700 midnight:border-gray-700 bg-white dark:bg-slate-800 midnight:bg-gray-900 px-4 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <div className="flex gap-2 flex-wrap">
            {["All", "Embedded", "FAT Issued", "FAT Not Issued"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === f
                    ? "bg-teal-500 text-white shadow-md shadow-teal-500/30"
                    : "bg-gray-100 dark:bg-slate-800 midnight:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredCourses.map((course, idx) => {
              const totals = course.assessments.reduce(
                (acc, asm) => {
                  acc.max += Number(asm.maxMark) || 0;
                  acc.scored += Number(asm.scoredMark) || 0;
                  acc.weightPercent += Number(asm.weightagePercent) || 0;
                  acc.weighted += Number(asm.weightageMark) || 0;
                  return acc;
                },
                { max: 0, scored: 0, weightPercent: 0, weighted: 0 }
              );
              const calc = calculateFATTotal(course, data, attendance);
              const pct = totals.weightPercent > 0 ? (totals.weighted / totals.weightPercent) * 100 : 0;
              const isFATIssued = calc.fatStatus === "FAT ISSUED";
              const isLab = course.courseType?.toLowerCase().includes("lab") || course.courseCode?.endsWith("(L)");

              return (
                <motion.div
                  key={course.slNo || idx}
                  layoutId={`card-${course.slNo || idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  onClick={() => setOpenCourse(course.slNo)}
                  className="group relative cursor-pointer rounded-2xl bg-white dark:bg-slate-800/90 midnight:bg-gray-950 border border-gray-100 dark:border-slate-700 midnight:border-gray-800 shadow-sm hover:shadow-lg hover:shadow-teal-500/10 transition-shadow overflow-hidden"
                >
                  {/* Top accent */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-0.5 ${
                      isFATIssued
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                        : "bg-gradient-to-r from-blue-400 to-pink-500"
                    }`}
                  />

                  <div className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        {/* Icon */}
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 ${isLab ? "bg-purple-500/10" : "bg-blue-500/10"}`}>
                          {isLab
                            ? <FlaskConical size={16} className="text-purple-500" />
                            : <BookOpen size={16} className="text-blue-500" />}
                        </div>

                        <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">
                          {course.courseCode}
                        </p>
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 midnight:text-gray-100 mt-0.5 leading-snug line-clamp-2">
                          {course.courseTitle}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="px-2 py-0.5 text-[9px] rounded-md bg-gray-100 dark:bg-slate-700 midnight:bg-gray-900 text-gray-600 dark:text-gray-300 font-semibold">
                            {course.courseType}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[9px] rounded-md font-black uppercase tracking-wider border ${
                              isFATIssued
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-pink-500/10 text-pink-600 dark:text-blue-400 border-pink-500/20"
                            }`}
                          >
                            {isFATIssued ? <><CheckCircle2 size={9} className="inline -mt-0.5 mr-0.5" />FAT</> : <><Clock size={9} className="inline -mt-0.5 mr-0.5" />Pending</>}
                          </span>
                        </div>

                        {calc.isEmbedded && (
                          <p className="text-[9px] text-gray-400 dark:text-zinc-600 mt-1.5 font-medium">
                            {calc.creditsInfo}
                          </p>
                        )}
                        {calc.calculatedTotal && (
                          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            Combined: {calc.calculatedTotal}/100
                          </p>
                        )}
                      </div>

                      {/* Right: circular progress */}
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="w-14 h-14">
                          <CircularProgressbar
                            value={pct}
                            text={`${Math.round(pct)}%`}
                            styles={buildStyles({
                              pathColor: isFATIssued ? "#10B981" : "#F59E0B",
                              textColor: "currentColor",
                              trailColor: "transparent",
                              strokeLinecap: "round",
                              textSize: "1.5em",
                              pathTransitionDuration: 0.6,
                            })}
                          />
                        </div>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatNumber(totals.weighted)}/{formatNumber(totals.weightPercent)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tap hint */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={14} className="text-teal-500" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-600">
            <p className="text-lg font-semibold">No courses found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
