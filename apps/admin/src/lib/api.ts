// ==========================================
// Admin API Client — MD Health Care
// Production-grade fetch with auth, error
// handling, structured logging
// ==========================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ==========================================
// Custom API Error
// ==========================================
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details: unknown;

  constructor(message: string, status: number, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isNetworkError() {
    return this.code === 'NETWORK_ERROR';
  }

  get isServerError() {
    return this.status >= 500;
  }
}

// ==========================================
// Auth token helpers
// ==========================================
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
};

const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};

/** Fires custom event so AuthProvider redirects to /login */
const dispatchAuthError = (status: number, message: string) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('auth:error', { detail: { status, message } })
  );
};

// ==========================================
// Core fetch wrapper
// ==========================================
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  const url = `${API_URL}${endpoint}`;
  const method = options?.method || 'GET';

  console.log(`[API] ${method} ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    // --- Parse response body safely (handle non-JSON) ---
    let data: Record<string, unknown> | unknown;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        console.error(`[API] Failed to parse JSON from ${endpoint}`);
        data = { error: 'Invalid JSON response from server' };
      }
    } else {
      const text = await response.text();
      console.error(
        `[API] Non-JSON response (${response.status}) from ${endpoint}:`,
        text.substring(0, 300)
      );
      data = { error: `Server returned unexpected response (${response.status})` };
    }

    // --- Handle 401/403 — auth failures ---
    if (response.status === 401 || response.status === 403) {
      const errorMsg =
        (data as Record<string, string>)?.error ||
        'Нэвтрэлт шаардлагатай — дахин нэвтэрнэ үү';

      console.error(`[API] Auth failed (${response.status}) ${endpoint}: ${errorMsg}`);
      clearAuth();
      dispatchAuthError(response.status, errorMsg);
      throw new ApiError(errorMsg, response.status, 'AUTH_ERROR');
    }

    // --- Handle other HTTP errors ---
    if (!response.ok) {
      const errorMsg =
        (data as Record<string, string>)?.error ||
        (data as Record<string, string>)?.message ||
        `Request failed (${response.status})`;

      console.error(`[API] Error (${response.status}) ${endpoint}: ${errorMsg}`);
      throw new ApiError(errorMsg, response.status, 'REQUEST_ERROR', data);
    }

    console.log(`[API] ✓ ${method} ${endpoint}`);
    return data as T;
  } catch (err) {
    // Re-throw our own errors
    if (err instanceof ApiError) throw err;

    // Network / DNS / timeout errors
    const message =
      err instanceof TypeError && err.message.includes('fetch')
        ? 'Сервертэй холбогдож чадсангүй. Интернет холболтоо шалгана уу.'
        : (err as Error).message || 'Unknown network error';

    console.error(`[API] Network error on ${endpoint}:`, err);
    throw new ApiError(message, 0, 'NETWORK_ERROR', err);
  }
}

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ success: boolean; token: string; user: Admin }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Admin APIs
export const adminAPI = {
  getStats: () =>
    fetchAPI<{ success: boolean; data: DashboardStats }>('/admin/stats'),

  getProfile: () =>
    fetchAPI<{ success: boolean; data: Admin }>('/admin/profile'),

  // Doctors
  getDoctors: () =>
    fetchAPI<{ success: boolean; data: DoctorWithStats[] }>('/admin/doctors'),

  getDoctor: (id: string) =>
    fetchAPI<{ success: boolean; data: DoctorWithStats }>(`/admin/doctors/${id}`),

  createDoctor: (data: CreateDoctorInput) =>
    fetchAPI<{ success: boolean; data: Doctor }>('/admin/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDoctor: (id: string, data: UpdateDoctorInput) =>
    fetchAPI<{ success: boolean; data: Doctor }>(`/admin/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteDoctor: (id: string) =>
    fetchAPI<{ success: boolean }>(`/admin/doctors/${id}`, {
      method: 'DELETE',
    }),
};

