import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createUser } from '../src/app/api/users/route';
import { DELETE as deleteUser, PATCH as updateUser } from '../src/app/api/users/[id]/route';
import { PATCH as updateVendor } from '../src/app/api/vendors/[id]/route';
import * as auth from '../src/lib/auth';
import { db } from '../src/lib/db';

vi.mock('../src/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('../src/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    vendor: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../src/lib/notifications', () => ({
  NotificationService: {
    send: vi.fn(),
  },
}));

describe('User Management & Vendor Commission Fee API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Management: POST /api/users', () => {
    it('should deny non-admin users from creating users', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'user-1',
        name: 'Regular Buyer',
        email: 'buyer@dashato.com',
        role: 'CUSTOMER',
      } as any);

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Guy',
          email: 'new@dashato.com',
          password: 'password123',
          role: 'CUSTOMER',
        }),
      });

      const response = await createUser(request);
      expect(response.status).toBe(403);
    });

    it('should prevent creating a user with an already registered email', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@dashato.com',
        role: 'ADMIN',
      } as any);

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: 'existing-id',
        email: 'alreadytaken@dashato.com',
      } as any);

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate User',
          email: 'alreadytaken@dashato.com',
          password: 'password123',
        }),
      });

      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('déjà enregistré');
    });

    it('should successfully create a new user when admin requests', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@dashato.com',
        role: 'ADMIN',
      } as any);

      vi.mocked(db.user.findUnique).mockResolvedValue(null);
      vi.mocked(db.user.create).mockResolvedValue({
        id: 'new-user-1',
        name: 'Pierre Dupont',
        email: 'pierre@dashato.com',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: new Date(),
      } as any);

      const request = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Pierre Dupont',
          email: 'pierre@dashato.com',
          password: 'securePassword123',
          role: 'CUSTOMER',
          status: 'ACTIVE',
        }),
      });

      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Pierre Dupont');
    });
  });

  describe('User Management: DELETE /api/users/[id]', () => {
    it('should prevent an admin from deleting their own account', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-self',
        name: 'Admin Master',
        email: 'master@dashato.com',
        role: 'ADMIN',
      } as any);

      const request = new Request('http://localhost:3000/api/users/admin-self', {
        method: 'DELETE',
      });

      const response = await deleteUser(request, { params: Promise.resolve({ id: 'admin-self' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('propre compte administrateur');
    });

    it('should successfully delete another user account when called by admin', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-1',
        name: 'Admin Master',
        email: 'master@dashato.com',
        role: 'ADMIN',
      } as any);

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: 'target-user',
        name: 'Bad Actor',
        email: 'spammer@example.com',
      } as any);

      vi.mocked(db.user.delete).mockResolvedValue({ id: 'target-user' } as any);

      const request = new Request('http://localhost:3000/api/users/target-user', {
        method: 'DELETE',
      });

      const response = await deleteUser(request, { params: Promise.resolve({ id: 'target-user' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.user.delete).toHaveBeenCalledWith({ where: { id: 'target-user' } });
    });
  });

  describe('Vendors Commission Fee: PATCH /api/vendors/[id]', () => {
    it('should normalize percentage input (15 -> 0.15) for commission rate', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-1',
        name: 'Admin Master',
        role: 'ADMIN',
      } as any);

      vi.mocked(db.vendor.findUnique).mockResolvedValue({
        id: 'vendor-123',
        userId: 'vendor-user-1',
        status: 'APPROVED',
        commissionRate: 0.10,
      } as any);

      vi.mocked(db.vendor.update).mockResolvedValue({
        id: 'vendor-123',
        commissionRate: 0.15,
        status: 'APPROVED',
      } as any);

      const request = new Request('http://localhost:3000/api/vendors/vendor-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate: 15, // Passed as 15%
        }),
      });

      const response = await updateVendor(request, { params: Promise.resolve({ id: 'vendor-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.commissionRate).toBe(0.15);
      expect(db.vendor.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ commissionRate: 0.15 }),
        })
      );
    });

    it('should keep decimal input (0.12 -> 0.12) as valid commission rate', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-1',
        role: 'ADMIN',
      } as any);

      vi.mocked(db.vendor.findUnique).mockResolvedValue({
        id: 'vendor-456',
        userId: 'vendor-user-2',
        status: 'APPROVED',
        commissionRate: 0.10,
      } as any);

      vi.mocked(db.vendor.update).mockResolvedValue({
        id: 'vendor-456',
        commissionRate: 0.12,
        status: 'APPROVED',
      } as any);

      const request = new Request('http://localhost:3000/api/vendors/vendor-456', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate: 0.12,
        }),
      });

      const response = await updateVendor(request, { params: Promise.resolve({ id: 'vendor-456' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.commissionRate).toBe(0.12);
    });
  });
});
