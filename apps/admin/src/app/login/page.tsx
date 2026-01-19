'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

// ==========================================
// MD HEALTH CARE - ADMIN LOGIN PAGE
// Consistent with public website branding
// ==========================================

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Нэвтрэхэд алдаа гарлаа');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-500 to-rose-400 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏥</span>
            <div>
              <h1 className="text-2xl font-bold text-white">MD Health Care</h1>
              <p className="text-brand-100 text-sm">Эмэгтэйчүүдийн эмнэлэг</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Эмнэлгийн<br />удирдлагын систем
          </h2>
          <p className="text-brand-100 text-lg max-w-md">
            Захиалга удирдах, эмч нарын хуваарь зохицуулах, үйлчилгээний чанарыг хянах нэгдсэн систем.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {['👩‍⚕️', '👨‍⚕️', '👩‍💼'].map((emoji, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl border-2 border-white/30"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <p className="text-white/80 text-sm">2+ мэргэшсэн эмч</p>
          </div>
        </div>

        <p className="text-brand-200 text-sm">
          © 2017-2026 MD Health Care Center
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl">🏥</span>
              <div>
                <h1 className="text-xl font-bold text-brand-600">MD Health Care</h1>
                <p className="text-gray-400 text-xs">Админ удирдлага</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card shadow-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Тавтай морил</h2>
              <p className="text-gray-500 mt-2">Админ хэсэгт нэвтрэх</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  И-мэйл хаяг
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@clinic.mn"
                    required
                    className="input pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Нууц үг
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input pl-12"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-button font-medium hover:from-brand-700 hover:to-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-soft hover:shadow-md"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Нэвтэрж байна...
                  </>
                ) : (
                  <>
                    Нэвтрэх
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Туршилтын нэвтрэх мэдээлэл
              </div>
              <div className="font-mono text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-100">
                admin@mdhealthcare.mn / admin123
              </div>
            </div>
          </div>

          {/* Footer link */}
          <div className="text-center mt-6">
            <a 
              href="/" 
              className="text-sm text-gray-500 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вэб сайт руу буцах
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
