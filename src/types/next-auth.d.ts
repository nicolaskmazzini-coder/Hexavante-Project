import "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
    roles?: string[];
  }

  interface Session {
    user: {
      id: string;
      username: string;
      roles: string[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    roles?: string[];
  }
}
