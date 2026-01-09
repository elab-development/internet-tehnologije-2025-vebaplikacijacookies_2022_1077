// prisma/seed.ts

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ==========================================
  // 1. BRISANJE POSTOJEĆIH PODATAKA
  // ==========================================
  console.log('🗑  Cleaning existing data...');
  
  await prisma.analyticsEvent.deleteMany();
  await prisma.viewHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.cookieConsent.deleteMany();
  await prisma.session.deleteMany();
  await prisma.address.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ==========================================
  // 2. KREIRANJE KORISNIKA
  // ==========================================
  console.log('👤 Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cookiecommerce.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      preferences: {
        create: {
          theme: 'dark',
          language: 'sr',
          currency: 'RSD',
          productsPerPage: 20,
        },
      },
      cookieConsent: {
        create: {
          essential: true,
          functional: true,
          analytics: true,
          marketing: true,
          ipAddress: '127.0.0.1',
        },
      },
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash: hashedPassword,
      firstName: 'Marko',
      lastName: 'Marković',
      role: UserRole.CUSTOMER,
      preferences: {
        create: {
          theme: 'light',
          language: 'sr',
          currency: 'RSD',
        },
      },
      addresses: {
        create: [
          {
            type: 'shipping',
            street: 'Bulevar kralja Aleksandra 73',
            city: 'Beograd',
            postalCode: '11000',
            country: 'Srbija',
            isDefault: true,
          },
        ],
      },
      cookieConsent: {
        create: {
          essential: true,
          functional: true,
          analytics: false,
          marketing: false,
          ipAddress: '192.168.1.100',
        },
      },
    },
  });

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@cookiecommerce.com',
      passwordHash: hashedPassword,
      firstName: 'Ana',
      lastName: 'Anić',
      role: UserRole.MODERATOR,
      preferences: {
        create: {
          theme: 'light',
          language: 'sr',
          currency: 'RSD',
        },
      },
      cookieConsent: {
        create: {
          essential: true,
          functional: true,
          analytics: true,
          marketing: false,
        },
      },
    },
  });

  console.log(`✅ Created ${3} users`);

  // ==========================================
  // 3. KREIRANJE KATEGORIJA
  // ==========================================
  console.log('📁 Creating categories...');

  const electronics = await prisma.category.create({
    data: {
      name: 'Elektronika',
      slug: 'elektronika',
      description: 'Laptopovi, telefoni, tableti i ostala elektronika',
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: 'Laptopovi',
      slug: 'laptopovi',
      description: 'Prenosni računari svih brendova',
      parentCategoryId: electronics.id,
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Odeća',
      slug: 'odeca',
      description: 'Muška i ženska odeća',
    },
  });

  console.log(`✅ Created ${3} categories`);

  // ==========================================
  // 4. KREIRANJE PROIZVODA
  // ==========================================
  console.log('📦 Creating products...');

  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Dell XPS 15',
        description: 'Profesionalni laptop sa 15.6" ekranom, Intel i7, 16GB RAM',
        price: 149999,
        currency: 'RSD',
        stock: 15,
        categoryId: laptops.id,
        imageUrl: '/images/dell-xps-15.jpg',
        isActive: true,
      },
      {
        name: 'MacBook Pro 14"',
        description: 'Apple MacBook Pro sa M3 čipom, 16GB RAM, 512GB SSD',
        price: 249999,
        currency: 'RSD',
        stock: 8,
        categoryId: laptops.id,
        imageUrl: '/images/macbook-pro.jpg',
        isActive: true,
      },
      {
        name: 'Lenovo ThinkPad X1',
        description: 'Poslovni laptop, Intel i7, 32GB RAM, 1TB SSD',
        price: 179999,
        currency: 'RSD',
        stock: 12,
        categoryId: laptops.id,
        imageUrl: '/images/thinkpad-x1.jpg',
        isActive: true,
      },
      {
        name: 'HP Pavilion 15',
        description: 'Laptop za svakodnevnu upotrebu, Intel i5, 8GB RAM',
        price: 79999,
        currency: 'RSD',
        stock: 25,
        categoryId: laptops.id,
        imageUrl: '/images/hp-pavilion.jpg',
        isActive: true,
      },
      {
        name: 'ASUS ROG Gaming',
        description: 'Gaming laptop, RTX 4060, Intel i7, 16GB RAM',
        price: 189999,
        currency: 'RSD',
        stock: 10,
        categoryId: laptops.id,
        imageUrl: '/images/asus-rog.jpg',
        isActive: true,
      },
      {
        name: 'Muška majica - Basic',
        description: 'Pamučna majica, dostupna u više boja',
        price: 1999,
        currency: 'RSD',
        stock: 100,
        categoryId: clothing.id,
        imageUrl: '/images/tshirt-basic.jpg',
        isActive: true,
      },
      {
        name: 'Ženske farmerke',
        description: 'Slim fit farmerke, visoki struk',
        price: 4999,
        currency: 'RSD',
        stock: 50,
        categoryId: clothing.id,
        imageUrl: '/images/jeans-women.jpg',
        isActive: true,
      },
      {
        name: 'Muška jakna',
        description: 'Vodootporna jakna za prolećnu sezonu',
        price: 8999,
        currency: 'RSD',
        stock: 30,
        categoryId: clothing.id,
        imageUrl: '/images/jacket-men.jpg',
        isActive: true,
      },
      {
        name: 'Sportske patike',
        description: 'Patike za trčanje, breathable materijal',
        price: 6999,
        currency: 'RSD',
        stock: 40,
        categoryId: clothing.id,
        imageUrl: '/images/sneakers.jpg',
        isActive: true,
      },
      {
        name: 'Zimska kapa',
        description: 'Topla vunena kapa',
        price: 1499,
        currency: 'RSD',
        stock: 80,
        categoryId: clothing.id,
        imageUrl: '/images/winter-hat.jpg',
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created ${10} products`);

  // ==========================================
  // 5. KREIRANJE KORPE ZA CUSTOMER-a
  // ==========================================
  console.log('🛒 Creating cart for customer...');

  const allProducts = await prisma.product.findMany({ take: 3 });

  const cart = await prisma.cart.create({
    data: {
      userId: customer.id,
      items: {
        create: [
          {
            productId: allProducts[0].id,
            quantity: 1,
            priceAtAdd: allProducts[0].price,
          },
          {
            productId: allProducts[1].id,
            quantity: 2,
            priceAtAdd: allProducts[1].price,
          },
        ],
      },
    },
  });

  console.log(`✅ Created cart with ${2} items`);

  // ==========================================
  // 6. KREIRANJE TEST NARUDŽBINE
  // ==========================================
  console.log('📋 Creating test order...');

  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      orderNumber: `ORD-${Date.now()}`,
      status: 'PAID',
      totalAmount: 299998,
      currency: 'RSD',
      shippingStreet: 'Bulevar kralja Aleksandra 73',
      shippingCity: 'Beograd',
      shippingPostalCode: '11000',
      shippingCountry: 'Srbija',
      items: {
        create: [
          {
            productId: allProducts[0].id,
            productName: allProducts[0].name,
            quantity: 2,
            priceAtOrder: allProducts[0].price,
          },
        ],
      },
      payment: {
        create: {
          transactionId: `TXN-${Date.now()}`,
          paymentMethod: 'credit_card',
          amount: 299998,
          currency: 'RSD',
          status: 'SUCCESS',
          providerResponse: JSON.stringify({ success: true }),
        },
      },
    },
  });

  console.log(`✅ Created order: ${order.orderNumber}`);

  // ==========================================
  // 7. KREIRANJE SESIJA
  // ==========================================
  console.log('🔐 Creating sessions...');

  const adminSession = await prisma.session.create({
    data: {
      userId: admin.id,
      token: `session_${admin.id}_${Date.now()}`,
      rememberToken: `remember_${admin.id}_${Date.now()}`,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dana
    },
  });

  const customerSession = await prisma.session.create({
    data: {
      userId: customer.id,
      token: `session_${customer.id}_${Date.now()}`,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 dan
    },
  });

  console.log(`✅ Created ${2} sessions`);

  // ==========================================
  // 8. KREIRANJE VIEW HISTORY
  // ==========================================
  console.log('👁  Creating view history...');

  await prisma.viewHistory.createMany({
    data: [
      {
        userId: customer.id,
        productId: allProducts[0].id,
        viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Pre 2h
      },
      {
        userId: customer.id,
        productId: allProducts[1].id,
        viewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Pre 1h
      },
      {
        userId: customer.id,
        productId: allProducts[2].id,
        viewedAt: new Date(),
      },
    ],
  });

  console.log(`✅ Created view history`);

  // ==========================================
  // 9. KREIRANJE ANALYTICS EVENTS
  // ==========================================
  console.log('📊 Creating analytics events...');

  await prisma.analyticsEvent.createMany({
    data: [
      {
        sessionId: customerSession.id,
        eventType: 'page_view',
        pageUrl: '/products',
        referrer: 'https://google.com',
        eventData: JSON.stringify({ category: 'navigation' }),
      },
      {
        sessionId: customerSession.id,
        eventType: 'product_click',
        pageUrl: `/products/${allProducts[0].id}`,
        eventData: JSON.stringify({ productId: allProducts[0].id }),
      },
      {
        sessionId: customerSession.id,
        eventType: 'add_to_cart',
        pageUrl: `/products/${allProducts[0].id}`,
        eventData: JSON.stringify({ 
          productId: allProducts[0].id, 
          quantity: 1 
        }),
      },
    ],
  });

  console.log(`✅ Created analytics events`);

  console.log('\n✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 3 (Admin, Customer, Moderator)`);
  console.log(`   - Categories: 3`);
  console.log(`   - Products: 10`);
  console.log(`   - Cart: 1 with 2 items`);
  console.log(`   - Orders: 1`);
  console.log(`   - Sessions: 2`);
  console.log(`   - View History: 3 entries`);
  console.log(`   - Analytics Events: 3`);
  console.log('\n🔑 Test credentials:');
  console.log(`   Admin: admin@cookiecommerce.com / password123`);
  console.log(`   Customer: customer@example.com / password123`);
  console.log(`   Moderator: moderator@cookiecommerce.com / password123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });