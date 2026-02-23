'use client';

import { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI, adminAPI, type AppointmentWithDetails, type DoctorWithStats } from '@/lib/api';
import { WeeklyCalendar, AppointmentDetailModal } from '@/components/calendar';

// ==========================================
// STATUS BADGE
// ==========================================

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: 'badge badge-pending',
    PAID: 'badge badge-info',
    CONFIRMED: 'badge badge-confirmed',
    COMPLETED: 'badge badge-completed',
    NO_SHOW: 'badge badge-warning',
    CANCELLED: 'badge badge-cancelled',
  };

  const labels: Record<string, string> = {
    PENDING: 'Хүлээгдэж буй',
    PAID: 'Төлбөр орсон',
    CONFIRMED: 'Баталгаажсан',
    COMPLETED: 'Дууссан',
    NO_SHOW: 'Ирээгүй',
    CANCELLED: 'Цуцлагдсан',
  };

  return (
    <span className={styles[status] || 'badge'}>{labels[status] || status}</span>
  );
};

// ==========================================
// HELPERS
// ==========================================

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return d === 0 ? 6 : d - 1;
};
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const getWeekDateRange = (date: Date) => {
  const current = new Date(date);
  const dow = current.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDate(monday), end: formatDate(sunday) };
};

type ViewMode = 'week' | 'month' | 'list';

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AppointmentsCalendarPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);

  useEffect(() => { loadDoctors(); }, []);
  useEffect(() => { loadAppointments(); }, [currentDate, doctorFilter, statusFilter, viewMode]);

  const loadDoctors = async () => {
    try {
      const response = await adminAPI.getDoctors();
      setDoctors(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      let startDate: string, endDate: string;
      if (viewMode === 'week') {
        const range = getWeekDateRange(currentDate);
        startDate = range.start;
        endDate = range.end;
      } else {
        const y = currentDate.getFullYear(), m = currentDate.getMonth();
        startDate = formatDate(new Date(y, m, 1));
        endDate = formatDate(new Date(y, m + 1, 0));
      }

      // Try date-range endpoint first, fall back to list only on 404
      let data: AppointmentWithDetails[] = [];
      try {
        const response = await appointmentsAPI.getByDateRange(startDate, endDate, doctorFilter || undefined);
        data = response.data || [];
      } catch (rangeErr: unknown) {
        // Only fall back if it's a 404 (endpoint not found), not auth errors
        const isNotFound = rangeErr instanceof Error && 'status' in rangeErr && (rangeErr as { status: number }).status === 404;
        if (isNotFound) {
          console.warn('[Appointments] /range not available, falling back to /appointments');
          const response = await appointmentsAPI.getAll({
            doctorId: doctorFilter || undefined,
            status: statusFilter || undefined,
            limit: 200,
          });
          data = response.data || [];
        } else {
          throw rangeErr; // Re-throw auth/network errors
        }
      }

      if (statusFilter) {
        data = data.filter((apt: AppointmentWithDetails) => apt.status === statusFilter);
      }
      setAppointments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Захиалгуудыг ачаалж чадсангүй';
      setError(message);
      console.error('[Appointments] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      await appointmentsAPI.updateStatus(id, newStatus);
      loadAppointments();
      setSelectedAppointment(null);
    } catch (err) {
      alert('Статус өөрчлөхөд алдаа гарлаа');
      console.error(err);
    }
  }, []);

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const getAppointmentsForDate = (date: string) =>
    appointments.filter((apt) => new Date(apt.date).toISOString().split('T')[0] === date);

  const handleAppointmentClick = useCallback((apt: AppointmentWithDetails) => {
    setSelectedAppointment(apt);
  }, []);

  const weekDays = ['Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям', 'Ням'];
  const monthNames = [
    'Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар',
    'Тавдугаар сар', 'Зургадугаар сар', 'Долдугаар сар', 'Наймдугаар сар',
    'Есдүгээр сар', 'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар',
  ];

  const renderMonthlyCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = formatDate(new Date());

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = date === today;
      const isSelected = date === selectedDate;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border-b border-r border-slate-100 p-1.5 cursor-pointer transition-colors ${
            isToday ? 'bg-blue-50/50' : 'hover:bg-slate-50'
          } ${isSelected ? 'ring-2 ring-blush-500 ring-inset' : ''}`}
        >
          <div className={`text-xs font-medium mb-1 ${
            isToday
              ? 'w-5 h-5 bg-blush-500 text-white rounded-full flex items-center justify-center'
              : 'text-slate-700'
          }`}>
            {day}
          </div>
          <div className="space-y-0.5 overflow-hidden max-h-14">
            {dayAppointments.slice(0, 2).map((apt) => (
              <div
                key={apt.id}
                onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); }}
                className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer font-medium ${
                  apt.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                  apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}
              >
                {apt.time} {apt.patient.name}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <span className="text-[10px] text-slate-400 pl-0.5">+{dayAppointments.length - 2}</span>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="h-[calc(100vh-var(--header-height)-48px)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4 flex-shrink-0">
        <h1 className="text-lg font-bold text-slate-900">Захиалгууд</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Doctor Filter */}
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blush-500/10 focus:border-blush-300"
          >
            <option value="">Бүх эмч</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blush-500/10 focus:border-blush-300"
          >
            <option value="">Бүх төлөв</option>
            <option value="PENDING">Хүлээгдэж буй</option>
            <option value="PAID">Төлбөр орсон</option>
            <option value="CONFIRMED">Баталгаажсан</option>
            <option value="COMPLETED">Дууссан</option>
            <option value="NO_SHOW">Ирээгүй</option>
            <option value="CANCELLED">Цуцлагдсан</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(['week', 'month', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode === 'week' ? 'Долоо хоног' : mode === 'month' ? 'Сар' : 'Жагсаалт'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-3 flex-shrink-0">
          <span>{error}</span>
        </div>
      )}

      {/* Calendar Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'week' ? (
          <WeeklyCalendar
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
            onStatusChange={handleStatusChange}
            startHour={8}
            endHour={20}
            slotDuration={30}
            loading={loading}
          />
        ) : viewMode === 'month' ? (
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden h-full flex flex-col">
            {/* Month header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <button onClick={() => navigateMonth(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Өнөөдөр
                </button>
                <h2 className="text-sm font-semibold text-slate-900">
                  {currentDate.getFullYear()} оны {monthNames[currentDate.getMonth()]}
                </h2>
              </div>
              <button onClick={() => navigateMonth(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-100 flex-shrink-0">
              {weekDays.map((day) => (
                <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7">{renderMonthlyCalendar()}</div>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden h-full flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="empty-state flex-1">
                <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p className="text-sm font-medium text-slate-500">Захиалга олдсонгүй</p>
                <p className="text-xs text-slate-400 mt-0.5">Шүүлтүүр өөрчилж үзнэ үү</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Desktop */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header sticky top-0 z-10">
                        <th className="table-th">Өвчтөн</th>
                        <th className="table-th">Эмч</th>
                        <th className="table-th">Огноо</th>
                        <th className="table-th">Цаг</th>
                        <th className="table-th">Төлөв</th>
                        <th className="table-th text-right">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map((apt) => (
                        <tr key={apt.id} className="table-row cursor-pointer" onClick={() => setSelectedAppointment(apt)}>
                          <td className="table-td">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                                {apt.patient.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{apt.patient.name}</p>
                                <p className="text-xs text-slate-400">{apt.patient.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="table-td text-sm text-slate-500">{apt.doctor.name}</td>
                          <td className="table-td text-sm text-slate-500">
                            {new Date(apt.date).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="table-td text-sm text-slate-500 font-mono">{apt.time}</td>
                          <td className="table-td"><StatusBadge status={apt.status} /></td>
                          <td className="table-td text-right">
                            <select
                              value={apt.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blush-500/10 focus:border-blush-300 bg-white"
                            >
                              <option value="PENDING">Хүлээгдэж буй</option>
                              <option value="CONFIRMED">Баталгаажуулах</option>
                              <option value="COMPLETED">Дуусгах</option>
                              <option value="CANCELLED">Цуцлах</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="px-4 py-3 flex items-center gap-3" onClick={() => setSelectedAppointment(apt)}>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                        {apt.patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{apt.patient.name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {apt.doctor.name} · {new Date(apt.date).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })} · {apt.time}
                        </p>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Date Sidebar */}
      {selectedDate && viewMode === 'month' && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-xl z-40 overflow-y-auto animate-slide-in">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {new Date(selectedDate).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Энэ өдөр захиалга байхгүй</p>
            ) : (
              <div className="space-y-2">
                {getAppointmentsForDate(selectedDate).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 border border-slate-200/80 rounded-lg hover:border-slate-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900 font-mono">{apt.time}</span>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-sm text-slate-700">{apt.patient.name}</p>
                    <p className="text-xs text-slate-400">{apt.doctor.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
