'use client';

import { AppointmentWithDetails } from '@/lib/api';

interface AppointmentDetailModalProps {
  appointment: AppointmentWithDetails;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

const ALL_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Хүлээгдэж буй', badge: 'badge badge-pending' },
  { value: 'PAID', label: 'Төлбөр орсон', badge: 'badge badge-info' },
  { value: 'CONFIRMED', label: 'Баталгаажуулах', badge: 'badge badge-confirmed' },
  { value: 'COMPLETED', label: 'Дуусгах', badge: 'badge badge-completed' },
  { value: 'NO_SHOW', label: 'Ирээгүй', badge: 'badge badge-warning' },
  { value: 'CANCELLED', label: 'Цуцлах', badge: 'badge badge-cancelled' },
];

// Valid state transitions - зөвхөн зөв шилжилт харуулна
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CANCELLED'],                    // Төлөөгүй → зөвхөн цуцлах
  PAID: ['CONFIRMED', 'CANCELLED'],          // Төлсөн → баталгаажуулах эсвэл цуцлах
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'], // Баталгаажсан → дуусгах, ирээгүй, цуцлах
  COMPLETED: [],                              // Дууссан → өөрчлөх боломжгүй
  NO_SHOW: [],                                // Ирээгүй → өөрчлөх боломжгүй
  CANCELLED: [],                              // Цуцлагдсан → өөрчлөх боломжгүй
};

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

  const currentStatus = ALL_STATUS_OPTIONS.find((o) => o.value === appointment.status);

  // Get valid next statuses based on current status
  const validNextStatuses = VALID_TRANSITIONS[appointment.status] || [];
  const availableOptions = ALL_STATUS_OPTIONS.filter((o) => validNextStatuses.includes(o.value));

  // Check payment status
  const hasCompletedPayment = appointment.payments?.some((p) => p.status === 'COMPLETED');
  const hasPendingPayment = appointment.payments?.some((p) => p.status === 'PENDING');
  const latestPayment = appointment.payments?.[0];

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

          {/* Payment Status */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">Төлбөрийн мэдээлэл</p>
            {hasCompletedPayment ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Төлбөр төлөгдсөн
                </span>
                {latestPayment?.paidAt && (
                  <span className="text-[10px] text-slate-400">
                    {new Date(latestPayment.paidAt).toLocaleString('mn-MN')}
                  </span>
                )}
              </div>
            ) : hasPendingPayment ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Төлбөр хүлээгдэж буй
              </span>
            ) : (
              <span className="text-xs text-slate-400">Төлбөр үүсээгүй</span>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Тэмдэглэл</p>
              <p className="text-sm text-slate-700">{appointment.notes}</p>
            </div>
          )}

          {/* Status Change */}
          {onStatusChange && availableOptions.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Төлөв өөрчлөх</p>
              {appointment.status === 'PENDING' && !hasCompletedPayment && (
                <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Төлбөр төлөгдөөгүй тул баталгаажуулах боломжгүй
                </p>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {availableOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition-all bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Terminal states - no actions available */}
          {onStatusChange && availableOptions.length === 0 && ['COMPLETED', 'NO_SHOW', 'CANCELLED'].includes(appointment.status) && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">Энэ захиалгын статус өөрчлөх боломжгүй</p>
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
