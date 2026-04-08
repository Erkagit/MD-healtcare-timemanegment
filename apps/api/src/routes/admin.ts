// ==========================================
// ADMIN ROUTES - Doctor & Admin Management
// ==========================================

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticateAdmin } from '../middleware/auth';
import { DayOfWeek } from '@prisma/client';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// ==========================================
// DOCTOR MANAGEMENT
// ==========================================

// POST /api/admin/doctors - Create doctor
router.post(
  '/doctors',
  [
    body('name').notEmpty().withMessage('Эмчийн нэр шаардлагатай'),
    body('specialization').notEmpty().withMessage('Мэргэжил шаардлагатай'),
    body('bio').optional(),
    body('imageUrl').optional(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { name, specialization, bio, imageUrl } = req.body;

      const doctor = await prisma.doctor.create({
        data: { name, specialization, bio, imageUrl },
      });

      res.status(201).json({
        success: true,
        message: 'Эмч амжилттай бүртгэгдлээ',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/doctors - List all doctors (including inactive)
router.get('/doctors', async (req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/doctors/:id - Get doctor details
router.get('/doctors/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { appointments: true } },
      },
    });

    if (!doctor) {
      throw new AppError('Эмч олдсонгүй', 404);
    }

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/doctors/:id - Update doctor
router.put(
  '/doctors/:id',
  [
    body('name').optional().notEmpty(),
    body('specialization').optional().notEmpty(),
    body('bio').optional(),
    body('imageUrl').optional(),
    body('isActive').optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, specialization, bio, imageUrl, isActive } = req.body;

      const doctor = await prisma.doctor.update({
        where: { id },
        data: { 
          ...(name && { name }),
          ...(specialization && { specialization }),
          ...(bio !== undefined && { bio }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        message: 'Эмчийн мэдээлэл шинэчлэгдлээ',
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/doctors/:id - Soft delete (deactivate) doctor
router.delete('/doctors/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.doctor.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Эмч идэвхгүй болгогдлоо',
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalDoctors,
      activeDoctors,
      totalPatients,
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenue,
      todayRevenue,
      pendingPayments,
      recentAppointments,
    ] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.patient.count(),
      prisma.appointment.count({
        where: {
          date: { gte: today, lt: tomorrow },
        },
      }),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paidAt: { gte: today, lt: tomorrow },
        },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, doctor: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalDoctors,
        activeDoctors,
        totalPatients,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayRevenue: todayRevenue._sum.amount || 0,
        pendingPayments,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================

// GET /api/admin/profile - Get current admin profile
router.get('/profile', async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/profile - Update admin profile
router.put(
  '/profile',
  [
    body('name').optional().notEmpty(),
    body('currentPassword').optional(),
    body('newPassword').optional().isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    try {
      const { name, currentPassword, newPassword } = req.body;

      const updateData: { name?: string; password?: string } = {};

      if (name) {
        updateData.name = name;
      }

      if (currentPassword && newPassword) {
        const admin = await prisma.admin.findUnique({ where: { id: req.user!.id } });
        
        const isValidPassword = await bcrypt.compare(currentPassword, admin!.password);
        if (!isValidPassword) {
          throw new AppError('Одоогийн нууц үг буруу', 400);
        }

        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const admin = await prisma.admin.update({
        where: { id: req.user!.id },
        data: updateData,
        select: { id: true, email: true, name: true },
      });

      res.json({
        success: true,
        message: 'Профайл шинэчлэгдлээ',
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// POST /api/admin/appointments - Create appointment (Admin, CONFIRMED by default)
// ==========================================
router.post(
  '/appointments',
  [
    body('doctorId').notEmpty().withMessage('Эмч сонгоно уу'),
    body('date').isISO8601().withMessage('Огноо буруу форматтай'),
    body('time').matches(/^\d{2}:\d{2}$/).withMessage('Цаг буруу форматтай'),
    body('patientName').notEmpty().withMessage('Өвчтөний нэр шаардлагатай'),
    body('patientPhone').notEmpty().withMessage('Утасны дугаар шаардлагатай'),
    body('serviceId').optional(),
    body('patientEmail').optional().isEmail().withMessage('И-мэйл буруу форматтай'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { doctorId, date, time, patientName, patientPhone, patientEmail, serviceId, notes, requirePayment } = req.body;
      const appointmentDate = new Date(date);

      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        throw new AppError('Өнгөрсөн огноо сонгох боломжгүй', 400);
      }

      // Verify doctor exists and is active
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor || !doctor.isActive) {
        throw new AppError('Эмч олдсонгүй', 404);
      }

      // Check if doctor works on this day
      const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayOfWeek = days[appointmentDate.getDay()];

      const schedule = await prisma.schedule.findFirst({
        where: { doctorId, dayOfWeek, isActive: true },
      });

      if (!schedule) {
        throw new AppError('Эмч энэ өдөр ажиллахгүй', 400);
      }

      // Validate time is within schedule
      const [slotHour, slotMin] = time.split(':').map(Number);
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);

      const slotMinutes = slotHour * 60 + slotMin;
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (slotMinutes < startMinutes || slotMinutes >= endMinutes) {
        throw new AppError('Сонгосон цаг эмчийн ажиллах цагт багтахгүй байна', 400);
      }

      // Check slot interval
      if ((slotMinutes - startMinutes) % schedule.slotDuration !== 0) {
        throw new AppError('Буруу цагийн интервал', 400);
      }

      // Check for double booking
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId,
          date: appointmentDate,
          time,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (existingAppointment) {
        throw new AppError('Энэ цаг аль хэдийн захиалагдсан байна', 409);
      }

      // Find or create patient
      let patient = await prisma.patient.findUnique({ where: { phone: patientPhone } });

      if (!patient) {
        patient = await prisma.patient.create({
          data: { phone: patientPhone, name: patientName, email: patientEmail },
        });
      } else {
        const updates: { name?: string; email?: string } = {};
        if (patient.name !== patientName) updates.name = patientName;
        if (patientEmail && patient.email !== patientEmail) updates.email = patientEmail;
        if (Object.keys(updates).length > 0) {
          patient = await prisma.patient.update({ where: { id: patient.id }, data: updates });
        }
      }

      // Admin default: CONFIRMED unless requirePayment is explicitly true
      const appointmentStatus = requirePayment === true ? 'PENDING' : 'CONFIRMED';

      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId,
          serviceId: serviceId || null,
          date: appointmentDate,
          time,
          notes,
          status: appointmentStatus,
        },
        include: {
          doctor: true,
          patient: true,
          service: true,
        },
      });

      console.log(`[Admin] Created appointment ${appointment.id} as ${appointmentStatus} by admin ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: appointmentStatus === 'CONFIRMED'
          ? 'Захиалга амжилттай баталгаажлаа'
          : 'Захиалга үүсгэгдлээ — төлбөр хүлээгдэж байна',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// DELETE /api/admin/appointments/:id - Hard delete appointment (Admin only)
// ==========================================
router.delete('/appointments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!appointment) {
      throw new AppError('Захиалга олдсонгүй', 404);
    }

    // Delete associated payments first
    if (appointment.payments.length > 0) {
      await prisma.payment.deleteMany({
        where: { appointmentId: id },
      });
    }

    // Hard delete the appointment
    await prisma.appointment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Захиалга бүрэн устгагдлаа',
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// DELETE /api/admin/appointments/bulk/delete - Bulk hard delete (Admin only)
// ==========================================
router.post('/appointments/bulk/delete', async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Устгах захиалгын ID-ууд шаардлагатай', 400);
    }

    // Delete payments first
    await prisma.payment.deleteMany({
      where: { appointmentId: { in: ids } },
    });

    // Then delete appointments
    const result = await prisma.appointment.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({
      success: true,
      message: `${result.count} захиалга бүрэн устгагдлаа`,
      deletedCount: result.count,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
