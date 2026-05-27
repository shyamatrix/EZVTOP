"use client";

import { Save, LogOut, Eye, EyeOff, User, Calendar, ArrowLeft, Bell, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../ui/button";
import config from "../../../app/config.json";
import PushNotificationManager from "@/app/pushNotificationManager";

interface SettingsPageProps {
  handleClose: () => void;
  currSemesterID: string;
  setCurrSemesterID: (id: string) => void;
  handleLogin: (sem: string) => Promise<any>;
  setIsReloading: (loading: boolean) => void;
  handleLogOutRequest: () => void;
  username: string;
  password: string[];
  setPassword: (creds: string[]) => void;
  decimalValues: boolean;
  setDecimalValues: (val: boolean) => void;
  loadingScreen: boolean;
  setLoadingScreen: (val: boolean) => void;
}

export default function SettingsPage({
  handleClose,
  currSemesterID,
  setCurrSemesterID,
  handleLogin,
  setIsReloading,
  handleLogOutRequest,
  username,
  password,
  setPassword,
  decimalValues,
  setDecimalValues,
  loadingScreen,
  setLoadingScreen,
}: SettingsPageProps) {
  const [selectedSemester, setSelectedSemester] = useState<string>(currSemesterID);
  const [changeUsername, setChangedUsername] = useState<string>(username);
  const [changedPassword, setChangedPassword] = useState<string>(password ? password[1] || "" : "");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    setSelectedSemester(currSemesterID);
    setChangedUsername(username);
    setChangedPassword(password ? password[1] || "" : "");
  }, [currSemesterID, username, password]);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const getSemesterLabel = (id: string) => {
    const term = id.endsWith("01") ? `FALL SEM` : id.endsWith("05") ? `WINTER SEM` : id.endsWith("07") ? `SUMMER SEM` : `UNKNOWN SEM`;
    const yearRange = `${id.slice(4, -4)}-${id.slice(6, -2)}`;
    return `${term} (${yearRange})`;
  };

  const handleSaveSemester = async () => {
    if (!selectedSemester) return;
    setIsReloading(true);
    handleClose();
    await handleLogin(selectedSemester);
    setCurrSemesterID(selectedSemester);
  };

  const handleSaveCredentials = () => {
    setPassword([changeUsername, changedPassword]);
  };

  const cardStyle =
    "w-full bg-white/40 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 rounded-3xl p-6 shadow-md space-y-4 hover:shadow-lg transition-all duration-300";

  return (
    <div className="fixed inset-0 z-50 bg-slate-50/90 dark:bg-slate-950/95 midnight:bg-black/98 flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8 max-w-2xl mt-4 px-1">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/40 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-blue-400 transition-all active:scale-95 shadow-md group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            Settings
          </h2>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
            Configure EZVTOP
          </p>
        </div>

        <button
          onClick={() => setShowNotifications(true)}
          className="p-3 rounded-full bg-white/40 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-blue-400 hover:shadow-lg transition-all active:scale-95 shadow-md relative group"
        >
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
        </button>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        
        {/* Card 1: Semester Select */}
        <div className={cardStyle}>
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-zinc-800 pb-3">
            <div className="p-2 rounded-2xl bg-blue-100 dark:bg-pink-500/10 text-pink-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Academic Semester
            </h3>
          </div>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.semesterIDs?.map((id: string, index: number) => {
                const isSelected = selectedSemester === id;
                const isCurrentActive = currSemesterID === id;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedSemester(id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold transition-all duration-300 border ${
                      isSelected
                        ? "bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-transparent border-pink-500/40 text-pink-600 dark:text-blue-400 shadow-md shadow-pink-500/5"
                        : "bg-white/40 dark:bg-zinc-900/40 border-gray-200/60 dark:border-zinc-800/80 text-gray-700 dark:text-gray-300 hover:border-pink-500/25 hover:bg-pink-500/5"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs sm:text-sm font-extrabold">{getSemesterLabel(id)}</span>
                      {isCurrentActive && (
                        <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                          Currently Active
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-1 rounded-full bg-pink-500/15"
                      >
                        <Check className="w-4 h-4 text-pink-500" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveSemester}
                disabled={!selectedSemester || selectedSemester === currSemesterID}
                className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 h-[46px] ${
                  !selectedSemester || selectedSemester === currSemesterID
                    ? "bg-gray-200 dark:bg-zinc-900 text-gray-400 cursor-not-allowed border border-gray-300/10"
                    : "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 text-white shadow-lg shadow-pink-500/10 active:scale-[0.97] hover:cursor-pointer"
                }`}
              >
                <Save className="w-4 h-4" />
                Save Active Semester
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: VTOP Credentials */}
        <div className={cardStyle}>
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-zinc-800 pb-3">
            <div className="p-2 rounded-2xl bg-yellow-100 dark:bg-pink-500/10 text-pink-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                VTOP Credentials
              </h3>
              <p className="text-[10px] text-gray-400">Credentials remain saved only on this device</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <input
              type="text"
              value={changeUsername}
              onChange={(e) => setChangedUsername(e.target.value)}
              placeholder="Enter VTOP Username"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-semibold"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={changedPassword}
                onChange={(e) => setChangedPassword(e.target.value)}
                placeholder="Enter VTOP Password"
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm font-semibold"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleSaveCredentials}
                disabled={
                  !changeUsername ||
                  !changedPassword ||
                  (changeUsername === username && changedPassword === (password ? password[1] || "" : ""))
                }
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  !changeUsername ||
                  !changedPassword ||
                  (changeUsername === username && changedPassword === (password ? password[1] || "" : ""))
                    ? "bg-gray-200 dark:bg-zinc-900 text-gray-400 cursor-not-allowed border border-gray-300/10"
                    : "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 text-white shadow-lg shadow-pink-500/10 active:scale-[0.97]"
                }`}
              >
                <Save className="w-4 h-4" />
                Update
              </button>
            </div>
          </div>
        </div>



        {/* Card 7: Log Out Button */}
        <div className="pt-4">
          <button
            onClick={handleLogOutRequest}
            className="w-full py-3.5 rounded-3xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/10 transition-all duration-200 active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            Disconnect Portal Account
          </button>
        </div>

      </div>

      {/* Notifications Full-Screen Sub-Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-slate-50/95 dark:bg-slate-950/98 midnight:bg-black/99 flex flex-col items-center justify-start overflow-y-auto p-4 sm:p-6 pb-24 animate-in fade-in zoom-in-95 duration-200">
          {/* Sub-Header */}
          <div className="w-full flex justify-between items-center mb-8 max-w-2xl mt-4 px-1">
            <button
              onClick={() => setShowNotifications(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/40 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/60 text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-blue-400 transition-all active:scale-95 shadow-md group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider">Back</span>
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase flex items-center justify-center gap-2">
                <Bell className="w-6 h-6 text-pink-500 animate-pulse" />
                Notifications
              </h2>
              <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Manage push notifications
              </p>
            </div>

            <div className="w-[84px]" /> {/* Spacer to match the Back button width for alignment symmetry */}
          </div>

          <div className="w-full max-w-2xl space-y-6">
            <div className={cardStyle}>
              <PushNotificationManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
