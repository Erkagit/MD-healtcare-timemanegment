// ==========================================
// CLINIC APPOINTMENT BOOKING - SHARED TYPES
// ==========================================

// Enums
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
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
  date: string;      // "2026-01-20"
  time: string;      // "10:00"
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
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
