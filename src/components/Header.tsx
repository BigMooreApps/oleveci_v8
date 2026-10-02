import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import { OleVeciLogo } from './OleVeciLogo';
import {
  Bell,
  Store,
  UserCog,
  Compass,
  BookOpen,
  Home,
  ChevronDown,
  Check,
  Sparkles,
  Route,
  Menu,
  X,
  MapPin,
} from 'lucide-react';

interface HeaderProps {
  onOpenLocationPicker: () => void;
  onOpenNotifications: () => void;
  onOpenBusinessAuth?: (tab?: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLocationPicker,
  onOpenNotifications,
  onOpenBusinessAuth,
}) => {
  const {
    currentRole,
    setCurrentRole,
    notificationPrefs,
    authenticatedBusinessId,
    isAdminAuthenticated,
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const roleConfig = {
    home: {
      label: 'Home',
      icon: Home,
      iconColor: 'text-[#007af7]',
    },
    explorer: {
      label: 'Descubrir',
      icon: Compass,
      iconColor: 'text-[#007af7]',
    },
    plans: {
      label: 'Itinerarios',
      icon: Route,
      iconColor: 'text-[#007af7]',
    },
    directory: {
      label: 'Directorio',
      icon: BookOpen,
      iconColor: 'text-[#007af7]',
    },
    maps: {
      label: 'Vecis en Maps',
      icon: MapPin,
      iconColor: 'text-[#007af7]',
    },
    business: {
      label: 'Mi Espacio',
      icon: Store,
      iconColor: 'text-[#ff7700]',
    },
    admin: {
      label: 'Admin',
      icon: UserCog,
      iconColor: 'text-indigo-600',
    },
  };

  const activeItem = roleConfig[currentRole] || roleConfig.home;
  const ActiveIcon = activeItem.icon;

  return (
    <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-shadow duration-200 shadow-2xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top brand row with Logo and Profile/Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Authentic OleVeci Brand Logo (always visible on top left) */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                setCurrentRole('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center text-left focus:outline-hidden group cursor-pointer"
              title="OleVeci - Ir a Home"
              aria-label="OleVeci Inicio"
            >
              <OleVeciLogo
                size="md"
                showSlogan={false}
                showCom={false}
                className="select-none transition-transform group-hover:scale-[1.02] active:scale-95"
              />
            </button>
          </div>

          {/* Right actions: Notifications, PWA Install & Role Switcher Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PWA Install Button */}
            <PWAInstallButton compact />

            {/* Push Notifications trigger */}
            <button
              id="btn-header-notifications"
              onClick={onOpenNotifications}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200/90 text-slate-700 hover:text-[#007af7] hover:border-blue-300 hover:bg-blue-50/60 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer active:scale-95 group shrink-0"
              title="Configurar Notificaciones Push"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4 text-slate-600 group-hover:text-[#007af7] transition-all duration-200 group-hover:scale-110" />
              {notificationPrefs.enabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00d8a5] ring-2 ring-white shadow-2xs animate-pulse" />
              )}
            </button>

            {/* Role Switcher in Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                id="btn-nav-dropdown"
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`w-9 h-9 sm:w-auto sm:h-auto flex items-center justify-center sm:justify-start sm:gap-2 px-0 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-2xs select-none shrink-0 group ${
                  isMenuOpen
                    ? 'border-[#007af7] bg-blue-50/90 text-[#0056d6] shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200/90 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                }`}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
                title={isMenuOpen ? 'Cerrar menú' : 'Menú de navegación'}
              >
                {/* En móvil: Solo icono hamburguesa / cerrar (sin texto) */}
                <span className="sm:hidden flex items-center justify-center">
                  {isMenuOpen ? (
                    <X className="w-5 h-5 text-[#007af7] transition-transform duration-200 animate-in spin-in-90" />
                  ) : (
                    <Menu className="w-4.5 h-4.5 text-[#0056d6]" strokeWidth={2.4} />
                  )}
                </span>

                {/* En pantallas de escritorio / tablet: Icono del rol activo + etiqueta + chevron */}
                <ActiveIcon className={`hidden sm:inline-block w-4 h-4 shrink-0 ${activeItem.iconColor}`} />
                <span className="hidden sm:inline font-bold tracking-tight">{activeItem.label}</span>
                <ChevronDown
                  className={`hidden sm:inline w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180 text-[#007af7]' : ''
                  }`}
                />
              </button>

              {/* Popover del Menú Desplegable */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 sm:hidden"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div
                    id="nav-dropdown-menu"
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-60 sm:w-64 max-h-[calc(100vh-4.5rem)] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Navegación
                    </div>

                    {/* Opción 1: Home */}
                    <button
                      id="tab-role-home"
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setCurrentRole('home');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                        currentRole === 'home'
                          ? 'bg-blue-50/80 text-[#0056d6] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            currentRole === 'home'
                              ? 'bg-[#007af7] text-white shadow-2xs'
                              : 'bg-blue-50 text-[#007af7] group-hover:bg-blue-100'
                          }`}
                        >
                          <Home className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900">
                            Home
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            Página principal
                          </div>
                        </div>
                      </div>
                      {currentRole === 'home' && (
                        <Check className="w-4 h-4 text-[#007af7] shrink-0 ml-2" />
                      )}
                    </button>

                    {/* Opción 2: Descubrir */}
                    <button
                      id="tab-role-explorer"
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setCurrentRole('explorer');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                        currentRole === 'explorer'
                          ? 'bg-blue-50/80 text-[#0056d6] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            currentRole === 'explorer'
                              ? 'bg-[#007af7] text-white shadow-2xs'
                              : 'bg-blue-50 text-[#007af7] group-hover:bg-blue-100'
                          }`}
                        >
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900">
                            Descubrir
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            Explorar publicaciones
                          </div>
                        </div>
                      </div>
                      {currentRole === 'explorer' && (
                        <Check className="w-4 h-4 text-[#007af7] shrink-0 ml-2" />
                      )}
                    </button>

                    {/* Opción: Itinerarios Listos */}
                    <button
                      id="tab-role-plans"
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setCurrentRole('plans');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                        currentRole === 'plans'
                          ? 'bg-blue-50/80 text-[#0056d6] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            currentRole === 'plans'
                              ? 'bg-[#007af7] text-white shadow-2xs'
                              : 'bg-blue-50 text-[#007af7] group-hover:bg-blue-100'
                          }`}
                        >
                          <Route className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900">
                            Itinerarios
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            Itinerarios armados
                          </div>
                        </div>
                      </div>
                      {currentRole === 'plans' && (
                        <Check className="w-4 h-4 text-[#007af7] shrink-0 ml-2" />
                      )}
                    </button>

                    {/* Opción 3: Directorio */}
                    <button
                      id="tab-role-directory"
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setCurrentRole('directory');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                        currentRole === 'directory'
                          ? 'bg-blue-50/80 text-[#0056d6] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            currentRole === 'directory'
                              ? 'bg-[#007af7] text-white shadow-2xs'
                              : 'bg-blue-50 text-[#007af7] group-hover:bg-blue-100'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900">
                            Directorio
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            Comercios y servicios locales
                          </div>
                        </div>
                      </div>
                      {currentRole === 'directory' && (
                        <Check className="w-4 h-4 text-[#007af7] shrink-0 ml-2" />
                      )}
                    </button>

                    {/* Opción: Vecis en Maps */}
                    <button
                      id="tab-role-maps"
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        setCurrentRole('maps');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                        currentRole === 'maps'
                          ? 'bg-blue-50/80 text-[#0056d6] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            currentRole === 'maps'
                              ? 'bg-[#007af7] text-white shadow-2xs'
                              : 'bg-blue-50 text-[#007af7] group-hover:bg-blue-100'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900">
                            Vecis en Maps
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            Todos los negocios en el mapa
                          </div>
                        </div>
                      </div>
                      {currentRole === 'maps' && (
                        <Check className="w-4 h-4 text-[#007af7] shrink-0 ml-2" />
                      )}
                    </button>

                    {/* Opción 4: Mi Espacio */}
                    <button
                      id="tab-role-business"
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        if (onOpenBusinessAuth && !authenticatedBusinessId) {
                          onOpenBusinessAuth('login');
                        } else {
                          setCurrentRole('business');
                        }
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                        currentRole === 'business'
                          ? 'bg-orange-50/80 text-orange-800 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            currentRole === 'business'
                              ? 'bg-[#ff7700] text-white shadow-2xs'
                              : 'bg-orange-50 text-[#ff7700] group-hover:bg-orange-100'
                          }`}
                        >
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-semibold text-slate-900">
                            Mi Espacio
                          </div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {authenticatedBusinessId ? 'Gestionar negocio' : 'Acceso comercial'}
                          </div>
                        </div>
                      </div>
                      {currentRole === 'business' && (
                        <Check className="w-4 h-4 text-[#ff7700] shrink-0 ml-2" />
                      )}
                    </button>

                    {/* Opción 5: Admin (si está autenticado como admin) */}
                    {isAdminAuthenticated && (
                      <>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          id="tab-role-admin"
                          role="menuitem"
                          type="button"
                          onClick={() => {
                            setCurrentRole('admin');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                            currentRole === 'admin'
                              ? 'bg-indigo-50 text-indigo-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                currentRole === 'admin'
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                              }`}
                            >
                              <UserCog className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs sm:text-sm font-semibold text-slate-900">
                                Panel Admin
                              </div>
                              <div className="text-[10px] text-slate-500 font-normal">
                                Configuración y control
                              </div>
                            </div>
                          </div>
                          {currentRole === 'admin' && (
                            <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
