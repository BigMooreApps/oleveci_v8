import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Tag,
  Navigation,
  MapPin,
  ShoppingBag,
  ChevronDown,
  Compass,
  Clock,
  CheckCircle2,
  Route,
  Heart,
  Utensils,
  Coffee,
  Wine,
  Smile,
  Sparkles,
  PawPrint,
  Car,
  Sun,
  Calendar,
} from 'lucide-react';
import { ICON_MAP } from './CategoryChips';
import { getPostTypeIconComponent, isEmoji } from '../utils/postTypeIcons';

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Heart,
  Utensils,
  Coffee,
  Wine,
  Smile,
  Sparkles,
  PawPrint,
  Car,
  ShoppingBag,
  Sun,
  Calendar,
  Tag,
};

export const PLAN_TYPE_OPTIONS = [
  { id: 'all', label: 'Todos los tipos de planes', iconName: 'Compass', desc: 'Ver todos los itinerarios y planes' },
  { id: 'plan_cita_romantica', label: 'Cita Romántica / Pareja', iconName: 'Heart', desc: 'Cena íntima, copa de vino, velada especial' },
  { id: 'plan_comer_algo', label: 'Comer Algo Rico', iconName: 'Utensils', desc: 'Ruta gastronómica, parrilla o comida deli' },
  { id: 'plan_tomar_algo', label: 'Tomar Algo / Café', iconName: 'Coffee', desc: 'Cafeterías de especialidad, postres y charlas' },
  { id: 'plan_noche_rumba', label: 'Noche de Rumba & Fiesta', iconName: 'Wine', desc: 'Cocteles, música, bares y diversión nocturna' },
  { id: 'plan_con_amigos', label: 'Plan con Amigos', iconName: 'Smile', desc: 'Tardes de parches, juegos y buena compañía' },
  { id: 'plan_cuidado_personal', label: 'Cuidado Personal / Spa', iconName: 'Sparkles', desc: 'Bienestar, barbería, estética y relajación' },
  { id: 'plan_dia_con_ninos', label: 'Día en Familia / Niños', iconName: 'Smile', desc: 'Actividades recreativas y planes al aire libre' },
  { id: 'plan_consentir_mascotas', label: 'Consentir mis Mascotas', iconName: 'PawPrint', desc: 'Planes pet-friendly, veterinaria y grooming' },
  { id: 'plan_cuidar_la_nave', label: 'Cuidar la Nave (Autos/Motos)', iconName: 'Car', desc: 'Lavado, detailing y mantenimiento' },
  { id: 'plan_comprar_algo', label: 'Comprar Algo', iconName: 'ShoppingBag', desc: 'Moda, accesorios y compras locales' },
  { id: 'plan_relajarme_en_algun_lado', label: 'Relajarme en Algún Lado', iconName: 'Sun', desc: 'Tranquilidad, desconexión y naturaleza' },
  { id: 'plan_planes_eventos_cerca', label: 'Planes y Eventos Cerca', iconName: 'Calendar', desc: 'Conciertos, ferias y eventos comunitarios' },
];

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortOrder: 'recent' | 'distance' | 'price_low';
  onSortChange: (sort: 'recent' | 'distance' | 'price_low') => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  sortOrder,
  onSortChange,
}) => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedPlanType,
    setSelectedPlanType,
    activeFeedFilter,
    setActiveFeedFilter,
    sectors,
    municipalities,
    postTypes,
    currentSector,
    setCurrentSector,
    currentCity,
    setCurrentCity,
    maxPlanBudget,
    setMaxPlanBudget,
    posts,
    isPostActive,
    filteredPosts,
    requestUserLocation,
    userLocation,
    readyPlans,
  } = useApp();

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<
    'type' | 'category' | 'plan_type' | 'city' | 'sector' | 'sort' | null
  >(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Auto-reset if previously set to 'nearby'
  useEffect(() => {
    if (activeFeedFilter === 'nearby') {
      setActiveFeedFilter('today');
    }
  }, [activeFeedFilter, setActiveFeedFilter]);

  const activePosts = posts.filter(isPostActive);

  // Available unique cities - prioritizing municipalities list (alphabetically sorted)
  const cities: string[] = useMemo(() => {
    const list =
      municipalities && municipalities.length > 0
        ? municipalities.map((m) => m.name)
        : Array.from(new Set(sectors.map((s) => s.cityName)));
    return [...list].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [municipalities, sectors]);

  // Sectors/veredas strictly belonging to the currently selected municipality (alphabetically sorted)
  const citySectors = useMemo(() => {
    if (!currentCity || currentCity === 'all') {
      return [...sectors].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    }
    return sectors
      .filter((s) => s.cityName.toLowerCase() === currentCity.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [sectors, currentCity]);

  if (!isOpen) return null;

  // Dynamic filter tabs combining default helpers with all configured postTypes
  const dynamicTypeTabs = postTypes.map((pt) => {
    const icon = getPostTypeIconComponent(pt.iconName, pt.id);
    return {
      id: pt.id,
      label: pt.label,
      shortLabel: pt.label.split(' ')[0],
      icon,
      desc: pt.description,
    };
  });

  const filterTabs = [
    { id: 'today', label: 'Todo lo de hoy', shortLabel: 'Todo', icon: Compass, desc: 'Todas las publicaciones activas' },
    { id: 'itineraries', label: 'Solo Itinerarios y Planes', shortLabel: 'Itinerarios', icon: Route, desc: 'Rutas armadas con múltiples paradas' },
    ...dynamicTypeTabs,
  ];

  const currentTabObj = filterTabs.find((t) => t.id === activeFeedFilter) || filterTabs[0];
  const CurrentTabIcon = currentTabObj.icon;

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  const currentPlanTypeObj = PLAN_TYPE_OPTIONS.find((p) => p.id === selectedPlanType) || PLAN_TYPE_OPTIONS[0];
  const PlanTypeIcon = PLAN_ICONS[currentPlanTypeObj.iconName] || Sparkles;

  const sortOptions = [
    { id: 'recent', label: 'Más recientes', icon: Clock, desc: 'Lo último publicado' },
    { id: 'distance', label: 'Más cercanos', icon: Navigation, desc: 'Menor distancia GPS' },
    { id: 'price_low', label: 'Menor precio', icon: Tag, desc: 'Mejores ofertas primero' },
  ] as const;

  const currentSortObj = sortOptions.find((s) => s.id === sortOrder) || sortOptions[0];

  const handleClearAll = () => {
    setSelectedCategory('all');
    setSelectedPlanType('all');
    setActiveFeedFilter('today');
    setCurrentSector('all');
    setMaxPlanBudget(null);
    onSortChange('recent');
    setOpenDropdown(null);
  };

  const hasAnyFilter =
    selectedCategory !== 'all' ||
    selectedPlanType !== 'all' ||
    activeFeedFilter !== 'today' ||
    currentSector !== 'all' ||
    maxPlanBudget !== null ||
    sortOrder !== 'recent';

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedPlanType !== 'all' ? 1 : 0) +
    (activeFeedFilter !== 'today' ? 1 : 0) +
    (currentSector !== 'all' ? 1 : 0) +
    (maxPlanBudget !== null ? 1 : 0) +
    (sortOrder !== 'recent' ? 1 : 0);

  return (
    <div
      id="filter-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="filter-modal-dialog"
        ref={containerRef}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#007af7] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#041f5e]">Filtros de Búsqueda</h3>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#007af7] text-white text-[10px] font-black">
                    {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Explora de forma rápida y personalizada</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasAnyFilter && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Cerrar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content with Compact Dropdowns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin">
          {/* Active Chips Strip (compact visual feedback) */}
          {hasAnyFilter && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider shrink-0">Activos:</span>
              {activeFeedFilter !== 'today' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-[#007af7] font-bold border border-blue-200 shrink-0">
                  {currentTabObj.shortLabel}
                  <button onClick={() => setActiveFeedFilter('today')} className="hover:text-blue-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedPlanType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200 shrink-0">
                  {currentPlanTypeObj?.label}
                  <button onClick={() => setSelectedPlanType('all')} className="hover:text-rose-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shrink-0">
                  {currentCategoryObj?.name}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-indigo-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentSector !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200 shrink-0">
                  {currentSector}
                  <button onClick={() => setCurrentSector('all')} className="hover:text-amber-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {maxPlanBudget !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shrink-0">
                  Hasta ${maxPlanBudget.toLocaleString('es-CO')}
                  <button onClick={() => setMaxPlanBudget(null)} className="hover:text-emerald-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortOrder !== 'recent' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                  {currentSortObj.label}
                  <button onClick={() => onSortChange('recent')} className="hover:text-emerald-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* 1. TIPO DE CONTENIDO - Modern Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Tipo de Contenido
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                className={`w-full px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                  openDropdown === 'type'
                    ? 'border-[#007af7] ring-2 ring-blue-100 bg-white'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0">
                    <CurrentTabIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">{currentTabObj.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{currentTabObj.desc}</span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openDropdown === 'type' ? 'rotate-180 text-[#007af7]' : ''
                  }`}
                />
              </button>

              {openDropdown === 'type' && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                  {filterTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeFeedFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveFeedFilter(tab.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#007af7] text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold block truncate">{tab.label}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{tab.desc}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#007af7] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. TIPO DE PLAN / EXPERIENCIA (Cita Romántica, Plan con Amigos, etc.) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Tipo de Plan / Experiencia
              </label>
              {selectedPlanType !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedPlanType('all')}
                  className="text-[11px] text-[#007af7] font-bold hover:underline cursor-pointer"
                >
                  Ver todos los planes
                </button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'plan_type' ? null : 'plan_type')}
                className={`w-full px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                  openDropdown === 'plan_type'
                    ? 'border-rose-500 ring-2 ring-rose-100 bg-white'
                    : selectedPlanType !== 'all'
                    ? 'border-rose-200 bg-rose-50/50 text-rose-900'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedPlanType !== 'all' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <PlanTypeIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {currentPlanTypeObj?.label || 'Todos los tipos de planes'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {currentPlanTypeObj?.desc || 'Cita romántica, amigos, rumba, niños y más'}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openDropdown === 'plan_type' ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>

              {openDropdown === 'plan_type' && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                  {PLAN_TYPE_OPTIONS.map((opt) => {
                    const isSelected = selectedPlanType === opt.id;
                    const OptIcon = PLAN_ICONS[opt.iconName] || Sparkles;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlanType(opt.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 text-rose-900 font-bold border border-rose-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <OptIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <span className="text-xs truncate font-bold block">{opt.label}</span>
                            {opt.desc && (
                              <span className="text-[10px] text-slate-400 truncate block">
                                {opt.desc}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. CATEGORÍA DEL COMERCIO - Sleek Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Categoría del Comercio
              </label>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] text-[#007af7] font-bold hover:underline cursor-pointer"
                >
                  Ver todas
                </button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                className={`w-full px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                  openDropdown === 'category'
                    ? 'border-[#007af7] ring-2 ring-blue-100 bg-white'
                    : selectedCategory !== 'all'
                    ? 'border-blue-200 bg-blue-50/50 text-[#041f5e]'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedCategory !== 'all' ? 'bg-[#007af7] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {(() => {
                      if (selectedCategory !== 'all' && currentCategoryObj) {
                        if (isEmoji(currentCategoryObj.iconName)) {
                          return <span className="text-sm">{currentCategoryObj.iconName}</span>;
                        }
                        const CatIcon = ICON_MAP[currentCategoryObj.iconName] || Tag;
                        return <CatIcon className="w-3.5 h-3.5" />;
                      }
                      return <ShoppingBag className="w-3.5 h-3.5" />;
                    })()}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {selectedCategory === 'all'
                        ? `Todas las categorías (${categories.length})`
                        : currentCategoryObj?.name || 'Categoría seleccionada'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {selectedCategory === 'all'
                        ? `${activePosts.length} publicaciones disponibles`
                        : 'Rubro comercial seleccionado'}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openDropdown === 'category' ? 'rotate-180 text-[#007af7]' : ''
                  }`}
                />
              </button>

              {openDropdown === 'category' && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#007af7] flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold">Todas las categorías ({categories.length})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {activePosts.length}
                    </span>
                  </button>

                  {categories.map((cat) => {
                    const count = activePosts.filter((p) => p.categoryId === cat.id).length;
                    const isSelected = selectedCategory === cat.id;
                    const CatIcon = ICON_MAP[cat.iconName] || Tag;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#007af7] text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isEmoji(cat.iconName) ? (
                              <span className="text-sm">{cat.iconName}</span>
                            ) : (
                              <CatIcon className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className="text-xs truncate font-medium">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {count > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#007af7]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. UBICACIÓN - Municipio & Sector (2 Compact Side-by-Side Dropdowns) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Ubicación Geográfica
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Dropdown Municipio */}
              <div className="relative">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Municipio</span>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
                  className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                    openDropdown === 'city'
                      ? 'border-[#007af7] ring-2 ring-blue-100 bg-white'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#007af7] shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {currentCity === 'all' ? 'Todos los municipios' : currentCity}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openDropdown === 'city' ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'city' && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentCity('all');
                        setCurrentSector('all');
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        currentCity === 'all'
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-semibold">Todos los municipios</span>
                      {currentCity === 'all' && <Check className="w-3.5 h-3.5 text-[#007af7]" />}
                    </button>
                    {cities.map((city) => {
                      const isSelected = currentCity.toLowerCase() === city.toLowerCase();
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setCurrentCity(city);
                            setCurrentSector('all');
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs font-semibold">{city}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#007af7]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dropdown Sector / Vereda */}
              <div className="relative">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Vereda / Sector</span>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'sector' ? null : 'sector')}
                  className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                    openDropdown === 'sector'
                      ? 'border-[#007af7] ring-2 ring-blue-100 bg-white'
                      : currentSector !== 'all'
                      ? 'border-amber-200 bg-amber-50/50 text-amber-900'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {currentSector === 'all' ? `Todo ${currentCity}` : currentSector}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openDropdown === 'sector' ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'sector' && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-52 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSector('all');
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        currentSector === 'all'
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-semibold">Todo {currentCity}</span>
                      {currentSector === 'all' && <Check className="w-3.5 h-3.5 text-[#007af7]" />}
                    </button>

                    {citySectors.map((sec) => {
                      const isSelected = currentSector.toLowerCase() === sec.name.toLowerCase();
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            setCurrentSector(sec.name);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs truncate">{sec.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#007af7]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. PRESUPUESTO / PRECIO MÁXIMO */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Presupuesto / Precio Máximo
              </label>
              {maxPlanBudget !== null && (
                <button
                  type="button"
                  onClick={() => setMaxPlanBudget(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition cursor-pointer"
                >
                  Quitar límite
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { value: null, label: 'Cualquiera' },
                { value: 30000, label: '$30k' },
                { value: 50000, label: '$50k' },
                { value: 100000, label: '$100k' },
                { value: 150000, label: '$150k' },
                { value: 200000, label: '$200k' },
              ].map((opt) => {
                const isSelected = maxPlanBudget === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setMaxPlanBudget(opt.value)}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-black'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. CRITERIO DE ORDEN - Modern Segmented Tab Row */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Ordenar Resultados Por
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              {sortOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = sortOrder === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSortChange(opt.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#041f5e] shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with Live Results Count & Instant Apply */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-medium">
            {activeFeedFilter === 'itineraries' ? (
              <>
                <span className="font-bold text-[#041f5e]">{readyPlans.length}</span> itinerarios disponibles
              </>
            ) : (
              <>
                <span className="font-bold text-[#041f5e]">{filteredPosts.length}</span> publicaciones activas
              </>
            )}
          </div>
          <button
            id="btn-apply-filters"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#007af7] hover:bg-[#0066cc] text-white font-black text-xs shadow-md shadow-blue-500/20 transition active:scale-98 cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ver resultados</span>
          </button>
        </div>
      </div>
    </div>
  );
};

