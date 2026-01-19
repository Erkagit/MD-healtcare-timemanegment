'use client';

import { useState, useEffect } from 'react';
import { appointmentsAPI, adminAPI, type AppointmentWithDetails, type DoctorWithStats } from '@/lib/api';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const labels: Record<string, string> = {
    PENDING: 'Хүлээгдэж буй',
    CONFIRMED: 'Баталгаажсан',
    COMPLETED: 'Дууссан',
    CANCELLED: 'Цуцлагдсан',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [dateFilter, doctorFilter, statusFilter, page]);

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
      const response = await appointmentsAPI.getAll({
        date: dateFilter || undefined,
        doctorId: doctorFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      setAppointments(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError('Захиалгуудыг ачаалж чадсангүй');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await appointmentsAPI.updateStatus(id, newStatus);
      loadAppointments();
    } catch (err) {
      alert('Статус өөрчлөхөд алдаа гарлаа');
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Захиалгууд</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Огноо</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Эмч</label>
            <select
              value={doctorFilter}
              onChange={(e) => {
                setDoctorFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Бүгд</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Төлөв</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Бүгд</option>
              <option value="PENDING">Хүлээгдэж буй</option>
              <option value="CONFIRMED">Баталгаажсан</option>
              <option value="COMPLETED">Дууссан</option>
              <option value="CANCELLED">Цуцлагдсан</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFilter('');
                setDoctorFilter('');
                setStatusFilter('');
                setPage(1);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Цэвэрлэх
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Захиалга олдсонгүй
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Өвчтөн
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Эмч
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Огноо / Цаг
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Төлөв
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{apt.patient.name}</div>
                      <div className="text-sm text-gray-500">{apt.patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{apt.doctor.name}</div>
                      <div className="text-sm text-gray-500">{apt.doctor.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {new Date(apt.date).toLocaleDateString('mn-MN')}
                      </div>
                      <div className="text-sm text-gray-500">{apt.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <select
                        value={apt.status}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Өмнөх
                </button>
                <span className="text-gray-600">
                  Хуудас {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Дараах
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
