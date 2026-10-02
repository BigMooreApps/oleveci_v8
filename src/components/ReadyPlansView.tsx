import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  SimulatedReadyPlan,
  READY_PLANS_SEED,
  READY_PLAN_CATEGORIES,
  resolvePlanPosts,
  filterReadyPlans,
} from '../data/readyPlansData';
import { Post } from '../types';
import {
  InvitationCardPreview,
  PlanBackgroundImages,
  THEMES,
} from './InvitationCardPreview';
import { ReadyPlanViewerModal } from './ready-plans';
import { getAvatarUrl } from '../utils/imageOptimization';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  ChevronRight,
  LayoutGrid,
  List,
  Store,
  Compass,
  ArrowRight,
  Wand2,
  Tag,
  Dices,
  Navigation,
  Route,
  Loader2,
  Sparkle,
  Plus,
} from 'lucide-react';
import { TagSlashIcon } from './icons/TagSlashIcon';
import { ReadyPlansFilterModal } from './ReadyPlansFilterModal';
import { PlanRouteSection } from './PlanRouteSection';
import type { BuilderMode } from './ItineraryBuilderModal';

const ItineraryBuilderModal = React.lazy(() =>
  import('./ItineraryBuilderModal').then((m) => ({ default: m.ItineraryBuilderModal }))
);

interface ReadyPlansViewProps {
  onSelectPost: (post: Post) => void;
  onSelectBusiness: (businessId: string) => void;
  onOpenItineraryBuilder?: (mode?: BuilderMode) => void;
}

