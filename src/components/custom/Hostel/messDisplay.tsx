"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Coffee, Utensils, CupSoda, Moon, Sparkles, ChefHat } from "lucide-react";

const messLinks: Record<string, Record<string, string>> = {
  Male: {
    "Non Veg": "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-N.json",
    Veg: "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-V.json",
    Special: "https://kanishka-developer.github.io/unmessify/json/en/VITC-M-S.json",
  },
  Female: {
    "Non Veg": "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-N.json",
    Veg: "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-V.json",
    Special: "https://kanishka-developer.github.io/unmessify/json/en/VITC-W-S.json",
  },
};

const fullToShortDay: Record<string, string> = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};

const shortToFullDay = Object.fromEntries(
  Object.entries(fullToShortDay).map(([full, short]) => [short, full])
);

interface MessDisplayProps {
  hostelData: any;
  handleHostelDetailsFetch: () => void;
}

export default function MessDisplay({ hostelData, handleHostelDetailsFetch }: MessDisplayProps) {
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

  const normalizeGender = (g: string) =>
    g?.toLowerCase() === "male" ? "Male" : "Female";

  const normalizeType = (t: string) => {
    const map: Record<string, string> = {
      VEG: "Veg",
      NON: "Non Veg",
      SPECIAL: "Special",
    };
    return map[t?.toUpperCase()] || "Veg";
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const [gender, setGender] = useState(
    normalizeGender(hostelData.hostelInfo?.gender) || "Male"
  );
  const [type, setType] = useState(
    normalizeType(hostelData.hostelInfo?.messInfo) || "Veg"
  );
  const [menu, setMenu] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(today);

  const shortDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  async function fetchMenuWithCache(genderVal: string, typeVal: string, setMenuFn: (data: any[]) => void) {
    const fileName = `VITC-${genderVal[0].toUpperCase()}-${typeVal[0].toUpperCase()}.json`;
    const localUrl = `/mess/${fileName}`;
    const remoteUrl = messLinks[genderVal][typeVal];

    // ── Step 1: Serve from localStorage cache immediately if available ──────
    try {
      const cached = localStorage.getItem(fileName);
      if (cached) {
        const parsed = JSON.parse(cached);
        setMenuFn(parsed.list || []);
      }
    } catch (err) {
      console.warn("LocalStorage read failed:", err);
    }

    // ── Step 2: Always refresh from remote (background update) ──────────────
    fetch(remoteUrl, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setMenuFn(data.list || []);
        localStorage.setItem(fileName, JSON.stringify(data));
      })
      .catch((err) => {
        console.warn("Remote menu fetch failed, keeping cached data:", err);
      });
  }

  useEffect(() => {
    fetchMenuWithCache(gender, type, setMenu);
  }, [gender, type]);

  const todayMenu = menu.find((day) => day.Day === activeDay);

  const parseDishes = (dishStr: string) => {
    if (!dishStr) return [];
    return dishStr
      .split(/[,;\n]/)
      .map(dish => dish.trim())
      .filter(dish => dish.length > 0);
  };

  const getActiveMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return "Breakfast";
    if (hour >= 10 && hour < 15) return "Lunch";
    if (hour >= 15 && hour < 18.5) return "Snacks";
    return "Dinner";
  };

  const isViewingToday = activeDay === today;
  const currentActiveMeal = isViewingToday ? getActiveMealType() : "";

  const meals = [
    {
      name: "Breakfast",
      items: todayMenu?.Breakfast,
      icon: Coffee,
      color: "pink",
      accentClass: "text-pink-600 dark:text-blue-400",
      bgAccentClass: "bg-blue-100 dark:bg-pink-500/10",
      normalGradient: "bg-white/40 dark:bg-zinc-950/45 border-white/20 dark:border-zinc-800/60 shadow-md hover:shadow-xl hover:from-pink-500/5 hover:to-pink-500/5",
      activeGradient: "bg-gradient-to-br from-blue-500/15 via-purple-500/5 to-pink-500/15 border-pink-500 shadow-[0_0_25px_0_rgba(245,158,11,0.25)] ring-2 ring-pink-500/40",
      glowBg: "bg-blue-400/5 group-hover:bg-blue-400/10",
    },
    {
      name: "Lunch",
      items: todayMenu?.Lunch,
      icon: Utensils,
      color: "pink",
      accentClass: "text-pink-600 dark:text-blue-400",
      bgAccentClass: "bg-yellow-100 dark:bg-pink-500/10",
      normalGradient: "bg-white/40 dark:bg-zinc-950/45 border-white/20 dark:border-zinc-800/60 shadow-md hover:shadow-xl hover:from-pink-500/5 hover:to-pink-500/5",
      activeGradient: "bg-gradient-to-br from-pink-500/15 via-pink-500/5 to-pink-500/15 border-pink-500 shadow-[0_0_25px_0_rgba(234,179,8,0.25)] ring-2 ring-pink-500/40",
      glowBg: "bg-blue-400/5 group-hover:bg-blue-400/10",
    },
    {
      name: "Snacks",
      items: todayMenu?.Snacks,
      icon: CupSoda,
      color: "orange",
      accentClass: "text-pink-600 dark:text-orange-400",
      bgAccentClass: "bg-orange-100 dark:bg-pink-500/10",
      normalGradient: "bg-white/40 dark:bg-zinc-950/45 border-white/20 dark:border-zinc-800/60 shadow-md hover:shadow-xl hover:from-pink-500/5 hover:to-pink-500/5",
      activeGradient: "bg-gradient-to-br from-pink-500/15 via-red-500/5 to-pink-500/15 border-pink-500 shadow-[0_0_25px_0_rgba(249,115,22,0.25)] ring-2 ring-pink-500/40",
      glowBg: "bg-orange-400/5 group-hover:bg-orange-400/10",
    },
    {
      name: "Dinner",
      items: todayMenu?.Dinner,
      icon: Moon,
      color: "indigo",
      accentClass: "text-indigo-600 dark:text-indigo-400",
      bgAccentClass: "bg-indigo-100 dark:bg-indigo-500/10",
      normalGradient: "bg-white/40 dark:bg-zinc-950/45 border-white/20 dark:border-zinc-800/60 shadow-md hover:shadow-xl hover:from-indigo-500/5 hover:to-indigo-500/5",
      activeGradient: "bg-gradient-to-br from-indigo-500/15 via-purple-500/5 to-indigo-500/15 border-indigo-500 shadow-[0_0_25px_0_rgba(99,102,241,0.25)] ring-2 ring-indigo-500/40",
      glowBg: "bg-indigo-400/5 group-hover:bg-indigo-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-pink-500" />
            Mess Menu
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
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {/* Gender selector */}
        <div className="flex items-center p-1 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md border border-white/10 dark:border-zinc-800/40 rounded-full w-full sm:w-[200px] shadow-sm">
          {["Male", "Female"].map((g) => {
            const isActive = gender === g;
            return (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`relative flex-1 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-full z-10 ${
                  isActive
                    ? "text-pink-950 dark:text-pink-950 midnight:text-black"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="messGenderBubble"
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-md shadow-pink-500/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-20">{g}</span>
              </button>
            );
          })}
        </div>

        {/* Type selector */}
        <div className="flex items-center p-1 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md border border-white/10 dark:border-zinc-800/40 rounded-full w-full sm:w-[300px] shadow-sm">
          {["Veg", "Non Veg", "Special"].map((t) => {
            const isActive = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`relative flex-1 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 rounded-full z-10 ${
                  isActive
                    ? "text-pink-950 dark:text-pink-950 midnight:text-black"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="messTypeBubble"
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-md shadow-pink-500/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-20">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekday Switcher */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center p-1 bg-white/20 dark:bg-zinc-950/40 backdrop-blur-md border border-white/10 dark:border-zinc-800/40 rounded-full max-w-max mx-auto gap-1">
          {shortDays.map((short) => {
            const isActive = activeDay === shortToFullDay[short];
            return (
              <button
                key={short}
                onClick={() => setActiveDay(shortToFullDay[short])}
                className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 z-10 flex-shrink-0 ${
                  isActive
                    ? "text-pink-950 dark:text-pink-950 midnight:text-black"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="messDayBubble"
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 rounded-full shadow-md shadow-pink-500/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-20">{short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meals Grid */}
      {todayMenu ? (
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-black text-center text-gray-800 dark:text-zinc-200 uppercase tracking-wide">
            {todayMenu.Day}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {meals.map((meal) => {
              const isActive = meal.name === currentActiveMeal;
              const MealIcon = meal.icon;
              return (
                <motion.div
                  key={meal.name}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative overflow-hidden p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 group ${
                    isActive ? meal.activeGradient : meal.normalGradient
                  }`}
                >
                  <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-xl transition-all ${meal.glowBg}`}></div>
                  
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-pink-500 text-[8px] font-black text-black px-3.5 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
                      Active Meal
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-zinc-800/50 pb-3">
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                      {meal.name}
                    </h4>
                    <div className={`p-2.5 rounded-xl ${meal.bgAccentClass} ${meal.accentClass}`}>
                      <MealIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <ul className="space-y-2 pt-4">
                    {parseDishes(meal.items).map((dish, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${meal.color === "indigo" ? "bg-indigo-500" : "bg-pink-500"}`}></span>
                        <span className="leading-snug">{dish}</span>
                      </li>
                    ))}
                    {parseDishes(meal.items).length === 0 && (
                      <li className="text-xs font-medium text-gray-400 italic">No menu items listed</li>
                    )}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white/10 dark:bg-zinc-950/10 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
          <Sparkles className="w-6 h-6 mx-auto text-gray-400 mb-1" />
          <p className="text-xs text-gray-400">
            No menu found for {activeDay}.
          </p>
        </div>
      )}
    </div>
  );
}
