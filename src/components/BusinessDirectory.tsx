import React, { useState, useMemo } from 'react';
import { Business, Post } from '../types';
import { useApp } from '../context/AppContext';
import { FilterModal } from './FilterModal';
import { getAvatarUrl, getFeedCardImageUrl } from '../utils/imageOptimization';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  BookOpen,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  Tag,
  Store,
} from 'lucide-react';

interface BusinessDirectoryProps {
  onSelectBusiness: (businessId: string) => void;
  onSelectPost?: (post: Post) => void;
}

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({
  onSelectBusiness,
  onSelectPost,
}) => {
  const {
    businesses,
    posts,
    isPostActive,
    categories,
    currentCity,
    currentSector,
    setCurrentSector,
    selectedCategory,
    setSelectedCategory,
    maxPlanBudget,
    setMaxPlanBudget,
    getDistanceKm,
    trackBusinessInteraction,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'distance' | 'price_low'>('recent');

  // Count active filters (category, sector, budget, sort)
  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (currentSector !== 'all' ? 1 : 0) +
    (maxPlanBudget !== null ? 1 : 0) +
    (sortOrder !== 'recent' ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0 || searchQuery.trim() !== '';

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setCurrentSector('all');
    setSelectedCategory('all');
    setMaxPlanBudget(null);
    setSortOrder('recent');
  };

  // Filter and sort businesses
  const filteredBusinesses = useMemo(() => {
    return businesses
      .filter((biz) => {
        // 1. City filter (from currentCity in AppContext)
        if (currentCity && currentCity !== 'all' && biz.city.toLowerCase() !== currentCity.toLowerCase()) {
          return false;
        }

        // 2. Sector filter (from currentSector in AppContext)
        if (currentSector && currentSector !== 'all' && biz.sector.toLowerCase() !== currentSector.toLowerCase()) {
          return false;
        }

        // 3. Category filter (from selectedCategory in AppContext)
        if (selectedCategory !== 'all' && biz.categoryId !== selectedCategory) {
          return false;
        }

        // 4. Budget filter (if maxPlanBudget is active, match businesses that offer items within budget)
        if (maxPlanBudget !== null && maxPlanBudget > 0) {
          const bizPosts = posts.filter((p) => p.businessId === biz.id && isPostActive(p));
          if (bizPosts.length > 0) {
            const hasAffordable = bizPosts.some((p) => {
              const price = p.promotionalPrice || p.originalPrice;
              return price !== undefined && price <= maxPlanBudget;
            });
            if (!hasAffordable) return false;
          }
        }

        // 4. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = biz.name.toLowerCase().includes(q);
          const matchesDesc = biz.description.toLowerCase().includes(q);
          const matchesSubcat = biz.subCategory.toLowerCase().includes(q);
          const matchesSector = biz.sector.toLowerCase().includes(q);
          const matchesCity = biz.city.toLowerCase().includes(q);
          const matchesAddress = biz.address.toLowerCase().includes(q);

          if (!matchesName && !matchesDesc && !matchesSubcat && !matchesSector && !matchesCity && !matchesAddress) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'distance') {
          const distA = getDistanceKm(a.coordinates) ?? 999;
          const distB = getDistanceKm(b.coordinates) ?? 999;
          return distA - distB;
        }
        // By default sort by verified / alphabetical
        if (b.verified !== a.verified) {
          return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [businesses, currentCity, currentSector, selectedCategory, searchQuery, sortOrder, getDistanceKm]);

  // Helper to count active posts of a business
  const getActivePostCount = (businessId: string) => {
    return posts.filter((p) => p.businessId === businessId && isPostActive(p)).length;
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      {/* Top Banner - Sleek mobile-optimized header bar matching design */}
      <div className="relative overflow-hidden flex items-center justify-between gap-2 sm:gap-4 p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#03153d] via-[#052264] to-[#0a3899] text-white shadow-xl shadow-blue-950/20 border border-white/15">
        {/* Subtle ambient light glow */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(6,182,212,0.35)] backdrop-blur-md">
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/40 opacity-80 pointer-events-none" />
            <Store className="relative w-5 h-5 text-cyan-300 drop-shadow-[0_2px_8px_rgba(0,180,216,0.6)]" strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight whitespace-nowrap">
              Directorio
            </h2>
            <p className="text-[10px] text-blue-200/80 font-medium hidden sm:block">
              Guía de comercios locales y servicios
            </p>
          </div>
        </div>

        {/* Search input on the right of the banner */}
        <div className="relative flex-1 min-w-0 max-w-[210px] xs:max-w-[250px] sm:max-w-xs md:max-w-sm">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="directory-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar comercio en ${currentCity || 'Cajicá'}...`}
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

      {/* Controls Row: Filtros button on Left + View Mode Toggle (Grid/List) on Right */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Filtros button + quick clear button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-directory-filter-modal"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
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

          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="text-[11px] text-slate-500 hover:text-red-600 font-semibold transition px-1.5 py-1 rounded-md hover:bg-slate-100"
              title="Quitar todos los filtros aplicados"
            >
              Limpiar ({filteredBusinesses.length})
            </button>
          )}

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
        </div>

        {/* Right: View Mode Toggle (Grid / List) */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/90">
          <button
            id="btn-directory-view-grid"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-white text-[#007af7] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Ver en cuadrícula (2 columnas)"
            aria-label="Ver en cuadrícula"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-directory-view-list"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-white text-[#007af7] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Ver en lista vertical"
            aria-label="Ver en lista"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Directory Content: Grid View vs List View */}
      {filteredBusinesses.length > 0 ? (
        viewMode === 'grid' ? (
          /* GRID VIEW: 2 columns */
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {filteredBusinesses.map((biz) => {
              const distance = getDistanceKm(biz.coordinates);
              const activePosts = getActivePostCount(biz.id);
              const categoryObj = categories.find((c) => c.id === biz.categoryId);

              return (
                <div
                  key={biz.id}
                  onClick={() => onSelectBusiness(biz.id)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Header Cover & Logo */}
                  <div className="relative h-24 sm:h-32 w-full overflow-hidden bg-slate-100">
                    {biz.coverImage ? (
                      <img
                        src={getFeedCardImageUrl(biz.coverImage)}
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top verified badge */}
                    {biz.verified && (
                      <div className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 flex items-center">
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-bold bg-emerald-600/90 text-white shadow-md backdrop-blur-xs">
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>Verificado</span>
                        </span>
                      </div>
                    )}

                    {/* Category pill on cover */}
                    <div className="absolute bottom-1.5 sm:bottom-2.5 left-1.5 sm:left-2.5 flex items-center gap-1 sm:gap-1.5 max-w-[90%] flex-wrap">
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[8.5px] sm:text-[11px] font-semibold bg-white/90 text-[#041f5e] backdrop-blur-xs shadow-xs truncate">
                        {biz.subCategory || categoryObj?.name}
                      </span>
                      {activePosts > 0 && (
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[8.5px] sm:text-[11px] font-bold bg-[#ff7700] text-white shadow-xs flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{activePosts} {activePosts === 1 ? 'oferta' : 'ofertas'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-start gap-2 sm:gap-2.5">
                        {biz.logo ? (
                          <img
                            src={getAvatarUrl(biz.logo)}
                            alt={biz.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover border-2 border-white shadow-md bg-white shrink-0 -mt-4 sm:-mt-5 relative z-10"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-md shrink-0 -mt-4 sm:-mt-5 relative z-10">
                            {biz.name.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#007af7] transition line-clamp-1">
                            {biz.name}
                          </h3>
                          <p className="text-[9.5px] sm:text-[11px] text-slate-500 truncate">
                            {biz.sector}, {biz.city}
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-1 sm:line-clamp-2 leading-tight sm:leading-relaxed">
                        {biz.description}
                      </p>

                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[9.5px] sm:text-[11px] text-slate-600 space-y-1 sm:space-y-1.5">
                        <div className="flex items-start gap-1 sm:gap-1.5 text-slate-700">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff7700] shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1 truncate font-medium">
                            {biz.address}
                            {distance !== null && (
                              <span className="ml-1 text-[#007af7] font-bold">
                                ({distance.toFixed(1)} km)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 pt-1 border-t border-slate-200/60">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{biz.hours}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW: Optimized, clean & practical mobile-first list */
          <div className="flex flex-col gap-3">
            {filteredBusinesses.map((biz) => {
              const distance = getDistanceKm(biz.coordinates);
              const activePosts = getActivePostCount(biz.id);
              const categoryObj = categories.find((c) => c.id === biz.categoryId);

              return (
                <div
                  key={biz.id}
                  id={`business-card-${biz.id}`}
                  onClick={() => onSelectBusiness(biz.id)}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-3.5 sm:p-4 cursor-pointer flex flex-col gap-2.5"
                >
                  {/* Top section: Logo + Title + Badges + Distance */}
                  <div className="flex items-start gap-3">
                    {/* Business Avatar / Logo */}
                    <div className="relative shrink-0">
                      {biz.logo ? (
                        <img
                          src={getAvatarUrl(biz.logo)}
                          alt={biz.name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-slate-200 shadow-xs bg-slate-50"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#041f5e] text-white flex items-center justify-center font-bold text-base border border-slate-200 shadow-xs">
                          {biz.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Main Details */}
                    <div className="min-w-0 flex-1">
                      {/* Name, Verified & Distance */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#007af7] transition line-clamp-1">
                            {biz.name}
                          </h3>
                          {biz.verified && (
                            <span title="Comercio verificado" className="shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
                            </span>
                          )}
                        </div>

                        {distance !== null && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-[#007af7] border border-blue-100/90">
                            <MapPin className="w-2.5 h-2.5 text-[#007af7]" />
                            <span>{distance.toFixed(1)} km</span>
                          </span>
                        )}
                      </div>

                      {/* Category, Offer & Rating badges */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-700 truncate max-w-[170px] sm:max-w-xs">
                          {biz.subCategory || categoryObj?.name}
                        </span>

                        {activePosts > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ff7700] text-white shadow-2xs">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{activePosts} {activePosts === 1 ? 'oferta' : 'ofertas'}</span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {biz.description && (
                        <p className="text-xs text-slate-600 line-clamp-1 sm:line-clamp-2 mt-1.5 leading-relaxed">
                          {biz.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row: Address & Hours */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 min-w-0 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-[#ff7700] shrink-0" />
                      <span className="truncate font-medium text-slate-800">{biz.address}</span>
                      <span className="text-slate-500 shrink-0">· {biz.sector}, {biz.city}</span>
                    </div>

                    {biz.hours && (
                      <div className="flex items-center gap-1.5 text-slate-500 min-w-0 shrink-0 sm:max-w-xs">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{biz.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Store className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              No se encontraron negocios con esos filtros
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta cambiar de vereda, categoría o eliminar términos de búsqueda.
            </p>
          </div>
          <button
            onClick={handleClearAllFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#007af7] text-white text-xs font-bold shadow-xs hover:bg-blue-600 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Restablecer filtros</span>
          </button>
        </div>
      )}

      {/* Filter Modal for Municipality, Veredas/Sectors & Categories */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
    </div>
  );
};
