import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Post } from '../../types';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  MessageCircle,
  Tag,
  Navigation,
  Phone,
  Share2,
  Ban,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Info,
  RotateCcw,
  Clock,
  Calendar,
  CalendarDays,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Plus,
} from 'lucide-react';
import { PostDetailModal } from '../PostDetailModal';
import { CreatePostModal } from '../CreatePostModal';
import { SuspensionTimeline } from '../common/SuspensionTimeline';
import { PostDatesBar } from '../common/PostDatesBar';
import { getPostTypeLabel, getPostTypeBadgeStyle } from '../../utils/postTypeIcons';

const PRESET_POLICY_REASONS = [
  'Precio o promoción engañosa o no comprobable',
  'Contenido ofensivo, inapropiado o no apto',
  'Imágenes de mala calidad, no aptas o con derechos',
  'Información de contacto o ubicación errónea / falsa',
  'Incumplimiento de políticas y términos comerciales',
  'Publicación duplicada o spam',
  'Otro motivo personalizado',
];

export type PostUnifiedFilterStatus =
  | 'all'
  | 'active'
  | 'scheduled'
  | 'expired'
  | 'permanent'
  | 'suspended'
  | 'pending_review';

interface AdminPostsTabProps {
  initialFilterStatus?: PostUnifiedFilterStatus;
}

