import "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
    roles?: string[];
    avatarUrl?: string | null;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      roles: string[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isBanned?: boolean;
      banReason?: string;
      isMuted?: boolean;
      isImpersonating?: boolean;
      impersonatorUsername?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    roles?: string[];
    isBanned?: boolean;
    banReason?: string;
    isMuted?: boolean;
    isImpersonating?: boolean;
    impersonatorId?: string;
    impersonatorUsername?: string;
    impersonatorRoles?: string[];
  }
}
