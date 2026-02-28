"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";
import {
  Eye, EyeOff, CheckCircle2, ArrowRight, ExternalLink,
  Clock, Truck, Shirt, Star, Menu, X, Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────
interface Confetti {
  id: number; x: number; y: number;
  vx: number; vy: number; color: string; size: number; rotation: number;
}

// ─── Root Page ────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="min-h-screen bg-[#07111f] font-inter overflow-x-hidden">
      <HeroSection heroY={heroY} router={router} />
      <HowItWorksSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}


// ══════════════════════════════════════════════════════
// HERO SECTION (with all enhancements)
// ══════════════════════════════════════════════════════
function HeroSection({ heroY, router }: { heroY: any; router: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Cursor motion values (Butter-Smooth Config) ---
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  // Supreme fluidity: High damping, low stiffness, and higher mass for "liquid" momentum
  const springCfg = { damping: 100, stiffness: 45, mass: 1.8, restDelta: 0.0001 };
  const smoothX = useSpring(cursorX, springCfg);
  const smoothY = useSpring(cursorY, springCfg);

  const glowCfg = { damping: 50, stiffness: 40 };
  const glowX = useSpring(rawMouseX, glowCfg);
  const glowY = useSpring(rawMouseY, glowCfg);

  const bgX = useTransform(smoothX, [-1, 1], ["5%", "-5%"]);
  const bgY = useTransform(smoothY, [-1, 1], ["5%", "-5%"]);
  const overlayX = useTransform(smoothX, [-1, 1], ["2%", "-2%"]);
  const overlayY = useTransform(smoothY, [-1, 1], ["2%", "-2%"]);
  const cardRotateX = useTransform(smoothY, [-1, 1], [6, -6]);
  const cardRotateY = useTransform(smoothX, [-1, 1], [-6, 6]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      cursorX.set(nx);
      cursorY.set(ny);
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [cursorX, cursorY, rawMouseX, rawMouseY]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setShowConfetti(true);
      setTimeout(() => router.push("/dashboard"), 2200);
    }, 1500);
  };

  const scrollToCard = () => {
    const card = document.getElementById("login-card");
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("ring-4", "ring-accent", "ring-offset-4", "ring-offset-transparent", "scale-[1.03]", "transition-all", "duration-300");
      setTimeout(() => card.classList.remove("ring-4", "ring-accent", "ring-offset-4", "ring-offset-transparent", "scale-[1.03]"), 1800);
      setTimeout(() => (card.querySelector("input") as HTMLInputElement)?.focus(), 400);
    }
  };

  return (
    <section
      className="relative min-h-screen w-full flex items-center overflow-hidden"
      style={{ background: "#07111f", perspective: "1200px" }}
    >
      {/* ── Ambient cursor glow ── */}
      <motion.div
        className="pointer-events-none fixed z-20"
        style={{
          left: glowX,
          top: glowY,
          x: "-50%",
          y: "-50%",
          width: 520,  // Slightly larger glow for smoother falloff
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)",
          filter: "blur(2px)",
          willChange: "left, top", // GPU hint
        }}
      />

      {/* ── Layer 0: Parallax background container (Scroll + Cursor) ── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: heroY, willChange: "transform" }}
      >
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ x: bgX, y: bgY, scale: 1.15, willChange: "transform" }}
        >
          <img
            src="/shirts-bg.jpg"
            alt="Hanging white shirts"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* ── Layer 1: Dark gradient overlay (Moves with background) ── */}
        <motion.div
          className="absolute inset-0 z-10"
          style={{ x: overlayX, y: overlayY, willChange: "transform" }}
        >
          <div className="w-full h-full bg-gradient-to-r from-[#07111f] via-[#07111f]/90 to-[#07111f]/40" />
        </motion.div>
      </motion.div>

      {/* ── Layer 2: Colour-glow orbs ── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-blue-700/20 filter blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-amber-500/10 filter blur-[100px]" />
      </div>

      {/* ── Layer 3: Steam particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 15 }}>
        <SteamEffect />
      </div>

      {/* ── Layer 4: Floating shirt silhouettes ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 12 }}>
        <FloatingShirts />
      </div>

      {/* ── Layer 5: Ambient Dust/Bokeh ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 18 }}>
        <AmbientDust mouseX={smoothX} mouseY={smoothY} />
      </div>

      {/* ── Confetti ── */}
      <AnimatePresence>
        {showConfetti && <ConfettiEffect onDone={() => setShowConfetti(false)} />}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="container mx-auto px-6 relative z-20 pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-6 text-white max-w-xl"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <Image src="/logo.png" alt="Mypresswala Logo" width={80} height={80} className="object-contain drop-shadow-xl" />
              <div className="flex flex-col">
                <span className="font-poppins font-bold text-2xl tracking-tight text-white leading-tight">mypresswala</span>
                <span className="text-xs text-white/45 font-medium tracking-widest uppercase">Admin Portal</span>
              </div>
            </motion.div>

            {/* Typewriter headline */}
            <div>
              <h1 className="text-5xl lg:text-7xl font-poppins font-bold leading-[1.05] tracking-tight text-white drop-shadow-sm">
                Press <TypewriterWord words={["perfection", "precision", "excellence"]} />,<br />delivered.
              </h1>
            </div>

            <p className="text-lg text-white/70 leading-relaxed max-w-md">
              Admin operations for Mypresswala—schedule, track, and delight customers at scale.
            </p>

            {/* Trust badge */}
            <TrustBadge />

            {/* Animated stats */}
            <StatCounters />

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {/* PRIMARY: Liquid Glass Amber */}
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToCard}
                className="relative overflow-hidden group py-3.5 px-8 rounded-2xl font-poppins font-semibold flex items-center justify-center gap-2.5 text-sm tracking-wide"
                style={{
                  background: "linear-gradient(135deg, rgba(251,191,36,0.95) 0%, rgba(245,158,11,0.9) 50%, rgba(217,119,6,0.85) 100%)",
                  boxShadow: "0 8px 32px rgba(251,191,36,0.35), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#1a1a1a",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-2xl pointer-events-none" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(251,191,36,0.6) 0%, transparent 70%)" }} />
                <span className="relative z-10 flex items-center gap-2">Enter Dashboard <ArrowRight className="w-4 h-4" /></span>
              </motion.button>

              {/* SECONDARY: Frosted Glass */}
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="https://mypresswalla.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden group py-3.5 px-8 rounded-2xl font-poppins font-medium flex items-center justify-center gap-2.5 text-sm tracking-wide text-white"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.1)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />
                <span className="relative z-10 flex items-center gap-2">View Public Site <ExternalLink className="w-4 h-4" /></span>
              </motion.a>
            </div>
          </motion.div>

          {/* Right: Login Card */}
          <motion.div
            id="login-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformStyle: "preserve-3d" }}
            className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0 z-30"
          >
            <AnimatePresence>
              <motion.form
                onSubmit={handleLogin}
                animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={cn(
                  "w-full rounded-3xl p-8 sm:p-10 relative overflow-hidden border shadow-2xl",
                  isSuccess && "opacity-0 pointer-events-none transition-opacity duration-1000"
                )}
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.07) 100%)",
                  backdropFilter: "blur(32px)",
                  borderColor: "rgba(255,255,255,0.15)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.2) inset",
                }}
              >
                {/* Glass layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-blue-500/5 pointer-events-none rounded-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Card Header */}
                <div className="relative z-10 flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.15))",
                      border: "1px solid rgba(251,191,36,0.3)",
                      boxShadow: "0 4px 12px rgba(251,191,36,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-poppins font-bold text-white leading-tight">Admin Access</h2>
                    <p className="text-xs text-white/45 font-medium mt-0.5">Sign in to your dashboard</p>
                  </div>
                </div>
                <div className="relative z-10 mb-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                {/* Form fields */}
                <div className="space-y-5 relative z-10">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-white/55 uppercase tracking-wider ml-0.5">Email address</label>
                    <input
                      type="email" id="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-white/30 focus:outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}
                      onFocus={e => { e.currentTarget.style.border = "1px solid rgba(251,191,36,0.6)"; e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 3px rgba(251,191,36,0.15)"; }}
                      onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)"; }}
                      placeholder="admin@mypresswala.com"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label htmlFor="password" className="text-xs font-semibold text-white/55 uppercase tracking-wider ml-0.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"} id="password" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl pl-4 pr-12 py-3.5 text-white text-sm placeholder:text-white/30 focus:outline-none transition-all tracking-widest placeholder:tracking-normal"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}
                        onFocus={e => { e.currentTarget.style.border = "1px solid rgba(251,191,36,0.6)"; e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 3px rgba(251,191,36,0.15)"; }}
                        onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)"; }}
                        placeholder="••••••••"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}
                        className="w-4 h-4 rounded border-white/20 bg-black/20 text-accent focus:ring-accent focus:ring-offset-primary" />
                      <span className="text-sm text-white/60 group-hover:text-white transition-colors">Remember me</span>
                    </label>
                    <a href="#" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">Forgot password?</a>
                  </div>

                  {/* Liquid Glass Sign In button */}
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="relative overflow-hidden group w-full py-4 rounded-2xl font-poppins font-semibold text-sm tracking-wide text-gray-900 flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(251,191,36,1) 0%, rgba(245,158,11,0.95) 45%, rgba(217,119,6,0.9) 100%)",
                      boxShadow: "0 10px 40px rgba(251,191,36,0.4), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.15)",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/45 to-transparent rounded-t-2xl pointer-events-none" />
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-600 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                      style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(251,191,36,0.7) 0%, transparent 65%)" }} />
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full" />
                      ) : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
                    </span>
                  </motion.button>
                </div>
              </motion.form>
            </AnimatePresence>

            {/* Success overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-40"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: "rgba(34,197,94,0.2)", border: "2px solid rgba(34,197,94,0.4)" }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </motion.div>
                  <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="text-2xl font-poppins font-bold text-white text-center">Welcome back! 🎉</motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className="text-white/60 text-sm mt-2">Redirecting to dashboard...</motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// 2. TYPEWRITER WORD CYCLER
// ══════════════════════════════════════════════════════
function TypewriterWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    } else {
      const delta = isDeleting ? 60 : 90;
      timeout = setTimeout(() => {
        setDisplayText(isDeleting
          ? currentWord.slice(0, displayText.length - 1)
          : currentWord.slice(0, displayText.length + 1)
        );
      }, delta);
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index, words]);

  return (
    <span className="text-transparent bg-clip-text"
      style={{ backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%)" }}>
      {displayText}
      <span className="animate-pulse text-amber-400">|</span>
    </span>
  );
}

// ══════════════════════════════════════════════════════
// 3. TRUST BADGE
// ══════════════════════════════════════════════════════
function TrustBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full text-sm w-fit"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <span className="text-white/80 font-medium">4.9/5</span>
      <div className="w-px h-4 bg-white/15" />
      <span className="text-white/60">200+ Reviews</span>
      <div className="w-px h-4 bg-white/15" />
      <span className="text-white/60">Bangalore&apos;s #1 Press</span>
      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════
// 4. ANIMATED STAT COUNTERS
// ══════════════════════════════════════════════════════
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, target, {
      duration: 2.2,
      ease: "easeOut",
      delay: 0.8,
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function StatCounters() {
  const stats = [
    { value: 5000, suffix: "+", label: "Orders Delivered" },
    { value: 200, suffix: "+", label: "Happy Customers" },
    { value: 99, suffix: "%", label: "On-Time Rate" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="flex gap-6 sm:gap-8 pt-1"
    >
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-2xl sm:text-3xl font-poppins font-bold text-white">
            <CountUp target={s.value} suffix={s.suffix} />
          </span>
          <span className="text-xs text-white/45 font-medium mt-0.5">{s.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════
// 5. FLOATING SHIRT SILHOUETTES
// ══════════════════════════════════════════════════════
function FloatingShirts() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shirts = useMemo(() => [
    { left: "8%", top: "15%", size: 28, dur: 14, delay: 0, drift: 18 },
    { left: "18%", top: "70%", size: 22, dur: 18, delay: 3, drift: -14 },
    { left: "88%", top: "20%", size: 20, dur: 16, delay: 1.5, drift: 12 },
    { left: "75%", top: "75%", size: 24, dur: 20, delay: 5, drift: -16 },
    { left: "55%", top: "10%", size: 18, dur: 12, delay: 2, drift: 10 },
  ], []);

  if (!mounted) return null;

  return (
    <>
      {shirts.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: s.left, top: s.top }}
          animate={{ y: [0, -s.drift, 0, s.drift * 0.5, 0], rotate: [0, 3, -2, 2, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={s.size} height={s.size * 1.3} viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.12 }}>
            <path d="M14 4 C14 4 12 1 8 2 L1 6 L8 14 C8 14 10 12 12 12 L12 48 L28 48 L28 12 C30 12 32 14 32 14 L39 6 L32 2 C28 1 26 4 26 4 C26 6 22 8 20 8 C18 8 14 6 14 4Z"
              fill="white" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="14" y1="4" x2="14" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            <line x1="26" y1="4" x2="26" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="0" x2="26" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

// ══════════════════════════════════════════════════════
// 6. CONFETTI EFFECT
// ══════════════════════════════════════════════════════
function ConfettiEffect({ onDone }: { onDone: () => void }) {
  const [particles, setParticles] = useState<Confetti[]>([]);
  const colors = ["#fbbf24", "#f59e0b", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];

  useEffect(() => {
    const ps: Confetti[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -20,
      vx: (Math.random() - 0.5) * 8,
      vy: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
    setParticles(ps);
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size / 2, background: p.color, rotate: p.rotation }}
          animate={{ y: window.innerHeight + 60, x: p.x + p.vx * 80, rotate: p.rotation + 360 * (Math.random() > 0.5 ? 1 : -1), opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random(), ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 7. AMBIENT DUST / BOKEH
// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
function DustParticle({ p, mouseX, mouseY }: { p: any; mouseX: any; mouseY: any }) {
  const x = useTransform(mouseX, [-1, 1], [`${p.depth * 1.5}%`, `${p.depth * -1.5}%`]);
  const y = useTransform(mouseY, [-1, 1], [`${p.depth * 1.5}%`, `${p.depth * -1.5}%`]);

  return (
    <motion.div
      className="absolute rounded-full bg-white/40"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: p.size,
        height: p.size,
        opacity: p.opacity,
        filter: "blur(1px)",
        x,
        y,
        willChange: "transform",
      }}
    />
  );
}

function AmbientDust({ mouseX, mouseY }: { mouseX: any; mouseY: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.2,
      depth: 0.5 + Math.random() * 1.5,
    })),
    []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0" style={{ willChange: "transform" }}>
      {particles.map((p) => (
        <DustParticle key={p.id} p={p} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// STEAM EFFECT (client-only)
// ══════════════════════════════════════════════════════
function SteamEffect() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const wisps = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: 42 + Math.random() * 58,
      startBottom: Math.random() * 40,
      delay: Math.random() * 7,
      dur: 6 + Math.random() * 7,
      size: 60 + Math.random() * 100,
      driftX: (Math.random() - 0.5) * 160,
      riseY: -(700 + Math.random() * 400),
      peakOpacity: 0.55 + Math.random() * 0.35,
      repeatDelay: Math.random() * 5,
    })),
    []
  );

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {wisps.map((w) => (
        <motion.div
          key={w.id}
          className="absolute rounded-full"
          style={{
            left: `${w.left}%`,
            bottom: `${w.startBottom}%`,
            width: w.size,
            height: w.size,
            background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(200,220,255,0.10) 55%, transparent 100%)",
            filter: "blur(22px)",
          }}
          animate={{
            y: [0, w.driftX * 0.3, w.riseY],
            x: [0, w.driftX, w.driftX * 0.6],
            opacity: [0, w.peakOpacity, w.peakOpacity * 0.6, 0],
            scale: [0.5, 1.2, 1.7, 2.2],
          }}
          transition={{ duration: w.dur, delay: w.delay, repeat: Infinity, repeatDelay: w.repeatDelay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// HOW IT WORKS SECTION
// ══════════════════════════════════════════════════════
function HowItWorksSection() {
  const steps = [
    { icon: <Clock className="w-7 h-7" />, num: "01", title: "Schedule Pickup", desc: "Choose a convenient time and we'll come to your door — no waiting." },
    { icon: <Truck className="w-7 h-7" />, num: "02", title: "We Collect", desc: "Our team picks up your clothes in our branded, hygienic bags." },
    { icon: <Shirt className="w-7 h-7" />, num: "03", title: "Expert Ironing", desc: "Skilled pressers handle each garment with care and precision." },
    { icon: <CheckCircle2 className="w-7 h-7" />, num: "04", title: "Delivery", desc: "Fresh, crisp clothes delivered back to your doorstep on time." },
  ];

  return (
    <section className="py-24 bg-[#07111f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3 block">The Process</span>
          <h2 className="text-4xl lg:text-5xl font-poppins font-bold text-white">How It Works</h2>
          <p className="text-white/50 mt-4 max-w-md mx-auto">Four simple steps to perfectly pressed clothes, every time.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-5xl font-poppins font-black text-white/6 select-none leading-none">{step.num}</span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-amber-400"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                {step.icon}
              </div>
              <h3 className="text-lg font-poppins font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// TESTIMONIALS SECTION
// ══════════════════════════════════════════════════════
function TestimonialsSection() {
  const reviews = [
    { name: "Priya Sharma", role: "Marketing Manager", text: "Mypresswala completely changed my mornings. My clothes are always ready, perfectly pressed!", avatar: "PS" },
    { name: "Rahul Mehta", role: "Software Engineer", text: "Super reliable and professional. Best press service in Bangalore, hands down.", avatar: "RM" },
    { name: "Ananya Reddy", role: "Entrepreneur", text: "The quality is incredible and the team is always on time. 10/10 would recommend!", avatar: "AR" },
  ];

  return (
    <section className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #07111f 0%, #0d1e35 50%, #07111f 100%)" }}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3 block">Testimonials</span>
          <h2 className="text-4xl lg:text-5xl font-poppins font-bold text-white">What Our Clients Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              }}>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-gray-900"
                  style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>{r.avatar}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-white/40">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// FOOTER SECTION
// ══════════════════════════════════════════════════════
function FooterSection() {
  return (
    <footer className="py-16 border-t border-white/8" style={{ background: "#04090f" }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
              <span className="font-poppins font-bold text-lg text-white">mypresswala</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">Bangalore&apos;s premium garment pressing and laundry service. Quality, reliability, and care — every single time.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {["Services", "Pricing", "How It Works", "About Us"].map(l => (
                <a key={l} href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Contact</h4>
            <div className="flex flex-col gap-2.5 text-sm text-white/50">
              <span>📧 hello@mypresswala.com</span>
              <span>📞 +91 80 1234 5678</span>
              <span>📍 Bangalore, Karnataka</span>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between text-xs text-white/30 gap-4">
          <p>© 2026 MyPressWala. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
