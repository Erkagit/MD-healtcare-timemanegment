import Link from 'next/link';

// Service category icons as SVG components matching homepage design
const categoryIcons = {
  'womens-health': (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  'pregnancy': (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  ),
  'infertility': (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  'aesthetics': (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  'laboratory': (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
};

// Category color themes matching homepage
const categoryThemes: Record<string, { gradient: string; bgLight: string; textColor: string }> = {
  'womens-health': { gradient: 'from-blush-400 to-blush-500', bgLight: 'bg-blush-50', textColor: 'text-blush-600' },
  'pregnancy': { gradient: 'from-lavender-400 to-lavender-500', bgLight: 'bg-lavender-50', textColor: 'text-lavender-600' },
  'infertility': { gradient: 'from-coral-400 to-coral-500', bgLight: 'bg-coral-50', textColor: 'text-coral-600' },
  'aesthetics': { gradient: 'from-blush-300 to-lavender-400', bgLight: 'bg-blush-50', textColor: 'text-blush-500' },
  'laboratory': { gradient: 'from-emerald-400 to-emerald-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
};

// Services data - NO PRICES shown to public
const serviceCategories = [
  {
    id: 'womens-health',
    name: 'Эмэгтэйчүүдийн эрүүл мэнд',
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
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden bg-hero-gradient">
        {/* Decorative Blobs */}
        <div className="absolute top-10 -left-32 w-80 h-80 bg-blush-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-lavender-200/25 rounded-full blur-3xl pointer-events-none" />

        {/* Dot Pattern */}
        <div className="absolute inset-0 decorative-dot-pattern opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-blush-100 shadow-soft mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blush-400" />
              <span className="text-sm font-medium text-blush-700">30+ төрлийн үйлчилгээ</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-blush-900 mb-6 leading-[1.15] text-balance">
              Манай үйлчилгээнүүд
            </h1>

            <p className="text-lg sm:text-xl text-blush-700/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Эмэгтэйчүүдийн эрүүл мэндийн бүх төрлийн тусламж үйлчилгээг
              <span className="font-semibold text-blush-600"> олон улсын стандартын </span>
              дагуу үзүүлж байна
            </p>

            <Link href="/book" className="btn-primary text-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Цаг захиалах
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-[0]">
          <svg className="block w-full h-12 sm:h-20 text-warm-50" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,80 L0,40 Q360,0 720,40 Q1080,80 1440,30 L1440,80 Z" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ BOOKING FEE NOTICE ═══════════════════ */}
      <section className="-mt-px bg-white pb-6 sm:pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white sm:p-8 shadow-soft">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blush-400 to-blush-500 flex items-center justify-center text-white shadow-soft flex-shrink-0">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-display text-lg font-bold text-blush-800 mb-1">
                  Үзлэгийн цаг баталгаажуулалт – {BOOKING_FEE.toLocaleString()}₮
                </h3>
                <p className="text-blush-700/60 text-sm leading-relaxed">
                  Цаг захиалахдаа {BOOKING_FEE.toLocaleString()}₮ баталгааны төлбөр төлнө.
                  Энэ нь үйлчилгээний нийт үнээс хасагдана.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES LIST ═══════════════════ */}
      <section className="py-16 sm:py-20 bg-section-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-blush-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blush-400" />
              <span className="text-sm font-medium text-blush-600">Үйлчилгээ</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-blush-900 mb-6">
              Бүх үйлчилгээнүүд
            </h2>
            <p className="text-lg text-blush-700/60">
              Хүссэн ангиллаа сонгон дэлгэрэнгүй мэдээлэл аваарай
            </p>
          </div>

          <div className="space-y-8">
            {serviceCategories.map((category) => {
              const theme = categoryThemes[category.id];
              const icon = categoryIcons[category.id as keyof typeof categoryIcons];

              return (
                <div key={category.id} id={category.id} className="card-glow overflow-visible">
                  {/* Category Header */}
                  <div className="p-6 sm:p-8 border-b border-cream-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-soft flex-shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <h2 className="font-display text-2xl font-bold text-blush-800 mb-1">
                          {category.name}
                        </h2>
                        <p className="text-blush-700/60">{category.description}</p>
                      </div>
                      <div className="hidden sm:block">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.bgLight} text-sm font-medium ${theme.textColor}`}>
                          {category.services.length} үйлчилгээ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Service Items */}
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.services.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-2xl bg-warm-50/50 hover:bg-warm-50 border border-transparent hover:border-cream-100 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${theme.gradient} flex-shrink-0`} />
                            <h3 className="font-medium text-blush-800 text-sm sm:text-base truncate">{service.name}</h3>
                          </div>
                          <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                            <svg className="w-4 h-4 text-blush-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-blush-500 font-medium">{service.duration} мин</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Category CTA */}
                    <div className="mt-6 text-center">
                      <Link
                        href={`/book?category=${category.id}`}
                        className="btn-primary !px-8 !py-3.5 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        Цаг захиалах
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-16 sm:py-20 bg-section-lavender">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-lavender-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
              <span className="text-sm font-medium text-lavender-600">Энгийн процесс</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-blush-900 mb-6">
              Хэрхэн цаг захиалах вэ?
            </h2>
            <p className="text-lg text-blush-700/60">
              Ердөө 4 энгийн алхамаар цаг захиалаарай
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, icon: '📋', title: 'Үйлчилгээ сонгох', desc: 'Хүссэн үйлчилгээгээ сонгоно', color: 'from-blush-400 to-blush-500' },
              { step: 2, icon: '👩‍⚕️', title: 'Эмч сонгох', desc: 'Тохирох эмчээ сонгоно', color: 'from-lavender-400 to-lavender-500' },
              { step: 3, icon: '📅', title: 'Огноо, цаг сонгох', desc: 'Тохиромжтой цагаа сонгоно', color: 'from-coral-400 to-coral-500' },
              { step: 4, icon: '✅', title: 'Баталгаажуулах', desc: `QR кодоор ${BOOKING_FEE.toLocaleString()}₮ төлнө`, color: 'from-emerald-400 to-emerald-500' },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line */}
                {item.step < 4 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blush-200 to-lavender-200" />
                )}

                <div className={`relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 text-3xl shadow-soft-lg group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-blush-200 text-blush-600 font-bold text-sm mb-3 shadow-soft">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-bold text-blush-800 mb-2">{item.title}</h3>
                <p className="text-blush-700/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ IMPORTANT INFO ═══════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral-50 rounded-full border border-coral-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-coral-400" />
              <span className="text-sm font-medium text-coral-600">Анхаарах зүйлс</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-blush-900 mb-6">
              Мэдэх зүйлс
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                ),
                title: 'Баталгааны төлбөр',
                desc: `${BOOKING_FEE.toLocaleString()}₮ нь үйлчилгээний нийт үнээс хасагдана`,
                gradient: 'from-blush-400 to-blush-500',
                bg: 'bg-blush-50',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ),
                title: 'Цуцлалтын бодлого',
                desc: 'Захиалсан цагтаа ирээгүй тохиолдолд баталгааны төлбөр буцаагдахгүй',
                gradient: 'from-coral-400 to-coral-500',
                bg: 'bg-coral-50',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Цаг өөрчлөх',
                desc: 'Цаг цуцлахыг хүсвэл 24 цагийн өмнө мэдэгдэнэ үү',
                gradient: 'from-lavender-400 to-lavender-500',
                bg: 'bg-lavender-50',
              },
            ].map((item, i) => (
              <div key={i} className={`rounded-3xl ${item.bg} p-8 border border-white/60 text-center group hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-5 text-white shadow-soft group-hover:scale-105 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-blush-800 mb-3">{item.title}</h3>
                <p className="text-blush-700/60 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blush-50 rounded-full border border-blush-100 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blush-400" />
            <span className="text-sm font-medium text-blush-600">Эхний алхам</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-blush-900 mb-6 text-balance">
            Эрүүл мэндээ хамгаалаарай
          </h2>
          <p className="text-blush-700/60 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Манай мэргэшсэн эмч нар танд чанартай тусламж үйлчилгээ үзүүлэхэд бэлэн байна
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/book"
              className="btn-primary inline-flex items-center justify-center gap-2 px-10 py-5 text-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Онлайн цаг захиалах
            </Link>
            <a
              href="tel:+97677301919"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-10 py-5 text-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Залгах
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blush-700/60">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blush-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Даваа – Баасан: 08:30 – 20:30 | Амралт: 10:00 – 18:00
            </div>
            <div className="w-1 h-1 rounded-full bg-blush-300 hidden sm:block" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blush-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Улаанбаатар хот
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
