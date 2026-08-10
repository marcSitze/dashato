import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDesc: z.string().optional(),
  sku: z.string().min(3, 'SKU is required'),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  brandId: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  vendorId: z.string().optional(), // Inferred from user session if vendor
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(true),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isMain: z.boolean().default(false),
  })).min(1, 'At least one product image is required'),
  quantity: z.number().int().nonnegative().default(10),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  specifications: z.record(z.string(), z.string()).optional(),
  variants: z.array(z.object({
    sku: z.string(),
    title: z.string(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional().nullable(),
    options: z.record(z.string(), z.string()),
    image: z.string().optional(),
  })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name required'),
  slug: z.string().min(2, 'Category slug required'),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const brandSchema = z.object({
  name: z.string().min(2, 'Brand name required'),
  slug: z.string().min(2, 'Brand slug required'),
  logo: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code required').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  discountValue: z.number().nonnegative(),
  minSpend: z.number().optional().nullable(),
  maxDiscount: z.number().optional().nullable(),
  usageLimit: z.number().int().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, 'Comment must be at least 5 characters'),
});
