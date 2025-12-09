import { adminAuth } from '../../middleware/adminAuth.js';

export default async function adminCategoryRoutes(fastify, options) {
  const { prisma } = fastify;

  // Apply auth middleware to all routes
  fastify.addHook('onRequest', adminAuth);

  // Get all categories
  fastify.get('/', async (request, reply) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return { categories };
  });

  // Get single category
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      reply.code(404);
      return { error: 'Category not found' };
    }

    return category;
  });

  // Create category
  fastify.post('/', async (request, reply) => {
    try {
      const category = await prisma.category.create({
        data: request.body
      });

      reply.code(201);
      return category;
    } catch (error) {
      if (error.code === 'P2002') {
        reply.code(409);
        return {
          error: 'Conflict',
          message: 'Category with this name or slug already exists'
        };
      }
      throw error;
    }
  });

  // Update category
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const category = await prisma.category.update({
        where: { id },
        data: request.body
      });

      return category;
    } catch (error) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Category not found' };
      }
      if (error.code === 'P2002') {
        reply.code(409);
        return {
          error: 'Conflict',
          message: 'Category with this name or slug already exists'
        };
      }
      throw error;
    }
  });

  // Delete category
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      // Check if category has products
      const productsCount = await prisma.product.count({
        where: { categoryId: id }
      });

      if (productsCount > 0) {
        reply.code(409);
        return {
          error: 'Cannot Delete',
          message: `Category has ${productsCount} products. Please reassign or delete them first.`
        };
      }

      await prisma.category.delete({
        where: { id }
      });

      reply.code(204);
      return;
    } catch (error) {
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Category not found' };
      }
      throw error;
    }
  });
}
