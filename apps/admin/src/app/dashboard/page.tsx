'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminAPI, appointmentsAPI, paymentsAPI, type DashboardStats, type AppointmentWithDetails } from '@/lib/api';

// ==========================================
// MD HEALTH CARE — ADMIN DASHBOARD
// Enhanced KPI overview + payment stats + sync
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
    <span className={styles[status] || 'badge'}>
      {labels[status] || status}
    </span>
  );
};

const PaymentBadge = ({ payment }: { payment?: { status: string } }) => {
  if (!payment) return <span className="text-[10px] text-slate-300">—</span>;

  const styles: Record<string, string> = {
    PENDING: 'text-amber-600 bg-amber-50',
    COMPLETED: 'text-green-600 bg-green-50',
    EXPIRED: 'text-slate-400 bg-slate-50',
    FAILED: 'text-red-600 bg-red-50',
    REFUNDED: 'text-purple-600 bg-purple-50',
  };

  const labels: Record<string, string> = {
    PENDING: 'Хүлээж буй',
    COMPLETED: 'Төлсөн',
    EXPIRED: 'Хугацаа дууссан',
    FAILED: 'Амжилтгүй',
    REFUNDED: 'Буцаалт',
  };

  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${styles[payment.status] || 'text-slate-400 bg-slate-50'}`}>
      {labels[payment.status] || payment.status}
    </span>
  );
};

const StatCardSkeleton = () => (
  <div className="kpi-card">
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton w-20 h-3 rounded" />
      <div className="skeleton w-9 h-9 rounded-lg" />
    </div>
    <div className="skeleton w-14 h-7 rounded mb-1" />
    <div className="skeleton w-24 h-3 rounded" />
  </div>
);

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('mn-MN').format(amount) + '₮';
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteAppointment = async (id: string) => {
    setDeletingId(id);
    try {
      await appointmentsAPI.delete(id);
      setConfirmDeleteId(null);
      loadStats();
    } catch (err) {
      alert('Захиалга устгахад алдаа гарлаа');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Мэдээлэл ачаалахад алдаа гарлаа';
      setError(message);
      console.error('[Dashboard] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult('');
    try {
      const res = await paymentsAPI.syncPending();
      setSyncResult(res.message);
      // Reload stats after sync
      await loadStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Синк хийхэд алдаа гарлаа';
      setSyncResult(`❌ ${msg}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(''), 5000);
    }
  };

  const statCards = [
    {
      label: 'Нийт эмч',
      value: stats?.totalDoctors || 0,
      sub: `${stats?.activeDoctors || 0} идэвхтэй`,
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: 'text-blush-600 bg-blush-50',
      href: '/dashboard/doctors',
    },
    {
      label: 'Нийт өвчтөн',
      value: stats?.totalPatients || 0,
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Өнөөдрийн захиалга',
      value: stats?.todayAppointments || 0,
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50',
      href: '/dashboard/appointments',
    },
    {
      label: 'Хүлээгдэж буй',
      value: stats?.pendingAppointments || 0,
      sub: stats?.pendingPayments ? `${stats.pendingPayments} төлбөр хүлээж буй` : undefined,
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-amber-600 bg-amber-50',
      href: '/dashboard/appointments?status=PENDING',
    },
  ];

  if (error) {
    return (
      <div className="alert alert-error">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Хянах самбар</h1>
          <p className="text-sm text-slate-500 mt-0.5">Өнөөдрийн тойм мэдээлэл</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all disabled:opacity-50 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          >
            <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {syncing ? 'Шалгаж байна...' : 'Төлбөр шалгах'}
          </button>
          <span className="text-xs text-slate-400 font-medium">
            {new Date().toLocaleDateString('mn-MN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className={`px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 animate-fade-in ${
          syncResult.startsWith('❌') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {syncResult}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat) => {
              const inner = (
                <div className="kpi-card group hover:border-slate-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="kpi-label">{stat.label}</span>
                    <div className={`kpi-icon ${stat.color}`}>{stat.icon}</div>
                  </div>
                  <p className="kpi-value">{stat.value.toLocaleString()}</p>
                  {stat.sub && (
                    <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
                  )}
                </div>
              );
              return stat.href ? (
                <Link key={stat.label} href={stat.href} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={stat.label}>{inner}</div>
              );
            })}
      </div>

      {/* Revenue + Appointment Summary Row */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          {/* Revenue Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Орлого</h3>
                <p className="text-[10px] text-slate-400">QPay төлбөрийн мэдээлэл</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Нийт орлого</p>
                <p className="text-xl font-bold text-slate-900">{formatMoney(stats.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Өнөөдрийн орлого</p>
                <p className="text-xl font-bold text-emerald-600">{formatMoney(stats.todayRevenue)}</p>
              </div>
            </div>
          </div>

          {/* Appointment Status Summary */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Захиалгын тойм</h3>
                <p className="text-[10px] text-slate-400">Статусаар ангилсан</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="text-xs text-slate-500">Хүлээгдэж буй</span>
                <span className="text-xs font-bold text-slate-900 ml-auto">{stats.pendingAppointments}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-xs text-slate-500">Баталгаажсан</span>
                <span className="text-xs font-bold text-slate-900 ml-auto">{stats.confirmedAppointments}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-xs text-slate-500">Дууссан</span>
                <span className="text-xs font-bold text-slate-900 ml-auto">{stats.completedAppointments}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <span className="text-xs text-slate-500">Цуцлагдсан</span>
                <span className="text-xs font-bold text-slate-900 ml-auto">{stats.cancelledAppointments}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Appointments Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Сүүлийн захиалгууд</h2>
            <p className="text-xs text-slate-400 mt-0.5">Хамгийн сүүлд ирсэн захиалгууд</p>
          </div>
          <Link
            href="/dashboard/appointments"
            className="text-xs font-semibold text-slate-500 hover:text-blush-600 transition-colors flex items-center gap-1"
          >
            Бүгдийг харах
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-slate-100 rounded w-28" />
                  <div className="h-3 bg-slate-100 rounded w-40" />
                </div>
                <div className="w-16 h-5 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="table-th">Өвчтөн</th>
                    <th className="table-th">Эмч</th>
                    <th className="table-th">Огноо</th>
                    <th className="table-th">Цаг</th>
                    <th className="table-th">Төлбөр</th>
                    <th className="table-th text-right">Төлөв</th>
                    <th className="table-th text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentAppointments.map((apt: AppointmentWithDetails) => (
                    <tr key={apt.id} className="table-row">
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                            {apt.patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-slate-900 text-sm">{apt.patient.name}</span>
                            <p className="text-[10px] text-slate-400">{apt.patient.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-slate-500 text-sm">
                        {apt.doctor.name}
                      </td>
                      <td className="table-td text-slate-500 text-sm">
                        {new Date(apt.date).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="table-td text-slate-500 text-sm font-mono">
                        {apt.time}
                      </td>
                      <td className="table-td">
                        <PaymentBadge payment={apt.payments?.[0]} />
                      </td>
                      <td className="table-td text-right">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="table-td text-right">
                        {confirmDeleteId === apt.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDeleteAppointment(apt.id)}
                              disabled={deletingId === apt.id}
                              className="px-2 py-1 rounded text-[10px] font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {deletingId === apt.id ? '...' : 'Тийм'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded text-[10px] font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                              Үгүй
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(apt.id)}
                            className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                            title="Устгах"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-slate-100">
              {stats.recentAppointments.map((apt: AppointmentWithDetails) => (
                <div key={apt.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                    {apt.patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{apt.patient.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {apt.doctor.name} · {new Date(apt.date).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })} · {apt.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={apt.status} />
                      <PaymentBadge payment={apt.payments?.[0]} />
                    </div>
                    {confirmDeleteId === apt.id ? (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          disabled={deletingId === apt.id}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-600 text-white"
                        >
                          {deletingId === apt.id ? '...' : 'Тийм'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500"
                        >
                          Үгүй
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(apt.id)}
                        className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-sm text-slate-400">Захиалга байхгүй байна</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickActionCard
          href="/dashboard/doctors/new"
          icon={
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          }
          title="Эмч нэмэх"
          description="Шинэ эмч бүртгэх"
        />
        <QuickActionCard
          href="/dashboard/appointments"
          icon={
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
          title="Хуанли харах"
          description="Долоо хоногийн хуваарь"
        />
        <QuickActionCard
          href="/dashboard/services"
          icon={
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          }
          title="Үйлчилгээ удирдах"
          description="Үйлчилгээний жагсаалт"
        />
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-blush-50 text-blush-500 group-hover:bg-gradient-to-br group-hover:from-blush-500 group-hover:to-blush-400 group-hover:text-white flex items-center justify-center transition-all flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
