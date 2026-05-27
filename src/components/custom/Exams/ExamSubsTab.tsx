"use client";
import { motion } from "framer-motion";
import { BarChart2, CalendarDays, GraduationCap, Activity } from "lucide-react";

interface ExamsSubTabsProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

export default function ExamsSubTabs({ activeSubTab, setActiveSubTab }: ExamsSubTabsProps) {
  const tabs = [
    { id: "marks", label: "Marks", icon: BarChart2 },
    { id: "schedule", label: "Schedule", icon: CalendarDays },
    { id: "grades", label: "Grades", icon: GraduationCap },
    { id: "analysis", label: "Analysis", icon: Activity },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-slate-900/60 midnight:bg-black/60 backdrop-blur-md border border-gray-200/60 dark:border-slate-700/40 midnight:border-gray-800 rounded-2xl w-full max-w-md mx-auto mb-6 shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeSubTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 z-10 ${
              isActive
                ? "text-pink-900 dark:text-pink-950"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeExamsSubTabBubble"
                className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 rounded-xl shadow-md shadow-pink-500/20"
                transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
              />
            )}
            <Icon size={16} className={`relative z-20 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
            <span className="relative z-20">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