// Schedules APIs
export const schedulesAPI = {
  getByDoctor: (doctorId: string) =>
    fetchAPI<{ success: boolean; data: Schedule[] }>(`/schedules/${doctorId}`),

  save: (data: SaveScheduleInput) =>
    fetchAPI<{ success: boolean; data: Schedule }>('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  bulkSave: (doctorId: string, schedules: ScheduleInput[]) =>
    fetchAPI<{ success: boolean; data: Schedule[] }>('/schedules/bulk', {
      method: 'POST',
      body: JSON.stringify({ doctorId, schedules }),
    }),
};

// Appointments APIs
export const appointmentsAPI = {
  getAll: (params?: AppointmentFilters) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.doctorId) query.set('doctorId', params.doctorId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    
    const queryString = query.toString();
    return fetchAPI<{ 
      success: boolean; 
      data: AppointmentWithDetails[];
      pagination: Pagination;
    }>(`/appointments${queryString ? `?${queryString}` : ''}`);
  },

  create: (data: CreateAppointmentInput) =>
    fetchAPI<{ success: boolean; data: AppointmentWithDetails; message: string }>('/admin/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    fetchAPI<{ success: boolean; data: AppointmentWithDetails }>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getByDateRange: (startDate: string, endDate: string, doctorId?: string) => {
    const query = new URLSearchParams();
    query.set('startDate', startDate);
    query.set('endDate', endDate);
    if (doctorId) query.set('doctorId', doctorId);
    return fetchAPI<{ success: boolean; data: AppointmentWithDetails[] }>(`/appointments/range?${query.toString()}`);
  },

  delete: (id: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/admin/appointments/${id}`, {
      method: 'DELETE',
    }),

  bulkDelete: (ids: string[]) =>
    fetchAPI<{ success: boolean; message: string; deletedCount: number }>('/admin/appointments/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
};

// Doctors public API (for slot availability)
export const doctorsAPI = {
  getSlots: (doctorId: string, date: string) =>
    fetchAPI<{ success: boolean; data: { date: string; doctorId: string; slots: { time: string; available: boolean }[] } }>(`/doctors/${doctorId}/slots?date=${date}`),
};

// Payment APIs
export const paymentsAPI = {
  getByAppointment: (appointmentId: string) =>
    fetchAPI<{ success: boolean; data: Payment[] }>(`/payments/appointment/${appointmentId}`),

  verify: (paymentId: string, data?: { transactionId?: string; notes?: string }) =>
    fetchAPI<{ success: boolean; data: AppointmentWithDetails }>(`/payments/${paymentId}/verify`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  refund: (paymentId: string, reason: string) =>
    fetchAPI<{ success: boolean }>(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getStats: () =>
    fetchAPI<{ success: boolean; data: PaymentStats }>('/payments/stats'),

  simulatePayment: (paymentId: string) =>
    fetchAPI<{ success: boolean; data: AppointmentWithDetails }>(`/payments/simulate-payment/${paymentId}`, {
      method: 'POST',
    }),

  syncPending: () =>
    fetchAPI<{ success: boolean; message: string; data: { total: number; confirmed: number; expired: number; stillPending: number } }>('/payments/sync-pending', {
      method: 'POST',
    }),
};

// Services APIs (Admin - includes prices)
export const servicesAPI = {
  getCategories: () =>
    fetchAPI<{ success: boolean; data: ServiceCategory[] }>('/services/categories/admin'),

  getAll: () =>
    fetchAPI<{ success: boolean; data: Service[] }>('/services/admin/all'),

  createCategory: (data: CreateCategoryInput) =>
    fetchAPI<{ success: boolean; data: ServiceCategory }>('/services/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: UpdateCategoryInput) =>
    fetchAPI<{ success: boolean; data: ServiceCategory }>(`/services/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/services/categories/${id}`, {
      method: 'DELETE',
    }),

  createService: (data: CreateServiceInput) =>
    fetchAPI<{ success: boolean; data: Service }>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: UpdateServiceInput) =>
    fetchAPI<{ success: boolean; data: Service }>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteService: (id: string) =>
    fetchAPI<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE',
    }),
};

// Types
export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  bio: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface DoctorWithStats extends Doctor {
  schedules: Schedule[];
  _count: { appointments: number };
}

export interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
}

export interface AppointmentWithDetails {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId?: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  createdAt: string;
  patient: Patient;
  doctor: Doctor;
  service?: Service;
  payments?: Payment[];
}

export interface Payment {
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
  refundedAt: string | null;
  refundReason: string | null;
  createdAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  todayPayments: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingPayments: number;
}

export interface DashboardStats {
  totalDoctors: number;
  activeDoctors: number;
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingPayments: number;
  recentAppointments: AppointmentWithDetails[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateDoctorInput {
  name: string;
  specialization: string;
  bio?: string;
  imageUrl?: string;
}

export interface UpdateDoctorInput {
  name?: string;
  specialization?: string;
  bio?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ScheduleInput {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration?: number;
}

export interface SaveScheduleInput extends ScheduleInput {
  doctorId: string;
}

export interface AppointmentFilters {
  date?: string;
  doctorId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateAppointmentInput {
  doctorId: string;
  serviceId?: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  notes?: string;
  /** If true, creates as PENDING (requires QPay payment). Default: false (CONFIRMED) */
  requirePayment?: boolean;
}

// Service Types
export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
  isActive: boolean;
  services?: Service[];
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  duration: number;
  price: number | null;
  isActive: boolean;
  order: number;
  category?: ServiceCategory;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  categoryId: string;
  duration?: number;
  price?: number;
  order?: number;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  categoryId?: string;
  duration?: number;
  price?: number;
  order?: number;
  isActive?: boolean;
}
