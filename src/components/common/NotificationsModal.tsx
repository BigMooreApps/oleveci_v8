import React, { useState, useMemo } from 'react';
import {
  Bell,
  X,
  Store,
  FileText,
  Info,
  ArrowRight,
} from 'lucide-react';

export interface NotificationItemData {
  id: string;
  title: string;
  message: string;
  category?: 'business' | 'post' | 'system';
  timeFormatted: string;
  read?: boolean;
  reason?: string; // Motivo de suspensión / reporte
  note?: string; // Aclaración o nota del comercio
  onView?: () => void; // Acción "Ver" (acceso rápido)
  onDismiss?: () => void; // Eliminar notificación individual
}

export interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  items: NotificationItemData[];
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  title = 'Notificaciones y Avisos',
  subtitle = 'Mensajes de moderación y novedades del sistema',
  items,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'business' | 'post'>('all');

  const businessCount = useMemo(
    () => items.filter((i) => i.category === 'business').length,
    [items]
  );
  const postCount = useMemo(
    () => items.filter((i) => i.category === 'post').length,
    [items]
  );
  const unreadCount = useMemo(
    () => items.filter((i) => !i.read).length,
    [items]
  );

  const hasMultipleCategories = businessCount > 0 && postCount > 0;

  const filteredItems = useMemo(() => {
    if (!hasMultipleCategories || activeFilter === 'all') return items;
    return items.filter((i) => i.category === activeFilter);
  }, [items, activeFilter, hasMultipleCategories]);

  if (!isOpen) return null;

  return (
    <div
      id="notifications-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="notifications-modal-card"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100/80 text-[#007af7] flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#041f5e] truncate">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-notifications-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {items.length > 0 ? (
            <>
              {/* Meta controls & bulk actions */}
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-xs font-semibold text-slate-500">
                  {items.length} {items.length === 1 ? 'notificación' : 'notificaciones'}
                </span>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && onMarkAllAsRead && (
                    <button
                      type="button"
                      id="btn-mark-all-read"
                      onClick={onMarkAllAsRead}
                      className="text-xs font-semibold text-[#007af7] hover:text-blue-700 transition cursor-pointer"
                    >
                      Marcar como leídas
                    </button>
                  )}
                  {onClearAll && (
                    <button
                      type="button"
                      id="btn-clear-all-notifications"
                      onClick={onClearAll}
                      className="text-xs font-medium text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      Limpiar todas
                    </button>
                  )}
                </div>
              </div>

              {/* Category filter pills (if applicable) */}
              {hasMultipleCategories && (
                <div className="flex items-center gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-[#041f5e] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
                    }`}
                  >
                    Todas ({items.length})
                  </button>
                  {businessCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('business')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        activeFilter === 'business'
                          ? 'bg-[#ff7700] text-white shadow-2xs'
                          : 'bg-amber-50/70 text-amber-900 hover:bg-amber-100/70 border border-amber-200/70'
                      }`}
                    >
                      <Store className="w-3 h-3 text-current" />
                      <span>Negocios ({businessCount})</span>
                    </button>
                  )}
                  {postCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('post')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        activeFilter === 'post'
                          ? 'bg-[#007af7] text-white shadow-2xs'
                          : 'bg-blue-50/70 text-blue-900 hover:bg-blue-100/70 border border-blue-200/70'
                      }`}
                    >
                      <FileText className="w-3 h-3 text-current" />
                      <span>Publicaciones ({postCount})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Notification items list */}
              <div className="space-y-2.5">
                {filteredItems.map((item) => {
                  const isUnread = item.read === false;

                  return (
                    <div
                      key={item.id}
                      id={`notification-item-${item.id}`}
                      className={`relative p-3.5 rounded-2xl border transition-all duration-150 group bg-white ${
                        isUnread
                          ? 'border-blue-200/80 bg-blue-50/20 border-l-[3.5px] border-l-[#007af7] shadow-2xs'
                          : 'border-slate-200/70 shadow-2xs hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Individual dismiss button */}
                      {item.onDismiss && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onDismiss?.();
                          }}
                          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                          title="Eliminar notificación"
                          aria-label="Eliminar notificación"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="flex items-start gap-3 pr-6">
                        {/* Subtle Category Icon */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                            item.category === 'business'
                              ? 'bg-amber-50/90 text-[#ff7700] border-amber-200/70'
                              : item.category === 'post'
                              ? 'bg-blue-50/90 text-[#007af7] border-blue-200/70'
                              : 'bg-slate-50 text-slate-600 border-slate-200/70'
                          }`}
                        >
                          {item.category === 'business' ? (
                            <Store className="w-3.5 h-3.5" />
                          ) : item.category === 'post' ? (
                            <FileText className="w-3.5 h-3.5" />
                          ) : (
                            <Info className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                              {item.timeFormatted}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed mt-1">
                            {item.message}
                          </p>

                          {/* Subtle Reason box */}
                          {item.reason && (
                            <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-700 font-normal">
                              <span className="font-semibold text-slate-900">Motivo:</span> "{item.reason}"
                            </div>
                          )}

                          {/* Subtle Note / Clarification box */}
                          {item.note && (
                            <div className="mt-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-700 font-normal">
                              <span className="font-semibold text-slate-900">Aclaración:</span> "{item.note}"
                            </div>
                          )}

                          {/* Quick access "Ver" button (only when applicable) */}
                          {item.onView && (
                            <div className="mt-2.5 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  item.onView?.();
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#007af7] hover:text-white text-[#041f5e] border border-slate-200/80 hover:border-[#007af7] text-xs font-semibold shadow-2xs transition-all duration-150 cursor-pointer active:scale-95"
                                title="Ver novedad"
                              >
                                <span>Ver</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Bell className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                No tienes notificaciones pendientes
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Aquí recibirás avisos del sistema, alertas de moderación y novedades.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 flex justify-end shrink-0">
          <button
            type="button"
            id="btn-close-notifications-modal-footer"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/80 transition cursor-pointer shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
