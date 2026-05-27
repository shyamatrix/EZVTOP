"use client";

import { motion } from "framer-motion";

interface AttendanceSubTabsProps {
  activeSubTab: string;
  setActiveAttendanceSubTab: (tab: string) => void;
}

export default function AttendanceSubTabs({
  activeSubTab,
  setActiveAttendanceSubTab,
}: AttendanceSubTabsProps) {
  const tabs = [
    { id: "attendance", label: "Classes" },
    { id: "calendar", label: "Calendar" },
  ];

  return (
    <div className="flex items-center p-1 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md border border-white/10 dark:border-zinc-800/40 rounded-full w-full max-w-[280px] mx-auto mb-6 shadow-md">
      {tabs.map((tab) => {
        const isActive = activeSubTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveAttendanceSubTab(tab.id)}
            className={`relative flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-full z-10 ${
              isActive
                ? "text-pink-950 dark:text-pink-950 midnight:text-black"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeAttendanceSubTabBubble"
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-md shadow-pink-500/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-20">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
