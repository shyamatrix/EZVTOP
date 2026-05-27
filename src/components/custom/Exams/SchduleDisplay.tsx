"use client";

import { RefreshCcw, CalendarDays, MapPin, Clock, Armchair, BookOpen, Download } from "lucide-react";
import NoContentFound from "../NoContentFound";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Subject {
  courseCode: string;
  courseTitle: string;
  examTime: string;
  venue: string;
  seatLocation: string;
  slot: string;
  examDate: string;
  examSession: string;
  reportingTime: string;
  seatNo: string;
}

interface ExamScheduleProps {
  data: { Schedule: Record<string, Subject[]> };
  handleScheduleFetch: () => void;
}

// ── Shared refresh button ──────────────────────────────────────────────────────
function RefreshBtn({ onClick }: { onClick: () => void }) {
  const [spin, setSpin] = useState(false);
  const handleClick = () => {
    setSpin(true);
    onClick();
    setTimeout(() => setSpin(false), 1200);
  };
  return (
    <button
      onClick={handleClick}
      title="Refresh"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-blue-400 border border-pink-500/20 hover:bg-pink-500/20 transition-all"
    >
      <RefreshCcw size={13} className={spin ? "animate-spin" : ""} />
      Refresh
    </button>
  );
}

// ── Date helpers ───────────────────────────────────────────────────────────────
function parseExamDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const dayNum = parseInt(d);
    if (isNaN(dayNum)) return null;
    const monthVal = parseInt(m);
    if (isNaN(monthVal)) {
      const monthNames = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
      const mIndex = monthNames.findIndex((x) => x === m.toLowerCase().slice(0, 3));
      if (mIndex === -1) return null;
      return new Date(Number(y), mIndex, dayNum);
    }
    return new Date(Number(y), monthVal - 1, dayNum);
  }
  return new Date(dateStr);
}

function computeExamTimes(reportingTimeStr: string, examDateStr: string, examType: string) {
  if (!reportingTimeStr || !examDateStr) return {};
  const [day, monthStr, year] = examDateStr.split(/[-/]/);
  const monthNames = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const month = monthNames.findIndex((m) => monthStr.toLowerCase().startsWith(m));
  const matches = reportingTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!matches) return {};
  const [hours, minutes, meridian] = matches.slice(1);
  let h = parseInt(hours);
  let mn = parseInt(minutes);
  if (meridian.toUpperCase() === "PM" && h !== 12) h += 12;
  if (meridian.toUpperCase() === "AM" && h === 12) h = 0;
  const start = new Date(Number(year), month, Number(day), h, mn);
  const duration = examType.toUpperCase().includes("CAT") ? 105 : examType.toUpperCase().includes("FAT") ? 210 : 0;
  const end = new Date(start.getTime() + duration * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return { startUTC: fmt(start), endUTC: fmt(end) };
}

