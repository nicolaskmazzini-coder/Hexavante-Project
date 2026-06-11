import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "@/test/mocks/prisma";
import { awardXp, getUserXpProfile, getRanking } from "../xp.service";

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/services/notification.service", () => ({
  createNotification: vi.fn().mockResolvedValue({}),
}));

describe("xp.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("awardXp", () => {
    it("deve conceder XP com sucesso", async () => {
      const userId = "user-1";
      const amount = 10;
      const source = "LESSON" as const;
      const sourceId = "lesson-1";

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback({
          xpTransaction: {
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({}),
          },
          userXP: {
            findUnique: vi.fn().mockResolvedValue({
              level: 1,
              currentXp: 0,
              totalXp: 0,
            }),
            create: vi.fn(),
            update: vi.fn().mockResolvedValue({
              level: 1,
              currentXp: 10,
              totalXp: 10,
            }),
          },
        });
      });

      const result = await awardXp(userId, amount, source, sourceId, "Test");

      expect(result).toEqual({
        amount: 10,
        description: "Test",
        leveledUp: false,
        newLevel: undefined,
      });
    });

    it("deve retornar null se XP já foi concedido", async () => {
      const userId = "user-1";
      const amount = 10;
      const source = "LESSON" as const;
      const sourceId = "lesson-1";

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback({
          xpTransaction: {
            findUnique: vi.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await awardXp(userId, amount, source, sourceId);

      expect(result).toBeNull();
    });
  });

  describe("getUserXpProfile", () => {
    it("deve retornar perfil de XP do usuário", async () => {
      const userId = "user-1";

      prismaMock.userXP.findUnique.mockResolvedValue({
        level: 5,
        currentXp: 50,
        totalXp: 450,
      });

      const result = await getUserXpProfile(userId);

      expect(result).toEqual({
        level: 5,
        currentXp: 50,
        totalXp: 450,
        xpToNextLevel: 500,
        progressPercent: 10,
      });
    });

    it("deve retornar null se usuário não tem XP", async () => {
      const userId = "user-1";

      prismaMock.userXP.findUnique.mockResolvedValue(null);

      const result = await getUserXpProfile(userId);

      expect(result).toBeNull();
    });
  });

  describe("getRanking", () => {
    it("deve retornar ranking de usuários", async () => {
      prismaMock.userXP.findMany.mockResolvedValue([
        {
          id: "xp-1",
          userId: "user-1",
          level: 10,
          totalXp: 1000,
          user: {
            id: "user-1",
            username: "user1",
            fullName: "User One",
          },
        },
        {
          id: "xp-2",
          userId: "user-2",
          level: 5,
          totalXp: 500,
          user: {
            id: "user-2",
            username: "user2",
            fullName: "User Two",
          },
        },
      ]);

      const result = await getRanking(10);

      expect(result).toHaveLength(2);
      expect(result[0].user.username).toBe("user1");
      expect(result[0].periodXp).toBe(1000);
    });
  });
});
