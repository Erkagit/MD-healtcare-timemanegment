'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, schedulesAPI, type Schedule } from '@/lib/api';

const DAYS = [
  { value: 'MONDAY', label: 'Даваа' },
  { value: 'TUESDAY', label: 'Мягмар' },
  { value: 'WEDNESDAY', label: 'Лхагва' },
  { value: 'THURSDAY', label: 'Пүрэв' },
  { value: 'FRIDAY', label: 'Баасан' },
  { value: 'SATURDAY', label: 'Бямба' },
  { value: 'SUNDAY', label: 'Ням' },
];

interface ScheduleForm {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  enabled: boolean;
}

export default function DoctorSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState<ScheduleForm[]>(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      enabled: false,
    }))
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctorRes, schedulesRes] = await Promise.all([
          adminAPI.getDoctor(params.id),
          schedulesAPI.getByDoctor(params.id),
        ]);

        setDoctorName(doctorRes.data.name);

        // Merge existing schedules with default form
        const existingSchedules = schedulesRes.data;
        setSchedules((prev) =>
          prev.map((form) => {
            const existing = existingSchedules.find(
              (s: Schedule) => s.dayOfWeek === form.dayOfWeek && s.isActive
            );
            if (existing) {
              return {
                ...form,
                startTime: existing.startTime,
                endTime: existing.endTime,
                slotDuration: existing.slotDuration,
                enabled: true,
              };
            }
            return form;
          })
        );
      } catch (err) {
        setError('Мэдээлэл ачаалахад алдаа гарлаа');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleScheduleChange = (
    dayOfWeek: string,
    field: keyof ScheduleForm,
    value: string | number | boolean
  ) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const activeSchedules = schedules
        .filter((s) => s.enabled)
        .map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDuration: s.slotDuration,
        }));

      await schedulesAPI.bulkSave(params.id, activeSchedules);
      router.push('/dashboard/doctors');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Хуваарь хадгалахад алдаа гарлаа');
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

      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ажлын хуваарь</h1>
          <p className="text-gray-500 mt-1">{doctorName} эмчийн долоо хоногийн хуваарь</p>
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

          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              {DAYS.map((day) => {
                const schedule = schedules.find((s) => s.dayOfWeek === day.value)!;
                return (
                  <div
                    key={day.value}
                    className={`p-4 border rounded-xl transition-all ${
                      schedule.enabled 
                        ? 'border-brand-200 bg-gradient-to-r from-brand-50 to-white shadow-sm' 
                        : 'border-gray-100 bg-surface-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={day.value}
                          checked={schedule.enabled}
                          onChange={(e) =>
                            handleScheduleChange(day.value, 'enabled', e.target.checked)
                          }
                          className="h-5 w-5 text-brand-600 focus:ring-brand-500 border-gray-300 rounded transition-colors"
                        />
                        <label
                          htmlFor={day.value}
                          className={`ml-3 font-medium w-20 ${schedule.enabled ? 'text-brand-700' : 'text-gray-500'}`}
                        >
                          {day.label}
                        </label>
                        {schedule.enabled && (
                          <span className="badge badge-success ml-2">Идэвхтэй</span>
                        )}
                      </div>

                      {schedule.enabled && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-500">Эхлэх:</label>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) =>
                                handleScheduleChange(day.value, 'startTime', e.target.value)
                              }
                              className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-500">Дуусах:</label>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) =>
                                handleScheduleChange(day.value, 'endTime', e.target.value)
                              }
                              className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-500">Үзлэг:</label>
                            <select
                              value={schedule.slotDuration}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day.value,
                                  'slotDuration',
                                  parseInt(e.target.value)
                                )
                              }
                              className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                            >
                              <option value={15}>15 мин</option>
                              <option value={20}>20 мин</option>
                              <option value={30}>30 мин</option>
                              <option value={45}>45 мин</option>
                              <option value={60}>60 мин</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
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
