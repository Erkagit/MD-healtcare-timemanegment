import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MD Health Care Center | Эмэгтэйчүүдийн эрүүл мэнд',
  description: 'Чанартай, аюулгүй, нотолгоонд суурилсан эмэгтэйчүүдийн эмнэлэг. Онлайнаар цаг захиалах.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <div className="min-h-screen flex flex-col">
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-blush-50 via-lavender-50 to-coral-50 border-b border-blush-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-10 text-xs sm:text-sm text-blush-700/80">
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Даваа – Баасан: 08:30 – 20:30 | Амралтын өдөр: 10:00 – 18:00
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    7730-1919, 8619-3019
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="6" />
                  </svg>
                  <span>Онлайн цаг захиалга нээлттэй</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-cream-100/80 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 py-3">
                <a href="/" className="flex items-center group">
                  <img 
                    src="/logo.jpg" 
                    alt="MD Health Care Center"
                    className="h-9 sm:h-10 w-auto"
                  />
                </a>

                <nav className="flex items-center gap-1">
                  <a href="/" className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-blush-600 rounded-xl hover:bg-blush-50/60 transition-all duration-200">
                    Нүүр
                  </a>
                  <a href="/services" className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-blush-600 rounded-xl hover:bg-blush-50/60 transition-all duration-200">
                    Үйлчилгээ
                  </a>
                  <a href="/doctors" className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-600 hover:text-blush-600 rounded-xl hover:bg-blush-50/60 transition-all duration-200">
                    Эмч нар
                  </a>
                  <a 
                    href="/book" 
                    className="ml-2 btn-primary !px-6 !py-2.5 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    Цаг авах
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative overflow-hidden">
            {/* Wave separator */}
            <div className="bg-white leading-[0] -mb-px">
              <svg className="block w-full h-12 sm:h-16" viewBox="0 0 1440 60" preserveAspectRatio="none">
                {/* White fill covers entire SVG top area — prevents any bg bleed */}
                <rect x="0" y="0" width="1440" height="60" fill="white" />
                {/* Wave shape filled with footer color */}
                <path d="M0,60 L0,20 Q360,60 720,20 Q1080,-20 1440,20 L1440,60 Z" fill="#115e5a" />
              </svg>
            </div>

            <div className="bg-blush-800 text-white relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                  {/* Brand */}
                  <div className="md:col-span-5">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-white rounded-xl px-3 py-1.5">
                        <img 
                          src="/logo.jpg" 
                          alt="MD Health Care Center"
                          className="h-8 w-auto"
                        />
                      </div>
                    </div>
                    <p className="text-blush-200/80 leading-relaxed mb-6 max-w-sm">
                      2017 оноос эмэгтэйчүүдийн эрүүл мэндийн чиглэлээр олон улсын стандартад нийцсэн 
                      тусламж үйлчилгээ үзүүлж байна.
                    </p>
                    <div className="flex gap-3">
                      <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>
                      </a>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="md:col-span-3">
                    <h3 className="font-display font-bold text-lg mb-5">Холбоо барих</h3>
                    <ul className="space-y-4 text-blush-200/80">
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 text-blush-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <div>
                          <p className="font-medium text-white">7730-1919, 8619-3019</p>
                          <p className="text-sm">Даваа – Ням</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 text-blush-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <div>
                          <p className="font-medium text-white">info@mdhealthcare.mn</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Navigation + Hours */}
                  <div className="md:col-span-4">
                    <h3 className="font-display font-bold text-lg mb-5">Ажлын цаг</h3>
                    <div className="space-y-3 text-blush-200/80">
                      <div className="flex justify-between items-center py-2 border-b border-blush-700/40">
                        <span>Даваа – Баасан</span>
                        <span className="font-medium text-white">08:30 – 20:30</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span>Бямба – Ням</span>
                        <span className="font-medium text-white">10:00 – 18:00</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <a href="/book" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold transition-colors duration-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        Онлайн цаг захиалах
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="divider-soft mt-12 mb-8 opacity-20" />
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-blush-300/60 text-sm">
                  <p>© 2017–2026 MD Health Care Center. Бүх эрх хуулиар хамгаалагдсан.</p>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blush-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span>Нууцлал хамгаалагдсан</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
