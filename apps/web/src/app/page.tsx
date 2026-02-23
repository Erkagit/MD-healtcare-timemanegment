import Link from 'next/link';

// Service categories for the landing page
const serviceCategories = [
  {
    id: 'womens-health',
    name: 'Эмэгтэйчүүдийн эрүүл мэнд',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    color: 'from-blush-400 to-blush-500',
    bgLight: 'bg-blush-50',
    textColor: 'text-blush-600',
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
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    color: 'from-lavender-400 to-lavender-500',
    bgLight: 'bg-lavender-50',
    textColor: 'text-lavender-600',
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
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    color: 'from-coral-400 to-coral-500',
    bgLight: 'bg-coral-50',
    textColor: 'text-coral-600',
    services: [
      'Үргүйдлийн оношилгоо',
      'Үргүйдлийн эмчилгээ',
      'Ихэсийн эмчилгээ',
    ],
  },
  {
    id: 'aesthetics',
    name: 'Гоо сайхан',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    color: 'from-blush-300 to-lavender-400',
    bgLight: 'bg-blush-50',
    textColor: 'text-blush-500',
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
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    color: 'from-emerald-400 to-emerald-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    services: [
      'Даавар шинжилгээ',
      'Эрдсийн шинжилгээ',
      'Хавдрын маркер',
      'БЗДХ оношилгоо',
    ],
  },
];

