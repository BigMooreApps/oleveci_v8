import React, { useState, useRef, useEffect } from 'react';
import { Store, ChevronUp, ChevronDown, Search, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';

export interface BusinessMainInfoSectionProps {
  name: string;
  onChangeName: (name: string) => void;
  subCategory?: string;
  onChangeSubCategory?: (subCategory: string) => void;
  categoryId: string;
  onChangeCategoryId: (categoryId: string) => void;
  description: string;
  onChangeDescription: (description: string) => void;
  categories?: Category[];
  isOpen?: boolean;
  onToggleOpen?: () => void;
  className?: string;
  idPrefix?: string;
}

export const BusinessMainInfoSection: React.FC<BusinessMainInfoSectionProps> = ({
  name,
  onChangeName,
  subCategory = '',
  onChangeSubCategory,
  categoryId,
  onChangeCategoryId,
  description,
  onChangeDescription,
  categories: propCategories,
  isOpen = false,
  onToggleOpen,
  className = '',
  idPrefix = 'biz-main-info',
}) => {
  const { categories: appCategories } = useApp();
  const availableCategories = propCategories || appCategories || [];

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isSectionOpen = onToggleOpen !== undefined ? isOpen : internalIsOpen;
  const toggleSection = onToggleOpen || (() => setInternalIsOpen((prev) => !prev));

  // Category dropdown state
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const catRef = useRef<HTMLDivElement>(null);

  // Click outside to close category dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoryObj = availableCategories.find((cat) => cat.id === categoryId);

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
            <Store className="w-3.5 h-3.5" />
          </div>
          <span className="text-[#041f5e] font-extrabold">Información principal</span>
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
          {/* Nombre del comercio */}
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Nombre del Comercio / Negocio *
            </label>
            <input
              type="text"
              id={`${idPrefix}-name-input`}
              required
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Ej: La Brasa Smash & Beer, Supermercado Central..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Subcategoría y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Especialidad / Subcategoría
              </label>
              <input
                type="text"
                id={`${idPrefix}-subcategory-input`}
                value={subCategory}
                onChange={(e) => onChangeSubCategory && onChangeSubCategory(e.target.value)}
                placeholder="Ej: Hamburguesas Artesanales, Café de especialidad..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Categoría Comercial
              </label>
              <div ref={catRef} className="relative">
                <button
                  type="button"
                  id={`${idPrefix}-cat-dropdown-trigger`}
                  onClick={() => {
                    setIsCatDropdownOpen((prev) => !prev);
                    setCatSearch('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all shadow-2xs cursor-pointer ${
                    isCatDropdownOpen
                      ? 'border-[#007af7] ring-4 ring-[#007af7]/15 bg-white'
                      : 'border-slate-200/90 hover:border-[#007af7]/60 bg-[#F8FAFD] hover:bg-[#F3F7FC]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">
                      {selectedCategoryObj?.icon || '🏷️'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {selectedCategoryObj?.name || 'Selecciona categoría'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isCatDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </button>

                {isCatDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          id={`${idPrefix}-cat-search-input`}
                          value={catSearch}
                          onChange={(e) => setCatSearch(e.target.value)}
                          placeholder="Buscar categoría..."
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#007af7]"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto p-1.5 space-y-1">
                      {availableCategories
                        .filter((cat) =>
                          cat.name.toLowerCase().includes(catSearch.trim().toLowerCase())
                        )
                        .map((cat) => {
                          const isSelected = categoryId === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                onChangeCategoryId(cat.id);
                                setIsCatDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 transition cursor-pointer text-xs ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span>{cat.icon || '🏷️'}</span>
                                <span className="truncate">{cat.name}</span>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
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

          {/* Descripción del comercio */}
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Descripción del Comercio
            </label>
            <textarea
              id={`${idPrefix}-desc-textarea`}
              rows={3}
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              placeholder="Describe qué productos, especialidades o experiencia ofrece tu negocio..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#007af7] focus:ring-4 focus:ring-blue-500/10 text-xs text-slate-900 bg-[#F8FAFD] hover:bg-[#F3F7FC] focus:bg-white shadow-2xs leading-relaxed transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
