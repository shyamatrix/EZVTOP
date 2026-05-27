"use client";
import { useState } from "react";
import { Settings, ClipboardCheck, BookOpen, Home, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import SettingsPage from "./SettingsPage";

export default function BottomNav({
  activeTab,
  setActiveTab,
  handleLogOutRequest,
  currSemesterID,
  setCurrSemesterID,
  handleLogin,
  setIsReloading,
  username,
  password,
  setPassword,
  settings,
  setSettings,
  showSettingsPage,
  setShowSettingsPage
}) {

  const navItems = [
    { id: "attendance", icon: ClipboardCheck, label: "Attendance" },
    { id: "schedule", icon: CalendarDays, label: "Schedule" },
    { id: "exams", icon: BookOpen, label: "Exams" },
    { id: "hostel", icon: Home, label: "Hostel" },
  ];

  return (
    <>
      {showSettingsPage && (
        <SettingsPage
          handleClose={() => setShowSettingsPage(false)}
          currSemesterID={currSemesterID}
          setCurrSemesterID={setCurrSemesterID}
          handleLogin={handleLogin}
          setIsReloading={setIsReloading}
          handleLogOutRequest={handleLogOutRequest}
          password={password}
          username={username}
          setPassword={setPassword}
          decimalValues={settings.decimalValues}
          setDecimalValues={(val: boolean) => {
            setSettings(prev => ({ ...prev, decimalValues: val }))
            localStorage.setItem("settings", JSON.stringify({ ...settings, decimalValues: val }))
          }
          }
          loadingScreen={settings.loadingScreen}
          setLoadingScreen={(val: boolean) => {
            setSettings(prev => ({ ...prev, loadingScreen: val }))
            localStorage.setItem("settings", JSON.stringify({ ...settings, loadingScreen: val }))
          }
          }
        />
      )}

      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto flex items-center bg-white/50 dark:bg-slate-900/50 midnight:bg-zinc-950/50 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] rounded-full px-2 py-2 gap-1 relative overflow-hidden">

          {navItems.map((item) => {
            const isActive = activeTab === item.id && !showSettingsPage;
            return (
              <button
                key={item.id}
                onClick={() => { setShowSettingsPage(false); setActiveTab(item.id); }}
                className={`relative flex items-center justify-center w-[4.5rem] h-12 rounded-full transition-colors duration-300 z-10 ${isActive ? "text-pink-950 dark:text-pink-950 midnight:text-black font-semibold" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bubble"
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-lg shadow-pink-500/20"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <span className="relative z-20 flex flex-col items-center gap-1">
                  <item.icon className="w-5 h-5" />
                  <span className={`text-[9px] uppercase tracking-wider transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0 absolute"}`}>
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}

          <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10 mx-1"></div>

          <button
            onClick={() => setShowSettingsPage(true)}
            className={`relative flex items-center justify-center w-[4.5rem] h-12 rounded-full transition-colors duration-300 z-10 ${showSettingsPage ? "text-pink-950 dark:text-pink-950 midnight:text-black font-semibold" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            {showSettingsPage && (
              <motion.div
                layoutId="nav-bubble"
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-lg shadow-pink-500/20"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            <span className="relative z-20 flex flex-col items-center gap-1">
              <Settings className={`w-5 h-5 transition-transform duration-500 ${showSettingsPage ? "rotate-90" : ""}`} />
              <span className={`text-[9px] uppercase tracking-wider transition-opacity duration-300 ${showSettingsPage ? "opacity-100" : "opacity-0 absolute"}`}>
                Settings
              </span>
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}
