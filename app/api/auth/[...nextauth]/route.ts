import NextAuth from "next-auth/next";
import { authOptions } from '../authOptions';

interface ExtendedCredentials {
  phoneNumber: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 