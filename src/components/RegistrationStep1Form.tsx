import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Store,
  Receipt,
  MapPin,
  ChevronDown,
  Search,
  Check,
  AlertCircle,
  Map as MapIcon,
  Camera,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { ScheduleSelector } from './ScheduleSelector';
import { Category } from '../types';

export interface RegistrationStep1FormProps {
  // Business fields
  bizName: string;
  onBizNameChange: (val: string) => void;
  bizSubCategory: string;
  setBizSubCategory: (val: string) => void;
  bizCategoryId: string;
  onCategorySelect: (catId: string) => void;
  categories: Category[];
  bizDescription: string;
  setBizDescription: (val: string) => void;

  // Location & Contact
  bizCity: string;
  onCityChange: (city: string) => void;
  availableCities: string[];
  bizSector: string;
  setBizSector: (sec: string) => void;
  availableSectors: string[];
  bizAddress: string;
  onBizAddressChange: (val: string) => void;
  onOpenMapPicker: () => void;
  bizWhatsapp: string;
  setBizWhatsapp: (val: string) => void;
  bizPhone: string;
  setBizPhone: (val: string) => void;
  bizEmail?: string;
  setBizEmail?: (val: string) => void;

  // Schedule
  bizHours: string;
  setBizHours: (hours: string) => void;

  // Visual Media
  bizLogoUrl: string;
  bizCoverUrl: string;
  onOpenImageModal: (type: 'banner' | 'logo') => void;

  // Billing fields
  billingLegalName: string;
  setBillingLegalName: (val: string) => void;
  billingDocType: 'NIT' | 'CC' | 'CE';
  setBillingDocType: (type: 'NIT' | 'CC' | 'CE') => void;
  billingDocNumber: string;
  setBillingDocNumber: (val: string) => void;
  billingVerificationDigit: string;
  setBillingVerificationDigit: (val: string) => void;
  billingEmail: string;
  setBillingEmail: (val: string) => void;
  billingPhone: string;
  setBillingPhone: (val: string) => void;
  billingAddress: string;
  setBillingAddress: (val: string) => void;
  billingCity: string;
  setBillingCity: (val: string) => void;
  billingTaxRegime: 'simplificado' | 'comun';
  setBillingTaxRegime: (val: 'simplificado' | 'comun') => void;
  useSameAddress: boolean;
  setUseSameAddress: (val: boolean) => void;

  // Accordion open/close states
  isMainInfoOpen: boolean;
  setIsMainInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLocationContactOpen: boolean;
  setIsLocationContactOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isBillingOpen: boolean;
  setIsBillingOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Errors & Navigation
  formErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  backButtonLabel?: string;
  submitButtonLabel?: string;
  stepTitle?: string;
  stepSubtitle?: string;
}

