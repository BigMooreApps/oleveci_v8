import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, ChevronUp, ChevronDown, Check, Mail, Map as MapIcon, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { extractLocalPhone } from '../../utils/phoneUtils';
import { LocationCoordinates } from '../../types';
import { OleVeciIcon } from '../OleVeciLogo';

export interface BusinessLocationContactSectionProps {
  city: string;
  onChangeCity: (city: string) => void;
  sector: string;
  onChangeSector: (sector: string) => void;
  address: string;
  onChangeAddress: (address: string) => void;
  coordinates?: LocationCoordinates;
  onOpenMapPicker?: () => void;
  whatsapp: string;
  onChangeWhatsapp: (whatsapp: string) => void;
  phone?: string;
  onChangePhone?: (phone: string) => void;
  email?: string;
  onChangeEmail?: (email: string) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  className?: string;
  idPrefix?: string;
}

export const BusinessLocationContactSection: React.FC<BusinessLocationContactSectionProps> = ({
  city,
  onChangeCity,
  sector,
  onChangeSector,
  address,
  onChangeAddress,
  coordinates,
  onOpenMapPicker,
  whatsapp,
  onChangeWhatsapp,
  phone = '',
  onChangePhone,
  email = '',
  onChangeEmail,
  isOpen = false,
  onToggleOpen,
  className = '',
  idPrefix = 'biz-loc-contact',
}) => {
  const { municipalities, sectors } = useApp();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isSectionOpen = onToggleOpen !== undefined ? isOpen : internalIsOpen;
  const toggleSection = onToggleOpen || (() => setInternalIsOpen((prev) => !prev));

  // Dropdown open states
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const sectorRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (sectorRef.current && !sectorRef.current.contains(event.target as Node)) {
        setIsSectorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sorted municipalities list
  const sortedMunicipalities = useMemo(() => {
    if (municipalities && municipalities.length > 0) {
      return [...municipalities].sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      );
    }
    const defaultMunNames = [
      'Cajicá', 'Chía', 'Cogua', 'Cota', 'Gachancipá',
      'Nemocón', 'Sesquilé', 'Sopó', 'Tabio', 'Tenjo', 'Tocancipá', 'Zipaquirá'
    ];
    return defaultMunNames.map((name, i) => ({
      id: `mun-${i + 1}`,
      name,
      sectors: [{ id: `sec-${i + 1}-1`, name: 'Centro' }]
    }));
  }, [municipalities]);

  // City sectors based on current city selection
  const citySectors = useMemo(() => {
    // Check in municipalities first
    const matchMun = municipalities.find(
      (m) => m.name.toLowerCase() === (city || '').toLowerCase()
    );
    if (matchMun && matchMun.sectors && matchMun.sectors.length > 0) {
      return [...matchMun.sectors].sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      );
    }

    // Fallback: check in sectors catalog
    if (sectors && sectors.length > 0) {
      const matchSectors = sectors
        .filter((s) => s.cityName.toLowerCase() === (city || '').toLowerCase())
        .map((s) => ({ id: s.id, name: s.name }));
      if (matchSectors.length > 0) {
        return matchSectors.sort((a, b) =>
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );
      }
    }

    return [{ id: 'sec-centro', name: 'Centro' }];
  }, [municipalities, sectors, city]);

  const handleSelectCity = (newCity: string) => {
    onChangeCity(newCity);
    setIsCityDropdownOpen(false);

    // Auto-select first sector of newly chosen city
    const matchMun = municipalities.find(
      (m) => m.name.toLowerCase() === newCity.toLowerCase()
    );
    if (matchMun && matchMun.sectors && matchMun.sectors.length > 0) {
      onChangeSector(matchMun.sectors[0].name);
    } else {
      const matchSec = sectors.filter(
        (s) => s.cityName.toLowerCase() === newCity.toLowerCase()
      );
      if (matchSec.length > 0) {
        onChangeSector(matchSec[0].name);
      } else {
        onChangeSector('Centro');
      }
    }
  };

  return (
    <div
      className={`bg-white/95 rounded-2xl border border-slate-200/90 shadow-[0_2px_14px_rgba(4,31,94,0.04)] hover:border-slate-300/80 transition-all ${
        isSectionOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'
      } ${className}`}
    >
      <div
        role="button"
        tabIndex={0}
        id={`${idPrefix}-toggle-header`}
        onClick={toggleSection}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection();
          }
        }}
        className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-slate-900">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <span className="text-[#041f5e] font-extrabold">Ubicación y contacto</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-transform shrink-0">
          {isSectionOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#007af7]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {isSectionOpen && (
        <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Municipio */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Municipio
              </label>
              <div ref={cityRef} className="relative">
                <button
                  type="button"
                  id={`${idPrefix}-city-dropdown-trigger`}
                  onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all shadow-2xs cursor-pointer ${
                    isCityDropdownOpen
                      ? 'border-[#007af7] ring-4 ring-[#007af7]/15 bg-white'
                      : 'border-slate-200/90 hover:border-[#007af7]/60 bg-[#F8FAFD] hover:bg-[#F3F7FC]'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {city || 'Selecciona municipio'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isCityDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </button>

                {isCityDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1 max-h-52 overflow-y-auto">
                    {sortedMunicipalities.map((m) => {
                      const isSelected = (city || '').toLowerCase() === m.name.toLowerCase();
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectCity(m.name)}
                          className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-semibold">{m.name}</span>
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
              <div ref={sectorRef} className="relative">
                <button
                  type="button"
                  id={`${idPrefix}-sector-dropdown-trigger`}
                  onClick={() => setIsSectorDropdownOpen((prev) => !prev)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all shadow-2xs cursor-pointer ${
                    isSectorDropdownOpen
                      ? 'border-[#007af7] ring-4 ring-[#007af7]/15 bg-white'
                      : 'border-slate-200/90 hover:border-[#007af7]/60 bg-[#F8FAFD] hover:bg-[#F3F7FC]'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {sector || 'Selecciona sector'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isSectorDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </button>

                {isSectorDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1 max-h-52 overflow-y-auto">
                    {citySectors.map((s) => {
                      const isSelected = (sector || '').toLowerCase() === s.name.toLowerCase();
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            onChangeSector(s.name);
                            setIsSectorDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-semibold">{s.name}</span>
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

          {/* Dirección Física con botón Ubicar en el Mapa */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 text-xs">
                Dirección Física
              </label>
              {coordinates?.lat && coordinates?.lng ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Punto fijado en mapa
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id={`${idPrefix}-address-input`}
                required
                value={address}
                onChange={(e) => onChangeAddress(e.target.value)}
                placeholder="Ej: Cra. 3 # 4-28, Frente al Parque Principal"
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs"
              />
              {onOpenMapPicker && (
                <button
                  type="button"
                  id={`${idPrefix}-open-map-picker-btn`}
                  onClick={onOpenMapPicker}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#041f5e] via-[#082b78] to-[#0056d6] hover:brightness-110 active:scale-95 px-3.5 py-2.5 rounded-xl transition cursor-pointer border border-blue-600/30 shrink-0 shadow-2xs"
                  title="Ubicar negocio en el mapa interactivo para fijar el local con el icono de OleVeci"
                >
                  <OleVeciIcon size={16} />
                  <span>Ubicar en el Mapa</span>
                </button>
              )}
            </div>

            {/* Coordinates Status Feedback */}
            {coordinates?.lat && coordinates?.lng ? (
              <div className="mt-2 p-2.5 rounded-xl bg-blue-50/80 border border-blue-100/90 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-[11px] text-slate-700 min-w-0">
                    <span className="font-bold text-slate-900">Ubicación fijada en el mapa:</span>{' '}
                    <span className="text-slate-500 font-mono text-[10px]">
                      ({coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)})
                    </span>
                  </div>
                </div>
                {onOpenMapPicker && (
                  <button
                    type="button"
                    onClick={onOpenMapPicker}
                    className="text-[11px] text-[#007af7] hover:text-[#041f5e] font-bold hover:underline shrink-0 cursor-pointer"
                  >
                    Mover punto
                  </button>
                )}
              </div>
            ) : onOpenMapPicker ? (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                <span>Fija el punto en el mapa para activar el icono de OleVeci y la ruta "Cómo llegar" para tus clientes.</span>
                <button
                  type="button"
                  onClick={onOpenMapPicker}
                  className="text-[#007af7] hover:underline font-semibold shrink-0 cursor-pointer ml-2"
                >
                  Fijar ahora →
                </button>
              </div>
            ) : null}
          </div>

          {/* Teléfonos: WhatsApp y Línea fija */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                WhatsApp de Atención
              </label>
              <div className="flex rounded-xl border border-slate-200/90 focus-within:border-[#007af7] focus-within:ring-4 focus-within:ring-blue-500/10 bg-[#F8FAFD] focus-within:bg-white overflow-hidden shadow-2xs transition-all">
                <div className="flex items-center gap-1.5 px-3 bg-slate-200/50 border-r border-slate-200/80 text-slate-700 text-xs font-bold select-none shrink-0">
                  <span className="text-sm leading-none">🇨🇴</span>
                  <span>+57</span>
                </div>
                <input
                  type="tel"
                  id={`${idPrefix}-whatsapp-input`}
                  required
                  value={whatsapp}
                  onChange={(e) => onChangeWhatsapp(extractLocalPhone(e.target.value))}
                  placeholder="312 456 7890"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-transparent focus:outline-hidden font-medium"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Digita solo tu número de 10 dígitos (el +57 ya está incluido).
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Teléfono / Línea fija
              </label>
              <input
                type="text"
                id={`${idPrefix}-phone-input`}
                value={phone}
                onChange={(e) => onChangePhone && onChangePhone(e.target.value)}
                placeholder="3124567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Correo Electrónico del Negocio */}
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Correo Electrónico del Negocio
            </label>
            <div className="relative">
              <input
                type="email"
                id={`${idPrefix}-email-input`}
                value={email}
                onChange={(e) => onChangeEmail && onChangeEmail(e.target.value)}
                placeholder="contacto@tunegocio.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Dirección de correo electrónico de contacto público del negocio.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
