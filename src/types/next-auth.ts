import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string | number;
      name: string;
      email: string;
      roles?: string[];
      permissions?: string[];
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User extends DefaultUser {
    id: string | number;
    name: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string | number;
    accessToken?: string;
    roles?: string[];
    permissions?: string[];
  }
}
