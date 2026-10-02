import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronDown,
  Compass,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Heart,
  Utensils,
  Coffee,
  Flame,
  Wine,
  Sparkle,
  TreePine,
  PartyPopper,
  Navigation,
  DollarSign,
  Calendar,
  Clock,
} from 'lucide-react';
import { READY_PLAN_CATEGORIES, SimulatedReadyPlan } from '../data/readyPlansData';
import { PostTypeIconDisplay } from '../utils/postTypeIcons';

interface ReadyPlansFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedPlanType: string;
  onSelectPlanType: (typeId: string) => void;
  maxPlanBudget: number | null;
  onSelectMaxBudget: (budget: number | null) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  selectedSector: string;
  onSelectSector: (sector: string) => void;
  sortOrder: 'recent' | 'distance' | 'price_low';
  onSortChange: (sort: 'recent' | 'distance' | 'price_low') => void;
  filteredCount: number;
  totalPlansCount: number;
  allPlans: SimulatedReadyPlan[];
  onResetFilters: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  all: ShoppingBag,
  plan_cita_romantica: Heart,
  plan_consentir_mascotas: Heart,
  plan_comer_algo: Utensils,
  plan_tomar_algo: Coffee,
  plan_noche_rumba: Wine,
  plan_con_amigos: PartyPopper,
  plan_cuidado_personal: Sparkle,
  plan_dia_con_ninos: Sparkle,
  plan_cuidar_la_nave: Navigation,
  plan_comprar_algo: ShoppingBag,
  plan_relajarme_en_algun_lado: TreePine,
  plan_planes_eventos_cerca: Calendar,
  plan_tramites: CheckCircle2,
  plan_otros: Compass,
  romance: Heart,
  gastronomia: Utensils,
  cafe: Coffee,
  parrilla: Flame,
  amigos: Wine,
  wellness: Sparkle,
  naturaleza: TreePine,
  rumba: PartyPopper,
};

