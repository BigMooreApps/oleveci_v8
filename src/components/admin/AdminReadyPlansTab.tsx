import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  SimulatedReadyPlan,
  READY_PLAN_CATEGORIES,
  resolvePlanPosts,
} from '../../data/readyPlansData';
import { ReadyPlanViewerModal } from '../ready-plans/ReadyPlanViewerModal';

const ItineraryBuilderModal = React.lazy(() =>
  import('../ItineraryBuilderModal').then((m) => ({ default: m.ItineraryBuilderModal }))
);
import {
  Search,
  Trash2,
  Eye,
  Route,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Compass,
} from 'lucide-react';

export const AdminReadyPlansTab: React.FC = () => {
  const {
    readyPlans,
    addReadyPlan,
    deleteReadyPlan,
    posts,
    municipalities,
    planCategories,
  } = useApp();

  const toTitleCase = (text: string): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/(^[a-záéíóúüñ]|[\s/–—(-][a-záéíóúüñ])/gi, (match) => match.toUpperCase());
  };

  const getCategoryLabel = (catId: string) => {
    if (!catId) return 'Sin categoría';

    // 1. Direct match with dynamic planCategories from "Tipos de Planes"
    const dynamic = planCategories.find(
      (c) => c.id.toLowerCase() === catId.toLowerCase() || c.slug === catId.toLowerCase()
    );
    if (dynamic) return toTitleCase(dynamic.name);

    // 2. Compatibility mapping
    if (catId === 'romance' || catId === 'plan_cita_romantica') {
      const romance = planCategories.find((c) => c.id === 'plan_cita_romantica');
      return romance ? toTitleCase(romance.name) : 'Cita Romántica / Pareja';
    }
    if (catId === 'gastronomia' || catId === 'parrilla' || catId === 'plan_comer_algo') {
      const comer = planCategories.find((c) => c.id === 'plan_comer_algo');
      return comer ? toTitleCase(comer.name) : 'Comer Algo';
    }
    if (catId === 'cafe' || catId === 'plan_tomar_algo') {
      const tomar = planCategories.find((c) => c.id === 'plan_tomar_algo');
      return tomar ? toTitleCase(tomar.name) : 'Tomar Algo';
    }
    if (catId === 'wellness' || catId === 'plan_cuidado_personal') {
      const spa = planCategories.find((c) => c.id === 'plan_cuidado_personal');
      return spa ? toTitleCase(spa.name) : 'Cuidado Personal';
    }
    if (catId === 'amigos' || catId === 'plan_con_amigos') {
      const amigos = planCategories.find((c) => c.id === 'plan_con_amigos');
      return amigos ? toTitleCase(amigos.name) : 'Plan Con Amigos';
    }
    if (catId === 'rumba' || catId === 'plan_noche_rumba') {
      const rumba = planCategories.find((c) => c.id === 'plan_noche_rumba');
      return rumba ? toTitleCase(rumba.name) : 'Noche De Rumba';
    }

    // 3. Fallback to READY_PLAN_CATEGORIES
    const staticObj = READY_PLAN_CATEGORIES.find((c) => c.id === catId);
    return toTitleCase(staticObj?.label || catId);
  };

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<SimulatedReadyPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<SimulatedReadyPlan | null>(null);

  // Search & Filter state (matching AdminPostsTab)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [sortBy, setSortBy] = useState<
    'default' | 'budget_desc' | 'budget_asc' | 'stops_desc' | 'title_asc'
  >('default');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedMunicipality !== 'all' ||
    selectedCategory !== 'all' ||
    budgetFilter !== 'all' ||
    sortBy !== 'default';

  const activeFiltersCount =
    (searchQuery.trim() !== '' ? 1 : 0) +
    (selectedMunicipality !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (budgetFilter !== 'all' ? 1 : 0) +
    (sortBy !== 'default' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedMunicipality('all');
    setSelectedCategory('all');
    setBudgetFilter('all');
    setSortBy('default');
  };

  // Filtered and sorted plans
  const filteredPlans = useMemo(() => {
    const result = readyPlans.filter((plan) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const planPosts = resolvePlanPosts(plan, posts);
        const stopsNames = planPosts.map((p) => (p.businessName || p.title).toLowerCase()).join(' ');

        const titleMatch = plan.planTitle.toLowerCase().includes(q);
        const muniMatch = (plan.municipality || '').toLowerCase().includes(q);
        const noteMatch = (plan.personalNote || '').toLowerCase().includes(q);
        const tagsMatch = plan.tags?.some((t) => t.toLowerCase().includes(q));
        const stopsMatch = stopsNames.includes(q);

        if (!titleMatch && !muniMatch && !noteMatch && !tagsMatch && !stopsMatch) {
          return false;
        }
      }

      // 2. Municipality
      if (selectedMunicipality !== 'all') {
        const pMuni = (plan.municipality || '').toLowerCase().trim();
        if (pMuni !== selectedMunicipality.toLowerCase().trim()) {
          return false;
        }
      }

      // 3. Category
      if (selectedCategory !== 'all') {
        const pCat = (plan.category || '').toLowerCase().trim();
        const selCat = selectedCategory.toLowerCase().trim();
        const matches =
          pCat === selCat ||
          (selCat === 'plan_cita_romantica' && pCat === 'romance') ||
          (selCat === 'romance' && pCat === 'plan_cita_romantica') ||
          (selCat === 'plan_comer_algo' && (pCat === 'gastronomia' || pCat === 'parrilla')) ||
          (selCat === 'plan_tomar_algo' && pCat === 'cafe') ||
          (selCat === 'plan_cuidado_personal' && pCat === 'wellness') ||
          (selCat === 'plan_con_amigos' && pCat === 'amigos') ||
          (selCat === 'plan_noche_rumba' && pCat === 'rumba');
        if (!matches) {
          return false;
        }
      }

      // 4. Budget filter
      if (budgetFilter === 'free' && plan.estimatedBudget > 0) {
        return false;
      } else if (budgetFilter === 'under_50k' && (plan.estimatedBudget <= 0 || plan.estimatedBudget > 50000)) {
        return false;
      } else if (
        budgetFilter === '50k_150k' &&
        (plan.estimatedBudget < 50000 || plan.estimatedBudget > 150000)
      ) {
        return false;
      } else if (budgetFilter === 'over_150k' && plan.estimatedBudget < 150000) {
        return false;
      }

      return true;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'budget_desc') {
        return (b.estimatedBudget || 0) - (a.estimatedBudget || 0);
      }
      if (sortBy === 'budget_asc') {
        return (a.estimatedBudget || 0) - (b.estimatedBudget || 0);
      }
      if (sortBy === 'stops_desc') {
        const aStops = a.stops?.length || 0;
        const bStops = b.stops?.length || 0;
        return bStops - aStops;
      }
      if (sortBy === 'title_asc') {
        return a.planTitle.localeCompare(b.planTitle);
      }
      return 0;
    });
  }, [readyPlans, searchQuery, selectedMunicipality, selectedCategory, budgetFilter, sortBy, posts]);

  const handleDeleteConfirmed = () => {
    if (planToDelete) {
      deleteReadyPlan(planToDelete.id);
      setPlanToDelete(null);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Search & Filter Header Bar matching AdminPostsTab */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Route className="w-5 h-5 text-[#007af7]" />
              <span>Gestión General de Itinerarios y Planes</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisa los itinerarios publicados, organiza paradas y rutas, o crea nuevos planes para los usuarios
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Botón Crear Nuevo Itinerario */}
            <button
              type="button"
              id="btn-admin-create-plan"
              onClick={() => setIsBuilderOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#007af7] hover:bg-blue-600 text-white shadow-xs transition active:scale-95 cursor-pointer"
              title="Crear un nuevo itinerario"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Itinerario</span>
            </button>

            {/* Botón de Filtros */}
            <button
              id="btn-admin-plans-filter-toggle"
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

            {/* Botón Limpiar Filtros */}
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

        {/* Panel Desplegable de Filtros igual a Publicaciones */}
        {isFiltersOpen && (
          <div className="space-y-3.5 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Fila 1: Búsqueda, Categoría y Municipio */}
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
                    placeholder="Título, paradas, dedicatoria..."
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
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Todas las categorías</option>
                  {planCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Municipio
                </label>
                <select
                  value={selectedMunicipality}
                  onChange={(e) => setSelectedMunicipality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Todos los municipios</option>
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 2: Ordenar y Presupuesto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100">
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
                  <option value="default">Orden por defecto</option>
                  <option value="budget_desc">Mayor presupuesto primero</option>
                  <option value="budget_asc">Menor presupuesto primero</option>
                  <option value="stops_desc">Más paradas primero</option>
                  <option value="title_asc">Nombre (A - Z)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span>Rango de Presupuesto</span>
                </label>
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Cualquier presupuesto</option>
                  <option value="free">Gratis / Sin costo ($0)</option>
                  <option value="under_50k">Menos de $50.000</option>
                  <option value="50k_150k">Entre $50.000 y $150.000</option>
                  <option value="over_150k">Más de $150.000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-normal text-slate-600">
              Mostrando <span className="text-blue-600 font-normal">{filteredPlans.length}</span> de{' '}
              <span className="text-slate-900 font-normal">{readyPlans.length}</span> itinerarios
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
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-normal text-slate-700">
                  Categoría: {toTitleCase(getCategoryLabel(selectedCategory))}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="hover:text-slate-900 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedMunicipality !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-normal text-slate-700">
                  Municipio: {toTitleCase(selectedMunicipality)}
                  <button
                    type="button"
                    onClick={() => setSelectedMunicipality('all')}
                    className="hover:text-slate-900 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {budgetFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-normal text-blue-800">
                  Presupuesto:{' '}
                  {budgetFilter === 'free'
                    ? 'Gratis'
                    : budgetFilter === 'under_50k'
                    ? '< $50k'
                    : budgetFilter === '50k_150k'
                    ? '$50k - $150k'
                    : '> $150k'}
                  <button
                    type="button"
                    onClick={() => setBudgetFilter('all')}
                    className="hover:text-blue-950 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy !== 'default' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-normal text-slate-700">
                  Orden:{' '}
                  {sortBy === 'budget_desc'
                    ? 'Mayor presupuesto'
                    : sortBy === 'budget_asc'
                    ? 'Menor presupuesto'
                    : sortBy === 'stops_desc'
                    ? 'Más paradas'
                    : 'Alfabético'}
                  <button
                    type="button"
                    onClick={() => setSortBy('default')}
                    className="hover:text-slate-900 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Plans List matching AdminPostsTab */}
      <div className="space-y-3">
        {filteredPlans.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <Compass className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">No se encontraron itinerarios con los filtros actuales.</p>
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
          filteredPlans.map((plan) => {
            const planPosts = resolvePlanPosts(plan, posts);
            const cover =
              plan.coverImage ||
              planPosts[0]?.imageUrl ||
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
            const catObj = READY_PLAN_CATEGORIES.find((c) => c.id === plan.category);

            return (
              <div
                key={plan.id}
                className="p-3.5 sm:p-4 rounded-2xl border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition overflow-hidden w-full bg-white border-slate-200 hover:border-blue-200"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full flex-1">
                  {/* Thumbnail matching post thumbnail */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                    <img
                      src={cover}
                      alt={plan.planTitle}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Badges line */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-md shrink-0 bg-orange-100 text-orange-800">
                        {toTitleCase(getCategoryLabel(plan.category))}
                      </span>
                      <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                        {toTitleCase('Activo en itinerarios')}
                      </span>
                      <span
                        className="text-[10px] font-normal text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md shrink-0 truncate max-w-[160px] sm:max-w-xs flex items-center gap-1"
                        title={plan.municipality || 'Sabana Centro'}
                      >
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{toTitleCase(plan.municipality || 'Sabana Centro')}</span>
                      </span>
                      <span className="text-[10px] font-normal text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                        <Route className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{planPosts.length} {toTitleCase(planPosts.length === 1 ? 'parada' : 'paradas')}</span>
                      </span>
                    </div>

                    {/* Title and dedication note */}
                    <h4
                      className="text-sm font-bold text-slate-900 truncate block mt-1 max-w-full"
                      title={plan.planTitle}
                    >
                      <span className="font-bold text-slate-900">{plan.planTitle}</span>
                      {plan.personalNote && (
                        <span className="text-slate-500 text-xs ml-1.5 italic font-normal">
                          — "{plan.personalNote}"
                        </span>
                      )}
                    </h4>

                    {/* Estimated budget */}
                    <div className="text-xs font-normal text-slate-700 mt-1">
                      {plan.estimatedBudget > 0
                        ? `$${plan.estimatedBudget.toLocaleString('es-CO')} COP · Presupuesto estimado`
                        : 'Presupuesto variable / libre'}
                    </div>

                    {/* Schedule & Stops Route preview */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                      {plan.scheduledTime && (
                        <>
                          <span
                            className="inline-flex items-center gap-1 text-slate-600 font-normal shrink-0"
                            title="Horario estimado"
                          >
                            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{plan.scheduledTime}</span>
                          </span>
                          <span className="text-slate-300">·</span>
                        </>
                      )}
                      <span className="inline-flex items-center gap-1 text-slate-600 font-normal shrink-0">
                        <Route className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-slate-500">Ruta:</span>
                        <span className="text-slate-700 font-normal truncate max-w-[280px] sm:max-w-md">
                          {planPosts.map((p) => p.businessName || p.title).join(' → ') || 'Comercios asociados'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions on right matching AdminPostsTab */}
                <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewPlan(plan)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer shrink-0 shadow-2xs"
                    title="Previsualizar cómo lo ven los usuarios"
                    aria-label={`Previsualizar plan ${plan.planTitle}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanToDelete(plan)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0 shadow-2xs"
                    title="Eliminar itinerario"
                    aria-label={`Eliminar itinerario ${plan.planTitle}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Plan Creator Builder Modal (Modo Admin) */}
      {isBuilderOpen && (
        <React.Suspense fallback={null}>
          <ItineraryBuilderModal
            isOpen={isBuilderOpen}
            onClose={() => setIsBuilderOpen(false)}
            initialMode="manual"
            isAdminCreation={true}
            onSaveAsReadyPlan={(newPlan) => {
              addReadyPlan(newPlan);
              setIsBuilderOpen(false);
            }}
          />
        </React.Suspense>
      )}

      {/* Ready Plan Viewer Modal */}
      {previewPlan && (
        <ReadyPlanViewerModal
          plan={previewPlan}
          posts={posts}
          currentCity={previewPlan.municipality || 'Cajicá'}
          onClose={() => setPreviewPlan(null)}
          onOpenItineraryBuilder={() => {
            setPreviewPlan(null);
            setIsBuilderOpen(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900">¿Eliminar este itinerario?</h3>
              <p className="text-xs text-slate-500">
                Se eliminará "{planToDelete.planTitle}". Los usuarios ya no podrán verlo en la sección de planes listos.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
