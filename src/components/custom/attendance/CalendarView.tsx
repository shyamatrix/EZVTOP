"use client";

import React, { useMemo, useState, useEffect } from "react";
import { eachDayOfInterval, endOfMonth, getDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import NoContentFound from "../NoContentFound";
import { RefreshCcw, Calendar, Bell } from "lucide-react";

const CALENDAR_TYPES: Record<string, string> = {
  ALL: "General Semester",
  ALL02: "General Flexible",
  ALL03: "General Freshers",
  ALL05: "General LAW",
  ALL06: "Flexible Freshers",
  ALL08: "Cohort LAW",
  ALL11: "Flexible Research",
  WEI: "Weekend Intra Semester",
};

const HOLIDAY_KEYWORDS = [
  "holiday", "pooja", "puja", "ayudha", "diwali", "pongal", "eid", "christmas", "good friday",
  "independence", "republic", "onam", "holi", "ramadan", "ganesh", "maha shivaratri", "vesak",
  "vacation", "term end", "no instructional", "noinstructional", "vinayakar chathurthi", "gandhi jayanthi",
  "thaipoosam", "telugu", "tamil", "ambedkar"
];

function normalize(str = "") {
  return String(str).toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

function isHolidayEvent(e: any) {
  if (!e) return false;
  const type = String(e.type || "").toLowerCase();
  const text = normalize(e.text || "");
  const cat = normalize(e.category || "");
  if (type.includes("holiday")) return true;
  if (type.includes("no instructional")) return true;
  if (cat.includes("no instructional")) return true;
  for (const kw of HOLIDAY_KEYWORDS) {
    if (text.includes(kw) || cat.includes(kw)) return true;
  }
  return false;
}

function isInstructionalEvent(e: any) {
  if (!e) return false;
  const type = String(e.type || "").toLowerCase();
  const cat = normalize(e.category || "");
  if (type === "instructional day") return true;
  if (cat.includes("working")) return true;
  return false;
}

interface CalendarViewProps {
  calendars: any;
  calendarType: string;
  handleCalendarFetch: (type: string) => void;
}

export default function CalendarView({
  calendars,
  calendarType,
  handleCalendarFetch,
}: CalendarViewProps) {
  const safeCalendars = useMemo(() => {
    if (!calendars) return [];
    if (Array.isArray(calendars)) return calendars;
    if (calendars.calendars) return calendars.calendars;
    return [calendars];
  }, [calendars]);

  const [activeIdx, setActiveIdx] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("calendar-active-index");
      return saved ? Number(saved) || 0 : 0;
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem("calendar-active-index", String(activeIdx));
  }, [activeIdx]);

  const activeCalendar = safeCalendars[activeIdx] || {};
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Selected date inside active month (defaults to current date if possible)
  const [selectedDate, setSelectedDate] = useState<number>(1);

  const { year, monthIndex } = useMemo(() => {
    const now = new Date();
    const MONTH_NAME_MAP: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    const rawMonth = String(activeCalendar.month || "").trim();
    const match = rawMonth.match(/([a-zA-Z]+)\s+(\d{4})/);

    let parsedMonthIndex = now.getMonth();
    let parsedYear = now.getFullYear();

    if (match) {
      const monthName = match[1].toLowerCase().slice(0, 3);
      parsedMonthIndex = MONTH_NAME_MAP[monthName] ?? parsedMonthIndex;
      parsedYear = parseInt(match[2], 10);
    }

    return {
      year: parsedYear,
      monthIndex: parsedMonthIndex,
    };
  }, [activeCalendar.month]);

  // Set default selected day when changing month index
  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() === monthIndex) {
      setSelectedDate(today.getDate());
    } else {
      setSelectedDate(1);
    }
  }, [year, monthIndex]);

  if (!safeCalendars.length) {
    return <NoContentFound />;
  }

  const monthStart = new Date(year, monthIndex, 1);
  let daysInMonth: Date[] = [];
  try {
    const monthEnd = endOfMonth(monthStart);
    daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  } catch {
    const totalDays = Number(activeCalendar.totalDays) || 31;
    daysInMonth = Array.from(
      { length: totalDays },
      (_, i) => new Date(year, monthIndex, i + 1)
    );
  }

  const firstDay = getDay(monthStart);
  const blanksCount = (firstDay + 6) % 7; // ISO weekday blank count
  const blanks = Array.from({ length: blanksCount }, (_, i) => i);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;

  // Selected Day detailed info retrieval
  const selectedDayInfo = Array.isArray(activeCalendar.days)
    ? activeCalendar.days.find((d: any) => Number(d.date) === selectedDate)
    : undefined;
  const selectedDayEvents = selectedDayInfo?.events || [];

  return (
    <div className="w-full bg-white/30 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 rounded-3xl p-6 shadow-md space-y-6">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Academic Calendar
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {CALENDAR_TYPES[calendarType || "ALL"]}
          </p>
        </div>
        
        <button
          onClick={() => handleCalendarFetch(calendarType || "ALL")}
          className="p-3 rounded-2xl bg-white/20 dark:bg-zinc-950/40 border border-white/10 dark:border-zinc-800/40 text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-blue-400 transition-colors shadow-md active:scale-95 flex-shrink-0"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Glassmorphic Month Switcher Slider */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center p-1 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md border border-white/10 dark:border-zinc-800/40 rounded-full max-w-max mx-auto gap-1">
          {safeCalendars.map((calendar: any, idx: number) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={calendar.month || idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 z-10 flex-shrink-0 ${
                  isActive
                    ? "text-pink-950 dark:text-pink-950 midnight:text-black"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMonthBubble"
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-md shadow-pink-500/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-20">
                  {String(calendar.month || "").split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleek iOS-style Calendar Grid */}
      <div className="space-y-4">
        {/* Month Label */}
        <h3 className="text-lg font-black text-center text-gray-800 dark:text-zinc-200 uppercase tracking-wide">
          {activeCalendar.month}
        </h3>

        {/* 7-Col Table Grid (Fully Responsive, fits view) */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {/* Weekday Headers */}
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-[9px] uppercase font-black text-gray-400 tracking-widest pb-1"
            >
              {day}
            </div>
          ))}

          {/* Blank Offsets */}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square opacity-0" />
          ))}

          {/* Days */}
          {daysInMonth.map((dateObj) => {
            const date = dateObj.getDate();
            const dayInfo = Array.isArray(activeCalendar.days)
              ? activeCalendar.days.find((d: any) => Number(d.date) === date)
              : undefined;
            const events = dayInfo?.events || [];

            const hasHoliday = events.some(isHolidayEvent);
            const hasInstructional = events.some(isInstructionalEvent);
            const isEmpty = events.length === 0;
            const isToday = isCurrentMonth && date === today.getDate();
            const isSelected = selectedDate === date;

            const semiHolidayEvents = ["CAT - I", "CAT - II", "TechnoVIT", "Vibrance"];
            const hasSemiHoliday = events.some((e: any) =>
              semiHolidayEvents.some((keyword) =>
                (e.text || "").toLowerCase().includes(keyword.toLowerCase()) ||
                (e.category || "").toLowerCase().includes(keyword.toLowerCase())
              )
            );

            let dayType = "other";
            if (hasSemiHoliday) dayType = "semiholiday";
            else if (hasHoliday || isEmpty || (!hasInstructional && events.length > 0)) dayType = "holiday";
            else if (hasInstructional) dayType = "instructional";

            // Tiny dot indicator color
            let dotColor = "bg-gray-400 dark:bg-zinc-600";
            if (dayType === "holiday") dotColor = "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
            else if (dayType === "instructional") dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
            else if (dayType === "semiholiday") dotColor = "bg-pink-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";

            return (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square flex flex-col items-center justify-between p-2 rounded-2xl border text-xs font-extrabold relative transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 border-blue-400 text-black shadow-lg shadow-pink-500/10"
                    : isToday
                    ? "bg-pink-500/10 border-pink-500/30 text-pink-500 ring-1 ring-pink-500/25"
                    : "bg-white/20 dark:bg-zinc-950/20 hover:bg-white/40 dark:hover:bg-zinc-900/40 border-white/10 dark:border-zinc-800/40 text-gray-800 dark:text-zinc-200"
                }`}
              >
                <span>{date}</span>
                
                {/* Type Indicator Dot */}
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black" : dotColor}`} />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events List Panel */}
      <div className="border-t border-gray-200/50 dark:border-zinc-800/40 pt-4 mt-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Events on {selectedDate} {activeCalendar.month?.split(" ")[0]}
        </h4>

        <div className="space-y-2">
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((e: any, idx: number) => {
              const holiday = isHolidayEvent(e);
              const working = isInstructionalEvent(e);

              let badgeStyle = "bg-gray-100/50 text-gray-600 border-gray-200/20";
              let badgeText = "Other Info";
              
              if (holiday) {
                badgeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/20";
                badgeText = "Holiday";
              } else if (working) {
                badgeStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                badgeText = "Instructional Day";
              } else {
                const textLower = (e.text || "").toLowerCase();
                const catLower = (e.category || "").toLowerCase();
                if (textLower.includes("cat") || catLower.includes("cat") || textLower.includes("exam") || textLower.includes("fat")) {
                  badgeStyle = "bg-pink-500/10 text-pink-500 border-pink-500/20";
                  badgeText = "Academic Exam";
                }
              }

              return (
                <div
                  key={idx}
                  className="p-3 bg-white/20 dark:bg-zinc-950/20 border border-white/10 dark:border-zinc-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {e.text || "Scheduled Event"}
                    </p>
                    {e.category && e.category !== "General" && (
                      <p className="text-[10px] text-gray-400">
                        Category: {e.category}
                      </p>
                    )}
                  </div>

                  <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border max-w-max ${badgeStyle}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-white/10 dark:bg-zinc-950/10 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center">
              <Bell className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs font-medium text-gray-400">
                No major academic events scheduled for this date.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
