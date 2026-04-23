import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@/assets/flowentra-logo.png";

interface LoadingScreenProps {
  minDuration?: number;
  onComplete?: () => void;
}

const LoadingScreen = ({ minDuration = 1400, onComplete }: LoadingScreenProps) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();

    // Smooth progress that eases toward 90% while loading,
    // then snaps to 100% on completion for a polished feel.
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / minDuration);
      // ease-out cubic, capped at 0.9 until "load" fires
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress((p) => Math.max(p, Math.min(0.9, eased)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, minDuration - elapsed);
      window.setTimeout(() => {
        setProgress(1);
        // Allow the bar to visibly reach 100% before fading out
        window.setTimeout(() => {
          setVisible(false);
          onComplete?.();
        }, 280);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("load", finish);
      };
    }
    return () => cancelAnimationFrame(raf);
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-screen"
          role="status"
          aria-live="polite"
          aria-label="Loading"
          aria-busy="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--border)/0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.5) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          {/* Soft brand glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[680px] rounded-full bg-primary/10 blur-[160px]" />
          </div>

          <div className="relative flex flex-col items-center">
            {/* Logo lockup */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center"
            >
              <img
                src={logo}
                alt="Flowentra"
                className="h-12 w-auto select-none"
                draggable={false}
              />
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 w-[220px]"
            >
              <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-border/60">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground/70">
                <span>Loading</span>
                <span className="tabular-nums">{Math.round(progress * 100)}%</span>
              </div>
            </motion.div>

            <span className="sr-only">Loading Flowentra…</span>
          </div>

          {/* Footer mark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase text-muted-foreground/60"
            aria-hidden="true"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-primary/70" />
            Flowentra Platform
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
