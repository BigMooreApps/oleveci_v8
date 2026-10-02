import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface WelcomeSplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

/**
 * Automatic Welcome Splash Animation with the official Logo_Presentacion.png
 * Features dynamic entry pop, gentle floating animation, soft brand aurora glow,
 * smooth progress indicator, and instant tap-to-skip so the user is never blocked.
 */
export const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({
  onFinish,
  durationMs = 1200,
}) => {
  // Check if user already saw the splash in this browser session or arrived via direct deep link
  const [isMounted, setIsMounted] = useState(() => {
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const search = typeof window !== 'undefined' ? window.location.search : '';
      if (
        path.startsWith('/anuncio/') ||
        path.startsWith('/comercio/') ||
        path.startsWith('/p/') ||
        search.includes('post=') ||
        search.includes('biz=')
      ) {
        return false;
      }
      return sessionStorage.getItem('oleveci_welcome_seen') !== 'true';
    } catch {
      return false;
    }
  });

  const [isStarted, setIsStarted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const hasFinishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const dismissSplash = React.useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    try {
      sessionStorage.setItem('oleveci_welcome_seen', 'true');
    } catch {
      // Storage unavailable
    }
    if (onFinishRef.current) onFinishRef.current();
    setIsExiting(true);
    setTimeout(() => {
      setIsMounted(false);
    }, 250);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      if (onFinishRef.current && !hasFinishedRef.current) {
        hasFinishedRef.current = true;
        onFinishRef.current();
      }
      return;
    }

    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, 20);

    const exitTimer = setTimeout(() => {
      dismissSplash();
    }, durationMs);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(exitTimer);
    };
  }, [durationMs, isMounted, dismissSplash]);

  if (!isMounted) return null;

  return (
    <div
      onClick={dismissSplash}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white px-6 select-none overflow-hidden transition-opacity duration-300 ease-out cursor-pointer ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="Bienvenido a OleVeci"
    >
      {/* Dynamic Brand Aura Background */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#007af7]/12 via-[#ff7700]/10 to-transparent blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute w-80 h-80 rounded-full bg-[#041f5e]/6 blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center max-w-xs sm:max-w-sm w-full text-center space-y-6">
        {/* Animated Transparent Logo Container */}
        <div
          className={`relative transition-all duration-500 ease-out transform ${
            isStarted
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-90'
          }`}
        >
          {/* Subtle luminous halo behind transparent logo */}
          <div className="absolute -inset-6 bg-gradient-to-tr from-[#007af7]/20 via-[#ff7700]/15 to-transparent rounded-full blur-2xl -z-10 animate-pulse-glow" />

          {/* Transparent Logo with gentle floating hover animation */}
          <div className={isStarted && !isExiting ? 'animate-float-logo' : ''}>
            <img
              src="/Logo_Presentacion.png"
              alt="OleVeci.com - Negocios locales, más cerca de ti"
              className="w-52 sm:w-60 md:w-64 h-auto object-contain mx-auto drop-shadow-sm"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Visual Automatic Progress Indicator */}
        <div className="w-48 sm:w-56 space-y-2.5 pt-1">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
            <div
              style={{
                width: isStarted ? '100%' : '0%',
                transitionDuration: `${durationMs}ms`,
                transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="h-full bg-gradient-to-r from-[#007af7] via-[#041f5e] to-[#ff7700] rounded-full transition-all"
            />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007af7] animate-ping" />
            <p className="text-[11px] font-semibold tracking-wide text-slate-500">
              Conectando tu comunidad local...
            </p>
          </div>
        </div>

        {/* Instant Skip / Enter Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismissSplash();
          }}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#021b58] text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
        >
          <span>Entrar ahora</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#007af7]" />
        </button>
      </div>
    </div>
  );
};

