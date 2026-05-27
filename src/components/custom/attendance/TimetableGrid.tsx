"use client";

import config from "@/app/config.json";
import { MoveHorizontal, Calendar, Clock } from "lucide-react";

interface TimetableGridProps {
  attendance: any[];
}

export default function TimetableGrid({ attendance }: TimetableGridProps) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const slotMap = (config.slotMap as Record<string, any>) || {};

  function toMinutes(t: string) {
    const [hs = "0", ms = "0"] = String(t).split(":");
    let h = parseInt(hs || "0", 10);
    const m = parseInt(ms || "0", 10);
    const isPM = h === 12 || (h >= 1 && h <= 7);
    if (isPM && h !== 12) h += 12;
    return h * 60 + m;
  }

  function fmt(t: string) {
    if (!t) return "";
    const [hs = "0", ms = "0"] = String(t).split(":");
    let h = parseInt(hs || "0", 10);
    const m = parseInt(ms || "0", 10);
    const isPM = h === 12 || (h >= 1 && h <= 7);
    let disp = h;
    if (!isPM && h === 0) disp = 12;
    if (disp > 12) disp -= 12;
    return `${disp}:${String(m).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
  }

  function fmtRange(r: string) {
    if (!r) return null;
    const [s, e] = r.split("-");
    return (
      <div className="flex flex-col text-[10px] leading-tight font-bold tracking-tight text-gray-500 dark:text-zinc-400">
        <span>{fmt(s)}</span>
        <span className="text-[8px] opacity-40 font-medium">to</span>
        <span>{fmt(e)}</span>
      </div>
    );
  }

  const grid: Record<string, Record<string, { title: string; percentage?: string | number }>> = {};
  days.forEach((d) => (grid[d] = {}));
  (attendance || []).forEach((course) => {
    const slots = String(course.slotName || "")
      .split("+")
      .map((s) => s.trim())
      .filter(Boolean);

    slots.forEach((slot) => {
      days.forEach((day) => {
        if (slotMap[day]?.[slot]) {
          grid[day][slot] = { 
            title: course.courseTitle || "",
            percentage: course.attendancePercentage,
          };
        }
      });
    });
  });

  // Fetch chronological list of classes for a specific day (used on Mobile view)
  const getDayClasses = (day: string) => {
    const classesList: Array<{ slot: string; time: string; start: number; title: string; percentage?: string | number }> = [];
    Object.keys(slotMap[day] || {}).forEach((slot) => {
      const classInfo = grid[day]?.[slot];
      if (classInfo) {
        const time = slotMap[day][slot]?.time;
        if (time) {
          const start = toMinutes(time.split("-")[0]);
          classesList.push({
            slot,
            time,
            start,
            title: classInfo.title,
            percentage: classInfo.percentage,
          });
        }
      }
    });
    return classesList.sort((a, b) => a.start - b.start);
  };

  const monTheory: any[] = [];
  const monLab: any[] = [];

  Object.keys(slotMap["MON"] || {}).forEach((slot) => {
    const time = slotMap["MON"][slot]?.time;
    if (!time) return;
    const start = toMinutes(time.split("-")[0]);
    if (slot.startsWith("L")) monLab.push({ slot, time, start });
    else monTheory.push({ slot, time, start });
  });

  monTheory.sort((a, b) => a.start - b.start);
  monLab.sort((a, b) => a.start - b.start);

  const maxPairs = Math.max(monTheory.length, monLab.length);
  const mergedPairs = Array.from({ length: maxPairs }).map((_, i) => ({
    theory: monTheory[i] || null,
    lab: monLab[i] || null,
  }));

  const LUNCH_START_MIN = toMinutes("1:20");
  let insertIndex = mergedPairs.findIndex((p) => {
    const start = Math.min(
      p.theory ? p.theory.start : Infinity,
      p.lab ? p.lab.start : Infinity
    );
    return start >= LUNCH_START_MIN;
  });
  if (insertIndex === -1) insertIndex = mergedPairs.length;

  const beforeLunch = mergedPairs.slice(0, insertIndex);
  const afterLunch = mergedPairs.slice(insertIndex);

  function slotsMatchingTimes(day: string, pair: any) {
    const times = new Set();
    if (pair.theory?.time) times.add(pair.theory.time);
    if (pair.lab?.time) times.add(pair.lab.time);

    const out: string[] = [];
    Object.keys(slotMap[day] || {}).forEach((s) => {
      const t = slotMap[day][s]?.time;
      if (times.has(t)) out.push(s);
    });

    if (out.length === 0) {
      const wanted: number[] = [];
      if (pair.theory?.time)
        wanted.push(toMinutes(pair.theory.time.split("-")[0]));
      if (pair.lab?.time)
        wanted.push(toMinutes(pair.lab.time.split("-")[0]));

      Object.keys(slotMap[day] || {}).forEach((s) => {
        const t = slotMap[day][s]?.time;
        if (!t) return;
        const st = toMinutes(t.split("-")[0]);
        if (wanted.some((ws) => Math.abs(st - ws) <= 7)) out.push(s);
      });
    }

    return [...new Set(out)];
  }

  function buildCell(day: string, pair: any) {
    const matched = slotsMatchingTimes(day, pair);
    const slotsNow = matched.length
      ? matched
      : [pair.theory?.slot, pair.lab?.slot].filter(Boolean);

    const unique = [...new Set(slotsNow)];
    const title = unique.map((s) => grid[day][s]?.title).find(Boolean);
    const percentage = unique.map((s) => grid[day][s]?.percentage).find(Boolean);

    return { slotLabel: unique.join(" / "), title, percentage };
  }

  // Premium Highlights Colors
  const neon = "bg-pink-500/15 dark:bg-pink-500/10 border-pink-500/10 text-pink-700 dark:text-blue-400 font-bold";
  const normal = "bg-white/20 dark:bg-zinc-950/20 text-gray-500 dark:text-zinc-500";

  const headerClass =
    "border border-gray-200/50 dark:border-zinc-800/40 px-2 py-2.5 bg-gray-100/50 dark:bg-zinc-950/50 min-w-[110px] text-[10px] font-black uppercase text-gray-700 dark:text-zinc-300";
  const cellBase =
    "border border-gray-200/50 dark:border-zinc-800/40 px-2 py-1 min-w-[110px] h-[76px] text-[11px] transition-all duration-200 relative overflow-hidden align-middle";

  return (
    <div className="w-full space-y-6">
      
      {/* Mobile view: Chronological Day-by-Day Timeline (Visible only on mobile/tablets) */}
      <div className="block md:hidden space-y-4">
        <div className="px-1">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Class Schedule
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Chronological timetable list for the week
          </p>
        </div>

        {days.map((day) => {
          const classes = getDayClasses(day);
          if (classes.length === 0) return null; // Hide empty days to stay clean
          return (
            <div
              key={day}
              className="bg-white/40 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 rounded-3xl p-5 shadow-md space-y-4"
            >
              <h3 className="text-xs font-black text-pink-600 dark:text-blue-400 uppercase tracking-widest border-b border-gray-200/30 dark:border-zinc-800/30 pb-2">
                {day}
              </h3>
              
              <div className="space-y-4">
                {classes.map((cls, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 items-start relative pl-4 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-pink-500/40"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black text-pink-600 dark:text-blue-400 uppercase tracking-wider bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                          {cls.slot}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.time}
                        </span>
                      </div>
                      
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                        {cls.title}
                      </p>
                    </div>

                    {cls.percentage !== undefined && (
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 flex-shrink-0">
                        {cls.percentage}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop view: Classic Tabular Grid (Hidden on Mobile) */}
      <div className="hidden md:block w-full bg-white/30 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 rounded-3xl p-6 shadow-md">
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Class Timetable
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Your current semester weekly course schedule
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-pink-500 dark:text-blue-400 bg-pink-500/5 px-3 py-1 rounded-full border border-pink-500/10">
            <MoveHorizontal className="w-3.5 h-3.5" />
            Swipe to Scroll
          </div>
        </div>

        {/* Grid Container */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200/50 dark:border-zinc-800/60 shadow-inner">
          <table className="border-collapse w-full text-center bg-transparent">
            <thead>
              <tr>
                <th className="border border-gray-200/50 dark:border-zinc-800/40 px-4 py-2.5 bg-gray-200/60 dark:bg-zinc-900/60 font-black text-[10px] text-gray-600 dark:text-zinc-400 uppercase">
                  Day
                </th>

                {beforeLunch.map((p, i) => (
                  <th key={i} className={headerClass}>
                    {p.theory && fmtRange(p.theory.time)}
                    {p.lab && (
                      <div className="opacity-50 mt-0.5">{fmtRange(p.lab.time)}</div>
                    )}
                  </th>
                ))}

                <th className="border border-gray-200/50 dark:border-zinc-800/40 px-2 py-2.5 bg-gray-200/60 dark:bg-zinc-900/60 font-black text-[10px] text-gray-400">
                  LUNCH
                </th>

                {afterLunch.map((p, i) => (
                  <th key={i} className={headerClass}>
                    {p.theory && fmtRange(p.theory.time)}
                    {p.lab && (
                      <div className="opacity-50 mt-0.5">{fmtRange(p.lab.time)}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {days.map((day) => (
                <tr key={day} className="hover:bg-white/5 transition-colors">
                  <td className="border border-gray-200/50 dark:border-zinc-800/40 font-black text-xs uppercase bg-gray-100/50 dark:bg-zinc-950/30 text-gray-800 dark:text-zinc-200 w-16">
                    {day}
                  </td>

                  {beforeLunch.map((p, i) => {
                    const { slotLabel, title, percentage } = buildCell(day, p);
                    const colorClass = title ? neon : normal;
                    return (
                      <td key={i} className={`${cellBase} ${colorClass}`}>
                        <div className="font-bold text-[10px] opacity-75">{slotLabel}</div>
                        {title && (
                          <div className="text-[9px] font-semibold leading-tight mt-1 line-clamp-3 select-none text-pink-900 dark:text-blue-300">
                            {title}
                            {percentage !== undefined && (
                              <span className="block mt-0.5 text-[8.5px] font-black text-pink-600 dark:text-pink-500">
                                ({percentage}%)
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  <td className="border border-gray-200/50 dark:border-zinc-800/40 bg-gray-200/20 dark:bg-zinc-900/10 font-bold text-[9px] text-gray-300 dark:text-zinc-700 select-none">
                    •
                  </td>

                  {afterLunch.map((p, i) => {
                    const { slotLabel, title, percentage } = buildCell(day, p);
                    const colorClass = title ? neon : normal;
                    return (
                      <td key={i} className={`${cellBase} ${colorClass}`}>
                        <div className="font-bold text-[10px] opacity-75">{slotLabel}</div>
                        {title && (
                          <div className="text-[9px] font-semibold leading-tight mt-1 line-clamp-3 select-none text-pink-900 dark:text-blue-300">
                            {title}
                            {percentage !== undefined && (
                              <span className="block mt-0.5 text-[8.5px] font-black text-pink-600 dark:text-pink-500">
                                ({percentage}%)
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
