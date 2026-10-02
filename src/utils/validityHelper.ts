import { ValiditySchedule, ValidityMode, DayScheduleRow } from '../types';

export interface DayOfWeekItem {
  id: number; // 0 = Domingo, 1 = Lunes, etc.
  short: string;
  name: string;
}

export const DAYS_OF_WEEK: DayOfWeekItem[] = [
  { id: 1, short: 'Lun', name: 'Lunes' },
  { id: 2, short: 'Mar', name: 'Martes' },
  { id: 3, short: 'Mié', name: 'Miércoles' },
  { id: 4, short: 'Jue', name: 'Jueves' },
  { id: 5, short: 'Vie', name: 'Viernes' },
  { id: 6, short: 'Sáb', name: 'Sábado' },
  { id: 0, short: 'Dom', name: 'Domingo' },
];

export const INITIAL_SCHEDULE_TABLE: DayScheduleRow[] = [
  { dia: 'Lunes', dayIndex: 1, active: true, horaInicio: '', horaFin: '' },
  { dia: 'Martes', dayIndex: 2, active: true, horaInicio: '', horaFin: '' },
  { dia: 'Miércoles', dayIndex: 3, active: true, horaInicio: '', horaFin: '' },
  { dia: 'Jueves', dayIndex: 4, active: true, horaInicio: '', horaFin: '' },
  { dia: 'Viernes', dayIndex: 5, active: true, horaInicio: '', horaFin: '' },
  { dia: 'Sábado', dayIndex: 6, active: true, horaInicio: '', horaFin: '' },
  { dia: 'Domingo', dayIndex: 0, active: true, horaInicio: '', horaFin: '' },
];

export const QUICK_PRESETS = [
  { id: 'today_10pm', label: 'Hoy hasta 10 PM', badge: '¡Hoy hasta las 10:00 PM!' },
  { id: 'today_night', label: 'Hoy hasta 11:59 PM', badge: 'Hoy hasta las 11:59 PM' },
  { id: 'tomorrow', label: 'Hasta mañana', badge: 'Vence mañana' },
  { id: 'weekend', label: 'Sáb a Dom', badge: 'Sábado y Domingo' },
  { id: 'fri_sun', label: 'Vie a Dom', badge: 'Viernes a Domingo' },
  { id: '3_days', label: 'Por 3 Días', badge: 'Disponible por 3 días' },
  { id: '7_days', label: 'Por 1 Semana', badge: 'Válido por 7 días' },
] as const;

export const TIME_PRESETS = [
  { label: '☕ Mañanas', start: '08:00', end: '11:30' },
  { label: '🍽️ Almuerzos', start: '12:00', end: '15:00' },
  { label: '🍹 Happy Hour', start: '16:00', end: '19:00' },
  { label: '🌙 Cenas / Noche', start: '19:00', end: '22:30' },
] as const;

export const DAY_PRESETS = [
  { label: 'Lun a Vie', days: [1, 2, 3, 4, 5] },
  { label: 'Fines de semana', days: [6, 0] },
  { label: 'Lun y Mié', days: [1, 3] },
  { label: 'Mar y Jue', days: [2, 4] },
  { label: 'Vie a Dom', days: [5, 6, 0] },
  { label: 'Todos los días', days: [1, 2, 3, 4, 5, 6, 0] },
] as const;

/**
 * Format 24h time to 12h string with AM/PM (e.g. 14:00 -> 2:00 PM)
 */
export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1] || '00';
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

/**
 * Format an array of weekday numbers into a concise Spanish text
 */
export function formatDaysOfWeek(days?: number[]): string {
  if (!days || days.length === 0) return '';
  if (days.length === 7) return 'Todos los días';

  const sorted = [...days].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));

  if (sorted.length === 5 && [1, 2, 3, 4, 5].every((d) => sorted.includes(d))) {
    return 'Lunes a Viernes';
  }
  if (sorted.length === 2 && sorted.includes(6) && sorted.includes(0)) {
    return 'Fines de semana (Sáb y Dom)';
  }
  if (sorted.length === 3 && sorted.includes(5) && sorted.includes(6) && sorted.includes(0)) {
    return 'Viernes a Domingo';
  }
  if (sorted.length === 2 && sorted.includes(1) && sorted.includes(3)) {
    return 'Lunes y Miércoles';
  }
  if (sorted.length === 2 && sorted.includes(2) && sorted.includes(4)) {
    return 'Martes y Jueves';
  }

  const dayNames = sorted.map((d) => DAYS_OF_WEEK.find((item) => item.id === d)?.name || '');
  if (dayNames.length === 1) return `Solo los ${dayNames[0]}`;
  if (dayNames.length === 2) return `${dayNames[0]} y ${dayNames[1]}`;

  const shortNames = sorted.map((d) => DAYS_OF_WEEK.find((item) => item.id === d)?.short || '');
  const last = shortNames.pop();
  return `${shortNames.join(', ')} y ${last}`;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Generate human-friendly badge text and calculated ISO expiration date
 */
