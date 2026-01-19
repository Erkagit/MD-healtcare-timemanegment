'use client';

import { AppointmentWithDetails } from '@/lib/api';

// ==========================================
// APPOINTMENT DETAIL MODAL
// ==========================================

interface AppointmentDetailModalProps {
  appointment: AppointmentWithDetails;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Хүлээгдэж буй', color: 'bg-amber-100 text-amber-800' },
  { value: 'CONFIRMED', label: 'Баталгаажуулах', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'COMPLETED', label: 'Дуусгах', color: 'bg-slate-100 text-slate-800' },
  { value: 'CANCELLED', label: 'Цуцлах', color: 'bg-red-100 text-red-800' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const option = STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${option?.color || 'bg-gray-100'}`}>
      {option?.label || status}
    </span>
  );
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

  const formattedDate = new Date(appointment.date).toLocaleDateString('mn-MN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Захиалгын дэлгэрэнгүй</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-white/90">
              <div className="text-2xl font-bold">{appointment.time}</div>
              <div className="text-sm opacity-90">{formattedDate}</div>
            </div>
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Patient Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">Өвчтөн</div>
              <div className="text-lg font-semibold text-gray-900">{appointment.patient.name}</div>
              <a
                href={`tel:${appointment.patient.phone}`}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {appointment.patient.phone}
              </a>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">Эмч</div>
              <div className="text-lg font-semibold text-gray-900">{appointment.doctor.name}</div>
              <div className="text-sm text-gray-600">{appointment.doctor.specialization}</div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Тэмдэглэл</div>
              <div className="text-gray-700">{appointment.notes}</div>
            </div>
          )}

          {/* Status Change */}
          {onStatusChange && (
            <div className="border-t pt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Төлөв өөрчлөх
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={appointment.status === option.value}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${
                        appointment.status === option.value
                          ? 'ring-2 ring-blue-500 ring-offset-2 ' + option.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}
