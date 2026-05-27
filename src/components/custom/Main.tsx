'use client';
import { useState, useEffect } from "react";
import { ReloadModal } from "./reloadModel";
import LoginForm from "./loginForm";
import DashboardContent from "./Dashboard";
import Footer from "./footer/Footer";
import config from '../../app/config.json'
import { attendanceRes, ODListItem, ODListRaw } from "@/types/data/attendance";
import { AllGradesRes } from "@/types/data/allgrades";
import { loadActivityTree, saveActivityTree } from "@/lib/activit-tree";
import { dbStore } from "./AIGPAHelper";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

export const API_BASE = "https://api.ezvtop.site";

type settings = {
  decimalValues: boolean;
  CGPAHidden: boolean;
  attendancePercentageOrString: "percentage" | "str";
  currSemesterID: string;
  calendarType: "ALL" | "ALL02" | "ALL03" | "ALL05" | "ALL06" | "ALL08" | "ALL11" | "WEI";
  loadingScreen: boolean;
}

type IDs = {
  VtopUsername: string;
  VtopPassword: string;
  MoodleUsername: string;
  MoodlePassword: string;
}

const defaultSettings: settings = {
  decimalValues: false,
  CGPAHidden: false,
  attendancePercentageOrString: "percentage",
  currSemesterID: config.semesterIDs[config.semesterIDs.length - 2],
  calendarType: "ALL",
  loadingScreen: false
};

const defaultIDs: IDs = {
  VtopUsername: "",
  VtopPassword: "",
  MoodleUsername: "",
  MoodlePassword: "",
}

