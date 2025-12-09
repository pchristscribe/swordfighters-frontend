import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const adminEmail = 'admin@swordfighters.com';
  const adminPassword = 'Admin123!'; // Change this immediately after first login!

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin User',
        role: 'admin',
        isActive: true
      }
    });

    console.log(`✅ Created admin user: ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
  }

  // Create sample categories
  const categories = [
    {
      name: 'Fashion & Accessories',
      slug: 'fashion-accessories',
      description: 'Stylish clothing, accessories, and fashion items',
      imageUrl: 'https://via.placeholder.com/400x300?text=Fashion'
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Home decor, furniture, and living essentials',
      imageUrl: 'https://via.placeholder.com/400x300?text=Home'
    },
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets, tech accessories, and electronics',
      imageUrl: 'https://via.placeholder.com/400x300?text=Electronics'
    },
    {
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Fitness, grooming, and wellness products',
      imageUrl: 'https://via.placeholder.com/400x300?text=Health'
    }
  ];

  for (const categoryData of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: categoryData.slug }
    });

    if (!existing) {
      await prisma.category.create({ data: categoryData });
      console.log(`✅ Created category: ${categoryData.name}`);
    }
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
