import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // TODO: Add your own authentication logic here
        // This is a placeholder that should be replaced with actual authentication
        if (email === "demo@example.com" && password === "demo123") {
          return {
            id: "1",
            email: "demo@example.com",
            name: "Demo User",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token, user }) {
      return session;
    },
    async jwt({ token, user }) {
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};