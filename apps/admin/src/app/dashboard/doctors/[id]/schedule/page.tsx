'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, schedulesAPI, type Schedule } from '@/lib/api';

const DAYS = [
  { value: 'MONDAY', label: 'Даваа', short: 'Да' },
  { value: 'TUESDAY', label: 'Мягмар', short: 'Мя' },
  { value: 'WEDNESDAY', label: 'Лхагва', short: 'Лх' },
  { value: 'THURSDAY', label: 'Пүрэв', short: 'Пү' },
  { value: 'FRIDAY', label: 'Баасан', short: 'Ба' },
  { value: 'SATURDAY', label: 'Бямба', short: 'Бя' },
  { value: 'SUNDAY', label: 'Ням', short: 'Ня' },
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
        <div className="w-7 h-7 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
      </div>
    );
  }

  const activeDays = schedules.filter((s) => s.enabled).length;

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

      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Ажлын хуваарь</h1>
            <p className="text-sm text-slate-500 mt-0.5">{doctorName} · {activeDays} өдөр идэвхтэй</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          {error && (
            <div className="alert alert-error mx-5 mt-5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="divide-y divide-slate-100">
              {DAYS.map((day) => {
                const schedule = schedules.find((s) => s.dayOfWeek === day.value)!;
                return (
                  <div
                    key={day.value}
                    className={`px-5 py-3.5 transition-colors ${
                      schedule.enabled ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Day toggle */}
                      <label className="flex items-center gap-3 cursor-pointer flex-shrink-0 min-w-[100px]">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={schedule.enabled}
                            onChange={(e) =>
                              handleScheduleChange(day.value, 'enabled', e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-8 h-[18px] bg-slate-300 rounded-full peer-checked:bg-blush-500 transition-colors" />
                          <div className="absolute top-[1px] left-[1px] w-4 h-4 bg-white rounded-full peer-checked:translate-x-[14px] transition-transform shadow-sm" />
                        </div>
                        <span className={`text-sm font-medium ${schedule.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                          {day.label}
                        </span>
                      </label>

                      {/* Time inputs */}
                      {schedule.enabled ? (
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400">Эхлэх</span>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) =>
                                handleScheduleChange(day.value, 'startTime', e.target.value)
                              }
                              className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blush-500/10 focus:border-blush-300"
                            />
                          </div>
                          <span className="text-slate-300">—</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400">Дуусах</span>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) =>
                                handleScheduleChange(day.value, 'endTime', e.target.value)
                              }
                              className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blush-500/10 focus:border-blush-300"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400">Үзлэг</span>
                            <select
                              value={schedule.slotDuration}
                              onChange={(e) =>
                                handleScheduleChange(day.value, 'slotDuration', parseInt(e.target.value))
                              }
                              className="px-2 py-1 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blush-500/10 focus:border-blush-300"
                            >
                              <option value={15}>15 мин</option>
                              <option value={20}>20 мин</option>
                              <option value={30}>30 мин</option>
                              <option value={45}>45 мин</option>
                              <option value={60}>60 мин</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">Амралтын өдөр</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
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
