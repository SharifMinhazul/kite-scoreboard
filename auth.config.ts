import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Check against environment variables
        const validUsername = process.env.ADMIN_USERNAME || "admin";
        const validPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (
          credentials.username === validUsername &&
          credentials.password === validPassword
        ) {
          return {
            id: "1",
            name: "Admin",
            email: "admin@kite-games.com",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
