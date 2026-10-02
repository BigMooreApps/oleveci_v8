import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Calendar,
  RotateCcw,
  Table as TableIcon,
  ChevronDown,
  Tag,
  Check,
  Search,
  Edit3,
  Trash2,
} from 'lucide-react';
import { ModernTimePicker } from './ModernTimePicker';
import { ValiditySchedule, DayScheduleRow } from '../types';
import {
  INITIAL_SCHEDULE_TABLE,
  computeValidityData,
  getScheduleStatus,
  formatTime12h,
} from '../utils/validityHelper';

interface ValidityEngineControlProps {
  initialSchedule?: ValiditySchedule;
  initialExpiryLabel?: string;
  previewImageUrl?: string;
  onChange: (schedule: ValiditySchedule, expiryLabel: string, expiresAt?: string) => void;
}

export const ValidityEngineControl: React.FC<ValidityEngineControlProps> = ({
  initialSchedule,
  initialExpiryLabel,
  previewImageUrl,
  onChange,
}) => {
  // --- TABLE SCHEDULE STATE (Only weekly table option) ---
  const [scheduleTable, setScheduleTable] = useState<DayScheduleRow[]>(() => {
    if (initialSchedule?.scheduleTable && initialSchedule.scheduleTable.length === 7) {
      return initialSchedule.scheduleTable;
    }
    return INITIAL_SCHEDULE_TABLE.map((row) => ({ ...row }));
  });

  // "Vigencia: Desde qué fecha y hasta qué fecha"
  const [validoDesde, setValidoDesde] = useState<string>(
    initialSchedule?.validoDesde || ''
  );
  const [validoHasta, setValidoHasta] = useState<string>(
    initialSchedule?.validoHasta || ''
  );

  // Custom override of badge text
  const [customBadgeText, setCustomBadgeText] = useState<string>(
    initialExpiryLabel || '¡Hoy hasta las 10:00 PM!'
  );
  const [isCustomEdited, setIsCustomEdited] = useState<boolean>(
    Boolean(initialExpiryLabel && initialExpiryLabel !== '¡Hoy hasta las 10:00 PM!')
  );

  // Collapsible state: all submodules start reduced / collapsed by default
  const [isDaysHoursOpen, setIsDaysHoursOpen] = useState<boolean>(false);
  const [isVigenciaOpen, setIsVigenciaOpen] = useState<boolean>(false);
  const [isEtiquetaOpen, setIsEtiquetaOpen] = useState<boolean>(false);

  // Build current schedule object strictly in 'table' mode
  const currentSchedule: ValiditySchedule = {
    mode: 'table',
    scheduleTable,
    validoDesde: validoDesde || undefined,
    validoHasta: validoHasta || undefined,
  };

  // Compute suggested label & expiresAt
  const { suggestedLabel, expiresAt } = computeValidityData(currentSchedule);

  // Status for preview badge
  const status = getScheduleStatus(currentSchedule);

  // Notify parent on change
  useEffect(() => {
    if (!isCustomEdited) {
      setCustomBadgeText(suggestedLabel);
      onChange(currentSchedule, suggestedLabel, expiresAt);
    } else {
      onChange(currentSchedule, customBadgeText, expiresAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(scheduleTable),
    validoDesde,
    validoHasta,
    isCustomEdited,
  ]);

  // Handlers for table rows
  const handleUpdateRow = (index: number, field: keyof DayScheduleRow, value: any) => {
    setScheduleTable((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleToggleDayActive = (index: number) => {
    setScheduleTable((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], active: !next[index].active };
      return next;
    });
  };

  const handleSelectDaysPreset = (preset: 'all' | 'today' | 'weekdays' | 'fri_sun' | 'weekends' | 'clear') => {
    setScheduleTable((prev) =>
      prev.map((row) => {
        if (preset === 'all') return { ...row, active: true };
        if (preset === 'today') return { ...row, active: row.dayIndex === currentTodayDayIndex };
        if (preset === 'weekdays') return { ...row, active: row.dayIndex >= 1 && row.dayIndex <= 5 };
        if (preset === 'fri_sun') return { ...row, active: row.dayIndex === 5 || row.dayIndex === 6 || row.dayIndex === 0 };
        if (preset === 'weekends') return { ...row, active: row.dayIndex === 6 || row.dayIndex === 0 };
        if (preset === 'clear') {
          return {
            ...row,
            active: false,
            horaInicio: '',
            horaFin: '',
            fechaInicio: '',
            fechaFin: '',
          };
        }
        return row;
      })
    );
  };

  const handleApplyTimeToAllActive = (field: 'horaInicio' | 'horaFin', time: string) => {
    setScheduleTable((prev) =>
      prev.map((row) => (row.active ? { ...row, [field]: time } : row))
    );
  };

  const [vigenciaPreset, setVigenciaPreset] = useState<
    'today' | '3_days' | '7_days' | '15_days' | 'end_month' | null
  >(null);

  // Helpers for Vigencia dates
  const handleSetSoloHoyVigencia = () => {
    const today = new Date().toISOString().split('T')[0];
    setValidoDesde(today);
    setValidoHasta(today);
    setVigenciaPreset('today');
  };

  const setValidoHastaDays = (days: number, presetKey?: '3_days' | '7_days' | '15_days') => {
    const d = new Date();
    if (!validoDesde) {
      setValidoDesde(d.toISOString().split('T')[0]);
    }
    d.setDate(d.getDate() + days);
    setValidoHasta(d.toISOString().split('T')[0]);
    if (presetKey) {
      setVigenciaPreset(presetKey);
    }
  };

  const setValidoHastaEndOfMonth = () => {
    const d = new Date();
    if (!validoDesde) {
      setValidoDesde(d.toISOString().split('T')[0]);
    }
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    setValidoHasta(end.toISOString().split('T')[0]);
    setVigenciaPreset('end_month');
  };

  const currentTodayDayIndex = new Date().getDay();

  // Detect which preset matches the current table configuration
  const activeDaysPreset = useMemo(() => {
    const activeRows = scheduleTable.filter((r) => r.active);
    if (activeRows.length === 0) return null;
    if (activeRows.length === 7) return 'all';
    if (activeRows.length === 1 && activeRows[0].dayIndex === currentTodayDayIndex) return 'today';
    if (
      activeRows.length === 5 &&
      [1, 2, 3, 4, 5].every((idx) => activeRows.some((r) => r.dayIndex === idx))
    ) {
      return 'weekdays';
    }
    if (
      activeRows.length === 3 &&
      [5, 6, 0].every((idx) => activeRows.some((r) => r.dayIndex === idx))
    ) {
      return 'fri_sun';
    }
    if (
      activeRows.length === 2 &&
      [6, 0].every((idx) => activeRows.some((r) => r.dayIndex === idx))
    ) {
      return 'weekends';
    }
    return null;
  }, [scheduleTable, currentTodayDayIndex]);

  const hasActiveDays = scheduleTable.some((r) => r.active);
  const hasVigencia = Boolean(validoDesde || validoHasta);

  // Dynamically compute badge suggestions based on the user's active configuration
  const dynamicBadgeSuggestions = useMemo(() => {
    const suggestions: { group: string; items: string[] }[] = [];
    const configItems: string[] = [];

    // 1. Primary computed label from helper
    if (suggestedLabel && !configItems.includes(suggestedLabel)) {
      configItems.push(suggestedLabel);
    }

    // Active days analysis
    const activeRows = scheduleTable.filter((r) => r.active);
    const dayNames = activeRows.map((r) => r.dia);

    // Format hours if consistent or from first active
    const firstActiveWithHours = activeRows.find((r) => r.horaInicio && r.horaFin);
    const hoursPart = firstActiveWithHours
      ? ` (${formatTime12h(firstActiveWithHours.horaInicio)} - ${formatTime12h(firstActiveWithHours.horaFin)})`
      : '';
    const hoursSpanText = firstActiveWithHours
      ? ` de ${formatTime12h(firstActiveWithHours.horaInicio)} a ${formatTime12h(firstActiveWithHours.horaFin)}`
      : '';

    // Day-based variations
    if (activeRows.length === 1) {
      const day = activeRows[0].dia;
      configItems.push(`Solo los ${day}`);
      if (hoursPart) {
        configItems.push(`Solo los ${day}${hoursPart}`);
        configItems.push(`${day}${hoursSpanText}`);
      }
      configItems.push(`Todos los ${day}`);
      configItems.push(`Válido los ${day}`);
    } else if (
      activeRows.length === 5 &&
      [1, 2, 3, 4, 5].every((idx) => activeRows.some((r) => r.dayIndex === idx))
    ) {
      configItems.push('Lunes a Viernes');
      if (hoursPart) {
        configItems.push(`Lunes a Viernes${hoursPart}`);
      }
      configItems.push('De Lunes a Viernes');
      configItems.push('Días de semana');
    } else if (
      activeRows.length === 2 &&
      [6, 0].every((idx) => activeRows.some((r) => r.dayIndex === idx))
    ) {
      configItems.push('Fines de semana');
      configItems.push('Sábados y Domingos');
      if (hoursPart) {
        configItems.push(`Fines de semana${hoursPart}`);
      }
      configItems.push('Válido fines de semana');
    } else if (
      activeRows.length === 3 &&
      [5, 6, 0].every((idx) => activeRows.some((r) => r.dayIndex === idx))
    ) {
      configItems.push('Viernes a Domingo');
      configItems.push('Fin de semana extendido (Vie-Dom)');
      if (hoursPart) {
        configItems.push(`Viernes a Domingo${hoursPart}`);
      }
    } else if (activeRows.length === 7) {
      configItems.push('Todos los días');
      configItems.push('Disponible toda la semana');
      if (hoursPart) {
        configItems.push(`Todos los días${hoursPart}`);
      }
      configItems.push('Lunes a Domingo');
    } else if (activeRows.length > 1 && activeRows.length < 7) {
      configItems.push(dayNames.join(', '));
      configItems.push(`Solo ${dayNames.join(' y ')}`);
      if (hoursPart) {
        configItems.push(`${dayNames.join(', ')}${hoursPart}`);
      }
    }

    // Date-based options
    if (validoHasta) {
      const parts = validoHasta.split('-');
      if (parts.length === 3) {
        const months = [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
        ];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const dayNum = parseInt(parts[2], 10);
        const dateStr = `${dayNum} de ${months[monthIndex] || parts[1]}`;

        configItems.push(`Válido hasta el ${dateStr}`);
        configItems.push(`Hasta el ${dateStr}`);
        configItems.push(`Vigente hasta ${dateStr}`);
      }
    }

    if (validoDesde && validoHasta && validoDesde === validoHasta) {
      configItems.push('Válido solo hoy');
      configItems.push('¡Solo por hoy!');
      configItems.push('Oferta del día');
    } else if (validoDesde && validoHasta) {
      configItems.push('Por fechas seleccionadas');
    }

    // Deduplicate configItems
    const uniqueConfig = Array.from(new Set(configItems.filter(Boolean)));
    if (uniqueConfig.length > 0) {
      suggestions.push({
        group: '✨ Basadas en tu configuración (horario y fechas)',
        items: uniqueConfig,
      });
    }

    // Commercial & popular tags requested by user (e.g. "hasta agotar existencias", etc.)
    suggestions.push({
      group: '🏷️ Opciones y frases comerciales populares',
      items: [
        'Hasta agotar existencias',
        'Por tiempo limitado',
        'Hasta agotar inventario',
        'Aplica términos y condiciones',
        'Promoción por temporada',
        'Solo en punto físico',
        'Válido a domicilio y en punto',
        'Unidades limitadas',
        'No acumulable con otras promociones',
      ],
    });

    return suggestions;
  }, [scheduleTable, validoDesde, validoHasta, suggestedLabel]);

  // --- MODERN DROPDOWN FOR BADGE OPTIONS ---
  const [isBadgeDropdownOpen, setIsBadgeDropdownOpen] = useState(false);
  const [badgeSearchQuery, setBadgeSearchQuery] = useState('');
  const badgeDropdownRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Close badge dropdown on click or touch outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (badgeDropdownRef.current && !badgeDropdownRef.current.contains(event.target as Node)) {
        setIsBadgeDropdownOpen(false);
      }
    };
    if (isBadgeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isBadgeDropdownOpen]);

  // Filter groups based on quick search query
  const filteredBadgeGroups = useMemo(() => {
    if (!badgeSearchQuery.trim()) return dynamicBadgeSuggestions;
    const q = badgeSearchQuery.toLowerCase();
    return dynamicBadgeSuggestions
      .map((g) => ({
        group: g.group,
        items: g.items.filter((item) => item.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [dynamicBadgeSuggestions, badgeSearchQuery]);

  // Common button class generator for both sections
  const getPresetButtonClass = (isActive: boolean, hasActiveInGroup: boolean) => {
    if (isActive) {
      return 'px-2 sm:px-2.5 py-1 rounded-lg bg-[#007af7] text-white border border-[#007af7] text-[10px] sm:text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap';
    }
    if (hasActiveInGroup) {
      return 'px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 text-[10px] sm:text-[11px] font-semibold transition-all shadow-2xs cursor-pointer hover:bg-slate-200/80 hover:text-slate-600 active:scale-95 whitespace-nowrap';
    }
    return 'px-2 sm:px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-[#007af7] text-slate-700 border border-slate-200 text-[10px] sm:text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap';
  };

  return (
    <div className="space-y-4">
      {/* ===================== SUBCOMPONENTE 1: DÍAS Y HORAS DISPONIBLES ===================== */}
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs transition-all ${isDaysHoursOpen ? 'p-4 sm:p-5 space-y-3.5' : 'p-3.5 sm:p-4'}`}>
        {/* Header bar */}
        <button
          type="button"
          onClick={() => setIsDaysHoursOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group select-none"
          aria-expanded={isDaysHoursOpen}
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <TableIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[#041f5e]">Días y Horas Disponibles</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-[#007af7] flex items-center justify-center transition-colors shrink-0">
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDaysHoursOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isDaysHoursOpen && (
          <div className="space-y-3 pt-0.5">
            {/* Quick presets & toolbar for the table */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => handleSelectDaysPreset('all')}
              className={getPresetButtonClass(activeDaysPreset === 'all', activeDaysPreset !== null)}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => handleSelectDaysPreset('today')}
              className={getPresetButtonClass(activeDaysPreset === 'today', activeDaysPreset !== null)}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => handleSelectDaysPreset('weekdays')}
              className={getPresetButtonClass(activeDaysPreset === 'weekdays', activeDaysPreset !== null)}
            >
              <span className="sm:hidden">L a V</span>
              <span className="hidden sm:inline">Lun a Vie</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectDaysPreset('fri_sun')}
              className={getPresetButtonClass(activeDaysPreset === 'fri_sun', activeDaysPreset !== null)}
            >
              <span className="sm:hidden">V a D</span>
              <span className="hidden sm:inline">Vie a Dom</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectDaysPreset('weekends')}
              className={getPresetButtonClass(activeDaysPreset === 'weekends', activeDaysPreset !== null)}
            >
              <span className="sm:hidden">S a D</span>
              <span className="hidden sm:inline">Sáb a Dom</span>
            </button>
            {hasActiveDays && (
              <button
                type="button"
                onClick={() => handleSelectDaysPreset('clear')}
                className="px-2 sm:px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] sm:text-[11px] font-bold cursor-pointer transition-all active:scale-95 shadow-2xs flex items-center justify-center gap-1"
                title="Borrar selección de días"
                aria-label="Borrar selección de días"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="hidden sm:inline">Borrar</span>
              </button>
            )}
          </div>
        </div>

        {/* THE TABLE REDESIGNED WITH OLEVECI COLORS & MODERN TIME PICKERS */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-white relative">
          <table className="w-full text-left border-collapse min-w-[280px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#041f5e] via-[#082b78] to-[#041f5e] text-white text-[11px] sm:text-xs font-black">
                <th className="py-2 sm:py-2.5 px-2 sm:px-3.5 border-r border-white/10 w-[95px] xs:w-[110px] sm:w-[150px] rounded-tl-2xl">
                  <div className="flex items-center gap-1 text-blue-100">
                    <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#007af7] shrink-0" />
                    <span>Día</span>
                  </div>
                </th>
                <th className="py-2 sm:py-2.5 px-2 sm:px-3 border-r border-white/10">
                  <div className="flex items-center gap-1 text-blue-100">
                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#007af7] shrink-0" />
                    <span><span className="hidden xs:inline">Hora </span>Inicio</span>
                  </div>
                </th>
                <th className="py-2 sm:py-2.5 px-2 sm:px-3 rounded-tr-2xl">
                  <div className="flex items-center gap-1 text-blue-100">
                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#007af7] shrink-0" />
                    <span><span className="hidden xs:inline">Hora </span>Fin</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduleTable.map((row, idx) => {
                const isToday = currentTodayDayIndex === row.dayIndex;
                return (
                  <tr
                    key={row.dia}
                    onClick={() => handleToggleDayActive(idx)}
                    className={`cursor-pointer select-none transition-all duration-150 ${
                      row.active
                        ? isToday
                          ? 'bg-blue-50/80 hover:bg-blue-100/80 border-l-4 border-l-emerald-500'
                          : 'bg-blue-50/50 hover:bg-blue-100/60 border-l-4 border-l-[#007af7]'
                        : 'bg-slate-50/40 hover:bg-slate-100/60 border-l-4 border-l-transparent text-slate-400'
                    }`}
                    title={row.active ? `Pulsar para desactivar ${row.dia}` : `Pulsar para activar ${row.dia}`}
                  >
                    {/* Column: Dia (no check/bullets, row click toggles) */}
                    <td className="py-2 px-2 sm:px-3.5 border-r border-slate-100">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs sm:text-sm font-bold transition-colors ${
                            row.active ? 'text-[#041f5e]' : 'text-slate-400 line-through decoration-slate-300'
                          }`}
                        >
                          {row.dia}
                        </span>

                        {isToday && (
                          <span className="text-[8px] sm:text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-full shadow-2xs shrink-0">
                            HOY
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column: Hora Inicio with Modern Time Picker */}
                    <td
                      className="py-1 px-1 sm:px-2.5 border-r border-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ModernTimePicker
                        value={row.horaInicio}
                        disabled={!row.active}
                        placeholder="-- : --"
                        label={`Inicio (${row.dia})`}
                        align="left"
                        onChange={(timeStr) => {
                          handleUpdateRow(idx, 'horaInicio', timeStr);
                          if (!row.active) handleUpdateRow(idx, 'active', true);
                        }}
                        onApplyToAll={
                          row.active
                            ? (val) => handleApplyTimeToAllActive('horaInicio', val)
                            : undefined
                        }
                      />
                    </td>

                    {/* Column: Hora Fin with Modern Time Picker */}
                    <td
                      className="py-1 px-1 sm:px-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ModernTimePicker
                        value={row.horaFin}
                        disabled={!row.active}
                        placeholder="-- : --"
                        label={`Fin (${row.dia})`}
                        align="right"
                        onChange={(timeStr) => {
                          handleUpdateRow(idx, 'horaFin', timeStr);
                          if (!row.active) handleUpdateRow(idx, 'active', true);
                        }}
                        onApplyToAll={
                          row.active
                            ? (val) => handleApplyTimeToAllActive('horaFin', val)
                            : undefined
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
      </div>

      {/* ===================== VIGENCIA DE LA PUBLICACIÓN ===================== */}
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs transition-all ${isVigenciaOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'}`}>
        {/* Header bar with title */}
        <button
          type="button"
          onClick={() => setIsVigenciaOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group select-none"
          aria-expanded={isVigenciaOpen}
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="text-[#041f5e]">Vigencia de la publicación</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-[#007af7] flex items-center justify-center transition-colors shrink-0">
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isVigenciaOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isVigenciaOpen && (
          <div className="space-y-4 pt-0.5">
            {/* Quick Jump Buttons */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-700">
            <button
              type="button"
              onClick={handleSetSoloHoyVigencia}
              className={getPresetButtonClass(vigenciaPreset === 'today', vigenciaPreset !== null)}
              title="Válido exclusivamente el día de hoy"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setValidoHastaDays(3, '3_days')}
              className={getPresetButtonClass(vigenciaPreset === '3_days', vigenciaPreset !== null)}
            >
              <span className="sm:hidden">+3D</span>
              <span className="hidden sm:inline">+3 días</span>
            </button>
            <button
              type="button"
              onClick={() => setValidoHastaDays(7, '7_days')}
              className={getPresetButtonClass(vigenciaPreset === '7_days', vigenciaPreset !== null)}
            >
              <span className="sm:hidden">+7D</span>
              <span className="hidden sm:inline">+7 días</span>
            </button>
            <button
              type="button"
              onClick={() => setValidoHastaDays(15, '15_days')}
              className={getPresetButtonClass(vigenciaPreset === '15_days', vigenciaPreset !== null)}
            >
              <span className="sm:hidden">+15D</span>
              <span className="hidden sm:inline">+15 días</span>
            </button>
            <button
              type="button"
              onClick={setValidoHastaEndOfMonth}
              className={getPresetButtonClass(vigenciaPreset === 'end_month', vigenciaPreset !== null)}
            >
              <span className="sm:hidden">Fin mes</span>
              <span className="hidden sm:inline">Fin de mes</span>
            </button>
            {hasVigencia && (
              <button
                type="button"
                onClick={() => {
                  setValidoDesde('');
                  setValidoHasta('');
                  setVigenciaPreset(null);
                }}
                className="px-2 sm:px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] sm:text-[11px] font-bold cursor-pointer transition-all active:scale-95 shadow-2xs flex items-center justify-center gap-1"
                title="Borrar vigencia"
                aria-label="Borrar vigencia"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="hidden sm:inline">Borrar</span>
              </button>
            )}
          </div>

        {/* Date inputs (direct, unnested) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Desde qué fecha:
            </label>
            <input
              type="date"
              value={validoDesde}
              onChange={(e) => {
                setValidoDesde(e.target.value);
                setVigenciaPreset(null);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 font-semibold focus:border-[#007af7] focus:ring-1 focus:ring-[#007af7] focus:outline-hidden transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Hasta qué fecha:
            </label>
            <input
              type="date"
              value={validoHasta}
              onChange={(e) => {
                setValidoHasta(e.target.value);
                setVigenciaPreset(null);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 font-semibold focus:border-[#007af7] focus:ring-1 focus:ring-[#007af7] focus:outline-hidden transition shadow-2xs"
            />
          </div>
        </div>
        </div>
        )}
      </div>

      {/* ===================== LIVE PREVIEW & BADGE TEXT OVERRIDE ===================== */}
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-xs transition-all ${isEtiquetaOpen ? 'p-4 sm:p-5 space-y-4' : 'p-3.5 sm:p-4'}`}>
        <button
          type="button"
          onClick={() => setIsEtiquetaOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group select-none"
          aria-expanded={isEtiquetaOpen}
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <span className="text-[#041f5e]">Etiqueta de la vigencia</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-[#007af7] flex items-center justify-center transition-colors shrink-0">
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isEtiquetaOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isEtiquetaOpen && (
          <div className="space-y-4 pt-0.5">

        {/* Real Publication Badge on Photo */}
        {(() => {
          const isCalendarBadge =
            customBadgeText &&
            (customBadgeText.toLowerCase().includes('lunes') ||
              customBadgeText.toLowerCase().includes('martes') ||
              customBadgeText.toLowerCase().includes('miércoles') ||
              customBadgeText.toLowerCase().includes('jueves') ||
              customBadgeText.toLowerCase().includes('viernes') ||
              customBadgeText.toLowerCase().includes('sábado') ||
              customBadgeText.toLowerCase().includes('domingo') ||
              customBadgeText.toLowerCase().includes('semana') ||
              customBadgeText.toLowerCase().includes('hasta el'));

          return (
            <div className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200 select-none">
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Foto"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold">
                  Foto de la publicación
                </div>
              )}

              {/* Dark gradient vignette matching real post */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Real Badge of the publication */}
              <div className="absolute bottom-2.5 left-2.5 bg-gradient-to-r from-teal-500 to-cyan-500/95 text-white text-xs px-3.5 py-1.5 font-bold rounded-full inline-flex items-center gap-2 shadow-md backdrop-blur-sm border border-white/25 max-w-[85%]">
                {isCalendarBadge ? (
                  <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                )}
                <span className="truncate">{customBadgeText || suggestedLabel || 'Válido hoy'}</span>
              </div>

              {/* Real-time status indicator in top-right */}
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md ${
                    status.statusColor === 'green'
                      ? 'bg-emerald-600/95 text-white'
                      : status.statusColor === 'amber'
                      ? 'bg-amber-600/95 text-white'
                      : 'bg-blue-600/95 text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {status.statusBadgeText}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Dropdown Selector for Badge Options based on user configuration */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Etiquetas sugeridas
              </label>
            </div>

            {/* Custom Modern Dropdown */}
            <div ref={badgeDropdownRef} className="relative">
              <button
                type="button"
                id="badge-options-dropdown-trigger"
                onClick={() => {
                  setIsBadgeDropdownOpen((prev) => !prev);
                  setBadgeSearchQuery('');
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all shadow-2xs cursor-pointer ${
                  isBadgeDropdownOpen
                    ? 'border-[#007af7] ring-2 ring-[#007af7]/20 bg-white'
                    : 'border-slate-300 hover:border-[#007af7]/60 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#007af7] flex items-center justify-center shrink-0">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {customBadgeText || 'Selecciona una etiqueta o frase...'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isBadgeDropdownOpen ? 'rotate-180 text-[#007af7]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Modern Popover Menu: Constrained inside modal container */}
              {isBadgeDropdownOpen && (
                <div
                  id="badge-options-menu"
                  className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Quick Search */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={badgeSearchQuery}
                        onChange={(e) => setBadgeSearchQuery(e.target.value)}
                        placeholder="Filtrar opción (ej: viernes, agotar...)"
                        autoFocus
                        className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#007af7] focus:ring-1 focus:ring-[#007af7]"
                      />
                      {badgeSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setBadgeSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grouped Options List */}
                  <div className="max-h-56 sm:max-h-64 overflow-y-auto p-1.5 space-y-2 overscroll-contain">
                    {filteredBadgeGroups.length === 0 ? (
                      <div className="py-5 px-3 text-center">
                        <p className="text-xs text-slate-500 font-medium">No hay sugerencias con ese término.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomBadgeText(badgeSearchQuery);
                            setIsCustomEdited(true);
                            onChange(currentSchedule, badgeSearchQuery, expiresAt);
                            setIsBadgeDropdownOpen(false);
                          }}
                          className="mt-2 text-xs font-bold text-[#007af7] hover:underline cursor-pointer"
                        >
                          Usar &ldquo;{badgeSearchQuery}&rdquo; directamente
                        </button>
                      </div>
                    ) : (
                      filteredBadgeGroups.map((group) => (
                        <div key={group.group} className="space-y-1">
                          <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>{group.group}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                              {group.items.length}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {group.items.map((item) => {
                              const isSelected = customBadgeText === item;
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    setCustomBadgeText(item);
                                    setIsCustomEdited(true);
                                    onChange(currentSchedule, item, expiresAt);
                                    setIsBadgeDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between gap-2 transition cursor-pointer active:scale-[0.99] ${
                                    isSelected
                                      ? 'bg-blue-50 text-[#007af7] font-bold border border-blue-200/60'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                  }`}
                                >
                                  <span className="truncate">{item}</span>
                                  {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-[#007af7] text-white flex items-center justify-center shrink-0 shadow-2xs">
                                      <Check className="w-3 h-3 stroke-[2.5]" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Bottom Action: Custom Text */}
                  <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomEdited(true);
                        setIsBadgeDropdownOpen(false);
                        setTimeout(() => {
                          customInputRef.current?.focus();
                        }, 50);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:bg-white hover:text-[#007af7] border border-transparent hover:border-slate-200 flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-3.5 h-3.5 text-[#007af7]" />
                        <span>Escribir texto personalizado</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Editar abajo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Editable Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Texto personalizado
              </label>
              {isCustomEdited && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomEdited(false);
                    setCustomBadgeText(suggestedLabel);
                    onChange(currentSchedule, suggestedLabel, expiresAt);
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#007af7] hover:text-[#041f5e] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar sugerido</span>
                </button>
              )}
            </div>
            <input
              ref={customInputRef}
              type="text"
              value={customBadgeText}
              onChange={(e) => {
                setCustomBadgeText(e.target.value);
                setIsCustomEdited(true);
                onChange(currentSchedule, e.target.value, expiresAt);
              }}
              placeholder="Ej: Solo los Viernes, Hasta agotar existencias..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-bold focus:border-[#007af7] focus:ring-1 focus:ring-[#007af7] focus:outline-hidden transition shadow-2xs"
            />
          </div>
        </div>
        </div>
        )}
      </div>
    </div>
  );
};
