// ==========================================
// AUTH ROUTES - OTP & Admin Login
// ==========================================

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Generate OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==========================================
// POST /api/auth/otp/send - Send OTP
// ==========================================
router.post(
  '/otp/send',
  [body('phone').notEmpty().withMessage('Утасны дугаар шаардлагатай')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { phone } = req.body;

      // Generate OTP
      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Delete old OTPs for this phone
      await prisma.oTP.deleteMany({ where: { phone } });

      // Create new OTP
      await prisma.oTP.create({
        data: { phone, code, expiresAt },
      });

      // In production, send SMS here
      // For development, log the OTP
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📱 OTP for ${phone}: ${code}`);
      }

      res.json({
        success: true,
        message: 'OTP код илгээгдлээ',
        expiresIn: 300, // 5 minutes in seconds
        // Only include code in development
        ...(process.env.NODE_ENV !== 'production' && { code }),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// POST /api/auth/otp/verify - Verify OTP
// ==========================================
router.post(
  '/otp/verify',
  [
    body('phone').notEmpty().withMessage('Утасны дугаар шаардлагатай'),
    body('code').notEmpty().withMessage('OTP код шаардлагатай'),
    body('name').optional(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { phone, code, name } = req.body;

      // Find valid OTP
      const otp = await prisma.oTP.findFirst({
        where: {
          phone,
          code,
          verified: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!otp) {
        throw new AppError('OTP код буруу эсвэл хугацаа дууссан', 400);
      }

      // Mark OTP as verified
      await prisma.oTP.update({
        where: { id: otp.id },
        data: { verified: true },
      });

      // Find or create patient
      let patient = await prisma.patient.findUnique({ where: { phone } });

      if (!patient) {
        if (!name) {
          throw new AppError('Шинэ хэрэглэгчийн нэр шаардлагатай', 400);
        }
        patient = await prisma.patient.create({
          data: { phone, name },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: patient.id, phone: patient.phone },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// POST /api/auth/admin/login - Admin Login
// ==========================================
router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('И-мэйл хаяг буруу'),
    body('password').notEmpty().withMessage('Нууц үг шаардлагатай'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { email, password } = req.body;

      // Find admin
      const admin = await prisma.admin.findUnique({ where: { email } });

      if (!admin || !admin.isActive) {
        throw new AppError('И-мэйл эсвэл нууц үг буруу', 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        throw new AppError('И-мэйл эсвэл нууц үг буруу', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_ADMIN_SECRET!,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
