# Dashato - Production-Ready Multi-Vendor Ecommerce Platform

Dashato is a world-class, enterprise-grade multi-vendor ecommerce platform inspired by Amazon, Alibaba, and Best Buy. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **NextAuth**, **Zustand**, and **Stripe Payment Provider Architecture**, it delivers a customer storefront with multi-vendor split ordering and an executive administration dashboard.

---

## 🌟 Key Features

### Customer Storefront
- **Dynamic Homepage**: Announcement bar, animated promo hero, flash deals countdown timer, trending products, top departments, verified vendor showcase, newsletter subscription, and trust badges.
- **Real-Time Autocomplete Search**: Debounced search suggestions with price badges (`/api/search/autocomplete`).
- **Product Discovery & Filtering**: URL search param sync (`q`, `category`, `brand`, `minPrice`, `maxPrice`, `rating`, `vendor`, `sort`, `page`).
- **Product Details Page (PDP)**: Interactive multi-image gallery with zoom, variant selector (Colors, RAM, Storage), stock status, vendor card, customer reviews distribution, specifications, and related recommendations.
- **Multi-Vendor Cart**: Items grouped by vendor store, quantity management, save for later, coupon engine (`DASHATO10` for 10% OFF), tax and shipping calculations.
- **Multi-Step Checkout**: Address selection/creation, shipping method selection, extensible Stripe card payment simulation, atomic server-side inventory deduction, and instant order creation.

### Customer Account Dashboard
- **Overview & Stat Cards**: Lifetime order counts, saved wishlist items, security status.
- **My Orders & Shipment Tracking**: Full order history, item breakdown, carrier tracking number display.
- **Wishlist & Saved Items**: Persistent wishlist with quick move-to-cart.

### Executive Administration Dashboard (`/admin`)
- **Dashboard Overview**: Revenue KPI cards, interactive Recharts financial growth timelines, category market share pie chart, recent order stream.
- **Product Directory**: Multi-status workflow (`ACTIVE`, `DRAFT`, `PENDING_APPROVAL`, `ARCHIVED`), SKU tracking, inventory status pills.
- **Category Hierarchy**: Multi-tier nested category tree with SEO metadata.
- **Vendor Marketplace Control**: Seller store applications approval queue, customizable commission fee configurator (`VendorCommission`), sales volume metrics.
- **Order Management**: Comprehensive order table, fulfillment tracking update, refund processing.
- **Inventory Logs**: Low-stock alerts and movement logs (`RESTOCK`, `SALE`, `ADJUSTMENT`).
- **User Management**: Role-based access control (`CUSTOMER`, `VENDOR`, `ADMIN`) and account status toggles (`ACTIVE`, `SUSPENDED`).
- **Promotions Engine**: Percentage, fixed amount, and free shipping coupon management.
- **Review Moderation**: Review approval and vendor response tracking.

### Vendor Seller Center (`/vendor`)
- Store dashboard, sales volume metrics, net vendor earnings calculation after commission deduction, store product management, and order fulfillment queue.

---

## 🔐 Pre-configured Demo Accounts

All demo accounts use password: **`password123`**

| Role | Email | Capabilities |
|---|---|---|
| **System Admin** | `admin@dashato.com` | Full Platform Admin Dashboard (`/admin`) |
| **TechPro Vendor** | `vendor@techpro.com` | TechPro Store Seller Center (`/vendor`) |
| **Apex Audio Vendor** | `vendor@apexgear.com` | Apex Audio Seller Center (`/vendor`) |
| **Nordic Living Vendor** | `vendor@nordicliving.com` | Nordic Living Seller Center (`/vendor`) |
| **Customer** | `sarah@example.com` | Customer Account Dashboard (`/account`) |

---

## 🚀 Getting Started Locally

### 1. Installation
```bash
# Install dependencies
npm install
```

### 2. Database Sync & Seeding
```bash
# Sync Prisma schema with SQLite / Postgres
npx prisma db push

# Seed rich multi-vendor products, vendors, users, and sales history
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

### 4. Run Unit Tests
```bash
npx vitest run
```

---

## 🐳 Docker Deployment

To launch PostgreSQL and the Next.js app via Docker Compose:
```bash
docker-compose up --build -d
```

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js (App Router), React Server Components
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & shadcn-inspired components
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **State Management**: Zustand (Cart, Wishlist, Compare, UI) & TanStack Query
- **Authentication**: NextAuth (JWT, Credentials, Role-based authorization)
- **Payment Architecture**: Extensible `IPaymentProvider` with Stripe implementation
- **Testing**: Vitest