export function computeValidityData(schedule: ValiditySchedule): {
  suggestedLabel: string;
  expiresAt?: string;
} {
  const now = new Date();

  switch (schedule.mode) {
    case 'quick': {
      const preset = schedule.quickPreset || 'today_10pm';
      if (preset === 'today_10pm') {
        const endOf10pm = new Date();
        endOf10pm.setHours(22, 0, 0, 0);
        return {
          suggestedLabel: '¡Hoy hasta las 10:00 PM!',
          expiresAt: endOf10pm.toISOString(),
        };
      }
      if (preset === 'today_night') {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        return {
          suggestedLabel: 'Hoy hasta las 11:59 PM',
          expiresAt: endOfDay.toISOString(),
        };
      }
      if (preset === 'tomorrow') {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        tomorrow.setHours(23, 59, 59, 999);
        return {
          suggestedLabel: 'Vence mañana',
          expiresAt: tomorrow.toISOString(),
        };
      }
      if (preset === 'weekend') {
        // Next Sunday 23:59:59
        const day = now.getDay();
        const daysUntilSunday = (7 - day) % 7 || 7;
        const sunday = new Date(now.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
        sunday.setHours(23, 59, 59, 999);
        return {
          suggestedLabel: 'Fines de semana (Sáb y Dom)',
          expiresAt: sunday.toISOString(),
        };
      }
      if (preset === 'fri_sun') {
        const day = now.getDay();
        const daysUntilSunday = (7 - day) % 7 || 7;
        const sunday = new Date(now.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
        sunday.setHours(23, 59, 59, 999);
        return {
          suggestedLabel: 'Viernes a Domingo',
          expiresAt: sunday.toISOString(),
        };
      }
      if (preset === '3_days') {
        const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        in3Days.setHours(23, 59, 59, 999);
        return {
          suggestedLabel: 'Disponible por 3 días',
          expiresAt: in3Days.toISOString(),
        };
      }
      if (preset === '7_days') {
        const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        in7Days.setHours(23, 59, 59, 999);
        return {
          suggestedLabel: 'Válido por 7 días',
          expiresAt: in7Days.toISOString(),
        };
      }
      return {
        suggestedLabel: '¡Hoy hasta las 10:00 PM!',
        expiresAt: new Date(now.setHours(22, 0, 0, 0)).toISOString(),
      };
    }

    case 'days_of_week': {
      const daysText = formatDaysOfWeek(schedule.daysOfWeek) || 'Días seleccionados';
      let label = daysText;

      if (schedule.hasTimeRange && schedule.startTime && schedule.endTime) {
        const s12 = formatTime12h(schedule.startTime);
        const e12 = formatTime12h(schedule.endTime);
        label = `${daysText} (${s12} - ${e12})`;
      }

      // ExpiresAt: If endDate provided, use that. Otherwise, extend 45 days so recurring offer stays fresh
      let expiresAt: string | undefined = undefined;
      if (schedule.endDate) {
        const [year, month, day] = schedule.endDate.split('-').map(Number);
        const exp = new Date(year, month - 1, day, 23, 59, 59, 999);
        expiresAt = exp.toISOString();
      } else {
        const in45Days = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
        in45Days.setHours(23, 59, 59, 999);
        expiresAt = in45Days.toISOString();
      }

      return { suggestedLabel: label, expiresAt };
    }

    case 'happy_hour': {
      const s12 = formatTime12h(schedule.startTime || '16:00');
      const e12 = formatTime12h(schedule.endTime || '19:00');
      let label = `Happy Hour: ${s12} a ${e12}`;

      if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && schedule.daysOfWeek.length < 7) {
        const daysText = formatDaysOfWeek(schedule.daysOfWeek);
        label = `${daysText} (${s12} - ${e12})`;
      }

      // Default expiration 45 days recurring
      const in45Days = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
      return { suggestedLabel: label, expiresAt: in45Days.toISOString() };
    }

    case 'specific_date': {
      if (!schedule.specificDate) {
        return {
          suggestedLabel: 'Fecha específica',
          expiresAt: undefined,
        };
      }
      const [y, m, d] = schedule.specificDate.split('-').map(Number);
      const timeStr = schedule.exactTime || '22:00';
      const [hour, minute] = timeStr.split(':').map(Number);
      const targetDate = new Date(y, m - 1, d, hour, minute || 0, 0);

      const monthName = MONTH_NAMES[m - 1] || '';
      const time12 = formatTime12h(timeStr);
      const label = `Hasta el ${d} de ${monthName} (${time12})`;

      return {
        suggestedLabel: label,
        expiresAt: targetDate.toISOString(),
      };
    }

    case 'table': {
      // Calculate expiresAt based on validoHasta or maximum fechaFin in table
      let expiresAt: string | undefined = undefined;
      if (schedule.validoHasta) {
        const timePart = schedule.validoHastaHora || '23:59:59';
        const [y, m, d] = schedule.validoHasta.split('-').map(Number);
        const [hh, mm] = timePart.split(':').map(Number);
        const expDate = new Date(y, m - 1, d, hh || 23, mm || 59, 59, 999);
        expiresAt = expDate.toISOString();
      } else {
        // Find maximum fechaFin from active rows
        const activeRows = (schedule.scheduleTable || []).filter((r) => r.active && r.fechaFin);
        if (activeRows.length > 0) {
          const sorted = activeRows.sort((a, b) => b.fechaFin.localeCompare(a.fechaFin));
          const latestRow = sorted[0];
          const timePart = latestRow.horaFin || '23:59:59';
          const [y, m, d] = latestRow.fechaFin.split('-').map(Number);
          const [hh, mm] = timePart.split(':').map(Number);
          const expDate = new Date(y, m - 1, d, hh || 23, mm || 59, 59, 999);
          expiresAt = expDate.toISOString();
        } else {
          // Default 30 days
          const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          in30Days.setHours(23, 59, 59, 999);
          expiresAt = in30Days.toISOString();
        }
      }

      // Generate suggested label
      const activeRows = (schedule.scheduleTable || []).filter(
        (r) => r.active && (r.horaInicio || r.horaFin || r.fechaInicio || r.fechaFin)
      );

      let label = 'Horario programado';
      if (activeRows.length > 0) {
        const activeDayIndices = activeRows.map((r) => r.dayIndex);
        const daysText = formatDaysOfWeek(activeDayIndices);

        // Check if all have the same hours
        const firstWithHours = activeRows.find((r) => r.horaInicio && r.horaFin);
        const allSameHours =
          firstWithHours &&
          activeRows.every(
            (r) => r.horaInicio === firstWithHours.horaInicio && r.horaFin === firstWithHours.horaFin
          );

        if (allSameHours && firstWithHours) {
          const s12 = formatTime12h(firstWithHours.horaInicio);
          const e12 = formatTime12h(firstWithHours.horaFin);
          label = `${daysText} (${s12} - ${e12})`;
        } else if (daysText) {
          label = `${daysText}`;
        }
      } else if (schedule.validoHasta) {
        const [y, m, d] = schedule.validoHasta.split('-').map(Number);
        const mName = MONTH_NAMES[m - 1] || '';
        label = `Válido hasta el ${d} de ${mName}`;
      }

      // If validity date is set exclusively for today (Solo hoy)
      const todayStr = new Date().toISOString().split('T')[0];
      if (
        schedule.validoDesde &&
        schedule.validoHasta &&
        schedule.validoDesde === schedule.validoHasta &&
        schedule.validoDesde === todayStr
      ) {
        const firstWithHours = activeRows.find((r) => r.horaInicio && r.horaFin);
        if (firstWithHours) {
          const s12 = formatTime12h(firstWithHours.horaInicio);
          const e12 = formatTime12h(firstWithHours.horaFin);
          label = `Solo hoy (${s12} - ${e12})`;
        } else {
          label = 'Solo hoy';
        }
      }

      return { suggestedLabel: label, expiresAt };
    }

    case 'indefinite': {
      const note = schedule.note?.trim() || 'Hasta agotar existencias';
      return {
        suggestedLabel: note,
        expiresAt: undefined,
      };
    }

    default:
      return {
        suggestedLabel: '¡Hoy hasta las 10:00 PM!',
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };
  }
}

/**
 * Evaluates whether a scheduled post applies today and in the current time window
 */
export function getScheduleStatus(schedule?: ValiditySchedule): {
  appliesToday: boolean;
  isWithinTimeWindow: boolean;
  statusBadgeText: string;
  statusColor: 'green' | 'amber' | 'blue' | 'slate';
} {
  if (!schedule) {
    return {
      appliesToday: true,
      isWithinTimeWindow: true,
      statusBadgeText: 'Vigente',
      statusColor: 'green',
    };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Dom, 1 = Lun, etc.
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (schedule.mode === 'table' && schedule.scheduleTable) {
    const todayISO = now.toISOString().split('T')[0];

    // Check if overall validoDesde has not arrived yet
    if (schedule.validoDesde && todayISO < schedule.validoDesde) {
      return {
        appliesToday: false,
        isWithinTimeWindow: false,
        statusBadgeText: `Inicia el ${schedule.validoDesde}`,
        statusColor: 'amber',
      };
    }

    // Check if overall validoHasta is exceeded
    if (schedule.validoHasta && todayISO > schedule.validoHasta) {
      return {
        appliesToday: false,
        isWithinTimeWindow: false,
        statusBadgeText: 'Vencido',
        statusColor: 'slate',
      };
    }

    const todayRow = schedule.scheduleTable.find((r) => r.dayIndex === currentDay);

    if (!todayRow || !todayRow.active) {
      const activeRows = schedule.scheduleTable.filter((r) => r.active);
      const nextDayName = getNextUpcomingDay(activeRows.map((r) => r.dayIndex), currentDay);
      return {
        appliesToday: false,
        isWithinTimeWindow: false,
        statusBadgeText: nextDayName ? `Próximo: ${nextDayName}` : 'Días programados',
        statusColor: 'amber',
      };
    }

    // Check date range of todayRow if set
    if (todayRow.fechaInicio && todayISO < todayRow.fechaInicio) {
      return {
        appliesToday: false,
        isWithinTimeWindow: false,
        statusBadgeText: `Inicia el ${todayRow.fechaInicio}`,
        statusColor: 'amber',
      };
    }
    if (todayRow.fechaFin && todayISO > todayRow.fechaFin) {
      return {
        appliesToday: false,
        isWithinTimeWindow: false,
        statusBadgeText: 'Finalizó este ciclo',
        statusColor: 'slate',
      };
    }

    // Check time range if set
    if (todayRow.horaInicio && todayRow.horaFin) {
      const [sh, sm] = todayRow.horaInicio.split(':').map(Number);
      const [eh, em] = todayRow.horaFin.split(':').map(Number);
      const startMin = sh * 60 + (sm || 0);
      const endMin = eh * 60 + (em || 0);

      if (currentMinutes < startMin) {
        return {
          appliesToday: true,
          isWithinTimeWindow: false,
          statusBadgeText: `Inicia hoy a las ${formatTime12h(todayRow.horaInicio)}`,
          statusColor: 'amber',
        };
      }
      if (currentMinutes > endMin) {
        return {
          appliesToday: true,
          isWithinTimeWindow: false,
          statusBadgeText: 'Finalizó por hoy',
          statusColor: 'amber',
        };
      }
      return {
        appliesToday: true,
        isWithinTimeWindow: true,
        statusBadgeText: '¡Aplica hoy!',
        statusColor: 'green',
      };
    }

    return {
      appliesToday: true,
      isWithinTimeWindow: true,
      statusBadgeText: '¡Aplica hoy!',
      statusColor: 'green',
    };
  }

  let appliesToday = true;
  if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
    appliesToday = schedule.daysOfWeek.includes(currentDay);
  }

  let isWithinTimeWindow = true;
  if (schedule.hasTimeRange && schedule.startTime && schedule.endTime) {
    const [sh, sm] = schedule.startTime.split(':').map(Number);
    const [eh, em] = schedule.endTime.split(':').map(Number);
    const startMin = sh * 60 + (sm || 0);
    const endMin = eh * 60 + (em || 0);
    isWithinTimeWindow = currentMinutes >= startMin && currentMinutes <= endMin;
  }

  if (schedule.mode === 'indefinite') {
    return {
      appliesToday: true,
      isWithinTimeWindow: true,
      statusBadgeText: 'Permanente',
      statusColor: 'blue',
    };
  }

  if (!appliesToday) {
    const nextDayName = getNextUpcomingDay(schedule.daysOfWeek, currentDay);
    return {
      appliesToday: false,
      isWithinTimeWindow: false,
      statusBadgeText: nextDayName ? `Próximo: ${nextDayName}` : 'Días programados',
      statusColor: 'amber',
    };
  }

  if (schedule.hasTimeRange && !isWithinTimeWindow) {
    const [sh] = (schedule.startTime || '00:00').split(':').map(Number);
    const isBefore = currentMinutes < sh * 60;
    return {
      appliesToday: true,
      isWithinTimeWindow: false,
      statusBadgeText: isBefore ? `Inicia a las ${formatTime12h(schedule.startTime)}` : 'Finalizó por hoy',
      statusColor: 'amber',
    };
  }

  return {
    appliesToday: true,
    isWithinTimeWindow: true,
    statusBadgeText: '¡Aplica hoy!',
    statusColor: 'green',
  };
}

function getNextUpcomingDay(daysOfWeek?: number[], currentDay: number = 0): string | null {
  if (!daysOfWeek || daysOfWeek.length === 0) return null;
  for (let offset = 1; offset <= 7; offset++) {
    const checkDay = (currentDay + offset) % 7;
    if (daysOfWeek.includes(checkDay)) {
      return DAYS_OF_WEEK.find((d) => d.id === checkDay)?.name || null;
    }
  }
  return null;
}
