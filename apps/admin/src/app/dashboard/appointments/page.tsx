'use client';

import { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI, adminAPI, type AppointmentWithDetails, type DoctorWithStats } from '@/lib/api';
import { WeeklyCalendar, AppointmentDetailModal } from '@/components/calendar';

// ==========================================
// STATUS BADGE COMPONENT
// ==========================================

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
    CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  };

  const labels: Record<string, string> = {
    PENDING: 'Хүлээгдэж буй',
    CONFIRMED: 'Баталгаажсан',
    COMPLETED: 'Дууссан',
    CANCELLED: 'Цуцлагдсан',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getWeekDateRange = (date: Date): { start: string; end: string } => {
  const current = new Date(date);
  const dayOfWeek = current.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + diff);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
};

// ==========================================
// VIEW MODE TYPES
// ==========================================

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

  // Load doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Load appointments when filters or date change
  useEffect(() => {
    loadAppointments();
  }, [currentDate, doctorFilter, statusFilter, viewMode]);

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
    try {
      let startDate: string;
      let endDate: string;

      if (viewMode === 'week') {
        const range = getWeekDateRange(currentDate);
        startDate = range.start;
        endDate = range.end;
      } else {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        startDate = formatDate(new Date(year, month, 1));
        endDate = formatDate(new Date(year, month + 1, 0));
      }
      
      try {
        const response = await appointmentsAPI.getByDateRange(startDate, endDate, doctorFilter || undefined);
        let data = response.data || [];
        if (statusFilter) {
          data = data.filter(apt => apt.status === statusFilter);
        }
        setAppointments(data);
      } catch {
        const response = await appointmentsAPI.getAll({ 
          doctorId: doctorFilter || undefined,
          status: statusFilter || undefined,
          limit: 200 
        });
        setAppointments(response.data);
      }
    } catch (err) {
      setError('Захиалгуудыг ачаалж чадсангүй');
      console.error(err);
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

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === date;
    });
  };

  const handleAppointmentClick = useCallback((apt: AppointmentWithDetails) => {
    setSelectedAppointment(apt);
  }, []);

  // Monthly calendar rendering
  const renderMonthlyCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = formatDate(new Date());

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-gray-50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = date === today;
      const isSelected = date === selectedDate;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-28 border-b border-r p-1 cursor-pointer transition-colors ${
            isToday ? 'bg-blue-50' : 'hover:bg-gray-50'
          } ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-0.5 overflow-y-auto max-h-20">
            {dayAppointments.slice(0, 3).map((apt) => (
              <div
                key={apt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAppointment(apt);
                }}
                className={`text-xs p-1 rounded truncate cursor-pointer ${
                  apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {apt.time} - {apt.patient.name}
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div className="text-xs text-gray-500 pl-1">
                +{dayAppointments.length - 3} бусад
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const weekDays = ['Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям', 'Ням'];
  const monthNames = [
    'Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар', 'Дөрөвдүгээр сар',
    'Тавдугаар сар', 'Зургадугаар сар', 'Долдугаар сар', 'Наймдугаар сар',
    'Есдүгээр сар', 'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Захиалгууд</h1>
        <div className="flex items-center gap-3">
          {/* Doctor Filter */}
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
            className="px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Бүх төлөв</option>
            <option value="PENDING">Хүлээгдэж буй</option>
            <option value="CONFIRMED">Баталгаажсан</option>
            <option value="COMPLETED">Дууссан</option>
            <option value="CANCELLED">Цуцлагдсан</option>
          </select>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Долоо хоног
              </span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Сар
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Жагсаалт
              </span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4 flex-shrink-0">
          {error}
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            {/* Monthly Calendar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Өнөөдөр
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentDate.getFullYear()} оны {monthNames[currentDate.getMonth()]}
                </h2>
              </div>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b flex-shrink-0">
              {weekDays.map((day) => (
                <div key={day} className="py-2 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7">
                  {renderMonthlyCalendar()}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 px-6 py-3 border-t bg-gray-50 flex-shrink-0">
              <span className="text-sm text-gray-500">Төлөв:</span>
              <span className="flex items-center gap-1 text-sm">
                <span className="w-3 h-3 bg-amber-100 rounded"></span> Хүлээгдэж буй
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="w-3 h-3 bg-emerald-100 rounded"></span> Баталгаажсан
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="w-3 h-3 bg-slate-100 rounded"></span> Дууссан
              </span>
              <span className="flex items-center gap-1 text-sm">
                <span className="w-3 h-3 bg-red-100 rounded"></span> Цуцлагдсан
              </span>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Захиалга олдсонгүй</p>
                  <p className="text-sm text-gray-400 mt-1">Шүүлтүүр өөрчилж үзнэ үү</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Өвчтөн</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Эмч</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Огноо / Цаг</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Төлөв</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAppointment(apt)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{apt.patient.name}</div>
                          <div className="text-sm text-gray-500">{apt.patient.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{apt.doctor.name}</div>
                          <div className="text-sm text-gray-500">{apt.doctor.specialization}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{new Date(apt.date).toLocaleDateString('mn-MN')}</div>
                          <div className="text-sm text-gray-500">{apt.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={apt.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <select
                            value={apt.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                            className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
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
            )}
          </div>
        )}
      </div>

      {/* Selected Date Sidebar (for monthly view) */}
      {selectedDate && viewMode === 'month' && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-40 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(selectedDate).toLocaleDateString('mn-MN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Энэ өдөр захиалга байхгүй байна</p>
            ) : (
              <div className="space-y-4">
                {getAppointmentsForDate(selectedDate).map((apt) => (
                  <div 
                    key={apt.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-lg font-medium text-gray-900">{apt.time}</div>
                      <StatusBadge status={apt.status} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Өвчтөн:</span>{' '}
                        <span className="font-medium">{apt.patient.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Эмч:</span>{' '}
                        <span>{apt.doctor.name}</span>
                      </div>
                    </div>
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