export const RegistrationStep1Form: React.FC<RegistrationStep1FormProps> = ({
  bizName,
  onBizNameChange,
  bizSubCategory,
  setBizSubCategory,
  bizCategoryId,
  onCategorySelect,
  categories,
  bizDescription,
  setBizDescription,
  bizCity,
  onCityChange,
  availableCities,
  bizSector,
  setBizSector,
  availableSectors,
  bizAddress,
  onBizAddressChange,
  onOpenMapPicker,
  bizWhatsapp,
  setBizWhatsapp,
  bizPhone,
  setBizPhone,
  bizEmail = '',
  setBizEmail,
  bizHours,
  setBizHours,
  bizLogoUrl,
  bizCoverUrl,
  onOpenImageModal,
  billingLegalName,
  setBillingLegalName,
  billingDocType,
  setBillingDocType,
  billingDocNumber,
  setBillingDocNumber,
  billingVerificationDigit,
  setBillingVerificationDigit,
  billingEmail,
  setBillingEmail,
  billingPhone,
  setBillingPhone,
  billingAddress,
  setBillingAddress,
  billingCity,
  setBillingCity,
  billingTaxRegime,
  setBillingTaxRegime,
  useSameAddress,
  setUseSameAddress,
  isMainInfoOpen,
  setIsMainInfoOpen,
  isLocationContactOpen,
  setIsLocationContactOpen,
  isBillingOpen,
  setIsBillingOpen,
  formErrors,
  onSubmit,
  onCancel,
  backButtonLabel = 'Cancelar',
  submitButtonLabel = 'Continuar a Pago',
  stepTitle,
  stepSubtitle,
}) => {
  // Dropdowns state
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  const catDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(e.target as Node)) {
        setIsSectorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === bizCategoryId) || categories[0];
  }, [categories, bizCategoryId]);

  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const q = catSearch.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, catSearch]);

  return (
    <div className="space-y-4">
      {/* Header Visual Live Banner (Identical layout to BusinessDashboard) */}
      <div className="relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-sm bg-slate-900">
        <img
          src={bizCoverUrl}
          alt={bizName || 'Portada del comercio'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />

        {/* Top-right quick actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 shadow-xs backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-amber-900" />
            <span>Vista en vivo</span>
          </span>
          <button
            type="button"
            id="btn-reg-edit-cover"
            onClick={() => onOpenImageModal('banner')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/25 shadow-sm transition hover:scale-102 active:scale-98 cursor-pointer"
            title="Cambiar foto de portada o banner"
          >
            <Camera className="w-3.5 h-3.5 text-blue-300" />
            <span>Cambiar Portada</span>
          </button>
        </div>

        {/* Bottom bar with logo and live preview info */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo with quick edit badge */}
            <div className="relative group/logo shrink-0">
              {bizLogoUrl ? (
                <img
                  src={bizLogoUrl}
                  alt={bizName || 'Logo'}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-contain border-2 border-white/80 shadow-md bg-transparent shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold border-2 border-white shadow-md">
                  {(bizName || 'ON').slice(0, 2).toUpperCase()}
                </div>
              )}
              {/* Hover overlay on desktop */}
              <button
                type="button"
                onClick={() => onOpenImageModal('logo')}
                className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition duration-150 backdrop-blur-xs text-white cursor-pointer"
                title="Cambiar logotipo"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-bold">Cambiar</span>
              </button>
              {/* Camera badge on mobile */}
              <button
                type="button"
                onClick={() => onOpenImageModal('logo')}
                className="sm:hidden absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#007af7] hover:bg-[#0068d6] text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition"
                title="Cambiar logotipo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold drop-shadow-xs truncate">
                  {bizName.trim() || 'Nombre de tu negocio'}
                </h3>
                <button
                  type="button"
                  onClick={() => onOpenImageModal('logo')}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-200 hover:text-white underline underline-offset-2 cursor-pointer shrink-0"
                >
                  Cambiar logo
                </button>
              </div>
              <p className="text-xs text-blue-100 font-medium truncate">
                <span className="font-bold text-white drop-shadow-2xs">
                  {bizSubCategory.trim() || selectedCategory?.name || 'Comercio Local'}
                </span>{' '}
                · {bizSector}, {bizCity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form with 4 Collapsible Accordion Cards */}
      <form onSubmit={onSubmit} className="space-y-4">
        {/* ================================================================= */}
        {/* DESPLEGABLE 1: INFORMACIÓN PRINCIPAL */}
        {/* ================================================================= */}
        <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-[0_2px_14px_rgba(4,31,94,0.04)] hover:border-slate-300/80 transition-all p-3.5 sm:p-4 space-y-3">
          <button
            type="button"
            id="reg-main-info-toggle"
            onClick={() => setIsMainInfoOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#041f5e] group-hover:text-[#007af7] transition">
                Información principal
              </h4>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isMainInfoOpen ? 'rotate-180 text-[#007af7]' : ''
                }`}
              />
            </div>
          </button>

          {isMainInfoOpen && (
            <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
              {/* Nombre Comercial */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Nombre Comercial del Establecimiento *
                </label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => onBizNameChange(e.target.value)}
                  placeholder="Ej: Panadería & Pastelería La Sabana"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition shadow-2xs ${
                    formErrors.bizName
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-slate-200/90 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 focus:outline-hidden'
                  }`}
                />
                {formErrors.bizName && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.bizName}</span>
                  </p>
                )}
              </div>

              {/* Especialidad & Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Especialidad / Subcategoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={bizSubCategory}
                    onChange={(e) => setBizSubCategory(e.target.value)}
                    placeholder="Ej: Panes artesanales, café y desayunos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Categoría Comercial *
                  </label>
                  <div ref={catDropdownRef} className="relative">
                    <button
                      type="button"
                      id="reg-category-dropdown-trigger"
                      onClick={() => setIsCatDropdownOpen((prev) => !prev)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all shadow-2xs cursor-pointer ${
                        isCatDropdownOpen
                          ? 'border-[#007af7] ring-4 ring-[#007af7]/15 bg-white'
                          : 'border-slate-200/90 hover:border-[#007af7]/60 bg-[#F8FAFD] hover:bg-[#F3F7FC]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {selectedCategory?.name || 'Selecciona una categoría'}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isCatDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                        }`}
                      />
                    </button>

                    {isCatDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2 space-y-2">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            value={catSearch}
                            onChange={(e) => setCatSearch(e.target.value)}
                            placeholder="Buscar categoría..."
                            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-[#007af7]"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-0.5">
                          {filteredCategories.map((c) => {
                            const isSelected = bizCategoryId === c.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  onCategorySelect(c.id);
                                  setIsCatDropdownOpen(false);
                                }}
                                className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate">{c.name}</span>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Descripción del Comercio */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Descripción del Comercio
                </label>
                <textarea
                  rows={2}
                  value={bizDescription}
                  onChange={(e) => setBizDescription(e.target.value)}
                  placeholder="Describe brevemente qué productos o servicios ofreces a los vecinos de la Sabana..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 transition-all shadow-2xs resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* DESPLEGABLE 2: UBICACIÓN Y CONTACTO */}
        {/* ================================================================= */}
        <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-[0_2px_14px_rgba(4,31,94,0.04)] hover:border-slate-300/80 transition-all p-3.5 sm:p-4 space-y-3">
          <button
            type="button"
            id="reg-location-contact-toggle"
            onClick={() => setIsLocationContactOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#041f5e] group-hover:text-[#007af7] transition">
                Ubicación y contacto
              </h4>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isLocationContactOpen ? 'rotate-180 text-[#007af7]' : ''
                }`}
              />
            </div>
          </button>

          {isLocationContactOpen && (
            <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
              {/* Municipio & Barrio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Municipio */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Municipio
                  </label>
                  <div ref={cityDropdownRef} className="relative">
                    <button
                      type="button"
                      id="reg-city-dropdown-trigger"
                      onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all shadow-2xs cursor-pointer ${
                        isCityDropdownOpen
                          ? 'border-[#007af7] ring-4 ring-[#007af7]/15 bg-white'
                          : 'border-slate-200/90 hover:border-[#007af7]/60 bg-[#F8FAFD] hover:bg-[#F3F7FC]'
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-800 truncate">{bizCity}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isCityDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                        }`}
                      />
                    </button>

                    {isCityDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1">
                        {availableCities.map((city) => {
                          const isSelected = bizCity === city;
                          return (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                onCityChange(city);
                                setIsCityDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="font-bold">{city}</span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Barrio / Sector */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Barrio / Sector
                  </label>
                  <div ref={sectorDropdownRef} className="relative">
                    <button
                      type="button"
                      id="reg-sector-dropdown-trigger"
                      onClick={() => setIsSectorDropdownOpen((prev) => !prev)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all shadow-2xs cursor-pointer ${
                        isSectorDropdownOpen
                          ? 'border-[#007af7] ring-4 ring-[#007af7]/15 bg-white'
                          : 'border-slate-200/90 hover:border-[#007af7]/60 bg-[#F8FAFD] hover:bg-[#F3F7FC]'
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-800 truncate">{bizSector}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isSectorDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                        }`}
                      />
                    </button>

                    {isSectorDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1 max-h-52 overflow-y-auto">
                        {availableSectors.map((sec) => {
                          const isSelected = bizSector === sec;
                          return (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => {
                                setBizSector(sec);
                                setIsSectorDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="font-bold">{sec}</span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dirección Física con botón Seleccionar en el Mapa */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Dirección Física del Local o Sede *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={bizAddress}
                    onChange={(e) => onBizAddressChange(e.target.value)}
                    placeholder="Ej: Cra. 3 # 4-28, Frente al Parque de la Estación"
                    className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs ${
                      formErrors.bizAddress
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                        : 'border-slate-200/90 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-hidden'
                    }`}
                  />
                  <button
                    type="button"
                    id="btn-open-map-picker-reg"
                    onClick={onOpenMapPicker}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2.5 rounded-xl transition cursor-pointer border border-emerald-200/80 shrink-0 shadow-2xs"
                    title="Abrir mapa interactivo para marcar el local y autocompletar la dirección"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seleccionar en el Mapa</span>
                  </button>
                </div>
                {formErrors.bizAddress && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.bizAddress}</span>
                  </p>
                )}
              </div>

              {/* Teléfonos: WhatsApp y Línea fija */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    WhatsApp de Atención *
                  </label>
                  <div
                    className={`flex rounded-xl border bg-[#F8FAFD] overflow-hidden shadow-2xs transition-all ${
                      formErrors.bizWhatsapp
                        ? 'border-red-400 ring-2 ring-red-100'
                        : 'border-slate-200/90 focus-within:bg-white focus-within:border-[#007af7] focus-within:ring-4 focus-within:ring-blue-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 px-3 bg-slate-200/50 border-r border-slate-200/80 text-slate-700 text-xs font-bold select-none shrink-0">
                      <span className="text-sm leading-none">🇨🇴</span>
                      <span>+57</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={bizWhatsapp}
                      onChange={(e) => setBizWhatsapp(e.target.value.replace(/[^0-9]/g, '').slice(-10))}
                      placeholder="312 456 7890"
                      className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-transparent focus:outline-hidden"
                    />
                  </div>
                  {formErrors.bizWhatsapp ? (
                    <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formErrors.bizWhatsapp}</span>
                    </p>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Digita tu número móvil de 10 dígitos para recibir mensajes directos de clientes.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Teléfono / Línea fija adicional
                  </label>
                  <input
                    type="text"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    placeholder="Ej: 601 866 1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Correo Electrónico de Contacto del Negocio */}
              {setBizEmail && (
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Correo Electrónico del Negocio (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={bizEmail}
                      onChange={(e) => setBizEmail(e.target.value)}
                      placeholder="contacto@tunegocio.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 transition-all shadow-2xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Dirección de correo visible para consultas de clientes y solicitudes formales.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* DESPLEGABLE 3: HORARIO DE ATENCIÓN (SCHEDULE SELECTOR) */}
        {/* ================================================================= */}
        <ScheduleSelector value={bizHours} onChange={setBizHours} />

        {/* ================================================================= */}
        {/* DESPLEGABLE 4: DATOS DE FACTURACIÓN (DIAN FACTURA ELECTRÓNICA) */}
        {/* ================================================================= */}
        <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-[0_2px_14px_rgba(4,31,94,0.04)] hover:border-slate-300/80 transition-all p-3.5 sm:p-4 space-y-3">
          <button
            type="button"
            id="reg-billing-info-toggle"
            onClick={() => setIsBillingOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#041f5e] group-hover:text-[#007af7] transition">
                Datos de facturación
              </h4>
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isBillingOpen ? 'rotate-180 text-[#007af7]' : ''
                }`}
              />
            </div>
          </button>

          {isBillingOpen && (
            <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
              {/* Razón Social o Titular */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Razón Social o Nombre del Titular *
                </label>
                <input
                  type="text"
                  required
                  value={billingLegalName}
                  onChange={(e) => setBillingLegalName(e.target.value)}
                  placeholder="Ej: Inversiones Sabana Centro S.A.S o Carlos Ramírez"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs ${
                    formErrors.billingLegalName
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-slate-200/90 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 focus:outline-hidden'
                  }`}
                />
                {formErrors.billingLegalName && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.billingLegalName}</span>
                  </p>
                )}
              </div>

              {/* Document Type & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    value={billingDocType}
                    onChange={(e) => setBillingDocType(e.target.value as 'NIT' | 'CC' | 'CE')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white shadow-2xs cursor-pointer transition-all"
                  >
                    <option value="NIT">NIT (Empresa / Persona Jurídica)</option>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                  </select>
                </div>

                {billingDocType === 'NIT' ? (
                  <div className="sm:col-span-2 flex items-start gap-2.5">
                    <div className="flex-1 min-w-0">
                      <label className="block font-bold text-slate-700 text-xs mb-1">
                        Número de Documento *
                      </label>
                      <input
                        type="text"
                        required
                        value={billingDocNumber}
                        onChange={(e) => setBillingDocNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Ej: 901234567"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs ${
                          formErrors.billingDocNumber
                            ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                            : 'border-slate-200/90 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 focus:outline-hidden'
                        }`}
                      />
                      {formErrors.billingDocNumber && (
                        <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{formErrors.billingDocNumber}</span>
                        </p>
                      )}
                    </div>

                    <div className="w-22 sm:w-24 shrink-0">
                      <label className="block font-bold text-slate-700 text-xs mb-1 text-center whitespace-nowrap">
                        Dígito (DV) *
                      </label>
                      <input
                        type="text"
                        maxLength={1}
                        value={billingVerificationDigit}
                        onChange={(e) =>
                          setBillingVerificationDigit(e.target.value.replace(/[^0-9]/g, ''))
                        }
                        placeholder="1"
                        className="w-full px-2 py-2.5 rounded-xl border border-slate-200/90 text-center font-bold text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white shadow-2xs focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 transition-all"
                        title="Dígito de Verificación"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      required
                      value={billingDocNumber}
                      onChange={(e) => setBillingDocNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Ej: 1012345678"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs ${
                        formErrors.billingDocNumber
                          ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                          : 'border-slate-200/90 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 focus:outline-hidden'
                      }`}
                    />
                    {formErrors.billingDocNumber && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{formErrors.billingDocNumber}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Correo para Factura Electrónica *
                  </label>
                  <input
                    type="email"
                    required
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="facturacion@tunegocio.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs ${
                      formErrors.billingEmail
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                        : 'border-slate-200/90 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 focus:outline-hidden'
                    }`}
                  />
                  {formErrors.billingEmail && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formErrors.billingEmail}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Teléfono de Contacto Fiscal
                  </label>
                  <input
                    type="tel"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    placeholder="Ej: 312 456 7890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Dirección Fiscal con checkbox de sincronización */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 text-xs">Dirección Fiscal *</label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSameAddress}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUseSameAddress(checked);
                        if (checked) {
                          setBillingAddress(bizAddress);
                          setBillingCity(bizCity);
                        }
                      }}
                      className="w-3.5 h-3.5 rounded text-[#007af7] focus:ring-[#007af7]"
                    />
                    <span className="text-[11px] font-medium">Misma dirección del local</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Dirección fiscal registrada en el RUT"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs ${
                    formErrors.billingAddress
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-slate-200/90 focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 focus:outline-hidden'
                  }`}
                />
                {formErrors.billingAddress && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{formErrors.billingAddress}</span>
                  </p>
                )}
              </div>

              {/* Municipio Fiscal & Régimen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Municipio / Ciudad Fiscal
                  </label>
                  <input
                    type="text"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    placeholder="Ej: Cajicá, Cundinamarca"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Régimen Tributario
                  </label>
                  <select
                    value={billingTaxRegime}
                    onChange={(e) => setBillingTaxRegime(e.target.value as 'simplificado' | 'comun')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white shadow-2xs cursor-pointer transition-all"
                  >
                    <option value="simplificado">Régimen Simplificado (No responsable de IVA)</option>
                    <option value="comun">Régimen Común (Responsable de IVA 19%)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backButtonLabel}</span>
          </button>

          <button
            type="submit"
            id="btn-continue-to-payment"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#041f5e] via-[#082b78] to-[#0056d6] hover:from-[#03194a] hover:via-[#062464] hover:to-[#0047b3] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#041f5e]/25 hover:shadow-lg hover:shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{submitButtonLabel}</span>
            <ArrowRight className="w-4 h-4 text-[#00e5b8]" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationStep1Form;
