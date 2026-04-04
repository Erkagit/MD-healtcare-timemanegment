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

      // ── Idempotent: check for existing active PENDING payment ──
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
            qrImage: metadata?.qr_image || existingPayment.qrCode,
            qrUrl: existingPayment.qrUrl,
            invoiceId: existingPayment.invoiceId,
            expiresAt: existingPayment.expiresAt,
            urls: metadata?.urls || [],
          },
        });
      }

      // ── QPay configured? ──
      if (!qpay.isConfigured()) {
        throw new AppError('QPay тохиргоо дутуу байна. Админтай холбогдоно уу.', 500);
      }

      const senderInvoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const expiresAt = new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000);

      // ── Call QPay V2 to create invoice ──
      const qpayInvoice = await qpay.createInvoice({
        senderInvoiceNo,
        invoiceReceiverCode: appointment.patient.phone,
        description: `Үзлэгийн цаг баталгаажуулалт - ${appointment.doctor.name}`,
        amount: BOOKING_FEE,
      });

      // ── Save payment record ──
      const payment = await prisma.payment.create({
        data: {
          appointmentId,
          amount: BOOKING_FEE,
          type: 'BOOKING_FEE',
          status: 'PENDING',
          method: 'QPAY',
          qrCode: qpayInvoice.qr_text,
          qrUrl: qpayInvoice.qPay_shortUrl,
          invoiceId: qpayInvoice.invoice_id, // QPay's own invoice_id
          expiresAt,
          metadata: {
            sender_invoice_no: senderInvoiceNo,
            qr_image: qpayInvoice.qr_image,
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
          qrCode: payment.qrCode,           // qr_text
          qrImage: qpayInvoice.qr_image,    // Base64 QR image
          qrUrl: payment.qrUrl,             // qPay_shortUrl
          invoiceId: payment.invoiceId,      // QPay invoice_id
          expiresAt: payment.expiresAt,
          urls: qpayInvoice.urls,            // Bank deep links
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// GET /api/payments/check/:paymentId - Frontend polling endpoint
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

    // ── (a) Already EXPIRED in DB → return immediately ──
    if (payment.status === 'EXPIRED') {
      return res.json({
        success: true,
        data: {
          paymentId: payment.id,
          appointmentId: payment.appointmentId,
          amount: payment.amount,
          status: 'EXPIRED',
          expiresAt: payment.expiresAt,
          message: 'QR кодны хугацаа дууссан. Шинээр үүсгэнэ үү.',
          appointment: payment.appointment,
        },
      });
    }

    // ── (b) Already COMPLETED → return immediately ──
    if (payment.status === 'COMPLETED') {
      return res.json({
        success: true,
        data: {
          paymentId: payment.id,
          appointmentId: payment.appointmentId,
          amount: payment.amount,
          status: 'COMPLETED',
          paidAt: payment.paidAt,
          appointment: payment.appointment,
        },
      });
    }

    // ── Check if QR time-expired → mark EXPIRED ──
    if (payment.status === 'PENDING' && payment.expiresAt && payment.expiresAt < new Date()) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'EXPIRED' },
      });

      return res.json({
        success: true,
        data: {
          paymentId: payment.id,
          appointmentId: payment.appointmentId,
          amount: payment.amount,
          status: 'EXPIRED',
          expiresAt: payment.expiresAt,
          message: 'QR кодны хугацаа дууссан. Шинээр үүсгэнэ үү.',
          appointment: payment.appointment,
        },
      });
    }

    // ── (c) PENDING + invoiceId → check QPay for real-time status ──
    if (payment.status === 'PENDING' && payment.invoiceId && qpay.isConfigured()) {
      try {
        const qpayStatus = await qpay.checkPayment(payment.invoiceId);

        // (d) QPay says PAID → update to COMPLETED + appointment PAID
        if (qpayStatus.count > 0 && qpayStatus.paid_amount >= payment.amount) {
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
              data: { status: 'CONFIRMED' },
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
        console.error('QPay check failed during polling, returning DB status:', error);
        // Fall through to return current DB status
      }
    }

    // ── (e) Return current DB status ──
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
//
// FLOW:
//  a) QPay calls: callback_url?invoice_id=<sender_invoice_no>
//  b) Extract invoice_id from query or body
//  c) Find payment in DB by metadata.sender_invoice_no or invoiceId
//  d) Call qpay.checkPayment(payment.invoiceId) to VERIFY (security!)
//  e) If paid_amount >= amount → COMPLETED + appointment PAID
//  f) ALWAYS return 200 OK to QPay (prevent retries)
//  g) On error, still return 200 + log internally
// ==========================================
router.post('/callback', async (req: Request, res: Response) => {
  try {
    // (a)(b) QPay sends callback with query param ?invoice_id=<sender_invoice_no>
    const invoiceIdFromQuery = req.query.invoice_id as string;
    const invoiceIdFromBody = req.body?.invoiceId || req.body?.invoice_id;
    const transactionId = req.body?.transactionId;

    const lookupId = invoiceIdFromQuery || invoiceIdFromBody;

    if (!lookupId) {
      console.warn('⚠️ QPay callback received without invoice_id:', req.body, req.query);
      return res.status(200).json({ success: true });
    }

    console.log('📥 QPay callback received:', { lookupId, body: JSON.stringify(req.body) });

    // (c) Find payment in DB
    let payment: any = null;

    // 1. Search by sender_invoice_no in metadata (our callback URL uses this)
    const paymentsByMeta = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        metadata: {
          path: ['sender_invoice_no'],
          equals: lookupId,
        },
      },
      include: { appointment: true },
      take: 1,
    });
    payment = paymentsByMeta[0] || null;

    // 2. Try QPay invoice_id (direct match on invoiceId column)
    if (!payment) {
      payment = await prisma.payment.findUnique({
        where: { invoiceId: lookupId },
        include: { appointment: true },
      });
    }

    // 3. Try body invoiceId if different
    if (!payment && invoiceIdFromBody && invoiceIdFromBody !== lookupId) {
      payment = await prisma.payment.findUnique({
        where: { invoiceId: invoiceIdFromBody },
        include: { appointment: true },
      });
    }

    if (!payment) {
      console.warn('⚠️ Payment not found for callback:', lookupId);
      return res.status(200).json({ success: true });
    }

    if (payment.status !== 'PENDING') {
      console.log('ℹ️ Payment already processed:', payment.id, payment.status);
      return res.status(200).json({ success: true, message: 'Already processed' });
    }

    // (d) VERIFY with QPay — MUST call checkPayment() after callback (security)
    if (payment.invoiceId && qpay.isConfigured()) {
      try {
        const qpayCheck = await qpay.checkPayment(payment.invoiceId);

        // (e) paid_amount >= amount → COMPLETED
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
                  callback_body: req.body,
                  qpay_check: qpayCheck,
                },
              },
            }),
            prisma.appointment.update({
              where: { id: payment.appointmentId },
              data: { status: 'CONFIRMED' },
            }),
          ]);

          console.log('✅ Payment confirmed via callback:', payment.id);
          return res.status(200).json({ success: true, message: 'Payment confirmed' });
        } else {
          console.log('ℹ️ QPay check returned insufficient payment:', {
            count: qpayCheck.count,
            paid_amount: qpayCheck.paid_amount,
            required: payment.amount,
          });
        }
      } catch (error) {
        console.error('❌ QPay checkPayment in callback failed:', error);
        // Still return 200 — don't let QPay retry
      }
    }

    // (f) Always 200
    return res.status(200).json({ success: true });
  } catch (error) {
    // (g) Error → log internally, still return 200 to QPay
    console.error('❌ Callback error:', error);
    return res.status(200).json({ success: true });
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
          data: { status: 'CONFIRMED' },
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
