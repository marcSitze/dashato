import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/app/api/brands/route';
import { PUT, DELETE } from '../src/app/api/brands/[id]/route';
import * as auth from '../src/lib/auth';
import { db } from '../src/lib/db';

vi.mock('../src/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('../src/lib/db', () => ({
  db: {
    brand: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('Brand RBAC & Permissions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/brands (Create Brand)', () => {
    it('should deny brand creation when unauthenticated', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue(null as any);

      const request = new Request('http://localhost:3000/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sony', slug: 'sony' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Vendor or Admin access required');
      expect(db.brand.create).not.toHaveBeenCalled();
    });

    it('should deny brand creation for CUSTOMER role', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'cust-1',
        name: 'John Buyer',
        email: 'john@example.com',
        role: 'CUSTOMER',
      } as any);

      const request = new Request('http://localhost:3000/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sony', slug: 'sony' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Vendor or Admin access required');
      expect(db.brand.create).not.toHaveBeenCalled();
    });

    it('should allow brand creation for VENDOR role', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'vendor-1',
        name: 'AudioTech Store',
        email: 'audiotech@example.com',
        role: 'VENDOR',
      } as any);

      const mockCreatedBrand = {
        id: 'brand-1',
        name: 'Audio-Technica',
        slug: 'audio-technica',
        logo: 'https://example.com/logo.png',
        website: 'https://audio-technica.com',
        description: 'Japanese audio equipment manufacturer',
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.brand.create).mockResolvedValue(mockCreatedBrand as any);

      const request = new Request('http://localhost:3000/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Audio-Technica',
          slug: 'audio-technica',
          logo: 'https://example.com/logo.png',
          website: 'https://audio-technica.com',
          description: 'Japanese audio equipment manufacturer',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Audio-Technica');
      expect(db.brand.create).toHaveBeenCalledWith({
        data: {
          name: 'Audio-Technica',
          slug: 'audio-technica',
          logo: 'https://example.com/logo.png',
          description: 'Japanese audio equipment manufacturer',
          website: 'https://audio-technica.com',
          isFeatured: false,
        },
      });
    });

    it('should allow brand creation for ADMIN role', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-1',
        name: 'Platform Admin',
        email: 'admin@dashato.com',
        role: 'ADMIN',
      } as any);

      const mockCreatedBrand = {
        id: 'brand-2',
        name: 'Apple',
        slug: 'apple',
        logo: null,
        website: null,
        description: null,
        isFeatured: true,
      };

      vi.mocked(db.brand.create).mockResolvedValue(mockCreatedBrand as any);

      const request = new Request('http://localhost:3000/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Apple',
          slug: 'apple',
          isFeatured: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Apple');
      expect(db.brand.create).toHaveBeenCalled();
    });

    it('should return 400 when validation fails', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'vendor-1',
        role: 'VENDOR',
      } as any);

      const request = new Request('http://localhost:3000/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'A', // too short (< 2 chars)
          slug: '',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/brands/[id] (Update Brand)', () => {
    it('should allow VENDOR to update a brand', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'vendor-1',
        role: 'VENDOR',
      } as any);

      vi.mocked(db.brand.update).mockResolvedValue({
        id: 'brand-1',
        name: 'Sony Updated',
        slug: 'sony-updated',
      } as any);

      const request = new Request('http://localhost:3000/api/brands/brand-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Sony Updated', slug: 'sony-updated' }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'brand-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.brand.update).toHaveBeenCalled();
    });

    it('should reject CUSTOMER attempting to update brand', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'cust-1',
        role: 'CUSTOMER',
      } as any);

      const request = new Request('http://localhost:3000/api/brands/brand-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hacked' }),
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'brand-1' }),
      });
      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/brands/[id] (Delete Brand)', () => {
    it('should keep brand deletion restricted to ADMIN only (reject VENDOR)', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'vendor-1',
        role: 'VENDOR',
      } as any);

      const request = new Request('http://localhost:3000/api/brands/brand-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'brand-1' }),
      });
      expect(response.status).toBe(403);
      expect(db.brand.delete).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to delete a brand', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue({
        id: 'admin-1',
        role: 'ADMIN',
      } as any);

      vi.mocked(db.brand.delete).mockResolvedValue({ id: 'brand-1' } as any);

      const request = new Request('http://localhost:3000/api/brands/brand-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'brand-1' }),
      });
      expect(response.status).toBe(200);
      expect(db.brand.delete).toHaveBeenCalledWith({ where: { id: 'brand-1' } });
    });
  });
});
