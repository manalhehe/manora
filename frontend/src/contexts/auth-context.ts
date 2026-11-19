import { createContext } from 'react'
import type { UserProfile } from '../types/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error'

export interface AuthContextValue {
  status: AuthStatus
  user: UserProfile | null
  error: string | null
  refresh: () => Promise<void>
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>
  signUp: (fullName: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