const testimonials = [
  {
    name: 'Б. Сарангэрэл',
    text: 'Маш анхааралтай, эелдэг үйлчилгээ үзүүллээ. Эмч маш сайн тайлбарлаж өгсөн. Баярлалаа!',
    role: 'Жирэмсний хяналтад бүртгүүлсэн',
    rating: 5,
  },
  {
    name: 'Д. Номин',
    text: 'Онлайн цаг захиалах маш хялбар байлаа. Хүлээлгүй шууд үзлэгт орсон. Мэргэшсэн эмч нар маш сайн.',
    role: 'Эмэгтэйчүүдийн үзлэг',
    rating: 5,
  },
  {
    name: 'Э. Оюунцэцэг',
    text: 'Орчин үеийн тоног төхөөрөмж, цэвэрхэн тохилог орчин. Маш итгэлтэй байлаа.',
    role: 'HIFU эмчилгээ хийлгэсэн',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden bg-hero-gradient">
        {/* Decorative Blobs */}
        <div className="absolute top-20 -left-32 w-96 h-96 bg-blush-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-lavender-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-coral-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Dot Pattern */}
        <div className="absolute inset-0 decorative-dot-pattern opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-blush-100 shadow-soft mb-8 animate-fade-in-down">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-blush-700">2017 оноос итгэлтэй үйлчилж байна</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-blush-900 mb-6 leading-[1.15] animate-fade-in-up text-balance">
              MD Health Care Center
              </h1>

              <p className="text-lg sm:text-xl text-blush-700/70 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                Чанартай, аюулгүй, хувь хүнд зориулсан 
                <span className="font-semibold text-blush-600"> эмэгтэйчүүдийн эрүүл мэндийн </span>
                цогц үйлчилгээ
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <Link href="/book" className="btn-primary text-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Цаг захиалах
                </Link>
                <Link href="/services" className="btn-secondary text-lg">
                  Үйлчилгээ үзэх
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              {/* Quick Trust Stats */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-12 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blush-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blush-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-bold text-blush-800">5,000+</p>
                    <p className="text-xs text-blush-500">Үйлчлүүлэгч</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-lavender-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-bold text-blush-800">7+ жил</p>
                    <p className="text-xs text-blush-500">Туршлага</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-coral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-bold text-blush-800">100%</p>
                    <p className="text-xs text-blush-500">Нууцлалтай</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Decorative Illustration Card */}
            <div className="hidden lg:flex justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="relative">
                {/* Main card */}
                <div className="relative w-[420px] h-[480px] rounded-[2.5rem] bg-gradient-to-br from-blush-100 via-lavender-50 to-coral-50 border border-white/60 shadow-soft-xl overflow-hidden">
                  {/* Abstract medical pattern */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Gentle circles */}
                      <div className="absolute top-12 left-12 w-32 h-32 rounded-full border-2 border-blush-200/40" />
                      <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-lavender-200/40" />
                      <div className="absolute bottom-16 right-12 w-28 h-28 rounded-full bg-blush-200/20" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br from-blush-200/30 to-lavender-200/30 animate-pulse-soft" />

                      {/* Central heart icon */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-3xl bg-white/80 backdrop-blur-xl shadow-soft-lg flex items-center justify-center animate-float">
                        <svg className="w-12 h-12 text-blush-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                      </div>

                      {/* Floating mini cards */}
                      <div className="absolute top-16 right-8 px-4 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-soft animate-float" style={{ animationDelay: '1s' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Цаг баталгаажсан</span>
                        </div>
                      </div>

                      <div className="absolute bottom-24 left-6 px-4 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-soft animate-float" style={{ animationDelay: '2s' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blush-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Мэргэшсэн эмч</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow behind */}
                <div className="absolute -inset-4 bg-gradient-to-br from-blush-200/20 via-lavender-200/20 to-coral-200/20 rounded-[3rem] blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-[0]">
          <svg className="block w-full h-16 sm:h-24 text-warm-50" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,80 L0,40 Q360,0 720,40 Q1080,80 1440,30 L1440,80 Z" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ ABOUT / TRUST SECTION ═══════════════════ */}
      <section className="-mt-px pt-6 sm:pt-10 pb-16 sm:pb-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blush-50 rounded-full border border-blush-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blush-400" />
              <span className="text-sm font-medium text-blush-600">Бидний тухай</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-blush-900 mb-6 text-balance">
              Эмэгтэйчүүдийн эрүүл мэндэд
              <span className="text-gradient-blush"> зориулсан итгэлтэй </span>
              түнш
            </h2>
            <p className="text-lg text-blush-700/60 leading-relaxed">
              MD Health Care Center нь 2017 онд үүсгэн байгуулагдан эмэгтэйчүүдийн чиглэлээр 
              олон улсын стандартад нийцсэн тусламж үйлчилгээг мэргэшсэн эмч, 
              сувилахуйн чадварлаг багаар хангаж байна.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '7+', label: 'Жил туршлага', icon: '🏆', gradient: 'from-blush-50 to-blush-100/50' },
              { value: '3', label: 'Мэргэшсэн эмч', icon: '👩‍⚕️', gradient: 'from-lavender-50 to-lavender-100/50' },
              { value: '30+', label: 'Төрлийн үйлчилгээ', icon: '💊', gradient: 'from-coral-50 to-coral-100/50' },
              { value: '5,000+', label: 'Үйлчлүүлэгч', icon: '💝', gradient: 'from-blush-50 to-lavender-50' },
            ].map((stat, i) => (
              <div key={i} className={`relative rounded-3xl bg-gradient-to-br ${stat.gradient} p-8 text-center border border-white/60 shadow-soft group hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="font-display text-3xl sm:text-4xl font-bold text-blush-800 mb-1">{stat.value}</div>
                <div className="text-sm text-blush-600/70 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES SECTION ═══════════════════ */}
      <section className="py-16 sm:py-20 bg-section-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-blush-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blush-400" />
              <span className="text-sm font-medium text-blush-600">Үйлчилгээ</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-blush-900 mb-6">
              Манай үйлчилгээнүүд
            </h2>
            <p className="text-lg text-blush-700/60">
              Үйлчилгээгээ сонгон цаг захиалах боломжтой
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category) => (
              <Link
                key={category.id}
                href={`/book?category=${category.id}`}
                className="card-glow p-7 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-5 shadow-soft group-hover:shadow-soft-lg group-hover:scale-105 transition-all duration-300`}>
                  {category.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-blush-800 mb-3 group-hover:text-blush-600 transition-colors">
                  {category.name}
                </h3>
                <ul className="space-y-2.5 mb-5">
                  {category.services.map((service, idx) => (
                    <li key={idx} className="text-blush-700/60 text-sm flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${category.color} mr-2.5 flex-shrink-0`} />
                      {service}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center text-blush-500 font-semibold text-sm mt-auto">
                  Захиалах
                  <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES / WHY US ═══════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-lavender-50 rounded-full border border-lavender-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
              <span className="text-sm font-medium text-lavender-600">Давуу тал</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-blush-900 mb-6">
              Яагаад биднийг сонгох вэ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                ),
                title: 'Олон улсын стандарт',
                description: 'Олон улсын хамгийн сүүлийн үеийн стандарт удирдамжуудыг мөрдлөг болгон ажилладаг',
                gradient: 'from-blush-400 to-blush-500',
                bg: 'bg-blush-50',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: 'Нууцлал хамгаалалт',
                description: 'Үйлчлүүлэгчийн мэдээллийн нууцлалыг бүрэн хамгаалж ажилладаг',
                gradient: 'from-lavender-400 to-lavender-500',
                bg: 'bg-lavender-50',
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
                title: 'Мэргэшсэн баг',
                description: 'Мэргэшсэн эмч, сувилахуйн чадварлаг баг бүрэлдэхүүнтэй',
                gradient: 'from-coral-400 to-coral-500',
                bg: 'bg-coral-50',
              },
            ].map((feature, i) => (
              <div key={i} className={`rounded-3xl ${feature.bg} p-8 border border-white/60 text-center group hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-5 text-white shadow-soft group-hover:scale-105 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-blush-800 mb-3">{feature.title}</h3>
                <p className="text-blush-700/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
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
              { step: 4, icon: '✅', title: 'Баталгаажуулах', desc: 'Мэдээллээ бүртгүүлнэ', color: 'from-emerald-400 to-emerald-500' },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line (not on last) */}
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

          <div className="text-center mt-14">
            <Link href="/book" className="btn-primary text-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Одоо цаг захиалах
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blush-50 rounded-full border border-blush-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blush-400" />
              <span className="text-sm font-medium text-blush-600">Сэтгэгдэл</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-blush-900 mb-6">
              Үйлчлүүлэгчдийн сэтгэгдэл
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="rounded-3xl bg-gradient-to-br from-warm-50 to-blush-50/30 p-8 border border-cream-100 relative">
                {/* Quote mark */}
                <div className="absolute top-6 right-8 text-blush-200 opacity-50">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, si) => (
                    <svg key={si} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  ))}
                </div>

                <p className="text-blush-700/70 leading-relaxed mb-6 italic">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blush-300 to-lavender-300 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-blush-800">{testimonial.name}</p>
                    <p className="text-sm text-blush-500">{testimonial.role}</p>
                  </div>
                </div>
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
            Эрүүл мэндээ хамгаалах<br />эхний алхамаа хийгээрэй
          </h2>
          <p className="text-blush-700/60 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Одоо цаг захиалаад, мэргэжлийн эмч нарт үзүүлээрэй. 
            Бид таны эрүүл мэндийн итгэлтэй түнш байх болно.
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
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blush-700/60">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blush-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              +976 7700-0000
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
