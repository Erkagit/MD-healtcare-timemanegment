'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminAPI, type DoctorWithStats } from '@/lib/api';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setError('');
      const response = await adminAPI.getDoctors();
      setDoctors(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Эмч нарын мэдээллийг ачаалж чадсангүй';
      setError(message);
      console.error('[Doctors] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (doctor: DoctorWithStats) => {
    try {
      await adminAPI.updateDoctor(doctor.id, { isActive: !doctor.isActive });
      loadDoctors();
    } catch (err) {
      alert('Алдаа гарлаа');
      console.error(err);
    }
  };

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton w-32 h-5 rounded mb-2" />
            <div className="skeleton w-48 h-3 rounded" />
          </div>
          <div className="skeleton w-28 h-9 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 border-b border-slate-50">
              <div className="skeleton w-9 h-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton w-28 h-3.5 rounded" />
                <div className="skeleton w-20 h-3 rounded" />
              </div>
              <div className="skeleton w-16 h-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Эмч нар</h1>
          <p className="text-sm text-slate-500 mt-0.5">Нийт {doctors.length} эмч бүртгэлтэй</p>
        </div>
        <Link href="/dashboard/doctors/new" className="btn btn-primary btn-sm">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Эмч нэмэх
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        {/* Search bar */}
        {doctors.length > 0 && (
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Эмч хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blush-500/10 placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-th">Эмч</th>
                <th className="table-th">Мэргэжил</th>
                <th className="table-th">Захиалга</th>
                <th className="table-th">Төлөв</th>
                <th className="table-th text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <p className="text-sm text-slate-500 font-medium">
                        {search ? 'Хайлтад тохирох эмч олдсонгүй' : 'Эмч бүртгэгдээгүй байна'}
                      </p>
                      {!search && (
                        <p className="text-xs text-slate-400 mt-1">Шинэ эмч нэмэхийн тулд дээрх товчийг дарна уу</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((doctor) => (
                  <tr key={doctor.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{doctor.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-sm text-slate-500">{doctor.specialization}</td>
                    <td className="table-td">
                      <span className="text-sm font-medium text-slate-700">{doctor._count.appointments}</span>
                      <span className="text-xs text-slate-400 ml-1">захиалга</span>
                    </td>
                    <td className="table-td">
                      <button
                        onClick={() => handleToggleActive(doctor)}
                        className={`badge cursor-pointer hover:opacity-80 transition-opacity ${
                          doctor.isActive ? 'badge-success' : 'badge-default'
                        }`}
                      >
                        <span className={`dot ${doctor.isActive ? 'dot-success' : 'dot-default'}`} />
                        {doctor.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                      </button>
                    </td>
                    <td className="table-td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/doctors/${doctor.id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Засах"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <Link
                          href={`/dashboard/doctors/${doctor.id}/schedule`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Хуваарь"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p className="text-sm text-slate-400">
                {search ? 'Хайлтад тохирох эмч олдсонгүй' : 'Эмч бүртгэгдээгүй байна'}
              </p>
            </div>
          ) : (
            filtered.map((doctor) => (
              <div key={doctor.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                  {doctor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{doctor.name}</p>
                  <p className="text-xs text-slate-400">{doctor.specialization} · {doctor._count.appointments} захиалга</p>
                </div>
                <button
                  onClick={() => handleToggleActive(doctor)}
                  className={`badge text-2xs ${doctor.isActive ? 'badge-success' : 'badge-default'}`}
                >
                  {doctor.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                </button>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Link href={`/dashboard/doctors/${doctor.id}`} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </Link>
                  <Link href={`/dashboard/doctors/${doctor.id}/schedule`} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
