import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      role="status"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center justify-between gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-slate-700 text-sm animate-bounce"
    >
      <div className="flex items-center gap-2.5">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-medium">Modo Sin Conexión</span>
        <span className="text-slate-400 text-xs hidden sm:inline">— Mostrando publicaciones guardadas localmente</span>
      </div>
      <span className="text-[11px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
        PWA Offline
      </span>
    </div>
  );
};
