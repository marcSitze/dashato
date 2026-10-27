import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '../src/app/api/orders/[id]/route';
import * as auth from '../src/lib/auth';
import { db } from '../src/lib/db';

vi.mock('../src/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('../src/lib/db', () => ({
  db: {
    order: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    shipment: {
      create: vi.fn(),
    },
    orderItem: {
      updateMany: vi.fn(),
    },
    vendor: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../src/lib/notifications', () => ({
  NotificationService: {
    send: vi.fn(),
  },
}));

describe('Order Details Screen & API Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders/[id]', () => {
    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue(null as any);

      const request = new Request('http://localhost:3000/api/orders/order-123');
      const response = await GET(request, { params: Promise.resolve({ id: 'order-123' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 if order does not exist', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'CUSTOMER',
      } as any);

      vi.mocked(db.order.findFirst).mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/orders/non-existent');
      const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Order not found');
    });

    it('should return 403 if a customer attempts to view another user’s order', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'customer-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'CUSTOMER',
      } as any);

      vi.mocked(db.order.findFirst).mockResolvedValue({
        id: 'order-999',
        orderNumber: 'ORD-999',
        userId: 'customer-2', // Different user!
        status: 'PAID',
      } as any);

      const request = new Request('http://localhost:3000/api/orders/order-999');
      const response = await GET(request, { params: Promise.resolve({ id: 'order-999' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should successfully return order details when customer views their own order', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'customer-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'CUSTOMER',
      } as any);

      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD-1001',
        userId: 'customer-1',
        status: 'SHIPPED',
        grandTotal: 150.0,
        items: [
          {
            id: 'item-1',
            quantity: 2,
            unitPrice: 75.0,
            totalPrice: 150.0,
            product: { title: 'Headphones Pro' },
          },
        ],
        shippingAddress: {
          fullName: 'Alice Test',
          city: 'Paris',
          country: 'FR',
        },
        shipments: [
          { carrier: 'DHL', trackingNumber: 'DHL-12345', status: 'SHIPPED' },
        ],
      };

      vi.mocked(db.order.findFirst).mockResolvedValue(mockOrder as any);

      const request = new Request('http://localhost:3000/api/orders/order-1');
      const response = await GET(request, { params: Promise.resolve({ id: 'order-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.orderNumber).toBe('ORD-1001');
      expect(data.data.items).toHaveLength(1);
      expect(data.data.shipments[0].trackingNumber).toBe('DHL-12345');
    });

    it('should allow ADMIN to view any order details', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-1',
        name: 'Super Admin',
        email: 'admin@dashato.com',
        role: 'ADMIN',
      } as any);

      const mockOrder = {
        id: 'order-customer-2',
        orderNumber: 'ORD-2002',
        userId: 'customer-2',
        status: 'PROCESSING',
      };

      vi.mocked(db.order.findFirst).mockResolvedValue(mockOrder as any);

      const request = new Request('http://localhost:3000/api/orders/order-customer-2');
      const response = await GET(request, { params: Promise.resolve({ id: 'order-customer-2' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.orderNumber).toBe('ORD-2002');
    });
  });

  describe('Minimal Order Information Calculations', () => {
    it('should compute total item count correctly from order items', () => {
      const items = [
        { quantity: 2, unitPrice: 20 },
        { quantity: 3, unitPrice: 50 },
        { quantity: 1, unitPrice: 100 },
      ];

      const totalCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
      expect(totalCount).toBe(6);
    });

    it('should handle order without shipment and provide fallback status', () => {
      const order = {
        id: 'ord-1',
        orderNumber: 'ORD-001',
        status: 'PENDING',
        shipments: [] as Array<{ trackingNumber?: string }>,
      };

      const shipment = order.shipments?.[0];
      const trackingNumber = shipment?.trackingNumber || 'En préparation';

      expect(trackingNumber).toBe('En préparation');
    });

    it('should handle address formatting with optional apartment', () => {
      const addressWithApt = {
        fullName: 'Jane Doe',
        street: '123 Main St',
        apartment: '4B',
        city: 'New York',
        country: 'US',
      };

      const formattedApt = `${addressWithApt.street}${addressWithApt.apartment ? `, Apt ${addressWithApt.apartment}` : ''}`;
      expect(formattedApt).toBe('123 Main St, Apt 4B');

      const addressNoApt = {
        fullName: 'John Doe',
        street: '456 Oak Rd',
        apartment: null,
        city: 'Lyon',
        country: 'FR',
      };

      const formattedNoApt = `${addressNoApt.street}${addressNoApt.apartment ? `, Apt ${addressNoApt.apartment}` : ''}`;
      expect(formattedNoApt).toBe('456 Oak Rd');
    });
  });
});
