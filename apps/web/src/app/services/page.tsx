import Link from 'next/link';

// Services data - NO PRICES shown to public
const serviceCategories = [
  {
    id: 'womens-health',
    name: 'Эмэгтэйчүүдийн эрүүл мэнд',
    icon: '👩‍⚕️',
    description: 'Эмэгтэйчүүдийн бүх төрлийн үзлэг оношилгоо зөвлөгөө',
    services: [
      { name: 'Эмэгтэйчүүдийн үзлэг оношилгоо', duration: 30 },
      { name: 'Цэвэршилтийн үеийн тусламж үйлчилгээ', duration: 30 },
      { name: 'Биеийн юмны мөчлөг алдагдах эмгэгүүд', duration: 45 },
      { name: 'Бага аарцгийн архаг өвдөлт, үрэвсэл', duration: 30 },
      { name: 'Умайн хүзүүний өнгөт дуран', duration: 30 },
      { name: 'Умайн хүзүүний эс, эдийн шинжилгээ', duration: 20 },
      { name: 'Охид, өсвөр үеийн тусламж үйлчилгээ', duration: 30 },
      { name: 'Өдрийн эмчилгээ', duration: 60 },
    ],
  },
  {
    id: 'pregnancy',
    name: 'Жирэмслэлт',
    icon: '🤰',
    description: 'Жирэмслэлтэд бэлдэх болон жирэмсний хяналт',
    services: [
      { name: 'Жирэмсний эхо', duration: 30 },
      { name: 'Жирэмслэлтэд бэлдэх үзлэг, шинжилгээ, зөвлөгөө', duration: 45 },
      { name: 'Жирэмслэлтээс сэргийлэх арга хэрэгслүүд', duration: 30 },
      { name: 'Үү, ургацаг авах', duration: 20 },
    ],
  },
  {
    id: 'infertility',
    name: 'Үргүйдэл',
    icon: '💝',
    description: 'Үргүйдлийн оношилгоо, эмчилгээ',
    services: [
      { name: 'Үргүйдлийн оношилгоо', duration: 45 },
      { name: 'Үргүйдлийн эмчилгээ', duration: 60 },
      { name: 'Ихэсийн эмчилгээ', duration: 45 },
    ],
  },
  {
    id: 'aesthetics',
    name: 'Гоо сайхан',
    icon: '✨',
    description: 'Арьс гоо засал, бэлгийн эрүүл мэнд',
    services: [
      { name: 'Бэлгийн уруул, үтрээ, хэлүүний мэс засал', duration: 90 },
      { name: 'Бэлгийн уруул дүүргэлт тарилга', duration: 45 },
      { name: 'Үтрээ, нүүр, биеийн HIFU', duration: 60 },
      { name: 'Ботокс эмчилгээ', duration: 30 },
      { name: 'Өөх хайлуулах тарилга', duration: 45 },
      { name: 'Шингэн лифтинг тарилга эмчилгээ', duration: 45 },
      { name: 'O-SHOT тарилга (үтрээ чийгшүүлэх)', duration: 45 },
      { name: 'Үтрээний лазер', duration: 45 },
      { name: 'Умайн хүзүүний улайлтын PRP эмчилгээ', duration: 45 },
      { name: 'Умайн хүзүүний улайлтын ТЕРМОГЛАЙД эмчилгээ', duration: 45 },
    ],
  },
  {
    id: 'laboratory',
    name: 'Лаборатори',
    icon: '🔬',
    description: 'Лабораторийн бүх төрлийн шинжилгээ',
    services: [
      { name: 'Эмэгтэйчүүдийн даавар шинжилгээ', duration: 15 },
      { name: 'Эрдсийн шинжилгээ', duration: 15 },
      { name: 'Хавдрын маркерын шинжилгээ', duration: 15 },
      { name: 'БЗДХ оношилгоо шинжилгээ', duration: 15 },
      { name: 'Ерөнхий шинжилгээ', duration: 15 },
    ],
  },
];

const BOOKING_FEE = 25000;

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-600 to-rose-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Манай үйлчилгээнүүд</h1>
          <p className="text-pink-100 text-lg max-w-2xl mx-auto">
            Эмэгтэйчүүдийн эрүүл мэндийн бүх төрлийн тусламж үйлчилгээг 
            олон улсын стандартын дагуу үзүүлж байна
          </p>
        </div>
      </section>

      {/* Booking Fee Info Banner */}
      <section className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Үзлэгийн цаг баталгаажуулалт – {BOOKING_FEE.toLocaleString()}₮
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Цаг захиалахдаа {BOOKING_FEE.toLocaleString()}₮ баталгааны төлбөр төлнө. 
                Энэ нь үйлчилгээний нийт үнээс хасагдана.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {serviceCategories.map((category) => (
              <div key={category.id} id={category.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-6">
                  <div className="flex items-center">
                    <span className="text-4xl mr-4">{category.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                      <p className="text-pink-100">{category.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.services.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-500">⏱️ {service.duration} минут</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Link
                      href={`/book?category=${category.id}`}
                      className="inline-flex items-center px-8 py-3.5 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
                    >
                      <span className="mr-2">🗓️</span>
                      Цаг захиалах – {BOOKING_FEE.toLocaleString()}₮
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Захиалга хэрхэн хийх вэ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: '🔍', title: 'Үйлчилгээ сонгох', desc: 'Хүссэн үйлчилгээ болон эмчээ сонгоно' },
              { step: '2', icon: '📅', title: 'Цаг сонгох', desc: 'Тохиромжтой огноо, цагаа сонгоно' },
              { step: '3', icon: '💳', title: 'Баталгааны төлбөр', desc: `QR кодоор ${BOOKING_FEE.toLocaleString()}₮ төлнө` },
              { step: '4', icon: '✅', title: 'Баталгаажсан', desc: 'Захиалга баталгаажиж, мэдэгдэл очно' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-pink-600 mb-1">Алхам {item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-amber-800 mb-2">💡 Мэдэх зүйлс</h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li>• Баталгааны {BOOKING_FEE.toLocaleString()}₮ нь үйлчилгээний нийт үнээс хасагдана</li>
              <li>• Захиалсан цагтаа ирээгүй тохиолдолд баталгааны төлбөр буцаагдахгүй</li>
              <li>• Цаг цуцлахыг хүсвэл 24 цагийн өмнө мэдэгдэнэ үү</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Эрүүл мэндээ хамгаалаарай
          </h2>
          <p className="text-gray-600 mb-8">
            Манай мэргэшсэн эмч нар танд чанартай тусламж үйлчилгээ үзүүлэхэд бэлэн байна
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center px-8 py-4 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition-colors text-lg shadow-lg shadow-pink-200"
            >
              🗓️ Цаг захиалах – {BOOKING_FEE.toLocaleString()}₮
            </Link>
            <a
              href="tel:+97677000000"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-pink-600 text-pink-600 rounded-full font-semibold hover:bg-pink-50 transition-colors text-lg"
            >
              📞 Залгах
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
