import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false, className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Suppress if already running in standalone PWA mode
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa"
        onClick={install}
        className={
          className ||
          (compact
            ? 'relative w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#007af7] to-[#041f5e] hover:brightness-110 text-white shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer group shrink-0'
            : 'flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#007af7] to-[#041f5e] hover:brightness-110 text-white shadow-md shadow-blue-500/20 px-3.5 py-2 text-xs sm:text-sm transition font-bold active:scale-95 cursor-pointer')
        }
        title="Instalar OleVeci en tu pantalla de inicio"
        aria-label="Instalar OleVeci"
      >
        <Download className="w-4 h-4 shrink-0 text-amber-300 transition-transform duration-200 group-hover:translate-y-0.5" />
        {!compact && <span>Instalar App</span>}
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-pwa-ios"
          onClick={() => setShowIOSGuide(true)}
          className={
            className ||
            (compact
              ? 'relative w-9 h-9 rounded-xl flex items-center justify-center border border-blue-200/90 bg-blue-50/80 text-[#007af7] hover:bg-gradient-to-r hover:from-[#007af7] hover:to-[#041f5e] hover:text-white hover:border-transparent shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer group shrink-0'
              : 'flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 text-[#041f5e] hover:bg-blue-100 px-3 py-1.5 text-xs transition font-bold active:scale-95 cursor-pointer')
          }
          title="Cómo agregar OleVeci a la pantalla de inicio en iPhone"
          aria-label="Instalar en iOS"
        >
          <Smartphone className="w-4 h-4 text-[#007af7] group-hover:text-white shrink-0 transition-transform duration-200 group-hover:scale-105" />
          {!compact && <span>Instalar en iOS</span>}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/Logo_OleVeci.png?v=transparent"
                    alt="OleVeci"
                    className="h-8 w-auto object-contain bg-transparent"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Instalar OleVeci</h3>
                    <p className="text-xs text-slate-500">En tu iPhone o iPad</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Toca el botón <strong>Compartir</strong> <Share2 className="w-4 h-4 inline text-blue-600 mx-1" /> en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Baja en las opciones y selecciona <strong>Agregar a pantalla de inicio</strong> <PlusSquare className="w-4 h-4 inline text-slate-800 mx-1" />.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Toca <strong>Agregar</strong> en la esquina superior derecha para disfrutarla como una app nativa.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-[#007af7] hover:bg-[#0062f5] py-2.5 text-sm font-semibold text-white transition shadow-md shadow-blue-500/20"
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic prompt helper if user wants to know how to install
  return (
    <button
      id="btn-install-pwa-generic"
      onClick={() => setShowIOSGuide(true)}
      className={
        className ||
        (compact
          ? 'relative w-9 h-9 rounded-xl flex items-center justify-center border border-blue-200/90 bg-blue-50/80 text-[#007af7] hover:bg-gradient-to-r hover:from-[#007af7] hover:to-[#041f5e] hover:text-white hover:border-transparent shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer group shrink-0'
          : 'flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 text-[#007af7] hover:bg-blue-100 px-3 py-1.5 text-xs transition font-bold active:scale-95 cursor-pointer')
      }
      title="Agregar OleVeci a tu pantalla principal"
      aria-label="Instalar app"
    >
      <Download className="w-4 h-4 text-[#007af7] group-hover:text-white shrink-0 transition-all duration-200 group-hover:translate-y-0.5" />
      {!compact && <span>Instalar</span>}
    </button>
  );
};
