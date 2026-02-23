'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doctorsAPI, appointmentsAPI, servicesAPI, paymentsAPI, type Doctor, type TimeSlot, type ServiceCategory, type Service, type PaymentInvoice } from '@/lib/api';

const BOOKING_FEE = 25000;

// Day translations
const dayTranslations: Record<string, string> = {
  MONDAY: 'Даваа',
  TUESDAY: 'Мягмар',
  WEDNESDAY: 'Лхагва',
  THURSDAY: 'Пүрэв',
  FRIDAY: 'Баасан',
  SATURDAY: 'Бямба',
  SUNDAY: 'Ням',
};

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedCategory = searchParams.get('category');
  const preselectedDoctorId = searchParams.get('doctorId');

  // State
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Payment state
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [paymentInvoice, setPaymentInvoice] = useState<PaymentInvoice | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await servicesAPI.getCategories();
        setCategories(categories);
        if (preselectedCategory) {
          const category = categories.find((c: ServiceCategory) => c.id === preselectedCategory);
          if (category) {
            setSelectedCategory(category);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        loadDoctors();
      }
    };

    const loadDoctors = async () => {
      try {
        const response = await doctorsAPI.getAll();
        setDoctors(response.data);
        if (preselectedDoctorId) {
          const doctor = response.data.find((d: Doctor) => d.id === preselectedDoctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
            setStep(3);
          }
        }
      } catch (err) {
        setError('Эмч нарын мэдээллийг ачаалж чадсангүй');
        console.error(err);
      }
    };

    loadCategories();
    loadDoctors();
  }, [preselectedCategory, preselectedDoctorId]);

  // Load available slots when date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    const loadSlots = async () => {
      setSlotsLoading(true);
      setSlots([]);
      setSelectedTime('');
      try {
        const response = await doctorsAPI.getAvailableSlots(selectedDoctor.id, selectedDate);
        setSlots(response.data.slots);
      } catch (err) {
        console.error(err);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [selectedDoctor, selectedDate]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Generate next 14 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('mn-MN', { weekday: 'short', month: 'short', day: 'numeric' }),
        dayOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()],
      });
    }
    return dates;
  };

  // Submit appointment and generate payment
  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !patientName || !patientPhone) {
      setError('Бүх талбаруудыг бөглөнө үү');
      return;
    }
    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(patientPhone)) {
      setError('Утасны дугаар буруу байна (8 оронтой)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create appointment (status = PENDING)
      const response = await appointmentsAPI.create({
        doctorId: selectedDoctor.id,
        serviceId: selectedService?.id,
        date: selectedDate,
        time: selectedTime,
        patientName,
        patientPhone,
        patientEmail: patientEmail || undefined,
        notes: notes || undefined,
      });

      const aptId = response.data.id;
      setAppointmentId(aptId);

      // Generate payment invoice / QR code
      const paymentResponse = await paymentsAPI.createInvoice(aptId);
      setPaymentInvoice(paymentResponse.data);
      setPaymentStatus('PENDING');

      // Start countdown
      if (paymentResponse.data.expiresAt) {
        const expiresAt = new Date(paymentResponse.data.expiresAt).getTime();
        const updateCountdown = () => {
          const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
          setPaymentCountdown(remaining);
          if (remaining === 0) {
            setPaymentStatus('EXPIRED');
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
          }
        };
        updateCountdown();
        countdownRef.current = setInterval(updateCountdown, 1000);
      }

      // Start polling for payment status
      pollingRef.current = setInterval(async () => {
        try {
          const checkResult = await paymentsAPI.checkStatus(paymentResponse.data.paymentId);
          if (checkResult.data.status === 'COMPLETED') {
            setPaymentStatus('COMPLETED');
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            // Redirect to confirmation after a brief delay
            setTimeout(() => {
              router.push(`/book/confirmation?id=${aptId}`);
            }, 2000);
          } else if (checkResult.data.status === 'FAILED') {
            setPaymentStatus('FAILED');
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
          } else if (checkResult.data.status === 'EXPIRED') {
            setPaymentStatus('EXPIRED');
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
          }
        } catch (err) {
          console.error('Payment check error:', err);
        }
      }, 3000);

      // Move to payment step
      setStep(6);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Цаг захиалахад алдаа гарлаа. Дахин оролдоно уу.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Retry payment (generate new QR)
  const handleRetryPayment = async () => {
    if (!appointmentId) return;
    setPaymentLoading(true);
    try {
      const paymentResponse = await paymentsAPI.createInvoice(appointmentId);
      setPaymentInvoice(paymentResponse.data);
      setPaymentStatus('PENDING');

      // Restart countdown
      if (paymentResponse.data.expiresAt) {
        const expiresAt = new Date(paymentResponse.data.expiresAt).getTime();
        countdownRef.current = setInterval(() => {
          const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
          setPaymentCountdown(remaining);
          if (remaining === 0) {
            setPaymentStatus('EXPIRED');
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
          }
        }, 1000);
      }

      // Restart polling
      pollingRef.current = setInterval(async () => {
        try {
          const checkResult = await paymentsAPI.checkStatus(paymentResponse.data.paymentId);
          if (checkResult.data.status === 'COMPLETED') {
            setPaymentStatus('COMPLETED');
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setTimeout(() => {
              router.push(`/book/confirmation?id=${appointmentId}`);
            }, 2000);
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    } catch (err) {
      setError('QR код үүсгэхэд алдаа гарлаа');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Format countdown
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
              s === step
                ? 'step-active scale-110'
                : s < step
                ? 'step-completed'
                : 'step-pending'
            }`}
          >
            {s < step ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : s}
          </div>
          {s < 6 && (
            <div className={`w-6 sm:w-10 h-0.5 rounded-full transition-colors duration-300 ${s < step ? 'bg-emerald-400' : 'bg-cream-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const stepTitles = [
    'Үйлчилгээний төрөл сонгоно уу',
    'Үйлчилгээ сонгоно уу',
    'Эмч сонгоно уу',
    'Огноо, цаг сонгоно уу',
    'Мэдээллээ оруулна уу',
    'Төлбөр төлөх',
  ];

  return (
    <div className="min-h-screen bg-section-warm py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-cream-100 shadow-card p-6 sm:p-10">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-blush-900 text-center mb-2">
            Үзлэг захиалга
          </h1>
          <p className="text-blush-600/60 text-center mb-8">
            {stepTitles[step - 1]}
          </p>

          <StepIndicator />

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Step 1: Select Service Category */}
          {step === 1 && (
            <div className="space-y-6">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-blush-400">
                  <div className="animate-spin h-8 w-8 border-3 border-blush-300 border-t-transparent rounded-full mx-auto mb-3" />
                  Ачаалж байна...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => { setSelectedCategory(category); setStep(2); }}
                      className={`flex items-center p-5 border-2 rounded-2xl hover:border-blush-300 hover:bg-blush-50/50 transition-all duration-200 text-left group ${
                        selectedCategory?.id === category.id ? 'border-blush-400 bg-blush-50/50 shadow-soft' : 'border-cream-200 bg-white/60'
                      }`}
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-blush-100 to-lavender-100 rounded-2xl flex items-center justify-center mr-4 text-2xl group-hover:scale-105 transition-transform duration-200">
                        {category.icon || '🏥'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-blush-800 text-lg">{category.name}</h3>
                        {category.description && (
                          <p className="text-blush-600/50 text-sm mt-1">{category.description}</p>
                        )}
                        <p className="text-blush-500 text-sm mt-1 font-medium">{category.services?.length || 0} үйлчилгээ</p>
                      </div>
                      <svg className="w-5 h-5 text-blush-300 group-hover:text-blush-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
              <div className="text-center pt-2">
                <button onClick={() => setStep(3)} className="text-blush-500 hover:text-blush-600 text-sm font-medium transition-colors inline-flex items-center gap-1">
                  Эсвэл шууд эмч сонгох
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Service (no price shown) */}
          {step === 2 && selectedCategory && (
            <div className="space-y-5">
              <div className="flex items-center p-4 bg-gradient-to-r from-blush-50 to-lavender-50 rounded-2xl border border-blush-100/50">
                <div className="w-12 h-12 bg-gradient-to-br from-blush-200 to-lavender-200 rounded-xl flex items-center justify-center mr-4 text-xl">
                  {selectedCategory.icon || '🏥'}
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-blush-800">{selectedCategory.name}</h3>
                </div>
                <button onClick={() => { setSelectedCategory(null); setSelectedService(null); setStep(1); }} className="text-blush-500 hover:text-blush-600 text-sm font-medium transition-colors">
                  Өөрчлөх
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {selectedCategory.services?.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep(3); }}
                    className={`flex items-center justify-between p-5 border-2 rounded-2xl hover:border-blush-300 hover:bg-blush-50/50 transition-all duration-200 text-left group ${
                      selectedService?.id === service.id ? 'border-blush-400 bg-blush-50/50 shadow-soft' : 'border-cream-200 bg-white/60'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-blush-800 group-hover:text-blush-600 transition-colors">{service.name}</h4>
                      {service.description && (
                        <p className="text-blush-600/50 text-sm mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2 text-sm text-blush-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.duration} мин
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-blush-300 group-hover:text-blush-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => { setSelectedCategory(null); setStep(1); }} className="btn-ghost text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Буцах
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Doctor */}
          {step === 3 && (
            <div className="space-y-5">
              {selectedService && (
                <div className="flex items-center p-4 bg-gradient-to-r from-blush-50 to-lavender-50 rounded-2xl border border-blush-100/50">
                  <div className="flex-1">
                    <p className="text-xs text-blush-500 font-medium uppercase tracking-wider">Сонгосон үйлчилгээ</p>
                    <h3 className="font-display font-bold text-blush-800 mt-1">{selectedService.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-blush-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {selectedService.duration} мин
                    </div>
                  </div>
                  <button onClick={() => { setSelectedService(null); setStep(selectedCategory ? 2 : 1); }} className="text-blush-500 hover:text-blush-600 text-sm font-medium transition-colors">
                    Өөрчлөх
                  </button>
                </div>
              )}

              {doctors.length === 0 ? (
                <div className="text-center py-12 text-blush-400">
                  <div className="animate-spin h-8 w-8 border-3 border-blush-300 border-t-transparent rounded-full mx-auto mb-3" />
                  Эмч нарыг ачаалж байна...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => { setSelectedDoctor(doctor); setStep(4); }}
                      className="flex items-center p-5 border-2 rounded-2xl hover:border-blush-300 hover:bg-blush-50/50 transition-all duration-200 text-left group border-cream-200 bg-white/60"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-blush-200 via-lavender-100 to-coral-100 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-200">
                        <svg className="w-7 h-7 text-blush-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-blush-800 text-lg group-hover:text-blush-600 transition-colors">{doctor.name}</h3>
                        <p className="text-blush-500 font-medium">{doctor.specialization}</p>
                        {doctor.bio && <p className="text-blush-600/50 text-sm mt-1 line-clamp-2">{doctor.bio}</p>}
                      </div>
                      <svg className="w-5 h-5 text-blush-300 group-hover:text-blush-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => { if (selectedService) setStep(2); else if (selectedCategory) setStep(2); else setStep(1); }}
                  className="btn-ghost text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Буцах
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Select Date & Time */}
          {step === 4 && selectedDoctor && (
            <div className="space-y-7">
              <div className="p-5 bg-gradient-to-r from-blush-50 to-lavender-50 rounded-2xl border border-blush-100/50 space-y-2">
                {selectedService && (
                  <div className="flex justify-between text-sm">
                    <span className="text-blush-600/60">Үйлчилгээ:</span>
                    <span className="font-semibold text-blush-800">{selectedService.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-blush-600/60">Эмч:</span>
                  <span className="font-semibold text-blush-800">{selectedDoctor.name}</span>
                </div>
                <button onClick={() => { setSelectedDoctor(null); setSelectedDate(''); setSelectedTime(''); setStep(3); }} className="text-blush-500 text-sm hover:text-blush-600 font-medium transition-colors">
                  Өөрчлөх
                </button>
              </div>

              <div>
                <label className="block text-sm font-display font-bold text-blush-800 mb-3">Огноо сонгох</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.value}
                      onClick={() => { setSelectedDate(date.value); setSelectedTime(''); }}
                      className={`p-3 text-center rounded-2xl border-2 transition-all duration-200 ${
                        selectedDate === date.value ? 'bg-gradient-to-br from-blush-500 to-blush-400 text-white border-blush-500 shadow-soft' : 'border-cream-200 hover:border-blush-300 hover:bg-blush-50/50 bg-white/60'
                      }`}
                    >
                      <div className="text-xs font-medium opacity-80">{dayTranslations[date.dayOfWeek]}</div>
                      <div className="font-bold text-lg">{date.label.split(' ').pop()}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-display font-bold text-blush-800 mb-3">Цаг сонгох</label>
                  {slotsLoading ? (
                    <div className="text-center py-6 text-blush-400">
                      <div className="animate-spin h-6 w-6 border-2 border-blush-300 border-t-transparent rounded-full mx-auto mb-2" />
                      Ачаалж байна...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-8 rounded-2xl bg-cream-50 border border-cream-200">
                      <svg className="w-8 h-8 text-cream-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-blush-600/50 text-sm">Энэ өдөр эмч ажиллахгүй эсвэл бүх цаг захиалагдсан байна</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`py-3 px-2 text-center rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                            !slot.available ? 'bg-cream-50 text-cream-400 cursor-not-allowed border-cream-100 line-through'
                            : selectedTime === slot.time ? 'bg-gradient-to-br from-blush-500 to-blush-400 text-white border-blush-500 shadow-soft'
                            : 'border-cream-200 hover:border-blush-300 hover:bg-blush-50/50 bg-white/60'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => { setSelectedDoctor(null); setStep(3); }} className="btn-ghost text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Буцах
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={!selectedDate || !selectedTime}
                  className="btn-primary !text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-soft-lg"
                >
                  Үргэлжлүүлэх
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Patient Info & Booking Fee Info */}
          {step === 5 && selectedDoctor && (
            <div className="space-y-7">
              {/* Summary */}
              <div className="rounded-2xl bg-gradient-to-br from-blush-50 via-lavender-50/50 to-coral-50/30 border border-blush-100/50 p-6">
                <h3 className="font-display font-bold text-blush-800 mb-4">Захиалгын мэдээлэл</h3>
                <dl className="space-y-3 text-sm">
                  {selectedService && (
                    <div className="flex justify-between">
                      <dt className="text-blush-600/60">Үйлчилгээ:</dt>
                      <dd className="font-semibold text-blush-800">{selectedService.name}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-blush-600/60">Эмч:</dt>
                    <dd className="font-semibold text-blush-800">{selectedDoctor.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-blush-600/60">Огноо:</dt>
                    <dd className="font-semibold text-blush-800">
                      {new Date(selectedDate).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-blush-600/60">Цаг:</dt>
                    <dd className="font-semibold text-blush-800">{selectedTime}</dd>
                  </div>
                  <div className="divider-soft my-3" />
                  <div className="flex justify-between items-center">
                    <dt className="text-blush-700 font-medium">Баталгааны төлбөр:</dt>
                    <dd className="font-display font-bold text-blush-600 text-xl">{BOOKING_FEE.toLocaleString()}₮</dd>
                  </div>
                </dl>
              </div>

              {/* Booking Fee Info */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-display font-bold text-amber-800 mb-1">Баталгааны төлбөрийн тухай</p>
                    <ul className="space-y-1 text-amber-700/80">
                      <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0" />{BOOKING_FEE.toLocaleString()}₮ нь цаг баталгаажуулалтын төлбөр юм</li>
                      <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0" />Үйлчилгээний нийт үнээс хасагдана</li>
                      <li className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0" />Захиалсан цагтаа ирээгүй бол буцаагдахгүй</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Patient Info Form */}
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-display font-bold text-blush-800 mb-2">Таны нэр <span className="text-blush-400">*</span></label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Овог Нэр"
                    className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-display font-bold text-blush-800 mb-2">Утасны дугаар <span className="text-blush-400">*</span></label>
                  <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="99001234"
                    className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-display font-bold text-blush-800 mb-2">И-мэйл <span className="text-blush-400/60 font-normal">(заавал биш)</span></label>
                  <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="email@example.com"
                    className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-display font-bold text-blush-800 mb-2">Тэмдэглэл <span className="text-blush-400/60 font-normal">(заавал биш)</span></label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Үзүүлэх шалтгаан, өвдөж буй хэсэг гэх мэт..." rows={3}
                    className="input-premium resize-none" />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(4)} className="btn-ghost text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Буцах
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !patientName || !patientPhone}
                  className="btn-primary !text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Боловсруулж байна...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                      Төлбөр төлөх – {BOOKING_FEE.toLocaleString()}₮
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Payment (QR Code) */}
          {step === 6 && (
            <div className="space-y-6">
              {paymentStatus === 'COMPLETED' ? (
                // Payment Success
                <div className="text-center py-12">
                  <div className="w-22 h-22 w-[5.5rem] h-[5.5rem] bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-soft">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-blush-900 mb-2">Төлбөр амжилттай!</h2>
                  <p className="text-blush-600/60">Таны захиалга баталгаажлаа. Удахгүй баталгаажуулалтын хуудас руу шилжих болно...</p>
                  <div className="mt-5 animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : paymentStatus === 'FAILED' ? (
                // Payment Failed
                <div className="text-center py-12">
                  <div className="w-22 h-22 w-[5.5rem] h-[5.5rem] bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-soft">
                    <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-blush-900 mb-2">Төлбөр амжилтгүй</h2>
                  <p className="text-blush-600/60 mb-8">Төлбөр хийхэд алдаа гарлаа. Дахин оролдоно уу.</p>
                  <button onClick={handleRetryPayment} disabled={paymentLoading}
                    className="btn-primary disabled:opacity-50">
                    {paymentLoading ? 'Шинэ QR үүсгэж байна...' : 'Дахин оролдох'}
                  </button>
                </div>
              ) : paymentStatus === 'EXPIRED' ? (
                // Payment Expired
                <div className="text-center py-12">
                  <div className="w-22 h-22 w-[5.5rem] h-[5.5rem] bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-soft">
                    <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-blush-900 mb-2">QR кодны хугацаа дууслаа</h2>
                  <p className="text-blush-600/60 mb-8">Шинэ QR код үүсгэж дахин төлнө үү.</p>
                  <button onClick={handleRetryPayment} disabled={paymentLoading}
                    className="btn-primary disabled:opacity-50">
                    {paymentLoading ? 'Шинэ QR үүсгэж байна...' : 'Шинэ QR код үүсгэх'}
                  </button>
                </div>
              ) : (
                // Waiting for payment - Show QR
                <div className="text-center">
                  <h2 className="font-display text-xl font-bold text-blush-900 mb-2">QR кодоор төлбөр хийнэ үү</h2>
                  <p className="text-blush-600/60 mb-6">
                    Банкны аппликейшнаар QR код уншуулж {BOOKING_FEE.toLocaleString()}₮ төлнө үү
                  </p>

                  {/* QR Code Display */}
                  <div className="bg-white border-2 border-cream-200 rounded-3xl p-8 inline-block mb-6 shadow-soft">
                    <div className="w-64 h-64 rounded-xl flex items-center justify-center mx-auto relative overflow-hidden">
                      {paymentInvoice?.qrImage ? (
                        <img 
                          src={`data:image/png;base64,${paymentInvoice.qrImage}`}
                          alt="QPay QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : paymentInvoice?.qrCode ? (
                        <img 
                          src={`data:image/png;base64,${paymentInvoice.qrCode}`}
                          alt="QPay QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Bank App Deep Links */}
                  {paymentInvoice?.urls && paymentInvoice.urls.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-blush-600/60 mb-3 font-medium">Эсвэл банкны апп-аар шууд нээх:</p>
                      <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                        {paymentInvoice.urls.slice(0, 8).map((bank: any, idx: number) => (
                          <a
                            key={idx}
                            href={bank.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-blush-50/50 border border-transparent hover:border-blush-100 transition-all duration-200 w-[4.5rem]"
                          >
                            {bank.logo ? (
                              <img src={bank.logo} alt={bank.description} className="w-11 h-11 rounded-xl shadow-sm" />
                            ) : (
                              <div className="w-11 h-11 bg-gradient-to-br from-cream-100 to-cream-200 rounded-xl flex items-center justify-center text-xs font-bold text-blush-600">
                                {bank.name?.slice(0, 2)}
                              </div>
                            )}
                            <span className="text-[10px] text-blush-600/60 text-center leading-tight truncate w-full">{bank.description || bank.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amount and countdown */}
                  <div className="space-y-3 mb-6">
                    <div className="font-display text-3xl font-bold text-gradient-blush">{BOOKING_FEE.toLocaleString()}₮</div>
                    {paymentCountdown > 0 && (
                      <div className="flex items-center justify-center gap-2 text-blush-600/60">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Хугацаа: <span className="font-mono font-bold text-blush-800">{formatCountdown(paymentCountdown)}</span></span>
                      </div>
                    )}
                  </div>

                  {/* Polling indicator */}
                  <div className="flex items-center justify-center gap-2 text-sm text-blush-500 mb-6">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    Төлбөр хүлээж байна...
                  </div>

                  {/* Payment instructions */}
                  <div className="rounded-2xl bg-gradient-to-r from-blush-50 to-lavender-50 border border-blush-100/50 p-5 text-left max-w-md mx-auto">
                    <h4 className="font-display font-bold text-blush-800 mb-3 text-sm">Төлбөр хийх заавар:</h4>
                    <ol className="text-sm text-blush-600/70 space-y-2">
                      {[
                        'Банкны аппликейшнаа нээнэ',
                        'QR код уншуулах товч дарна',
                        'Дээрх QR кодыг уншуулна',
                        'Төлбөр баталгаажуулна',
                      ].map((text, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-blush-100 flex items-center justify-center text-xs font-bold text-blush-500 flex-shrink-0">{i + 1}</span>
                          {text}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-section-warm py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-cream-100 shadow-card p-6 sm:p-10 text-center">
            <div className="animate-spin h-8 w-8 border-3 border-blush-300 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-blush-500 font-medium">Ачаалж байна...</p>
          </div>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
