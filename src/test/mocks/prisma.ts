import { vi } from "vitest";

export const prismaMock = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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
