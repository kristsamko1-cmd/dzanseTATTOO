import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type AdminAuthContextValue = {
  isAdmin: boolean
  signIn: (username: string, password: string) => void
  signOut: () => void
  authHeader: string | null
}

const STORAGE_KEY = 'dzanes:admin'
const STORAGE_AUTH_KEY = 'dzanes:adminAuth'

function getEnvAdminCredentials() {
  const username = (import.meta.env.VITE_ADMIN_USERNAME as string | undefined) ?? 'admin'
  const password = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'admin'
  return { username, password }
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === '1'
  })
  const [authHeader, setAuthHeader] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_AUTH_KEY)
  })

  const signIn = useCallback((username: string, password: string) => {
    const env = getEnvAdminCredentials()
    if (username.trim() !== env.username || password !== env.password) {
      throw new Error('Nesprávne meno alebo heslo.')
    }
    const basic = btoa(`${env.username}:${env.password}`)
    const header = `Basic ${basic}`
    localStorage.setItem(STORAGE_KEY, '1')
    localStorage.setItem(STORAGE_AUTH_KEY, header)
    setIsAdmin(true)
    setAuthHeader(header)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_AUTH_KEY)
    setIsAdmin(false)
    setAuthHeader(null)
  }, [])

  const value = useMemo(
    () => ({ isAdmin, signIn, signOut, authHeader }),
    [isAdmin, signIn, signOut, authHeader],
  )
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}

