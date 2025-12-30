import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { logActivity } from '@/app/lib/activityLogger';

interface ExtendedCredentials {
  phoneNumber: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> {
        try {
          if (!credentials?.phoneNumber || !credentials?.password) {
            console.log('Missing credentials');
            throw new Error("Phone number and password are required");
          }

          console.log('Attempting login for:', credentials.phoneNumber);

          const user = await prisma.user.findUnique({
            where: {
              phoneNumber: credentials.phoneNumber
            },
            include: {
              permissions: true
            }
          });

          if (!user) {
            console.log('No user found with phone:', credentials.phoneNumber);
            throw new Error("Invalid phone number or password");
          }

          if (!user.password) {
            console.log('User has no password set:', user.id);
            throw new Error("Invalid phone number or password");
          }

          if (user.status !== 'ACTIVE') {
            console.log('User is not active:', user.id, user.status);
            throw new Error("Account is inactive");
          }

          const isPasswordValid = await compare(credentials.password, user.password);
          console.log('Password validation result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', user.id);
            throw new Error("Invalid phone number or password");
          }

          console.log('Login successful for user:', user.id);

          await logActivity({
            userId: user.id,
            action: 'LOGIN',
            details: 'User logged in successfully',
            ipAddress: (credentials as ExtendedCredentials).ipAddress,
            userAgent: (credentials as ExtendedCredentials).userAgent,
          });

          return {
            id: user.id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            role: user.role,
            permissions: (user.permissions as any[])
              .filter(up => typeof up.module === 'string' && typeof up.action === 'string')
              .map(up => ({
                module: up.module,
                action: up.action,
                isGranted: up.isGranted
              }))
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const tokenId = token.id as string | number;
        session.user.id = tokenId.toString();
        session.user.role = token.role as "SUPER_ADMIN" | "USER";
        session.user.permissions = token.permissions || [];
      }
      return session;
    }
  },
  events: {
    async signOut({ token }) {
      if (token.sub) {
        await logActivity({
          userId: parseInt(token.sub),
          action: 'LOGOUT',
          details: 'User logged out',
        });
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 