export const AdminPostsTab: React.FC<AdminPostsTabProps> = ({
  initialFilterStatus = 'all',
}) => {
  const {
    posts,
    businesses,
    postTypes,
    deletePost,
    suspendPost,
    reactivatePost,
    approvePostReview,
    rejectPostReview,
    isPostActive,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState<PostUnifiedFilterStatus>(initialFilterStatus);
  const [dateFilterField, setDateFilterField] = useState<'createdAt' | 'startsAt' | 'expiresAt'>('createdAt');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<
    'newest_created' | 'oldest_created' | 'starts_soon' | 'expires_soon' | 'most_viewed'
  >('newest_created');
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (initialFilterStatus) {
      setFilterStatus(initialFilterStatus);
    }
  }, [initialFilterStatus]);

  // Helper to format dates strictly as "dd/mm/aaaa hh:mm"
  const formatCompactDate = (dateStr?: string) => {
    if (!dateStr) return 'No especificada';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Fecha inválida';
      const pad = (n: number) => n.toString().padStart(2, '0');
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };
  const formatDateTime = formatCompactDate;

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
    filterType !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    sortBy !== 'newest_created';

  const activeFiltersCount =
    (searchQuery.trim() !== '' ? 1 : 0) +
    (filterType !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (dateFrom !== '' || dateTo !== '' ? 1 : 0) +
    (sortBy !== 'newest_created' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterType('all');
    setDateFilterField('createdAt');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest_created');
  };

  // Suspension & Review Modal State
  const [suspensionTargetPost, setSuspensionTargetPost] = useState<Post | null>(null);
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>(PRESET_POLICY_REASONS[0]);
  const [customReasonDetails, setCustomReasonDetails] = useState<string>('');
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  const pendingReviewsCount = useMemo(() => {
    return posts.filter(
      (p) => p.status === 'pending_review' || p.reviewStatus === 'pending'
    ).length;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const now = Date.now();

    const result = posts.filter((p) => {
      // 1. Search Query (matches title, description, businessName, or tags)
      const matchSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      // 2. Type
      const matchType = filterType === 'all' || p.type === filterType;

      // 3. Unified Status (moderation & validity combined)
      const isPendingReview = p.status === 'pending_review' || p.reviewStatus === 'pending';
      const isSuspended = (p.status === 'suspended' || Boolean(p.suspended)) && !isPendingReview;
      const active = isPostActive(p);

      const startsTime = p.startsAt ? new Date(p.startsAt).getTime() : 0;
      const expiresTime = p.expiresAt ? new Date(p.expiresAt).getTime() : null;
      const isScheduled = startsTime > now;
      const isExpiredTime = expiresTime !== null && expiresTime <= now;
      const isPermanent = !p.expiresAt;

      let matchStatus = true;
      if (filterStatus === 'active') {
        // Activas y vigentes en feed (no suspendidas, no en revisión)
        matchStatus = active && !isSuspended && !isPendingReview;
      } else if (filterStatus === 'scheduled') {
        // Programadas a futuro
        matchStatus = isScheduled && !isSuspended && !isPendingReview;
      } else if (filterStatus === 'expired') {
        // Vencidas (sin estar suspendidas)
        matchStatus = (isExpiredTime || !active) && !isSuspended && !isPendingReview;
      } else if (filterStatus === 'permanent') {
        // Permanentes sin fecha límite y vigentes
        matchStatus = isPermanent && active && !isSuspended && !isPendingReview;
      } else if (filterStatus === 'suspended') {
        // Suspendidas por moderación
        matchStatus = isSuspended;
      } else if (filterStatus === 'pending_review') {
        // En revisión de contenido
        matchStatus = isPendingReview;
      }

      // 4. Date Range Filter
      let matchDateRange = true;
      let targetDateMs: number | null = null;
      if (dateFilterField === 'createdAt') {
        targetDateMs = p.createdAt ? new Date(p.createdAt).getTime() : startsTime;
      } else if (dateFilterField === 'startsAt') {
        targetDateMs = startsTime;
      } else if (dateFilterField === 'expiresAt') {
        targetDateMs = expiresTime;
      }

      if (dateFrom) {
        const fromMs = new Date(`${dateFrom}T00:00:00`).getTime();
        if (targetDateMs === null || targetDateMs < fromMs) {
          matchDateRange = false;
        }
      }

      if (dateTo) {
        const toMs = new Date(`${dateTo}T23:59:59.999`).getTime();
        if (targetDateMs === null || targetDateMs > toMs) {
          matchDateRange = false;
        }
      }

      return (
        matchSearch &&
        matchType &&
        matchStatus &&
        matchDateRange
      );
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'newest_created') {
        const aTime = new Date(a.createdAt || a.startsAt).getTime();
        const bTime = new Date(b.createdAt || b.startsAt).getTime();
        return bTime - aTime;
      }
      if (sortBy === 'oldest_created') {
        const aTime = new Date(a.createdAt || a.startsAt).getTime();
        const bTime = new Date(b.createdAt || b.startsAt).getTime();
        return aTime - bTime;
      }
      if (sortBy === 'starts_soon') {
        const aTime = new Date(a.startsAt).getTime();
        const bTime = new Date(b.startsAt).getTime();
        return aTime - bTime;
      }
      if (sortBy === 'expires_soon') {
        const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
        const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
        return aTime - bTime;
      }
      if (sortBy === 'most_viewed') {
        return (b.metrics?.views || 0) - (a.metrics?.views || 0);
      }
      return 0;
    });
  }, [
    posts,
    searchQuery,
    filterType,
    filterStatus,
    dateFilterField,
    dateFrom,
    dateTo,
    sortBy,
    isPostActive,
  ]);

  const openSuspensionModal = (post: Post) => {
    setSuspensionTargetPost(post);
    setRejectionReasonText('');
    if (post.suspensionReason) {
      setCustomReasonDetails(post.suspensionReason);
      setSelectedPresetReason('Otro motivo personalizado');
    } else {
      setSelectedPresetReason(PRESET_POLICY_REASONS[0]);
      setCustomReasonDetails('');
    }
  };

  const handleConfirmSuspension = () => {
    if (!suspensionTargetPost) return;

    let finalReason = selectedPresetReason;
    if (selectedPresetReason === 'Otro motivo personalizado' || customReasonDetails.trim()) {
      finalReason = customReasonDetails.trim()
        ? `${selectedPresetReason !== 'Otro motivo personalizado' ? `${selectedPresetReason}: ` : ''}${customReasonDetails.trim()}`
        : selectedPresetReason;
    }

    suspendPost(suspensionTargetPost.id, finalReason, selectedPresetReason);
    setSuspensionTargetPost(null);
  };

  const handleReactivatePost = (post: Post) => {
    reactivatePost(post.id);
    setSuspensionTargetPost(null);
  };

  const handleApproveReview = (post: Post) => {
    approvePostReview(post.id);
    setSuspensionTargetPost(null);
  };

  const handleRejectReview = (post: Post) => {
    const reason =
      rejectionReasonText.trim() ||
      'Las correcciones presentadas aún no cumplen con los términos y políticas requeridos.';
    rejectPostReview(post.id, reason);
    setSuspensionTargetPost(null);
  };

  const formatCOP = (val?: number) => {
    if (!val) return null;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDelete = (post: Post) => {
    if (window.confirm(`¿Eliminar la publicación "${post.title}" de ${post.businessName}?`)) {
      deletePost(post.id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Search & Filter Header Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#007af7]" />
              <span>Moderación General de Publicaciones</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisa las publicaciones activas, controla fechas de publicación, inicio y vigencia, o modera contenidos
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {/* Botón Crear Nueva Publicación */}
            <button
              type="button"
              id="btn-admin-create-post"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#007af7] hover:bg-blue-600 text-white shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              title="Crear una nueva publicación"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Publicación</span>
            </button>

            {/* Botón de Filtros igual al de Explorar */}
            <button
              id="btn-admin-filter-toggle"
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
            {/* Fila 1: Búsqueda y Clasificación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
                    placeholder="Título, contenido o comercio..."
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipo de publicación
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Todos los tipos</option>
                  {postTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Estado</span>
                  {pendingReviewsCount > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200">
                      {pendingReviewsCount} en revisión
                    </span>
                  )}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activas (Vigentes hoy)</option>
                  <option value="scheduled">Programadas (Inicio a futuro)</option>
                  <option value="expired">Vencidas / Expiradas</option>
                  <option value="permanent">Permanentes (Sin vencimiento)</option>
                  <option value="suspended">Suspendidas por moderación</option>
                  {pendingReviewsCount > 0 && (
                    <option value="pending_review">En revisión ({pendingReviewsCount})</option>
                  )}
                </select>
              </div>
            </div>

            {/* Fila 2: Fechas y Orden */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100">
              {/* Criterio de fecha */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                  <span>Evaluar fecha por</span>
                </label>
                <select
                  value={dateFilterField}
                  onChange={(e) => setDateFilterField(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 cursor-pointer"
                >
                  <option value="createdAt">Fecha Creada</option>
                  <option value="startsAt">Fecha Inicia</option>
                  <option value="expiresAt">Fecha Finaliza</option>
                </select>
              </div>

              {/* Rango de fechas: Desde y Hasta */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Rango (Desde — Hasta)</span>
                  </span>
                  {(dateFrom || dateTo) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDateFrom('');
                        setDateTo('');
                      }}
                      className="text-[11px] font-medium text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full min-w-0 px-2 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden cursor-pointer"
                    title="Fecha Desde"
                  />
                  <span className="text-slate-400 text-xs font-semibold shrink-0">a</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full min-w-0 px-2 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden cursor-pointer"
                    title="Fecha Hasta"
                  />
                </div>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ordenar por</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 cursor-pointer"
                >
                  <option value="newest_created">Publicación más reciente</option>
                  <option value="oldest_created">Publicación más antigua</option>
                  <option value="starts_soon">Inicio más próximo</option>
                  <option value="expires_soon">Vencimiento más próximo</option>
                  <option value="most_viewed">Más vistas (métricas)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-normal text-slate-600">
              Mostrando <span className="text-blue-600 font-normal">{filteredPosts.length}</span> de{' '}
              <span className="text-slate-900 font-normal">{posts.length}</span> publicaciones
            </span>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-normal text-slate-700">
                  Texto: "{searchQuery.trim()}"
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-slate-900 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-normal text-slate-700">
                  Tipo: {toTitleCase(postTypes.find((pt) => pt.id === filterType)?.label || filterType)}
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className="hover:text-slate-900 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-normal text-slate-700">
                  Estado:{' '}
                  {toTitleCase(
                    filterStatus === 'active'
                      ? 'Activas (Vigentes hoy)'
                      : filterStatus === 'scheduled'
                      ? 'Programadas'
                      : filterStatus === 'expired'
                      ? 'Vencidas'
                      : filterStatus === 'permanent'
                      ? 'Permanentes'
                      : filterStatus === 'suspended'
                      ? 'Suspendidas'
                      : 'En revisión'
                  )}
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className="hover:text-slate-900 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-normal text-blue-800">
                  {dateFilterField === 'createdAt'
                    ? 'Publicación'
                    : dateFilterField === 'startsAt'
                    ? 'Inicio'
                    : 'Vigencia'}
                  : {dateFrom || '...'} a {dateTo || '...'}
                  <button
                    type="button"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="hover:text-blue-950 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">No se encontraron publicaciones con los filtros actuales.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
              >
                Restablecer todos los filtros
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isPendingReview = post.status === 'pending_review' || post.reviewStatus === 'pending';
            const isSuspended = (post.status === 'suspended' || Boolean(post.suspended)) && !isPendingReview;
            const nowMs = Date.now();
            const startsTime = post.startsAt ? new Date(post.startsAt).getTime() : 0;
            const isScheduled = !isSuspended && !isPendingReview && startsTime > nowMs;
            const isExpired =
              !isSuspended &&
              !isPendingReview &&
              !isScheduled &&
              ((post.expiresAt && new Date(post.expiresAt).getTime() <= nowMs) || !isPostActive(post));

            return (
              <div
                key={post.id}
                className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition overflow-hidden w-full ${
                  isPendingReview
                    ? 'bg-amber-50/70 border-2 border-amber-400 ring-1 ring-amber-300'
                    : isSuspended
                    ? 'bg-red-50/60 border-red-300 hover:border-red-400'
                    : 'bg-white border-slate-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full flex-1">
                  {post.imageUrl ? (
                    <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border shrink-0 bg-slate-100 flex items-center justify-center ${
                      isPendingReview ? 'border-amber-400' : isSuspended ? 'border-red-300' : 'border-slate-200'
                    }`}>
                      <img
                        src={post.imageUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                        className={`w-full h-full ${post.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                        style={{
                          objectPosition: post.imagePosition
                            ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                            : '50% 50%',
                          transform:
                            post.imageScale && post.imageScale !== 1
                              ? `scale(${post.imageScale})`
                              : undefined,
                          transformOrigin: post.imagePosition
                            ? `${post.imagePosition.x}% ${post.imagePosition.y}%`
                            : '50% 50%',
                          filter:
                            post.imageFilter && post.imageFilter !== 'none'
                              ? post.imageFilter
                              : undefined,
                        }}
                      />
                      <Tag className="w-5 h-5 text-slate-300 absolute pointer-events-none opacity-0" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 text-[10px] text-slate-400 font-bold">
                      <Tag className="w-4 h-4 text-slate-300 mb-0.5" />
                      <span>Sin foto</span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[10px] font-normal px-2 py-0.5 rounded-md shrink-0 shadow-2xs ${getPostTypeBadgeStyle(
                          post.type,
                          postTypes
                        )}`}
                      >
                        {toTitleCase(getPostTypeLabel(post.type, postTypes))}
                      </span>
                      {isPendingReview ? (
                        <span className="text-[10px] font-normal text-amber-950 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-800 animate-pulse" />
                          {toTitleCase('En revisión de corrección')}
                        </span>
                      ) : isSuspended ? (
                        <span className="text-[10px] font-normal text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                          <Ban className="w-3 h-3 text-red-600" />
                          {toTitleCase('Suspendida por políticas')}
                        </span>
                      ) : isExpired ? (
                        <span className="text-[10px] font-normal text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md shrink-0">
                          {toTitleCase('Vencida (fuera del feed)')}
                        </span>
                      ) : isScheduled ? (
                        <span className="text-[10px] font-normal text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {toTitleCase('Programada (aún no en feed)')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                          {toTitleCase('Activa en feed')}
                        </span>
                      )}
                      <span
                        className="text-[10px] font-normal text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md shrink-0 truncate max-w-[160px] sm:max-w-xs"
                        title={post.businessName}
                      >
                        {toTitleCase(post.businessName)}
                      </span>
                    </div>

                    {/* Suspension Box - Placed above the title */}
                    {isSuspended && (
                      <div className="mt-1.5 p-2 rounded-lg bg-red-100/80 border border-red-200 text-xs text-red-900 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-normal">Motivo de suspensión:</span>{' '}
                          <span className="text-red-800 font-normal">{post.suspensionReason || 'Incumplimiento de políticas de contenido.'}</span>
                        </div>
                      </div>
                    )}

                    <h4
                      className="text-sm font-bold text-slate-900 truncate block mt-1 max-w-full"
                      title={post.title}
                    >
                      <span className="font-bold text-slate-900">{post.title}</span>
                    </h4>

                    <div className="text-xs font-normal text-slate-700 mt-1">
                      {post.promotionalPrice
                        ? `$${post.promotionalPrice.toLocaleString('es-CO')} COP`
                        : 'Sin precio'}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                      <span
                        className="inline-flex items-center gap-1 text-slate-600 font-normal shrink-0"
                        title="Vistas"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-500" />
                        <span>{post.metrics?.views || 0}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className="inline-flex items-center gap-1 text-emerald-700 font-normal shrink-0"
                        title="WhatsApp Directo"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{post.metrics?.whatsappClicks || 0}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className="inline-flex items-center gap-1 text-amber-700 font-normal shrink-0"
                        title="Cómo llegar (Maps)"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-600" />
                        <span>{post.metrics?.mapsClicks || 0}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className="inline-flex items-center gap-1 text-blue-700 font-normal shrink-0"
                        title="Llamadas"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{post.metrics?.calls || 0}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className="inline-flex items-center gap-1 text-purple-700 font-normal shrink-0"
                        title="Compartidos"
                      >
                        <Share2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>{post.metrics?.shares || 0}</span>
                      </span>
                    </div>

                    {/* Barra en una Sola Fila de Fechas */}
                    <PostDatesBar post={post} isExpired={isExpired} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewPost(post)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer shrink-0 shadow-2xs"
                    title="Previsualizar cómo la ven los usuarios"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openSuspensionModal(post)}
                    className={`p-2 rounded-xl border transition cursor-pointer shadow-2xs shrink-0 ${
                      isPendingReview
                        ? 'bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200 ring-1 ring-amber-400'
                        : isSuspended
                        ? 'border-red-300 bg-red-100 text-red-700 hover:bg-red-200 ring-1 ring-red-400'
                        : 'border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                    }`}
                    title={
                      isPendingReview
                        ? 'Revisar correcciones de la publicación y reactivar'
                        : isSuspended
                        ? 'Publicación suspendida por políticas (Gestionar o Reactivar)'
                        : 'Suspender publicación por políticas'
                    }
                  >
                    {isPendingReview ? (
                      <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0 shadow-2xs"
                    title="Eliminar publicación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Suspension Modal */}
      {suspensionTargetPost && (() => {
        const isTargetPendingReview =
          suspensionTargetPost.status === 'pending_review' ||
          suspensionTargetPost.reviewStatus === 'pending';
        const isTargetSuspended =
          suspensionTargetPost.status === 'suspended' || Boolean(suspensionTargetPost.suspended);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto flex flex-col">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isTargetPendingReview
                        ? 'bg-amber-100 text-amber-700'
                        : isTargetSuspended
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {isTargetPendingReview ? (
                      <Clock className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Ban className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                      {isTargetPendingReview
                        ? 'Evaluar Revisión de Suspensión'
                        : isTargetSuspended
                        ? 'Gestionar Suspensión de la Publicación'
                        : 'Suspender Publicación por Políticas'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                      {isTargetPendingReview
                        ? 'El comercio ha presentado correcciones para reactivar su publicación'
                        : 'Moderación administrativa y cumplimiento de normas'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSuspensionTargetPost(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Post Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                {suspensionTargetPost.imageUrl ? (
                  <img
                    src={suspensionTargetPost.imageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {suspensionTargetPost.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comercio: <strong className="text-slate-700">{suspensionTargetPost.businessName}</strong>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isTargetPendingReview
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : isTargetSuspended
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isTargetPendingReview
                        ? 'En cola de revisión'
                        : isTargetSuspended
                        ? 'Suspendida actualmente'
                        : 'Publicación Activa'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-black">
                      {suspensionTargetPost.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Histórico Cronológico de Moderación */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <SuspensionTimeline
                  post={suspensionTargetPost}
                  collapsible={true}
                  defaultExpanded={true}
                />
              </div>

              {/* Review specific section if pending_review */}
              {isTargetPendingReview ? (
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
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Motivo principal de incumplimiento:
                    </label>
                    <select
                      value={selectedPresetReason}
                      onChange={(e) => setSelectedPresetReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-red-500 focus:outline-hidden cursor-pointer"
                    >
                      {PRESET_POLICY_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Detalles específicos o instrucciones para el cliente:
                    </label>
                    <textarea
                      rows={3}
                      value={customReasonDetails}
                      onChange={(e) => setCustomReasonDetails(e.target.value)}
                      placeholder="Describe el motivo específico o las medidas que debe tomar el comercio para regularizar su publicación..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-red-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 rounded-b-2xl">
                {isTargetPendingReview ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRejectReview(suspensionTargetPost)}
                      className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Rechazar Solicitud</span>
                    </button>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setSuspensionTargetPost(null)}
                        className="w-full sm:w-auto px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                      >
                        Cerrar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveReview(suspensionTargetPost)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Aprobar y Reactivar</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {isTargetSuspended ? (
                      <button
                        type="button"
                        onClick={() => handleReactivatePost(suspensionTargetPost)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Reactivar Publicación</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setSuspensionTargetPost(null)}
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
                          {isTargetSuspended
                            ? 'Actualizar Motivo'
                            : 'Suspender Publicación'}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Preview Modal */}
      {previewPost && (
        <PostDetailModal
          post={previewPost}
          onClose={() => setPreviewPost(null)}
        />
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};
