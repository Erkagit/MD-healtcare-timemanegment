'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AppointmentWithDetails } from '@/lib/api';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export interface WeeklyCalendarProps {
  appointments: AppointmentWithDetails[];
  onAppointmentClick?: (appointment: AppointmentWithDetails) => void;
  onStatusChange?: (id: string, status: string) => void;
  startHour?: number;
  endHour?: number;
  slotDuration?: number; // in minutes
  loading?: boolean;
}

interface PositionedAppointment extends AppointmentWithDetails {
  column: number;
  totalColumns: number;
  top: number;
  height: number;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  PENDING: {
    bg: 'bg-amber-50',
    border: 'border-l-amber-400',
    text: 'text-amber-900',
    hover: 'hover:bg-amber-100',
  },
  CONFIRMED: {
    bg: 'bg-emerald-50',
    border: 'border-l-emerald-400',
    text: 'text-emerald-900',
    hover: 'hover:bg-emerald-100',
  },
  CANCELLED: {
    bg: 'bg-red-50',
    border: 'border-l-red-400',
    text: 'text-red-900',
    hover: 'hover:bg-red-100',
  },
  COMPLETED: {
    bg: 'bg-slate-100',
    border: 'border-l-slate-400',
    text: 'text-slate-700',
    hover: 'hover:bg-slate-200',
  },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Хүлээгдэж буй',
  CONFIRMED: 'Баталгаажсан',
  COMPLETED: 'Дууссан',
  CANCELLED: 'Цуцлагдсан',
};

const WEEKDAYS = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'];
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
      className={`absolute rounded-md border-l-4 px-2 py-1 cursor-pointer transition-all
        ${colors.bg} ${colors.border} ${colors.text} ${colors.hover}
        shadow-sm hover:shadow-md hover:z-20 overflow-hidden`}
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
          <span className="text-xs font-semibold truncate">
            {appointment.time}
          </span>
          {appointment.totalColumns <= 2 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg} font-medium`}>
              {STATUS_LABELS[appointment.status]?.substring(0, 3)}
            </span>
          )}
        </div>
        <div className="text-xs font-medium truncate mt-0.5">
          {appointment.patient.name}
        </div>
        {appointment.height > 50 && (
          <div className="text-[10px] opacity-75 truncate">
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
          <div className="absolute -top-3 left-0 w-16 text-xs text-gray-500 font-medium text-right pr-3">
            {formatTime(minutes)}
          </div>
          <div className="absolute left-16 right-0 border-t border-gray-200" />
          {/* Half-hour line */}
          {i < slots.length - 1 && (
            <div 
              className="absolute left-16 right-0 border-t border-gray-100"
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
}

const DayColumn = ({
  date,
  appointments,
  startHour,
  endHour,
  slotDuration,
  isToday,
  onAppointmentClick,
}: DayColumnProps) => {
  const positioned = useMemo(
    () => groupOverlappingAppointments(appointments, startHour, slotDuration),
    [appointments, startHour, slotDuration]
  );

  const totalHours = endHour - startHour;
  const pixelsPerHour = 60 * (60 / slotDuration);
  const gridHeight = totalHours * pixelsPerHour;

  // Current time indicator
  const now = new Date();
  const isCurrentDay = formatDate(date) === formatDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes - startHour * 60) * (60 / slotDuration);
  const showCurrentTime = isCurrentDay && 
    currentMinutes >= startHour * 60 && 
    currentMinutes <= endHour * 60;

  return (
    <div className={`relative border-r border-gray-200 ${isToday ? 'bg-blue-50/30' : ''}`}>
      <div className="relative" style={{ height: `${gridHeight}px` }}>
        {/* Hour grid lines */}
        {Array.from({ length: totalHours + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: `${i * pixelsPerHour}px` }}
          />
        ))}
        {/* Half-hour grid lines */}
        {Array.from({ length: totalHours }).map((_, i) => (
          <div
            key={`half-${i}`}
            className="absolute left-0 right-0 border-t border-dashed border-gray-100"
            style={{ top: `${i * pixelsPerHour + pixelsPerHour / 2}px` }}
          />
        ))}

        {/* Appointments */}
        <div className="absolute inset-0">
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
              <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
              <div className="absolute left-2 right-0 h-0.5 bg-red-500" />
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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous week"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Өнөөдөр
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next week"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-900">{weekRangeText}</h2>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].border} border-l-2`} />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Day Headers */}
      <div className="flex border-b bg-gray-50 sticky top-0 z-20">
        <div className="w-16 flex-shrink-0 border-r" />
        <div className="flex-1 grid grid-cols-7">
          {weekDates.map((date, i) => {
            const dateStr = formatDate(date);
            const isToday = dateStr === today;
            const dayAppointments = appointmentsByDate.get(dateStr) || [];
            
            return (
              <div
                key={i}
                className={`px-2 py-3 text-center border-r last:border-r-0 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {WEEKDAYS_SHORT[i]}
                </div>
                <div
                  className={`text-xl font-semibold mt-0.5 ${
                    isToday
                      ? 'w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto'
                      : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>
                {dayAppointments.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {dayAppointments.length} захиалга
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
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            <span className="text-sm text-gray-500">Ачааллаж байна...</span>
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          onScroll={handleScroll}
        >
          <div className="flex min-h-full">
            {/* Time Labels */}
            <div className="w-16 flex-shrink-0 relative bg-white border-r">
              {Array.from({ length: totalHours + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute right-0 w-full pr-2 text-right"
                  style={{ top: `${i * pixelsPerHour - 8}px` }}
                >
                  <span className="text-xs text-gray-500 font-medium">
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
