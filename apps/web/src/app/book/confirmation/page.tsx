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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Захиалга олдсонгүй</h1>
          <Link href="/book" className="text-blue-600 hover:underline">
            Шинэ захиалга үүсгэх
          </Link>
        </div>
      </div>
    );
  }

  const appointment = await getAppointment(appointmentId);

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Захиалга олдсонгүй</h1>
          <Link href="/book" className="text-blue-600 hover:underline">
            Шинэ захиалга үүсгэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Цаг амжилттай захиалагдлаа!
            </h1>
            <p className="text-gray-600">
              Таны захиалга хүлээн авагдлаа. Эмнэлгээс удахгүй холбогдох болно.
            </p>
          </div>

          {/* Appointment Details */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-4">
              Захиалгын мэдээлэл
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-600">Захиалгын дугаар:</dt>
                <dd className="font-mono text-sm text-gray-900">{appointment.id.slice(-8).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Эмч:</dt>
                <dd className="font-medium text-gray-900">{appointment.doctor.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Мэргэжил:</dt>
                <dd className="text-gray-900">{appointment.doctor.specialization}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Огноо:</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(appointment.date).toLocaleDateString('mn-MN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Цаг:</dt>
                <dd className="font-medium text-gray-900">{appointment.time}</dd>
              </div>
              <hr className="border-blue-200" />
              <div className="flex justify-between">
                <dt className="text-gray-600">Өвчтөний нэр:</dt>
                <dd className="text-gray-900">{appointment.patient.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Утас:</dt>
                <dd className="text-gray-900">{appointment.patient.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Төлөв:</dt>
                <dd>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                    Хүлээгдэж буй
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Important Notes */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Анхаарах зүйлс:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Захиалсан цагаасаа 10 минутын өмнө ирнэ үү
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Иргэний үнэмлэх эсвэл паспортоо авч ирнэ үү
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Цаг цуцлах бол 7000-0000 утсанд холбогдоно уу
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Нүүр хуудас
            </Link>
            <Link
              href="/book"
              className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Шинэ цаг авах
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
