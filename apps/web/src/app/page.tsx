import Link from 'next/link';

// Service categories for the landing page
const serviceCategories = [
  {
    id: 'womens-health',
    name: 'Эмэгтэйчүүдийн эрүүл мэнд',
    icon: '👩‍⚕️',
    services: [
      'Эмэгтэйчүүдийн үзлэг оношилгоо',
      'Цэвэршилтийн үеийн тусламж',
      'Биеийн юмны мөчлөг алдагдах',
      'Бага аарцгийн үрэвсэл',
      'Умайн хүзүүний өнгөт дуран',
    ],
  },
  {
    id: 'pregnancy',
    name: 'Жирэмслэлт',
    icon: '🤰',
    services: [
      'Жирэмсний эхо',
      'Жирэмслэлтэд бэлдэх үзлэг',
      'Жирэмслэлтээс сэргийлэх',
      'Үү, ургацаг авах',
    ],
  },
  {
    id: 'infertility',
    name: 'Үргүйдэл',
    icon: '💝',
    services: [
      'Үргүйдлийн оношилгоо',
      'Үргүйдлийн эмчилгээ',
      'Ихэсийн эмчилгээ',
    ],
  },
  {
    id: 'aesthetics',
    name: 'Гоо сайхан',
    icon: '✨',
    services: [
      'HIFU эмчилгээ',
      'Ботокс эмчилгээ',
      'O-SHOT тарилга',
      'Үтрээний лазер',
      'PRP эмчилгээ',
    ],
  },
  {
    id: 'laboratory',
    name: 'Лаборатори',
    icon: '🔬',
    services: [
      'Даавар шинжилгээ',
      'Эрдсийн шинжилгээ',
      'Хавдрын маркер',
      'БЗДХ оношилгоо',
    ],
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-600 via-pink-500 to-rose-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <span className="text-5xl">🏥</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              MD Health Care Center
            </h1>
            <p className="text-lg text-pink-100 mb-2">
              2017 оноос үйл ажиллагаа явуулж байна
            </p>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Чанартай, аюулгүй, нотолгоонд суурилсан, хувь хүнд өвөрмөц, 
              үйлчлүүлэгчийн нууцлалтай, тав тухтай цогц үйлчилгээ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="bg-white text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-pink-50 transition-colors text-lg shadow-lg"
              >
                🗓️ Үзлэг захиалах
              </Link>
              <Link
                href="/services"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors text-lg"
              >
                Үйлчилгээ үзэх
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Бидний тухай
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              MD Health Care Center нь 2017 онд үүсгэн байгуулагдан эмэгтэйчүүдийн чиглэлээр 
              үйл ажиллагаа явуулж эхлээд 2019 оноос хойш нөхөн үржихүйн дотоод шүүрлийн 
              тусламж үйлчилгээг мэргэшсэн эмч, сувилахуйн чадварлаг багийг бүрдүүлэн 
              амбулаторийн тусламж үйлчилгээг үзүүлэн тогтвортой ажиллаж байна.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              2024 оны 7 сараас арьс гоо засал, БЗХӨ оношилгоо, эмчилгээ чиглэл нэмэн 
              салбар эмнэлэг нээн ажиллаж байна. Манай эмнэлэг олон улсын хамгийн сүүлийн 
              үеийн стандарт удирдамжуудыг мөрдлөг болгон ажиллаж, орчин үеийн оношилгоо, 
              эмчилгээний технологийг нэвтрүүлэхийг зорин ажилладаг.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600">7+</div>
              <div className="text-gray-600">Жил туршлага</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600">2</div>
              <div className="text-gray-600">Мэргэшсэн эмч</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600">30+</div>
              <div className="text-gray-600">Төрлийн үйлчилгээ</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600">5000+</div>
              <div className="text-gray-600">Үйлчлүүлэгч</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Манай үйлчилгээнүүд
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Үйлчилгээгээ сонгон захиалга өгөх боломжтой
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category) => (
              <Link
                key={category.id}
                href={`/book?category=${category.id}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                  {category.name}
                </h3>
                <ul className="space-y-2">
                  {category.services.map((service, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-center">
                      <span className="w-1.5 h-1.5 bg-pink-400 rounded-full mr-2"></span>
                      {service}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-pink-600 font-medium text-sm flex items-center">
                  Захиалах
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Бидний давуу тал
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Олон улсын стандарт</h3>
              <p className="text-gray-600">
                Олон улсын хамгийн сүүлийн үеийн стандарт удирдамжуудыг мөрдлөг болгон ажилладаг
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Нууцлал хамгаалалт</h3>
              <p className="text-gray-600">
                Үйлчлүүлэгчийн мэдээллийн нууцлалыг бүрэн хамгаалж ажилладаг
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👩‍⚕️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Мэргэшсэн баг</h3>
              <p className="text-gray-600">
                Мэргэшсэн эмч, сувилахуйн чадварлаг баг бүрэлдэхүүнтэй
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Хэрхэн цаг захиалах вэ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: '📋', title: 'Үйлчилгээ сонгох', desc: 'Хүссэн үйлчилгээгээ сонгох' },
              { step: 2, icon: '👩‍⚕️', title: 'Эмч сонгох', desc: 'Эмчээ сонгох' },
              { step: 3, icon: '📅', title: 'Огноо, цаг сонгох', desc: 'Тохиромжтой цагаа сонгох' },
              { step: 4, icon: '✅', title: 'Баталгаажуулах', desc: 'Мэдээллээ бүртгүүлэх' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="text-pink-600 font-bold mb-2">Алхам {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section className="py-16 bg-gradient-to-br from-pink-600 to-rose-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Эрүүл мэндээ хамгаалаарай
          </h2>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Одоо цаг захиалаад, мэргэжлийн эмчид үзүүлээрэй
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/book"
              className="inline-block bg-white text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-pink-50 transition-colors text-lg shadow-lg"
            >
              🗓️ Онлайн цаг захиалах
            </Link>
          </div>
          <div className="text-white/90">
            <p className="mb-2">📞 Утас: +976 7700-0000</p>
            <p>📍 Хаяг: Улаанбаатар хот</p>
          </div>
        </div>
      </section>
    </div>
  );
}
