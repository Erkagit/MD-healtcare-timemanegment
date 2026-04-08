'use client';

import { useState, useEffect } from 'react';
import {
  appointmentsAPI,
  servicesAPI,
  type DoctorWithStats,
  type Service,
  type CreateAppointmentInput,
} from '@/lib/api';

// ==========================================
// TYPES
// ==========================================

interface CreateAppointmentModalProps {
  /** Pre-filled date (YYYY-MM-DD) from clicked slot */
  initialDate?: string;
  /** Pre-filled time (HH:MM) from clicked slot */
  initialTime?: string;
  /** Pre-filled doctor id */
  initialDoctorId?: string;
  /** All doctors with their schedules */
  doctors: DoctorWithStats[];
  onClose: () => void;
  /** Called after successful creation so caller can refresh */
  onSuccess: () => void;
}

// ==========================================
// HELPERS
// ==========================================

const isValidMongoPhone = (phone: string) => /^\d{8}$/.test(phone);

// ==========================================
// COMPONENT
// ==========================================

export default function CreateAppointmentModal({
  initialDate,
  initialTime,
  initialDoctorId,
  doctors,
  onClose,
  onSuccess,
}: CreateAppointmentModalProps) {
  const [date, setDate] = useState(initialDate || '');
  const [time, setTime] = useState(initialTime || '');
  const [doctorId, setDoctorId] = useState(initialDoctorId || '');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [requirePayment, setRequirePayment] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await servicesAPI.getAll();
        setServices(res.data || []);
      } catch {
        // services optional — silently ignore
      }
    };
    load();
  }, []);

  // ── Time slots for selected doctor + date ──
  const availableTimeSlots = (() => {
    if (!doctorId || !date) return [];
    const selectedDate = new Date(date);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = days[selectedDate.getDay()];

    const doctor = doctors.find((d) => d.id === doctorId);
    const schedule = doctor?.schedules?.find((s) => s.dayOfWeek === dayOfWeek && s.isActive);
    if (!schedule) return [];

    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const duration = schedule.slotDuration || 30;

    const slots: string[] = [];
    for (let m = startMin; m < endMin; m += duration) {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      slots.push(`${h}:${min}`);
    }
    return slots;
  })();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'Огноо шаардлагатай';
    if (!time) errs.time = 'Цаг шаардлагатай';
    if (!doctorId) errs.doctorId = 'Эмч сонгоно уу';
    if (!patientName.trim()) errs.patientName = 'Өвчтөний нэр шаардлагатай';
    if (!patientPhone.trim()) {
      errs.patientPhone = 'Утасны дугаар шаардлагатай';
    } else if (!isValidMongoPhone(patientPhone)) {
      errs.patientPhone = '8 оронтой Монгол дугаар оруулна уу';
    }
    if (patientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail.trim())) {
      errs.patientEmail = 'И-мэйл буруу форматтай';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    const payload: CreateAppointmentInput = {
      doctorId,
      date,
      time,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || undefined,
      serviceId: serviceId || undefined,
      notes: notes.trim() || undefined,
      requirePayment,
    };

    try {
      await appointmentsAPI.create(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Захиалга үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blush-500/10 focus:border-blush-300 outline-none transition-colors ${
      fieldErrors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
    }`;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Шинэ захиалга үүсгэх</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Date + Time row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Огноо <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls('date')}
                />
                {fieldErrors.date && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.date}</p>}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Цаг <span className="text-red-500">*</span>
                </label>
                {availableTimeSlots.length > 0 ? (
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={inputCls('time')}
                  >
                    <option value="">Цаг сонгох</option>
                    {availableTimeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={inputCls('time')}
                  />
                )}
                {fieldErrors.time && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.time}</p>}
              </div>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                Эмч <span className="text-red-500">*</span>
              </label>
              <select
                value={doctorId}
                onChange={(e) => { setDoctorId(e.target.value); setTime(''); }}
                className={inputCls('doctorId')}
              >
                <option value="">Эмч сонгох</option>
                {doctors.filter((d) => d.isActive).map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                ))}
              </select>
              {fieldErrors.doctorId && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.doctorId}</p>}
            </div>

            {/* Patient info */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-3">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Өвчтөний мэдээлэл</p>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Нэр <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientName}
                  placeholder="Өвчтөний нэр"
                  onChange={(e) => setPatientName(e.target.value)}
                  className={inputCls('patientName')}
                />
                {fieldErrors.patientName && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.patientName}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Утасны дугаар <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  placeholder="8 оронтой дугаар"
                  maxLength={8}
                  onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                  className={inputCls('patientPhone')}
                />
                {fieldErrors.patientPhone && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.patientPhone}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">И-мэйл (заавал биш)</label>
                <input
                  type="email"
                  value={patientEmail}
                  placeholder="email@example.com"
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className={inputCls('patientEmail')}
                />
                {fieldErrors.patientEmail && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.patientEmail}</p>}
              </div>
            </div>

            {/* Service */}
            {services.length > 0 && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Үйлчилгээ (заавал биш)
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className={inputCls('serviceId')}
                >
                  <option value="">Сонгох</option>
                  {services.filter((s) => s.isActive).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.price ? ` — ${s.price.toLocaleString()}₮` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                Тэмдэглэл (заавал биш)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Нэмэлт тэмдэглэл..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blush-500/10 focus:border-blush-300 outline-none transition-colors resize-none"
              />
            </div>

            {/* Payment status info */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-emerald-700">
                  {requirePayment ? 'Төлбөр хүлээгдэж буй' : 'Шууд баталгаажна'}
                </span>
              </div>
              <p className="text-[10px] text-emerald-600 ml-6">
                {requirePayment
                  ? 'Захиалга PENDING статустай үүснэ — QPay төлбөр шаардана'
                  : 'Админ захиалга → CONFIRMED статустай шууд үүснэ'}
              </p>
            </div>

            {/* Require payment toggle (off by default = CONFIRMED) */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setRequirePayment(!requirePayment)}
                className={`relative w-9 h-5 rounded-full transition-colors ${requirePayment ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${requirePayment ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-xs text-slate-700">QPay төлбөр шаардах</span>
            </label>
          </div>

          {/* Footer */}
          <div className="modal-footer gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              Цуцлах
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Үүсгэж байна...
                </>
              ) : (
                'Захиалга үүсгэх'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
