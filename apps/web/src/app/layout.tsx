import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <a href="/" className="flex items-center space-x-2">
                  <span className="text-2xl">🏥</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-pink-600 leading-tight">MD Health Care</span>
                    <span className="text-xs text-gray-500 leading-tight">Эмэгтэйчүүдийн эмнэлэг</span>
                  </div>
                </a>
                <nav className="flex items-center space-x-4">
                  <a href="/" className="text-gray-600 hover:text-pink-600 transition-colors hidden sm:block">
                    Нүүр
                  </a>
                  <a href="/services" className="text-gray-600 hover:text-pink-600 transition-colors hidden sm:block">
                    Үйлчилгээ
                  </a>
                  <a href="/doctors" className="text-gray-600 hover:text-pink-600 transition-colors hidden sm:block">
                    Эмч нар
                  </a>
                  <a 
                    href="/book" 
                    className="bg-pink-600 text-white px-5 py-2 rounded-full hover:bg-pink-700 transition-colors font-medium"
                  >
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
          <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">🏥</span>
                    <span className="font-bold text-lg">MD Health Care Center</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    2017 оноос эмэгтэйчүүдийн эрүүл мэндийн чиглэлээр тусламж үйлчилгээ үзүүлж байна.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4">Холбоо барих</h3>
                  <p className="text-gray-400 text-sm">📞 Утас: +976 7700-0000</p>
                  <p className="text-gray-400 text-sm">📧 И-мэйл: info@mdhealthcare.mn</p>
                  <p className="text-gray-400 text-sm mt-2">🕐 Даваа - Бямба: 09:00 - 18:00</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4">Хаяг</h3>
                  <p className="text-gray-400 text-sm">
                    📍 Улаанбаатар хот
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
                © 2017-2026 MD Health Care Center. Бүх эрх хуулиар хамгаалагдсан.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