function generateICSFile(subjects: Subject[], examType: string): string {
  const events = subjects
    .filter((s) => s.reportingTime && s.examSession)
    .map((subj) => {
      const { startUTC, endUTC } = computeExamTimes(subj.reportingTime, subj.examDate, examType);
      const uid = crypto.randomUUID();
      const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      return [
        "BEGIN:VEVENT",
        `SUMMARY:${subj.courseTitle} (${examType})`,
        `DESCRIPTION:${subj.courseCode} — ${subj.reportingTime} @ ${subj.venue === "-" ? "TBA" : subj.venue}`,
        `LOCATION:${subj.venue === "-" ? "TBA" : subj.venue}`,
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${startUTC}`,
        `DTEND:${endUTC}`,
        "END:VEVENT",
      ].join("\n");
    })
    .join("\n\n");
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//UniCC//Schedule Export//EN", events,"END:VCALENDAR"].join("\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

function calculateSeatLocation(seatNo: string, courseTitle: string): string {
  const n = Number(seatNo);
  if (isNaN(n) || n <= 0) return "-";
  if (["Qualitative","Quantitative","French","German","Spanish","Japanese"].some((p) => courseTitle.startsWith(p))) return "-";
  const groupIndex = Math.floor((n - 1) / 18);
  const C1 = groupIndex * 2 + 1;
  const C2 = C1 + 1;
  const pos = (n - 1) % 18;
  const row = Math.floor(pos / 2) + 1;
  const col = pos % 2 === 0 ? C1 : C2;
  return `R${row}C${col}`;
}

// ── Exam Card ──────────────────────────────────────────────────────────────────
function ExamCard({ subj, idx, today }: { subj: Subject; idx: number; today: Date }) {
  const examDate = parseExamDate(subj.examDate);
  const isPast = examDate && examDate < today;
  const isToday = examDate && examDate.getTime() === today.getTime();

  const seatLoc =
    subj.seatLocation === "-" && subj.seatNo && subj.seatNo !== "-"
      ? calculateSeatLocation(subj.seatNo, subj.courseTitle)
      : subj.seatLocation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={`relative rounded-2xl border overflow-hidden shadow-sm transition-all ${
        isPast
          ? "opacity-40 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
          : isToday
          ? "border-emerald-400/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-emerald-200/40 dark:shadow-emerald-800/20 shadow-md"
          : "border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/90"
      }`}
    >
      {/* Top stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          isToday
            ? "bg-gradient-to-r from-emerald-400 to-teal-500"
            : isPast
            ? "bg-gray-300 dark:bg-slate-600"
            : "bg-gradient-to-r from-blue-400 to-pink-500"
        }`}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={14} className="text-pink-500 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {subj.courseCode}
              </span>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30 uppercase tracking-wider animate-pulse">
                  TODAY
                </span>
              )}
              {isPast && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  DONE
                </span>
              )}
            </div>
            <p className={`font-semibold text-sm leading-snug ${isPast ? "line-through" : "text-gray-800 dark:text-gray-100"}`}>
              {subj.courseTitle}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{subj.examDate}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{subj.examSession}</p>
          </div>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {subj.examTime && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-xs text-gray-600 dark:text-gray-300">
              <Clock size={11} />
              <span>{subj.examTime}</span>
            </div>
          )}
          {subj.reportingTime && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-xs text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              <Clock size={11} />
              <span>Report: {subj.reportingTime}</span>
            </div>
          )}
          {subj.venue && subj.venue !== "-" && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-xs text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
              <MapPin size={11} />
              <span>{subj.venue}</span>
            </div>
          )}
          {subj.seatNo && subj.seatNo !== "-" && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-pink-950/30 text-xs text-pink-600 dark:text-blue-400 border border-blue-100 dark:border-pink-900/30">
              <Armchair size={11} />
              <span>
                {seatLoc && seatLoc !== "-" ? `${seatLoc} · ` : ""}#{subj.seatNo}
              </span>
            </div>
          )}
          {subj.slot && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-xs text-gray-500 dark:text-gray-400">
              <span>Slot {subj.slot}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ExamSchedule({ data, handleScheduleFetch }: ExamScheduleProps) {
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Guard: data not yet loaded or schedule key missing
  if (!data || !data.Schedule) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Exam Schedule</h1>
          <RefreshBtn onClick={handleScheduleFetch} />
        </div>
        <NoContentFound />
      </div>
    );
  }

  if (Object.keys(data.Schedule).length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Exam Schedule</h1>
          <RefreshBtn onClick={handleScheduleFetch} />
        </div>
        <NoContentFound />
      </div>
    );
  }


  const compareExamDates = (left: any, right: any): number => {
    const l = parseExamDate(left.examDate);
    const r = parseExamDate(right.examDate);
    if (!l && !r) return 0;
    if (!l) return 1;
    if (!r) return -1;
    const diff = l.getTime() - r.getTime();
    if (diff !== 0) return diff;
    return `${left.examTime ?? ""} ${left.courseCode ?? ""}`.localeCompare(`${right.examTime ?? ""} ${right.courseCode ?? ""}`);
  };

  const todayExams = Object.entries(data.Schedule).flatMap(([examType, subjects]) =>
    subjects.filter((s) => {
      const d = parseExamDate(s.examDate);
      return d && d.getTime() === today.getTime();
    }).map((s) => ({ ...s, examType }))
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Exam Schedule</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {Object.values(data.Schedule).reduce((s, arr) => s + arr.length, 0)} exams scheduled
          </p>
        </div>
        <RefreshBtn onClick={handleScheduleFetch} />
      </div>

      {/* Today's exams banner */}
      {todayExams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-emerald-500" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Today's Exams
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...todayExams].sort(compareExamDates).map((exam, i) => (
              <div key={i} className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-800/30">
                <p className="font-bold text-sm text-gray-800 dark:text-gray-100">{exam.courseTitle}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{exam.courseCode} · {exam.examSession}</p>
                <div className="flex gap-2 mt-2 flex-wrap text-xs">
                  {exam.examTime && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">⏰ {exam.examTime}</span>}
                  {exam.venue && exam.venue !== "-" && <span className="text-gray-500">📍 {exam.venue}</span>}
                  {exam.seatNo && exam.seatNo !== "-" && <span className="text-pink-600 dark:text-blue-400">💺 #{exam.seatNo}</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Exam type sections */}
      {Object.entries(data.Schedule).map(([examType, subjects]) => {
        const sortedSubjects = [...subjects].sort(compareExamDates);
        const hasCalendarData = sortedSubjects.some((s) => s.examSession && s.reportingTime);
        const icsUrl = hasCalendarData ? generateICSFile(sortedSubjects, examType) : null;
        const upcoming = sortedSubjects.filter((s) => {
          const d = parseExamDate(s.examDate);
          return d && d >= today;
        });
        const past = sortedSubjects.filter((s) => {
          const d = parseExamDate(s.examDate);
          return d && d < today;
        });

        return (
          <div key={examType} className="space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{examType}</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-pink-500/10 text-pink-600 dark:text-blue-400 border border-pink-500/20">
                  {upcoming.length} upcoming
                </span>
              </div>
              {icsUrl && isIOS && (
                <a
                  href={icsUrl}
                  download={`${examType}_Schedule.ics`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                >
                  <Download size={12} />
                  Calendar
                </a>
              )}
            </div>

            {/* Upcoming exams */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((subj, idx) => (
                <ExamCard key={`${examType}-up-${idx}`} subj={subj} idx={idx} today={today} />
              ))}
            </div>

            {/* Past exams (collapsed / dimmed) */}
            {past.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {past.map((subj, idx) => (
                  <ExamCard key={`${examType}-past-${idx}`} subj={subj} idx={idx} today={today} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}