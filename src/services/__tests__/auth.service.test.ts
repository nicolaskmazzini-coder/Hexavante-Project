import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, validateCredentials } from '../auth.service';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

vi.mock('@/lib/prisma');
vi.mock('bcryptjs');

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const mockData = {
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        birthDate: new Date('2000-01-01'),
      };

      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.role.findUnique).mockResolvedValue({ id: 'role-1', name: 'USER', description: 'User' } as any);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password');
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-1',
        username: mockData.username,
        fullName: mockData.fullName,
        email: mockData.email,
      } as any);

      const result = await registerUser(mockData);

      expect(result).toEqual({
        id: 'user-1',
        username: mockData.username,
        fullName: mockData.fullName,
        email: mockData.email,
      });
    });

    it('deve lançar erro se email já existe', async () => {
      const mockData = {
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        birthDate: new Date('2000-01-01'),
      };

      vi.mocked(prisma.user.findFirst).mockResolvedValue({ email: mockData.email } as any);

      await expect(registerUser(mockData)).rejects.toThrow('Este e-mail já está em uso.');
    });

    it('deve lançar erro se usuário tem menos de 13 anos', async () => {
      const mockData = {
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        birthDate: new Date('2020-01-01'),
      };

      await expect(registerUser(mockData)).rejects.toThrow('É necessário ter no mínimo 13 anos para se cadastrar.');
    });
  });

  describe('validateCredentials', () => {
    it('deve validar credenciais corretas', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-1',
        email: mockData.email,
        passwordHash: 'hashed-password',
        fullName: 'Test User',
        username: 'testuser',
        roles: [
          { role: { name: 'USER' } },
        ],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const result = await validateCredentials(mockData);

      expect(result).toEqual({
        id: 'user-1',
        name: 'Test User',
        email: mockData.email,
        username: 'testuser',
        roles: ['USER'],
      });
    });

    it('deve retornar null para credenciais inválidas', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const mockUser = {
        id: 'user-1',
        email: mockData.email,
        passwordHash: 'hashed-password',
        fullName: 'Test User',
        username: 'testuser',
        roles: [],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false);

      const result = await validateCredentials(mockData);

      expect(result).toBeNull();
    });
  });
});
