// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Generic fetch wrapper
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const isGet = !options?.method || options.method === 'GET';
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    // Cache GET requests for 60 seconds by default
    ...(isGet && { next: { revalidate: options?.revalidate ?? 60 } }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
}

// Services APIs
export const servicesAPI = {
  getCategories: () =>
    fetchAPI<ServiceCategory[]>('/services/categories'),

  getAll: (categoryId?: string) => {
    const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return fetchAPI<Service[]>(`/services${query}`);
  },

  getById: (id: string) =>
    fetchAPI<Service>(`/services/${id}`),
};

// Doctor APIs
export const doctorsAPI = {
  getAll: (specialization?: string) => {
    const query = specialization ? `?specialization=${encodeURIComponent(specialization)}` : '';
    return fetchAPI<{ success: boolean; data: Doctor[] }>(`/doctors${query}`);
  },

  getById: (id: string) => 
    fetchAPI<{ success: boolean; data: DoctorWithSchedules }>(`/doctors/${id}`),

  getSpecializations: () =>
    fetchAPI<{ success: boolean; data: string[] }>('/doctors/specializations'),

  getAvailableSlots: (doctorId: string, date: string) =>
    fetchAPI<{ success: boolean; data: AvailableSlotsResponse }>(`/doctors/${doctorId}/slots?date=${date}`),
};

// Appointment APIs
export const appointmentsAPI = {
  create: (data: CreateAppointmentRequest) =>
    fetchAPI<{ success: boolean; data: Appointment; message: string }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    fetchAPI<{ success: boolean; data: AppointmentWithDetails }>(`/appointments/${id}`),
};

// Payment APIs
export const paymentsAPI = {
  createInvoice: (appointmentId: string) =>
    fetchAPI<{ 
      success: boolean; 
      data: PaymentInvoice;
      message: string;
    }>('/payments/create-invoice', {
      method: 'POST',
      body: JSON.stringify({ appointmentId }),
    }),

  checkStatus: (paymentId: string) =>
    fetchAPI<{ 
      success: boolean; 
      data: PaymentCheckResult;
    }>(`/payments/check/${paymentId}`),

  getByAppointment: (appointmentId: string) =>
    fetchAPI<{ success: boolean; data: Payment[] }>(`/payments/appointment/${appointmentId}`),
};

// Auth APIs
export const authAPI = {
  sendOTP: (phone: string) =>
    fetchAPI<{ success: boolean; message: string; code?: string }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOTP: (phone: string, code: string, name?: string) =>
    fetchAPI<{ success: boolean; token: string; user: Patient }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code, name }),
    }),
};

// Types
interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  services?: Service[];
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  duration: number;
  isActive: boolean;
  order: number;
  category?: ServiceCategory;
  // price is intentionally NOT included in public API
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  bio: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface DoctorWithSchedules extends Doctor {
  schedules: Schedule[];
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId?: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
}

interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor: Doctor;
  service?: Service;
  payments?: Payment[];
}

interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  type: string;
  status: string;
  method: string;
  qrCode: string | null;
  qrUrl: string | null;
  invoiceId: string | null;
  transactionId: string | null;
  paidAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface PaymentInvoice {
  paymentId: string;
  amount: number;
  qrCode: string | null;
  qrUrl: string | null;
  invoiceId: string | null;
  expiresAt: string | null;
}

interface PaymentCheckResult {
  paymentId: string;
  appointmentId?: string;
  amount?: number;
  status: string;
  paidAt?: string | null;
  message?: string;
  appointment?: AppointmentWithDetails;
}

interface CreateAppointmentRequest {
  doctorId: string;
  serviceId?: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  notes?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailableSlotsResponse {
  date: string;
  doctorId: string;
  slots: TimeSlot[];
  message?: string;
}

export type { 
  ServiceCategory,
  Service,
  Doctor, 
  DoctorWithSchedules, 
  Schedule, 
  Patient, 
  Appointment, 
  AppointmentWithDetails,
  CreateAppointmentRequest,
  TimeSlot,
  AvailableSlotsResponse,
  Payment,
  PaymentInvoice,
  PaymentCheckResult,
};
