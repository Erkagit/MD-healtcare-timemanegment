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
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-brand-600 flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Буцах
        </button>
      </div>

      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Эмч засварлах</h1>
          <p className="text-gray-500 mt-1">Эмчийн мэдээллийг шинэчлэх</p>
        </div>

        <div className="bg-white rounded-card shadow-card p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Эмчийн нэр *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Мэргэжил *
              </label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                required
                className="input"
              >
                <option value="">Сонгоно уу</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Танилцуулга
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="input resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-5 w-5 text-brand-600 focus:ring-brand-500 border-gray-300 rounded transition-colors"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 select-none cursor-pointer">
                <span className="font-medium">Идэвхтэй</span>
                <span className="text-gray-500 ml-1">- Үйлчлүүлэгчид цаг захиалах боломжтой</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Цуцлах
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
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
