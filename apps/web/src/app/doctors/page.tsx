import Link from 'next/link';
import { doctorsAPI, type Doctor } from '@/lib/api';

// Day of week translations
const dayTranslations: Record<string, string> = {
  MONDAY: 'Даваа',
  TUESDAY: 'Мягмар',
  WEDNESDAY: 'Лхагва',
  THURSDAY: 'Пүрэв',
  FRIDAY: 'Баасан',
  SATURDAY: 'Бямба',
  SUNDAY: 'Ням',
};

async function getDoctors(specialization?: string): Promise<Doctor[]> {
  try {
    const response = await doctorsAPI.getAll(specialization);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return [];
  }
}

async function getSpecializations(): Promise<string[]> {
  try {
    const response = await doctorsAPI.getSpecializations();
    return response.data;
  } catch {
    return [];
  }
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: { specialization?: string };
}) {
  const [doctors, specializations] = await Promise.all([
    getDoctors(searchParams.specialization),
    getSpecializations(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Манай эмч нар</h1>
          <p className="text-gray-600 mt-2">
            Мэргэжлийн өндөр чадвартай эмч нараас сонгоно уу
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-700 font-medium">Мэргэжил:</span>
            <Link
              href="/doctors"
              className={`px-4 py-2 rounded-lg transition-colors ${
                !searchParams.specialization
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Бүгд
            </Link>
            {specializations.map((spec) => (
              <Link
                key={spec}
                href={`/doctors?specialization=${encodeURIComponent(spec)}`}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  searchParams.specialization === spec
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {spec}
              </Link>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Эмч олдсонгүй
            </h3>
            <p className="mt-2 text-gray-500">
              Шүүлтийг өөрчилж дахин хайна уу
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor: Doctor & { schedules?: { dayOfWeek: string }[] }) => (
              <div
                key={doctor.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Doctor Avatar */}
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {doctor.name}
                      </h3>
                      <p className="text-blue-600">{doctor.specialization}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {doctor.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {doctor.bio}
                    </p>
                  )}

                  {/* Working Days */}
                  {doctor.schedules && doctor.schedules.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Ажиллах өдрүүд:</p>
                      <div className="flex flex-wrap gap-1">
                        {doctor.schedules.map((schedule) => (
                          <span
                            key={schedule.dayOfWeek}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {dayTranslations[schedule.dayOfWeek] || schedule.dayOfWeek}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    href={`/book?doctorId=${doctor.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Цаг авах
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
