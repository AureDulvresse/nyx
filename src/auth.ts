import NextAuth from 'next-auth'
import { authConfig } from './config/auth.config'


export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  adapter: {},
  ...authConfig,
})
