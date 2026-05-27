"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Calendar, RefreshCw, Shirt, HelpCircle } from "lucide-react";

const LaundryLinks: Record<string, Record<string, string>> = {
  Male: {
    A: "https://kanishka-developer.github.io/unmessify/json/en/VITC-A-L.json",
    C: "https://kanishka-developer.github.io/unmessify/json/en/VITC-CB-L.json",
    D1: "https://kanishka-developer.github.io/unmessify/json/en/VITC-D1-L.json",
    D2: "https://kanishka-developer.github.io/unmessify/json/en/VITC-D2-L.json",
    E: "https://kanishka-developer.github.io/unmessify/json/en/VITC-E-L.json",
  },
  Female: {
    B: "https://kanishka-developer.github.io/unmessify/json/en/VITC-B-L.json",
    C: "https://kanishka-developer.github.io/unmessify/json/en/VITC-CG-L.json",
  },
};

interface LaundryScheduleProps {
  hostelData: any;
  handleHostelDetailsFetch: () => void;
}

export default function LaundrySchedule({ hostelData, handleHostelDetailsFetch }: LaundryScheduleProps) {
  if (!hostelData.hostelInfo?.isHosteller) {
    return (
      <div className="p-6 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md rounded-3xl text-center border border-white/10 dark:border-zinc-800/40 max-w-md mx-auto space-y-4">
        <p className="text-gray-600 dark:text-gray-400 font-bold text-sm">
          You are not registered as a hosteller.
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

  const [gender, setGender] = useState("");
  const [hostel, setHostel] = useState("");
  const [schedule, setSchedule] = useState<any[]>([]);
  const [searchRoom, setSearchRoom] = useState("");

  const hostelOptions: Record<string, string[]> = {
    Male: ["A", "C", "D1", "D2", "E"],
    Female: ["B", "C"],
  };

  const today = new Date().getDate();

  useEffect(() => {
    if (!hostelData.hostelInfo) return;

    const normalizedGender =
      hostelData.hostelInfo.gender?.toLowerCase() === "female"
        ? "Female"
        : "Male";
    const blockName = hostelData.hostelInfo.blockName?.split(" ")[0] || "A";

    setGender(normalizedGender);
    setHostel(blockName);
  }, [hostelData.hostelInfo]);

  async function fetchLaundryWithCache(genderVal: string, hostelVal: string, setScheduleFn: (data: any[]) => void) {
    if (!LaundryLinks[genderVal] || !LaundryLinks[genderVal][hostelVal]) return;

    const fileName = `VITC-${hostelVal}-${genderVal[0]}-L.json`;
    const localUrl = `/laundry/${fileName}`;
    const remoteUrl = LaundryLinks[genderVal][hostelVal];

    try {
      const cached = localStorage.getItem(fileName);
      if (cached) {
        const parsed = JSON.parse(cached);
        setScheduleFn(parsed.list || []);
      }
    } catch (err) {
      console.warn("LocalStorage read failed:", err);
    }

    if (!localStorage.getItem(fileName)) {
      try {
        const res = await fetch(localUrl);
        const data = await res.json();
        setScheduleFn(data.list || []);
        localStorage.setItem(fileName, JSON.stringify(data));
      } catch (err) {
        console.error("Error loading laundry from public folder:", err);
      }
    }

    fetch(remoteUrl, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setScheduleFn(data.list || []);
        localStorage.setItem(fileName, JSON.stringify(data));
      })
      .catch((err) => {
        console.warn("Remote fetch failed, keeping cached:", err);
      });
  }

  useEffect(() => {
    if (!gender || !hostel) return;
    fetchLaundryWithCache(gender, hostel, setSchedule);
  }, [gender, hostel]);

  const selectGender = (g: string) => {
    setGender(g);
    if (hostelOptions[g]) {
      setHostel(hostelOptions[g][0]);
    }
  };

  const isRoomInRange = (roomSearchStr: string, rangeStr: string) => {
    if (!rangeStr || !roomSearchStr.trim()) return false;
    const searchNum = parseInt(roomSearchStr.trim(), 10);
    if (isNaN(searchNum)) return false;

    const numbers = rangeStr.match(/\d+/g);
    if (!numbers || numbers.length < 2) {
      if (numbers && numbers.length === 1) {
        return parseInt(numbers[0], 10) === searchNum;
      }
      return rangeStr.toLowerCase().includes(roomSearchStr.toLowerCase());
    }

    const start = parseInt(numbers[0], 10);
    const end = parseInt(numbers[1], 10);

    const min = Math.min(start, end);
    const max = Math.max(start, end);

    return searchNum >= min && searchNum <= max;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Shirt className="w-5 h-5 text-pink-500" />
            Laundry Dates
          </h2>

        </div>

        <button
          onClick={handleHostelDetailsFetch}
          className="p-3 rounded-2xl bg-white/20 dark:bg-zinc-950/40 border border-white/10 dark:border-zinc-800/40 text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-blue-400 transition-colors shadow-md active:scale-95 flex-shrink-0"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selectors */}
      {gender && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {/* Gender selector */}
          <div className="flex items-center p-1 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md border border-white/10 dark:border-zinc-800/40 rounded-full w-full sm:w-[200px] shadow-sm">
            {["Male", "Female"].map((g) => {
              const isActive = gender === g;
              return (
                <button
                  key={g}
                  onClick={() => selectGender(g)}
                  className={`relative flex-1 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-full z-10 ${
                    isActive
                      ? "text-pink-950 dark:text-pink-950 midnight:text-black"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="laundryGenderBubble"
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-md shadow-pink-500/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-20">{g}</span>
                </button>
              );
            })}
          </div>

          {/* Block selector */}
          <div className="flex items-center p-1 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md border border-white/10 dark:border-zinc-800/40 rounded-full w-full sm:max-w-max shadow-sm px-2 gap-1 overflow-x-auto">
            {hostelOptions[gender]?.map((h) => {
              const isActive = hostel === h;
              return (
                <button
                  key={h}
                  onClick={() => setHostel(h)}
                  className={`relative px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-full z-10 ${
                    isActive
                      ? "text-pink-950 dark:text-pink-950 midnight:text-black"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="laundryBlockBubble"
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-md shadow-pink-500/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-20">{h} Block</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Room Search bar */}
      <div className="relative max-w-md mx-auto w-full px-1">
        <input
          type="text"
          value={searchRoom}
          onChange={(e) => setSearchRoom(e.target.value)}
          placeholder="🔍 Type room number (e.g. 215) to find your slot..."
          className="w-full px-5 py-3 border border-gray-300/80 dark:border-zinc-800/80 rounded-3xl bg-white/40 dark:bg-zinc-900/40 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-xs font-bold placeholder-gray-400/80 backdrop-blur-md shadow-sm"
        />
        {searchRoom && (
          <button
            onClick={() => setSearchRoom("")}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-pink-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Laundry Timeline Cards */}
      {schedule.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
          {schedule.map((item) => {
            const isToday = parseInt(item.Date, 10) === today;
            const isMatched = isRoomInRange(searchRoom, item.RoomNumber);
            
            // Calculate days relative to today
            const daysDiff = parseInt(item.Date, 10) - today;
            const getStatusLabel = () => {
              if (isToday) return "Active Today";
              if (daysDiff === 0) return "Active Today";
              if (daysDiff === 1) return "Tomorrow";
              if (daysDiff > 1) return `In ${daysDiff} Days`;
              return `${Math.abs(daysDiff)} Days Ago`;
            };

            return (
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={item.Id}
                className={`relative overflow-hidden rounded-3xl p-5 border backdrop-blur-xl flex flex-col justify-between transition-all duration-350 ${
                  isMatched
                    ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-emerald-400/80 shadow-[0_0_20px_0_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/50"
                    : isToday
                    ? "bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-pink-500/10 border-blue-400/60 shadow-[0_0_20px_0_rgba(251,191,36,0.15)] ring-1 ring-blue-400/40"
                    : "bg-white/40 dark:bg-zinc-950/45 border-white/20 dark:border-zinc-800/60 shadow-sm"
                }`}
              >
                {isMatched && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-[8px] font-black text-white px-3 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
                    Matched Room
                  </div>
                )}
                {!isMatched && isToday && (
                  <div className="absolute top-0 right-0 bg-pink-500 text-[8px] font-black text-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                    Today
                  </div>
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isMatched ? "text-emerald-500 font-extrabold" : "text-pink-600 dark:text-blue-400"}`}>
                      {getStatusLabel()}
                    </span>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white">
                      Room Range: {item.RoomNumber || "No Room Set"}
                    </h4>
                  </div>
                  
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                    isMatched
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-400/25"
                      : isToday 
                      ? "bg-blue-100 dark:bg-pink-500/20 text-pink-600 dark:text-blue-400 border-blue-400/20" 
                      : "bg-gray-100 dark:bg-zinc-900 text-gray-400 border-white/10 dark:border-zinc-800/10"
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-gray-300 dark:border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Date Index
                  </span>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {item.Date}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white/10 dark:bg-zinc-950/10 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
          <HelpCircle className="w-6 h-6 mx-auto text-gray-400 mb-1" />
          <p className="text-xs text-gray-400">
            No laundry schedule available.
          </p>
        </div>
      )}
    </div>
  );
}
