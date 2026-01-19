'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminAPI, type DashboardStats, type AppointmentWithDetails } from '@/lib/api';

// Status badge helper
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await adminAPI.getStats();
        setStats(response.data);
      } catch (err) {
        setError('Мэдээлэл ачаалахад алдаа гарлаа');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Нийт эмч',
      value: stats?.totalDoctors || 0,
      subLabel: `${stats?.activeDoctors || 0} идэвхтэй`,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'blue',
    },
    {
      label: 'Нийт өвчтөн',
      value: stats?.totalPatients || 0,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      color: 'green',
    },
    {
      label: 'Өнөөдрийн захиалга',
      value: stats?.todayAppointments || 0,
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'purple',
    },
    {
      label: 'Хүлээгдэж буй',
      value: stats?.pendingAppointments || 0,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'yellow',
    },
  ];

  const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Хянах самбар</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorStyles[stat.color]}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.subLabel && (
                  <p className="text-xs text-gray-400">{stat.subLabel}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Сүүлийн захиалгууд</h2>
          <Link
            href="/dashboard/appointments"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Бүгдийг харах →
          </Link>
        </div>
        <div className="divide-y">
          {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
            stats.recentAppointments.map((apt: AppointmentWithDetails) => (
              <div key={apt.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient.name}</p>
                    <p className="text-sm text-gray-500">
                      {apt.doctor.name} • {apt.doctor.specialization}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {new Date(apt.date).toLocaleDateString('mn-MN')} {apt.time}
                  </p>
                  <StatusBadge status={apt.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              Захиалга байхгүй байна
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
