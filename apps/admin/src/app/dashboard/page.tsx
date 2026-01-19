'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminAPI, type DashboardStats, type AppointmentWithDetails } from '@/lib/api';

// ==========================================
// MD HEALTH CARE - ADMIN DASHBOARD
// Premium SaaS design, consistent with public site
// ==========================================

// Status badge with new brand colors
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: 'badge badge-pending',
    CONFIRMED: 'badge badge-confirmed',
    COMPLETED: 'badge badge-completed',
    CANCELLED: 'badge badge-cancelled',
  };

  const labels: Record<string, string> = {
    PENDING: 'Хүлээгдэж буй',
    CONFIRMED: 'Баталгаажсан',
    COMPLETED: 'Дууссан',
    CANCELLED: 'Цуцлагдсан',
  };

  return (
    <span className={styles[status] || 'badge'}>
      {labels[status] || status}
    </span>
  );
};

// Skeleton loader for cards
const StatCardSkeleton = () => (
  <div className="bg-white rounded-card p-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-24" />
        <div className="h-7 bg-gray-100 rounded w-16" />
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm">{message}</p>
  </div>
);

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

  // Stat card configurations with brand colors
  const statCards = [
    {
      label: 'Нийт эмч',
      value: stats?.totalDoctors || 0,
      subLabel: `${stats?.activeDoctors || 0} идэвхтэй`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bgColor: 'bg-brand-50',
      iconColor: 'text-brand-600',
      href: '/dashboard/doctors',
    },
    {
      label: 'Нийт өвчтөн',
      value: stats?.totalPatients || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgColor: 'bg-accent-50',
      iconColor: 'text-accent-600',
    },
    {
      label: 'Өнөөдрийн захиалга',
      value: stats?.todayAppointments || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      href: '/dashboard/appointments',
    },
    {
      label: 'Хүлээгдэж буй',
      value: stats?.pendingAppointments || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      href: '/dashboard/appointments?status=PENDING',
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-card p-6 text-red-700">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Хянах самбар</h1>
          <p className="text-gray-500 mt-1">Өнөөдрийн тойм мэдээлэл</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {new Date().toLocaleDateString('mn-MN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statCards.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 p-6 group"
            >
              {stat.href ? (
                <Link href={stat.href} className="block">
                  <StatCardContent stat={stat} />
                </Link>
              ) : (
                <StatCardContent stat={stat} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Сүүлийн захиалгууд</h2>
            <p className="text-sm text-gray-400 mt-0.5">Хамгийн сүүлд ирсэн захиалгууд</p>
          </div>
          <Link
            href="/dashboard/appointments"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors"
          >
            Бүгдийг харах
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
                <div className="w-20 h-6 bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {stats.recentAppointments.map((apt: AppointmentWithDetails) => (
              <div 
                key={apt.id} 
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center">
                    <span className="text-brand-700 font-medium text-sm">
                      {apt.patient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient.name}</p>
                    <p className="text-sm text-gray-500">
                      {apt.doctor.name} • {apt.doctor.specialization}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(apt.date).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">{apt.time}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Захиалга байхгүй байна" />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <QuickActionCard
          href="/dashboard/doctors/new"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
          title="Эмч нэмэх"
          description="Шинэ эмч бүртгэх"
          color="brand"
        />
        <QuickActionCard
          href="/dashboard/appointments"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Хуанли харах"
          description="Долоо хоногийн хуваарь"
          color="accent"
        />
        <QuickActionCard
          href="/dashboard/services"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
          title="Үйлчилгээ удирдах"
          description="Үйлчилгээний жагсаалт"
          color="purple"
        />
      </div>
    </div>
  );
}

// Stat card content component
function StatCardContent({ stat }: { stat: { label: string; value: number; subLabel?: string; icon: React.ReactNode; bgColor: string; iconColor: string } }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center ${stat.iconColor}`}>
        {stat.icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{stat.label}</p>
        <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
        {stat.subLabel && (
          <p className="text-xs text-gray-400 mt-0.5">{stat.subLabel}</p>
        )}
      </div>
    </div>
  );
}

// Quick action card component
function QuickActionCard({ 
  href, 
  icon, 
  title, 
  description, 
  color 
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: 'brand' | 'accent' | 'purple';
}) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100',
    accent: 'bg-accent-50 text-accent-600 group-hover:bg-accent-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 p-5 flex items-center gap-4 group"
    >
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center transition-colors`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900 group-hover:text-brand-600 transition-colors">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-300 ml-auto group-hover:text-brand-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
