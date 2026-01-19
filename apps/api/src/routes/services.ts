// ==========================================
// SERVICES ROUTES
// ==========================================

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/services/categories - Get all service categories with services
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// GET /api/services - Get all services
router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId: categoryId as string }),
      },
      include: {
        category: true,
      },
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
    });

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// GET /api/services/:id - Get single service
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        doctors: {
          include: {
            doctor: {
              include: {
                schedules: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ message: 'Үйлчилгээ олдсонгүй' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Admin routes

// POST /api/services/categories - Create category (Admin)
router.post('/categories', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, icon, order } = req.body;

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description,
        icon,
        order: order || 0,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// PUT /api/services/categories/:id - Update category (Admin)
router.put('/categories/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, order, isActive } = req.body;

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name,
        description,
        icon,
        order,
        isActive,
      },
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// DELETE /api/services/categories/:id - Delete category (Admin)
router.delete('/categories/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.serviceCategory.delete({
      where: { id },
    });

    res.json({ message: 'Ангилал устгагдлаа' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// POST /api/services - Create service (Admin)
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, categoryId, duration, price, order } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        categoryId,
        duration: duration || 30,
        price,
        order: order || 0,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// PUT /api/services/:id - Update service (Admin)
router.put('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, duration, price, order, isActive } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        duration,
        price,
        order,
        isActive,
      },
      include: {
        category: true,
      },
    });

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// DELETE /api/services/:id - Delete service (Admin)
router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.service.delete({
      where: { id },
    });

    res.json({ message: 'Үйлчилгээ устгагдлаа' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

export default router;
