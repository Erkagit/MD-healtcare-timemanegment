// ==========================================
// PAYMENT ROUTES - QR Payment & Verification (QPay V2)
// ==========================================

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma';
import qpay from '../lib/qpay';
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
        const metadata = existingPayment.metadata as any;
        return res.json({
          success: true,
          data: {
            paymentId: existingPayment.id,
            amount: existingPayment.amount,
            qrCode: existingPayment.qrCode,
            qrImage: existingPayment.qrCode, // qr_text stored here, but for existing we can re-check
            qrUrl: existingPayment.qrUrl,
            invoiceId: existingPayment.invoiceId,
            expiresAt: existingPayment.expiresAt,
            urls: metadata?.urls || [],
          },
        });
      }

      // Generate QR Code via QPay
      if (!qpay.isConfigured()) {
        throw new AppError('QPay тохиргоо дутуу байна. Админтай холбогдоно уу.', 500);
      }

      const senderInvoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const expiresAt = new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000);

      // Call QPay API to create invoice
      const qpayInvoice = await qpay.createInvoice({
        senderInvoiceNo,
        invoiceReceiverCode: appointment.patient.phone,
        description: `Үзлэгийн цаг баталгаажуулалт - ${appointment.doctor.name}`,
        amount: BOOKING_FEE,
      });

      // Create payment record with real QPay data
      const payment = await prisma.payment.create({
        data: {
          appointmentId,
          amount: BOOKING_FEE,
          type: 'BOOKING_FEE',
          status: 'PENDING',
          method: 'QPAY',
          qrCode: qpayInvoice.qr_text,
          qrUrl: qpayInvoice.qPay_shortUrl,
          invoiceId: qpayInvoice.invoice_id,
          expiresAt,
          metadata: {
            sender_invoice_no: senderInvoiceNo,
            urls: qpayInvoice.urls as any,
          } as any,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Төлбөрийн QR код үүсгэгдлээ',
        data: {
          paymentId: payment.id,
          amount: BOOKING_FEE,
          qrCode: payment.qrCode,
          qrImage: qpayInvoice.qr_image, // Base64 QR image
          qrUrl: payment.qrUrl,
          invoiceId: payment.invoiceId,
          expiresAt: payment.expiresAt,
          urls: qpayInvoice.urls, // Bank deep links
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

    // If payment is still PENDING, check QPay for real-time status
    if (payment.status === 'PENDING' && payment.invoiceId && qpay.isConfigured()) {
      try {
        const qpayStatus = await qpay.checkPayment(payment.invoiceId);

        if (qpayStatus.count > 0 && qpayStatus.paid_amount >= payment.amount) {
          // Payment confirmed by QPay! Update our records
          const paidRow = qpayStatus.rows[0];

          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'COMPLETED',
                transactionId: paidRow?.payment_id || null,
                paidAt: new Date(),
                metadata: {
                  ...(payment.metadata as any || {}),
                  qpay_check: qpayStatus,
                },
              },
            }),
            prisma.appointment.update({
              where: { id: payment.appointmentId },
              data: { status: 'PAID' },
            }),
          ]);

          return res.json({
            success: true,
            data: {
              paymentId: payment.id,
              appointmentId: payment.appointmentId,
              amount: payment.amount,
              status: 'COMPLETED',
              paidAt: new Date(),
              appointment: payment.appointment,
            },
          });
        }
      } catch (error) {
        console.error('QPay check failed, returning DB status:', error);
        // Fall through to return DB status
      }
    }

    // Return current DB status
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
// POST /api/payments/callback - QPay webhook callback
// ==========================================
router.post('/callback', async (req: Request, res: Response, next) => {
  try {
    // QPay sends callback with query param ?invoice_id=...
    // and body may contain payment info
    const invoiceIdFromQuery = req.query.invoice_id as string;
    const { invoiceId: invoiceIdFromBody, transactionId, status, amount } = req.body;
    
    const lookupInvoiceId = invoiceIdFromQuery || invoiceIdFromBody;

    if (!lookupInvoiceId) {
      console.warn('⚠️ QPay callback received without invoice_id:', req.body, req.query);
      return res.json({ success: true });
    }

    console.log('📥 QPay callback received for invoice:', lookupInvoiceId);

    // Find payment by QPay invoice_id or by sender_invoice_no
    let payment = await prisma.payment.findUnique({
      where: { invoiceId: lookupInvoiceId },
      include: { appointment: true },
    });

    // If not found by invoiceId, search by sender_invoice_no in metadata
    if (!payment) {
      const payments = await prisma.payment.findMany({
        where: {
          status: 'PENDING',
          metadata: {
            path: ['sender_invoice_no'],
            equals: lookupInvoiceId,
          },
        },
        include: { appointment: true },
        take: 1,
      });
      payment = payments[0] || null;
    }

    if (!payment) {
      console.warn('⚠️ Payment not found for callback invoice:', lookupInvoiceId);
      return res.json({ success: true });
    }

    if (payment.status !== 'PENDING') {
      return res.json({ success: true, message: 'Already processed' });
    }

    // Verify payment with QPay API
    if (payment.invoiceId && qpay.isConfigured()) {
      try {
        const qpayCheck = await qpay.checkPayment(payment.invoiceId);

        if (qpayCheck.count > 0 && qpayCheck.paid_amount >= payment.amount) {
          const paidRow = qpayCheck.rows[0];

          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'COMPLETED',
                transactionId: paidRow?.payment_id || transactionId || null,
                paidAt: new Date(),
                metadata: {
                  ...(payment.metadata as any || {}),
                  callback: req.body,
                  qpay_check: qpayCheck,
                },
              },
            }),
            prisma.appointment.update({
              where: { id: payment.appointmentId },
              data: { status: 'PAID' },
            }),
          ]);

          console.log('✅ Payment confirmed via callback:', payment.id);
          return res.json({ success: true, message: 'Төлбөр амжилттай баталгаажлаа' });
        }
      } catch (error) {
        console.error('QPay check in callback failed:', error);
      }
    }

    // Fallback: if QPay check fails but callback says success
    if (status === 'SUCCESS' || status === 'COMPLETED') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            transactionId: transactionId || null,
            paidAt: new Date(),
            metadata: {
              ...(payment.metadata as any || {}),
              callback: req.body,
            },
          },
        }),
        prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: 'PAID' },
        }),
      ]);

      console.log('✅ Payment confirmed via callback (fallback):', payment.id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Callback error:', error);
    // Always return 200 to QPay to prevent retries
    res.json({ success: true });
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
