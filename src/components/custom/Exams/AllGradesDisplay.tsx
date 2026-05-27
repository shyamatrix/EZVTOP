"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, ArrowLeft, TrendingUp, Award, BookOpen, ChevronRight, Sparkles, X } from "lucide-react";
import NoContentFound from "../NoContentFound";

// ── Grade helpers ──────────────────────────────────────────────────────────────
const gradePointMap: Record<string, number> = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

const gradeColor = (g: string) => {
  switch (g) {
    case "S": return { bg: "from-violet-500 to-purple-600", text: "text-violet-600 dark:text-violet-300", pill: "bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/20" };
    case "A": return { bg: "from-emerald-500 to-teal-600", text: "text-emerald-600 dark:text-emerald-300", pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20" };
    case "B": return { bg: "from-blue-500 to-indigo-600", text: "text-blue-600 dark:text-blue-300", pill: "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20" };
    case "C": return { bg: "from-blue-400 to-pink-500", text: "text-pink-600 dark:text-blue-300", pill: "bg-pink-500/10 text-pink-600 dark:text-blue-300 border-pink-500/20" };
    case "D": return { bg: "from-pink-500 to-red-500", text: "text-pink-600 dark:text-orange-300", pill: "bg-pink-500/10 text-pink-600 dark:text-orange-300 border-pink-500/20" };
    case "F": return { bg: "from-red-500 to-rose-700", text: "text-red-600 dark:text-red-300", pill: "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/20" };
    default:  return { bg: "from-gray-400 to-gray-600", text: "text-gray-500 dark:text-gray-400", pill: "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20" };
  }
};

const formatNumber = (num: any) => {
  const n = Number(num);
  if (num == null || isNaN(n)) return "–";
  return Number(n.toFixed(2)).toString();
};

// ── RefreshBtn ─────────────────────────────────────────────────────────────────
function RefreshBtn({ onClick }: { onClick: () => void }) {
  const [spin, setSpin] = useState(false);
  const handle = () => { setSpin(true); onClick(); setTimeout(() => setSpin(false), 1200); };
  return (
    <button onClick={handle} title="Refresh"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-blue-400 border border-pink-500/20 hover:bg-pink-500/20 transition-all">
      <RefreshCcw size={13} className={spin ? "animate-spin" : ""} />
      Refresh
    </button>
  );
}

// ── Course Detail Panel ────────────────────────────────────────────────────────
function CourseDetailPanel({ course, onBack }: { course: any; onBack: () => void }) {
  const gc = gradeColor(course.grade);

  return (
    <motion.div
      key="grade-detail"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 38 }}
      className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-[#0d0f14] midnight:bg-black overflow-y-auto"
    >
      {/* Hero */}
      <div className={`relative flex-shrink-0 px-5 pt-12 pb-8 overflow-hidden bg-gradient-to-br ${gc.bg}`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/20 blur-2xl" />

        <button onClick={onBack} className="relative flex items-center gap-2 text-white/90 font-semibold mb-6 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 group-hover:bg-white/30 transition-all">
            <ArrowLeft size={16} />
          </span>
          <span className="text-sm uppercase tracking-widest">Back to Grades</span>
        </button>

        <div className="relative flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">{course.courseCode}</p>
            <h2 className="text-white font-bold text-xl leading-snug break-words">{course.courseTitle}</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-sm">{course.courseType}</span>
            </div>
          </div>
          {/* Giant grade badge */}
          <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
            <span className="text-white font-black text-4xl">{course.grade}</span>
          </div>
        </div>

        {/* Summary pills */}
        <div className="relative flex gap-3 mt-6 flex-wrap">
          {course.grandTotal && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-widest">Grand Total</p>
              <p className="text-white font-bold text-lg">{course.grandTotal}</p>
            </div>
          )}
          {course.grade && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-widest">Grade Points</p>
              <p className="text-white font-bold text-lg">{gradePointMap[course.grade] ?? "–"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 pt-6 pb-10 space-y-4 max-w-2xl mx-auto w-full">

        {/* Grade range table */}
        {course.range && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 px-1">Grade Ranges</p>
            <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
              <div className="overflow-x-auto" data-scrollable>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800 dark:bg-slate-900 text-white">
                      {Object.keys(course.range as Record<string, string | number>).map((g) => (
                        <th key={g} className="py-2 px-3 text-center font-bold text-xs">{g}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white dark:bg-slate-800">
                      {Object.values(course.range as Record<string, string | number>).map((range, i) => (
                        <td key={i} className="py-2 px-3 text-center text-gray-700 dark:text-gray-300 text-xs">{String(range)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Details breakdown */}
        {course.details && course.details.length > 0 ? (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 px-1">Component Breakdown</p>
            <div className="space-y-3">
              {course.details.map((d: any, i: number) => {
                const scored = Number(d.scoredMark) || 0;
                const max = Number(d.maxMark) || 0;
                const pct = max > 0 ? (scored / max) * 100 : 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{d.component}</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                        {formatNumber(d.scoredMark)}<span className="text-gray-400 font-normal">/{formatNumber(d.maxMark)}</span>
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.05 + 0.1 }}
                        className={`h-full rounded-full ${pct >= 70 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : pct >= 40 ? "bg-gradient-to-r from-blue-400 to-pink-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                      <span>{pct.toFixed(1)}%</span>
                      <span>Weightage: {formatNumber(d.weightageMark)}</span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Totals */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 border border-slate-700/50">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Totals</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest">Max</p>
                    <p className="text-white font-bold text-lg">{formatNumber(course.details.reduce((s: number, d: any) => s + (Number(d.maxMark) || 0), 0))}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest">Scored</p>
                    <p className="text-white font-bold text-lg">{formatNumber(course.details.reduce((s: number, d: any) => s + (Number(d.scoredMark) || 0), 0))}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest">Weighted</p>
                    <p className="text-white font-bold text-lg">{formatNumber(course.details.reduce((s: number, d: any) => s + (Number(d.weightageMark) || 0), 0))}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">No breakdown data available.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Grade Card ─────────────────────────────────────────────────────────────────
function GradeCard({ course, idx, onClick }: { course: any; idx: number; onClick: () => void }) {
  const gc = gradeColor(course.grade);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:shadow-black/10 transition-shadow overflow-hidden"
    >
      {/* Top stripe colored by grade */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gc.bg}`} />

      <div className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{course.courseCode}</span>
            </div>
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">{course.courseTitle}</p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[9px] rounded-md bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 font-semibold">
              {course.courseType}
            </span>
          </div>

          {/* Grade badge */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gc.bg} shadow-md`}>
              <span className="text-white font-black text-xl">{course.grade}</span>
            </div>
            {course.grandTotal && (
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {course.grandTotal} pts
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={14} className="text-gray-400" />
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AllGradesDisplay({ data, handleAllGradesFetch, CGPA, attendance }) {
  const [openCourse, setOpenCourse] = useState<any>(null);
  const [predictedGrades, setPredictedGrades] = useState<Record<string, string>>({});

  const normalizeCourseCode = (courseCode: string) => courseCode?.slice(0, 8) ?? "";

  if (!data || !data.grades) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Academic Grades</h1>
          <RefreshBtn onClick={handleAllGradesFetch} />
        </div>
        <NoContentFound />
      </div>
    );
  }

  const semesterKeys = Object.keys(data.grades).filter((sem) => data.grades[sem]);
  if (semesterKeys.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Academic Grades</h1>
          <RefreshBtn onClick={handleAllGradesFetch} />
        </div>
        <NoContentFound />
      </div>
    );
  }

  const [activeSem, setActiveSem] = useState(semesterKeys[semesterKeys.length - 1]);
  const semesterData = data.grades[activeSem];
  const gpa = semesterData?.gpa || null;
  const gradeList: any[] = semesterData?.grades || [];

  const allSemesterGrades = Object.values(data.grades) as Array<{ grades?: Array<{ courseCode?: string; grade?: string }> }>;
  const gradePool = allSemesterGrades.flatMap((sem) => sem?.grades || []).reduce((pool, c) => {
    const code = normalizeCourseCode(c?.courseCode || "");
    if (code) pool[code] = c?.grade;
    return pool;
  }, {} as Record<string, string>);

  const curr = attendance.filter((a: any) => a.category !== "Non-graded Core Requirement" && a.courseTitle !== "").map((a: any) => ({
    courseCode: normalizeCourseCode(a.courseCode),
    courseTitle: a.courseTitle,
    credits: parseFloat(a.credits),
  }));

  const currentCgpa = Number(CGPA?.cgpa) || 0;
  const currentCredits = Number(CGPA?.creditsEarned) || 0;

  const predictedSemCreditPoints = curr.reduce((sum: number, c: any, i: number) => {
    const key = `${c.courseCode}-${i}`;
    const matched = gradePool[normalizeCourseCode(c.courseCode)];
    const grade = matched || predictedGrades[key] || "A";
    return sum + (c.credits || 0) * (gradePointMap[grade] ?? 10);
  }, 0);

  const predictedCreditPoints = curr.reduce((sum: number, c: any, i: number) => {
    const key = `${c.courseCode}-${i}`;
    const matched = gradePool[normalizeCourseCode(c.courseCode)];
    if (matched) return sum;
    const grade = predictedGrades[key] || "A";
    return sum + (c.credits || 0) * (gradePointMap[grade] ?? 10);
  }, 0);

  const predictedAddedCredits = curr.reduce((sum: number, c: any) => {
    const matched = gradePool[normalizeCourseCode(c.courseCode)];
    return matched ? sum : sum + (c.credits || 0);
  }, 0);

  const predictedSemCredits = curr.reduce((sum: number, c: any) => sum + (c.credits || 0), 0);
  const predictedTotalCredits = currentCredits + predictedAddedCredits;
  const predictedCgpa = predictedTotalCredits > 0 ? ((currentCgpa * currentCredits) + predictedCreditPoints) / predictedTotalCredits : 0;
  const predictedGpa = predictedSemCredits > 0 ? predictedSemCreditPoints / predictedSemCredits : 0;

  const semLabel = (sem: string) => `${sem.endsWith("1") ? "FALL" : "WINTER"} ${sem.slice(4, -4)}-${sem.slice(6, -2)}`;

  return (
    <div className="relative">
      {/* Detail slide panel */}
      <AnimatePresence>
        {openCourse && (
          <CourseDetailPanel course={openCourse} onBack={() => setOpenCourse(null)} />
        )}
      </AnimatePresence>

      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Academic Grades</h1>
            {gpa && activeSem !== "predict" && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Semester GPA: <span className="font-bold text-emerald-600 dark:text-emerald-400">{gpa}</span></p>
            )}
          </div>
          <RefreshBtn onClick={handleAllGradesFetch} />
        </div>

        {/* Semester tabs — scrollable pill row */}
        <div className="relative">
          <div data-scrollable className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {semesterKeys.map((sem) => (
              <button
                key={sem}
                onClick={() => { setActiveSem(sem); setOpenCourse(null); }}
                className={`relative flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeSem === sem
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-pink-950 shadow-md shadow-pink-500/20"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                {semLabel(sem)}
              </button>
            ))}
            <button
              onClick={() => { setActiveSem("predict"); setOpenCourse(null); }}
              className={`relative flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeSem === "predict"
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <Sparkles size={11} />
              Predict
            </button>
          </div>
        </div>

        {/* ── Grade cards ── */}
        {activeSem !== "predict" && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {gradeList.map((course: any, idx: number) => (
                <GradeCard
                  key={course.courseId || course.courseCode || idx}
                  course={course}
                  idx={idx}
                  onClick={() => setOpenCourse(course)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Predict CGPA ── */}
        {activeSem === "predict" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Current CGPA", value: currentCgpa.toFixed(2), color: "from-blue-400 to-pink-500" },
                { label: "Credits Earned", value: currentCredits.toFixed(1), color: "from-blue-400 to-indigo-500" },
                { label: "Predicted GPA", value: predictedGpa.toFixed(2), color: "from-teal-400 to-emerald-500" },
                { label: "Predicted CGPA", value: predictedCgpa.toFixed(2), color: "from-violet-500 to-purple-600" },
              ].map((stat) => (
                <div key={stat.label} className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 shadow-sm">
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color}`} />
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-black mt-1 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Course grade selectors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {curr.map((course: any, idx: number) => {
                const key = `${course.courseCode}-${idx}`;
                const matched = gradePool[normalizeCourseCode(course.courseCode)];
                const selectedGrade = matched || predictedGrades[key] || "A";
                const gc = gradeColor(selectedGrade);

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`relative rounded-2xl border p-4 flex flex-col gap-3 overflow-hidden ${
                      matched
                        ? "border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-900/60"
                        : "border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gc.bg}`} />

                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm leading-snug ${matched ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100"}`}>
                          {course.courseTitle}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{course.courseCode}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{course.credits} Credits</p>
                      </div>
                      {/* Grade badge */}
                      <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br ${gc.bg} ${matched ? "opacity-60" : ""}`}>
                        <span className="text-white font-black text-base">{selectedGrade}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Grade</span>
                      <select
                        id={`grade-${key}`}
                        value={selectedGrade}
                        disabled={Boolean(matched)}
                        onChange={(e) => setPredictedGrades((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="flex-1 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 disabled:cursor-not-allowed disabled:opacity-50 outline-none focus:ring-2 focus:ring-blue-400/30 transition-all"
                      >
                        {["S","A","B","C","D","E","F"].map((g) => (
                          <option key={g} value={g}>{g} ({gradePointMap[g]})</option>
                        ))}
                      </select>
                    </div>

                    {matched && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Graded: {matched}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
