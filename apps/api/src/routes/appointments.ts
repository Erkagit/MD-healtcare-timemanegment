// ==========================================
// APPOINTMENTS ROUTES - Booking APIs
// ==========================================

import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticatePatient, authenticateAdmin, optionalAuth } from '../middleware/auth';
import { DayOfWeek } from '@prisma/client';

const router = Router();

// ==========================================
// POST /api/appointments - Create appointment
// ==========================================
router.post(
  '/',
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

      const { doctorId, date, time, patientName, patientPhone, patientEmail, serviceId, notes } = req.body;
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

      // Check if slot is a valid slot interval
      if ((slotMinutes - startMinutes) % schedule.slotDuration !== 0) {
        throw new AppError('Буруу цагийн интервал', 400);
      }

      // Check for double booking (using unique constraint)
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

      // If today, check time is not in the past
      const isToday = appointmentDate.toDateString() === new Date().toDateString();
      if (isToday) {
        const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
        if (slotMinutes <= currentMinutes) {
          throw new AppError('Өнгөрсөн цаг сонгох боломжгүй', 400);
        }
      }

      // Find or create patient
      let patient = await prisma.patient.findUnique({ where: { phone: patientPhone } });
      
      if (!patient) {
        patient = await prisma.patient.create({
          data: { phone: patientPhone, name: patientName, email: patientEmail },
        });
      } else {
        // Update name and email if different
        const updates: { name?: string; email?: string } = {};
        if (patient.name !== patientName) updates.name = patientName;
        if (patientEmail && patient.email !== patientEmail) updates.email = patientEmail;
        
        if (Object.keys(updates).length > 0) {
          patient = await prisma.patient.update({
            where: { id: patient.id },
            data: updates,
          });
        }
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId,
          serviceId: serviceId || null,
          date: appointmentDate,
          time,
          notes,
          status: 'PENDING',
        },
        include: {
          doctor: true,
          patient: true,
          service: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Цаг захиалга амжилттай бүртгэгдлээ',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// GET /api/appointments - List appointments (Admin)
// ==========================================
router.get(
  '/',
  authenticateAdmin,
  [
    query('date').optional().isISO8601(),
    query('doctorId').optional(),
    query('status').optional(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res, next) => {
    try {
      const { date, doctorId, status, page = 1, limit = 20 } = req.query;

      const where: Record<string, unknown> = {};

      if (date) {
        where.date = new Date(date as string);
      }
      if (doctorId) {
        where.doctorId = doctorId;
      }
      if (status) {
        where.status = status;
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          include: {
            patient: true,
            doctor: true,
          },
          orderBy: [{ date: 'desc' }, { time: 'asc' }],
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.appointment.count({ where }),
      ]);

      res.json({
        success: true,
        data: appointments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// GET /api/appointments/my - Patient's appointments
// ==========================================
router.get('/my', authenticatePatient, async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.user!.id },
      include: { doctor: true },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// GET /api/appointments/:id - Get appointment details
// ==========================================
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      throw new AppError('Захиалга олдсонгүй', 404);
    }

    // Check access - either admin or the patient
    if (req.user) {
      if (req.user.type === 'patient' && appointment.patientId !== req.user.id) {
        throw new AppError('Хандах эрхгүй', 403);
      }
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// PATCH /api/appointments/:id/status - Update status (Admin)
// ==========================================
router.patch(
  '/:id/status',
  authenticateAdmin,
  [body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).withMessage('Буруу статус')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { id } = req.params;
      const { status } = req.body;

      const appointment = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
          patient: true,
          doctor: true,
        },
      });

      res.json({
        success: true,
        message: 'Статус амжилттай шинэчлэгдлээ',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// DELETE /api/appointments/:id - Cancel appointment
// ==========================================
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({ where: { id } });

    if (!appointment) {
      throw new AppError('Захиалга олдсонгүй', 404);
    }

    // Check access
    if (req.user?.type === 'patient' && appointment.patientId !== req.user.id) {
      throw new AppError('Хандах эрхгүй', 403);
    }

    // Can only cancel PENDING or CONFIRMED appointments
    if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
      throw new AppError('Энэ захиалгыг цуцлах боломжгүй', 400);
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      message: 'Захиалга цуцлагдлаа',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