export const ReadyPlansView: React.FC<ReadyPlansViewProps> = ({
  onSelectPost,
  onSelectBusiness,
  onOpenItineraryBuilder,
}) => {
  const {
    posts,
    businesses,
    currentCity,
    setCurrentCity,
    currentSector,
    setCurrentSector,
    municipalities,
    userLocation,
    readyPlans,
    maxPlanBudget,
    setMaxPlanBudget,
  } = useApp();

  // Search and local UI filters (Controlled through ReadyPlansFilterModal)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlanType, setSelectedPlanType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'distance' | 'price_low'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Selected plan for full flyer modal (matching Sorpréndeme view)
  const [selectedPlanModal, setSelectedPlanModal] = useState<SimulatedReadyPlan | null>(null);
  const [autoViewMode, setAutoViewMode] = useState<'card' | 'map'>('card');
  const [isLocalBuilderOpen, setIsLocalBuilderOpen] = useState(false);

  const handleOpenBuilder = (mode: BuilderMode = 'manual') => {
    if (onOpenItineraryBuilder) {
      onOpenItineraryBuilder(mode);
    } else {
      setIsLocalBuilderOpen(true);
    }
  };

  // Count active filters (for badge on the filter button)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedPlanType !== 'all') count++;
    if (maxPlanBudget !== null) count++;
    if (currentCity && currentCity !== 'all') count++;
    if (currentSector && currentSector !== 'all') count++;
    if (sortOrder !== 'recent') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedPlanType, maxPlanBudget, currentCity, currentSector, sortOrder, searchQuery]);

  // Filtered and sorted plans using unified filterReadyPlans engine
  const filteredPlans = useMemo(() => {
    return filterReadyPlans(readyPlans, {
      selectedCategory,
      selectedPlanType,
      selectedCity: currentCity,
      selectedSector: currentSector,
      maxPlanBudget,
      searchQuery,
      sortOrder,
      posts,
      userLocation,
    });
  }, [
    readyPlans,
    selectedCategory,
    selectedPlanType,
    currentCity,
    currentSector,
    maxPlanBudget,
    searchQuery,
    sortOrder,
    posts,
    userLocation,
  ]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPlanType('all');
    setMaxPlanBudget(null);
    setCurrentSector('all');
    setSortOrder('recent');
  };

  const openPlanModal = (plan: SimulatedReadyPlan, tab: 'card' | 'map' = 'card') => {
    setSelectedPlanModal(plan);
    setAutoViewMode(tab);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Banner - Sleek mobile-optimized header bar matching design */}
      <div className="relative overflow-hidden flex items-center justify-between gap-2 sm:gap-4 p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#03153d] via-[#052264] to-[#0a3899] text-white shadow-xl shadow-blue-950/20 border border-white/15">
        {/* Subtle ambient light glow matching Descubrir */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(6,182,212,0.35)] backdrop-blur-md">
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/40 opacity-80 pointer-events-none" />
            <Route className="relative w-5 h-5 text-cyan-300 drop-shadow-[0_2px_8px_rgba(0,180,216,0.6)]" strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight whitespace-nowrap">
              Itinerarios
            </h2>
            <p className="text-[10px] text-blue-200/80 font-medium hidden sm:block">
              Itinerarios armados y rutas recomendadas
            </p>
          </div>
        </div>

        {/* Search input on the right of the banner */}
        <div className="relative flex-1 min-w-0 max-w-[210px] xs:max-w-[250px] sm:max-w-xs md:max-w-sm">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="ready-plans-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar planes en ${currentCity && currentCity !== 'all' ? currentCity : 'la Sabana'}...`}
            className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl bg-black/30 backdrop-blur-md text-white placeholder:text-blue-200/60 text-xs border border-white/15 focus:outline-hidden focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Controls Row: Filtros button on Left + View Mode Toggle on Right (identical to Descubrir) */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Filtros button + quick clear button + indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-ready-plans-filter-modal"
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-[#007af7] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90'
            }`}
            title="Abrir opciones de filtros"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#007af7] text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Location indicator chip */}
          <span className="text-xs text-slate-500 hidden sm:inline">
            📍 {currentCity && currentCity !== 'all' ? currentCity : 'Todos los municipios'}{currentSector && currentSector !== 'all' ? ` · ${currentSector}` : ''}
          </span>

          {/* Quick active budget indicator if set */}
          {maxPlanBudget !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs shrink-0">
              Hasta ${maxPlanBudget.toLocaleString('es-CO')}
              <button onClick={() => setMaxPlanBudget(null)} className="hover:text-emerald-950 cursor-pointer" title="Quitar filtro de precio">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Quick active sector indicator if set */}
          {currentSector && currentSector !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200 text-xs shrink-0">
              {currentSector}
              <button onClick={() => setCurrentSector('all')} className="hover:text-amber-950 cursor-pointer" title="Quitar filtro de sector">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Right: Botón Crear Itinerario en 3 Pasos + Layout Switchers (Grid, List) */}
        <div className="flex items-center gap-2">
          {/* Botón Crear Itinerario en 3 pasos (ahora primero) */}
          <button
            type="button"
            id="btn-ready-plans-create-itinerary"
            onClick={() => handleOpenBuilder('manual')}
            title="Crear itinerario en 3 pasos (Paradas, Invitación y Ruta)"
            aria-label="Crear itinerario en 3 pasos"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0056d6] to-[#007af7] hover:from-[#0047b3] hover:to-[#0066d6] text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Crear itinerario</span>
            <span className="xs:hidden">Crear</span>
          </button>

          {/* Switcher de vistas (Cuadrícula / Lista) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/90 shrink-0">
            <button
              id="btn-ready-plans-view-grid"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#007af7] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en Cuadrícula (2 Columnas)"
              aria-label="Vista cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-ready-plans-view-list"
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#007af7] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en Lista Horizontal"
              aria-label="Vista lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. PLANS LIST / GRID */}
      {filteredPlans.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(6,182,212,0.35)] backdrop-blur-md mx-auto">
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/40 opacity-80 pointer-events-none" />
            <Route className="relative w-6 h-6 text-cyan-300 drop-shadow-[0_2px_8px_rgba(0,180,216,0.6)]" strokeWidth={2.4} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No encontramos planes con esos filtros</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Intenta cambiar los términos de búsqueda o limpiar los filtros seleccionados para ver más opciones.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="px-4 py-2 rounded-xl bg-blue-50 text-[#0056d6] font-bold text-xs hover:bg-blue-100 transition cursor-pointer"
            >
              Restablecer filtros
            </button>
            {onOpenItineraryBuilder && (
              <button
                type="button"
                onClick={() => onOpenItineraryBuilder('automatic')}
                className="px-4 py-2 rounded-xl bg-[#0056d6] text-white font-bold text-xs hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Crear plan automático</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: 2 columns on mobile, 2-3 on tablet/desktop */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {filteredPlans.map((plan) => {
            const planPosts = resolvePlanPosts(plan, posts);

            return (
              <div
                key={plan.id}
                onClick={() => openPlanModal(plan, 'card')}
                className="group flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer select-none"
              >
                {/* Visual Cover (Compact for 2 columns) */}
                <div className="h-32 xs:h-36 sm:h-48 relative overflow-hidden bg-slate-900 select-none">
                  <PlanBackgroundImages
                    posts={planPosts}
                    bgLayout={plan.bgLayout}
                    theme={plan.theme}
                    imageClassName="group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2 inset-x-2 sm:top-3 sm:inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-1 border border-white/20 shadow-xs">
                      <Route className="w-2.5 h-2.5 text-cyan-300" strokeWidth={2.4} />
                      <span>{planPosts.length} {planPosts.length === 1 ? 'parada' : 'paradas'}</span>
                    </span>
                  </div>

                  {/* Date badge on cover */}
                  <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-2.5 z-10 pointer-events-none">
                    <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-white/25 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-semibold border border-white/20 max-w-full truncate">
                      <Calendar className="w-2.5 h-2.5 text-cyan-200 shrink-0" />
                      <span className="truncate">{plan.scheduledTime}</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-xs sm:text-base font-black text-[#031c54] group-hover:text-[#0056d6] transition-colors leading-tight line-clamp-2">
                      {plan.planTitle}
                    </h3>

                    {/* Stops avatar preview */}
                    <div className="mt-1.5 flex items-center gap-1 overflow-hidden">
                      <div className="flex -space-x-1.5 shrink-0">
                        {planPosts.slice(0, 3).map((post, idx) => (
                          <img
                            key={post.id || idx}
                            src={getAvatarUrl(post.imageUrl)}
                            alt=""
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-white"
                            loading="lazy"
                            decoding="async"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                        {planPosts.map((p) => p.businessName).slice(0, 2).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                    <span className="flex items-center gap-0.5 font-medium truncate max-w-[70px] sm:max-w-none">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0056d6] shrink-0" />
                      <span className="truncate">{plan.municipality}</span>
                    </span>
                    <span className="font-extrabold text-[#031c54] shrink-0">
                      ${plan.estimatedBudget > 0 ? (plan.estimatedBudget >= 1000000 ? `${(plan.estimatedBudget / 1000000).toFixed(1)}M` : `${Math.round(plan.estimatedBudget / 1000)}k`) : '0'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW: Compact horizontal cards on mobile and desktop */
        <div className="space-y-2.5 sm:space-y-3">
          {filteredPlans.map((plan) => {
            const planPosts = resolvePlanPosts(plan, posts);

            return (
              <div
                key={plan.id}
                onClick={() => openPlanModal(plan, 'card')}
                className="group flex flex-row items-stretch rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
              >
                {/* Image Section (Fixed width thumbnail) */}
                <div className="w-24 xs:w-28 sm:w-40 shrink-0 relative overflow-hidden bg-slate-900 select-none">
                  <PlanBackgroundImages
                    posts={planPosts}
                    bgLayout={plan.bgLayout}
                    theme={plan.theme}
                    imageClassName="group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/80 via-transparent to-black/20 pointer-events-none" />
                  
                  {/* Stops count pill on thumbnail */}
                  <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-1 border border-white/20 shadow-xs">
                      <Route className="w-2.5 h-2.5 text-cyan-300" strokeWidth={2.4} />
                      <span>{planPosts.length}</span>
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-2.5 sm:p-4 flex-1 min-w-0 flex flex-col justify-between space-y-1 sm:space-y-2">
                  <div>
                    <div className="flex items-center justify-between gap-1.5 text-[10px] sm:text-xs">
                      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-50 text-[#0056d6] font-bold truncate">
                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="truncate">{plan.scheduledTime}</span>
                      </span>
                      <span className="text-slate-400 font-semibold shrink-0">
                        📍 {plan.municipality}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-base font-black text-[#031c54] group-hover:text-[#0056d6] transition-colors leading-snug line-clamp-1 sm:line-clamp-2 mt-1">
                      {plan.planTitle}
                    </h3>

                    <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {planPosts.map((p) => p.businessName).join(' • ')}
                    </p>
                  </div>

                  {/* Bottom info */}
                  <div className="pt-1 sm:pt-2 border-t border-slate-100 text-[10px] sm:text-xs">
                    <span className="text-slate-600 font-medium">
                      Presupuesto: <strong className="text-[#031c54]">${plan.estimatedBudget.toLocaleString('es-CO')}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL UNIFICADO: VISTA COMPLETA IDÉNTICA A SORPRÉNDEME (SIN BOTÓN DE DADOS) */}
      <ReadyPlanViewerModal
        plan={selectedPlanModal}
        posts={posts}
        currentCity={currentCity}
        onClose={() => setSelectedPlanModal(null)}
        onSelectPost={onSelectPost}
        onOpenItineraryBuilder={onOpenItineraryBuilder}
        initialTab={autoViewMode}
      />

      {/* 6. ADVANCED FILTER MODAL (Matching requested design 1:1) */}
      <ReadyPlansFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedPlanType={selectedPlanType}
        onSelectPlanType={setSelectedPlanType}
        maxPlanBudget={maxPlanBudget}
        onSelectMaxBudget={setMaxPlanBudget}
        selectedCity={currentCity}
        onSelectCity={setCurrentCity}
        selectedSector={currentSector}
        onSelectSector={setCurrentSector}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        filteredCount={filteredPlans.length}
        totalPlansCount={readyPlans.length}
        allPlans={readyPlans}
        onResetFilters={handleClearAllFilters}
      />

      {/* 7. MODAL DE CREACIÓN DE ITINERARIO EN 3 PASOS */}
      {isLocalBuilderOpen && (
        <React.Suspense fallback={null}>
          <ItineraryBuilderModal
            isOpen={isLocalBuilderOpen}
            initialMode="manual"
            onClose={() => setIsLocalBuilderOpen(false)}
            onSelectPost={onSelectPost}
          />
        </React.Suspense>
      )}
    </div>
  );
};
