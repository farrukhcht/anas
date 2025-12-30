import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    phoneNumber: string;
    role: "SUPER_ADMIN" | "USER";
    permissions: {
      name: string;
      module: string;
      action: string;
      isGranted: boolean;
    }[];
  }

  interface Session {
    user: User & {
      role: "SUPER_ADMIN" | "USER";
      permissions: {
        name: string;
        module: string;
        action: string;
        isGranted: boolean;
      }[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "SUPER_ADMIN" | "USER";
    permissions?: {
      name: string;
      module: string;
      action: string;
      isGranted: boolean;
    }[];
  }
} 