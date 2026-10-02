import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Municipality, Sector } from '../../types';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Building2,
  Compass,
  Layers,
  Sparkles,
  AlertCircle,
  Navigation,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AdminMunicipalitiesTab: React.FC = () => {
  const {
    municipalities,
    sectors,
    addMunicipality,
    updateMunicipality,
    deleteMunicipality,
    addSector,
    updateSector,
    deleteSector,
  } = useApp();

  const [selectedMuniId, setSelectedMuniId] = useState<string>(municipalities[0]?.id || '');
  const [expandedMobileMuniId, setExpandedMobileMuniId] = useState<string | null>(municipalities[0]?.id || null);
  const [mobileSectorSearchQuery, setMobileSectorSearchQuery] = useState('');
  const [sectorTargetMuni, setSectorTargetMuni] = useState<Municipality | null>(null);

  // Municipality Form State
  const [isEditingMuni, setIsEditingMuni] = useState(false);
  const [muniToEditId, setMuniToEditId] = useState<string | null>(null);
  const [muniName, setMuniName] = useState('');
  const [muniDepartment, setMuniDepartment] = useState('Cundinamarca');

  // Sector Form State
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [sectorToEditId, setSectorToEditId] = useState<string | null>(null);
  const [sectorName, setSectorName] = useState('');
  const [sectorType, setSectorType] = useState<'urban' | 'rural' | 'corregimiento'>('urban');
  const [sectorLat, setSectorLat] = useState('4.9184');
  const [sectorLng, setSectorLng] = useState('-74.0259');

  const [sectorSearchQuery, setSectorSearchQuery] = useState('');

  const sortedMunicipalities = useMemo(() => {
    return [...municipalities].sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
  }, [municipalities]);

  const activeMuni = sortedMunicipalities.find((m) => m.id === selectedMuniId) || sortedMunicipalities[0];

  // Sectors for active municipality
  const currentMuniSectors = useMemo(() => {
    if (!activeMuni) return [];
    return sectors
      .filter((s) => s.cityName.toLowerCase() === activeMuni.name.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [activeMuni, sectors]);

  const displayedSectors = useMemo(() => {
    return currentMuniSectors.filter((s) =>
      s.name.toLowerCase().includes(sectorSearchQuery.trim().toLowerCase())
    );
  }, [currentMuniSectors, sectorSearchQuery]);

  // Open Municipality Modal / Form
  const handleOpenAddMuni = () => {
    setMuniToEditId(null);
    setMuniName('');
    setMuniDepartment('Cundinamarca');
    setIsEditingMuni(true);
  };

  const handleOpenEditMuni = (m: Municipality) => {
    setMuniToEditId(m.id);
    setMuniName(m.name);
    setMuniDepartment(m.department);
    setIsEditingMuni(true);
  };

  const handleSaveMuni = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muniName.trim()) {
      alert('Ingresa el nombre del municipio.');
      return;
    }

    if (muniToEditId) {
      const existing = municipalities.find((m) => m.id === muniToEditId);
      updateMunicipality(muniToEditId, {
        name: muniName.trim(),
        department: muniDepartment.trim() || 'Cundinamarca',
        coordinates: existing?.coordinates || { lat: 4.9184, lng: -74.0259 },
        code: existing?.code,
      });
    } else {
      addMunicipality({
        name: muniName.trim(),
        department: muniDepartment.trim() || 'Cundinamarca',
        coordinates: { lat: 4.9184, lng: -74.0259 },
        isActive: true,
      });
    }

    setIsEditingMuni(false);
  };

  const handleDeleteMuni = (m: Municipality) => {
    if (
      window.confirm(
        `¿Eliminar el municipio "${m.name}"? Los sectores y publicaciones asociadas se ajustarán en cascada.`
      )
    ) {
      deleteMunicipality(m.id);
      if (selectedMuniId === m.id && municipalities.length > 1) {
        const remaining = municipalities.filter((item) => item.id !== m.id);
        setSelectedMuniId(remaining[0]?.id || '');
      }
    }
  };

  // Open Sector Form
  const handleOpenAddSector = (targetMuni?: Municipality) => {
    const muni = targetMuni || activeMuni;
    setSectorTargetMuni(muni || null);
    if (muni) {
      setSelectedMuniId(muni.id);
    }
    setSectorToEditId(null);
    setSectorName('');
    setSectorType('urban');
    setSectorLat(muni?.coordinates?.lat.toString() || '4.9184');
    setSectorLng(muni?.coordinates?.lng.toString() || '-74.0259');
    setIsAddingSector(true);
  };

  const handleOpenEditSector = (sec: Sector) => {
    const muni = municipalities.find(
      (m) => m.name.toLowerCase() === sec.cityName.toLowerCase()
    ) || activeMuni;
    setSectorTargetMuni(muni || null);
    if (muni) {
      setSelectedMuniId(muni.id);
    }
    setSectorToEditId(sec.id);
    setSectorName(sec.name);
    setSectorType(sec.type || 'urban');
    setSectorLat((sec.coordinates?.lat || 4.9184).toString());
    setSectorLng((sec.coordinates?.lng || -74.0259).toString());
    setIsAddingSector(true);
  };

  const handleSaveSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorName.trim()) {
      alert('Ingresa el nombre del sector o vereda.');
      return;
    }
    const muni = sectorTargetMuni || activeMuni;
    if (!muni) return;

    if (sectorToEditId) {
      const existing = sectors.find((s) => s.id === sectorToEditId);
      updateSector(sectorToEditId, {
        name: sectorName.trim(),
        cityName: muni.name,
        type: existing?.type || 'urban',
        coordinates: existing?.coordinates || muni.coordinates || { lat: 4.9184, lng: -74.0259 },
      });
    } else {
      addSector({
        name: sectorName.trim(),
        cityName: muni.name,
        type: 'urban',
        coordinates: muni.coordinates || { lat: 4.9184, lng: -74.0259 },
      });
    }

    setIsAddingSector(false);
  };

  const handleDeleteSector = (sec: Sector) => {
    if (window.confirm(`¿Eliminar el sector/vereda "${sec.name}" de ${sec.cityName}?`)) {
      deleteSector(sec.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#007af7]" />
            <span>Gestión Territorial: Municipios y Sectores</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura las coberturas geográficas de OleVeci. Las adiciones o modificaciones actualizan al instante el selector de ciudad, filtros de feed y buscador.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddMuni}
          className="px-4 py-2 rounded-xl bg-[#007af7] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-center cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Municipio</span>
        </button>
      </div>

      {/* MOBILE VIEW: Unified Accordion List of Municipalities & Sectors */}
      <div className="block lg:hidden space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Municipios y Sectores ({municipalities.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Toca para desplegar sectores
          </span>
        </div>

        <div className="space-y-2.5">
          {sortedMunicipalities.map((m) => {
            const isExpanded = expandedMobileMuniId === m.id;
            const muniSectors = sectors
              .filter((s) => s.cityName.toLowerCase() === m.name.toLowerCase())
              .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

            const filteredMobileSectors = muniSectors.filter((s) =>
              s.name.toLowerCase().includes(mobileSectorSearchQuery.trim().toLowerCase())
            );

            return (
              <div
                key={m.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'bg-white border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Cabecera del Municipio */}
                <div
                  onClick={() => {
                    setExpandedMobileMuniId(isExpanded ? null : m.id);
                    setSelectedMuniId(m.id);
                    setMobileSectorSearchQuery('');
                  }}
                  className={`p-3.5 flex items-center justify-between gap-2.5 cursor-pointer transition ${
                    isExpanded ? 'bg-blue-50/40 border-b border-blue-100' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isExpanded
                          ? 'bg-[#007af7] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.department} · {muniSectors.length} sectores/veredas
                      </div>
                    </div>
                  </div>

                  {/* Acciones y Toggle */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditMuni(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="Editar municipio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {municipalities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMuni(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar municipio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedMobileMuniId(isExpanded ? null : m.id);
                        setSelectedMuniId(m.id);
                        setMobileSectorSearchQuery('');
                      }}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isExpanded ? 'text-[#007af7] bg-blue-100/70' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={isExpanded ? 'Ocultar sectores' : 'Ver sectores'}
                      aria-label={isExpanded ? 'Ocultar sectores' : 'Ver sectores'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Lista de Sectores Desplegada Inline */}
                {isExpanded && (
                  <div className="p-3.5 bg-slate-50/70 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Compass className="w-3.5 h-3.5 text-[#007af7] shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          Sectores en {m.name} ({muniSectors.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenAddSector(m)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#007af7] text-xs font-bold transition flex items-center gap-1 shrink-0 border border-blue-200 cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Sector</span>
                      </button>
                    </div>

                    {muniSectors.length > 4 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={mobileSectorSearchQuery}
                          onChange={(e) => setMobileSectorSearchQuery(e.target.value)}
                          placeholder={`Buscar entre ${muniSectors.length} sectores...`}
                          className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none transition shadow-2xs"
                        />
                      </div>
                    )}

                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-0.5">
                      {muniSectors.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
                          <p className="mb-2">No hay sectores o veredas registrados aún en {m.name}.</p>
                          <button
                            type="button"
                            onClick={() => handleOpenAddSector(m)}
                            className="text-xs font-bold text-[#007af7] hover:underline cursor-pointer"
                          >
                            + Añadir el primer sector
                          </button>
                        </div>
                      ) : filteredMobileSectors.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                          No se encontraron sectores que coincidan con "{mobileSectorSearchQuery}".
                        </div>
                      ) : (
                        filteredMobileSectors.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-2.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-slate-800 truncate">
                                {sec.name}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSector(sec)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                title="Editar sector"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSector(sec)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Eliminar sector"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout (Desktop lg+) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-5">
        {/* Left Column: Municipalities List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Municipios Activos ({municipalities.length})
            </span>
          </div>

          <div className="space-y-2">
            {sortedMunicipalities.map((m) => {
              const isSelected = activeMuni?.id === m.id;
              const sectorCount = sectors.filter(
                (s) => s.cityName.toLowerCase() === m.name.toLowerCase()
              ).length;

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMuniId(m.id);
                    setSectorSearchQuery('');
                  }}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-[#007af7] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.department} · {sectorCount} sectores/veredas
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditMuni(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="Editar municipio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {municipalities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMuni(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar municipio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sectors / Veredas of Selected Municipality (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            {/* Header of Sectors Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#007af7]" />
                  <span>Sectores y Veredas en {activeMuni?.name || 'Municipio'}</span>
                </h4>
              </div>

              <button
                type="button"
                onClick={handleOpenAddSector}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#007af7] text-xs font-bold transition flex items-center gap-1 self-start sm:self-center cursor-pointer border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Sector</span>
              </button>
            </div>

            {/* Search Sectors Filter */}
            {currentMuniSectors.length > 4 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={sectorSearchQuery}
                  onChange={(e) => setSectorSearchQuery(e.target.value)}
                  placeholder={`Buscar entre ${currentMuniSectors.length} sectores o veredas...`}
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            )}

            {/* List of Sectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {currentMuniSectors.length === 0 ? (
                <div className="col-span-full p-6 text-center text-slate-400 text-xs">
                  No hay sectores creados en este municipio. Añade el primero.
                </div>
              ) : displayedSectors.length === 0 ? (
                <div className="col-span-full p-6 text-center text-slate-400 text-xs">
                  No se encontraron sectores que coincidan con "{sectorSearchQuery}".
                </div>
              ) : (
                displayedSectors.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-200 transition flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 truncate">{sec.name}</div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSector(sec)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Editar sector"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSector(sec)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar sector"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Municipality Modal */}
      {isEditingMuni && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {muniToEditId ? 'Editar Municipio' : 'Crear Nuevo Municipio'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingMuni(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMuni} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Nombre del Municipio *</label>
                <input
                  type="text"
                  required
                  value={muniName}
                  onChange={(e) => setMuniName(e.target.value)}
                  placeholder="Ej. Sopó, Tabio, Chía"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Departamento</label>
                <input
                  type="text"
                  value={muniDepartment}
                  onChange={(e) => setMuniDepartment(e.target.value)}
                  placeholder="Cundinamarca"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMuni(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#007af7] text-white font-bold hover:bg-blue-600 shadow-xs"
                >
                  Guardar Municipio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sector Modal */}
      {isAddingSector && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {sectorToEditId
                  ? 'Editar Sector / Vereda'
                  : `Añadir Sector a ${(sectorTargetMuni || activeMuni)?.name || 'Municipio'}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingSector(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSector} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Nombre del Barrio / Sector / Vereda *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  placeholder="Ej. La Cumbre, Canelón, Sector Centro"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#007af7] focus:outline-hidden font-semibold text-sm text-slate-900 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSector(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#007af7] text-white font-bold hover:bg-blue-600 shadow-xs cursor-pointer active:scale-95 transition"
                >
                  Guardar Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
