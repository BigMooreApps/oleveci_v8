import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  Table as TableIcon,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { ModernTimePicker } from './ModernTimePicker';
import { DayScheduleRow } from '../types';

export interface ScheduleSelectorProps {
  value: string;
  onChange: (schedule: string) => void;
  title?: string;
  embedded?: boolean;
}

// Backward compatibility export if needed
export interface DaySchedule {
  key: string;
  label: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export const DAYS_ORDER: { dia: DayScheduleRow['dia']; short: string; dayIndex: number }[] = [
  { dia: 'Lunes', short: 'Lun', dayIndex: 1 },
  { dia: 'Martes', short: 'Mar', dayIndex: 2 },
  { dia: 'Miércoles', short: 'Mié', dayIndex: 3 },
  { dia: 'Jueves', short: 'Jue', dayIndex: 4 },
  { dia: 'Viernes', short: 'Vie', dayIndex: 5 },
  { dia: 'Sábado', short: 'Sáb', dayIndex: 6 },
  { dia: 'Domingo', short: 'Dom', dayIndex: 0 },
];

/**
 * Convert time string (12h or 24h) to "HH:mm" (24h)
 */
function parseTimeTo24h(t: string): string {
  if (!t) return '';
  const clean = t.trim().toUpperCase();
  // 12h format e.g. "08:00 AM", "8:00 PM", "8 PM", "8:30am"
  const m12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const m = m12[2] ? parseInt(m12[2], 10) : 0;
    const isPm = m12[3].toUpperCase() === 'PM';
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  // 24h format "14:00"
  const m24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = parseInt(m24[1], 10);
    const m = parseInt(m24[2], 10);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  return '';
}

/**
 * Format 24h time to 12h string with AM/PM (e.g. 14:00 -> 2:00 PM)
 */
function formatTime12h(time24h?: string): string {
  if (!time24h) return '';
  const parts = time24h.split(':');
  if (parts.length < 2) return time24h;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1] || '00';
  if (isNaN(hour)) return time24h;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function normalizeDayName(name: string): DayScheduleRow['dia'] | null {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  if (n.startsWith('lun')) return 'Lunes';
  if (n.startsWith('mar')) return 'Martes';
  if (n.startsWith('mi') || n.startsWith('mí')) return 'Miércoles';
  if (n.startsWith('jue')) return 'Jueves';
  if (n.startsWith('vie')) return 'Viernes';
  if (n.startsWith('s') || n.startsWith('sab') || n.startsWith('sáb')) return 'Sábado';
  if (n.startsWith('dom')) return 'Domingo';
  return null;
}

function setRowsRange(
  rows: DayScheduleRow[],
  startDay: DayScheduleRow['dia'],
  endDay: DayScheduleRow['dia'],
  active: boolean,
  horaInicio: string,
  horaFin: string
) {
  const dayNames: DayScheduleRow['dia'][] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  const idx1 = dayNames.indexOf(startDay);
  const idx2 = dayNames.indexOf(endDay);
  if (idx1 === -1 || idx2 === -1) return;

  const min = Math.min(idx1, idx2);
  const max = Math.max(idx1, idx2);

  for (let i = min; i <= max; i++) {
    const targetName = dayNames[i];
    const row = rows.find((r) => r.dia === targetName);
    if (row) {
      row.active = active;
      if (active) {
        row.horaInicio = horaInicio;
        row.horaFin = horaFin;
      }
    }
  }
}

/**
 * Parse an existing schedule string (e.g. "Lun - Sáb: 8:00 AM - 7:00 PM | Dom: Cerrado") into DayScheduleRow[]
 */
export function parseScheduleString(raw?: string): DayScheduleRow[] {
  const rows: DayScheduleRow[] = DAYS_ORDER.map((d) => ({
    dia: d.dia,
    dayIndex: d.dayIndex,
    active: d.dia !== 'Domingo',
    horaInicio: d.dia !== 'Domingo' ? '08:00' : '',
    horaFin: d.dia === 'Sábado' ? '17:00' : d.dia !== 'Domingo' ? '19:00' : '',
  }));

  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return rows;
  }

