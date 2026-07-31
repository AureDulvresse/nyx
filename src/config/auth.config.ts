import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyCredentials } from '@/lib/auth/credentials'
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email
        const password = credentials?.password
        if (typeof email !== 'string' || typeof password !== 'string') return null

        const valid = await verifyCredentials(email, password)
        if (!valid) return null

        return { id: email, email }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.email) token.email = user.email
      return token
    },
    session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email as string
      return session
    },
  },
}
