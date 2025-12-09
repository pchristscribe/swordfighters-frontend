import { adminAuth } from '../../middleware/adminAuth.js';

export default async function adminReviewRoutes(fastify, options) {
  const { prisma } = fastify;

  // Apply auth middleware to all routes
  fastify.addHook('onRequest', adminAuth);

  // Get all reviews
  fastify.get('/', async (request, reply) => {
    const {
      productId,
      isFeatured,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = request.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (productId) where.productId = productId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              imageUrl: true
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  // Get single review
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        product: true
      }
    });

    if (!review) {
      reply.code(404);
      return { error: 'Review not found' };
    }

    return review;
  });

  // Create review
  fastify.post('/', async (request, reply) => {
    try {
      const review = await prisma.review.create({
        data: request.body,
        include: {
          product: true
        }
      });

      reply.code(201);
      return review;
    } catch (error) {
      if (error.code === 'P2003') {
        reply.code(404);
        return { error: 'Product not found' };
      }
      throw error;
    }
  });

  // Update review
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const review = await prisma.review.update({
        where: { id },
        data: request.body,
        include: {
          product: true
        }
      });

      return review;
    } catch (error) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Review not found' };
      }
      throw error;
    }
  });

  // Delete review
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.review.delete({
        where: { id }
      });

      reply.code(204);
      return;
    } catch (error) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Review not found' };
      }
      throw error;
    }
  });

  // Toggle featured status
  fastify.post('/:id/toggle-featured', async (request, reply) => {
    const { id } = request.params;

    try {
      const review = await prisma.review.findUnique({
        where: { id },
        select: { isFeatured: true }
      });

      if (!review) {
        reply.code(404);
        return { error: 'Review not found' };
      }

      const updated = await prisma.review.update({
        where: { id },
        data: { isFeatured: !review.isFeatured },
        include: {
          product: true
        }
      });

      return updated;
    } catch (error) {
      throw error;
    }
  });
}