  const clean = raw.trim();

  // 24 hours
  if (/24\s*h/i.test(clean) || /24\s*hora/i.test(clean)) {
    return rows.map((r) => ({
      ...r,
      active: true,
      horaInicio: '00:00',
      horaFin: '23:59',
    }));
  }

  // Check if "Todos los días"
  const allDaysMatch = clean.match(
    /(?:todos los d[ií]as|lun\s*-\s*dom)\s*:\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
  );
  if (allDaysMatch) {
    const start24 = parseTimeTo24h(allDaysMatch[1]) || '08:00';
    const end24 = parseTimeTo24h(allDaysMatch[2]) || '20:00';
    return rows.map((r) => ({
      ...r,
      active: true,
      horaInicio: start24,
      horaFin: end24,
    }));
  }

  const segments = clean.split(/[|;]/).map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return rows;

  for (const seg of segments) {
    // Closed match
    const closedMatch = seg.match(/([A-Za-zÁ-ú]+)(?:\s*-\s*([A-Za-zÁ-ú]+))?\s*:\s*cerrado/i);
    if (closedMatch) {
      const d1 = normalizeDayName(closedMatch[1]);
      const d2 = closedMatch[2] ? normalizeDayName(closedMatch[2]) : d1;
      if (d1 && d2) {
        setRowsRange(rows, d1, d2, false, '', '');
      }
      continue;
    }

    // Range match with hours
    const rangeMatch = seg.match(
      /([A-Za-zÁ-ú]+)\s*-\s*([A-Za-zÁ-ú]+)\s*:\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
    );
    if (rangeMatch) {
      const d1 = normalizeDayName(rangeMatch[1]);
      const d2 = normalizeDayName(rangeMatch[2]);
      const start24 = parseTimeTo24h(rangeMatch[3]);
      const end24 = parseTimeTo24h(rangeMatch[4]);
      if (d1 && d2 && start24 && end24) {
        setRowsRange(rows, d1, d2, true, start24, end24);
      }
      continue;
    }

    // Single day with hours
    const singleMatch = seg.match(
      /([A-Za-zÁ-ú]+)\s*:\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
    );
    if (singleMatch) {
      const d = normalizeDayName(singleMatch[1]);
      const start24 = parseTimeTo24h(singleMatch[2]);
      const end24 = parseTimeTo24h(singleMatch[3]);
      if (d && start24 && end24) {
        setRowsRange(rows, d, d, true, start24, end24);
      }
    }
  }

  return rows;
}

/**
 * Format rows into public-facing readable schedule string
 */
