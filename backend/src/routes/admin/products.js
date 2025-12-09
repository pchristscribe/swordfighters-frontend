import { adminAuth } from '../../middleware/adminAuth.js';

export default async function adminProductRoutes(fastify, options) {
  const { prisma, redis } = fastify;

  // Apply auth middleware to all routes
  fastify.addHook('onRequest', adminAuth);

  // Get all products (admin view with more details)
  fastify.get('/', async (request, reply) => {
    const {
      platform,
      categoryId,
      status,
      page = 1,
      limit = 50,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = request.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (platform) where.platform = platform;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { externalId: { contains: search } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          category: true,
          affiliateLinks: true,
          _count: {
            select: { reviews: true }
          }
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  });

  // Get single product by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        affiliateLinks: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      reply.code(404);
      return { error: 'Product not found' };
    }

    return product;
  });

  // Create new product
  fastify.post('/', async (request, reply) => {
    try {
      const product = await prisma.product.create({
        data: request.body,
        include: {
          category: true,
        },
      });

      // Invalidate cache
      await redis.del('products:list:*');

      reply.code(201);
      return product;
    } catch (error) {
      if (error.code === 'P2002') {
        reply.code(409);
        return {
          error: 'Conflict',
          message: 'Product with this platform and external ID already exists'
        };
      }
      throw error;
    }
  });

  // Update product
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const product = await prisma.product.update({
        where: { id },
        data: request.body,
        include: {
          category: true,
          affiliateLinks: true,
        },
      });

      // Invalidate cache
      await redis.del(`product:${id}`);
      await redis.del('products:list:*');

      return product;
    } catch (error) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Product not found' };
      }
      throw error;
    }
  });

  // Delete product
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await prisma.product.delete({
        where: { id },
      });

      // Invalidate cache
      await redis.del(`product:${id}`);
      await redis.del('products:list:*');

      reply.code(204);
      return;
    } catch (error) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Product not found' };
      }
      throw error;
    }
  });

  // Bulk update status
  fastify.post('/bulk/status', async (request, reply) => {
    const { productIds, status } = request.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      reply.code(400);
      return { error: 'productIds array is required' };
    }

    if (!['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'].includes(status)) {
      reply.code(400);
      return { error: 'Invalid status value' };
    }

    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: { status }
    });

    // Invalidate cache
    await redis.del('products:list:*');
    for (const id of productIds) {
      await redis.del(`product:${id}`);
    }

    return {
      success: true,
      updated: result.count
    };
  });

  // Bulk delete
  fastify.post('/bulk/delete', async (request, reply) => {
    const { productIds } = request.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      reply.code(400);
      return { error: 'productIds array is required' };
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: { in: productIds }
      }
    });

    // Invalidate cache
    await redis.del('products:list:*');
    for (const id of productIds) {
      await redis.del(`product:${id}`);
    }

    return {
      success: true,
      deleted: result.count
    };
  });

  // Get dashboard stats
  fastify.get('/stats/dashboard', async (request, reply) => {
    const [
      totalProducts,
      activeProducts,
      outOfStock,
      totalCategories,
      totalReviews,
      recentProducts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'OUT_OF_STOCK' } }),
      prisma.category.count(),
      prisma.review.count(),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: { select: { reviews: true } }
        }
      })
    ]);

    return {
      stats: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        outOfStock,
        totalCategories,
        totalReviews
      },
      recentProducts
    };
  });
}
