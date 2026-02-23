import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getAppointment(id: string) {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const appointmentId = searchParams.id;
  
  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-section-warm flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl border border-cream-100 shadow-card p-10">
          <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-cream-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-blush-900 mb-3">Захиалга олдсонгүй</h1>
          <Link href="/book" className="text-blush-500 hover:text-blush-600 font-medium transition-colors inline-flex items-center gap-1">
            Шинэ захиалга үүсгэх
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const appointment = await getAppointment(appointmentId);

  if (!appointment) {
    return (
      <div className="min-h-screen bg-section-warm flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl border border-cream-100 shadow-card p-10">
          <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-cream-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-blush-900 mb-3">Захиалга олдсонгүй</h1>
          <Link href="/book" className="text-blush-500 hover:text-blush-600 font-medium transition-colors inline-flex items-center gap-1">
            Шинэ захиалга үүсгэх
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-section-warm py-10 sm:py-14">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-cream-100 shadow-card p-6 sm:p-10">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-[5.5rem] h-[5.5rem] bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-soft">
                <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {/* Decorative sparkle */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blush-200 rounded-lg rotate-12 opacity-60" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-blush-900 mb-2">
              Цаг амжилттай захиалагдлаа!
            </h1>
            <p className="text-blush-600/60">
              Таны захиалга хүлээн авагдлаа. Эмнэлгээс удахгүй холбогдох болно.
            </p>
          </div>

          {/* Appointment Details */}
          <div className="rounded-2xl bg-gradient-to-br from-blush-50 via-lavender-50/50 to-coral-50/30 border border-blush-100/50 p-6 mb-6">
            <h2 className="font-display font-bold text-lg text-blush-800 mb-5">
              Захиалгын мэдээлэл
            </h2>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-blush-600/60">Захиалгын дугаар:</dt>
                <dd className="font-mono text-sm font-semibold text-blush-800 bg-white/60 px-2.5 py-0.5 rounded-lg">{appointment.id.slice(-8).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blush-600/60">Эмч:</dt>
                <dd className="font-semibold text-blush-800">{appointment.doctor.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blush-600/60">Мэргэжил:</dt>
                <dd className="text-blush-800">{appointment.doctor.specialization}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blush-600/60">Огноо:</dt>
                <dd className="font-semibold text-blush-800">
                  {new Date(appointment.date).toLocaleDateString('mn-MN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blush-600/60">Цаг:</dt>
                <dd className="font-semibold text-blush-800">{appointment.time}</dd>
              </div>
              <div className="divider-soft" />
              <div className="flex justify-between">
                <dt className="text-blush-600/60">Өвчтөний нэр:</dt>
                <dd className="text-blush-800">{appointment.patient.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-blush-600/60">Утас:</dt>
                <dd className="text-blush-800">{appointment.patient.phone}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-blush-600/60">Төлөв:</dt>
                <dd>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-xl text-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Хүлээгдэж буй
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Important Notes */}
          <div className="rounded-2xl bg-gradient-to-r from-cream-50 to-lavender-50/30 border border-cream-200/50 p-5 mb-8">
            <h3 className="font-display font-bold text-blush-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blush-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Анхаарах зүйлс
            </h3>
            <ul className="text-sm text-blush-600/70 space-y-3">
              {[
                { icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Захиалсан цагаасаа 10 минутын өмнө ирнэ үү' },
                { icon: 'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75', text: 'Иргэний үнэмлэх эсвэл паспортоо авч ирнэ үү' },
                { icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z', text: 'Цаг цуцлах бол 7000-0000 утсанд холбогдоно уу' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blush-100/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blush-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <span className="pt-1">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 text-center btn-ghost justify-center"
            >
              Нүүр хуудас
            </Link>
            <Link
              href="/book"
              className="flex-1 text-center btn-primary justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Шинэ цаг авах
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
