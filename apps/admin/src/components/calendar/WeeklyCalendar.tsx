'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AppointmentWithDetails, DoctorWithStats } from '@/lib/api';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export interface WeeklyCalendarProps {
  appointments: AppointmentWithDetails[];
  onAppointmentClick?: (appointment: AppointmentWithDetails) => void;
  onStatusChange?: (id: string, status: string) => void;
  /** All doctors (with schedules) for available-slot visualization */
  doctors?: DoctorWithStats[];
  /** Currently filtered doctor id — limits slot visualization */
  selectedDoctor?: string;
  /** Called when an empty slot is clicked */
  onSlotClick?: (date: string, time: string, doctorId?: string) => void;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  loading?: boolean;
}

interface PositionedAppointment extends AppointmentWithDetails {
  column: number;
  totalColumns: number;
  top: number;
  height: number;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  PENDING: { bg: 'bg-amber-50', border: 'border-l-amber-400', text: 'text-amber-800', hover: 'hover:bg-amber-100/80' },
  PAID: { bg: 'bg-blue-50', border: 'border-l-blue-400', text: 'text-blue-800', hover: 'hover:bg-blue-100/80' },
  CONFIRMED: { bg: 'bg-emerald-50', border: 'border-l-emerald-400', text: 'text-emerald-800', hover: 'hover:bg-emerald-100/80' },
  CANCELLED: { bg: 'bg-red-50', border: 'border-l-red-400', text: 'text-red-800', hover: 'hover:bg-red-100/80' },
  NO_SHOW: { bg: 'bg-orange-50', border: 'border-l-orange-400', text: 'text-orange-800', hover: 'hover:bg-orange-100/80' },
  COMPLETED: { bg: 'bg-slate-50', border: 'border-l-slate-400', text: 'text-slate-600', hover: 'hover:bg-slate-100' },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Хүлээгдэж буй',
  PAID: 'Төлбөр орсон',
  CONFIRMED: 'Баталгаажсан',
  COMPLETED: 'Дууссан',
  NO_SHOW: 'Ирээгүй',
  CANCELLED: 'Цуцлагдсан',
};

const WEEKDAYS_SHORT = ['Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям', 'Ням'];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getWeekDates = (date: Date): Date[] => {
  const current = new Date(date);
  const dayOfWeek = current.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start from Monday
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + diff);
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// ==========================================
// OVERLAP CALCULATION (CRITICAL FOR UX)
// ==========================================

const calculateOverlaps = (
  appointments: AppointmentWithDetails[],
  startHour: number,
  slotDuration: number
): PositionedAppointment[] => {
  if (appointments.length === 0) return [];

  const pixelsPerMinute = 60 / slotDuration; // 2px per minute for 30min slots
  const startOfDay = startHour * 60;

  // Sort by start time, then by duration (longer first)
  const sorted = [...appointments].sort((a, b) => {
    const aStart = timeToMinutes(a.time);
    const bStart = timeToMinutes(b.time);
    if (aStart !== bStart) return aStart - bStart;
    // Assume 30 min default duration if not specified
    return 0;
  });

  // Find overlapping groups using interval scheduling
  const positioned: PositionedAppointment[] = [];
  const columns: number[] = []; // Track end time of each column

  for (const apt of sorted) {
    const aptStart = timeToMinutes(apt.time);
    const aptEnd = aptStart + 30; // Default 30 min appointments

    // Find first available column
    let column = 0;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i] <= aptStart) {
        column = i;
        break;
      }
      column = i + 1;
    }

    // Update or add column
    if (column < columns.length) {
      columns[column] = aptEnd;
    } else {
      columns.push(aptEnd);
    }

    const top = (aptStart - startOfDay) * pixelsPerMinute;
    const height = 30 * pixelsPerMinute; // 30 min default

    positioned.push({
      ...apt,
      column,
      totalColumns: 1, // Will be updated
      top,
      height: Math.max(height, 40), // Minimum height for readability
    });
  }

  // Update totalColumns for all items in overlapping groups
  const maxColumns = columns.length;
  return positioned.map((p) => ({
    ...p,
    totalColumns: maxColumns,
  }));
};

