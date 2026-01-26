import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Here we would typically sync with our backend (ordaro_api) to get a TransactionCustomer ID
        // session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Custom signin page if needed
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
