"use client";
import { Eye, EyeOff, User, Lock, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  message,
  handleFormSubmit,
  progressBar
}) {
  const isLoading = message.startsWith("Logging");
  const [showPassword, setShowPassword] = useState(false);

  // Local state for username and password to prevent parent re-renders while typing
  const [localUsername, setLocalUsername] = useState(username || "");
  const [localPassword, setLocalPassword] = useState(password || "");

  // Sync props to local state when they are asynchronously loaded by the parent component
  useEffect(() => {
    if (username) {
      setLocalUsername(username);
    }
  }, [username]);

  useEffect(() => {
    if (password) {
      setLocalPassword(password);
    }
  }, [password]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 bg-gray-50 dark:bg-slate-950 midnight:bg-black overflow-hidden transition-colors duration-500">
      {/* Premium ambient glows optimized to use radial gradients instead of expensive blur filters */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
          x: [0, 15, 0],
          y: [0, -15, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,transparent_65%)] dark:bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08)_0%,transparent_65%)] rounded-full pointer-events-none will-change-transform"
      />
      <motion.div
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.8, 1, 0.8],
          x: [0, -15, 0],
          y: [0, 15, 0]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 left-0 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2)_0%,transparent_65%)] dark:bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08)_0%,transparent_65%)] rounded-full pointer-events-none will-change-transform"
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Animated App Brand */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/25 bg-pink-500/5 backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-pink-600 dark:text-blue-400">
              Next-Gen VTOP client (Chennai Campus Only)
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-wider bg-gradient-to-r from-pink-500 via-pink-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm select-none">
            EZVTOP
          </h1>
          <p className="text-gray-600 dark:text-gray-400 midnight:text-gray-400 max-w-sm mx-auto text-xs font-normal">
            Your premium VTOP client portal. Chennai Campus only. Clean, lightning fast, and elegant.
          </p>
        </motion.div>

        {/* Animated Form Card */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={(e) => handleFormSubmit(e, localUsername, localPassword)}
          className="w-full bg-white/60 dark:bg-slate-900/50 midnight:bg-zinc-950/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 border-t-pink-500/30 dark:border-t-pink-500/20 rounded-3xl p-8 space-y-6 shadow-2xl shadow-pink-500/5 transition-[box-shadow] duration-300 hover:shadow-pink-500/10"
        >
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
            Welcome Back
          </h2>

          <div className="space-y-4">
            {/* Username Input wrapper */}
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-pink-500 transition-colors duration-300">
                <User className="w-5 h-5" />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-800 midnight:border-gray-800 bg-white/40 dark:bg-slate-950/30 midnight:bg-black/30 rounded-2xl text-gray-900 dark:text-gray-100 midnight:text-gray-100 placeholder-gray-400/80 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500/50 dark:focus:ring-pink-500/20 dark:focus:border-pink-500/30 transition-[box-shadow,border-color,background-color] duration-300"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                placeholder="VTOP Username"
                required
              />
            </div>

            {/* Password Input wrapper */}
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-pink-500 transition-colors duration-300">
                <Lock className="w-5 h-5" />
              </span>
              <input
                className="w-full pl-12 pr-12 py-3.5 border border-gray-200 dark:border-gray-800 midnight:border-gray-800 bg-white/40 dark:bg-slate-950/30 midnight:bg-black/30 rounded-2xl text-gray-900 dark:text-gray-100 midnight:text-gray-100 placeholder-gray-400/80 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500/50 dark:focus:ring-pink-500/20 dark:focus:border-pink-500/30 transition-[box-shadow,border-color,background-color] duration-300"
                type={showPassword ? "text" : "password"}
                value={localPassword}
                onChange={(e) => setLocalPassword(e.target.value)}
                placeholder="VTOP Password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-pink-500 dark:hover:text-blue-400 hover:bg-pink-500/5 transition-[color,background-color] duration-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action / Loading area */}
          <div className="relative pt-2">
            <AnimatePresence mode="wait">
              {!isLoading ? (
                <motion.button
                  key="submit-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:to-yellow-700 py-3.5 rounded-2xl font-semibold text-black shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 hover:cursor-pointer transition-[box-shadow,background-image] duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                >
                  Login
                </motion.button>
              ) : (
                <motion.div
                  key="loading-indicator"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 w-full"
                >
                  {/* Subtle pulsing glow around the loader */}
                  <div className="relative w-full bg-gray-100 dark:bg-slate-950/80 rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-4 overflow-hidden">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/5 to-transparent pointer-events-none"
                    />
                    <div className="relative flex flex-col items-center justify-center gap-3 text-sm">
                      <div className="w-full bg-gray-200 dark:bg-gray-800 midnight:bg-gray-900 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className="h-2.5 bg-gradient-to-r from-blue-400 to-pink-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progressBar}%` }}
                        />
                      </div>
                      <span className="whitespace-pre-wrap text-center text-xs font-medium text-pink-600 dark:text-blue-400 animate-pulse">
                        {message}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* Footer legal text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8 space-y-1.5 select-none"
        >
          <p className="text-[11px] text-gray-500 dark:text-gray-400/60 midnight:text-gray-600 max-w-xs mx-auto leading-relaxed">
            Independent client portal. Not affiliated with VIT or VTOP.
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500/50 midnight:text-gray-700">
            For educational purposes only.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
