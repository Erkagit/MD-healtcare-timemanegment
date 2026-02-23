'use client';

import { useState, useEffect } from 'react';
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

export default function EditDoctorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    bio: '',
    isActive: true,
  });

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const response = await adminAPI.getDoctor(params.id);
        const doctor = response.data;
        setFormData({
          name: doctor.name,
          specialization: doctor.specialization,
          bio: doctor.bio || '',
          isActive: doctor.isActive,
        });
      } catch (err) {
        setError('Эмчийн мэдээллийг ачаалж чадсангүй');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await adminAPI.updateDoctor(params.id, formData);
      router.push('/dashboard/doctors');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Эмч засварлахад алдаа гарлаа');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-lg font-bold text-slate-900">Эмч засварлах</h1>
          <p className="text-sm text-slate-500 mt-0.5">Эмчийн мэдээллийг шинэчлэх</p>
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
                rows={4}
                className="input resize-none"
              />
            </div>

            {/* Active toggle */}
            <label htmlFor="isActive" className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-blush-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow-sm" />
              </div>
              <div className="select-none">
                <span className="text-sm font-medium text-slate-700">Идэвхтэй</span>
                <span className="text-xs text-slate-400 ml-1.5">— Үйлчлүүлэгчид цаг захиалах боломжтой</span>
              </div>
            </label>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => router.back()} className="btn btn-secondary btn-sm">
                Цуцлах
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                {saving ? (
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
