// ==========================================
// PAYMENT ROUTES - QR Payment & Verification
// ==========================================

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticateAdmin, optionalAuth } from '../middleware/auth';

const router = Router();

// ==========================================
// CONSTANTS
// ==========================================
const BOOKING_FEE = 25000; // 25,000₮ show-up fee
const QR_EXPIRY_MINUTES = 15; // QR code expires in 15 minutes

// ==========================================
// POST /api/payments/create-invoice - Generate QR payment for appointment
// ==========================================
router.post(
  '/create-invoice',
  [
    body('appointmentId').notEmpty().withMessage('Захиалгын ID шаардлагатай'),
  ],
  async (req: Request, res: Response, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { appointmentId } = req.body;

      // Find appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, doctor: true, service: true, payments: true },
      });

      if (!appointment) {
        throw new AppError('Захиалга олдсонгүй', 404);
      }

      // Check if appointment is in PENDING state
      if (appointment.status !== 'PENDING') {
        throw new AppError('Энэ захиалга төлбөр хүлээж байгаа төлөвт байхгүй байна', 400);
      }

      // Check for existing active payment
      const existingPayment = appointment.payments.find(
        (p) => p.status === 'PENDING' && p.type === 'BOOKING_FEE' && p.expiresAt && p.expiresAt > new Date()
      );

      if (existingPayment) {
        // Return existing QR if not expired
        return res.json({
          success: true,
          data: {
            paymentId: existingPayment.id,
            amount: existingPayment.amount,
            qrCode: existingPayment.qrCode,
            qrUrl: existingPayment.qrUrl,
            invoiceId: existingPayment.invoiceId,
            expiresAt: existingPayment.expiresAt,
          },
        });
      }

      // Generate QR Code / Invoice
      // In production, integrate with QPay, SocialPay, etc.
      const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000);

      // Generate a simple QR code data (in production, this comes from payment provider)
      const qrData = JSON.stringify({
        invoiceId,
        amount: BOOKING_FEE,
        description: `Үзлэгийн цаг баталгаажуулалт - ${appointment.doctor.name}`,
        accountNumber: process.env.BANK_ACCOUNT || '5000123456',
        accountName: process.env.BANK_ACCOUNT_NAME || 'MD Health Care',
        bankCode: process.env.BANK_CODE || 'khan',
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          appointmentId,
          amount: BOOKING_FEE,
          type: 'BOOKING_FEE',
          status: 'PENDING',
          method: 'QPAY',
          qrCode: qrData,
          qrUrl: `https://qpay.mn/payment/${invoiceId}`, // Mock URL
          invoiceId,
          expiresAt,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Төлбөрийн QR код үүсгэгдлээ',
        data: {
          paymentId: payment.id,
          amount: BOOKING_FEE,
          qrCode: payment.qrCode,
          qrUrl: payment.qrUrl,
          invoiceId: payment.invoiceId,
          expiresAt: payment.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// GET /api/payments/:paymentId/check - Check payment status
// ==========================================
router.get('/check/:paymentId', async (req: Request, res: Response, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { 
        appointment: {
          include: { patient: true, doctor: true, service: true },
        },
      },
    });

    if (!payment) {
      throw new AppError('Төлбөр олдсонгүй', 404);
    }

    // Check if QR expired
    if (payment.status === 'PENDING' && payment.expiresAt && payment.expiresAt < new Date()) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'EXPIRED' },
      });

      return res.json({
        success: true,
        data: {
          paymentId: payment.id,
          status: 'EXPIRED',
          message: 'QR кодны хугацаа дууссан. Шинээр үүсгэнэ үү.',
        },
      });
    }

    // In production: call payment provider API to check payment status
    // For now, return current status
    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        appointmentId: payment.appointmentId,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        appointment: payment.appointment,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// POST /api/payments/callback - Payment provider webhook/callback
