import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, BellOff, BellRing, Check, ShieldCheck, X } from 'lucide-react';

interface PushNotificationManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ isOpen, onClose }) => {
  const {
    notificationPrefs,
    setNotificationPrefs,
    simulatePushNotification,
  } = useApp();

  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isEnabled = Boolean(notificationPrefs.enabled);

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      // Despulsar: desactivar notificaciones
      setNotificationPrefs((prev) => ({ ...prev, enabled: false }));
    } else {
      // Pulsar: activar notificaciones
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          setPermissionState(permission);
          setNotificationPrefs((prev) => ({ ...prev, enabled: true }));

          if (permission === 'granted') {
            simulatePushNotification(
              '🎉 ¡Notificaciones activadas!',
              'Te avisaremos cuando un comercio de tu sector publique ofertas o eventos.'
            );
          } else {
            simulatePushNotification(
              '🎉 ¡Alertas locales activadas!',
              'Recibirás los avisos de promociones y novedades en pantalla.'
            );
          }
        } catch {
          setNotificationPrefs((prev) => ({ ...prev, enabled: true }));
        }
      } else {
        setNotificationPrefs((prev) => ({ ...prev, enabled: true }));
        simulatePushNotification(
          '🎉 ¡Alertas locales activadas!',
          'Recibirás los avisos de promociones y novedades en pantalla.'
        );
      }
    }
  };

  return (
    <div
      id="push-notifications-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-teal-50/70 via-cyan-50/40 to-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d8a5] to-[#00b4d8] text-[#021b58] flex items-center justify-center shadow-md shadow-[#00d8a5]/20">
              <BellRing className="w-4 h-4 text-[#021b58]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Alertas y Notificaciones</h3>
              <p className="text-xs text-slate-500">¿Qué hay hoy cerca de ti?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Única sección: Permitir / Desactivar Notificaciones */}
        <div className="p-4 sm:p-5">
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#00d8a5]/10 via-[#00b4d8]/10 to-transparent border border-teal-200">
            <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
              “¿Quieres recibir las mejores promociones y novedades cerca de ti?”
            </p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Te avisamos cuando un comercio de tu sector publique una oferta que vence hoy o un evento de fin de semana. Cero spam.
            </p>

            {isEnabled ? (
              <button
                id="btn-toggle-notifications"
                type="button"
                onClick={handleToggleNotifications}
                className="mt-4 w-full flex items-center justify-between rounded-xl bg-emerald-600 hover:bg-rose-600 text-white py-2.5 px-4 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer group active:scale-[0.98]"
                title="Toca para desactivar las notificaciones"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 group-hover:hidden" />
                  <BellOff className="w-4 h-4 shrink-0 hidden group-hover:inline" />
                  <span className="group-hover:hidden">Notificaciones activadas</span>
                  <span className="hidden group-hover:inline">Desactivar Notificaciones</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium bg-black/20 group-hover:bg-black/30 px-2 py-0.5 rounded-md">
                  Toca para desactivar
                </span>
              </button>
            ) : (
              <button
                id="btn-toggle-notifications"
                type="button"
                onClick={handleToggleNotifications}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 px-4 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer active:scale-[0.98]"
              >
                <Bell className="w-4 h-4" />
                <span>Permitir Notificaciones</span>
              </button>
            )}

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Privacidad respetada: puedes activar o desactivar cuando quieras.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
