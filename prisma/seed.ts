import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Dashato database seed...');

  // Clean existing tables
  await prisma.review.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.vendorCommission.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productAttributeValue.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // 1. Password hash
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Create Core Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@dashato.com',
      password: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  // Vendor 1: TechPro Electronics
  const vendor1User = await prisma.user.create({
    data: {
      name: 'Alexander Vance',
      email: 'vendor@techpro.com',
      password: defaultPasswordHash,
      role: 'VENDOR',
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
  });

  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendor1User.id,
      businessName: 'TechPro Official Store',
      legalName: 'TechPro Electronics LLC',
      taxId: 'US-99482104',
      commissionRate: 0.08,
      isApproved: true,
      status: 'APPROVED',
      store: {
        create: {
          name: 'TechPro Official Direct',
          slug: 'techpro-official',
          logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
          banner: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80',
          description: 'Authorized retailer for flagship electronics, gaming rigs, and high-performance computing components.',
          supportEmail: 'support@techpro.com',
          supportPhone: '+1 (800) 555-0199',
          rating: 4.9,
          city: 'San Jose',
          country: 'United States',
        },
      },
    },
    include: { store: true },
  });

  // Vendor 2: Apex Gear & Audio
  const vendor2User = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'vendor@apexgear.com',
      password: defaultPasswordHash,
      role: 'VENDOR',
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendor2User.id,
      businessName: 'Apex Audio & Gear Co.',
      legalName: 'Apex International Corp',
      taxId: 'US-88319401',
      commissionRate: 0.10,
      isApproved: true,
      status: 'APPROVED',
      store: {
        create: {
          name: 'Apex Sound Labs',
          slug: 'apex-sound-labs',
          logo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=200&q=80',
          banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
          description: 'Audiophile grade sound gear, noise-canceling headsets, and studio monitors.',
          supportEmail: 'contact@apexgear.com',
          supportPhone: '+1 (800) 555-0288',
          rating: 4.8,
          city: 'Austin',
          country: 'United States',
        },
      },
    },
    include: { store: true },
  });

  // Vendor 3: Nordic Living
  const vendor3User = await prisma.user.create({
    data: {
      name: 'Lars Lindqvist',
      email: 'vendor@nordicliving.com',
      password: defaultPasswordHash,
      role: 'VENDOR',
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendor3User.id,
      businessName: 'Nordic Living Studio',
      legalName: 'Nordic Furniture Ltd',
      commissionRate: 0.12,
      isApproved: true,
      status: 'APPROVED',
      store: {
        create: {
          name: 'Nordic Living Modern',
          slug: 'nordic-living',
          logo: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=200&q=80',
          banner: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
          description: 'Minimalist Scandinavian home decor, ergonomic office desks, and smart lighting solutions.',
          supportEmail: 'hello@nordicliving.com',
          rating: 4.7,
          city: 'Stockholm',
          country: 'Sweden',
        },
      },
    },
    include: { store: true },
  });

  // Customer 1: Sarah Jenkins
  const customer1 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      password: defaultPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      customerProfile: {
        create: {
          phoneNumber: '+1 (555) 234-5678',
        },
      },
      addresses: {
        create: [
          {
            title: 'Home Address',
            fullName: 'Sarah Jenkins',
            phoneNumber: '+1 (555) 234-5678',
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62704',
            country: 'US',
            isDefault: true,
            addressType: 'SHIPPING',
          },
          {
            title: 'Office',
            fullName: 'Sarah Jenkins',
            phoneNumber: '+1 (555) 234-5678',
            street: '100 Innovation Way, Suite 400',
            city: 'Chicago',
            state: 'IL',
            postalCode: '60601',
            country: 'US',
            isDefault: false,
            addressType: 'BILLING',
          },
        ],
      },
    },
    include: { addresses: true },
  });

  // 3. Categories Hierarchy
  const electronicsCat = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Computers, smartphones, audio, and personal devices.',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const laptopsCat = await prisma.category.create({
    data: {
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'High-performance laptops, Ultrabooks, and workstations.',
      parentId: electronicsCat.id,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const audioCat = await prisma.category.create({
    data: {
      name: 'Audio & Headphones',
      slug: 'audio-headphones',
      description: 'Noise-canceling headphones, wireless earbuds, and speakers.',
      parentId: electronicsCat.id,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      isFeatured: true,
      sortOrder: 2,
    },
  });

  const smartHomeCat = await prisma.category.create({
    data: {
      name: 'Smart Home & Wearables',
      slug: 'smart-home-wearables',
      description: 'Smart watches, IoT home automation, and cameras.',
      parentId: electronicsCat.id,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
      isFeatured: true,
      sortOrder: 3,
    },
  });

  const homeCat = await prisma.category.create({
    data: {
      name: 'Home & Office',
      slug: 'home-office',
      description: 'Ergonomic furniture, ambient lighting, and workspace setup.',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
      isFeatured: true,
      sortOrder: 2,
    },
  });

  // 4. Brands
  const appleBrand = await prisma.brand.create({
    data: {
      name: 'Apple',
      slug: 'apple',
      logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
      description: 'Innovator of iPhone, MacBook Pro, iPad, and AirPods.',
      isFeatured: true,
    },
  });

  const sonyBrand = await prisma.brand.create({
    data: {
      name: 'Sony',
      slug: 'sony',
      logo: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80',
      description: 'Industry standard for audio fidelity, cameras, and gaming.',
      isFeatured: true,
    },
  });

  const dellBrand = await prisma.brand.create({
    data: {
      name: 'Dell Technologies',
      slug: 'dell',
      logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=200&q=80',
      description: 'XPS series laptops and UltraSharp monitors.',
      isFeatured: true,
    },
  });

  const boseBrand = await prisma.brand.create({
    data: {
      name: 'Bose',
      slug: 'bose',
      logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80',
      description: 'World-renowned acoustic science and active noise cancellation.',
      isFeatured: true,
    },
  });

  // 5. Products & Variants
  // Product 1: MacBook Pro 16-inch M3 Max
  const macbook = await prisma.product.create({
    data: {
      title: 'Apple MacBook Pro 16" (M3 Max Chip, 36GB Unified Memory, 1TB SSD) - Space Black',
      slug: 'apple-macbook-pro-16-m3-max',
      description: 'The 16-inch MacBook Pro with M3 Max pushes performance limits with up to a 16-core CPU and 40-core GPU, stunning Liquid Retina XDR display, up to 22 hours of battery life, and high-speed thunderbolt ports.',
      shortDesc: 'Liquid Retina XDR, M3 Max chip with 16-core CPU and 40-core GPU, 36GB RAM, 1TB SSD.',
      sku: 'APL-MBP16-M3X-1TB',
      price: 3499.00,
      compareAtPrice: 3899.00,
      brandId: appleBrand.id,
      vendorId: vendor1.id,
      status: 'ACTIVE',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      avgRating: 4.9,
      reviewCount: 42,
      specifications: JSON.stringify({
        'Processor': 'Apple M3 Max (16-core CPU)',
        'Display': '16.2-inch Liquid Retina XDR (3456 x 2234)',
        'Memory': '36GB Unified RAM',
        'Storage': '1TB NVMe SuperFast SSD',
        'Battery Life': 'Up to 22 Hours video playback',
        'Weight': '4.7 lbs (2.14 kg)',
      }),
      categories: {
        create: [{ categoryId: laptopsCat.id }, { categoryId: electronicsCat.id }],
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80', isMain: true, sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80', isMain: false, sortOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=80', isMain: false, sortOrder: 2 },
        ],
      },
      inventory: {
        create: {
          quantity: 25,
          lowStockThreshold: 5,
        },
      },
    },
  });

  // Product 1 Variants
  await prisma.productVariant.createMany({
    data: [
      {
        productId: macbook.id,
        sku: 'APL-MBP16-M3X-1TB-BLK',
        title: '36GB RAM / 1TB SSD / Space Black',
        price: 3499.00,
        options: JSON.stringify({ Color: 'Space Black', Storage: '1TB' }),
      },
      {
        productId: macbook.id,
        sku: 'APL-MBP16-M3X-2TB-SLV',
        title: '48GB RAM / 2TB SSD / Silver',
        price: 4299.00,
        compareAtPrice: 4599.00,
        options: JSON.stringify({ Color: 'Silver', Storage: '2TB' }),
      },
    ],
  });

  // Product 2: Sony WH-1000XM5 Noise-Canceling Headphones
  const sonyHeadphones = await prisma.product.create({
    data: {
      title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
      slug: 'sony-wh-1000xm5-wireless-headphones',
      description: 'The WH-1000XM5 headphones rewrite the rules for distraction-free listening. 8 microphones and 2 processors deliver unparalleled active noise cancellation and crystal-clear call quality.',
      shortDesc: 'Auto NC Optimizer, 30-hr battery life, Speak-to-Chat, ultra-comfortable soft fit leather.',
      sku: 'SNY-WH1000XM5-BLK',
      price: 398.00,
      compareAtPrice: 449.99,
      brandId: sonyBrand.id,
      vendorId: vendor2.id,
      status: 'ACTIVE',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      avgRating: 4.8,
      reviewCount: 128,
      specifications: JSON.stringify({
        'Battery Life': '30 Hours (NC On), 40 Hours (NC Off)',
        'Drivers': '30mm precision engineered driver unit',
        'Connectivity': 'Bluetooth 5.2, Multipoint connection',
        'Weight': '250 grams',
      }),
      categories: {
        create: [{ categoryId: audioCat.id }, { categoryId: electronicsCat.id }],
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', isMain: true, sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80', isMain: false, sortOrder: 1 },
        ],
      },
      inventory: {
        create: {
          quantity: 60,
          lowStockThreshold: 10,
        },
      },
    },
  });

  // Product 3: Dell XPS 15 OLED Laptop
  const dellXps = await prisma.product.create({
    data: {
      title: 'Dell XPS 15 9530 15.6" 3.5K OLED Touch Laptop (Intel Core i9-13900H, RTX 4070)',
      slug: 'dell-xps-15-oled-touch-laptop',
      description: 'Supercharge your creative workflow with the Dell XPS 15 featuring an immersive 3.5K OLED InfinityEdge touch screen, 13th Gen Intel Core i9 processor, and NVIDIA GeForce RTX 4070 graphics.',
      shortDesc: '15.6" 3.5K OLED Touch screen, Core i9 13th Gen, 32GB DDR5, 1TB NVMe, RTX 4070.',
      sku: 'DEL-XPS15-OLED-i9',
      price: 2499.00,
      compareAtPrice: 2799.00,
      brandId: dellBrand.id,
      vendorId: vendor1.id,
      status: 'ACTIVE',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      avgRating: 4.7,
      reviewCount: 19,
      specifications: JSON.stringify({
        'Display': '15.6" 3.5K OLED (3456 x 2160) Touch',
        'GPU': 'NVIDIA GeForce RTX 4070 8GB GDDR6',
        'RAM': '32GB DDR5 4800MHz',
        'Storage': '1TB PCIe Gen4 SSD',
      }),
      categories: {
        create: [{ categoryId: laptopsCat.id }, { categoryId: electronicsCat.id }],
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80', isMain: true, sortOrder: 0 },
        ],
      },
      inventory: {
        create: {
          quantity: 15,
          lowStockThreshold: 3,
        },
      },
    },
  });

  // Product 4: Nordic Ergonomic Bamboo Standing Desk
  const standingDesk = await prisma.product.create({
    data: {
      title: 'Nordic Ergonomic Dual-Motor Electric Standing Desk (Solid Bamboo Top 60" x 30")',
      slug: 'nordic-ergonomic-bamboo-standing-desk',
      description: 'Transform your home workspace with high-grade sustainable solid bamboo desktop paired with heavy-duty steel dual-motor lifting mechanism supporting up to 300 lbs.',
      shortDesc: '60x30 inch solid bamboo desktop, quad preset digital memory controller, cable management channel.',
      sku: 'NOR-DESK-6030-BMB',
      price: 649.00,
      compareAtPrice: 799.00,
      vendorId: vendor3.id,
      status: 'ACTIVE',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      avgRating: 4.9,
      reviewCount: 56,
      specifications: JSON.stringify({
        'Desktop Material': '100% Solid Natural Bamboo',
        'Height Adjustment': '24.5" to 50.0" Height Range',
        'Weight Capacity': '300 lbs (136 kg)',
        'Warranty': '10-Year Frame & Motor Warranty',
      }),
      categories: {
        create: [{ categoryId: homeCat.id }],
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80', isMain: true, sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80', isMain: false, sortOrder: 1 },
        ],
      },
      inventory: {
        create: {
          quantity: 40,
          lowStockThreshold: 8,
        },
      },
    },
  });

  // Product 5: Bose QuietComfort Ultra Wireless Earbuds
  const boseEarbuds = await prisma.product.create({
    data: {
      title: 'Bose QuietComfort Ultra Wireless Noise Cancelling Earbuds with Immersive Audio',
      slug: 'bose-quietcomfort-ultra-earbuds',
      description: 'Bose QuietComfort Ultra Earbuds take spatial audio to new heights with breakthrough Bose Immersive Audio technology and custom-tailored sound profile via CustomTune technology.',
      shortDesc: 'Breakthrough spatial audio, CustomTune acoustic calibration, 6 hour battery life + 18 hrs in wireless charging case.',
      sku: 'BSE-QCULT-EAR-BLK',
      price: 299.00,
      compareAtPrice: 329.00,
      brandId: boseBrand.id,
      vendorId: vendor2.id,
      status: 'ACTIVE',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      avgRating: 4.6,
      reviewCount: 38,
      specifications: JSON.stringify({
        'Audio Modes': 'Quiet Mode, Aware Mode, Immersion Mode',
        'IPX Rating': 'IPX4 Water & Sweat Resistant',
        'Charging': 'USB-C & Wireless Charging Case',
      }),
      categories: {
        create: [{ categoryId: audioCat.id }, { categoryId: electronicsCat.id }],
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80', isMain: true, sortOrder: 0 },
        ],
      },
      inventory: {
        create: {
          quantity: 85,
          lowStockThreshold: 15,
        },
      },
    },
  });

  // 6. Seed Coupons
  const coupon1 = await prisma.coupon.create({
    data: {
      code: 'DASHATO10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minSpend: 100,
      maxDiscount: 150,
      isActive: true,
    },
  });

  const coupon2 = await prisma.coupon.create({
    data: {
      code: 'FREESHIP50',
      discountType: 'FREE_SHIPPING',
      discountValue: 0,
      minSpend: 50,
      isActive: true,
    },
  });

  // 7. Seed Reviews
  await prisma.review.create({
    data: {
      productId: macbook.id,
      userId: customer1.id,
      rating: 5,
      title: 'Mindblowing performance for professional video rendering!',
      comment: 'Upgraded from an M1 Pro and the M3 Max is an absolute monster. Renders 4K ProRes timeline instantly without fan noise. Worth every penny!',
      status: 'APPROVED',
      vendorReply: 'Thank you Sarah! We are thrilled to hear your MacBook Pro M3 Max is exceeding your expectations. - TechPro Team',
    },
  });

  await prisma.review.create({
    data: {
      productId: sonyHeadphones.id,
      userId: customer1.id,
      rating: 5,
      title: 'Best ANC headphones on long haul flights',
      comment: 'Wore these on a 14 hour flight to Tokyo. The noise cancellation completely muted cabin rumble and engine drone. Super lightweight too.',
      status: 'APPROVED',
    },
  });

  // 8. Sample Orders & Sales History
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'DSH-2026-881920',
      userId: customer1.id,
      status: 'DELIVERED',
      subtotal: 3897.00,
      shippingFee: 0,
      taxFee: 311.76,
      discountTotal: 100.00,
      grandTotal: 4108.76,
      shippingAddressId: customer1.addresses[0].id,
      billingAddressId: customer1.addresses[0].id,
      couponCode: 'DASHATO10',
      items: {
        create: [
          {
            productId: macbook.id,
            vendorId: vendor1.id,
            unitPrice: 3499.00,
            quantity: 1,
            totalPrice: 3499.00,
            fulfillmentStatus: 'DELIVERED',
          },
          {
            productId: sonyHeadphones.id,
            vendorId: vendor2.id,
            unitPrice: 398.00,
            quantity: 1,
            totalPrice: 398.00,
            fulfillmentStatus: 'DELIVERED',
          },
        ],
      },
      payments: {
        create: {
          provider: 'STRIPE',
          transactionId: 'ch_3M0000000000000000000001',
          amount: 4108.76,
          status: 'COMPLETED',
          paymentMethod: 'CARD',
        },
      },
      shipments: {
        create: {
          carrier: 'FedEx Express',
          trackingNumber: 'FX-789201948190',
          status: 'DELIVERED',
          shippedAt: new Date(Date.now() - 5 * 86400000),
          deliveredAt: new Date(Date.now() - 2 * 86400000),
        },
      },
      commissions: {
        create: [
          {
            vendorId: vendor1.id,
            grossAmount: 3499.00,
            feeAmount: 279.92, // 8%
            netAmount: 3219.08,
            status: 'PAID',
          },
          {
            vendorId: vendor2.id,
            grossAmount: 398.00,
            feeAmount: 39.80, // 10%
            netAmount: 358.20,
            status: 'PAID',
          },
        ],
      },
    },
  });

  console.log('✅ Dashato database seed finished successfully!');
  console.log('--------------------------------------------------');
  console.log('🔐 Accounts created:');
  console.log('👑 Admin: admin@dashato.com | password123');
  console.log('🏪 Vendor 1: vendor@techpro.com | password123');
  console.log('🏪 Vendor 2: vendor@apexgear.com | password123');
  console.log('🏪 Vendor 3: vendor@nordicliving.com | password123');
  console.log('🛒 Customer: sarah@example.com | password123');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