export const ReadyPlansFilterModal: React.FC<ReadyPlansFilterModalProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedPlanType,
  onSelectPlanType,
  maxPlanBudget,
  onSelectMaxBudget,
  selectedCity,
  onSelectCity,
  selectedSector,
  onSelectSector,
  sortOrder,
  onSortChange,
  filteredCount,
  allPlans,
  onResetFilters,
}) => {
  const { sectors, municipalities, requestUserLocation, userLocation, planCategories } = useApp();

  // Dynamic active plan categories created in "Tipos de Planes"
  const activePlanCategories = useMemo(() => {
    return (planCategories || []).filter((c) => c.isActive !== false);
  }, [planCategories]);

  // Find romance category configured in "Tipos de Planes"
  const romancePlanCategory = useMemo(() => {
    return (
      activePlanCategories.find(
        (c) =>
          c.id === 'plan_cita_romantica' ||
          c.id === 'romance' ||
          c.slug?.includes('romantica') ||
          c.name.toLowerCase().includes('cita') ||
          c.name.toLowerCase().includes('romant')
      ) || null
    );
  }, [activePlanCategories]);

  // Helper for Category Label
  const getCategoryLabel = (catId: string) => {
    if (!catId || catId === 'all') return `Todas las categorías (${activePlanCategories.length})`;
    const dynamic = activePlanCategories.find(
      (c) => c.id.toLowerCase() === catId.toLowerCase() || c.slug === catId.toLowerCase()
    );
    if (dynamic) return dynamic.name;
    if (catId === 'romance' || catId === 'plan_cita_romantica') {
      return romancePlanCategory?.name || 'Cita Romántica / Pareja';
    }
    const staticObj = READY_PLAN_CATEGORIES.find((c) => c.id === catId);
    return staticObj?.label || catId;
  };

  // Dropdown open states: 'type' | 'category' | 'city' | 'sector' | null
  const [openDropdown, setOpenDropdown] = useState<'type' | 'category' | 'city' | 'sector' | null>(null);

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

  // Cities from municipalities list or fallback
  const cities: string[] = useMemo(() => {
    const list =
      municipalities && municipalities.length > 0
        ? municipalities.map((m) => m.name)
        : Array.from(new Set(sectors.map((s) => s.cityName)));
    const unique = Array.from(new Set(['Cajicá', 'Chía', ...list]));
    return unique.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [municipalities, sectors]);

  // Sectors for selected city
  const citySectors = useMemo(() => {
    if (selectedCity === 'all') return [];
    return sectors
      .filter((s) => s.cityName.toLowerCase() === selectedCity.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [sectors, selectedCity]);

  if (!isOpen) return null;

  // Plan Type / Momento options (aligned with dynamic "Tipos de Planes")
  const planTypeOptions = [
    {
      id: 'all',
      label: 'Todos los momentos',
      desc: 'Cualquier momento o salida',
      icon: Compass,
    },
    {
      id: 'weekend',
      label: 'Fin de semana',
      desc: 'Sábados y Domingos recomendados',
      icon: Calendar,
    },
    {
      id: 'weekday',
      label: 'Entre semana',
      desc: 'Planes de tarde y noche de Lun a Vie',
      icon: Clock,
    },
    {
      id: 'romance',
      label: romancePlanCategory?.name || 'Cita Romántica / Pareja',
      desc: romancePlanCategory?.subtitle || 'Experiencias especiales en pareja',
      icon: Heart,
    },
    {
      id: 'night',
      label: 'Noche & Rumba',
      desc: 'Cócteles, amigos y música',
      icon: PartyPopper,
    },
  ];

  const planBudgetOptions = [
    { value: null, label: 'Cualquiera' },
    { value: 30000, label: '$30k' },
    { value: 50000, label: '$50k' },
    { value: 100000, label: '$100k' },
    { value: 150000, label: '$150k' },
    { value: 200000, label: '$200k' },
  ];

  const currentTypeObj = planTypeOptions.find((t) => t.id === selectedPlanType) || planTypeOptions[0];
  const CurrentTypeIcon = currentTypeObj.icon;

  const currentCategoryName = getCategoryLabel(selectedCategory);
  const currentCategoryItem = activePlanCategories.find((c) => c.id === selectedCategory);

  const sortOptions = [
    { id: 'recent', label: 'Más recientes', icon: Clock },
    { id: 'distance', label: 'Más cercanos', icon: Navigation },
    { id: 'price_low', label: 'Menor presupuesto', icon: DollarSign },
  ] as const;

  const hasAnyFilter =
    selectedCategory !== 'all' ||
    selectedPlanType !== 'all' ||
    maxPlanBudget !== null ||
    selectedCity !== 'all' ||
    selectedSector !== 'all' ||
    sortOrder !== 'recent';

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedPlanType !== 'all' ? 1 : 0) +
    (maxPlanBudget !== null ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0) +
    (selectedSector !== 'all' ? 1 : 0) +
    (sortOrder !== 'recent' ? 1 : 0);

  return (
    <div
      id="ready-plans-filter-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="ready-plans-filter-modal-dialog"
        ref={containerRef}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#041f5e] tracking-tight">
                  Filtros de Itinerarios Listos
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#007af7] text-white text-[10px] font-black">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Encuentra salidas e itinerarios a tu medida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasAnyFilter && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
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

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {/* 1. MOMENTO / TIPO DE SALIDA */}
          <div className={`space-y-1.5 relative ${openDropdown === 'type' ? 'z-40' : 'z-10'}`}>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Momento / Tipo de Salida
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                className={`w-full px-3.5 py-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                  openDropdown === 'type'
                    ? 'border-[#007af7] ring-2 ring-blue-100 bg-white'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-[#007af7] flex items-center justify-center shrink-0">
                    <CurrentTypeIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">
                      {currentTypeObj.label}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {currentTypeObj.desc}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openDropdown === 'type' ? 'rotate-180 text-[#007af7]' : ''
                  }`}
                />
              </button>

              {openDropdown === 'type' && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                  {planTypeOptions.map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = selectedPlanType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          onSelectPlanType(tab.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
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

          {/* 2. CATEGORÍA DEL PLAN */}
          <div className={`space-y-1.5 relative ${openDropdown === 'category' ? 'z-40' : 'z-10'}`}>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Categoría del Plan
              </label>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
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
                className={`w-full px-3.5 py-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                  openDropdown === 'category'
                    ? 'border-[#007af7] ring-2 ring-blue-100 bg-white'
                    : selectedCategory !== 'all'
                    ? 'border-blue-200 bg-blue-50/50 text-[#041f5e]'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedCategory !== 'all'
                        ? 'bg-[#007af7] text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {selectedCategory !== 'all' ? (
                      <PostTypeIconDisplay
                        iconName={currentCategoryItem?.iconName || 'Heart'}
                        className="w-4 h-4"
                      />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </div>
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate">
                      {selectedCategory === 'all'
                        ? `Todas las categorías (${activePlanCategories.length})`
                        : currentCategoryName}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {selectedCategory === 'all'
                        ? `${allPlans.length} itinerarios listos disponibles`
                        : 'Categoría filtrada'}
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
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory('all');
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
                      <span className="text-xs font-bold">
                        Todas las categorías ({activePlanCategories.length})
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                      {allPlans.length}
                    </span>
                  </button>

                  {activePlanCategories.map((cat) => {
                    const count = allPlans.filter((p) => {
                      const pCat = (p.category || '').toLowerCase();
                      const cId = cat.id.toLowerCase();
                      if (pCat === cId) return true;
                      if (
                        (cId === 'plan_cita_romantica' || cId === 'romance') &&
                        (pCat === 'romance' || pCat === 'plan_cita_romantica' || p.tags?.some((t) => t.toLowerCase().includes('romance') || t.toLowerCase().includes('pareja')))
                      ) return true;
                      if (cId === 'plan_comer_algo' && (pCat === 'gastronomia' || pCat === 'parrilla' || pCat === 'plan_comer_algo')) return true;
                      if (cId === 'plan_tomar_algo' && (pCat === 'cafe' || pCat === 'plan_tomar_algo')) return true;
                      if (cId === 'plan_cuidado_personal' && (pCat === 'wellness' || pCat === 'plan_cuidado_personal')) return true;
                      if (cId === 'plan_con_amigos' && (pCat === 'amigos' || pCat === 'plan_con_amigos')) return true;
                      if (cId === 'plan_noche_rumba' && (pCat === 'rumba' || pCat === 'plan_noche_rumba')) return true;
                      return false;
                    }).length;
                    const isSelected = selectedCategory === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onSelectCategory(cat.id);
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
                              isSelected
                                ? 'bg-[#007af7] text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <PostTypeIconDisplay iconName={cat.iconName} className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs truncate font-medium">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {count > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                isSelected
                                  ? 'bg-blue-200 text-blue-900'
                                  : 'bg-slate-100 text-slate-500'
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

          {/* 3. PRESUPUESTO / PRECIO MÁXIMO */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                Presupuesto / Precio Máximo
              </label>
              {maxPlanBudget !== null && (
                <button
                  type="button"
                  onClick={() => onSelectMaxBudget(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition cursor-pointer"
                >
                  Quitar límite
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {planBudgetOptions.map((opt) => {
                const isSelected = maxPlanBudget === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => onSelectMaxBudget(opt.value)}
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

          {/* 4. UBICACIÓN GEOGRÁFICA (Municipio & Vereda/Sector) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Ubicación Geográfica
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Dropdown Municipio */}
              <div className={`relative ${openDropdown === 'city' ? 'z-40' : 'z-10'}`}>
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  Municipio
                </span>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'city' ? null : 'city')}
                  className={`w-full px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                    openDropdown === 'city'
                      ? 'border-[#007af7] ring-2 ring-blue-100 bg-white'
                      : selectedCity !== 'all'
                      ? 'border-blue-200 bg-blue-50/40 text-blue-950 font-bold'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#007af7] shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {selectedCity === 'all' ? 'Todos los municipios' : selectedCity}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openDropdown === 'city' ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'city' && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-52 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCity('all');
                        onSelectSector('all');
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        selectedCity === 'all'
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-semibold">Todos los municipios</span>
                      {selectedCity === 'all' && <Check className="w-3.5 h-3.5 text-[#007af7]" />}
                    </button>
                    {cities.map((city) => {
                      const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            onSelectCity(city);
                            onSelectSector('all');
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

              {/* Dropdown Vereda / Sector */}
              <div className={`relative ${openDropdown === 'sector' ? 'z-40' : 'z-10'}`}>
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  Vereda / Sector
                </span>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'sector' ? null : 'sector')}
                  className={`w-full px-3 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                    openDropdown === 'sector'
                      ? 'border-[#007af7] ring-2 ring-blue-100 bg-white'
                      : selectedSector !== 'all'
                      ? 'border-amber-200 bg-amber-50/50 text-amber-900 font-bold'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {selectedSector === 'all'
                        ? selectedCity === 'all'
                          ? 'Todo el sector'
                          : `Todo ${selectedCity}`
                        : selectedSector}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openDropdown === 'sector' ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'sector' && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-52 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSector('all');
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        selectedSector === 'all'
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {selectedCity === 'all' ? 'Todo el sector' : `Todo ${selectedCity}`}
                      </span>
                      {selectedSector === 'all' && <Check className="w-3.5 h-3.5 text-[#007af7]" />}
                    </button>

                    {citySectors.map((sec) => {
                      const isSelected = selectedSector.toLowerCase() === sec.name.toLowerCase();
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            onSelectSector(sec.name);
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

          {/* 5. ORDENAR PLANES POR */}
          <div className="space-y-1.5 pt-0.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Ordenar Planes Por
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              {sortOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = sortOrder === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (opt.id === 'distance' && !userLocation) {
                        requestUserLocation();
                      }
                      onSortChange(opt.id);
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer ${
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

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-medium">
            <span className="font-extrabold text-[#041f5e] text-sm">{filteredCount}</span>{' '}
            itinerarios listos encontrados
          </div>
          <button
            id="btn-apply-ready-plans-filters"
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#007af7] hover:bg-[#0066cc] text-white font-black text-xs shadow-md shadow-blue-500/20 transition active:scale-98 cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ver resultados</span>
          </button>
        </div>
      </div>
    </div>
  );
};
