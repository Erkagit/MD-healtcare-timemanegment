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
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
              s === step
                ? 'bg-pink-600 text-white'
                : s < step
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {s < step ? '✓' : s}
          </div>
          {s < 6 && (
            <div className={`w-8 sm:w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Үзлэг захиалга
          </h1>
          <p className="text-gray-600 text-center mb-6">
            {stepTitles[step - 1]}
          </p>

          <StepIndicator />

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Select Service Category */}
          {step === 1 && (
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Ачаалж байна...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => { setSelectedCategory(category); setStep(2); }}
                      className={`flex items-center p-5 border-2 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-colors text-left ${
                        selectedCategory?.id === category.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mr-4 text-2xl">
                        {category.icon || '🏥'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                        {category.description && (
                          <p className="text-gray-500 text-sm mt-1">{category.description}</p>
                        )}
                        <p className="text-pink-600 text-sm mt-1">{category.services?.length || 0} үйлчилгээ</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="text-center pt-4">
                <button onClick={() => setStep(3)} className="text-pink-600 hover:text-pink-700 text-sm">
                  Эсвэл шууд эмч сонгох →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Service (no price shown) */}
          {step === 2 && selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-pink-50 rounded-lg mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4 text-xl">
                  {selectedCategory.icon || '🏥'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedCategory.name}</h3>
                </div>
                <button onClick={() => { setSelectedCategory(null); setSelectedService(null); setStep(1); }} className="text-gray-500 hover:text-gray-700">
                  Өөрчлөх
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {selectedCategory.services?.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep(3); }}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors text-left ${
                      selectedService?.id === service.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      {service.description && (
                        <p className="text-gray-500 text-sm mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>⏱️ {service.duration} мин</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => { setSelectedCategory(null); setStep(1); }} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                  Буцах
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Doctor */}
          {step === 3 && (
            <div className="space-y-4">
              {selectedService && (
                <div className="flex items-center p-4 bg-pink-50 rounded-lg mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Сонгосон үйлчилгээ</p>
                    <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>⏱️ {selectedService.duration} мин</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedService(null); setStep(selectedCategory ? 2 : 1); }} className="text-gray-500 hover:text-gray-700">
                    Өөрчлөх
                  </button>
                </div>
              )}

              {doctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Эмч нарыг ачаалж байна...</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => { setSelectedDoctor(doctor); setStep(4); }}
                      className="flex items-center p-4 border-2 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-colors text-left"
                    >
                      <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">👩‍⚕️</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                        <p className="text-pink-600">{doctor.specialization}</p>
                        {doctor.bio && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{doctor.bio}</p>}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => { if (selectedService) setStep(2); else if (selectedCategory) setStep(2); else setStep(1); }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Буцах
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Select Date & Time */}
          {step === 4 && selectedDoctor && (
            <div className="space-y-6">
              <div className="p-4 bg-pink-50 rounded-lg space-y-2">
                {selectedService && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Үйлчилгээ:</span>
                    <span className="font-medium">{selectedService.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Эмч:</span>
                  <span className="font-medium">{selectedDoctor.name}</span>
                </div>
                <button onClick={() => { setSelectedDoctor(null); setSelectedDate(''); setSelectedTime(''); setStep(3); }} className="text-pink-600 text-sm hover:text-pink-700">
                  Өөрчлөх
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Огноо сонгох</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.value}
                      onClick={() => { setSelectedDate(date.value); setSelectedTime(''); }}
                      className={`p-2 text-center rounded-lg border transition-colors ${
                        selectedDate === date.value ? 'bg-pink-600 text-white border-pink-600' : 'hover:border-pink-500 hover:bg-pink-50'
                      }`}
                    >
                      <div className="text-xs">{dayTranslations[date.dayOfWeek]}</div>
                      <div className="font-semibold">{date.label.split(' ').pop()}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Цаг сонгох</label>
                  {slotsLoading ? (
                    <div className="text-center py-4 text-gray-500">Ачаалж байна...</div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">Энэ өдөр эмч ажиллахгүй эсвэл бүх цаг захиалагдсан байна</div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-2 text-center rounded-lg border transition-colors ${
                            !slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedTime === slot.time ? 'bg-pink-600 text-white border-pink-600'
                            : 'hover:border-pink-500 hover:bg-pink-50'
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
                <button onClick={() => { setSelectedDoctor(null); setStep(3); }} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Буцах</button>
                <button
                  onClick={() => setStep(5)}
                  disabled={!selectedDate || !selectedTime}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Үргэлжлүүлэх
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Patient Info & Booking Fee Info */}
          {step === 5 && selectedDoctor && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Захиалгын мэдээлэл</h3>
                <dl className="space-y-2 text-sm">
                  {selectedService && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Үйлчилгээ:</dt>
                      <dd className="font-medium text-gray-900">{selectedService.name}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Эмч:</dt>
                    <dd className="font-medium text-gray-900">{selectedDoctor.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Огноо:</dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Цаг:</dt>
                    <dd className="font-medium text-gray-900">{selectedTime}</dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <dt className="text-gray-600 font-medium">Баталгааны төлбөр:</dt>
                    <dd className="font-bold text-pink-600 text-lg">{BOOKING_FEE.toLocaleString()}₮</dd>
                  </div>
                </dl>
              </div>

              {/* Booking Fee Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Баталгааны төлбөрийн тухай</p>
                    <ul className="space-y-1 text-amber-700">
                      <li>• {BOOKING_FEE.toLocaleString()}₮ нь цаг баталгаажуулалтын төлбөр юм</li>
                      <li>• Үйлчилгээний нийт үнээс хасагдана</li>
                      <li>• Захиалсан цагтаа ирээгүй бол буцаагдахгүй</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Patient Info Form */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Таны нэр *</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Овог Нэр"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар *</label>
                  <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="99001234"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл (заавал биш)</label>
                  <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="email@example.com"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тэмдэглэл (заавал биш)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Үзүүлэх шалтгаан, өвдөж буй хэсэг гэх мэт..." rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500" />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(4)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Буцах</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !patientName || !patientPhone}
                  className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center font-semibold"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Боловсруулж байна...
                    </>
                  ) : (
                    <>💳 Төлбөр төлөх – {BOOKING_FEE.toLocaleString()}₮</>
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
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Төлбөр амжилттай!</h2>
                  <p className="text-gray-600">Таны захиалга баталгаажлаа. Удахгүй баталгаажуулалтын хуудас руу шилжих болно...</p>
                  <div className="mt-4 animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : paymentStatus === 'FAILED' ? (
                // Payment Failed
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Төлбөр амжилтгүй</h2>
                  <p className="text-gray-600 mb-6">Төлбөр хийхэд алдаа гарлаа. Дахин оролдоно уу.</p>
                  <button onClick={handleRetryPayment} disabled={paymentLoading}
                    className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 font-semibold">
                    {paymentLoading ? 'Шинэ QR үүсгэж байна...' : 'Дахин оролдох'}
                  </button>
                </div>
              ) : paymentStatus === 'EXPIRED' ? (
                // Payment Expired
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">QR кодны хугацаа дууслаа</h2>
                  <p className="text-gray-600 mb-6">Шинэ QR код үүсгэж дахин төлнө үү.</p>
                  <button onClick={handleRetryPayment} disabled={paymentLoading}
                    className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 font-semibold">
                    {paymentLoading ? 'Шинэ QR үүсгэж байна...' : 'Шинэ QR код үүсгэх'}
                  </button>
                </div>
              ) : (
                // Waiting for payment - Show QR
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">QR кодоор төлбөр хийнэ үү</h2>
                  <p className="text-gray-600 mb-6">
                    Банкны аппликейшнаар QR код уншуулж {BOOKING_FEE.toLocaleString()}₮ төлнө үү
                  </p>

                  {/* QR Code Display */}
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 inline-block mb-6">
                    <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center mx-auto relative">
                      {paymentInvoice?.qrCode ? (
                        <div className="text-center">
                          {/* In production, render actual QR image from payment provider */}
                          <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              <p className="text-sm text-gray-500">QR Код</p>
                              <p className="text-xs text-gray-400 mt-1">Invoice: {paymentInvoice.invoiceId?.slice(-8)}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Amount and countdown */}
                  <div className="space-y-3 mb-6">
                    <div className="text-3xl font-bold text-pink-600">{BOOKING_FEE.toLocaleString()}₮</div>
                    {paymentCountdown > 0 && (
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Хугацаа: <span className="font-mono font-semibold text-gray-900">{formatCountdown(paymentCountdown)}</span></span>
                      </div>
                    )}
                  </div>

                  {/* Polling indicator */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                    <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
                    Төлбөр хүлээж байна...
                  </div>

                  {/* Payment instructions */}
                  <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">Төлбөр хийх заавар:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
                      <li>Банкны аппликейшнаа нээнэ</li>
                      <li>QR код уншуулах товч дарна</li>
                      <li>Дээрх QR кодыг уншуулна</li>
                      <li>Төлбөр баталгаажуулна</li>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
            <div className="animate-pulse">Ачаалж байна...</div>
          </div>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
