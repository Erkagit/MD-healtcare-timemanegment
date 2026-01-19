'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doctorsAPI, appointmentsAPI, servicesAPI, type Doctor, type TimeSlot, type ServiceCategory, type Service } from '@/lib/api';

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
        // If services API fails, fall back to loading doctors directly
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

  // Generate next 14 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('mn-MN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        dayOfWeek: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()],
      });
    }
    
    return dates;
  };

  // Submit appointment
  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !patientName || !patientPhone) {
      setError('Бүх талбаруудыг бөглөнө үү');
      return;
    }

    // Validate phone number (Mongolian format)
    const phoneRegex = /^[0-9]{8}$/;
    if (!phoneRegex.test(patientPhone)) {
      setError('Утасны дугаар буруу байна (8 оронтой)');
      return;
    }

    setLoading(true);
    setError('');

    try {
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

      // Redirect to confirmation page
      router.push(`/book/confirmation?id=${response.data.id}`);
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

  // Render step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              s === step
                ? 'bg-pink-600 text-white'
                : s < step
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {s < step ? '✓' : s}
          </div>
          {s < 5 && (
            <div className={`w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
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
                <div className="text-center py-8 text-gray-500">
                  Ачаалж байна...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category);
                        setStep(2);
                      }}
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
                        <p className="text-pink-600 text-sm mt-1">
                          {category.services?.length || 0} үйлчилгээ
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Skip to doctor selection */}
              <div className="text-center pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="text-pink-600 hover:text-pink-700 text-sm"
                >
                  Эсвэл шууд эмч сонгох →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Service */}
          {step === 2 && selectedCategory && (
            <div className="space-y-4">
              {/* Selected Category */}
              <div className="flex items-center p-4 bg-pink-50 rounded-lg mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4 text-xl">
                  {selectedCategory.icon || '🏥'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedCategory.name}</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedService(null);
                    setStep(1);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Өөрчлөх
                </button>
              </div>

              {/* Services List */}
              <div className="grid grid-cols-1 gap-3">
                {selectedCategory.services?.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(3);
                    }}
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
                        {service.price && (
                          <span className="text-pink-600 font-medium">
                            {service.price.toLocaleString()}₮
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setStep(1);
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Буцах
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Doctor */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Selected Service Info */}
              {selectedService && (
                <div className="flex items-center p-4 bg-pink-50 rounded-lg mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Сонгосон үйлчилгээ</p>
                    <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>⏱️ {selectedService.duration} мин</span>
                      {selectedService.price && (
                        <span className="text-pink-600 font-medium">
                          {selectedService.price.toLocaleString()}₮
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setStep(selectedCategory ? 2 : 1);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Өөрчлөх
                  </button>
                </div>
              )}

              {doctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Эмч нарыг ачаалж байна...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setStep(4);
                      }}
                      className="flex items-center p-4 border-2 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-colors text-left"
                    >
                      <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl">👩‍⚕️</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
                        <p className="text-pink-600">{doctor.specialization}</p>
                        {doctor.bio && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{doctor.bio}</p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => {
                    if (selectedService) {
                      setStep(2);
                    } else if (selectedCategory) {
                      setStep(2);
                    } else {
                      setStep(1);
                    }
                  }}
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
              {/* Summary */}
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
                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    setSelectedDate('');
                    setSelectedTime('');
                    setStep(3);
                  }}
                  className="text-pink-600 text-sm hover:text-pink-700"
                >
                  Өөрчлөх
                </button>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Огноо сонгох
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.value}
                      onClick={() => {
                        setSelectedDate(date.value);
                        setSelectedTime('');
                      }}
                      className={`p-2 text-center rounded-lg border transition-colors ${
                        selectedDate === date.value
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'hover:border-pink-500 hover:bg-pink-50'
                      }`}
                    >
                      <div className="text-xs">{dayTranslations[date.dayOfWeek]}</div>
                      <div className="font-semibold">{date.label.split(' ').pop()}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цаг сонгох
                  </label>
                  {slotsLoading ? (
                    <div className="text-center py-4 text-gray-500">Ачаалж байна...</div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Энэ өдөр эмч ажиллахгүй эсвэл бүх цаг захиалагдсан байна
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-2 text-center rounded-lg border transition-colors ${
                            !slot.available
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selectedTime === slot.time
                              ? 'bg-pink-600 text-white border-pink-600'
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

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    setStep(3);
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Буцах
                </button>
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

          {/* Step 5: Patient Info & Confirmation */}
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
                      {new Date(selectedDate).toLocaleDateString('mn-MN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Цаг:</dt>
                    <dd className="font-medium text-gray-900">{selectedTime}</dd>
                  </div>
                  {selectedService?.price && (
                    <div className="flex justify-between pt-2 border-t">
                      <dt className="text-gray-600">Үнэ:</dt>
                      <dd className="font-semibold text-pink-600">
                        {selectedService.price.toLocaleString()}₮
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Patient Info Form */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Таны нэр *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Овог Нэр"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Утасны дугаар *
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="99001234"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    И-мэйл (заавал биш)
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тэмдэглэл (заавал биш)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Үзүүлэх шалтгаан, өвдөж буй хэсэг гэх мэт..."
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Буцах
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !patientName || !patientPhone}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center font-semibold"
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
                    '✓ Захиалга баталгаажуулах'
                  )}
                </button>
              </div>
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