export function formatRowsToScheduleString(rows: DayScheduleRow[]): string {
  const activeRows = rows.filter((r) => r.active && r.horaInicio && r.horaFin);
  if (activeRows.length === 0) {
    return 'Cerrado temporalmente';
  }

  const shortNames: Record<string, string> = {
    Lunes: 'Lun',
    Martes: 'Mar',
    Miércoles: 'Mié',
    Jueves: 'Jue',
    Viernes: 'Vie',
    Sábado: 'Sáb',
    Domingo: 'Dom',
  };

  type Group = {
    startShort: string;
    endShort: string;
    isOpen: boolean;
    horaInicio: string;
    horaFin: string;
  };

  const groups: Group[] = [];
  let currentGroup: Group | null = null;

  for (const r of rows) {
    const isOpen = r.active && Boolean(r.horaInicio && r.horaFin);
    const short = shortNames[r.dia] || r.dia;

    if (!currentGroup) {
      currentGroup = {
        startShort: short,
        endShort: short,
        isOpen,
        horaInicio: r.horaInicio,
        horaFin: r.horaFin,
      };
    } else {
      const sameState =
        currentGroup.isOpen === isOpen &&
        (!isOpen || (currentGroup.horaInicio === r.horaInicio && currentGroup.horaFin === r.horaFin));

      if (sameState) {
        currentGroup.endShort = short;
      } else {
        groups.push(currentGroup);
        currentGroup = {
          startShort: short,
          endShort: short,
          isOpen,
          horaInicio: r.horaInicio,
          horaFin: r.horaFin,
        };
      }
    }
  }
  if (currentGroup) {
    groups.push(currentGroup);
  }

  // If all 7 days open with same hours
  if (
    groups.length === 1 &&
    groups[0].isOpen &&
    groups[0].startShort === 'Lun' &&
    groups[0].endShort === 'Dom'
  ) {
    return `Todos los días: ${formatTime12h(groups[0].horaInicio)} - ${formatTime12h(groups[0].horaFin)}`;
  }

  return groups
    .map((g) => {
      const dayRange = g.startShort === g.endShort ? g.startShort : `${g.startShort} - ${g.endShort}`;
      if (!g.isOpen) {
        return `${dayRange}: Cerrado`;
      }
      return `${dayRange}: ${formatTime12h(g.horaInicio)} - ${formatTime12h(g.horaFin)}`;
    })
    .join(' | ');
}

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  value,
  onChange,
  title = 'Horario de atención',
  embedded = false,
}) => {
  const [scheduleTable, setScheduleTable] = useState<DayScheduleRow[]>(() =>
    parseScheduleString(value)
  );
  const [isDaysHoursOpen, setIsDaysHoursOpen] = useState<boolean>(false);

  // Keep track of internal updates to avoid echo loops
  const lastEmittedValueRef = useRef<string>(value);

  // Sync if external value changed drastically
  useEffect(() => {
    if (value && value !== lastEmittedValueRef.current) {
      const newRows = parseScheduleString(value);
      setScheduleTable(newRows);
      lastEmittedValueRef.current = value;
    }
  }, [value]);

  // When scheduleTable changes, notify parent
  useEffect(() => {
    const formatted = formatRowsToScheduleString(scheduleTable);
    if (formatted !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = formatted;
      onChange(formatted);
    }
  }, [scheduleTable, onChange]);

  const currentTodayDayIndex = new Date().getDay();

  // Handlers for table rows
  const handleUpdateRow = (index: number, field: keyof DayScheduleRow, val: any) => {
    setScheduleTable((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleToggleDayActive = (index: number) => {
    setScheduleTable((prev) => {
      const next = [...prev];
      const target = next[index];
      const willBeActive = !target.active;
      let start = target.horaInicio;
      let end = target.horaFin;
      if (willBeActive && (!start || !end)) {
        const activeSample = prev.find((r) => r.active && r.horaInicio && r.horaFin);
        start = start || activeSample?.horaInicio || '08:00';
        end = end || activeSample?.horaFin || '19:00';
      }
      next[index] = {
        ...target,
        active: willBeActive,
        horaInicio: start,
        horaFin: end,
      };
      return next;
    });
  };

  const handleSelectDaysPreset = (
    preset: 'all' | 'today' | 'weekdays' | 'fri_sun' | 'weekends' | 'clear'
  ) => {
    setScheduleTable((prev) => {
      const firstActive = prev.find((r) => r.active && r.horaInicio && r.horaFin);
      const defaultStart = firstActive?.horaInicio || '08:00';
      const defaultEnd = firstActive?.horaFin || '19:00';

      return prev.map((row) => {
        if (preset === 'all') {
          return {
            ...row,
            active: true,
            horaInicio: row.horaInicio || defaultStart,
            horaFin: row.horaFin || defaultEnd,
          };
        }
        if (preset === 'today') {
          const isToday = row.dayIndex === currentTodayDayIndex;
          return {
            ...row,
            active: isToday,
            horaInicio: isToday ? row.horaInicio || defaultStart : row.horaInicio,
            horaFin: isToday ? row.horaFin || defaultEnd : row.horaFin,
          };
        }
        if (preset === 'weekdays') {
          const isWeekday = row.dayIndex >= 1 && row.dayIndex <= 5;
          return {
            ...row,
            active: isWeekday,
            horaInicio: isWeekday ? row.horaInicio || defaultStart : row.horaInicio,
            horaFin: isWeekday ? row.horaFin || defaultEnd : row.horaFin,
          };
        }
        if (preset === 'fri_sun') {
          const isFriSun = row.dayIndex === 5 || row.dayIndex === 6 || row.dayIndex === 0;
          return {
            ...row,
            active: isFriSun,
            horaInicio: isFriSun ? row.horaInicio || defaultStart : row.horaInicio,
            horaFin: isFriSun ? row.horaFin || defaultEnd : row.horaFin,
          };
        }
        if (preset === 'weekends') {
          const isWeekend = row.dayIndex === 6 || row.dayIndex === 0;
          return {
            ...row,
            active: isWeekend,
            horaInicio: isWeekend ? row.horaInicio || defaultStart : row.horaInicio,
            horaFin: isWeekend ? row.horaFin || defaultEnd : row.horaFin,
          };
        }
        if (preset === 'clear') {
          return {
            ...row,
            active: false,
          };
        }
        return row;
      });
    });
  };

  const handleApplyTimeToAllActive = (field: 'horaInicio' | 'horaFin', time: string) => {
    setScheduleTable((prev) =>
      prev.map((row) => (row.active ? { ...row, [field]: time } : row))
    );
  };

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

  const getPresetButtonClass = (isActive: boolean, hasActiveInGroup: boolean) => {
    if (isActive) {
      return 'px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#041f5e] to-[#0056d6] text-white border border-[#041f5e] text-[10px] sm:text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap';
    }
    if (hasActiveInGroup) {
      return 'px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 border border-slate-200/80 text-[10px] sm:text-[11px] font-semibold transition-all shadow-2xs cursor-pointer hover:bg-slate-200/80 hover:text-slate-600 active:scale-95 whitespace-nowrap';
    }
    return 'px-2.5 py-1 rounded-lg bg-[#F8FAFD] hover:bg-[#F0F4FA] hover:text-[#0056d6] text-slate-700 border border-slate-200/90 text-[10px] sm:text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap';
  };

  const formattedSummary = useMemo(
    () => formatRowsToScheduleString(scheduleTable),
    [scheduleTable]
  );

  const renderScheduleBody = (withTopBorder = true) => (
    <div className={`space-y-3 animate-in fade-in duration-150 ${withTopBorder ? 'pt-1 border-t border-slate-100' : ''}`}>
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
                  <span>
                    <span className="hidden xs:inline">Hora </span>Inicio
                  </span>
                </div>
              </th>
              <th className="py-2 sm:py-2.5 px-2 sm:px-3 rounded-tr-2xl">
                <div className="flex items-center gap-1 text-blue-100">
                  <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#007af7] shrink-0" />
                  <span>
                    <span className="hidden xs:inline">Hora </span>Fin
                  </span>
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
                  {/* Column: Dia */}
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
  );

  if (embedded) {
    return renderScheduleBody(false);
  }

  return (
    <div
      className={`bg-white/95 rounded-2xl border border-slate-200/90 shadow-[0_2px_14px_rgba(4,31,94,0.04)] hover:border-slate-300/80 transition-all p-3.5 sm:p-4 ${
        isDaysHoursOpen ? 'space-y-3' : ''
      }`}
    >
      {/* Header bar */}
      <button
        type="button"
        id="reg-schedule-toggle"
        onClick={() => setIsDaysHoursOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
        aria-expanded={isDaysHoursOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#007af7] to-[#041f5e] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold text-[#041f5e] group-hover:text-[#007af7] transition">
            {title}
          </h4>
        </div>
        <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isDaysHoursOpen ? 'rotate-180 text-[#007af7]' : ''
            }`}
          />
        </div>
      </button>

      {isDaysHoursOpen && renderScheduleBody(true)}
    </div>
  );
};
