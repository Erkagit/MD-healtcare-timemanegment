// ==========================================
// SCHEDULES ROUTES - Doctor Schedule Management
// ==========================================

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticateAdmin } from '../middleware/auth';
import { DayOfWeek } from '@prisma/client';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// ==========================================
// GET /api/schedules/:doctorId - Get doctor's schedules
// ==========================================
router.get('/:doctorId', async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const schedules = await prisma.schedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// POST /api/schedules - Create or update schedule
// ==========================================
router.post(
  '/',
  [
    body('doctorId').notEmpty().withMessage('Эмч сонгоно уу'),
    body('dayOfWeek')
      .isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
      .withMessage('Өдөр буруу'),
    body('startTime')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Эхлэх цаг буруу форматтай (HH:MM)'),
    body('endTime')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Дуусах цаг буруу форматтай (HH:MM)'),
    body('slotDuration')
      .optional()
      .isInt({ min: 10, max: 120 })
      .withMessage('Үзлэгийн хугацаа 10-120 минут байх ёстой'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { doctorId, dayOfWeek, startTime, endTime, slotDuration = 30 } = req.body;

      // Validate doctor exists
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor) {
        throw new AppError('Эмч олдсонгүй', 404);
      }

      // Validate time range
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      if (startH * 60 + startM >= endH * 60 + endM) {
        throw new AppError('Эхлэх цаг дуусах цагаас өмнө байх ёстой', 400);
      }

      // Upsert schedule
      const schedule = await prisma.schedule.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId,
            dayOfWeek: dayOfWeek as DayOfWeek,
          },
        },
        update: {
          startTime,
          endTime,
          slotDuration,
          isActive: true,
        },
        create: {
          doctorId,
          dayOfWeek: dayOfWeek as DayOfWeek,
          startTime,
          endTime,
          slotDuration,
        },
      });

      res.json({
        success: true,
        message: 'Хуваарь хадгалагдлаа',
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// POST /api/schedules/bulk - Bulk update schedules
// ==========================================
router.post(
  '/bulk',
  [
    body('doctorId').notEmpty().withMessage('Эмч сонгоно уу'),
    body('schedules').isArray().withMessage('Хуваарийн жагсаалт шаардлагатай'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { doctorId, schedules } = req.body;

      // Validate doctor exists
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor) {
        throw new AppError('Эмч олдсонгүй', 404);
      }

      // Deactivate all existing schedules first
      await prisma.schedule.updateMany({
        where: { doctorId },
        data: { isActive: false },
      });

      // Create or update schedules
      const results: any[] = [];
      for (const item of schedules) {
        const schedule = await prisma.schedule.upsert({
          where: {
            doctorId_dayOfWeek: {
              doctorId,
              dayOfWeek: item.dayOfWeek,
            },
          },
          update: {
            startTime: item.startTime,
            endTime: item.endTime,
            slotDuration: item.slotDuration || 30,
            isActive: true,
          },
          create: {
            doctorId,
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            slotDuration: item.slotDuration || 30,
          },
        });
        results.push(schedule);
      }

      res.json({
        success: true,
        message: 'Хуваарь бүгд хадгалагдлаа',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// DELETE /api/schedules/:id - Delete schedule
// ==========================================
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.schedule.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Хуваарь устгагдлаа',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
