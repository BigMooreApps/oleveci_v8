import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminBusinessesTab } from './admin/AdminBusinessesTab';
import { AdminPostsTab } from './admin/AdminPostsTab';
import { AdminMunicipalitiesTab } from './admin/AdminMunicipalitiesTab';
import { AdminCategoriesTab } from './admin/AdminCategoriesTab';
import { AdminPostTypesTab } from './admin/AdminPostTypesTab';
import { AdminPlanCategoriesTab } from './admin/AdminPlanCategoriesTab';
import { AdminReadyPlansTab } from './admin/AdminReadyPlansTab';
import { AdminProfileTab } from './admin/AdminProfileTab';
import { NotificationsModal, NotificationItemData } from './common/NotificationsModal';
import {
  Building2,
  FileText,
  MapPin,
  Layers,
  Sparkles,
  Route,
  Compass,
  CheckSquare,
  TrendingUp,
  Store,
  ArrowRight,
  Database,
  CheckCircle2,
  Clock,
  Bell,
  LogOut,
  X,
  AlertTriangle,
  UserCog,
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'businesses'
  | 'posts'
  | 'ready_plans'
  | 'municipalities'
  | 'categories'
  | 'post_types'
  | 'plan_types'
  | 'superadmin';

export const AdminDashboard: React.FC = () => {
  const {
    businesses,
    posts,
    municipalities,
    sectors,
    categories,
    postTypes,
    setCurrentRole,
    logoutAdmin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [businessTabFilter, setBusinessTabFilter] = useState<
    'all' | 'active' | 'expired' | 'suspended' | 'pending_review'
  >('all');
  const [postTabFilter, setPostTabFilter] = useState<
    'all' | 'active' | 'expired' | 'suspended' | 'pending_review'
  >('all');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const [readAdminNotifs, setReadAdminNotifs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oleveci_admin_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedAdminNotifs, setDismissedAdminNotifs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oleveci_admin_dismissed_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pendingBusinessReviews = useMemo(() => {
    return businesses.filter(
      (b) => b.status === 'pending_review' || b.reviewStatus === 'pending'
    );
  }, [businesses]);

  const pendingPostReviews = useMemo(() => {
    return posts.filter(
      (p) => p.status === 'pending_review' || p.reviewStatus === 'pending'
    );
  }, [posts]);

  const adminNotificationItems = useMemo<NotificationItemData[]>(() => {
    const items: NotificationItemData[] = [];

    pendingBusinessReviews.forEach((biz) => {
      const notifId = `biz_rev_${biz.id}`;
      if (dismissedAdminNotifs.includes(notifId)) return;
      const dateVal = biz.lastCorrectionAt || biz.createdAt || new Date().toISOString();
      items.push({
        id: notifId,
        category: 'business',
        title: `Revisión de Negocio: ${biz.name}`,
        message: `El comercio ha enviado una solicitud de revisión para reactivación en ${biz.city}${biz.sector ? ` · ${biz.sector}` : ''}.`,
        timeFormatted: new Date(dateVal).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        note: biz.correctionNote,
        reason: biz.suspensionReason,
        read: readAdminNotifs.includes(notifId),
        onView: () => {
          markAdminNotifAsRead(notifId);
          setShowNotificationsModal(false);
          setBusinessTabFilter('pending_review');
          setActiveTab('businesses');
        },
        onDismiss: () => deleteAdminNotif(notifId),
      });
    });

    pendingPostReviews.forEach((post) => {
      const notifId = `post_rev_${post.id}`;
      if (dismissedAdminNotifs.includes(notifId)) return;
      const dateVal = post.reviewRequestedAt || post.correctionDate || post.createdAt || new Date().toISOString();
      items.push({
        id: notifId,
        category: 'post',
        title: `Revisión de Publicación: ${post.title}`,
        message: `El comercio "${post.businessName}" ha enviado una corrección para su publicación.`,
        timeFormatted: new Date(dateVal).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        note: post.correctionNote,
        reason: post.suspensionReason,
        read: readAdminNotifs.includes(notifId),
        onView: () => {
          markAdminNotifAsRead(notifId);
          setShowNotificationsModal(false);
          setPostTabFilter('pending_review');
          setActiveTab('posts');
        },
        onDismiss: () => deleteAdminNotif(notifId),
      });
    });

    return items;
  }, [pendingBusinessReviews, pendingPostReviews, dismissedAdminNotifs, readAdminNotifs]);

  const unreadAdminNotifsCount = adminNotificationItems.filter(
    (item) => !item.read
  ).length;

  const markAdminNotifAsRead = (id: string) => {
    setReadAdminNotifs((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('oleveci_admin_read_notifs', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const markAllAdminNotifsAsRead = () => {
    const allIds = adminNotificationItems.map((item) => item.id);
    setReadAdminNotifs((prev) => {
      const next = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem('oleveci_admin_read_notifs', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const deleteAdminNotif = (id: string) => {
    setDismissedAdminNotifs((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem('oleveci_admin_dismissed_notifs', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const clearAllAdminNotifs = () => {
    const allIds = adminNotificationItems.map((item) => item.id);
    setDismissedAdminNotifs((prev) => {
      const next = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem('oleveci_admin_dismissed_notifs', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScrollLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleTabSelect = (tabId: AdminTab) => {
    if (tabId === 'businesses') {
      setBusinessTabFilter('all');
    } else if (tabId === 'posts') {
      setPostTabFilter('all');
    }
    setActiveTab(tabId);
    setTimeout(() => {
      const el = document.getElementById(`admin-tab-${tabId}`);
      if (el) {
        el.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }
      checkScroll();
    }, 50);
  };

  const handleLogout = () => {
    logoutAdmin();
    setCurrentRole('explorer');
  };

  const navTabs = [
    {
      id: 'overview',
      label: 'Métricas',
      icon: TrendingUp,
    },
    {
      id: 'businesses',
      label: 'Negocios',
      icon: Store,
    },
    {
      id: 'posts',
      label: 'Publicaciones',
      icon: FileText,
    },
    {
      id: 'ready_plans',
      label: 'Itinerarios',
      icon: Route,
    },
    {
      id: 'municipalities',
      label: 'Municipios',
      icon: MapPin,
    },
    {
      id: 'categories',
      label: 'Categorías',
      icon: Layers,
    },
    {
      id: 'post_types',
      label: 'Tipos de Feed',
      icon: Sparkles,
    },
    {
      id: 'plan_types',
      label: 'Tipos de Planes',
      icon: Compass,
    },
    {
      id: 'superadmin',
      label: 'Admin',
      icon: UserCog,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Top Banner & Command Center Header */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#041f5e] via-[#082a7a] to-[#0a3a9c] text-white shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#007af7] flex items-center justify-center font-black shadow-md border border-white/20 shrink-0">
            <UserCog className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-bold truncate">
                Panel Central de Administración
              </h2>
              <Crown className="w-4 h-4 text-[#ff7700] shrink-0" title="Admin" />
            </div>
            <p className="text-xs text-blue-200 truncate">
              Gestión territorial, comercios & moderación
            </p>
          </div>
        </div>

        {/* Quick action buttons matching BusinessDashboard */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowNotificationsModal(true)}
            className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-white/15 cursor-pointer flex items-center justify-center"
            title="Notificaciones de administración"
            aria-label="Notificaciones de administración"
          >
            <Bell className="w-4 h-4" />
            {unreadAdminNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px] leading-none shadow-xs animate-pulse">
                {unreadAdminNotifsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            id="btn-admin-header-logout"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition border border-white/15 cursor-pointer flex items-center justify-center shadow-xs active:scale-95"
            title="Cerrar sesión de administrador"
            aria-label="Cerrar sesión de administrador"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-sections Navigation Bar */}
      <div className="space-y-2">
        {/* Mobile dropdown selector (visible on small screens for instant 1-tap full menu access) */}
        <div className="sm:hidden flex items-center justify-between gap-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Sección:
            </span>
            <div className="relative flex-1 min-w-0">
              <select
                value={activeTab}
                onChange={(e) => handleTabSelect(e.target.value as AdminTab)}
                aria-label="Seleccionar sección de administración"
                className="w-full pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#007af7] cursor-pointer appearance-none truncate"
              >
                {navTabs.map((tab) => {
                  const badgeCount =
                    tab.id === 'businesses'
                      ? pendingBusinessReviews.length
                      : tab.id === 'posts'
                      ? pendingPostReviews.length
                      : 0;
                  return (
                    <option key={tab.id} value={tab.id}>
                      {tab.label} {badgeCount > 0 ? `(${badgeCount})` : ''}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Scrollable Tab bar with left/right navigation arrow buttons */}
        <div className="relative group">
          {/* Left Arrow Scroll Button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={handleScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-[#007af7] flex items-center justify-center transition active:scale-95 cursor-pointer -ml-1 sm:-ml-2"
              title="Desplazar a la izquierda"
              aria-label="Desplazar menú a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Right Arrow Scroll Button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={handleScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-[#007af7] flex items-center justify-center transition active:scale-95 cursor-pointer -mr-1 sm:-mr-2"
              title="Desplazar a la derecha"
              aria-label="Desplazar menú a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div
            ref={tabsContainerRef}
            onScroll={checkScroll}
            className="flex items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar scroll-smooth"
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              const badgeCount =
                tab.id === 'businesses'
                  ? pendingBusinessReviews.length
                  : tab.id === 'posts'
                  ? pendingPostReviews.length
                  : 0;

              return (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  type="button"
                  onClick={() => handleTabSelect(tab.id as AdminTab)}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#007af7] text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black leading-none ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-150">
        {activeTab === 'overview' && (
          <AdminOverviewTab
            onNavigateTab={(tab) => {
              if (tab === 'businesses') setBusinessTabFilter('all');
              if (tab === 'posts') setPostTabFilter('all');
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'businesses' && (
          <AdminBusinessesTab initialFilterStatus={businessTabFilter} />
        )}

        {activeTab === 'posts' && (
          <AdminPostsTab initialFilterStatus={postTabFilter} />
        )}

        {activeTab === 'ready_plans' && <AdminReadyPlansTab />}

        {activeTab === 'municipalities' && <AdminMunicipalitiesTab />}

        {activeTab === 'categories' && <AdminCategoriesTab />}

        {activeTab === 'post_types' && <AdminPostTypesTab />}

        {activeTab === 'plan_types' && <AdminPlanCategoriesTab />}

        {activeTab === 'superadmin' && <AdminProfileTab />}
      </div>

      {/* Admin Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="Notificaciones y Avisos"
        subtitle="Mensajes de moderación y solicitudes de revisión"
        items={adminNotificationItems}
        onMarkAllAsRead={markAllAdminNotifsAsRead}
        onClearAll={clearAllAdminNotifs}
      />
    </div>
  );
};
