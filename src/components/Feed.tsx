import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { AsymmetricalGridView, LAYOUT_ARCHETYPES, AUTO_ROTATE_SECONDS } from './AsymmetricalGridView';
import { FilterModal } from './FilterModal';
import { Post } from '../types';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Plus,
  Store,
  Compass,
} from 'lucide-react';

interface FeedProps {
  onSelectPost: (post: Post) => void;
  onSelectBusiness: (businessId: string) => void;
  onOpenCreatePost?: () => void;
  onOpenCreateBusiness?: () => void;
  onOpenLocationPicker?: () => void;
}

export const Feed: React.FC<FeedProps> = ({
  onSelectPost,
  onSelectBusiness,
  onOpenCreatePost,
  onOpenCreateBusiness,
}) => {
  const {
    filteredPosts,
    posts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    currentCity,
    currentSector,
    setCurrentSector,
    activeFeedFilter,
    setActiveFeedFilter,
    maxPlanBudget,
    setMaxPlanBudget,
    getDistanceKm,
  } = useApp();

  // Initial view mode: 'asymmetrical' (dynamic layout) or 'grid'
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'asymmetrical'>('asymmetrical');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'distance' | 'price_low'>('recent');

  // Asymmetrical layout index & timer
  const [asymLayoutIndex, setAsymLayoutIndex] = useState(0);
  const [asymShiftOffset, setAsymShiftOffset] = useState(0);
  const [asymSecondsRemaining, setAsymSecondsRemaining] = useState(AUTO_ROTATE_SECONDS);
  const [isAsymSpinning, setIsAsymSpinning] = useState(false);
  const [isAsymPaused, setIsAsymPaused] = useState(false);

  // Active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && selectedCategory !== 'all') count++;
    if (currentSector && currentSector !== 'all') count++;
    if (maxPlanBudget !== null) count++;
    if (currentCity && currentCity !== 'all') count++;
    if (activeFeedFilter && activeFeedFilter !== 'today') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, currentSector, maxPlanBudget, currentCity, activeFeedFilter, searchQuery]);

  // Posts to display with sorting
  const displayPosts = useMemo(() => {
    let list = [...filteredPosts];

    if (sortOrder === 'price_low') {
      list.sort((a, b) => {
        const priceA = a.promotionalPrice || a.originalPrice || 99999999;
        const priceB = b.promotionalPrice || b.originalPrice || 99999999;
        return priceA - priceB;
      });
    } else if (sortOrder === 'distance') {
      list.sort((a, b) => {
        const distA = getDistanceKm(a.coordinates) ?? 999999;
        const distB = getDistanceKm(b.coordinates) ?? 999999;
        return distA - distB;
      });
    } else if (sortOrder === 'recent') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [filteredPosts, sortOrder, getDistanceKm]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveFeedFilter('today');
    setSelectedCategory('all');
    setCurrentSector('all');
    setMaxPlanBudget(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Banner - Authentic original Descubrir header bar matching Image 1 */}
      <div className="relative overflow-hidden flex items-center justify-between gap-2 sm:gap-4 p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#03153d] via-[#052264] to-[#0a3899] text-white shadow-xl shadow-blue-950/20 border border-white/15">
        {/* Subtle ambient light glow */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(6,182,212,0.35)] backdrop-blur-md">
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/40 opacity-80 pointer-events-none" />
            <Compass className="relative w-5 h-5 text-cyan-300 drop-shadow-[0_2px_8px_rgba(0,180,216,0.6)]" strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight whitespace-nowrap">
              Descubrir
            </h2>
            <p className="text-[10px] text-blue-200/80 font-medium hidden sm:block">
              Ofertas y publicaciones de hoy
            </p>
          </div>
        </div>

        {/* Search input on the right of the banner */}
        <div className="relative flex-1 min-w-0 max-w-[210px] xs:max-w-[250px] sm:max-w-xs md:max-w-sm">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="feed-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar planes en ${currentCity || 'Cajicá'}...`}
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

      {/* Controls Row: Filtros button on Left + View Mode Toggle on Right */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Filtros button + location indicator */}
        <div className="flex items-center gap-2">
          <button
            id="btn-feed-filter-modal"
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

        {/* Right: Layout Switchers (Grid, List, Asymmetrical) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/90 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
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
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#007af7] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en Lista"
              aria-label="Vista lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode('asymmetrical')}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'asymmetrical'
                  ? 'bg-white text-[#007af7] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Diseño Dinámico Asimétrico"
              aria-label="Diseño dinámico"
            >
              <span className="text-xs font-bold leading-none">❖</span>
            </button>
          </div>
        </div>
      </div>

      {/* POSTS FEED */}
      {displayPosts.length > 0 ? (
        <>
          {/* A. Asymmetrical Layout Mode */}
          {viewMode === 'asymmetrical' && (
            <AsymmetricalGridView
              posts={displayPosts}
              onSelectPost={onSelectPost}
              onSelectBusiness={onSelectBusiness}
              currentLayout={LAYOUT_ARCHETYPES[asymLayoutIndex]}
              layoutName={LAYOUT_ARCHETYPES[asymLayoutIndex].name}
              shiftOffset={asymShiftOffset}
              secondsRemaining={asymSecondsRemaining}
              isSpinning={isAsymSpinning}
              isPaused={isAsymPaused}
              onPauseToggle={() => setIsAsymPaused((prev) => !prev)}
              onManualRotate={() => {
                setAsymShiftOffset((prev) => prev + 1);
                setAsymLayoutIndex((prev) => (prev + 1) % LAYOUT_ARCHETYPES.length);
                setAsymSecondsRemaining(AUTO_ROTATE_SECONDS);
              }}
            />
          )}

          {/* B. Grid Mode (2-Columns as shown in original Image 1) */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {displayPosts.map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  viewMode="grid"
                  priority={idx < 2}
                  onSelectPost={onSelectPost}
                  onSelectBusiness={onSelectBusiness}
                />
              ))}
            </div>
          )}

          {/* C. List Mode */}
          {viewMode === 'list' && (
            <div className="space-y-3.5 max-w-xl mx-auto">
              {displayPosts.map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  viewMode="list"
                  priority={idx < 2}
                  onSelectPost={onSelectPost}
                  onSelectBusiness={onSelectBusiness}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0056d6] flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[#031c54]">
            No hay publicaciones en este momento
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Intenta cambiar tus filtros de búsqueda o consulta más sectores del municipio.
          </p>
          <button
            onClick={handleClearAllFilters}
            className="px-4 py-2 bg-[#0056d6] hover:bg-[#0047ba] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Ver todo lo disponible
          </button>
        </div>
      )}

      {/* BOTTOM MERCHANT BANNER (Original Image 1) */}
      <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-[#031c54] text-white shadow-xl relative overflow-hidden text-center">
        {/* Subtle accent glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#007af7]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-3.5 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-orange-300 border border-orange-400/30 text-[10px] font-black uppercase tracking-wider">
            <Store className="w-3.5 h-3.5 text-[#ffaa00]" />
            <span>¿Quieres ser un Veci?</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base sm:text-lg md:text-xl font-black text-white">
              Publica en OleVeci.com por $29.900 COP/Mes
            </h4>
            <p className="text-xs text-blue-100/80 max-w-md mx-auto leading-relaxed">
              Llega a miles de vecinos de tu municipio y genera experiencias sin comisiones
            </p>
          </div>

          <button
            id="btn-feed-publish-business"
            type="button"
            onClick={() => {
              if (onOpenCreateBusiness) {
                onOpenCreateBusiness();
              } else if (onOpenCreatePost) {
                onOpenCreatePost();
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#ff7700] hover:bg-[#e06600] text-white text-xs sm:text-sm font-black transition shadow-md shadow-[#ff7700]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar mi Espacio</span>
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
    </div>
  );
};
