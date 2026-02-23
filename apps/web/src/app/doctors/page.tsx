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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient py-20 sm:py-24">
        <div className="absolute top-10 -right-32 w-80 h-80 bg-lavender-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blush-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 decorative-dot-pattern opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-lavender-100 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
            <span className="text-sm font-medium text-lavender-600">Мэргэжлийн баг</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-blush-900 mb-6">
            Манай эмч нар
          </h1>
          <p className="text-lg text-blush-700/60 max-w-2xl mx-auto">
            Мэргэжлийн өндөр чадвартай, олон жилийн туршлагатай эмч нараас сонгоно уу
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-warm-50" viewBox="0 0 1440 50" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,50 L0,25 Q360,0 720,25 Q1080,50 1440,15 L1440,50 Z" />
          </svg>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="mb-10 rounded-2xl bg-white/70 backdrop-blur-sm border border-cream-100 p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-blush-700 font-medium text-sm mr-2">Мэргэжил:</span>
              <Link
                href="/doctors"
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  !searchParams.specialization
                    ? 'bg-gradient-to-r from-blush-500 to-blush-400 text-white shadow-soft'
                    : 'bg-cream-50 text-blush-700 hover:bg-blush-50 border border-cream-200'
                }`}
              >
                Бүгд
              </Link>
              {specializations.map((spec) => (
                <Link
                  key={spec}
                  href={`/doctors?specialization=${encodeURIComponent(spec)}`}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    searchParams.specialization === spec
                      ? 'bg-gradient-to-r from-blush-500 to-blush-400 text-white shadow-soft'
                      : 'bg-cream-50 text-blush-700 hover:bg-blush-50 border border-cream-200'
                  }`}
                >
                  {spec}
                </Link>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          {doctors.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-white/70 backdrop-blur-sm border border-cream-100 shadow-soft">
              <div className="w-20 h-20 rounded-3xl bg-blush-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-blush-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-blush-800 mb-2">
                Эмч олдсонгүй
              </h3>
              <p className="text-blush-600/60">
                Шүүлтийг өөрчилж дахин хайна уу
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.map((doctor: Doctor & { schedules?: { dayOfWeek: string }[] }) => (
                <div
                  key={doctor.id}
                  className="card-glow group overflow-hidden"
                >
                  {/* Top gradient accent */}
                  <div className="h-2 bg-gradient-to-r from-blush-400 via-lavender-400 to-coral-400" />

                  <div className="p-7">
                    {/* Doctor Avatar & Info */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-18 h-18 w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-blush-200 via-lavender-100 to-coral-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-8 h-8 text-blush-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-blush-800 group-hover:text-blush-600 transition-colors">
                          {doctor.name}
                        </h3>
                        <p className="text-blush-500 font-medium">{doctor.specialization}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {doctor.bio && (
                      <p className="text-blush-700/60 text-sm mb-5 line-clamp-2 leading-relaxed">
                        {doctor.bio}
                      </p>
                    )}

                    {/* Working Days */}
                    {doctor.schedules && doctor.schedules.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs text-blush-500 font-medium mb-2.5 uppercase tracking-wider">Ажиллах өдрүүд</p>
                        <div className="flex flex-wrap gap-1.5">
                          {doctor.schedules.map((schedule) => (
                            <span
                              key={schedule.dayOfWeek}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100"
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
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blush-500 to-blush-400 text-white font-semibold shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Цаг авах
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