// ==========================================
router.post('/callback', async (req: Request, res: Response, next) => {
  try {
    const { invoiceId, transactionId, status, amount } = req.body;

    // In production: verify callback signature from payment provider
    // const isValid = verifySignature(req.body, req.headers['x-signature']);
    // if (!isValid) throw new AppError('Invalid signature', 401);

    const payment = await prisma.payment.findUnique({
      where: { invoiceId },
      include: { appointment: true },
    });

    if (!payment) {
      throw new AppError('Төлбөр олдсонгүй', 404);
    }

    if (payment.status !== 'PENDING') {
      // Already processed, return success to prevent retries
      return res.json({ success: true, message: 'Already processed' });
    }

    // Verify amount matches
    if (amount && amount !== payment.amount) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'FAILED',
          metadata: { error: 'Amount mismatch', received: amount, expected: payment.amount },
        },
      });
      throw new AppError('Төлбөрийн дүн таарахгүй байна', 400);
    }

    if (status === 'SUCCESS' || status === 'COMPLETED') {
      // Update payment and appointment in a transaction
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            transactionId,
            paidAt: new Date(),
            metadata: req.body,
          },
        }),
        prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: 'PAID' },
        }),
      ]);

      res.json({
        success: true,
        message: 'Төлбөр амжилттай баталгаажлаа',
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: req.body,
        },
      });

      res.json({
        success: true,
        message: 'Payment failed',
      });
    }
  } catch (error) {
    next(error);
  }
});

// ==========================================
// POST /api/payments/:paymentId/verify - Manual payment verification (Admin)
// ==========================================
router.post(
  '/:paymentId/verify',
  authenticateAdmin,
  async (req: Request, res: Response, next) => {
    try {
      const { paymentId } = req.params;
      const { transactionId, notes } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { appointment: true },
      });

      if (!payment) {
        throw new AppError('Төлбөр олдсонгүй', 404);
      }

      if (payment.status === 'COMPLETED') {
        throw new AppError('Энэ төлбөр аль хэдийн баталгаажсан', 400);
      }

      // Admin manually confirms payment
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            method: 'ADMIN_OVERRIDE',
            transactionId: transactionId || `ADMIN-${Date.now()}`,
            paidAt: new Date(),
            metadata: { verifiedBy: 'admin', notes },
          },
        }),
        prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: 'CONFIRMED' },
        }),
      ]);

      const updatedAppointment = await prisma.appointment.findUnique({
        where: { id: payment.appointmentId },
        include: { patient: true, doctor: true, service: true, payments: true },
      });

      res.json({
        success: true,
        message: 'Төлбөр амжилттай баталгаажуулагдлаа',
        data: updatedAppointment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// POST /api/payments/:paymentId/refund - Refund payment (Admin)
// ==========================================
router.post(
  '/:paymentId/refund',
  authenticateAdmin,
  [
    body('reason').notEmpty().withMessage('Буцаан олголтын шалтгаан шаардлагатай'),
  ],
  async (req: Request, res: Response, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { paymentId } = req.params;
      const { reason } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new AppError('Төлбөр олдсонгүй', 404);
      }

      if (payment.status !== 'COMPLETED') {
        throw new AppError('Зөвхөн амжилттай төлбөрийг буцаан олгох боломжтой', 400);
      }

      // In production: call payment provider refund API
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          refundReason: reason,
        },
      });

      res.json({
        success: true,
        message: 'Төлбөр буцаан олгогдлоо',
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// GET /api/payments/appointment/:appointmentId - Get payments for an appointment
// ==========================================
router.get('/appointment/:appointmentId', async (req: Request, res: Response, next) => {
  try {
    const { appointmentId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// GET /api/payments/stats - Payment statistics (Admin)
// ==========================================
router.get('/stats', authenticateAdmin, async (req: Request, res: Response, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPayments,
      completedPayments,
      todayPayments,
      totalRevenue,
      todayRevenue,
      pendingPayments,
    ] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.count({
        where: { paidAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' },
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', paidAt: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalPayments,
        completedPayments,
        todayPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayRevenue: todayRevenue._sum.amount || 0,
        pendingPayments,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// POST /api/payments/simulate-payment - DEV ONLY: Simulate payment completion
// ==========================================
if (process.env.NODE_ENV !== 'production') {
  router.post('/simulate-payment/:paymentId', async (req: Request, res: Response, next) => {
    try {
      const { paymentId } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new AppError('Төлбөр олдсонгүй', 404);
      }

      if (payment.status !== 'PENDING') {
        throw new AppError('Энэ төлбөр аль хэдийн боловсруулагдсан', 400);
      }

      // Simulate successful payment
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            transactionId: `SIM-${Date.now()}`,
            paidAt: new Date(),
            metadata: { simulated: true },
          },
        }),
        prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: 'PAID' },
        }),
      ]);

      const updatedAppointment = await prisma.appointment.findUnique({
        where: { id: payment.appointmentId },
        include: { patient: true, doctor: true, service: true, payments: true },
      });

      res.json({
        success: true,
        message: 'Төлбөр амжилттай симуляци хийгдлээ',
        data: updatedAppointment,
      });
    } catch (error) {
      next(error);
    }
  });
}

export default router;
