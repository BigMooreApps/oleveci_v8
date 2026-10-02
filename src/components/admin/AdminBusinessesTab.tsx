import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Business } from '../../types';
import { AdminBusinessModal } from './AdminBusinessModal';
import { AdminCredentialsModal } from './AdminCredentialsModal';
import { AdminRenewalReminderModal } from './AdminRenewalReminderModal';
import { getBusinessSuspensionGuide, getBusinessSuspensionStats } from '../../utils/businessSuspensionGuide';
import {
  isSubscriptionActive,
  getSubscriptionDaysExpired,
  getSubscriptionDaysRemaining,
  formatDaysSinRenovarLabel,
} from '../../utils/subscriptionHelper';
import { SuspensionTimeline } from '../common/SuspensionTimeline';
import {
  Store,
  Search,
  Plus,
  Edit2,
  Key,
  ShieldCheck,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Filter,
  MessageCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  Ban,
  RotateCcw,
  X,
  XCircle,
  History,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

const PRESET_BUSINESS_SUSPENSION_REASONS = [
  'Incumplimiento de términos y políticas del servicio',
  'Información comercial o datos de contacto falsos / engañosos',
  'Publicación reiterada de contenido no permitido o engañoso',
  'Múltiples reportes o reclamaciones de usuarios',
  'Actividad comercial no verificable o sospechosa',
  'Otro motivo personalizado',
];

interface AdminBusinessesTabProps {
  initialFilterStatus?: 'all' | 'active' | 'expired' | 'suspended' | 'pending_review' | 'with_history';
}

export const AdminBusinessesTab: React.FC<AdminBusinessesTabProps> = ({
  initialFilterStatus = 'all',
}) => {
  const {
    businesses,
    categories,
    municipalities,
    sectors,
    updateBusiness,
    suspendBusiness,
    reactivateBusiness,
    approveBusinessReview,
    rejectBusinessReview,
    deleteBusiness,
    addBusiness,
    createBusinessDirect,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'expired' | 'suspended' | 'pending_review' | 'with_history'
  >(initialFilterStatus);

  useEffect(() => {
    if (initialFilterStatus) {
      setFilterStatus(initialFilterStatus);
    }
  }, [initialFilterStatus]);

  const toTitleCase = (text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/(^[a-záéíóúüñ]|[\s/–—(-][a-záéíóúüñ])/gi, (match) => match.toUpperCase());
  };

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filterStatus !== 'all' ||
    filterCity !== 'all' ||
    filterCategory !== 'all';

  const activeFiltersCount =
    (searchQuery.trim() !== '' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (filterCity !== 'all' ? 1 : 0) +
    (filterCategory !== 'all' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterCity('all');
    setFilterCategory('all');
  };

  // Modals state
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState<Business | null>(null);

  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [businessForCredentials, setBusinessForCredentials] = useState<Business | null>(null);

  const [reminderBusiness, setReminderBusiness] = useState<Business | null>(null);

  // Business Suspension Modal State
  const [suspensionTargetBusiness, setSuspensionTargetBusiness] = useState<Business | null>(null);
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>(PRESET_BUSINESS_SUSPENSION_REASONS[0]);
  const [customReasonDetails, setCustomReasonDetails] = useState<string>('');
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  const openSuspensionModal = (biz: Business) => {
    setSuspensionTargetBusiness(biz);
    setRejectionReasonText('');
    if (biz.suspensionReason) {
      setCustomReasonDetails(biz.suspensionReason);
      setSelectedPresetReason('Otro motivo personalizado');
    } else {
      setSelectedPresetReason(PRESET_BUSINESS_SUSPENSION_REASONS[0]);
      setCustomReasonDetails('');
    }
  };

  const handleConfirmSuspension = () => {
    if (!suspensionTargetBusiness) return;

    let finalReason = selectedPresetReason;
    if (selectedPresetReason === 'Otro motivo personalizado' || customReasonDetails.trim()) {
      finalReason = customReasonDetails.trim()
        ? `${selectedPresetReason !== 'Otro motivo personalizado' ? `${selectedPresetReason}: ` : ''}${customReasonDetails.trim()}`
        : selectedPresetReason;
    }

    suspendBusiness(suspensionTargetBusiness.id, finalReason, selectedPresetReason);
    setSuspensionTargetBusiness(null);
  };

  const handleReactivateBusiness = (biz: Business) => {
    reactivateBusiness(biz.id);
    setSuspensionTargetBusiness(null);
  };

  const handleApproveBusinessReview = (biz: Business) => {
    approveBusinessReview(biz.id);
    setSuspensionTargetBusiness(null);
  };

  const handleRejectBusinessReview = (biz: Business) => {
    const reason =
      rejectionReasonText.trim() ||
      'Las correcciones presentadas aún no cumplen con los términos y políticas requeridos.';
    rejectBusinessReview(biz.id, reason);
    setSuspensionTargetBusiness(null);
  };

  // Expiration calculator helper using unified subscription helper
  const getDaysExpired = (biz: Business): number => {
    return getSubscriptionDaysExpired(biz.subscription);
  };

  // Subscription & Milestones statistics
  const stats = useMemo(() => {
    let active = 0;
    let expired = 0;
    let suspended = 0;
    let expired7Days = 0;
    let expired15Days = 0;

    businesses.forEach((b) => {
      const isSuspended = b.status === 'suspended';
      const isSubActive = isSubscriptionActive(b.subscription);
      if (isSuspended) {
        suspended++;
      } else if (isSubActive) {
        active++;
      } else {
        expired++;
        const days = getSubscriptionDaysExpired(b.subscription);
        if (days >= 7 && days < 15) {
          expired7Days++;
        } else if (days >= 15) {
          expired15Days++;
        }
      }
    });

    return {
      active,
      expired,
      suspended,
      expired7Days,
      expired15Days,
      total: businesses.length,
    };
  }, [businesses]);

  // Filtered businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchSearch =
        searchQuery === '' ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.accessEmail && b.accessEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.ownerName && b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCity = filterCity === 'all' || b.city.toLowerCase() === filterCity.toLowerCase();
      const matchCat = filterCategory === 'all' || b.categoryId === filterCategory;

      const isSuspended = b.status === 'suspended' || b.status === 'pending_review';
      const isSubActive = isSubscriptionActive(b.subscription);
      const isExpired = !isSubActive;

      let matchStatus = true;
      if (filterStatus === 'active') {
        matchStatus = !isSuspended && isSubActive;
      } else if (filterStatus === 'expired') {
        matchStatus = !isSuspended && isExpired;
      } else if (filterStatus === 'suspended') {
        matchStatus = b.status === 'suspended';
      } else if (filterStatus === 'pending_review') {
        matchStatus = b.status === 'pending_review';
      } else if (filterStatus === 'with_history') {
        const s = getBusinessSuspensionStats(b);
        matchStatus = s.totalSuspensions > 0 || b.status === 'suspended' || b.status === 'pending_review';
      }

      return matchSearch && matchCity && matchCat && matchStatus;
    });
  }, [businesses, searchQuery, filterCity, filterCategory, filterStatus]);

  const handleOpenCreate = () => {
    setBusinessToEdit(null);
    setIsBusinessModalOpen(true);
  };

  const handleOpenEdit = (biz: Business) => {
    setBusinessToEdit(biz);
    setIsBusinessModalOpen(true);
  };

  const handleOpenCredentials = (biz: Business) => {
    setBusinessForCredentials(biz);
    setIsCredentialsModalOpen(true);
  };

  const handleSaveBusiness = (data: Partial<Business> & { id?: string }) => {
    if (data.id) {
      updateBusiness(data.id, data);
      setBusinessToEdit((prev) => (prev && prev.id === data.id ? { ...prev, ...data } : prev));
    } else {
      createBusinessDirect({
        name: data.name || 'Nuevo Negocio',
        categoryId: data.categoryId || 'cat_restaurantes',
        subCategory: data.subCategory || 'Comercio Local',
        city: data.city || 'Cajicá',
        sector: data.sector || 'Centro',
        address: data.address || 'Calle Principal',
        phone: data.phone || '3100000000',
        whatsapp: data.whatsapp || '573100000000',
        hours: data.hours || 'Lunes a Sábado: 8:00 AM - 8:00 PM',
        description: data.description || '',
        logo:
          data.logo ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        coverImage:
          data.coverImage ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
        verified: data.verified ?? true,
        featured: data.featured ?? false,
        accessEmail: data.accessEmail || 'admin@oleveci.com',
        accessPassword: data.accessPassword || 'Veci2026!',
        accessPin: data.accessPin || '1234',
        ownerName: data.ownerName || '',
        ownerPhone: data.ownerPhone || '',
        coordinates: data.coordinates || { lat: 4.9184, lng: -74.0259 },
        photos: [],
        rating: 5,
        status: 'active',
        slug: (data.name || 'nuevo-negocio').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        subscription: data.subscription || {
          status: 'active',
          planName: 'Plan Mensual OleVeci',
          priceCOP: 29900,
          billingCycle: 'monthly',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: true,
        },
        billingInfo: data.billingInfo,
        paymentHistory: data.paymentHistory || [],
      });
    }
  };

  const handleSaveCredentials = (
    businessId: string,
    credentials: {
      accessEmail?: string;
      accessPassword?: string;
      accessPin?: string;
      ownerName?: string;
      ownerPhone?: string;
    }
  ) => {
    updateBusiness(businessId, credentials);
  };

  const handleDeleteBusiness = (biz: Business) => {
    if (
      window.confirm(
        `¿Eliminar el comercio "${biz.name}"? Esta acción eliminará también en cascada todas sus publicaciones activas en la app.`
      )
    ) {
      deleteBusiness(biz.id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Search & Filter Header Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-[#007af7]" />
              <span>Gestión de Negocios y Usuarios</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administra claves de acceso y estados de facturación
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              id="btn-admin-create-business"
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 rounded-xl bg-[#007af7] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Negocio</span>
            </button>

            {/* Botón de Filtros igual al de Explorar */}
            <button
              id="btn-admin-biz-filter-toggle"
              type="button"
              onClick={() => setIsFiltersOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                isFiltersOpen || activeFiltersCount > 0
                  ? 'bg-[#007af7] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90'
              }`}
              title={isFiltersOpen ? 'Ocultar opciones de filtros' : 'Abrir opciones de filtros'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#007af7] text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                title="Restablecer filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Panel de Opciones de Filtros (activadas con el botón) */}
        {isFiltersOpen && (
          <div className="space-y-3.5 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Comercio, usuario, correo..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Borrar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Estado</span>
                  {businesses.filter((b) => b.status === 'pending_review').length > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200">
                      {businesses.filter((b) => b.status === 'pending_review').length} en revisión
                    </span>
                  )}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activas</option>
                  <option value="expired">Vencidas</option>
                  <option value="suspended">Suspendidas</option>
                  <option value="pending_review">
                    En Revisión ({businesses.filter((b) => b.status === 'pending_review').length})
                  </option>
                  <option value="with_history">
                    Con Historial / Antecedentes ({businesses.filter((b) => getBusinessSuspensionStats(b).totalSuspensions > 0 || b.status === 'suspended').length})
                  </option>
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Municipio
                </label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Todos los Municipios</option>
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Categoría
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-normal">
              Mostrando <span className="text-blue-600 font-normal">{filteredBusinesses.length}</span> de{' '}
              <span className="text-slate-800 font-normal">{businesses.length}</span> comercios
            </span>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-normal">
                  <span>Búsqueda: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-normal">
                  <span>
                    Estado:{' '}
                    {toTitleCase(
                      filterStatus === 'active'
                        ? 'Activas'
                        : filterStatus === 'expired'
                        ? 'Vencidas'
                        : filterStatus === 'suspended'
                        ? 'Suspendidas'
                        : filterStatus === 'pending_review'
                        ? 'En Revisión'
                        : 'Con Historial'
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterCity !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-normal">
                  <span>Municipio: {toTitleCase(filterCity)}</span>
                  <button
                    type="button"
                    onClick={() => setFilterCity('all')}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-normal">
                  <span>Categoría: {toTitleCase(categories.find((c) => c.id === filterCategory)?.name || filterCategory)}</span>
                  <button
                    type="button"
                    onClick={() => setFilterCategory('all')}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Business Cards List */}
      <div className="space-y-3">
        {filteredBusinesses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <Store className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">No se encontraron comercios con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredBusinesses.map((biz) => {
            const isSub = isSubscriptionActive(biz.subscription);
            const isSuspended = biz.status === 'suspended';
            const isPendingReview = biz.status === 'pending_review';
            const categoryObj = categories.find((c) => c.id === biz.categoryId);
            const days = getSubscriptionDaysExpired(biz.subscription);

            return (
              <div
                key={biz.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenEdit(biz)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenEdit(biz);
                  }
                }}
                className={`p-4 rounded-2xl border shadow-2xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer group ${
                  isPendingReview
                    ? 'bg-amber-50/70 border-2 border-amber-400 ring-1 ring-amber-300 hover:bg-amber-50'
                    : isSuspended
                    ? 'bg-red-50/60 border-red-300 hover:border-red-400 hover:bg-red-50/80'
                    : 'bg-white border-slate-200/90 hover:border-[#007af7]/60 hover:bg-slate-50/50 hover:shadow-xs'
                }`}
                title="Haz clic para ver y editar la ficha del negocio"
              >
                {/* Left: Info & Logo */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {biz.logo ? (
                    <img
                      src={biz.logo}
                      alt={biz.name}
                      referrerPolicy="no-referrer"
                      className={`w-14 h-14 rounded-2xl object-cover border shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${
                        isPendingReview
                          ? 'border-amber-400'
                          : isSuspended
                          ? 'border-red-300'
                          : 'border-slate-200'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-2xl font-normal flex items-center justify-center text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${
                        isSuspended
                          ? 'bg-rose-900 text-white'
                          : isPendingReview
                          ? 'bg-amber-800 text-white'
                          : 'bg-[#041f5e] text-white'
                      }`}
                    >
                      {biz.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold transition-colors truncate ${
                          isSuspended
                            ? 'text-rose-950 group-hover:text-red-700'
                            : 'text-slate-900 group-hover:text-[#007af7]'
                        }`}
                      >
                        {toTitleCase(biz.name)}
                      </h4>

                      {/* Status Badges with Dynamic Expiration Day Count */}
                      {biz.status === 'pending_review' ? (
                        <span className="text-[10px] font-normal text-amber-950 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3 h-3 text-amber-800 animate-pulse" />
                          <span>{toTitleCase('En revisión por administrador')}</span>
                        </span>
                      ) : biz.status === 'suspended' ? (
                        <span className="text-[10px] font-normal text-white bg-red-600 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-2xs">
                          <Ban className="w-3 h-3 text-white" />
                          <span>{toTitleCase('Suspendido por políticas')}</span>
                        </span>
                      ) : isSub ? (
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {toTitleCase('Suscripción activa')}
                        </span>
                      ) : days <= 7 ? (
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 border border-orange-300 flex items-center gap-1 shadow-2xs">
                          <Clock className="w-3 h-3 text-orange-600" />
                          <span>{days} {toTitleCase(days === 1 ? 'día sin renovar' : 'días sin renovar')}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{days} {toTitleCase('días sin renovar')}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-normal text-slate-700">
                        {toTitleCase(categoryObj?.name || biz.subCategory)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-normal text-slate-500">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{toTitleCase(biz.sector)}, {toTitleCase(biz.city)}</span>
                      </span>
                    </div>

                    {/* Suspension Box - Exactly matching post suspension box */}
                    {isSuspended && (
                      <div className="mt-1.5 p-2 rounded-lg bg-red-100/80 border border-red-200 text-xs text-red-900 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-normal">Motivo de suspensión:</span>{' '}
                          <span className="text-red-800 font-normal">{biz.suspensionReason || 'Incumplimiento de políticas y normas de la plataforma.'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Operational Actions Bar */}
                <div
                  className={`w-full lg:w-auto flex flex-wrap items-center justify-between lg:justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 mt-1 lg:mt-0 ${
                    isSuspended
                      ? 'border-red-200/60'
                      : isPendingReview
                      ? 'border-amber-200/60'
                      : 'border-slate-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 ml-auto lg:ml-0 flex-wrap">
                    {/* Renewal Reminder / WhatsApp / Alert */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReminderBusiness(biz);
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer shrink-0"
                      title={
                        !isSub
                          ? `Alerta de vencimiento (${days} ${days === 1 ? 'día' : 'días'} sin renovar) - Recordatorio WhatsApp`
                          : 'Contactar comercio / Enviar recordatorio WhatsApp'
                      }
                    >
                      {!isSub ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>

                    {/* Toggle Verified */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateBusiness(biz.id, { verified: !biz.verified });
                      }}
                      className={`p-2 rounded-xl border transition cursor-pointer shadow-2xs active:scale-95 shrink-0 ${
                        biz.verified
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-400 hover:bg-emerald-100 hover:border-emerald-500'
                          : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/60'
                      }`}
                      title={biz.verified ? 'Negocio Verificado (Clic para revocar)' : 'Marcar como Verificado'}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>

                    {/* Suspend / Reactivate Action (Placed immediately before Delete) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSuspensionModal(biz);
                      }}
                      className={`p-2 rounded-xl border transition cursor-pointer shadow-2xs shrink-0 ${
                        biz.status === 'pending_review'
                          ? 'bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200'
                          : biz.status === 'suspended'
                          ? 'border-red-300 bg-red-100 text-red-700 hover:bg-red-200 ring-1 ring-red-400'
                          : 'border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                      }`}
                      title={
                        biz.status === 'pending_review'
                          ? 'Revisar correcciones del comercio y reactivar'
                          : biz.status === 'suspended'
                          ? 'Gestionar suspensión / Reactivar comercio'
                          : 'Suspender comercio por políticas'
                      }
                    >
                      {biz.status === 'pending_review' ? (
                        <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete Business */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBusiness(biz);
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition cursor-pointer shadow-2xs shrink-0"
                      title="Eliminar comercio y publicaciones asociadas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Business Profile Modal */}
      <AdminBusinessModal
        isOpen={isBusinessModalOpen}
        businessToEdit={businessToEdit}
        onClose={() => setIsBusinessModalOpen(false)}
        onSave={handleSaveBusiness}
      />

      {/* Credentials Modal */}
      {isCredentialsModalOpen && businessForCredentials && (
        <AdminCredentialsModal
          isOpen={isCredentialsModalOpen}
          business={businessForCredentials}
          onClose={() => setIsCredentialsModalOpen(false)}
          onSave={handleSaveCredentials}
        />
      )}

      {/* Renewal Reminder Modal with Monthly Metrics (WhatsApp / Push) */}
      {reminderBusiness && (
        <AdminRenewalReminderModal
          isOpen={!!reminderBusiness}
          business={reminderBusiness}
          onClose={() => setReminderBusiness(null)}
        />
      )}

      {/* Business Suspension Modal */}
      {suspensionTargetBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    suspensionTargetBusiness.status === 'pending_review'
                      ? 'bg-amber-100 text-amber-700'
                      : suspensionTargetBusiness.status === 'suspended'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {suspensionTargetBusiness.status === 'pending_review' ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Ban className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                    {suspensionTargetBusiness.status === 'pending_review'
                      ? 'Evaluar Revisión de Suspensión'
                      : suspensionTargetBusiness.status === 'suspended'
                      ? 'Gestionar Suspensión del Comercio'
                      : 'Suspender Comercio por Políticas'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                    {suspensionTargetBusiness.status === 'pending_review'
                      ? 'El comercio ha presentado correcciones para reactivar su cuenta'
                      : 'Moderación administrativa y cumplimiento de normas'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuspensionTargetBusiness(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Business Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                {suspensionTargetBusiness.logo ? (
                  <img
                    src={suspensionTargetBusiness.logo}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#041f5e] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {suspensionTargetBusiness.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {suspensionTargetBusiness.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {suspensionTargetBusiness.sector}, {suspensionTargetBusiness.city}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        suspensionTargetBusiness.status === 'pending_review'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : suspensionTargetBusiness.status === 'suspended'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {suspensionTargetBusiness.status === 'pending_review'
                        ? 'En cola de revisión'
                        : suspensionTargetBusiness.status === 'suspended'
                        ? 'Suspendido actualmente'
                        : 'Comercio Activo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Histórico Cronológico de Moderación */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <SuspensionTimeline
                  business={suspensionTargetBusiness}
                  collapsible={true}
                  defaultExpanded={true}
                />
              </div>

              {/* Review specific section if pending_review */}
              {suspensionTargetBusiness.status === 'pending_review' ? (
                <div className="space-y-4">
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Observación para el comercio (en caso de rechazar):
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReasonText}
                      onChange={(e) => setRejectionReasonText(e.target.value)}
                      placeholder="Explica qué correcciones aún hacen falta..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-red-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Reason Selector */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Motivo principal de suspensión:
                      </label>
                      <select
                        value={selectedPresetReason}
                        onChange={(e) => setSelectedPresetReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-red-500 focus:outline-hidden cursor-pointer"
                      >
                        {PRESET_BUSINESS_SUSPENSION_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Guía contextual vinculada al motivo que recibirá el comercio */}
                    {(() => {
                      const guide = getBusinessSuspensionGuide(selectedPresetReason);
                      return (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>Guía de solución que recibirá el comercio:</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${guide.badgeColor}`}>
                              {guide.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {guide.explanationIntro}
                          </p>
                          <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                            {guide.steps.map((step) => (
                              <div key={step.number} className="flex items-start gap-2 text-[11px]">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">
                                  {step.number}
                                </span>
                                <span className="text-slate-700">
                                  <strong className="text-slate-900">{step.title}:</strong> {step.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Detalles específicos o instrucciones para el comercio:
                      </label>
                      <textarea
                        rows={3}
                        value={customReasonDetails}
                        onChange={(e) => setCustomReasonDetails(e.target.value)}
                        placeholder="Describe el motivo específico o las medidas que debe tomar el comercio para regularizar su situación..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-red-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              {suspensionTargetBusiness.status === 'pending_review' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleRejectBusinessReview(suspensionTargetBusiness)}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Rechazar Solicitud</span>
                  </button>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSuspensionTargetBusiness(null)}
                      className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveBusinessReview(suspensionTargetBusiness)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Aprobar y Reactivar</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {suspensionTargetBusiness.status === 'suspended' ? (
                    <button
                      type="button"
                      onClick={() => handleReactivateBusiness(suspensionTargetBusiness)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Reactivar Comercio</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSuspensionTargetBusiness(null)}
                      className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSuspension}
                      className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer text-center"
                    >
                      <Ban className="w-4 h-4 shrink-0" />
                      <span>
                        {suspensionTargetBusiness.status === 'suspended'
                          ? 'Actualizar Motivo'
                          : 'Suspender Comercio'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