export default function LoginPage() {
  // --- State Management ---
  const [IDs, setIDs] = useState<IDs>(defaultIDs);
  const [message, setMessage] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<attendanceRes | null>({});
  const [marksData, setMarksData] = useState<object>({});
  const [GradesData, setGradesData] = useState<object>({});
  const [AllGradesData, setAllGradesData] = useState<AllGradesRes>({});
  const [ScheduleData, setScheduleData] = useState<object>({});
  const [hostelData, sethostelData] = useState<object>({});
  const [Calender, setCalender] = useState<object>({});
  const [activeDay, setActiveDay] = useState<string>("");
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("attendance");
  const [attendancePercentage, setattendancePercentage] = useState<object>({});
  const [ODhoursData, setODhoursData] = useState<object>({});
  const [ODhoursIsOpen, setODhoursIsOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [GradesDisplayIsOpen, setGradesDisplayIsOpen] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<string>("marks");
  const [HostelActiveSubTab, setHostelActiveSubTab] = useState<string>("mess");
  const [activeAttendanceSubTab, setActiveAttendanceSubTab] = useState<string>("attendance");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progressBar, setProgressBar] = useState<number>(0);
  const [moodleData, setMoodleData] = useState([]);
  const [vitolData, setVitolData] = useState([]);
  const [isAPIworking, setIsAPIworking] = useState<boolean>(false);

  const [settings, setSettings] = useState<settings>(defaultSettings);
  const [customAlert, setCustomAlert] = useState<string | null>(null);

  useEffect(() => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    setActiveDay(day);

    const checkAPIStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status`);
        const data = await res.json();
        setIsAPIworking(data.text === "API is working" ? false : true);
      } catch (err) {
        setIsAPIworking(true);
      }
    }
    checkAPIStatus();
  }, []);

  function setAttendanceAndOD(attendance: attendanceRes): void {
    setAttendanceData(attendance);
    let totalClass = 0;
    let attendedClasses = 0;
    attendance.attendance?.forEach(course => {
      totalClass += course.totalClasses || 0;
      attendedClasses += course.attendedClasses || 0;
    });
    setattendancePercentage({ "percentage": Math.round(attendedClasses * 10000 / totalClass) / 100, "str": `${attendedClasses}/${totalClass}` });

    let ODList: ODListRaw = {};
    attendance.attendance.forEach(course => {
      if (!course.viewLink || !Array.isArray(course.viewLink)) return;

      course.viewLink.forEach(day => {
        if (day.status === "On Duty") {
          if (!ODList[day.date]) {
            ODList[day.date] = [];
          }
          let hours = course.slotName.startsWith("L") ? 2 : 1;
          ODList[day.date].push({
            title: course.courseTitle,
            type: course.slotName.startsWith("L") ? "LAB" : "TH",
            hours
          });
        }
      });
    });
    const formattedList: ODListItem[] = Object.entries(ODList)
      .map(([date, courses]) => ({
        date,
        courses,
        total: courses.reduce((sum, c) => sum + c.hours, 0)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setODhoursData(formattedList);
  }

  // --- Effects ---
  useEffect(() => {
    const storedAttendance = localStorage.getItem("attendance");
    const storedMarks = localStorage.getItem("marks");
    const storedGrades = localStorage.getItem("grades");
    const storedAllGrades = localStorage.getItem("allGrades");
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const storedMoodleUsername = localStorage.getItem("moodle_username");
    const storedMoodlePassword = localStorage.getItem("moodle_password");
    const storedSchedule = localStorage.getItem("schedule");
    const storedHoste = localStorage.getItem("hostel");
    const calendar = localStorage.getItem("calender");
    const MoodleData = localStorage.getItem("moodleData");
    const VitolData = localStorage.getItem("vitolData");
    const settings = localStorage.getItem("settings");
    const IDs = localStorage.getItem("IDs");

    const parsedStoredAttendance: attendanceRes | null = storedAttendance ? JSON.parse(storedAttendance) : null;
    if (parsedStoredAttendance && parsedStoredAttendance.attendance) {
      setAttendanceAndOD(parsedStoredAttendance);
    }
    if (storedMarks) setMarksData(JSON.parse(storedMarks));
    if (storedSchedule) setScheduleData(JSON.parse(storedSchedule));
    if (storedGrades) setGradesData(JSON.parse(storedGrades));
    if (storedAllGrades) setAllGradesData(JSON.parse(storedAllGrades));
    if (storedHoste) sethostelData(JSON.parse(storedHoste));
    if (calendar) setCalender(JSON.parse(calendar));
    if (MoodleData) setMoodleData(JSON.parse(MoodleData));
    if (VitolData) setVitolData(JSON.parse(VitolData));
    let hasCreds = false;
    if (storedUsername && storedPassword) {
      hasCreds = true;
    }
    let parsedIDs: IDs | null = null;
    if (IDs) {
      try {
        parsedIDs = JSON.parse(IDs);
        if (parsedIDs && parsedIDs.VtopUsername && parsedIDs.VtopPassword) {
          hasCreds = true;
        }
      } catch (e) {
        console.error("Failed to parse IDs from localStorage:", e);
      }
    }

    setIDs({
      VtopUsername: parsedIDs?.VtopUsername || storedUsername || "",
      VtopPassword: parsedIDs?.VtopPassword || storedPassword || "",
      MoodleUsername: parsedIDs?.MoodleUsername || storedMoodleUsername || "",
      MoodlePassword: parsedIDs?.MoodlePassword || storedMoodlePassword || ""
    });

    if (settings) {
      const parsedSettings = JSON.parse(settings);
      setSettings({
        ...defaultSettings,
        ...parsedSettings
      });
    }

    setIsLoggedIn(hasCreds);

    if (hasCreds) {
      setTimeout(() => setIsLoading(false), 300);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginToVTOP = async (retry = false, credentials?: { VtopUsername: string; VtopPassword: string }) => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setProgressBar(10);
      setMessage("Logging in and fetching data...");
      const activeUsername = credentials?.VtopUsername || IDs.VtopUsername;
      const activePassword = credentials?.VtopPassword || IDs.VtopPassword;
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: activeUsername,
          password: activePassword
        }),
      });

      const data = await loginRes.json();

      if (data.message?.includes("Invalid Captcha") && !retry) {
        console.warn("Invalid Captcha. Retrying once...");
        return await loginToVTOP(true, credentials);
      }

      if (!data.success || !data.authorizedID || !data.cookies)
        throw new Error(data.message || "Login failed.");

      setMessage((prev) => prev + "\n✅ Login successful");
      setProgressBar((prev) => prev + 30);

      return {
        cookies: data.cookies,
        authorizedID: data.authorizedID,
        csrf: data.csrf,
      };
    } catch (err: any) {
      throw err;
    }
  };

  const handleLogin = async (
    currSemesterID = config.semesterIDs[config.semesterIDs.length - 2],
    credentials?: { VtopUsername: string; VtopPassword: string }
  ) => {
    setIsReloading(true);
    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP(false, credentials);
      const finalIDs = credentials ? {
        ...IDs,
        VtopUsername: credentials.VtopUsername,
        VtopPassword: credentials.VtopPassword
      } : IDs;
      localStorage.setItem("IDs", JSON.stringify(finalIDs));
      setIDs(finalIDs);

      const [
        { attRes, marksRes },
        gradesRes,
        ScheduleRes,
        HostelRes,
        calenderRes,
        allGradesRes
      ] = await Promise.all([
        fetch(`${API_BASE}/api/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Attendance/Marks fetched");
          setProgressBar(prev => prev + 10);
          return j;
        }),

        fetch(`${API_BASE}/api/grades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Grades fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch(`${API_BASE}/api/schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: currSemesterID }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Exam schedule fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch(`${API_BASE}/api/hostel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Hostel details fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),

        fetch(`${API_BASE}/api/calendar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cookies: cookies,
            authorizedID, csrf,
            type: settings.calendarType || "ALL",
            semesterId: currSemesterID
          }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ Calendar fetched");
          setProgressBar(prev => prev + 5);
          return j;
        }),
        fetch(`${API_BASE}/api/all-grades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cookies: cookies, authorizedID, csrf }),
        }).then(async r => {
          const j = await r.json();
          setMessage(prev => prev + "\n✅ All grades fetched");
          setProgressBar(prev => prev + 10);
          return j;
        }),
      ]);

      setMessage(prev => prev + "\nFinalizing and saving data...");

      setAttendanceAndOD(attRes);
      setMarksData(marksRes);
      setGradesData(gradesRes);
      setAllGradesData(allGradesRes);
      setScheduleData(ScheduleRes);
      sethostelData(HostelRes);
      setCalender(calenderRes);

      localStorage.setItem("attendance", JSON.stringify(attRes));
      localStorage.setItem("marks", JSON.stringify(marksRes));
      localStorage.setItem("grades", JSON.stringify(gradesRes));
      localStorage.setItem("allGrades", JSON.stringify(allGradesRes));
      localStorage.setItem("schedule", JSON.stringify(ScheduleRes));
      localStorage.setItem("hostel", JSON.stringify(HostelRes));
      localStorage.setItem("calender", JSON.stringify(calenderRes));

      // Save complete student profile to IndexedDB newly for AI Chat
      try {
        const profile = {
          marksData: marksRes,
          allGradesData: allGradesRes,
          attendanceData: attRes,
          hostelData: HostelRes,
          scheduleData: ScheduleRes,
          moodleData: moodleData,
          cachedAt: new Date().toISOString()
        };
        await dbStore.set("studentProfile", profile);
      } catch (err) {
        console.error("Failed to save studentProfile to IndexedDB after login:", err);
      }

      setMessage(prev => prev + "\n✅ All data loaded successfully!");
      setProgressBar(100);
      setIsLoggedIn(true);
      setSettings(prev => {
        const next = { ...prev, currSemesterID };
        localStorage.setItem("settings", JSON.stringify(next));
        return next;
      });
      await new Promise(resolve => setTimeout(resolve, 2500));
      setIsReloading(false);

      const tree = loadActivityTree();
      tree.increment();
      saveActivityTree(tree);

      return true;
    } catch (err) {
      console.error(err);
      setMessage(
        "❌ " + (err instanceof Error ? err.message : "Login failed")
      );
      setProgressBar(0);
      throw err;
    }
  };

  // --- Event Handlers ---
  const handleReloadRequest = async () => {
    setIsReloading(true);
    setProgressBar(10);
    setMessage("Reloading data...");
    localStorage.setItem("IDs", JSON.stringify(IDs));

    try {
      const { cookies, authorizedID, csrf } = await loginToVTOP();

      const coreTask = fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookies,
          authorizedID,
          csrf,
          semesterId: settings.currSemesterID || config.semesterIDs[config.semesterIDs.length - 2],
        }),
      }).then(async r => {
        const { attRes, marksRes } = await r.json();
        setAttendanceAndOD(attRes);
        setMarksData(marksRes);
        localStorage.setItem("attendance", JSON.stringify(attRes));
        localStorage.setItem("marks", JSON.stringify(marksRes));

        // Save to IndexedDB
        try {
          const existingProfile = await dbStore.get("studentProfile") || {};
          const profile = {
            ...existingProfile,
            marksData: marksRes,
            attendanceData: attRes,
            cachedAt: new Date().toISOString()
          };
          await dbStore.set("studentProfile", profile);
        } catch (err) {
          console.error("Failed to update IndexedDB marks/attendance in reload:", err);
        }

        setMessage(prev => prev + "\n✅ Attendance & Marks fetched");
        setProgressBar(prev => prev + 30);
      });

      const tasks: Promise<void>[] = [coreTask];
      const moodleUsername = IDs.MoodleUsername;
      const moodlePassword = IDs.MoodlePassword;

      if (moodleUsername && moodlePassword) {
        tasks.push(
          (async () => {
            const res = await fetch(`${API_BASE}/api/lms-data`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: moodleUsername,
                pass: moodlePassword,
              }),
            });

            const moodleData = await res.json();
            const prevData = JSON.parse(localStorage.getItem("moodleData") || "[]");

            const merged = moodleData.map(item => {
              const prevItem = prevData.find(p => p.url === item.url);
              return {
                ...item,
                hidden: prevItem?.hidden ?? false,
              };
            });

            setMoodleData(merged);
            localStorage.setItem("moodleData", JSON.stringify(merged));

            // Save to IndexedDB
            try {
              const existingProfile = await dbStore.get("studentProfile") || {};
              const profile = {
                ...existingProfile,
                moodleData: merged,
                cachedAt: new Date().toISOString()
              };
              await dbStore.set("studentProfile", profile);
            } catch (err) {
              console.error("Failed to update IndexedDB moodle in reload:", err);
            }

            setMessage(prev => prev + "\n✅ Moodle data fetched");
            setProgressBar(prev => prev + 20);
          })()
        );
      }

      // tasks.push(
      //   (async () => {
      //     const res = await fetch(`${API_BASE}/api/grades`, {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({ cookies, authorizedID, csrf, semesterId: settings.currSemesterID }),
      //     });
      //     const GradesData = await res.json();
      //     setGradesData(GradesData);
      //     localStorage.setItem("grades", JSON.stringify(GradesData));
      //     setMessage(prev => prev + "\n✅ Grades data fetched");
      //     setProgressBar(prev => prev + 20);
      //   })()
      // )

      // tasks.push(
      //   (async () => {
      //     const res = await fetch(`${API_BASE}/api/schedule`, {
      //       method: "POST",
      //       headers: { "Content-Type": "application/json" },
      //       body: JSON.stringify({ cookies: cookies, authorizedID, csrf, semesterId: settings.currSemesterID || config.semesterIDs[config.semesterIDs.length - 2] }),
      //     })
      //     const scheduleData = await res.json();
      //     setScheduleData(scheduleData);
      //     localStorage.setItem("schedule", JSON.stringify(scheduleData));
      //     setMessage(prev => prev + "\n✅ Schedule data fetched");
      //     setProgressBar(prev => prev + 20);
      //   })()
      // )
      await Promise.all(tasks);

      setProgressBar(100);
      setIsLoggedIn(true);
      setIsReloading(false);

    } catch (err) {
      console.error(err);
      setMessage(
        "❌ " + (err instanceof Error ? err.message : "Login failed")
      );
      setProgressBar(0);
    }
  };

  const handleLogOutRequest = () => {
    setIsLoggedIn(false);
    setIDs(defaultIDs);

    const keysToKeep = ["theme", "activityTree", "settings"];

    const saved: Record<string, string | null> = {};
    keysToKeep.forEach((key) => {
      saved[key] = localStorage.getItem(key);
    });

    localStorage.clear();

    keysToKeep.forEach((key) => {
      if (saved[key] !== null) {
        localStorage.setItem(key, saved[key]!);
      }
    });

    // Clear IndexedDB store on logout
    try {
      dbStore.clearStore();
    } catch (err) {
      console.error("Failed to clear IndexedDB on logout:", err);
    }

    setAttendanceData({});
    setMarksData({});
    setGradesData({});
    setScheduleData({});
    setMessage("");
  };

  const handleFormSubmit = (e, usernameVal?: string, passwordVal?: string) => {
    e.preventDefault();
    const u = usernameVal || IDs.VtopUsername;
    const p = passwordVal || IDs.VtopPassword;
    if (!u || !p) {
      setCustomAlert("Please fill all the fields!");
      return;
    }
    handleLogin(undefined, { VtopUsername: u, VtopPassword: p });
  };

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);



  const [showReloadBanner, setShowReloadBanner] = useState(false);

  useEffect(() => {
    let timer;

    if (isReloading) {
      setShowReloadBanner(true);
    } else {
      timer = setTimeout(() => {
        setShowReloadBanner(false);
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [isReloading]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 midnight:bg-black overflow-hidden select-none">
        {/* Premium ambient glows optimized to use radial gradients instead of expensive blur filters */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_65%)] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0%,transparent_65%)] rounded-full pointer-events-none animate-pulse" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Logo container */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-black font-black text-3xl shadow-2xl shadow-pink-500/25 border border-white/20 dark:border-black/20 animate-bounce">
            EZ
          </div>
          
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black tracking-widest bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent uppercase">
              EZVTOP
            </h1>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-zinc-400 font-bold">
                Initializing portal
              </span>
              <span className="flex gap-0.5 mt-0.5">
                <span className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 midnight:bg-black flex flex-col text-gray-900 dark:text-gray-100 midnight:text-gray-100 transition-colors"
    >
      {isAPIworking && !isOffline && (
        <div className="top-0 left-0 w-full bg-pink-500 text-black text-center py-2 font-medium">
          ⚠️ Unable to connect to API services. Please check back later. ⚠️
        </div>
      )}
      <motion.div layout>
        <AnimatePresence>
          {showReloadBanner && (
            <ReloadModal
              message={message}
              onClose={() => setIsReloading(false)}
              progressBar={progressBar}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {!isLoggedIn && (
        <div className="flex-grow flex items-center justify-center p-4">
          <LoginForm
            username={IDs.VtopUsername}
            setUsername={(val: string) =>
              setIDs(prev => ({ ...prev, VtopUsername: val }))
            }
            password={IDs.VtopPassword}
            setPassword={(val: string) =>
              setIDs(prev => ({ ...prev, VtopPassword: val }))
            }
            message={message}
            handleFormSubmit={handleFormSubmit}
            progressBar={progressBar}
          />
        </div>
      )}

      {isLoggedIn && (
        <>
          {isOffline && <div className="top-0 left-0 w-full bg-pink-500 text-black text-center py-2 font-medium">
            ⚠️ You’re currently offline. Some features may not work.
          </div>}
          <DashboardContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleLogOutRequest={handleLogOutRequest}
            handleReloadRequest={handleReloadRequest}
            GradesData={GradesData}
            allGradesData={AllGradesData}
            attendancePercentage={attendancePercentage}
            ODhoursData={ODhoursData}
            ODhoursIsOpen={ODhoursIsOpen}
            setODhoursIsOpen={setODhoursIsOpen}
            GradesDisplayIsOpen={GradesDisplayIsOpen}
            setGradesDisplayIsOpen={setGradesDisplayIsOpen}
            attendanceData={attendanceData}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            marksData={marksData}
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            ScheduleData={ScheduleData}
            hostelData={hostelData}
            HostelActiveSubTab={HostelActiveSubTab}
            setHostelActiveSubTab={setHostelActiveSubTab}
            activeAttendanceSubTab={activeAttendanceSubTab}
            setActiveAttendanceSubTab={setActiveAttendanceSubTab}
            calendarData={Calender}
            setCalender={setCalender}
            setIsReloading={setIsReloading}
            setProgressBar={setProgressBar}
            setMessage={setMessage}
            loginToVTOP={loginToVTOP}
            setAllGradesData={setAllGradesData}
            sethostelData={sethostelData}
            setGradesData={setGradesData}
            setScheduleData={setScheduleData}
            handleLogin={handleLogin}
            moodleData={moodleData}
            setMoodleData={setMoodleData}
            IDs={IDs}
            setIDs={setIDs}
            vitolData={vitolData}
            setVitolData={setVitolData}
            settings={settings}
            setSettings={setSettings}
          />
        </>
      )}
      {/* <div className="top-0 left-0 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md shadow-pink-500/10 text-center py-2 font-medium">
        Scheduled maintenance on December 29, 2025 ( afternoon ). API services will be temporarily unavailable.
      </div> */}

      <Footer isLoggedIn={isLoggedIn} />

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {customAlert && (
          <div
            onClick={() => setCustomAlert(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[280px] bg-white dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center gap-4 text-center"
            >
              {/* Premium Glows */}
              <div className="absolute -top-10 -left-10 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button in Top Right */}
              <button
                onClick={() => setCustomAlert(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Top Warning Icon */}
              <div className="p-3 bg-pink-500/10 text-pink-500 rounded-2xl mt-2 animate-pulse">
                <AlertCircle className="w-6 h-6" />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Attention
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-405 font-semibold leading-relaxed">
                  {customAlert}
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => setCustomAlert(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:brightness-105 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-500/10 cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
