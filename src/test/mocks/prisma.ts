import { vi } from "vitest";

export const prismaMock = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  userBan: {
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    findFirst: vi.fn().mockResolvedValue(null),
  },
  userMute: {
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    findFirst: vi.fn().mockResolvedValue(null),
  },
  role: {
    findUnique: vi.fn(),
  },
  userXP: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  xpTransaction: {
    findUnique: vi.fn(),
    create: vi.fn(),
    groupBy: vi.fn(),
  },
  $transaction: vi.fn(),
};
