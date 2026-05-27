"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Calendar, CheckCircle2, AlertTriangle, XCircle, ArrowRight, UserCheck, HelpCircle } from "lucide-react";

interface LeaveDisplayProps {
  leaveData: any[];
  handleHostelDetailsFetch: () => void;
}

export default function LeaveDisplay({ leaveData, handleHostelDetailsFetch }: LeaveDisplayProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!leaveData || leaveData.length === 0) {
    return (
      <div className="p-6 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md rounded-3xl text-center border border-white/10 dark:border-zinc-800/40 max-w-md mx-auto space-y-4">
        <p className="text-gray-600 dark:text-gray-400 font-bold text-sm">
          No leave history or records available.
        </p>
        <button
          onClick={handleHostelDetailsFetch}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 hover:brightness-105 text-white font-extrabold shadow-lg shadow-pink-500/10 transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 mx-auto text-xs uppercase"
        >
          <RefreshCcw className="w-4 h-4 animate-spin-slow" />
          Reload Data
        </button>
      </div>
    );
  }

  const parseDate = (dateStr: string) => {
    const parts = dateStr.split(/[-/ ]/);
    if (parts.length === 3) {
      const [day, monthStr, year] = parts;
      const month = new Date(`${monthStr} 1, 2000`).getMonth();
      return new Date(Number(year), month, parseInt(day, 10));
    }
    return new Date(dateStr);
  };

  const now = new Date();

  const activeLeaves = leaveData.filter((leave) => {
    const from = parseDate(leave.from);
    const to = parseDate(leave.to);
    const daysSinceEnd = (now.getTime() - to.getTime()) / (1000 * 60 * 60 * 24);
    return (
      (from <= now && now <= to) ||
      from > now ||
      (daysSinceEnd > 0 && daysSinceEnd <= 3)
    );
  });

  const pastLeaves = leaveData.filter((leave) => !activeLeaves.includes(leave));
  const activeLeave = activeLeaves[0];

  const getStatusClasses = (status: string) => {
    if (!status) return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    const normalized = status.toUpperCase().trim();

    if (normalized.includes("REQUEST APPROVED") || normalized.includes("LEAVE CLOSED"))
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (normalized.includes("REQUEST PENDING"))
      return "bg-pink-500/10 text-pink-600 dark:text-blue-400 border-pink-500/20";
    if (normalized.includes("REQUEST CANCELLED"))
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <HelpCircle className="w-4 h-4 text-gray-400" />;
    const normalized = status.toUpperCase().trim();

    if (normalized.includes("REQUEST APPROVED") || normalized.includes("LEAVE CLOSED"))
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (normalized.includes("REQUEST PENDING"))
      return <AlertTriangle className="w-4 h-4 text-pink-500" />;
    return <XCircle className="w-4 h-4 text-rose-500" />;
  };

  const BarcodeSVG = ({ leaveId }: { leaveId: string }) => (
    <div className="flex flex-col items-center justify-center pt-4 border-t border-dashed border-gray-300 dark:border-zinc-800/80 mt-4 gap-1.5 w-full">
      <svg className="w-full max-w-[200px] h-8 text-black dark:text-zinc-200" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M 0,0 h 1 v 20 h -1 z M 2,0 h 2 v 20 h -2 z M 5,0 h 1 v 20 h -1 z M 7,0 h 3 v 20 h -3 z M 11,0 h 1 v 20 h -1 z M 13,0 h 2 v 20 h -2 z M 16,0 h 1 v 20 h -1 z M 19,0 h 3 v 20 h -3 z M 23,0 h 1 v 20 h -1 z M 25,0 h 2 v 20 h -2 z M 28,0 h 1 v 20 h -1 z M 30,0 h 3 v 20 h -3 z M 34,0 h 1 v 20 h -1 z M 36,0 h 2 v 20 h -2 z M 39,0 h 1 v 20 h -1 z M 41,0 h 3 v 20 h -3 z M 45,0 h 1 v 20 h -1 z M 47,0 h 2 v 20 h -2 z M 50,0 h 1 v 20 h -1 z M 52,0 h 3 v 20 h -3 z M 56,0 h 1 v 20 h -1 z M 58,0 h 2 v 20 h -2 z M 61,0 h 1 v 20 h -1 z M 63,0 h 3 v 20 h -3 z M 67,0 h 1 v 20 h -1 z M 69,0 h 2 v 20 h -2 z M 72,0 h 1 v 20 h -1 z M 74,0 h 3 v 20 h -3 z M 78,0 h 1 v 20 h -1 z M 80,0 h 2 v 20 h -2 z M 83,0 h 1 v 20 h -1 z M 85,0 h 3 v 20 h -3 z M 89,0 h 1 v 20 h -1 z M 91,0 h 2 v 20 h -2 z M 94,0 h 1 v 20 h -1 z M 96,0 h 3 v 20 h -3 z" fill="currentColor"/>
      </svg>
      <span className="text-[8px] font-mono tracking-[0.25em] text-gray-500 uppercase">EZ-{leaveId || "999"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-pink-500" />
            Leave Details
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Monitor and track your active/past leaves
          </p>
        </div>

        <button
          onClick={handleHostelDetailsFetch}
          className="p-3 rounded-2xl bg-white/20 dark:bg-zinc-950/40 border border-white/10 dark:border-zinc-800/40 text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-blue-400 transition-colors shadow-md active:scale-95 flex-shrink-0"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Active Leave - Styled as Boarding Pass Ticket */}
      {activeLeave ? (
        <div className="max-w-xl mx-auto space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
            Active Leave Card
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-white/25 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/45 backdrop-blur-xl flex flex-col justify-between shadow-lg"
          >
            {/* Boarding pass top accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="p-6 space-y-5">
              {/* Header section */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-pink-600 dark:text-blue-400 uppercase tracking-widest bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                      ID: #{activeLeave.leaveId}
                    </span>
                    <span className="text-[8px] font-black text-pink-600 dark:text-blue-400 uppercase tracking-widest bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                      CLASS: STANDARD
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white mt-1.5 leading-snug uppercase tracking-tight">
                    {activeLeave.leaveType}
                  </h3>
                </div>

                <div className={`px-3 py-1 rounded-full border text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${getStatusClasses(activeLeave.status)}`}>
                  {getStatusIcon(activeLeave.status)}
                  {activeLeave.status}
                </div>
              </div>

              {/* Travel timeline grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-100/50 dark:bg-zinc-900/40 rounded-2xl p-4 border border-gray-205 dark:border-zinc-850">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">
                    From Date
                  </span>
                  <span className="font-extrabold text-gray-800 dark:text-zinc-200">
                    {activeLeave.from}
                  </span>
                </div>
                
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">
                    To Date
                  </span>
                  <span className="font-extrabold text-gray-800 dark:text-zinc-200">
                    {activeLeave.to}
                  </span>
                </div>

                <div className="col-span-2 border-t border-gray-200/50 dark:border-zinc-800/50 pt-2.5">
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">
                    Reason for Visit
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">
                    {activeLeave.reason}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">
                    Destination Place
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-zinc-300">
                    {activeLeave.visitPlace}
                  </span>
                </div>
              </div>

              {/* Ticket Notches & Divider */}
              <div className="relative flex items-center justify-between -mx-6 my-2">
                <div className="w-3.5 h-6 rounded-r-full bg-slate-50 dark:bg-slate-900 midnight:bg-black border-y border-r border-white/25 dark:border-zinc-800/60 flex-shrink-0"></div>
                <div className="flex-1 border-t border-dashed border-gray-300 dark:border-zinc-800/80 mx-2"></div>
                <div className="w-3.5 h-6 rounded-l-full bg-slate-50 dark:bg-slate-900 midnight:bg-black border-y border-l border-white/25 dark:border-zinc-800/60 flex-shrink-0"></div>
              </div>

              {/* Remarks */}
              <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Remarks:</span>
                <span className="text-right text-gray-600 dark:text-zinc-300 normal-case font-medium">
                  {activeLeave.remarks || "No remarks written"}
                </span>
              </div>

              {/* SVG Barcode */}
              <BarcodeSVG leaveId={activeLeave.leaveId || ""} />
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="p-5 bg-white/10 dark:bg-zinc-950/10 border border-dashed border-gray-205 dark:border-zinc-800 rounded-3xl text-center max-w-xl mx-auto">
          <p className="text-xs text-gray-400 font-medium">No active leave currently.</p>
        </div>
      )}

      {/* History Button Toggler */}
      {pastLeaves.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setShowHistory((prev) => !prev)}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 hover:brightness-105 text-white font-extrabold shadow-lg shadow-pink-500/10 transition-all duration-300 active:scale-95 text-xs uppercase tracking-wider"
          >
            {showHistory ? "Hide Leave History" : "Show Leave History"}
          </button>
        </div>
      )}

      {/* Leave History List - Styled as Timeline */}
      <AnimatePresence>
        {showHistory && pastLeaves.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2 max-w-xl mx-auto"
          >
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
              Leave History Timeline
            </p>

            <div className="relative border-l-2 border-dashed border-gray-300/80 dark:border-zinc-800/85 ml-4 pl-6 space-y-5">
              {pastLeaves.map((leave, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div key={idx} className="relative">
                    {/* Timeline Node dot */}
                    <div className="absolute -left-[33px] top-4 w-4 h-4 rounded-full border-2 border-slate-50 dark:border-slate-900 bg-pink-500 shadow-sm flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    <motion.div
                      layout
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="cursor-pointer bg-white/40 dark:bg-zinc-950/45 border border-white/20 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-md hover:border-pink-500/30 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-4 pb-2 border-b border-gray-200/30 dark:border-zinc-800/30">
                        <div>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">
                            Leave ID: #{leave.leaveId}
                          </span>
                          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase mt-0.5 tracking-tight">
                            {leave.leaveType || "Outing / Leave"}
                          </h4>
                        </div>
                        
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusClasses(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-zinc-400 font-bold tracking-tight">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {leave.from}
                        </span>
                        <ArrowRight className="w-3 h-3 text-pink-500" />
                        <span>
                          {leave.to}
                        </span>
                      </div>

                      {/* Expandable details segment */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pt-3.5 border-t border-dashed border-gray-200 dark:border-zinc-800/60 space-y-2.5 text-xs font-semibold overflow-hidden"
                          >
                            <div>
                              <span className="text-[8px] uppercase font-black text-gray-400 tracking-wider block mb-0.5">Reason</span>
                              <span className="text-gray-700 dark:text-zinc-300 font-medium">{leave.reason}</span>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase font-black text-gray-400 tracking-wider block mb-0.5">Destination</span>
                              <span className="text-gray-700 dark:text-zinc-300 font-medium">{leave.visitPlace}</span>
                            </div>
                            {leave.remarks && (
                              <div>
                                <span className="text-[8px] uppercase font-black text-gray-400 tracking-wider block mb-0.5">Remarks</span>
                                <span className="text-gray-700 dark:text-zinc-300 font-medium italic">{leave.remarks}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
