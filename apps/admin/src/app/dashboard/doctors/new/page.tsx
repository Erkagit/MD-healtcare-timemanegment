'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';

const SPECIALIZATIONS = [
  'Дотрын эмч',
  'Хүүхдийн эмч',
  'Мэс засалч',
  'Эмэгтэйчүүдийн эмч',
  'Арьс өвчний эмч',
  'Нүдний эмч',
  'Шүдний эмч',
  'Мэдрэлийн эмч',
  'Зүрх судасны эмч',
  'Ерөнхий эмч',
];

export default function NewDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminAPI.createDoctor(formData);
      router.push('/dashboard/doctors');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Эмч бүртгэхэд алдаа гарлаа');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Буцах
      </button>

      <div className="max-w-xl">
        <div className="mb-5">
          <h1 className="text-lg font-bold text-slate-900">Шинэ эмч бүртгэх</h1>
          <p className="text-sm text-slate-500 mt-0.5">Эмчийн мэдээллийг оруулна уу</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          {error && (
            <div className="alert alert-error mb-5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Эмчийн нэр *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Овог Нэр"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Мэргэжил *</label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                required
                className="input"
              >
                <option value="">Сонгоно уу</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Танилцуулга</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Эмчийн товч танилцуулга..."
                rows={4}
                className="input resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => router.back()} className="btn btn-secondary btn-sm">
                Цуцлах
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                {loading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Хадгалж байна...
                  </>
                ) : (
                  'Хадгалах'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
