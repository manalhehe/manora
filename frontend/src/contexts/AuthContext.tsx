import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authService from '../services/auth.service'
import { AuthApiError } from '../services/auth.service'
import type { UserProfile } from '../types/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSessionError = useCallback((requestError: unknown) => {
      setUser(null)
      if (requestError instanceof AuthApiError && requestError.status === 401) {
        setStatus('unauthenticated')
        return
      }
      setStatus('error')
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not verify your session. Please try again.',
      )
  }, [])

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await authService.getCurrentUser()
      setUser(response.user)
      setStatus('authenticated')
    } catch (requestError) {
      handleSessionError(requestError)
    }
  }, [handleSessionError])

  useEffect(() => {
    let active = true
    void authService.getCurrentUser().then(
      (response) => {
        if (!active) return
        setUser(response.user)
        setStatus('authenticated')
      },
      (requestError: unknown) => {
        if (active) handleSessionError(requestError)
      },
    )
    return () => {
      active = false
    }
  }, [handleSessionError])

  const signIn = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const response = await authService.login(email, password, rememberMe)
      setUser(response.user)
      setStatus('authenticated')
      setError(null)
    },
    [],
  )

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const response = await authService.register(fullName, email, password)
      setUser(response.user)
      setStatus('authenticated')
      setError(null)
    },
    [],
  )

  const signOut = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setStatus('unauthenticated')
    setError(null)
  }, [])

  const value = useMemo(
    () => ({ status, user, error, refresh, signIn, signUp, signOut }),
    [status, user, error, refresh, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
