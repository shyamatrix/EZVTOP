"use client"

import { useEffect, useState, useMemo } from "react";
import { Building2, Clock, ChevronDown, ChevronUp, ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";

type CalendarEvent = {
    text: string;
    type: "working" | "holiday";
    color: string;
    category?: string;
};

type RemainingClassDay = {
    date: number;
    weekday: string;
    type: string;
    events?: CalendarEvent[];
    fullDate: Date;
};

const normalize = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
};

export default function PopupCard({ a, setExpandedIdx, dayCardsMap, analyzeCalendars, impDates, decimalValues }) {
    const lab = a.courseCode.endsWith("(L)");

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const countTillDate = (endDate): RemainingClassDay[] | null => {
        if (!endDate) return null;
        const endMid = new Date(endDate);
        endMid.setHours(23, 59, 59, 999);

        const filteredMonths = analyzeCalendars.map((monthObj) => ({
            ...monthObj,
            days: monthObj.days.filter((d) => {
                if (!d.date || !d.weekday) return false;
                const monthStr = monthObj.month?.toLowerCase() || "";
                const mIndex = [
                    "january", "february", "march", "april", "may", "june",
                    "july", "august", "september", "october", "november", "december"
                ].findIndex((m) => monthStr.includes(m));

                const dFull = new Date(monthObj.year, mIndex, d.date);
                dFull.setHours(0, 0, 0, 0);
                return dFull <= endMid;
            }),
        }));

        return countRemainingClasses(a.courseCode, a.time, dayCardsMap, filteredMonths, new Date());
    };

    const isLab = a.courseCode.endsWith("(L)");
    const isTheory = a.courseCode.endsWith("(T)");

    let classesTillCAT1: RemainingClassDay[] | null = null;
    let classesTillCAT2: RemainingClassDay[] | null = null;
    let classesTillMidSem: RemainingClassDay[] | null = null;
    let classesTillLID: RemainingClassDay[] | null = null;

    if (Array.isArray(analyzeCalendars) && analyzeCalendars.length > 0) {
        const allMonthsAreHolidays = analyzeCalendars.every(
            (month) => month?.summary?.working === 0
        );
        if (!allMonthsAreHolidays) {
            if (isLab) {
                classesTillCAT1 = countTillDate(impDates.cat1Date);
                classesTillCAT2 = countTillDate(impDates.cat2Date);
                classesTillMidSem = countTillDate(impDates.midsemStart);
                classesTillLID = countTillDate(impDates.lidLabDate);
            } else if (isTheory) {
                classesTillCAT1 = countTillDate(impDates.cat1Date);
                classesTillCAT2 = countTillDate(impDates.cat2Date);
                classesTillMidSem = countTillDate(impDates.midsemStart);
                classesTillLID = countTillDate(impDates.lidTheoryDate);
            }
        }
    }

    const [openDropdown, setOpenDropdown] = useState(null);
    const toggleDropdown = (key) => setOpenDropdown(openDropdown === key ? null : key);

    const viewLink = a.viewLink || [];
    const totalHistory = viewLink.length;
    const absents = viewLink.filter((d: any) => d.status?.toLowerCase() === "absent").length;
    const presents = viewLink.filter((d: any) => d.status?.toLowerCase() === "present").length;
    const onDuties = viewLink.filter((d: any) => d.status?.toLowerCase() === "on duty").length;
    const skipRate = totalHistory > 0 ? ((absents / totalHistory) * 100).toFixed(1) : "0.0";

    // Skip rate status
    let skipStatus = "Perfect Attendance";
    let skipStatusColor = "text-emerald-500 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
    const skipRateNum = parseFloat(skipRate);
    if (skipRateNum > 0 && skipRateNum <= 15) {
      skipStatus = "Ideal Attendance";
      skipStatusColor = "text-green-500 dark:text-green-400 border-green-500/20 bg-green-500/10";
    } else if (skipRateNum > 15 && skipRateNum <= 25) {
      skipStatus = "Frequent Bunks";
      skipStatusColor = "text-pink-500 dark:text-blue-400 border-pink-500/20 bg-pink-500/10";
    } else if (skipRateNum > 25) {
      skipStatus = "Critical Skips";
      skipStatusColor = "text-red-500 dark:text-red-400 border-red-500/20 bg-red-500/10";
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 midnight:bg-black overflow-y-auto flex flex-col text-gray-900 dark:text-gray-100">
            {/* Top Navigation Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/80 dark:bg-slate-950/70 midnight:bg-zinc-950/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/40">
                <button
                    onClick={() => setExpandedIdx(null)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-colors shadow-sm active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400 dark:text-zinc-500">
                    Course details
                </span>
                <div className="w-16" /> {/* Spacer to align title */}
            </div>

            {/* Main Content Area */}
            <div className="flex-grow w-full max-w-4xl mx-auto px-5 py-6 space-y-6">
                {/* Header title block */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-pink-600 dark:text-blue-400 bg-pink-500/10 px-2.5 py-0.5 rounded-md border border-pink-500/20 uppercase tracking-wider">
                            Slot {a.slotName}
                        </span>
                        <span className="text-xs font-bold text-gray-400 dark:text-zinc-500">
                            {a.courseCode}
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                        {a.courseTitle}
                    </h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Details, circular progress, safety calculation */}
                    <div className="md:col-span-5 space-y-6">
                        {/* Course Overview Card */}
                        <div className="bg-white/40 dark:bg-zinc-950/45 border border-white/20 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-6">
                            <div className="space-y-2">
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-zinc-500">
                                    Overview
                                </span>
                                <div className="space-y-1.5 text-xs text-gray-600 dark:text-zinc-300">
                                    <p><strong>Venue:</strong> {a.slotVenue}</p>
                                    <p><strong>Time Slot:</strong> {a.time}</p>
                                    <p className="line-clamp-2"><strong>Faculty:</strong> {a.faculty}</p>
                                    <p><strong>Credits:</strong> {a.credits}</p>
                                    <p className="pt-2 text-sm">
                                        <strong>Attended:</strong>{" "}
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {a.attendedClasses}/{a.totalClasses} hrs
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center">
                                <CircularProgressbar
                                    value={a.attendancePercentage}
                                    text={`${!decimalValues ? a.attendancePercentage : (a.attendedClasses/a.totalClasses * 100).toFixed(1)}%`}
                                    styles={buildStyles({
                                        pathColor:
                                            a.attendancePercentage < 75
                                                ? "#EF4444"
                                                : a.attendancePercentage < 85
                                                    ? "#FACC15"
                                                    : "#2df04aff",
                                        textColor: "currentColor",
                                        trailColor: "rgba(0, 0, 0, 0.05)",
                                        strokeLinecap: "round",
                                        pathTransitionDuration: 0.5,
                                    })}
                                />
                            </div>
                        </div>

                        {/* Safety Margin Card */}
                        <div className="bg-white/40 dark:bg-zinc-950/45 border border-white/20 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm">
                            {a.totalClasses > 0 && (() => {
                                const attended = a.attendedClasses;
                                const total = a.totalClasses;
                                const percentage = (attended / total) * 100;

                                if (percentage < 75) {
                                    const needed = Math.ceil((0.75 * total - attended) / 0.25);
                                    const neededValue = lab ? Math.ceil(needed / 2) : needed;

                                    return (
                                        <div className="flex items-start gap-3 text-red-500 dark:text-red-400">
                                            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div className="text-xs leading-relaxed">
                                                <p className="font-bold text-sm">Action Required</p>
                                                <p className="font-light opacity-90 mt-0.5">
                                                    You must attend the next <strong>{neededValue}</strong> {lab ? "lab" : "class"}{neededValue > 1 && (lab ? "s" : "es")} consecutively to reach 75%.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    const canMiss = Math.floor(attended / 0.75 - total);
                                    const canMissValue = lab ? Math.floor(canMiss / 2) : canMiss;

                                    if (canMissValue === 0) {
                                        return (
                                            <div className="flex items-start gap-3 text-pink-500 dark:text-blue-400">
                                                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                <div className="text-xs leading-relaxed">
                                                    <p className="font-bold text-sm">On the Edge</p>
                                                    <p className="font-light opacity-90 mt-0.5">
                                                        Your attendance is exactly at 75%. Skipping the next class will drop you below the threshold.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="flex items-start gap-3 text-green-500 dark:text-green-400">
                                                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                <div className="text-xs leading-relaxed">
                                                    <p className="font-bold text-sm">Attendance Safe</p>
                                                    <p className="font-light opacity-90 mt-0.5">
                                                        You can miss up to <strong>{canMissValue}</strong> {lab ? "lab" : "class"}{canMissValue !== 1 && (lab ? "s" : "es")} and stay above 75%.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }
                                }
                            })()}
                        </div>

                        {/* Exam Predictions Dropdowns */}
                        {[
                            classesTillCAT1,
                            classesTillCAT2,
                            classesTillMidSem,
                            classesTillLID,
                        ].some((data) => Array.isArray(data) && data.length > 0) && (
                            <div className="bg-white/40 dark:bg-zinc-950/45 border border-white/20 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm space-y-3">
                                <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-400 dark:text-zinc-500">
                                    Horizon Predictions
                                </span>
                                <div className="space-y-2">
                                    {[
                                        { key: "CAT1", label: "Classes left before CAT I", data: classesTillCAT1 },
                                        { key: "CAT2", label: "Classes left before CAT II", data: classesTillCAT2 },
                                        { key: "MIDSEM", label: "Classes left before Mid Term Test", data: classesTillMidSem },
                                        { key: "LID", label: "Classes left before FAT", data: classesTillLID },
                                    ].map(({ key, label, data }) => (
                                        Array.isArray(data) && data.length > 0 ? (
                                            <div
                                                key={key}
                                                className="w-full rounded-xl overflow-hidden border border-gray-200/40 dark:border-zinc-800/40"
                                            >
                                                <button
                                                    onClick={() => toggleDropdown(key)}
                                                    className="flex items-center justify-between w-full px-3.5 py-2.5 text-left 
                                                        text-xs font-semibold text-gray-700 dark:text-gray-200 
                                                        hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <span>{label}: <strong>{data.length}</strong></span>
                                                    {openDropdown === key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>

                                                <div
                                                    className={`transition-all duration-300 ease-in-out ${openDropdown === key ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                                                        } overflow-hidden`}
                                                >
                                                    <div className="px-3.5 pb-3 pt-1 bg-black/5 dark:bg-white/[0.01] rounded-b-xl border-t border-gray-200/20 dark:border-zinc-800/20">
                                                        <UpcomingClassesList
                                                            classes={data}
                                                            attendedClasses={a.attendedClasses}
                                                            totalClasses={a.totalClasses}
                                                            isLab={lab}
                                                            impDates={impDates}
                                                        />
                                                        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-3 h-3 border border-dashed border-gray-400 rounded-sm"></div>
                                                                <span>Attending</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                                                                <span>Not Attending</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-3 h-3 bg-gray-500 opacity-60 rounded-sm"></div>
                                                                <span>Ignored</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Attendance Logs timeline & Skip Rate */}
                    <div className="md:col-span-7 space-y-6">
                        {/* Skip Rate & Day-by-Day Logs */}
                        <div className="bg-white/40 dark:bg-zinc-950/45 border border-white/20 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-200/20 dark:border-zinc-800/40 pb-3">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Attendance Logs</h4>
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-500">Day-by-day past logs</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${skipStatusColor}`}>
                                        {skipStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-gray-200/10 dark:border-white/5">
                                <div className="flex flex-col justify-center">
                                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Skip Rate</span>
                                    <span className="text-xl font-black bg-gradient-to-r from-blue-500 to-pink-500 dark:from-blue-200 dark:to-blue-400 bg-clip-text text-transparent mt-1">
                                        {skipRate}%
                                    </span>
                                    <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
                                        <motion.div 
                                            className="bg-gradient-to-r from-blue-400 to-pink-500 h-full rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skipRate}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center text-xs text-gray-600 dark:text-white/60 space-y-1.5 pl-3 border-l border-gray-200/20 dark:border-zinc-800/40">
                                    <div className="flex justify-between items-center">
                                        <span className="font-light">Attended:</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{presents} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-light">Skipped:</span>
                                        <span className="font-semibold text-red-500 dark:text-red-400">{absents} days</span>
                                    </div>
                                    {onDuties > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-light">On Duty:</span>
                                            <span className="font-semibold text-pink-500 dark:text-blue-400">{onDuties} days</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Logs List */}
                            <div className="space-y-2 max-h-[25rem] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">
                                <AnimatePresence initial={false}>
                                    {viewLink.map((d: any, i: number) => {
                                        const status = d.status?.toLowerCase() || "";
                                        const isAbsent = status === "absent";
                                        const isPresent = status === "present";
                                        
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(i * 0.02, 0.2) }}
                                                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/[0.02] border border-gray-100/10 dark:border-white/[0.02] shadow-sm hover:border-gray-200/20 dark:hover:border-white/5 transition-all"
                                            >
                                                <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">{d.date}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                                    isPresent 
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                                        : isAbsent 
                                                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                                            : "bg-pink-500/10 text-pink-600 dark:text-blue-400 border-pink-500/20"
                                                }`}>
                                                    {d.status}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                {totalHistory === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-6 font-light">No attendance history available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function countRemainingClasses(courseCode, slotTime, dayCardsMap, calendarMonths, fromDate = new Date()): RemainingClassDay[] | null {
    if (!courseCode || !dayCardsMap || !calendarMonths) return null;

    const daysWithSubject = Object.keys(dayCardsMap).filter(day =>
        dayCardsMap[day].some(c => c.courseCode === courseCode)
    );
    if (daysWithSubject.length === 0) return null;

    const normalizeDay = (d) => d.slice(0, 3).toUpperCase();
    const subjectDays = daysWithSubject.map(normalizeDay);

    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];

    let startHour = 8, startMinute = 0;
    if (slotTime && slotTime.includes("-")) {
        const [start] = slotTime.split("-");
        const [hRaw, mRaw] = start.split(":");
        let h = Number(hRaw);
        const m = Number(mRaw) || 0;
        if (h >= 8 && h <= 11) {
        } else if (h === 12) {
            h = 12;
        } else if (h >= 1 && h <= 7) {
            h += 12;
        }
        startHour = h;
        startMinute = m;
    }

    const allDays = calendarMonths.flatMap(monthObj => {
        const monthStr = monthObj.month?.toString().toLowerCase() || "";
        const year = monthObj.year || new Date().getFullYear();

        const foundMonth = monthNames.find(m => monthStr.includes(m));
        const mIndex = foundMonth ? monthNames.indexOf(foundMonth) : -1;

        return (monthObj.days || []).map(day => {
            const fullDate = mIndex === -1 ? null : new Date(year, mIndex, day.date);
            const weekday = fullDate
                ? fullDate.toLocaleString("en-US", { weekday: "short" })
                : "";

            return { ...day, fullDate, weekday };
        });
    });

    const remainingWorkingDays = allDays.filter((d) => {
        if (!d || !d.fullDate || isNaN(d.fullDate.getTime())) return false;

        const isWorkingDay =
            d.type?.toLowerCase() === "working" ||
            (d.events?.some(ev =>
                ev.text?.toLowerCase() === "instructional day" ||
                ev.text?.toLowerCase().includes("working")
            ));

        if (!isWorkingDay) return false;

        let effectiveDay = normalizeDay(d.weekday || "");
        if (effectiveDay === "SAT" && Array.isArray(d.events)) {
            const dayOrderMap = {
                "monday": "MON",
                "tuesday": "TUE",
                "wednesday": "WED",
                "thursday": "THU",
                "friday": "FRI",
            };

            const found = d.events.find(ev =>
                /monday|tuesday|wednesday|thursday|friday/i.test(ev.category || ev.text)
            );

            if (found) {
                const match = found.category?.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i) ||
                    found.text?.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i);
                if (match) effectiveDay = dayOrderMap[match[1].toLowerCase()];
            }
        }

        if (!subjectDays.includes(effectiveDay)) return false;

        const classTime = new Date(d.fullDate);
        classTime.setHours(startHour, startMinute, 0, 0);
        if (classTime < fromDate) return false;

        return true;
    });

    return remainingWorkingDays;
}

function UpcomingClassesList({ classes, attendedClasses = 0, totalClasses = 0, isLab = false, impDates }) {
    const [dayStates, setDayStates] = useState<Record<number, number>>({});
    const CLASS_WEIGHT = isLab ? 2 : 1;

    if (!classes || classes.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 midnight:text-gray-500 text-xs text-center">
                No upcoming classes 🎉
            </p>
        );
    }

    const lockDates = useMemo(() => {
        const locked = new Set<number>();
        if (!classes || classes.length === 0) return locked;

        const isThuOrFri = (d: Date) => {
            const day = d.getDay();
            return day === 4 || day === 5;
        };

        const lastTwo = classes.slice(-2);

        lastTwo.forEach(day => {
            const d = day.fullDate;
            // this shouldnt happen if the date is before FAT, should only happen for dates before CAT-I and CAT-II
            if (isThuOrFri(d) && (impDates.lidLabDate - d > 7)) {
                locked.add(normalize(d));
            }
        });

        return locked;
    }, [classes]);


    const toggleAttendance = (time: number) => {
        setDayStates(prev => {
            const effectiveState =
                prev[time] !== undefined
                    ? prev[time]
                    : lockDates.has(time)
                        ? 2
                        : 0;

            const nextState = (effectiveState + 1) % 3;

            return { ...prev, [time]: nextState };
        });
    };

    let attending = 0;
    let missed = 0;

    classes.forEach(day => {
        const time = normalize(day.fullDate);
        const state = getEffectiveState(time, dayStates, lockDates);

        if (state === 0) attending += CLASS_WEIGHT;
        if (state === 1) missed += CLASS_WEIGHT;
    });

    const upcomingCount = (attending + missed);

    const predictedAttended = attendedClasses + attending;
    const predictedTotal = totalClasses + upcomingCount;
    const predictedPercent: number = parseFloat(((predictedAttended / predictedTotal) * 100).toFixed(1));

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium 
                      bg-gray-100 dark:bg-slate-800 midnight:bg-gray-900 
                      px-3 mt-2 py-2 rounded-md border border-gray-200 dark:border-gray-700 midnight:border-gray-800">
                <span className="text-green-600 dark:text-green-400">Attending: <strong>{attending}</strong></span>
                <span className="text-red-500 dark:text-red-400">Not Attending: <strong>{missed}</strong></span>
                <span
                    className={`font-semibold ${predictedPercent >= 75
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                        }`}
                >
                    Predicted: {predictedPercent}%
                </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-xs">
                {classes.map((day, i) => {
                    const time = normalize(day.fullDate);

                    const state =
                        dayStates[time] !== undefined
                            ? dayStates[time]
                            : lockDates.has(time)
                                ? 2
                                : 0;

                    const d = new Date(day.fullDate);
                    const dateStr = d.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                    });
                    const weekday = d.toLocaleDateString("en-IN", { weekday: "short" });
                    const isSkipped = state === 1;
                    const isIgnored = state === 2;

                    return (
                        <div
                            key={i}
                            onClick={() => toggleAttendance(time)}
                            className={`flex flex-col items-center justify-center 
                          rounded-lg border p-2 shadow-sm 
                          cursor-pointer select-none transform-gpu
                          transition-all duration-200 ease-in-out
                          ${isSkipped
                                    ? "bg-red-100 dark:bg-red-900/40 midnight:bg-red-950 ..."
                                    : isIgnored
                                        ? "bg-gray-200 dark:bg-gray-500 midnight:bg-gray-700 ..."
                                        : "bg-white dark:bg-slate-900 midnight:bg-gray-950 ..."
                                }`}
                        >
                            <span
                                className={`font-semibold ${isSkipped
                                    ? "text-red-700 dark:text-red-300 midnight:text-red-400"
                                    : "text-gray-800 dark:text-gray-200 midnight:text-gray-200"
                                    }`}
                            >
                                {dateStr}
                            </span>
                            <span
                                className={`text-[10px] ${isSkipped
                                    ? "text-red-500 dark:text-red-400 midnight:text-red-400"
                                    : "text-gray-500 dark:text-gray-400 midnight:text-gray-500"
                                    }`}
                            >
                                {weekday}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function getEffectiveState(
    time: number,
    dateStates: Record<number, number>,
    attendanceLockDates?: Set<number>
): number {
    if (dateStates[time] !== undefined) return dateStates[time];
    if (attendanceLockDates?.has(time)) return 2; // default ignored
    return 0; // default attending
}