// Group appointments by overlap
const groupOverlappingAppointments = (
  appointments: AppointmentWithDetails[],
  startHour: number,
  slotDuration: number
): PositionedAppointment[] => {
  if (appointments.length === 0) return [];

  const pixelsPerMinute = 60 / slotDuration;
  const startOfDay = startHour * 60;

  // Sort appointments by start time
  const sorted = [...appointments].sort((a, b) => 
    timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  // Find overlapping groups
  const groups: AppointmentWithDetails[][] = [];
  let currentGroup: AppointmentWithDetails[] = [];
  let groupEnd = 0;

  for (const apt of sorted) {
    const aptStart = timeToMinutes(apt.time);
    const aptEnd = aptStart + 30;

    if (currentGroup.length === 0 || aptStart < groupEnd) {
      currentGroup.push(apt);
      groupEnd = Math.max(groupEnd, aptEnd);
    } else {
      groups.push(currentGroup);
      currentGroup = [apt];
      groupEnd = aptEnd;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Position appointments within each group
  const positioned: PositionedAppointment[] = [];

  for (const group of groups) {
    const columns: { end: number; apt: AppointmentWithDetails }[][] = [];

    for (const apt of group) {
      const aptStart = timeToMinutes(apt.time);
      const aptEnd = aptStart + 30;

      // Find available column
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col][columns[col].length - 1];
        if (lastInCol.end <= aptStart) {
          columns[col].push({ end: aptEnd, apt });
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([{ end: aptEnd, apt }]);
      }
    }

    // Create positioned appointments
    const totalColumns = columns.length;
    for (let col = 0; col < columns.length; col++) {
      for (const { apt } of columns[col]) {
        const aptStart = timeToMinutes(apt.time);
        const top = (aptStart - startOfDay) * pixelsPerMinute;
        const height = 30 * pixelsPerMinute;

        positioned.push({
          ...apt,
          column: col,
          totalColumns,
          top,
          height: Math.max(height, 40),
        });
      }
    }
  }

  return positioned;
};

// ==========================================
// APPOINTMENT BLOCK COMPONENT
// ==========================================

interface AppointmentBlockProps {
  appointment: PositionedAppointment;
  onClick: () => void;
}

const AppointmentBlock = ({ appointment, onClick }: AppointmentBlockProps) => {
  const colors = STATUS_COLORS[appointment.status] || STATUS_COLORS.PENDING;
  const width = `calc(${100 / appointment.totalColumns}% - 4px)`;
  const left = `calc(${(appointment.column / appointment.totalColumns) * 100}% + 2px)`;

  return (
    <div
      onClick={onClick}
      className={`absolute rounded-md border-l-[3px] px-2 py-1 cursor-pointer transition-all
        ${colors.bg} ${colors.border} ${colors.text} ${colors.hover}
        hover:shadow-sm hover:z-20 overflow-hidden`}
      style={{
        top: `${appointment.top}px`,
        height: `${appointment.height}px`,
        width,
        left,
        minHeight: '40px',
      }}
      title={`${appointment.patient.name} - ${appointment.doctor.name}`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-bold truncate font-mono">
            {appointment.time}
          </span>
        </div>
        <div className="text-[11px] font-medium truncate mt-0.5">
          {appointment.patient.name}
        </div>
        {appointment.height > 50 && (
          <div className="text-[10px] opacity-60 truncate">
            {appointment.doctor.name}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TIME GRID COMPONENT
// ==========================================

interface TimeGridProps {
  startHour: number;
  endHour: number;
  slotDuration: number;
}

const TimeGrid = ({ startHour, endHour, slotDuration }: TimeGridProps) => {
  const slots: number[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(hour * 60);
  }

  const pixelsPerHour = 60 * (60 / slotDuration);

  return (
    <div className="relative">
      {slots.map((minutes, i) => (
        <div
          key={minutes}
          className="relative"
          style={{ height: `${pixelsPerHour}px` }}
        >
          <div className="absolute -top-3 left-0 w-14 text-[10px] text-slate-400 font-medium text-right pr-3 font-mono">
            {formatTime(minutes)}
          </div>
          <div className="absolute left-14 right-0 border-t border-slate-200/60" />
          {i < slots.length - 1 && (
            <div
              className="absolute left-14 right-0 border-t border-slate-100/50"
              style={{ top: `${pixelsPerHour / 2}px` }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ==========================================
// DAY COLUMN COMPONENT
// ==========================================

interface DayColumnProps {
  date: Date;
  appointments: AppointmentWithDetails[];
  startHour: number;
  endHour: number;
  slotDuration: number;
  isToday: boolean;
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
  /** Available time slots for this day (from doctor schedules) */
  availableSlots?: string[];
  onSlotClick?: (time: string) => void;
}

const DayColumn = ({
  date,
  appointments,
  startHour,
  endHour,
  slotDuration,
  isToday,
  onAppointmentClick,
  availableSlots,
  onSlotClick,
}: DayColumnProps) => {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const positioned = useMemo(
    () => groupOverlappingAppointments(appointments, startHour, slotDuration),
    [appointments, startHour, slotDuration]
  );

  const totalHours = endHour - startHour;
  const pixelsPerHour = 60 * (60 / slotDuration);
  const gridHeight = totalHours * pixelsPerHour;
  const pixelsPerSlot = pixelsPerHour * (slotDuration / 60);

  // Current time indicator
  const now = new Date();
  const isCurrentDay = formatDate(date) === formatDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes - startHour * 60) * (60 / slotDuration);
  const showCurrentTime = isCurrentDay && 
    currentMinutes >= startHour * 60 && 
    currentMinutes <= endHour * 60;

  // Booked slots (PENDING or CONFIRMED)
  const bookedTimes = useMemo(
    () => new Set(appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status)).map((a) => a.time)),
    [appointments]
  );

  return (
    <div className={`relative border-r border-slate-100 ${isToday ? 'bg-blue-50/20' : ''}`}>
      <div className="relative" style={{ height: `${gridHeight}px` }}>
        {/* Hour grid lines */}
        {Array.from({ length: totalHours + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-slate-200/60"
            style={{ top: `${i * pixelsPerHour}px` }}
          />
        ))}
        {/* Half-hour grid lines */}
        {Array.from({ length: totalHours }).map((_, i) => (
          <div
            key={`half-${i}`}
            className="absolute left-0 right-0 border-t border-dashed border-slate-100/50"
            style={{ top: `${i * pixelsPerHour + pixelsPerHour / 2}px` }}
          />
        ))}

        {/* Available (empty) slots */}
        {availableSlots && onSlotClick && availableSlots.map((slotTime) => {
          if (bookedTimes.has(slotTime)) return null;
          const slotMin = timeToMinutes(slotTime);
          if (slotMin < startHour * 60 || slotMin >= endHour * 60) return null;
          const top = (slotMin - startHour * 60) * (60 / slotDuration);
          const isHovered = hoveredSlot === slotTime;

          return (
            <div
              key={slotTime}
              className={`absolute left-0.5 right-0.5 rounded transition-all cursor-pointer group z-10
                ${isHovered
                  ? 'bg-emerald-100 border border-emerald-300'
                  : 'bg-emerald-50/60 border border-dashed border-emerald-200/70'
                }`}
              style={{ top: `${top + 1}px`, height: `${pixelsPerSlot - 2}px` }}
              onClick={() => onSlotClick(slotTime)}
              onMouseEnter={() => setHoveredSlot(slotTime)}
              onMouseLeave={() => setHoveredSlot(null)}
              title={`${slotTime} — Захиалга нэмэх`}
            >
              {isHovered && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Захиалга нэмэх
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Appointments */}
        <div className="absolute inset-0 z-[15]">
          {positioned.map((apt) => (
            <AppointmentBlock
              key={apt.id}
              appointment={apt}
              onClick={() => onAppointmentClick(apt)}
            />
          ))}
        </div>

        {/* Current time indicator */}
        {showCurrentTime && (
          <div
            className="absolute left-0 right-0 z-30 pointer-events-none"
            style={{ top: `${currentTimeTop}px` }}
          >
            <div className="relative">
              <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
              <div className="absolute left-1 right-0 h-[1.5px] bg-red-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN WEEKLY CALENDAR COMPONENT
// ==========================================

export default function WeeklyCalendar({
  appointments,
  onAppointmentClick,
  onStatusChange,
  doctors,
  selectedDoctor,
  onSlotClick,
  startHour = 8,
  endHour = 20,
  slotDuration = 30,
  loading = false,
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const today = formatDate(new Date());

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AppointmentWithDetails[]>();
    for (const apt of appointments) {
      const date = new Date(apt.date).toISOString().split('T')[0];
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(apt);
    }
    return map;
  }, [appointments]);

  // Compute available slots per date based on doctor schedules
  const availableSlotsByDate = useMemo(() => {
    if (!doctors || !onSlotClick) return new Map<string, string[]>();

    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const result = new Map<string, string[]>();

    for (const date of weekDates) {
      const dateStr = formatDate(date);
      const dayOfWeek = dayNames[date.getDay()];

      // Determine which doctors to consider
      const relevantDoctors = selectedDoctor
        ? doctors.filter((d) => d.id === selectedDoctor && d.isActive)
        : doctors.filter((d) => d.isActive);

      const slots = new Set<string>();

      for (const doctor of relevantDoctors) {
        const schedule = doctor.schedules?.find(
          (s) => s.dayOfWeek === dayOfWeek && s.isActive
        );
        if (!schedule) continue;

        const [startH, startM] = schedule.startTime.split(':').map(Number);
        const [endH, endM] = schedule.endTime.split(':').map(Number);
        const startMin = startH * 60 + startM;
        const endMin = endH * 60 + endM;
        const dur = schedule.slotDuration || slotDuration;

        for (let m = startMin; m < endMin; m += dur) {
          const h = Math.floor(m / 60).toString().padStart(2, '0');
          const min = (m % 60).toString().padStart(2, '0');
          slots.add(`${h}:${min}`);
        }
      }

      result.set(dateStr, Array.from(slots).sort());
    }

    return result;
  }, [doctors, selectedDoctor, weekDates, slotDuration, onSlotClick]);

  // Navigation handlers
  const navigateWeek = useCallback((direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const pixelsPerMinute = 60 / slotDuration;
      const scrollTo = (currentMinutes - startHour * 60) * pixelsPerMinute - 100;
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, [startHour, slotDuration]);

  // Sync horizontal scroll between header and body
  const handleScroll = useCallback(() => {
    if (headerRef.current && scrollRef.current) {
      headerRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  }, []);

  const totalHours = endHour - startHour;
  const pixelsPerHour = 60 * (60 / slotDuration);
  const gridHeight = totalHours * pixelsPerHour;

  const handleAppointmentClick = useCallback(
    (appointment: AppointmentWithDetails) => {
      onAppointmentClick?.(appointment);
    },
    [onAppointmentClick]
  );

  // Week range display
  const weekRangeText = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('mn-MN', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${start.toLocaleDateString('mn-MN', formatOptions)} - ${end.toLocaleDateString('mn-MN', formatOptions)}, ${end.getFullYear()}`;
  }, [weekDates]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Previous week"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Өнөөдөр
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Next week"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <h2 className="text-sm font-semibold text-slate-900">{weekRangeText}</h2>

        {/* Compact Legend */}
        <div className="hidden xl:flex items-center gap-2">
          {Object.entries(STATUS_LABELS).slice(0, 4).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-sm ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].border} border-l-2`} />
              <span className="text-[10px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Day Headers */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20 flex-shrink-0">
        <div className="w-14 flex-shrink-0 border-r border-slate-100" />
        <div className="flex-1 grid grid-cols-7">
          {weekDates.map((date, i) => {
            const dateStr = formatDate(date);
            const isToday = dateStr === today;
            const dayAppointments = appointmentsByDate.get(dateStr) || [];

            return (
              <div
                key={i}
                className={`px-1.5 py-2.5 text-center border-r border-slate-100 last:border-r-0 ${
                  isToday ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-slate-900' : 'text-slate-400'}`}>
                  {WEEKDAYS_SHORT[i]}
                </div>
                <div
                  className={`text-lg font-semibold mt-0.5 ${
                    isToday
                      ? 'w-7 h-7 bg-blush-500 text-white rounded-full flex items-center justify-center mx-auto text-sm'
                      : 'text-slate-700'
                  }`}
                >
                  {date.getDate()}
                </div>
                {dayAppointments.length > 0 && (
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {dayAppointments.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          onScroll={handleScroll}
        >
          <div className="flex min-h-full">
            {/* Time Labels */}
            <div className="w-14 flex-shrink-0 relative bg-white border-r border-slate-100">
              {Array.from({ length: totalHours + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute right-0 w-full pr-2 text-right"
                  style={{ top: `${i * pixelsPerHour - 8}px` }}
                >
                  <span className="text-[10px] text-slate-400 font-medium font-mono">
                    {formatTime((startHour + i) * 60)}
                  </span>
                </div>
              ))}
              <div style={{ height: `${gridHeight}px` }} />
            </div>

            {/* Day Columns */}
            <div className="flex-1 grid grid-cols-7">
              {weekDates.map((date, i) => {
                const dateStr = formatDate(date);
                const dayAppointments = appointmentsByDate.get(dateStr) || [];
                const dayAvailableSlots = availableSlotsByDate.get(dateStr);

                return (
                  <DayColumn
                    key={i}
                    date={date}
                    appointments={dayAppointments}
                    startHour={startHour}
                    endHour={endHour}
                    slotDuration={slotDuration}
                    isToday={dateStr === today}
                    onAppointmentClick={handleAppointmentClick}
                    availableSlots={dayAvailableSlots}
                    onSlotClick={onSlotClick ? (time) => onSlotClick(dateStr, time, selectedDoctor) : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
