import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Copy, ChevronUp, ChevronDown } from 'lucide-react';

interface ModernTimePickerProps {
  value: string; // "HH:mm" (24h) or ""
  onChange: (time24h: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  align?: 'left' | 'right';
  onApplyToAll?: (time24h: string) => void;
}

// Convert 24h string to 12h parts, snapping minutes to 15-min intervals
function parse24h(time24h: string): { hour12: number; minute: number; ampm: 'am' | 'pm' } {
  if (!time24h) {
    return { hour12: 8, minute: 0, ampm: 'am' };
  }
  const parts = time24h.split(':');
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10) || 0;
  if (isNaN(h)) h = 8;

  // Snap to 15-minute intervals (0, 15, 30, 45)
  const roundedM = Math.round(m / 15) * 15;
  m = roundedM >= 60 ? 45 : roundedM;

  const ampm: 'am' | 'pm' = h >= 12 ? 'pm' : 'am';
  const hour12 = h % 12 || 12;
  return { hour12, minute: m, ampm };
}

// Convert 12h parts back to "HH:mm" (24h)
function to24h(hour12: number, minute: number, ampm: 'am' | 'pm'): string {
  let h = hour12 % 12;
  if (ampm === 'pm') h += 12;
  const hStr = h.toString().padStart(2, '0');
  const mStr = minute.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
}

// Format 24h time to 12h string (e.g. "08:00 am")
function formatDisplayTime(time24h: string): string {
  if (!time24h) return '';
  const { hour12, minute, ampm } = parse24h(time24h);
  return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];

const ITEM_HEIGHT = 38; // Compact item height (38px instead of 44px)
const VISIBLE_COUNT = 3; // 3 visible items (1 above, 1 selected in center, 1 below)

interface WheelColumnProps<T> {
  items: readonly T[] | T[];
  value: T;
  onChange: (val: T) => void;
  formatItem?: (val: T) => string;
}

