import React, { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { DayScheduleRow } from '../types';
import { parseScheduleString } from './ScheduleSelector';

interface ScheduleReadOnlyTableProps {
  schedule?: string;
  className?: string;
}

/**
 * Format 24h time to 12h string with lowercase am/pm and leading zeros (e.g. 08:00 am, 07:00 pm)
 */
export function formatTime12hPill(time24h?: string): string {
  if (!time24h) return '-- : --';
  const clean = time24h.trim();

  // If already in 12h format e.g. "8:00 AM", normalize to "08:00 am"
  const m12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (m12) {
    const h = parseInt(m12[1], 10);
    const m = m12[2] || '00';
    const ampm = m12[3].toLowerCase();
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  }

  // 24h format "14:00" -> "02:00 pm"
  const parts = clean.split(':');
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00';
    if (!isNaN(hour)) {
      const ampm = hour >= 12 ? 'pm' : 'am';
      hour = hour % 12 || 12;
      return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
    }
  }

  return clean;
}

export const ScheduleReadOnlyTable: React.FC<ScheduleReadOnlyTableProps> = ({
  schedule,
  className = '',
}) => {
  const rows: DayScheduleRow[] = useMemo(() => {
    return parseScheduleString(schedule);
  }, [schedule]);

  const currentTodayDayIndex = new Date().getDay();

  return (
    <div
      className={`w-full max-w-md mx-auto sm:mx-0 rounded-xl border border-blue-200/90 overflow-hidden bg-white shadow-2xs ${className}`}
    >
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-[#041f5e] text-white">
            <th className="w-[36%] py-1.5 px-2.5 sm:px-3 font-bold text-[11px] sm:text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#007af7] shrink-0" />
                <span className="truncate">Día</span>
              </div>
            </th>
            <th className="w-[32%] py-1.5 px-1.5 sm:px-2 font-bold text-[11px] sm:text-xs text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#007af7] shrink-0" />
                <span className="truncate">Inicio</span>
              </div>
            </th>
            <th className="w-[32%] py-1.5 px-1.5 sm:px-2 font-bold text-[11px] sm:text-xs text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#007af7] shrink-0" />
                <span className="truncate">Fin</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const isToday = currentTodayDayIndex === row.dayIndex;
            return (
              <tr
                key={row.dia}
                className={`transition-colors ${
                  isToday
                    ? 'border-l-[3px] border-l-emerald-500 bg-blue-50/25'
                    : row.active
                    ? 'border-l-[3px] border-l-[#007af7]'
                    : 'border-l-[3px] border-l-slate-200 bg-slate-50/40 text-slate-400'
                }`}
              >
                {/* Column: Día */}
                <td className="py-1 px-2 sm:px-2.5">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span
                      className={`text-[11px] sm:text-xs font-bold truncate ${
                        row.active ? 'text-[#041f5e]' : 'text-slate-400 line-through'
                      }`}
                    >
                      {row.dia}
                    </span>
                    {isToday && (
                      <span className="text-[8px] font-black bg-[#008f5d] text-white px-1.5 py-0.5 rounded-full shadow-2xs tracking-tight uppercase shrink-0">
                        HOY
                      </span>
                    )}
                  </div>
                </td>

                {/* Column: Inicio */}
                <td className="py-1 px-1 sm:px-1.5 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-full max-w-[100px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                      row.active
                        ? 'border-blue-200/90 bg-white text-[#041f5e]'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {row.active ? formatTime12hPill(row.horaInicio) : 'Cerrado'}
                  </div>
                </td>

                {/* Column: Fin */}
                <td className="py-1 px-1 sm:px-1.5 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-full max-w-[100px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                      row.active
                        ? 'border-blue-200/90 bg-white text-[#041f5e]'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {row.active ? formatTime12hPill(row.horaFin) : 'Cerrado'}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
