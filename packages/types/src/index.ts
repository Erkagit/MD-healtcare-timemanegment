// ==========================================
// CLINIC APPOINTMENT BOOKING - SHARED TYPES
// ==========================================

// Enums
export enum AppointmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
  QPAY = 'QPAY',
  SOCIALPAY = 'SOCIALPAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// Base Types
export interface Patient {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  bio: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDuration: number; // minutes, default 30
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId?: string;
  date: string;      // "2026-01-20"
  time: string;      // "10:00"
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  type: 'BOOKING_FEE' | 'SERVICE_BALANCE';
  status: PaymentStatus;
  method: PaymentMethod;
  qrCode: string | null;
  qrUrl: string | null;
  invoiceId: string | null;
  transactionId: string | null;
  paidAt: Date | null;
  expiresAt: Date | null;
  refundedAt: Date | null;
  refundReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Fee Constant
export const BOOKING_FEE = 25000; // 25,000₮

// API Request Types
export interface CreatePatientRequest {
  name: string;
  phone: string;
}

export interface SendOTPRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  code: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface CreateDoctorRequest {
  name: string;
  specialization: string;
  bio?: string;
  imageUrl?: string;
}

export interface UpdateDoctorRequest {
  name?: string;
  specialization?: string;
  bio?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CreateScheduleRequest {
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration?: number;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  serviceId?: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}

// Payment Request Types
export interface CreatePaymentInvoiceRequest {
  appointmentId: string;
}

export interface PaymentCallbackRequest {
  invoiceId: string;
  transactionId: string;
  status: string;
  amount?: number;
}

export interface RefundPaymentRequest {
  reason: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Patient | Admin;
  message?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds
}

// Extended Types with Relations
export interface DoctorWithSchedules extends Doctor {
  schedules: Schedule[];
}

export interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor: Doctor;
  service?: Service;
  payments?: Payment[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  doctorId: string;
  slots: TimeSlot[];
}

// Filter Types
export interface AppointmentFilters {
  date?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  patientId?: string;
}

export interface DoctorFilters {
  specialization?: string;
  isActive?: boolean;
}

// Specializations for Mongolia Clinic
export const SPECIALIZATIONS = [
  'Дотрын эмч',        // Internal Medicine
  'Хүүхдийн эмч',      // Pediatrics
  'Мэс засалч',        // Surgery
  'Эмэгтэйчүүдийн эмч', // Gynecology
  'Арьс өвчний эмч',    // Dermatology
  'Нүдний эмч',        // Ophthalmology
  'Шүдний эмч',        // Dentistry
  'Мэдрэлийн эмч',     // Neurology
  'Зүрх судасны эмч',   // Cardiology
  'Ерөнхий эмч',       // General Practitioner
] as const;

export type Specialization = typeof SPECIALIZATIONS[number];