function WheelColumn<T extends string | number>({
  items,
  value,
  onChange,
  formatItem,
}: WheelColumnProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const currentIndex = items.indexOf(value);
  const centerPadding = Math.floor(VISIBLE_COUNT / 2) * ITEM_HEIGHT; // 38px

  // Programmatic scroll to selected item when value changes
  useEffect(() => {
    if (!containerRef.current || isScrollingRef.current) return;
    const targetTop = (currentIndex >= 0 ? currentIndex : 0) * ITEM_HEIGHT;
    if (Math.abs(containerRef.current.scrollTop - targetTop) > 1) {
      containerRef.current.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    const scrollTop = e.currentTarget.scrollTop;
    const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, rawIndex));

    if (items[clampedIndex] !== undefined && items[clampedIndex] !== value) {
      onChange(items[clampedIndex]);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      if (containerRef.current) {
        const snapTop = clampedIndex * ITEM_HEIGHT;
        if (Math.abs(containerRef.current.scrollTop - snapTop) > 1) {
          containerRef.current.scrollTo({
            top: snapTop,
            behavior: 'smooth',
          });
        }
      }
    }, 120);
  };

  const handleItemClick = (idx: number) => {
    if (items[idx] === undefined) return;
    onChange(items[idx]);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: idx * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      // Scroll down
      const nextIdx = Math.min(items.length - 1, (currentIndex >= 0 ? currentIndex : 0) + 1);
      handleItemClick(nextIdx);
    } else if (e.deltaY < 0) {
      // Scroll up
      const prevIdx = Math.max(0, (currentIndex >= 0 ? currentIndex : 0) - 1);
      handleItemClick(prevIdx);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onWheel={handleWheel}
      className="relative flex-1 overflow-y-scroll scroll-smooth snap-y snap-mandatory select-none text-center z-10 overscroll-contain touch-pan-y"
      style={{
        height: VISIBLE_COUNT * ITEM_HEIGHT,
        paddingTop: centerPadding,
        paddingBottom: centerPadding,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {items.map((item, idx) => {
        const isSelected = idx === currentIndex;
        const distance = Math.abs(idx - (currentIndex >= 0 ? currentIndex : 0));
        const display = formatItem ? formatItem(item) : String(item);

        return (
          <div
            key={`${item}-${idx}`}
            onClick={() => handleItemClick(idx)}
            className={`flex items-center justify-center cursor-pointer transition-all duration-150 snap-center select-none ${
              isSelected
                ? 'font-bold text-slate-900 text-2xl sm:text-3xl opacity-100 scale-100'
                : distance === 1
                ? 'font-medium text-slate-400 text-base sm:text-lg opacity-50 scale-90'
                : 'font-light text-slate-300 text-xs opacity-20 scale-75'
            }`}
            style={{ height: ITEM_HEIGHT }}
          >
            {display}
          </div>
        );
      })}
    </div>
  );
}

export const ModernTimePicker: React.FC<ModernTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '-- : --',
  label,
  onApplyToAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Decompose current value
  const parsed = useMemo(() => parse24h(value), [value]);

  // Local states for instant responsive updates
  const [selectedHour, setSelectedHour] = useState<number>(parsed.hour12);
  const [selectedMinute, setSelectedMinute] = useState<number>(parsed.minute);
  const [selectedAmPm, setSelectedAmPm] = useState<'am' | 'pm'>(parsed.ampm);

  // Synchronize state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedHour(parsed.hour12);
      setSelectedMinute(parsed.minute);
      setSelectedAmPm(parsed.ampm);
    }
  }, [parsed, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const updateTime = useCallback(
    (h: number, m: number, ap: 'am' | 'pm') => {
      setSelectedHour(h);
      setSelectedMinute(m);
      setSelectedAmPm(ap);
      onChange(to24h(h, m, ap));
    },
    [onChange]
  );

  const stepHour = (delta: number) => {
    let next = selectedHour + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    updateTime(next, selectedMinute, selectedAmPm);
  };

  const stepMinute = (delta: number) => {
    const currentIdx = MINUTES.indexOf(selectedMinute);
    let nextIdx = (currentIdx >= 0 ? currentIdx : 0) + delta;
    if (nextIdx >= MINUTES.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = MINUTES.length - 1;
    updateTime(selectedHour, MINUTES[nextIdx], selectedAmPm);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleConfirm = () => {
    updateTime(selectedHour, selectedMinute, selectedAmPm);
    setIsOpen(false);
  };

  const formattedDisplay = value ? formatDisplayTime(value) : '';

  return (
    <div className="relative inline-block w-full">
      {/* Trigger Button - Clean cell display */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(true);
        }}
        className={`w-full flex items-center justify-center px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs sm:text-sm transition-all select-none cursor-pointer ${
          disabled
            ? 'bg-slate-100/70 border-slate-200 text-slate-300 cursor-not-allowed pointer-events-none'
            : isOpen
            ? 'bg-blue-50/90 border-[#007af7] ring-2 ring-blue-100 text-slate-900 shadow-xs'
            : value
            ? 'bg-white border-blue-200 hover:border-[#007af7] text-[#041f5e] font-bold shadow-2xs'
            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-400 font-medium hover:text-slate-600 shadow-2xs'
        }`}
      >
        <span className="truncate tracking-tight font-bold text-center">
          {formattedDisplay || placeholder}
        </span>
      </button>

      {/* Compact & Ultra-Fluid Modal */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 backdrop-blur-2xs p-3 animate-in fade-in duration-150"
            onClick={handleConfirm}
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[280px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 space-y-3 animate-in zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>Hora</span>
                  </h3>
                  {label && (
                    <p className="text-[11px] text-blue-600 font-medium truncate">
                      {label}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Picker: Hours & Minutes Wheel with Steppers + AM/PM Segmented Toggle */}
              <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-100">
                <div className="flex items-center justify-between gap-1.5">
                  {/* Hours Column with Stepper */}
                  <div className="flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => stepHour(1)}
                      className="p-1 text-slate-400 hover:text-blue-600 active:scale-90 transition rounded-lg hover:bg-white cursor-pointer"
                      title="Hora siguiente"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <div className="relative w-full h-[114px] flex items-center justify-center overflow-hidden">
                      {/* Highlight bar */}
                      <div className="absolute inset-x-0 top-[38px] h-[38px] bg-white rounded-xl shadow-2xs border border-blue-100 pointer-events-none z-0" />
                      <WheelColumn
                        items={HOURS}
                        value={selectedHour}
                        onChange={(h) => updateTime(h, selectedMinute, selectedAmPm)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => stepHour(-1)}
                      className="p-1 text-slate-400 hover:text-blue-600 active:scale-90 transition rounded-lg hover:bg-white cursor-pointer"
                      title="Hora anterior"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Colon Separator */}
                  <div className="text-2xl font-black text-slate-400 select-none pb-0.5">
                    :
                  </div>

                  {/* Minutes Column with Stepper */}
                  <div className="flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => stepMinute(1)}
                      className="p-1 text-slate-400 hover:text-blue-600 active:scale-90 transition rounded-lg hover:bg-white cursor-pointer"
                      title="Minuto siguiente"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <div className="relative w-full h-[114px] flex items-center justify-center overflow-hidden">
                      {/* Highlight bar */}
                      <div className="absolute inset-x-0 top-[38px] h-[38px] bg-white rounded-xl shadow-2xs border border-blue-100 pointer-events-none z-0" />
                      <WheelColumn
                        items={MINUTES}
                        value={selectedMinute}
                        onChange={(m) => updateTime(selectedHour, m, selectedAmPm)}
                        formatItem={(m) => m.toString().padStart(2, '0')}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => stepMinute(-1)}
                      className="p-1 text-slate-400 hover:text-blue-600 active:scale-90 transition rounded-lg hover:bg-white cursor-pointer"
                      title="Minuto anterior"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* AM / PM Segmented Toggle (Instant 1-tap, no scrolling required) */}
                  <div className="flex flex-col items-center justify-center pl-1">
                    <div className="bg-slate-200/80 p-1 rounded-xl flex flex-col gap-1 shadow-inner">
                      <button
                        type="button"
                        onClick={() => updateTime(selectedHour, selectedMinute, 'am')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedAmPm === 'am'
                            ? 'bg-[#007af7] text-white shadow-xs scale-105'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => updateTime(selectedHour, selectedMinute, 'pm')}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedAmPm === 'pm'
                            ? 'bg-[#007af7] text-white shadow-xs scale-105'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="pt-1 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  {value && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    >
                      Borrar
                    </button>
                  )}

                  {onApplyToAll && value && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyToAll(value);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#007af7] hover:text-[#041f5e] px-2 py-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                      title="Copiar esta hora a todos los días activos"
                    >
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Copiar a todos</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#007af7] to-[#041f5e] text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition cursor-pointer ml-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Listo</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

