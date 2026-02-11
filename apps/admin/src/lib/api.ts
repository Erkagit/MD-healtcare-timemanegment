// Admin API Client
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

console.log('[API] Using API_URL:', API_URL);

// Get token from localStorage (client-side only)
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
};

// Generic fetch wrapper with auth
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  const url = `${API_URL}${endpoint}`;
  
  console.log('[API] Fetching:', url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (err) {
    console.error('[API] Error:', err);
    throw err;
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
};

// Services APIs (Admin - includes prices)
export const servicesAPI = {
  getCategories: () =>
    fetchAPI<ServiceCategory[]>('/services/categories/admin'),

  getAll: () =>
    fetchAPI<Service[]>('/services/admin/all'),

  createCategory: (data: CreateCategoryInput) =>
    fetchAPI<ServiceCategory>('/services/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: UpdateCategoryInput) =>
    fetchAPI<ServiceCategory>(`/services/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    fetchAPI<{ message: string }>(`/services/categories/${id}`, {
      method: 'DELETE',
    }),

  createService: (data: CreateServiceInput) =>
    fetchAPI<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: UpdateServiceInput) =>
    fetchAPI<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteService: (id: string) =>
    fetchAPI<{ message: string }>(`/services/${id}`, {
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
