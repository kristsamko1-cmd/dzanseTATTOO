import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'
import type { AuthUser } from '../types/domain'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUpTattooer: (input: {
    email: string
    password: string
    name: string
    bio: string
    specialties: string[]
  }) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const next = await authService.getCurrentAuthUser()
    setUser(next)
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const next = await authService.getCurrentAuthUser()
        if (active) setUser(next)
      } finally {
        if (active) setLoading(false)
      }
    })()
    const stop = authService.onAuthStateChanged(() => {
      void refresh()
    })
    return () => {
      active = false
      stop()
    }
  }, [refresh])

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    const next = await authService.signIn(email, password)
    setUser(next)
  }, [])

  const signUpTattooer = useCallback<AuthContextValue['signUpTattooer']>(async (input) => {
    const next = await authService.signUpTattooer(input)
    setUser(next)
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signUpTattooer, signOut, refresh }),
    [user, loading, signIn, signUpTattooer, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
