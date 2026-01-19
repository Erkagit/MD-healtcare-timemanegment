// ==========================================
// DOCTORS ROUTES - Public Doctor APIs
// ==========================================

import { Router } from 'express';
import { query } from 'express-validator';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { DayOfWeek } from '@prisma/client';

const router = Router();

// ==========================================
// GET /api/doctors - List all active doctors
// ==========================================
router.get(
  '/',
  [query('specialization').optional()],
  async (req, res, next) => {
    try {
      const { specialization } = req.query;

      const doctors = await prisma.doctor.findMany({
        where: {
          isActive: true,
          ...(specialization && { specialization: specialization as string }),
        },
        include: {
          schedules: {
            where: { isActive: true },
            orderBy: { dayOfWeek: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// GET /api/doctors/specializations - List specializations
// ==========================================
router.get('/specializations', async (req, res, next) => {
  try {
    const specializations = await prisma.doctor.findMany({
      where: { isActive: true },
      select: { specialization: true },
      distinct: ['specialization'],
      orderBy: { specialization: 'asc' },
    });

    res.json({
      success: true,
      data: specializations.map((s) => s.specialization),
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// GET /api/doctors/:id - Get doctor details
// ==========================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!doctor || !doctor.isActive) {
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

// ==========================================
// GET /api/doctors/:id/slots - Get available time slots
// ==========================================
router.get('/:id/slots', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      throw new AppError('Огноо шаардлагатай', 400);
    }

    const selectedDate = new Date(date as string);
    
    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      throw new AppError('Өнгөрсөн огноо сонгох боломжгүй', 400);
    }

    // Get day of week
    const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = days[selectedDate.getDay()];

    // Get doctor's schedule for this day
    const schedule = await prisma.schedule.findFirst({
      where: {
        doctorId: id,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) {
      return res.json({
        success: true,
        data: {
          date: date as string,
          doctorId: id,
          slots: [],
          message: 'Энэ өдөр эмч ажиллахгүй',
        },
      });
    }

    // Generate all time slots
    const slots: { time: string; available: boolean }[] = [];
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Get existing appointments for this date and doctor
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        date: selectedDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { time: true },
    });

    const bookedTimes = new Set(existingAppointments.map((a) => a.time));

    // Check if selected date is today
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const currentMinutes = isToday 
      ? new Date().getHours() * 60 + new Date().getMinutes() 
      : 0;

    for (let mins = startMinutes; mins < endMinutes; mins += schedule.slotDuration) {
      const hour = Math.floor(mins / 60);
      const min = mins % 60;
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

      // Slot is available if:
      // 1. Not already booked
      // 2. If today, not in the past
      const available = !bookedTimes.has(time) && (!isToday || mins > currentMinutes);

      slots.push({ time, available });
    }

    res.json({
      success: true,
      data: {
        date: date as string,
        doctorId: id,
        slots,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
