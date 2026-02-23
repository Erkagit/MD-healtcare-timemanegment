'use client';

import { AppointmentWithDetails } from '@/lib/api';

interface AppointmentDetailModalProps {
  appointment: AppointmentWithDetails;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Хүлээгдэж буй', badge: 'badge badge-pending' },
  { value: 'PAID', label: 'Төлбөр орсон', badge: 'badge badge-info' },
  { value: 'CONFIRMED', label: 'Баталгаажуулах', badge: 'badge badge-confirmed' },
  { value: 'COMPLETED', label: 'Дуусгах', badge: 'badge badge-completed' },
  { value: 'NO_SHOW', label: 'Ирээгүй', badge: 'badge badge-warning' },
  { value: 'CANCELLED', label: 'Цуцлах', badge: 'badge badge-cancelled' },
];

export default function AppointmentDetailModal({
  appointment,
  onClose,
  onStatusChange,
}: AppointmentDetailModalProps) {
  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(appointment.id, newStatus);
    }
  };

  const currentStatus = STATUS_OPTIONS.find((o) => o.value === appointment.status);

  const formattedDate = new Date(appointment.date).toLocaleDateString('mn-MN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Захиалгын дэлгэрэнгүй</h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">{appointment.time}</span>
            <span className={currentStatus?.badge || 'badge'}>{currentStatus?.label || appointment.status}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{formattedDate}</p>
        </div>

        {/* Content */}
        <div className="modal-body space-y-4">
          {/* Patient */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-slate-600">
                {appointment.patient.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Өвчтөн</p>
              <p className="text-sm font-medium text-slate-900">{appointment.patient.name}</p>
              <a
                href={`tel:${appointment.patient.phone}`}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center gap-1 mt-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {appointment.patient.phone}
              </a>
            </div>
          </div>

          {/* Doctor */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Эмч</p>
              <p className="text-sm font-medium text-slate-900">{appointment.doctor.name}</p>
              <p className="text-xs text-slate-400">{appointment.doctor.specialization}</p>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Тэмдэглэл</p>
              <p className="text-sm text-slate-700">{appointment.notes}</p>
            </div>
          )}

          {/* Status Change */}
          {onStatusChange && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Төлөв өөрчлөх</p>
              <div className="grid grid-cols-2 gap-1.5">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={appointment.status === option.value}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      appointment.status === option.value
                        ? 'bg-blush-500 text-white ring-2 ring-blush-500 ring-offset-1'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}
