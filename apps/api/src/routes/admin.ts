// ==========================================
// ADMIN ROUTES - Doctor & Admin Management
// ==========================================

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticateAdmin } from '../middleware/auth';

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
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, doctor: true },
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

export default router;
